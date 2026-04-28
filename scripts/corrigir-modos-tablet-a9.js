const fs = require("fs");
const path = require("path");

const root = process.cwd();
const indexPath = path.join(root, "public", "index.html");
const cssPath = path.join(root, "public", "artist-view-modes.css");
const jsPath = path.join(root, "public", "artist-view-modes.js");

if (!fs.existsSync(indexPath)) {
  console.error("Nao encontrei public/index.html. Rode este script dentro da raiz do projeto.");
  process.exit(1);
}

const css = `/* MDL - modos reais de visualizacao para tablet/PC */
.mdl-view-toolbar {
  display: none;
}

@media (min-width: 700px) {
  .mdl-view-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    margin: -4px 0 14px;
  }

  .mdl-view-button {
    min-height: 38px;
    border-radius: 999px;
    padding: 0 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: rgba(255, 255, 255, .08);
    color: var(--text);
    border: 1px solid var(--line);
    font-size: 12px;
    line-height: 1;
    font-weight: 950;
    box-shadow: 0 10px 24px rgba(0, 0, 0, .10);
  }

  :root[data-theme="dark"] .mdl-view-button {
    color: #f8efe2;
    background: rgba(255, 255, 255, .08);
    border-color: rgba(255, 255, 255, .12);
  }

  .mdl-view-button svg {
    width: 17px;
    height: 17px;
  }

  .mdl-view-button.active {
    background: linear-gradient(135deg, var(--gold), var(--gold-2));
    color: #17120c;
    border-color: rgba(255, 255, 255, .24);
  }

  body.mdl-view-mode-enabled .song-list {
    gap: 14px !important;
  }

  /* Remove a indicacao de tom nos cards/thumbs */
  body.mdl-view-mode-enabled .song-card > b,
  body.mdl-view-mode-enabled .song-card .song-key,
  body.mdl-view-mode-enabled .song-card .key-badge,
  body.mdl-view-mode-enabled .song-card .tone-badge,
  body.mdl-view-mode-enabled .song-card [data-key],
  body.mdl-view-mode-enabled .song-card [data-tone] {
    display: none !important;
  }

  /* MODO LISTA */
  body.mdl-view-list #songList,
  body.mdl-view-list #favoriteList,
  body.mdl-view-list #artistList {
    display: grid !important;
    grid-template-columns: 1fr !important;
  }

  body.mdl-view-list .song-card,
  body.mdl-view-list .artist-card {
    min-height: 76px !important;
    border-radius: 14px !important;
    padding: 10px 12px !important;
    background-image: none !important;
    background-color: var(--paper-2) !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: center !important;
  }

  /* MODO ICONES PEQUENOS */
  body.mdl-view-small #songList,
  body.mdl-view-small #favoriteList,
  body.mdl-view-small #artistList {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
    gap: 14px !important;
  }

  body.mdl-view-small .song-card {
    position: relative !important;
    overflow: hidden !important;
    min-height: 180px !important;
    border-radius: 18px !important;
    padding: 12px !important;
    display: grid !important;
    grid-template-columns: 1fr auto !important;
    align-items: end !important;
    background-color: #11131d !important;
    background-image:
      linear-gradient(180deg, rgba(0,0,0,.04) 0%, rgba(0,0,0,.18) 45%, rgba(0,0,0,.88) 100%),
      var(--mdl-card-cover) !important;
    background-size: cover !important;
    background-position: center !important;
  }

  body.mdl-view-small .artist-card {
    min-height: 120px !important;
    border-radius: 18px !important;
  }

  /* MODO ICONES GRANDES */
  body.mdl-view-large #songList,
  body.mdl-view-large #favoriteList,
  body.mdl-view-large #artistList {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)) !important;
    gap: 18px !important;
  }

  body.mdl-view-large .song-card {
    position: relative !important;
    overflow: hidden !important;
    min-height: 250px !important;
    border-radius: 22px !important;
    padding: 16px !important;
    display: grid !important;
    grid-template-columns: 1fr auto !important;
    align-items: end !important;
    background-color: #11131d !important;
    background-image:
      linear-gradient(180deg, rgba(0,0,0,.02) 0%, rgba(0,0,0,.15) 44%, rgba(0,0,0,.90) 100%),
      var(--mdl-card-cover) !important;
    background-size: cover !important;
    background-position: center !important;
  }

  body.mdl-view-small .song-card::before,
  body.mdl-view-large .song-card::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, transparent 35%, rgba(0,0,0,.78));
  }

  body.mdl-view-small .song-card > *,
  body.mdl-view-large .song-card > * {
    position: relative;
    z-index: 1;
  }

  body.mdl-view-small .song-title,
  body.mdl-view-large .song-title {
    color: #fff !important;
    white-space: normal !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    text-shadow: 0 2px 8px rgba(0,0,0,.55);
  }

  body.mdl-view-small .song-meta,
  body.mdl-view-large .song-meta {
    color: rgba(255,255,255,.82) !important;
    text-shadow: 0 2px 8px rgba(0,0,0,.55);
  }

  body.mdl-view-small .song-card img,
  body.mdl-view-large .song-card img,
  body.mdl-view-small .song-cover,
  body.mdl-view-large .song-cover,
  body.mdl-view-small .artist-thumb,
  body.mdl-view-large .artist-thumb {
    display: none !important;
  }

  body.mdl-view-small .song-actions,
  body.mdl-view-large .song-actions {
    align-self: end !important;
  }

  body.mdl-view-small .mini-action,
  body.mdl-view-large .mini-action {
    background: rgba(24, 24, 34, .88) !important;
    color: #fff !important;
    border-color: rgba(255, 255, 255, .12) !important;
    backdrop-filter: blur(8px);
  }

  body.mdl-view-small .mini-action.primary,
  body.mdl-view-large .mini-action.primary {
    background: var(--gold) !important;
    color: #17120c !important;
  }
}

@media (max-width: 699px) {
  body.mdl-view-list,
  body.mdl-view-small,
  body.mdl-view-large {
    /* no celular, o layout original manda */
  }
}
`;

