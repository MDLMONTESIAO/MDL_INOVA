const fs = require("fs");
const path = require("path");

const root = process.cwd();
const publicDir = path.join(root, "public");
const indexPath = path.join(publicDir, "index.html");
const stylesPath = path.join(publicDir, "styles.css");

if (!fs.existsSync(indexPath)) {
  console.error("Arquivo não encontrado: public/index.html");
  process.exit(1);
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function removeBlockByMarker(content, marker) {
  if (!content.includes(marker)) return content;
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.replace(new RegExp("\\n?\\s*" + escaped + "[\\s\\S]*?(?=\\n\\/\\* === |\\n\\/\\* MDL |$)", "g"), "");
}

function cleanStyles() {
  if (!fs.existsSync(stylesPath)) return;

  let css = read(stylesPath);

  const markers = [
    "/* === ROLLBACK MDL: restaura cards originais === */",
    "/* === Correção de contraste do modo lista - MDL === */",
    "/* === MDL: remove bolinha do tom nos cards mobile/desktop === */"
  ];

  for (const marker of markers) {
    css = removeBlockByMarker(css, marker);
  }

  // Remove regra antiga que escondia o toolbar por cima.
  css = css.replace(/#mdlSongViewModeBar\s*\{[\s\S]*?display:\s*none\s*!important;[\s\S]*?\}/g, "");

  write(stylesPath, css.trimEnd() + "\n");
  console.log("OK: restos antigos removidos de public/styles.css");
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

  const cssTag = '<link rel="stylesheet" href="/artist-view-modes.css?v=20260428-login-safe">';
  const jsTag = '<script src="/artist-view-modes.js?v=20260428-login-safe" defer></script>';

  if (!html.includes("</head>")) {
    console.error("Não encontrei </head> no index.html");
    process.exit(1);
  }

  html = html.replace("</head>", `  ${cssTag}\n</head>`);

  if (html.includes("</body>")) {
    html = html.replace("</body>", `  ${jsTag}\n</body>`);
  } else {
    html += "\n" + jsTag + "\n";
  }

  write(indexPath, html);
  console.log("OK: index.html atualizado sem interferir no login");
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
cleanIndexAndInject();
neutralizeOldFiles();

console.log("");
console.log("Correção aplicada.");
console.log("Agora envie:");
console.log("git add public/index.html public/styles.css public/artist-view-modes.css public/artist-view-modes.js scripts/corrigir-login-e-modos.js");
console.log("git add -A public");
console.log("git commit -m \"Corrige login e modos de visualizacao\"");
console.log("git push");
