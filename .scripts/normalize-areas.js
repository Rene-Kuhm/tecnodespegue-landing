// Normaliza valores de area: corrige placeholders sin resolver e inconsistencias de idioma
// Reglas:
//   - {{area:xxx}}  -> xxx  (Templater placeholder sin resolver)
//   - recurso       -> resources
//   - proyecto      -> projects
//   - conocimiento  -> areas  (mapea al area de la carpeta)

const fs = require('fs');
const path = require('path');

const VAULT = process.argv[2] || 'F:/Tecnodespegue';
const DRY_RUN = process.argv.includes('--dry');

const map = {
  'recurso': 'resources',
  'proyecto': 'projects',
  'tooling': 'resources', // fusionar tooling -> resources por decision del usuario
  'conocimiento': 'conocimiento', // preservar (es la unica area en espanol, separa concept notes)
  'areas': 'areas',
  'projects': 'projects',
  'resources': 'resources',
  'logs': 'logs',
  'meta': 'meta',
  'templates': 'templates',
  'misc': 'misc',
  'inbox': 'inbox',
};

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.obsidian' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

function fix(file) {
  const text = fs.readFileSync(file, 'utf-8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;

  let fm = m[1];
  let changed = false;
  let original = null;
  let final = null;

  const areaMatch = fm.match(/^area:\s*(.+)$/m);
  if (!areaMatch) return null;

  original = areaMatch[1].trim();

  // Detectar placeholder de Templater sin resolver: {{area:xxx}}
  const placeholder = original.match(/^\{\{area:(\w+)\}\}$/);
  if (placeholder) {
    final = placeholder[1];
  } else {
    final = map[original] || original;
  }

  if (final !== original) {
    fm = fm.replace(/^area:\s*.+$/m, `area: ${final}`);
    changed = true;
  }

  if (!changed) return null;
  if (DRY_RUN) return { file, original, final, dry: true };

  const out = `---\n${fm}\n---\n${text.slice(m[0].length)}`;
  fs.writeFileSync(file, out, 'utf-8');
  return { file, original, final, dry: false };
}

const files = walk(VAULT);
const results = files.map(fix).filter(Boolean);

console.log(`[normalize-areas] ${results.length} cambios:`);
for (const r of results) {
  const tag = r.dry ? '[DRY]' : '[FIX]';
  console.log(`  ${tag}  ${r.file}: "${r.original}" -> "${r.final}"`);
}
if (DRY_RUN) console.log('\nRe-ejecuta sin --dry para aplicar.');
