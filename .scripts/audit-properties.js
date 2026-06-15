// Auditor de frontmatter - normaliza created/updated en todos los .md
// Uso: node audit-properties.js [vault-path] [today] [review_after]
// Por defecto audita F:/Tecnodespegue, fecha hoy, review 2026-09-15

const fs = require('fs');
const path = require('path');

const VAULT = process.argv[2] || 'F:/Tecnodespegue';
const TODAY = process.argv[3] || new Date().toISOString().slice(0, 10);
const REVIEW = process.argv[4] || '2026-09-15';

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.obsidian' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: null, body: text, raw: text };
  return { fm: m[1], body: m[2], raw: text, start: m[0] };
}

function normalizeFile(file) {
  const text = fs.readFileSync(file, 'utf-8');
  const parsed = parseFrontmatter(text);
  if (!parsed.fm) return { file, status: 'no-fm' };

  let fm = parsed.fm;
  let changed = false;

  // asegurar created
  if (!/^created:/m.test(fm)) {
    fm += `\ncreated: ${TODAY}`;
    changed = true;
  }
  // asegurar updated
  if (!/^updated:/m.test(fm)) {
    fm += `\nupdated: ${TODAY}`;
    changed = true;
  }
  // asegurar review_after para no-logs
  if (!/^review_after:/m.test(fm) && !/^type: ai-commit-analysis/m.test(fm)) {
    fm += `\nreview_after: ${REVIEW}`;
    changed = true;
  }
  // asegurar area
  if (!/^area:/m.test(fm)) {
    let area = 'misc';
    if (file.includes('10-Projects')) area = 'projects';
    else if (file.includes('20-Areas')) area = 'areas';
    else if (file.includes('30-Resources')) area = 'resources';
    else if (file.includes('90-Templates')) area = 'templates';
    else if (file.includes('99-AI-Logs')) area = 'logs';
    else if (file.includes('00-Inbox')) area = 'inbox';
    else if (file.endsWith('Home.md') || file.endsWith('README.md') || file.endsWith('Bienvenido.md') || file.includes('Mapa del Vault')) area = 'meta';
    fm += `\narea: ${area}`;
    changed = true;
  }

  if (changed) {
    const out = `---\n${fm}\n---\n${parsed.body}`;
    fs.writeFileSync(file, out, 'utf-8');
    return { file, status: 'fixed' };
  }
  return { file, status: 'ok' };
}

const files = walk(VAULT);
const results = files.map(normalizeFile);
const fixed = results.filter(r => r.status === 'fixed').length;
const ok = results.filter(r => r.status === 'ok').length;
const noFm = results.filter(r => r.status === 'no-fm').length;

console.log(`[audit-properties] ${files.length} archivos: ${ok} ok, ${fixed} corregidos, ${noFm} sin frontmatter`);
if (noFm > 0) console.log('Archivos sin frontmatter:', results.filter(r => r.status === 'no-fm').map(r => r.file).join('\n'));
