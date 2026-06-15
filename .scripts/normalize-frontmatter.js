// normalize-frontmatter.js
// Agrega frontmatter consistente a archivos que no lo tienen.
// Mapea por path a type/tags/area apropiados.

const fs = require('fs');
const path = require('path');

const VAULT = 'F:/Tecnodespegue';

// Configuracion de frontmatter por path
const FRONTMATTER_CONFIG = {
    'README.md': {
        type: 'reference',
        status: 'active',
        tags: ['reference/vault', 'doc/readme'],
        area: 'meta',
    },
    'Bienvenido.md': {
        type: 'reference',
        status: 'active',
        tags: ['reference/welcome', 'doc/intro'],
        area: 'meta',
    },
    '00-Inbox/Mapa del Vault.md': {
        type: 'moc',
        status: 'active',
        tags: ['moc/vault', 'graph/hub'],
        area: 'meta',
    },
    '10-Projects/10-Projects.md': {
        type: 'moc',
        status: 'active',
        tags: ['moc/projects', 'graph/hub'],
        area: 'projects',
    },
    '10-Projects/MOC - Projects.md': {
        type: 'moc',
        status: 'active',
        tags: ['moc/projects', 'graph/hub'],
        area: 'projects',
    },
    '10-Projects/tecnodespegue-landing.md': {
        type: 'project',
        status: 'active',
        tags: ['project/web', 'tech/astro'],
        area: 'projects',
    },
    '10-Projects/test-bridge.md': {
        type: 'project',
        status: 'archived',
        tags: ['project/test', 'archived'],
        area: 'projects',
    },
    '30-Resources/30-Resources.md': {
        type: 'moc',
        status: 'active',
        tags: ['moc/resources', 'graph/hub'],
        area: 'resources',
    },
    '30-Resources/bridge-con-ia-investigacion.md': {
        type: 'reference',
        status: 'reference',
        tags: ['reference/research', 'doc/ia'],
        area: 'resources',
    },
    '30-Resources/MOC - Resources.md': {
        type: 'moc',
        status: 'active',
        tags: ['moc/resources', 'graph/hub'],
        area: 'resources',
    },
    '30-Resources/plan-cerrar-pendientes.md': {
        type: 'reference',
        status: 'reference',
        tags: ['reference/plan', 'doc/todo'],
        area: 'resources',
    },
    '30-Resources/_property-types.md': {
        type: 'reference',
        status: 'active',
        tags: ['reference/properties', 'doc/spec'],
        area: 'resources',
    },
    '99-AI-Logs/99-AI-Logs.md': {
        type: 'folder-hub',
        status: 'active',
        tags: ['folder/ai-logs', 'graph/hub'],
        area: 'logs',
    },
    '99-AI-Logs/git-commits-audit.md': {
        type: 'audit',
        status: 'active',
        tags: ['audit/git', 'auto-generated'],
        area: 'logs',
    },
    '99-AI-Logs/MOC - AI Logs.md': {
        type: 'moc',
        status: 'active',
        tags: ['moc/ai-logs', 'graph/hub'],
        area: 'logs',
    },
};

function buildFrontmatter(config) {
    const lines = ['---'];
    lines.push(`type: ${config.type}`);
    lines.push(`status: ${config.status}`);
    lines.push(`area: ${config.area}`);
    if (config.tags && config.tags.length > 0) {
        lines.push('tags:');
        for (const t of config.tags) lines.push(`  - ${t}`);
    }
    lines.push('---');
    return lines.join('\n');
}

function processFile(relPath) {
    const fullPath = path.join(VAULT, relPath);
    const config = FRONTMATTER_CONFIG[relPath];
    if (!config) {
        console.log(`SKIP (sin config): ${relPath}`);
        return false;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.startsWith('---')) {
        console.log(`SKIP (ya tiene fm): ${relPath}`);
        return false;
    }
    const fm = buildFrontmatter(config);
    const newContent = fm + '\n\n' + content;
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`OK: ${relPath}`);
    return true;
}

function main() {
    let count = 0;
    for (const relPath of Object.keys(FRONTMATTER_CONFIG)) {
        if (processFile(relPath)) count++;
    }
    console.log(`\nTotal: ${count} archivos con frontmatter agregado`);
}

main();
