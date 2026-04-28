const fs = require("fs");
const path = require("path");

const root = process.cwd();
const indexPath = path.join(root, "public", "index.html");
const cssPath = path.join(root, "public", "artist-view-modes.css");
const jsPath = path.join(root, "public", "artist-view-modes.js");

if (!fs.existsSync(indexPath)) {
  console.error("Não encontrei public/index.html. Rode este script na raiz do projeto.");
  process.exit(1);
}

let html = fs.readFileSync(indexPath, "utf8");

const cssTag = '<link rel="stylesheet" href="/artist-view-modes.css?v=20260428-corrigido">';
const jsTag = '<script src="/artist-view-modes.js?v=20260428-corrigido" defer></script>';

if (!html.includes("/artist-view-modes.css")) {
  html = html.replace(/<\/head>/i, `  ${cssTag}\n</head>`);
} else {
  html = html.replace(/<link[^>]+href=["']\/artist-view-modes\.css[^>]*>/i, cssTag);
}

if (!html.includes("/artist-view-modes.js")) {
  html = html.replace(/<\/body>/i, `  ${jsTag}\n</body>`);
} else {
  html = html.replace(/<script[^>]+src=["']\/artist-view-modes\.js[^>]*><\/script>/i, jsTag);
}

fs.writeFileSync(indexPath, html, "utf8");
console.log("OK: public/index.html atualizado com os modos de visualização.");
console.log("Confira se estes arquivos existem:");
console.log("-", cssPath);
console.log("-", jsPath);
