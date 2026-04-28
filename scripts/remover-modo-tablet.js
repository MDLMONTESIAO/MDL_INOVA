const fs = require('fs');
const path = require('path');

const root = process.cwd();
const indexPath = path.join(root, 'public', 'index.html');
const filesToDelete = [
  path.join(root, 'public', 'artist-view-modes.css'),
  path.join(root, 'public', 'artist-view-modes.js'),
  path.join(root, 'public', 'view-modes.css'),
  path.join(root, 'public', 'view-modes.js')
];

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Removido: ${path.relative(root, filePath)}`);
  } else {
    console.log(`Nao encontrado, ignorado: ${path.relative(root, filePath)}`);
  }
}

if (!fs.existsSync(indexPath)) {
  console.error('Erro: public/index.html nao encontrado. Rode este script na raiz do projeto.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');
const original = html;

// Remove links/scripts dos pacotes antigos de modo tablet/PC.
const patterns = [
  /\s*<link\s+rel=["']stylesheet["']\s+href=["']\/artist-view-modes\.css(?:\?[^"']*)?["']\s*\/?>/gi,
  /\s*<link\s+rel=["']stylesheet["']\s+href=["']\/view-modes\.css(?:\?[^"']*)?["']\s*\/?>/gi,
  /\s*<script\s+src=["']\/artist-view-modes\.js(?:\?[^"']*)?["']\s*>\s*<\/script>/gi,
  /\s*<script\s+src=["']\/view-modes\.js(?:\?[^"']*)?["']\s*>\s*<\/script>/gi,
  /\s*<script\s+defer\s+src=["']\/artist-view-modes\.js(?:\?[^"']*)?["']\s*>\s*<\/script>/gi,
  /\s*<script\s+defer\s+src=["']\/view-modes\.js(?:\?[^"']*)?["']\s*>\s*<\/script>/gi
];

for (const pattern of patterns) {
  html = html.replace(pattern, '');
}

// Remove qualquer bloco de controle inserido no HTML, caso tenha sido aplicado diretamente.
html = html.replace(/\n?\s*<div\s+class=["'](?:artist-)?view-mode-controls["'][\s\S]*?<\/div>\s*/gi, '\n');

if (html !== original) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('Atualizado: public/index.html');
} else {
  console.log('Nenhuma referencia de modo tablet encontrada no public/index.html.');
}

for (const filePath of filesToDelete) {
  removeFile(filePath);
}

console.log('\nPronto: os modos Lista / Icones pequenos / Icones grandes foram removidos.');
console.log('As capas voltam a usar a exibicao padrao do sistema.');
