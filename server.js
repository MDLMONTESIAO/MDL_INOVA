const fs = require("fs");
const http = require("http");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const PORT = Number(process.env.PORT || 3030);
const PUBLIC_DIR = path.join(__dirname, "public");
const APP_DATA_DIR = path.join(__dirname, "data");
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : APP_DATA_DIR;
const CONFIG_PATH = path.join(APP_DATA_DIR, "pastas.json");
const DB_PATH = path.join(DATA_DIR, "acervo-db.json");
const FALLBACK_DB_PATH = path.join(APP_DATA_DIR, "acervo-db.json");
const INDEX_PATH = path.join(DATA_DIR, "index.json");
const FALLBACK_INDEX_PATH = path.join(APP_DATA_DIR, "index.json");
const SONGS_DIR = path.join(DATA_DIR, "songs");
const FALLBACK_SONGS_DIR = path.join(APP_DATA_DIR, "songs");
const IMPORT_SCRIPT = path.join(__dirname, "scripts", "importar-acervo.js");
const AUTH_PATH = path.join(DATA_DIR, "auth.json");
const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
const AUTH_USERS = {
  lider: { label: "Líder", role: "leader", defaultPassword: "1234" },
  musico: { label: "Músico", role: "musician", defaultPassword: "1234" }
};

