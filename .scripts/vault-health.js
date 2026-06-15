// vault-health.js - Diagnostico completo del vault
// Genera metricas: total notas, links rotos, sin metadata, huerfanos, vencidas, areas
// Uso: node vault-health.js [vault-path] [--json] [--md=output.md]
// Por defecto: vault F:/Tecnodespegue, salida a stdout (markdown) y regenera Vault Health.md

const fs = require('fs');
const path = require('path');

const VAULT = process.argv[2] || 'F:/Tecnodespegue';
const TODAY = new Date().toISOString().slice(0, 10);
const args = process.argv.slice(3);
const asJson = args.includes('--json');
const mdArg = args.find(a => a.startsWith('--md='));
const MD_OUT = mdArg ? mdArg.slice(5) : path.join(VAULT, 'Vault Health.md');

function walk(dir, acc = [], skipSelf = false) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.obsidian' || entry.name === 'node_modules' || entry.name === 'Bases' || entry.name === '.scripts' || entry.name === '.githooks') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc, skipSelf);
    else if (entry.name.endsWith('.md')) {
      if (skipSelf && path.resolve(full) === path.resolve(MD_OUT)) continue;
      acc.push(full);
    }
  }
  return acc;
}

const FOLDER_HUBS = new Set(['00-Inbox', '10-Projects', '20-Areas', '30-Resources', '40-Archives', '90-Templates', '99-AI-Logs', 'Bases']);

// Nota: Vault Health.md se excluye del walk (para no leerse a si mismo)
// pero se agrega al noteMap para que links hacia el cuenten como validos

function parseFrontmatter(text) {
  // Soporta LF (\n) y CRLF (\r\n) - en Windows git puede convertir line endings
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  return m[1];
}

function getProp(fm, key) {
  if (!fm) return null;
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

const files = walk(VAULT, [], false); // NO excluir self del walk, lo manejamos despues
// Vault Health.md se procesa tambien, pero:
// - Si lo contamos en el total: files.length ya lo incluye
// - Para links: lo excluimos SOLO del conteo de wikilinks para no contar el reporte anterior
// - Para metadata: lo excluimos para que no se reporte a si mismo como "sin area"
const SELF = path.resolve(MD_OUT);
const selfName = path.basename(MD_OUT, '.md');
const isSelf = (f) => path.resolve(f) === SELF;
const noteMap = new Map();
for (const f of files) {
  noteMap.set(path.basename(f, '.md'), f);
}
// agregar folder-hubs al mapa (links a carpetas son validos)
for (const hub of FOLDER_HUBS) {
  if (!noteMap.has(hub)) {
    // es link a carpeta sin .md, lo aceptamos como valido aunque no resuelva
    noteMap.set(hub, `FOLDER_HUB:${hub}`);
  }
}
const TOTAL_FILES = files.length;

const stats = {
  total: TOTAL_FILES,
  noFm: [],
  noCreated: [],
  noUpdated: [],
  noArea: [],
  brokenLinks: [],
  orphan: [],           // 0 incoming links
  dueReview: [],        // review_after < hoy
  byArea: {},
  byType: {},
  incoming: {},         // nombre -> count de wikilinks apuntandole
  allLinks: 0,
};

for (const f of files) {
  const rel = f.replace(VAULT + path.sep, '').replace(/\\/g, '/');
  const isSelfFile = isSelf(f);
  const isHome = path.resolve(f) === path.resolve(path.join(VAULT, 'Home.md'));
  const text = fs.readFileSync(f, 'utf-8');
  const fm = parseFrontmatter(text);

  // metadata checks (excluir self Y Home porque el script los regenera)
  if (!isSelfFile && !isHome) {
    if (!fm) stats.noFm.push(rel);
    if (!getProp(fm, 'created')) stats.noCreated.push(rel);
    if (!getProp(fm, 'updated')) stats.noUpdated.push(rel);
    if (!getProp(fm, 'area')) stats.noArea.push(rel);
  }

  const area = getProp(fm, 'area') || '(none)';
  stats.byArea[area] = (stats.byArea[area] || 0) + 1;

  const type = getProp(fm, 'type') || '(none)';
  stats.byType[type] = (stats.byType[type] || 0) + 1;

  // review_after vencido (excluir self)
  const ra = getProp(fm, 'review_after');
  if (!isSelfFile && ra && ra < TODAY && type !== 'ai-commit-analysis') {
    stats.dueReview.push({ file: rel, review_after: ra });
  }

  // links: regex simple que captura TODOS los [[...]] en una linea
  // (la regex compleja anterior fallaba en lineas con multiples links separados por · | etc)
  // Incluimos el self para que el conteo refleje la realidad total
  // (el reporte SI tiene wikilinks legitimos como [[Home]], [[Mapa del Vault]], etc.)
  const links = [...text.matchAll(/\[\[([^\]]+)\]\]/g)];
  for (const l of links) {
    stats.allLinks++;
    // extraer target puro: [[target|alias]] o [[target#section]] -> target
    const inner = l[1].trim();
    const target = inner.split('|')[0].split('#')[0].trim();
    if (target.includes('://')) continue; // URL
    stats.incoming[target] = (stats.incoming[target] || 0) + 1;
    // Si el link viene del self, NO lo reportes como link roto aunque el target no exista
    // (los links en la seccion "Links rotos" del reporte son EJEMPLOS, no links reales)
    if (isSelfFile) continue;
    const targetFile = noteMap.get(target);
    if (!targetFile) {
      stats.brokenLinks.push({ from: rel, to: target });
    }
  }
}

