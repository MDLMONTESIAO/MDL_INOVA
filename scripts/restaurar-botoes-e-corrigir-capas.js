const fs = require("fs");
const path = require("path");

const root = process.cwd();
const publicDir = path.join(root, "public");
const indexPath = path.join(publicDir, "index.html");
const stylesPath = path.join(publicDir, "styles.css");
const modeCssPath = path.join(publicDir, "artist-view-modes.css");
const modeJsPath = path.join(publicDir, "artist-view-modes.js");

if (!fs.existsSync(indexPath)) {
  console.error("Arquivo não encontrado: public/index.html");
  process.exit(1);
}

if (!fs.existsSync(stylesPath)) {
  console.error("Arquivo não encontrado: public/styles.css");
  process.exit(1);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function removeBlock(content, marker) {
  if (!content.includes(marker)) return content;
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.replace(new RegExp("\\n?\\s*" + escaped + "[\\s\\S]*?(?=\\n\\/\\* === |$)", "g"), "");
}

function cleanStyles() {
  let css = read(stylesPath);

  const markers = [
    "/* === ROLLBACK MDL: restaura cards originais === */",
    "/* === Correção de contraste do modo lista - MDL === */",
    "/* === MDL: remove bolinha do tom nos cards mobile/desktop === */",
    "/* Remove a bolinha do tom nas thumbs/cards de músicas */"
  ];

  for (const marker of markers) {
    css = removeBlock(css, marker);
  }

  write(stylesPath, css.trimEnd() + "\n");
  console.log("OK: restos antigos removidos de public/styles.css");
}

function installFiles() {
  const sourceCss = path.join(root, "public", "artist-view-modes.css");
  const sourceJs = path.join(root, "public", "artist-view-modes.js");

  // Estes arquivos já foram extraídos do ZIP para public/.
  if (!fs.existsSync(sourceCss) || !fs.existsSync(sourceJs)) {
    console.error("Extraia o ZIP na raiz do projeto antes de rodar este script.");
    process.exit(1);
  }

  console.log("OK: public/artist-view-modes.css pronto");
  console.log("OK: public/artist-view-modes.js pronto");
}

function cleanIndexAndInject() {
  let html = read(indexPath);

  html = html
    .replace(/^\s*<link[^>]+href=["'][^"']*(?:artist-view-modes|view-modes)\.css(?:\?[^"']*)?["'][^>]*>\s*$/gmi, "")
    .replace(/^\s*<script[^>]+src=["'][^"']*(?:artist-view-modes|view-modes)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>\s*$/gmi, "")
    .replace(/<div[^>]*id=["']mdlSongViewModeBar["'][\s\S]*?<\/div>/gi, "")
    .replace(/<div[^>]*class=["'][^"']*(?:artist-view-mode-toolbar|artist-view-modes|view-mode-toolbar|view-modes-toolbar|library-view-mode-toolbar)[^"']*["'][\s\S]*?<\/div>/gi, "")
    .replace(/\s*Lista\s*Ícones pequenos\s*Ícones grandes\s*/gi, "")
    .replace(/\s*Lista\s*Icones pequenos\s*Icones grandes\s*/gi, "");

  const cssTag = '<link rel="stylesheet" href="/artist-view-modes.css?v=20260428-clean">';
  const jsTag = '<script src="/artist-view-modes.js?v=20260428-clean" defer></script>';

  if (html.includes("</head>")) {
    html = html.replace("</head>", `  ${cssTag}\n</head>`);
  } else {
    console.error("Não encontrei </head> no index.html");
    process.exit(1);
  }

  if (html.includes("</body>")) {
    html = html.replace("</body>", `  ${jsTag}\n</body>`);
  } else {
    html += "\n" + jsTag + "\n";
  }

  write(indexPath, html);
  console.log("OK: CSS/JS dos modos reinseridos em public/index.html");
}

function neutralizeOldFiles() {
  const oldFiles = [
    path.join(publicDir, "view-modes.css"),
    path.join(publicDir, "view-modes.js")
  ];

  for (const file of oldFiles) {
    if (!fs.existsSync(file)) continue;
    const content = path.extname(file) === ".js"
      ? "// Neutralizado. Use artist-view-modes.js.\n"
      : "/* Neutralizado. Use artist-view-modes.css. */\n";
    write(file, content);
    console.log("OK: neutralizado", path.relative(root, file));
  }
}

cleanStyles();
installFiles();
cleanIndexAndInject();
neutralizeOldFiles();

console.log("");
console.log("Correção concluída.");
console.log("Agora envie:");
console.log("git add public/index.html public/styles.css public/artist-view-modes.css public/artist-view-modes.js scripts/restaurar-botoes-e-corrigir-capas.js");
console.log("git add -A public");
console.log("git commit -m \"Restaura botoes e corrige capas do acervo\"");
console.log("git push");
