const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const PORT = Number(process.env.PORT || 3030);
const PUBLIC_DIR = path.join(__dirname, "public");
const CONFIG_PATH = path.join(__dirname, "data", "pastas.json");
const DB_PATH = path.join(__dirname, "data", "acervo-db.json");
const INDEX_PATH = path.join(__dirname, "data", "index.json");
const SONGS_DIR = path.join(__dirname, "data", "songs");
const IMPORT_SCRIPT = path.join(__dirname, "scripts", "importar-acervo.js");

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
  if (!fs.existsSync(DB_PATH)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function readSongRecord(id) {
  const safeId = String(id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeId) return null;
  const songPath = path.join(SONGS_DIR, `${safeId}.json`);
  if (!fs.existsSync(songPath)) return null;
  return JSON.parse(fs.readFileSync(songPath, "utf8"));
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
  const relativePath = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const fullPath = path.normalize(path.join(PUBLIC_DIR, relativePath));
  return fullPath.startsWith(PUBLIC_DIR) ? fullPath : null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.url === "/api/status") {
    if (!fs.existsSync(INDEX_PATH)) {
      return sendJson(res, 200, { ready: false, songs: 0, message: "index-not-found" });
    }

    try {
      const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
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
  console.log(`Acervo Musical MDL Monte Sião em http://localhost:${PORT}`);
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
