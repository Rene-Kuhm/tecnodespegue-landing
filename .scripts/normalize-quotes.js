// Normaliza type: "xxx" -> type: xxx (quita comillas) en todos los frontmatter
// Tambien normaliza area y status si tienen comillas innecesarias

const fs = require('fs');
const path = require('path');

const VAULT = process.argv[2] || 'F:/Tecnodespegue';
const DRY_RUN = process.argv.includes('--dry');

const FIELDS = ['type', 'status', 'area', 'model_used', 'repo', 'hash'];

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.obsidian' || entry.name === 'node_modules' || entry.name === 'Bases') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

function normalize(file) {
  const text = fs.readFileSync(file, 'utf-8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;

  let fm = m[1];
  let changed = false;
  const changes = [];

  for (const field of FIELDS) {
    // match: field: "valor"  (con comillas) o  field: 'valor'
    const quoted = new RegExp(`^(${field}):\\s*["']([^"']+)["']\\s*$`, 'm');
    const mm = fm.match(quoted);
    if (mm) {
      const value = mm[2];
      // No tocar si es placeholder de Templater {{...}} - las comillas son legitimas ahi
      if (value.includes('{{') && value.includes('}}')) continue;
      const newVal = `${field}: ${value}`;
      fm = fm.replace(quoted, newVal);
      changes.push(`${field}: "${value}" -> ${field}: ${value}`);
      changed = true;
    }
  }

  if (!changed) return null;
  if (DRY_RUN) return { file: file.replace(VAULT + path.sep, '').replace(/\\/g, '/'), changes, dry: true };

  const out = `---\n${fm}\n---\n${text.slice(m[0].length)}`;
  fs.writeFileSync(file, out, 'utf-8');
  return { file: file.replace(VAULT + path.sep, '').replace(/\\/g, '/'), changes, dry: false };
}

const files = walk(VAULT);
const results = files.map(normalize).filter(Boolean);

console.log(`[normalize-quotes] ${results.length} archivos con comillas innecesarias:`);
for (const r of results) {
  const tag = r.dry ? '[DRY]' : '[FIX]';
  console.log(`  ${tag}  ${r.file}`);
  for (const c of r.changes) console.log(`         ${c}`);
}
if (DRY_RUN) console.log('\nRe-ejecuta sin --dry para aplicar.');
