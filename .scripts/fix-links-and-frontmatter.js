// fix-links-and-frontmatter.js
// Encuentra links rotos y limpia frontmatter inconsistente
// No usa IA, solo procesamiento de texto

const fs = require('fs');
const path = require('path');
const os = require('os');

const VAULT = 'F:/Tecnodespegue';

function listMarkdownFiles() {
    const out = [];
    function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
            const full = path.join(dir, e.name);
            if (e.name === '.obsidian' || e.name.startsWith('.')) continue;
            if (e.isDirectory()) walk(full);
            else if (e.name.endsWith('.md')) out.push(full);
        }
    }
    walk(VAULT);
    return out;
}

function extractNoteName(filePath) {
    return path.basename(filePath, '.md');
}

function extractLinks(content) {
    const links = [];
    const re = /\[\[([^\]\|]+)(?:\|[^\]]+)?\]\]/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        links.push(m[1].trim());
    }
    return links;
}

function extractFrontmatter(content) {
    const m = content.match(/^---\n([\s\S]*?)\n---/);
    if (!m) return null;
    const fm = {};
    const lines = m[1].split('\n');
    let currentKey = null;
    let currentArray = null;
    for (const line of lines) {
        if (line.startsWith('  - ')) {
            if (currentArray) currentArray.push(line.substring(4).trim());
            continue;
        }
        const kv = line.match(/^(\w+):\s*(.*)$/);
        if (kv) {
            currentKey = kv[1];
            const val = kv[2].trim();
            if (val === '') {
                currentArray = [];
                fm[currentKey] = currentArray;
            } else {
                fm[currentKey] = val.replace(/^["']|["']$/g, '');
                currentArray = null;
            }
        }
    }
    return fm;
}

function main() {
    const files = listMarkdownFiles();
    const fileNames = new Set(files.map(extractNoteName));
    fileNames.add('index'); // alias comun

    // Encontrar links rotos
    const brokenLinks = [];
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const links = extractLinks(content);
        for (const link of links) {
            if (!fileNames.has(link)) {
                brokenLinks.push({ from: file, link });
            }
        }
    }

    // Encontrar archivos sin frontmatter
    const noFrontmatter = [];
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        if (!content.startsWith('---')) {
            noFrontmatter.push(file);
        }
    }

    console.log('=== Links rotos ===');
    const brokenByTarget = {};
    for (const b of brokenLinks) {
        if (!brokenByTarget[b.link]) brokenByTarget[b.link] = [];
        brokenByTarget[b.link].push(b.from);
    }
    for (const [target, sources] of Object.entries(brokenByTarget)) {
        console.log(`[[${target}]] - ${sources.length} referencias`);
        for (const s of sources.slice(0, 3)) {
            console.log(`  - ${path.relative(VAULT, s)}`);
        }
        if (sources.length > 3) console.log(`  - ... y ${sources.length - 3} mas`);
    }

    console.log(`\nTotal: ${brokenLinks.length} links rotos a ${Object.keys(brokenByTarget).length} targets`);

    console.log('\n=== Archivos sin frontmatter ===');
    for (const f of noFrontmatter) {
        console.log(`- ${path.relative(VAULT, f)}`);
    }
    console.log(`\nTotal: ${noFrontmatter.length} archivos sin frontmatter`);
}

main();