let importRunning = false;
let importQueued = false;
let importTimer = null;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readCatalogDb() {
  const dbPath = fs.existsSync(DB_PATH) ? DB_PATH : FALLBACK_DB_PATH;
  if (!fs.existsSync(dbPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function readSongRecord(id) {
  const safeId = String(id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeId) return null;
  const primarySongPath = path.join(SONGS_DIR, `${safeId}.json`);
  const fallbackSongPath = path.join(FALLBACK_SONGS_DIR, `${safeId}.json`);
  const songPath = fs.existsSync(primarySongPath) ? primarySongPath : fallbackSongPath;
  if (!fs.existsSync(songPath)) return null;
  return JSON.parse(fs.readFileSync(songPath, "utf8"));
}

function ensureAuthStore() {
  fs.mkdirSync(path.dirname(AUTH_PATH), { recursive: true });
  if (fs.existsSync(AUTH_PATH)) {
    const store = JSON.parse(fs.readFileSync(AUTH_PATH, "utf8"));
    let changed = false;
    store.users = store.users || {};
    for (const [id, config] of Object.entries(AUTH_USERS)) {
      if (!store.users[id]) {
        store.users[id] = createPasswordRecord(config.defaultPassword, config);
        changed = true;
      }
    }
    if (!store.secret) {
      store.secret = crypto.randomBytes(32).toString("hex");
      changed = true;
    }
    if (changed) writeAuthStore(store);
    return store;
  }

  const store = {
    secret: crypto.randomBytes(32).toString("hex"),
    users: Object.fromEntries(
      Object.entries(AUTH_USERS).map(([id, config]) => [id, createPasswordRecord(config.defaultPassword, config)])
    )
  };
  writeAuthStore(store);
  return store;
}

function writeAuthStore(store) {
  fs.writeFileSync(AUTH_PATH, JSON.stringify(store, null, 2), "utf8");
}

function createPasswordRecord(password, config) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 120000;
  return {
    label: config.label,
    role: config.role,
    salt,
    iterations,
    passwordHash: hashPassword(password, salt, iterations),
    updatedAt: new Date().toISOString()
  };
}

function hashPassword(password, salt, iterations) {
  return crypto.pbkdf2Sync(String(password || ""), salt, iterations, 32, "sha256").toString("hex");
}

function verifyPassword(password, user) {
  if (!user?.passwordHash || !user?.salt || !user?.iterations) return false;
  const hash = hashPassword(password, user.salt, user.iterations);
  return safeEqual(hash, user.passwordHash);
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "hex");
  const rightBuffer = Buffer.from(String(right || ""), "hex");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function publicUser(id, user) {
  return {
    id,
    label: user.label,
    role: user.role
  };
}

function signToken(userId, user, secret) {
  const payload = {
    sub: userId,
    role: user.role,
    label: user.label,
    exp: Date.now() + TOKEN_MAX_AGE_MS
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifyToken(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const store = ensureAuthStore();
  const expected = crypto.createHmac("sha256", store.secret).update(encodedPayload).digest("base64url");
  if (!safeTokenEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    const user = store.users?.[payload.sub];
    if (!user || payload.exp < Date.now()) return null;
    return { userId: payload.sub, user, store };
  } catch {
    return null;
  }
}

function safeTokenEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function base64UrlEncode(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function parseJsonBody(req, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBytes) {
        reject(new Error("request-too-large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function safeStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const publicPath = decoded.replace(/^\/+/, "");
  if (/^data(?:\/.*)?\/auth\.json$/i.test(publicPath)) return null;
  const relativePath = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const fullPath = path.normalize(path.join(PUBLIC_DIR, relativePath));
  return fullPath.startsWith(PUBLIC_DIR) ? fullPath : null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/auth/session" && req.method === "GET") {
    const session = verifyToken(req);
    if (!session) return sendJson(res, 401, { ok: false, error: "unauthorized" });
    return sendJson(res, 200, { ok: true, user: publicUser(session.userId, session.user) });
  }

  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    try {
      const body = await parseJsonBody(req);
      const userId = normalizeUserId(body.userId);
      const store = ensureAuthStore();
      const user = store.users?.[userId];
      if (!user || !verifyPassword(body.password, user)) {
        return sendJson(res, 401, { ok: false, error: "invalid-login" });
      }

      return sendJson(res, 200, {
        ok: true,
        user: publicUser(userId, user),
        token: signToken(userId, user, store.secret)
      });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: error.message });
    }
  }

  if (url.pathname === "/api/auth/change-password" && req.method === "POST") {
    const session = verifyToken(req);
    if (!session) return sendJson(res, 401, { ok: false, error: "unauthorized" });

    try {
      const body = await parseJsonBody(req);
      const newPassword = String(body.newPassword || "");
      if (newPassword.length < 4) {
        return sendJson(res, 400, { ok: false, error: "password-too-short" });
      }
      if (!verifyPassword(body.currentPassword, session.user)) {
        return sendJson(res, 403, { ok: false, error: "invalid-current-password" });
      }

      session.store.users[session.userId] = createPasswordRecord(newPassword, AUTH_USERS[session.userId] || session.user);
      writeAuthStore(session.store);
      return sendJson(res, 200, { ok: true, user: publicUser(session.userId, session.store.users[session.userId]) });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: error.message });
    }
  }

  if (req.url === "/api/status") {
    const statusPath = fs.existsSync(INDEX_PATH) ? INDEX_PATH : FALLBACK_INDEX_PATH;
    if (!fs.existsSync(statusPath)) {
      return sendJson(res, 200, { ready: false, songs: 0, message: "index-not-found" });
    }

    try {
      const index = JSON.parse(fs.readFileSync(statusPath, "utf8"));
      return sendJson(res, 200, {
        ready: true,
        songs: Array.isArray(index.songs) ? index.songs.length : 0,
        generatedAt: index.generatedAt || null
      });
    } catch (error) {
      return sendJson(res, 500, { ready: false, error: error.message });
    }
  }

  if (req.url === "/api/import" && req.method === "POST") {
    scheduleImport("painel-admin");
    return sendJson(res, 202, { ok: true, message: "import-scheduled" });
  }

  if (url.pathname === "/api/catalog" && req.method === "GET") {
    try {
      const db = readCatalogDb();
      if (!db) return sendJson(res, 200, { ready: false, songs: [], artists: [] });

      const query = normalizeText(url.searchParams.get("q") || "");
      const limit = Math.max(1, Math.min(5000, Number(url.searchParams.get("limit") || 5000)));
      const songs = query
        ? db.songs.filter((song) => normalizeText(`${song.title} ${song.artist} ${song.collection || ""}`).includes(query)).slice(0, limit)
        : db.songs.slice(0, limit);

      return sendJson(res, 200, {
        ready: true,
        name: db.name,
        generatedAt: db.generatedAt,
        totalSongs: db.totalSongs,
        totalArtists: db.totalArtists,
        artists: db.artists || [],
        songs
      });
    } catch (error) {
      return sendJson(res, 500, { ready: false, error: error.message });
    }
  }

  if (url.pathname.startsWith("/api/songs/") && req.method === "GET") {
    try {
      const id = decodeURIComponent(url.pathname.replace("/api/songs/", ""));
      const song = readSongRecord(id);
      if (!song) return sendJson(res, 404, { error: "song-not-found" });
      return sendJson(res, 200, song);
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  if (url.pathname === "/api/offline-bundle" && req.method === "POST") {
    try {
      const body = await parseJsonBody(req);
      const ids = Array.isArray(body.ids) ? body.ids.slice(0, 80) : [];
      const songs = ids.map(readSongRecord).filter(Boolean);
      return sendJson(res, 200, {
        generatedAt: new Date().toISOString(),
        count: songs.length,
        songs
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }
  }

  const filePath = safeStaticPath(req.url || "/");
  if (!filePath) {
    res.writeHead(403);
    return res.end("Acesso negado");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (path.extname(filePath)) {
        res.writeHead(404);
        return res.end("Arquivo nao encontrado");
      }

      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallbackData) => {
        if (fallbackError) {
          res.writeHead(500);
          return res.end("Aplicativo indisponivel");
        }
        res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
        res.end(fallbackData);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=300"
    });
    res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Acervo Musical MDL Inova em http://localhost:${PORT}`);
  scheduleImport("inicio");
  watchCatalogFolders();
});

function scheduleImport(reason) {
  clearTimeout(importTimer);
  importTimer = setTimeout(() => runImport(reason), 900);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeUserId(value) {
  const normalized = normalizeText(value).replace(/[^a-z0-9_-]/g, "");
  return normalized === "musico" ? "musico" : normalized === "lider" ? "lider" : "";
}

function runImport(reason) {
  if (importRunning) {
    importQueued = true;
    return;
  }

  importRunning = true;
  const child = spawn(process.execPath, [IMPORT_SCRIPT], {
    cwd: __dirname,
    stdio: "inherit"
  });

  child.on("exit", (code) => {
    importRunning = false;
    console.log(code === 0
      ? `Acervo atualizado (${reason}).`
      : `Falha ao atualizar acervo (${reason}). Codigo: ${code}`);

    if (importQueued) {
      importQueued = false;
      scheduleImport("alteracoes-acumuladas");
    }
  });
}

function watchCatalogFolders() {
  let sources = [];
  try {
    sources = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch (error) {
    console.warn(`Nao foi possivel ler ${CONFIG_PATH}: ${error.message}`);
    return;
  }

  for (const source of sources) {
    const folder = path.isAbsolute(source.path) ? source.path : path.join(__dirname, source.path);
    if (!fs.existsSync(folder)) {
      console.warn(`Pasta monitorada nao existe: ${folder}`);
      continue;
    }

    try {
      fs.watch(folder, { recursive: true }, () => scheduleImport("mudanca-no-acervo"));
      console.log(`Monitorando acervo: ${folder}`);
    } catch (error) {
      console.warn(`Nao foi possivel monitorar ${folder}: ${error.message}`);
    }
  }
}
