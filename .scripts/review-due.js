// Lista notas con review_after < hoy (vencidas para revision)
// Uso: node review-due.js [vault-path]
// Excluye logs de IA (review_after = 1 ano)

const fs = require('fs');
const path = require('path');

const VAULT = process.argv[2] || 'F:/Tecnodespegue';
const TODAY = new Date().toISOString().slice(0, 10);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.obsidian' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

function getReviewAfter(file) {
  const text = fs.readFileSync(file, 'utf-8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const typeMatch = m[1].match(/^type:\s*(\S+)/m);
  if (typeMatch && typeMatch[1] === 'ai-commit-analysis') return null; // ignorar logs
  const raMatch = m[1].match(/^review_after:\s*(\S+)/m);
  return raMatch ? raMatch[1] : null;
}

const files = walk(VAULT);
const due = [];
for (const f of files) {
  const ra = getReviewAfter(f);
  if (ra && ra < TODAY) {
    const rel = f.replace(VAULT + path.sep, '').replace(/\\/g, '/');
    due.push({ file: rel, review_after: ra });
  }
}

if (due.length === 0) {
  console.log(`[review-due] Nada vencido (hoy=${TODAY}). Vault limpio.`);
  process.exit(0);
}

console.log(`[review-due] ${due.length} nota(s) para revisar (hoy=${TODAY}):\n`);
for (const d of due.sort((a, b) => a.review_after.localeCompare(b.review_after))) {
  const days = Math.floor((new Date(TODAY) - new Date(d.review_after)) / (1000 * 60 * 60 * 24));
  console.log(`  [${days}d vencido]  ${d.file}  (review_after: ${d.review_after})`);
}