// huerfanos: notas con 0 incoming (excluyendo folder-hubs, que son entry points por diseño, y self)
for (const f of files) {
  if (isSelf(f)) continue; // no reportarse a si mismo
  const name = path.basename(f, '.md');
  if (FOLDER_HUBS.has(name)) continue; // folder-hubs son nodos de entrada, no huerfanos
  const incoming = stats.incoming[name] || 0;
  if (incoming === 0) stats.orphan.push(f.replace(VAULT + path.sep, '').replace(/\\/g, '/'));
}

if (asJson) {
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
}

// Generar markdown
let md = `# Vault Health

> Dashboard de salud del vault. **Ultima ejecucion**: ${TODAY}.
> Comando: \`node ~/.gemini/antigravity/vault-health.js\`
> Esta nota se regenera automaticamente cuando se ejecuta el script.
> Tambien actualiza [[Home]] automaticamente.

---

## Resumen ejecutivo

| Metrica | Valor | Estado |
|---|---|---|
| **Notas totales** | ${stats.total} | - |
| **Wikilinks** | ${stats.allLinks} | - |
| **Links rotos** | ${stats.brokenLinks.length} | ${stats.brokenLinks.length === 0 ? 'OK' : 'REVISAR'} |
| **Sin frontmatter** | ${stats.noFm.length} | ${stats.noFm.length === 0 ? 'OK' : 'REVISAR'} |
| **Sin created** | ${stats.noCreated.length} | ${stats.noCreated.length === 0 ? 'OK' : 'REVISAR'} |
| **Sin updated** | ${stats.noUpdated.length} | ${stats.noUpdated.length === 0 ? 'OK' : 'REVISAR'} |
| **Sin area** | ${stats.noArea.length} | ${stats.noArea.length === 0 ? 'OK' : 'REVISAR'} |
| **Nodos huerfanos** | ${stats.orphan.length} | ${stats.orphan.length < 5 ? 'OK' : 'CONECTAR'} |
| **Vencidas para revision** | ${stats.dueReview.length} | ${stats.dueReview.length === 0 ? 'OK' : 'REVISAR'} |

---

## Distribucion por area

| Area | Cantidad |
|---|---|
`;

for (const [area, n] of Object.entries(stats.byArea).sort((a, b) => b[1] - a[1])) {
  md += `| \`${area}\` | ${n} |\n`;
}

md += `\n## Distribucion por tipo\n\n| Tipo | Cantidad |\n|---|---|\n`;
for (const [type, n] of Object.entries(stats.byType).sort((a, b) => b[1] - a[1])) {
  md += `| \`${type}\` | ${n} |\n`;
}

if (stats.brokenLinks.length > 0) {
  md += `\n## Links rotos (${stats.brokenLinks.length})\n\n`;
  for (const b of stats.brokenLinks) {
    const fromName = path.basename(b.from, '.md');
    md += `- [[${fromName}]] -> \`[[${b.to}]]\`\n`;
  }
} else {
  md += `\n## Links rotos\n\nOK - 0 links rotos.\n`;
}

if (stats.orphan.length > 0) {
  md += `\n## Nodos huerfanos (${stats.orphan.length})\n\n> Notas con 0 wikilinks entrantes. Candidato a conectar o archivar.\n\n`;
  for (const o of stats.orphan) {
    const name = path.basename(o, '.md');
    md += `- [[${name}]]\n`;
  }
}

if (stats.dueReview.length > 0) {
  md += `\n## Vencidas para revision (${stats.dueReview.length})\n\n| Nota | review_after | Vencio hace |\n|---|---|---|\n`;
  for (const d of stats.dueReview) {
    const name = path.basename(d.file, '.md');
    const days = Math.floor((new Date(TODAY) - new Date(d.review_after)) / (1000 * 60 * 60 * 24));
    md += `| [[${name}]] | ${d.review_after} | ${days}d |\n`;
  }
} else {
  md += `\n## Vencidas para revision\n\nOK - ninguna nota vencida al ${TODAY}.\n`;
}

