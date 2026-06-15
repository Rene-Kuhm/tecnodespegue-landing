// Triple validación cruzada: 3 métodos independientes de contar wikilinks
// Muestra el conteo de CADA método, los links que difieren, y el desglose por archivo

const fs = require('fs');
const path = require('path');

const VAULT = process.argv[2] || 'F:/Tecnodespegue';
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

console.log('=== TRIPLE VALIDACION DE WIKILINKS ===\n');
console.log('Vault:', VAULT);
console.log('Archivos .md (excluyendo .obsidian y Bases):', files.length);
console.log('Excluyendo Vault Health.md:', files.length - 1);
console.log('');

// METODO 1: regex simple con \\[\\[([^\\]]+)\\]\\]
let m1Total = 0;
const m1ByFile = {};
for (const f of files) {
  if (path.resolve(f) === SELF) continue;
  const text = fs.readFileSync(f, 'utf-8');
  const links = [...text.matchAll(/\[\[([^\]]+)\]\]/g)];
  m1ByFile[path.basename(f)] = links.length;
  m1Total += links.length;
}

// METODO 2: regex de PowerShell \\[\\[[^\\]]+\\]\\]
let m2Total = 0;
for (const f of files) {
  if (path.resolve(f) === SELF) continue;
  const text = fs.readFileSync(f, 'utf-8');
  // Simular Matches de .NET: usa el mismo regex exacto
  const re = /\[\[[^\]]+\]\]/g;
  const links = [...text.matchAll(re)];
  m2Total += links.length;
}

// METODO 3: split + filter
let m3Total = 0;
for (const f of files) {
  if (path.resolve(f) === SELF) continue;
  const text = fs.readFileSync(f, 'utf-8');
  // Buscar todas las ocurrencias de [[ y contar cierres ]]
  let count = 0;
  let i = 0;
  while (i < text.length - 1) {
    if (text[i] === '[' && text[i+1] === '[') {
      const close = text.indexOf(']]', i + 2);
      if (close !== -1) {
        count++;
        i = close + 2;
      } else {
        break;
      }
    } else {
      i++;
    }
  }
  m3Total += count;
}

console.log('=== RESULTADOS POR METODO ===\n');
console.log('Metodo 1 (regex matchAll /\\[\\[([^\\]]+)\\]\\]/g):', m1Total);
console.log('Metodo 2 (regex matchAll /\\[\\[[^\\]]+\\]\\]/g):', m2Total);
console.log('Metodo 3 (split manual [[ ... ]]):', m3Total);

console.log('\n=== DESGLOSE POR ARCHIVO (Metodo 1) ===\n');
const sorted = Object.entries(m1ByFile).sort((a, b) => b[1] - a[1]);
for (const [name, count] of sorted) {
  console.log('  ' + name.padEnd(35) + count);
}
console.log('  ' + '---'.padEnd(35) + '---');
console.log('  ' + 'TOTAL'.padEnd(35) + m1Total);

console.log('\n=== POSIBLES DIFERENCIAS CON TU CONTEO (285) ===\n');
const diff = 285 - m1Total;
console.log('Tu conteo: 285');
console.log('Mi conteo: ' + m1Total);
console.log('Diferencia: ' + diff);
if (diff === 0) {
  console.log('-> COINCIDEN. Las 3 metodos convergen.');
} else if (diff > 0) {
  console.log('-> Tu conteo tiene ' + diff + ' wikilinks EXTRA que mis metodos no encuentran.');
  console.log('   Posibles causas:');
  console.log('   - Wikilinks en archivos .base (mi script los excluye)');
  console.log('   - Wikilinks dentro de bloques de codigo (mi script SI los cuenta)');
  console.log('   - Wikilinks en archivos que ya no existen');
  console.log('   - Comando manual que usas incluye mas archivos');
}