const js = `(function () {
  const MIN_WIDTH = 700;
  const STORAGE_KEY = "mdl.songViewMode";
  const modes = [
    { id: "list", label: "Lista", icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M8 6h13'></path><path d='M8 12h13'></path><path d='M8 18h13'></path><path d='M3 6h.01'></path><path d='M3 12h.01'></path><path d='M3 18h.01'></path></svg>" },
    { id: "small", label: "Ícones pequenos", icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><rect x='3' y='3' width='7' height='7' rx='2'></rect><rect x='14' y='3' width='7' height='7' rx='2'></rect><rect x='3' y='14' width='7' height='7' rx='2'></rect><rect x='14' y='14' width='7' height='7' rx='2'></rect></svg>" },
    { id: "large", label: "Ícones grandes", icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><rect x='3' y='3' width='18' height='18' rx='4'></rect><path d='M8 16h8'></path><path d='M8 12h8'></path></svg>" }
  ];

  function isTabletOrPc() {
    return window.innerWidth >= MIN_WIDTH;
  }

  function getMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return modes.some((mode) => mode.id === saved) ? saved : "large";
  }

  function setMode(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
    applyMode();
  }

  function activeView() {
    return document.querySelector(".view.active") || document.getElementById("view-acervo") || document.body;
  }

  function removeOldPlainTexts() {
    document.querySelectorAll(".mdl-view-toolbar-broken, .artist-view-mode-toolbar-broken").forEach((el) => el.remove());
    document.querySelectorAll("div, span, p").forEach((el) => {
      if (el.classList.contains("mdl-view-toolbar")) return;
      const text = (el.textContent || "").replace(/\\s+/g, " ").trim().toLowerCase();
      if (text === "lista ícones pequenos ícones grandes" || text === "lista icones pequenos icones grandes") {
        el.remove();
      }
    });
  }

  function findInsertPoint(view) {
    return view.querySelector(".library-toolbar") || view.querySelector(".section-head") || view.firstElementChild || view;
  }

  function ensureToolbar() {
    removeOldPlainTexts();

    if (!isTabletOrPc()) {
      document.querySelectorAll(".mdl-view-toolbar").forEach((toolbar) => toolbar.remove());
      document.body.classList.remove("mdl-view-mode-enabled", "mdl-view-list", "mdl-view-small", "mdl-view-large");
      return;
    }

    const view = activeView();
    const hasList = view.querySelector("#songList, #favoriteList, #artistList, .song-list");
    if (!hasList) return;

    document.querySelectorAll(".mdl-view-toolbar").forEach((toolbar) => {
      if (!view.contains(toolbar)) toolbar.remove();
    });

    let toolbar = view.querySelector(".mdl-view-toolbar");
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.className = "mdl-view-toolbar";
      toolbar.setAttribute("aria-label", "Modo de visualização");
      modes.forEach((mode) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mdl-view-button";
        button.dataset.viewMode = mode.id;
        button.innerHTML = mode.icon + "<span>" + mode.label + "</span>";
        button.addEventListener("click", () => setMode(mode.id));
        toolbar.appendChild(button);
      });
      const insertPoint = findInsertPoint(view);
      insertPoint.insertAdjacentElement("afterend", toolbar);
    }
  }

  function extractUrl(value) {
    const text = String(value || "");
    const match = text.match(/url\\(["']?([^"')]+)["']?\\)/i);
    return match ? match[1] : "";
  }

  function applyCardCovers() {
    document.querySelectorAll(".song-card").forEach((card) => {
      let src = "";
      const img = card.querySelector("img[src]");
      if (img && img.src) src = img.src;

      if (!src) {
        const bg = getComputedStyle(card).backgroundImage || card.style.backgroundImage;
        src = extractUrl(bg);
      }

      if (!src) {
        const innerBg = Array.from(card.querySelectorAll("*")).map((el) => getComputedStyle(el).backgroundImage || el.style.backgroundImage).find((bg) => bg && bg !== "none");
        src = extractUrl(innerBg);
      }

      if (src) {
        card.style.setProperty("--mdl-card-cover", "url('" + src.replace(/'/g, "%27") + "')");
      } else {
        card.style.setProperty("--mdl-card-cover", "linear-gradient(135deg, #171925, #0b0c13)");
      }
    });
  }

  function applyMode() {
    ensureToolbar();
    const enabled = isTabletOrPc();
    const mode = getMode();

    document.body.classList.toggle("mdl-view-mode-enabled", enabled);
    document.body.classList.toggle("mdl-view-list", enabled && mode === "list");
    document.body.classList.toggle("mdl-view-small", enabled && mode === "small");
    document.body.classList.toggle("mdl-view-large", enabled && mode === "large");

    document.querySelectorAll(".mdl-view-button").forEach((button) => {
      const active = button.dataset.viewMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    applyCardCovers();
  }

  let timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(applyMode, 80);
  }

  document.addEventListener("DOMContentLoaded", schedule);
  window.addEventListener("resize", schedule);
  document.addEventListener("click", () => setTimeout(schedule, 120), true);
  document.addEventListener("input", () => setTimeout(schedule, 120), true);

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });

  schedule();
})();
`;

