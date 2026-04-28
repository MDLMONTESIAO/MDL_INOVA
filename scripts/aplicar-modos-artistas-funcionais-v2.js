const fs = require("fs");
const path = require("path");

const root = process.cwd();
const publicDir = path.join(root, "public");
const indexPath = path.join(publicDir, "index.html");
const cssPath = path.join(publicDir, "artist-view-modes.css");
const jsPath = path.join(publicDir, "artist-view-modes.js");

if (!fs.existsSync(indexPath)) {
  console.error("Não encontrei public/index.html. Rode este comando na raiz do projeto.");
  process.exit(1);
}

const css = `
/* MDL - modos de visualização bonitos e funcionais para tablet/PC */
.mdl-view-mode-toolbar {
  display: none;
}

@media (min-width: 768px) {
  .section-head .mdl-view-mode-toolbar,
  .mdl-view-mode-toolbar {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .08);
    border: 1px solid rgba(255, 255, 255, .12);
    box-shadow: 0 10px 24px rgba(0, 0, 0, .18);
    margin-left: auto;
  }

  :root[data-theme="light"] .mdl-view-mode-toolbar {
    background: rgba(255, 250, 242, .96);
    border-color: var(--line);
  }

  .mdl-view-mode-button {
    min-height: 38px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 13px;
    background: transparent;
    color: var(--muted);
    font-size: 12px;
    line-height: 1;
    font-weight: 950;
    white-space: nowrap;
    transition: transform .16s ease, background .16s ease, color .16s ease, box-shadow .16s ease;
  }

  .mdl-view-mode-button svg {
    width: 17px;
    height: 17px;
  }

  .mdl-view-mode-button:hover {
    transform: translateY(-1px);
    background: rgba(199, 154, 59, .16);
    color: var(--gold-2);
  }

  :root[data-theme="light"] .mdl-view-mode-button:hover {
    color: #8a6111;
  }

  .mdl-view-mode-button.active {
    background: linear-gradient(135deg, var(--gold), var(--gold-2));
    color: #17120c;
    box-shadow: 0 8px 18px rgba(199, 154, 59, .28);
  }

  /* Remove os textos antigos caso tenham ficado soltos de tentativa anterior */
  .artist-view-mode-controls:not(.mdl-view-mode-toolbar),
  .artist-display-controls:not(.mdl-view-mode-toolbar),
  .view-mode-controls:not(.mdl-view-mode-toolbar),
  .artist-view-toggle:not(.mdl-view-mode-toolbar) {
    display: none !important;
  }

  /* Modo lista: leitura máxima */
  html[data-mdl-view-mode="list"] #songList,
  html[data-mdl-view-mode="list"] #favoriteList,
  html[data-mdl-view-mode="list"] #artistList {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  html[data-mdl-view-mode="list"] .song-card,
  html[data-mdl-view-mode="list"] .artist-card {
    min-height: 74px;
    grid-template-columns: minmax(0, 1fr) auto;
    border-radius: 14px;
  }

  html[data-mdl-view-mode="list"] .song-title,
  html[data-mdl-view-mode="list"] .artist-title {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.18;
  }

  /* Ícones pequenos */
  html[data-mdl-view-mode="small"] #songList,
  html[data-mdl-view-mode="small"] #favoriteList {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }

  html[data-mdl-view-mode="small"] .song-card {
    min-height: 180px;
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    align-items: end;
    padding: 12px;
  }

  html[data-mdl-view-mode="small"] .song-title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.12;
  }

  /* Ícones grandes */
  html[data-mdl-view-mode="large"] #songList,
  html[data-mdl-view-mode="large"] #favoriteList {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 18px;
  }

  html[data-mdl-view-mode="large"] .song-card {
    min-height: 250px;
    border-radius: 22px;
    overflow: hidden;
    position: relative;
    align-items: end;
    padding: 14px;
  }

  html[data-mdl-view-mode="large"] .song-title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.12;
    font-size: 17px;
  }

  /* Em cards com capa, mantém os botões por cima e melhora leitura */
  html[data-mdl-view-mode="small"] .song-main,
  html[data-mdl-view-mode="large"] .song-main {
    z-index: 2;
  }

  html[data-mdl-view-mode="small"] .song-actions,
  html[data-mdl-view-mode="large"] .song-actions {
    z-index: 3;
    align-self: end;
  }

  html[data-mdl-view-mode="small"] .song-card::after,
  html[data-mdl-view-mode="large"] .song-card::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(0,0,0,.05) 0%, rgba(0,0,0,.18) 42%, rgba(0,0,0,.72) 100%);
    z-index: 1;
  }

  /* Remove bolinha/letra do tom nas thumbs/cards */
  .song-card > b,
  .song-card .song-key,
  .song-card .key-badge,
  .song-card .tone-badge,
  .song-card [data-key],
  .song-card [data-tone],
  .artist-song-card > b,
  .artist-song-card .song-key,
  .artist-song-card .key-badge,
  .artist-song-card .tone-badge {
    display: none !important;
  }
}
`;