if (stats.noFm.length > 0 || stats.noArea.length > 0) {
  md += `\n## Notas con metadata incompleta\n\n`;
  for (const f of stats.noFm) md += `- Sin frontmatter: \`${f}\`\n`;
  for (const f of stats.noArea) md += `- Sin area: \`${f}\`\n`;
  for (const f of stats.noCreated) md += `- Sin created: \`${f}\`\n`;
  for (const f of stats.noUpdated) md += `- Sin updated: \`${f}\`\n`;
}

md += `\n---\n\n## Graph Links\n\n- [[Home]]\n- [[Mapa del Vault]]\n- [[Revision Semanal]]\n- [[MOC - Projects]] · [[MOC - Resources]] · [[MOC - AI Logs]]\n`;

// Escribir archivo: frontmatter se incluye SIEMPRE en el output
// (no depende de que el archivo preexistente tenga frontmatter)
const VAULT_HEALTH_FM = `---
type: audit
status: active
area: meta
tags:
  - audit/health
  - moc/dashboard
created: 2026-06-15
updated: ${TODAY}
review_after: 2026-07-15
---

`;
const final = VAULT_HEALTH_FM + md;
fs.writeFileSync(MD_OUT, final, 'utf-8');

// =====================================================================
  // Actualizar Home.md automaticamente con las stats reales
  // Esto elimina la desincronizacion entre Home y Vault Health
  // =====================================================================
  const HOME_PATH = path.join(VAULT, 'Home.md');
  function updateHome() {
  if (!fs.existsSync(HOME_PATH)) return;
  const homeText = fs.readFileSync(HOME_PATH, 'utf-8');
  // Solo modificar las lineas de la tabla "Estado del vault"
  // Reemplaza los valores que siguen a `| **Key** |` por el valor real
  const replacements = {
    'Notas totales': stats.total,
    'Wikilinks': stats.allLinks,
    'Links rotos': stats.brokenLinks.length,
    'Huérfanos': stats.orphan.length,
    'Sin metadata': stats.noFm.length,
    'Vencidas': stats.dueReview.length,
  };
  // Contar concept notes, MOCs, templates, bases
  const conceptCount = stats.byType['concept'] || 0;
  const mocCount = (stats.byType['moc'] || 0) + (stats.byType['folder-hub'] || 0) + (stats.byType['home'] || 0);
  const tplCount = (stats.byType['routine'] || 0) + (stats.byType['inbox'] || 0) + (stats.byType['audit'] || 0); // aproximado, los templates tienen type propio
  // Contar templates reales
  const tplFiles = fs.readdirSync(path.join(VAULT, '90-Templates'), { withFileTypes: true })
    .filter(e => e.isFile() && e.name.endsWith('.md') && e.name.startsWith('TPL-')).length;
  const baseFiles = fs.existsSync(path.join(VAULT, 'Bases'))
    ? fs.readdirSync(path.join(VAULT, 'Bases')).filter(f => f.endsWith('.base')).length
    : 0;
  replacements['Concept notes'] = conceptCount;
  replacements['MOCs / hubs'] = mocCount;
  replacements['Templates'] = tplFiles;
  replacements['Bases'] = baseFiles;

  let updated = homeText;
  for (const [key, val] of Object.entries(replacements)) {
    // match: | **Key** | <cualquier cosa> | -> reemplazar lo del medio, manteniendo formato `| val |`
    const re = new RegExp(`(\\|\\s*\\*\\*${key}\\*\\*\\s*\\|)\\s*([^|\\r\\n]+?)\\s*(\\|)`, 'm');
    updated = updated.replace(re, `$1 ${val} $3`);
  }
  // Asegurar frontmatter (si se borro por error, restaurarlo)
  if (!updated.match(/^---\r?\n/)) {
    const HOME_FM = `---
type: home
status: active
area: meta
tags:
  - moc/dashboard
  - graph/hub
created: 2026-06-15
updated: ${TODAY}
review_after: 2026-07-15
---

`;
    updated = HOME_FM + updated;
  }
  fs.writeFileSync(HOME_PATH, updated, 'utf-8');
}
updateHome();

// Tambien imprimir resumen a stdout
console.log(`[vault-health] Vault: ${VAULT}`);
console.log(`  Notas totales:    ${stats.total}`);
console.log(`  Wikilinks:        ${stats.allLinks}`);
console.log(`  Links rotos:      ${stats.brokenLinks.length}`);
console.log(`  Sin frontmatter:  ${stats.noFm.length}`);
console.log(`  Sin area:         ${stats.noArea.length}`);
console.log(`  Huerfanos:        ${stats.orphan.length}`);
console.log(`  Vencidas review:  ${stats.dueReview.length}`);
console.log(`  Reporte:          ${MD_OUT}`);
console.log(`  Home actualizado: ${HOME_PATH}`);
