// Debug: separar wikilinks dentro vs fuera de bloques de codigo
const fs = require('fs');
const path = require('path');
const VAULT = 'F:/Tecnodespegue';
const SELF = path.resolve(VAULT, 'Vault Health.md');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.obsidian' || entry.name === 'node_modules' || entry.name === 'Bases') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

const files = walk(VAULT);
let totalInside = 0;
let totalOutside = 0;
const insideByFile = {};
for (const f of files) {
  if (path.resolve(f) === SELF) continue;
  const text = fs.readFileSync(f, 'utf-8');
  const lines = text.split('\n');
  let inCode = false;
  let fileInside = 0;
  for (const line of lines) {
    if (line.match(/^```/)) { inCode = !inCode; continue; }
    const links = line.match(/\[\[[^\]]+\]\]/g) || [];
    if (inCode) { fileInside += links.length; totalInside += links.length; }
    else totalOutside += links.length;
  }
  if (fileInside > 0) insideByFile[path.basename(f)] = fileInside;
}
console.log('Wikilinks FUERA de bloques de codigo:', totalOutside);
console.log('Wikilinks DENTRO de bloques de codigo:', totalInside);
console.log('Total:', totalOutside + totalInside);
console.log('\\nWikilinks dentro de bloques de codigo por archivo:');
for (const [name, count] of Object.entries(insideByFile)) console.log(' ', name, count);