const js = `
(function () {
  const STORAGE_KEY = "mdl.artistViewMode";
  const MODES = [
    { id: "list", label: "Lista", icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>' },
    { id: "small", label: "Pequenos", icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"></rect><rect x="14" y="4" width="6" height="6" rx="1"></rect><rect x="4" y="14" width="6" height="6" rx="1"></rect><rect x="14" y="14" width="6" height="6" rx="1"></rect></svg>' },
    { id: "large", label: "Grandes", icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2"></rect><rect x="13" y="3" width="8" height="8" rx="2"></rect><rect x="3" y="13" width="8" height="8" rx="2"></rect><rect x="13" y="13" width="8" height="8" rx="2"></rect></svg>' }
  ];

  function getMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.some((mode) => mode.id === saved) ? saved : "large";
  }

  function setMode(modeId) {
    const mode = MODES.some((item) => item.id === modeId) ? modeId : "large";
    localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.dataset.mdlViewMode = mode;
    document.querySelectorAll(".mdl-view-mode-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === mode);
      button.setAttribute("aria-pressed", button.dataset.mode === mode ? "true" : "false");
    });
  }

  function removeOldPlainTextControls() {
    document.querySelectorAll(".artist-view-mode-controls, .artist-display-controls, .artist-view-toggle, .view-mode-controls").forEach((node) => {
      if (!node.classList.contains("mdl-view-mode-toolbar")) node.remove();
    });
  }

  function createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "mdl-view-mode-toolbar";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", "Modo de visualização");

    MODES.forEach((mode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mdl-view-mode-button";
      button.dataset.mode = mode.id;
      button.innerHTML = mode.icon + "<span>" + mode.label + "</span>";
      button.addEventListener("click", () => setMode(mode.id));
      toolbar.appendChild(button);
    });

    return toolbar;
  }

  function ensureToolbar() {
    removeOldPlainTextControls();

    const current = document.querySelector(".mdl-view-mode-toolbar");
    if (current) {
      setMode(getMode());
      return;
    }

    const artistView = document.getElementById("view-artistas");
    const acervoView = document.getElementById("view-acervo");
    const targetHead = artistView?.querySelector(".section-head") || acervoView?.querySelector(".library-head") || document.querySelector(".section-head");
    if (!targetHead) return;

    targetHead.appendChild(createToolbar());
    setMode(getMode());
  }

  function init() {
    setMode(getMode());
    ensureToolbar();

    const observer = new MutationObserver(() => ensureToolbar());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(cssPath, css.trim() + "\n", "utf8");
fs.writeFileSync(jsPath, js.trim() + "\n", "utf8");

let html = fs.readFileSync(indexPath, "utf8");

// remove arquivos antigos/tentativas anteriores para não duplicar
html = html
  .replace(/\s*<link[^>]+href=["']\/view-modes\.css[^"']*["'][^>]*>/gi, "")
  .replace(/\s*<link[^>]+href=["']\/artist-view-modes\.css[^"']*["'][^>]*>/gi, "")
  .replace(/\s*<script[^>]+src=["']\/view-modes\.js[^"']*["'][^>]*><\/script>/gi, "")
  .replace(/\s*<script[^>]+src=["']\/artist-view-modes\.js[^"']*["'][^>]*><\/script>/gi, "");

const cssTag = '  <link rel="stylesheet" href="/artist-view-modes.css?v=20260428-functional-v2">';
const jsTag = '  <script src="/artist-view-modes.js?v=20260428-functional-v2"></script>';

if (!html.includes('/artist-view-modes.css')) {
  html = html.replace(/\s*<\/head>/i, "\n" + cssTag + "\n</head>");
}

if (!html.includes('/artist-view-modes.js')) {
  html = html.replace(/\s*<\/body>/i, "\n" + jsTag + "\n</body>");
}

fs.writeFileSync(indexPath, html, "utf8");

console.log("OK: botões bonitos e funcionais aplicados.");
console.log("Arquivos atualizados:");
console.log("- public/index.html");
console.log("- public/artist-view-modes.css");
console.log("- public/artist-view-modes.js");