fs.mkdirSync(path.dirname(cssPath), { recursive: true });
fs.writeFileSync(cssPath, css, "utf8");
fs.writeFileSync(jsPath, js, "utf8");

let html = fs.readFileSync(indexPath, "utf8");
html = html
  .replace(/\s*<link[^>]+href=["'][^"']*(?:artist-view-modes|view-modes)\.css[^"']*["'][^>]*>/gi, "")
  .replace(/\s*<script[^>]+src=["'][^"']*(?:artist-view-modes|view-modes)\.js[^"']*["'][^>]*>\s*<\/script>/gi, "");

const cssTag = '  <link rel="stylesheet" href="/artist-view-modes.css?v=20260428-a9-fix">';
const jsTag = '  <script src="/artist-view-modes.js?v=20260428-a9-fix" defer></script>';

if (!html.includes('/artist-view-modes.css')) {
  html = html.replace(/<\/head>/i, `${cssTag}\n</head>`);
}
if (!html.includes('/artist-view-modes.js')) {
  html = html.replace(/<\/body>/i, `${jsTag}\n</body>`);
}

fs.writeFileSync(indexPath, html, "utf8");
console.log("OK: modos de visualizacao corrigidos para tablet/PC. Atualizados:");
console.log("- public/index.html");
console.log("- public/artist-view-modes.css");
console.log("- public/artist-view-modes.js");
