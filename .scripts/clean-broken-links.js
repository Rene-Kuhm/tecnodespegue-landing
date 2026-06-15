// clean-broken-links.js
// Limpia links rotos del vault:
// - Reemplaza links a carpetas (00-Inbox, 20-Areas, etc.) por texto plano
// - Borra links malformados ([[...]])
// - Deja intactos los links a archivos reales (ahora con stubs)

const fs = require('fs');
const path = require('path');

const VAULT = 'F:/Tecnodespegue';

// Carpetas que NO son notas validas (solo carpetas del vault)
const FOLDER_NAMES = new Set([
    '00-Inbox', '10-Projects', '20-Areas', '30-Resources', '40-Archives', '90-Templates', '99-AI-Logs',
    'Conocimiento',
]);

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

function cleanFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    const changes = [];

    // 1. Reemplazar [[carpeta]] por texto plano (las carpetas no son notas linkeables)
    for (const folder of FOLDER_NAMES) {
        const re1 = new RegExp(`\\[\\[${folder}\\]\\]`, 'g');
        if (re1.test(content)) {
            content = content.replace(re1, folder);
            changes.push(`[[${folder}]] -> "${folder}"`);
        }
    }

    // 2. Borrar [[...]] (link malformado/vacio)
    if (content.includes('[[...]]')) {
        content = content.replace(/\[\[\.\.\.\]\]/g, '');
        changes.push('[[...]] -> (borrado)');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        return changes;
    }
    return null;
}

function main() {
    const files = listMarkdownFiles();
    let totalChanges = 0;
    for (const file of files) {
        const changes = cleanFile(file);
        if (changes) {
            console.log(`${path.relative(VAULT, file)}:`);
            for (const c of changes) {
                console.log(`  - ${c}`);
                totalChanges++;
            }
        }
    }
    console.log(`\nTotal: ${totalChanges} links limpiados`);
}

main();
