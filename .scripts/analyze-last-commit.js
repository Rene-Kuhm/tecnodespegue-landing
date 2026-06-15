// analyze-last-commit.js
// Analiza el ULTIMO commit con OpenRouter y escribe analysis-XXXXX.md
// Uso: cd a un repo y corré `node /path/to/analyze-last-commit.js`
//
// Credenciales: lee OPENROUTER_API_KEY de ~/.gemini/antigravity/.env

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { callOpenRouterSync } = require('./openrouter.js');

// Cargar .env si existe
function loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.substring(0, eq).trim();
        const value = trimmed.substring(eq + 1).trim();
        if (value.includes('...') || value === '') continue;
        if (!process.env[key]) process.env[key] = value;
    }
}

const envPaths = [
    path.join(os.homedir(), '.gemini', 'antigravity', '.env'),
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '..', '..', 'antigravity', '.env'),
];
for (const p of envPaths) {
    if (fs.existsSync(p)) {
        loadEnvFile(p);
        break;
    }
}

const CONFIG = {
    vaultPath: 'F:/Tecnodespegue',
    aiLogsFolder: '99-AI-Logs',
    maxDiffLength: 3000,
};

function log(level, message) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [${level}] ${message}`);
}

function safeExec(cmd) {
    try {
        return execSync(cmd, {
            stdio: ['ignore', 'pipe', 'pipe'],
            encoding: 'utf8',
            cwd: process.cwd(),
        }).toString().trim();
    } catch (e) {
        return null;
    }
}

function buildPrompt(commitData) {
    const { commitHash, commitMsg, author, date, repoName, diff } = commitData;
    return `Actua como un Arquitecto de Software Senior. Analiza este commit de git.
Devolveme UNICAMENTE un JSON valido con esta estructura:
{
  "frontmatter": {
    "type": "ai-commit-analysis",
    "status": "completed",
    "repo": "${repoName}",
    "hash": "${commitHash.substring(0, 7)}",
    "tags": ["ai/analysis", "git/commit"],
    "date": "${new Date().toISOString().split('T')[0]}"
  },
  "title": "Analisis del commit ${commitHash.substring(0, 7)}",
  "resumen": "2-3 lineas explicando el proposito del cambio",
  "impacto": ["bullet 1", "bullet 2"],
  "deuda": ["item 1", "item 2"] o [],
  "sugerencias": ["item 1", "item 2"] o []
}

Datos del commit:
- Mensaje: ${commitMsg}
- Autor: ${author}
- Fecha: ${date}
- Diff (max ${CONFIG.maxDiffLength} chars):
${diff}

IMPORTANTE: SOLO JSON valido, sin markdown, sin explicaciones fuera del JSON.`;
}

function buildMarkdown(parsed, commitHash) {
    const fm = parsed.frontmatter || {};
    const yamlLines = ['---'];
    for (const [key, value] of Object.entries(fm)) {
        if (Array.isArray(value)) {
            yamlLines.push(`${key}:`);
            for (const item of value) yamlLines.push(`  - ${item}`);
        } else {
            yamlLines.push(`${key}: "${String(value).replace(/"/g, '\\"')}"`);
        }
    }
    yamlLines.push('---');
    const yaml = yamlLines.join('\n');

    return `${yaml}\n\n` +
        `# ${parsed.title || 'Analisis de Commit'}\n\n` +
        `## Resumen Ejecutivo\n\n${parsed.resumen || '(sin resumen)'}\n\n` +
        `## Impacto Arquitectonico\n\n` +
        (parsed.impacto && parsed.impacto.length
            ? parsed.impacto.map(s => `- ${s}`).join('\n') + '\n\n'
            : '_(sin items)_\n\n') +
        `## Deuda Tecnica / Riesgos\n\n` +
        (parsed.deuda && parsed.deuda.length
            ? parsed.deuda.map(s => `- ${s}`).join('\n') + '\n\n'
            : 'Ninguno detectado.\n\n') +
        `## Sugerencias\n\n` +
        (parsed.sugerencias && parsed.sugerencias.length
            ? parsed.sugerencias.map(s => `- ${s}`).join('\n') + '\n'
            : '_(sin items)_\n');
}

function main() {
    log('INFO', '=== analyze-last-commit (OpenRouter) ===');

    if (!process.env.OPENROUTER_API_KEY) {
        log('ERROR', 'OPENROUTER_API_KEY no seteada.');
        log('INFO', 'Para configurarla:');
        log('INFO', '  1. Crear cuenta en https://openrouter.ai');
        log('INFO', '  2. Generar API key');
        log('INFO', '  3. Agregar a ~/.gemini/antigravity/.env:');
        log('INFO', '     OPENROUTER_API_KEY=sk-or-...');
        log('INFO', '  4. Correr load-secrets.ps1');
        process.exit(1);
    }

    if (safeExec('git rev-parse --is-inside-work-tree') !== 'true') {
        log('ERROR', 'No estamos en un repo git');
        process.exit(1);
    }

    const commitHash = safeExec('git rev-parse HEAD');
    if (!commitHash) {
        log('ERROR', 'No se pudo leer HEAD');
        process.exit(1);
    }

    const commitMsg = safeExec('git log -1 --pretty=%B') || '(sin mensaje)';
    const author = safeExec('git log -1 --pretty=%an') || '(desconocido)';
    const date = safeExec('git log -1 --pretty=%ci') || new Date().toISOString();
    const repoName = path.basename(process.cwd());

    let diff = safeExec('git diff HEAD~1 HEAD');
    if (!diff) {
        diff = '(sin diff: primer commit o merge)';
    } else if (diff.length > CONFIG.maxDiffLength) {
        diff = diff.substring(0, CONFIG.maxDiffLength) + '\n... [TRUNCADO]';
    }

    const commitData = { commitHash, commitMsg, author, date, repoName, diff };
    const prompt = buildPrompt(commitData);

    log('INFO', `Repo: ${repoName} | Commit: ${commitHash.substring(0, 7)}`);
    log('INFO', `Modelo: ${process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001 (default)'}`);
    log('INFO', 'Llamando a OpenRouter...');

    let result;
    try {
        result = callOpenRouterSync(prompt, { json: true, maxTokens: 4096 });
    } catch (e) {
        if (e.isQuotaError) {
            log('WARN', `OpenRouter quota exceeded: ${e.message}`);
        } else {
            log('ERROR', `OpenRouter error: ${e.message}`);
        }
        process.exit(1);
    }

    if (result.usage) {
        log('INFO', `Tokens: input=${result.usage.prompt_tokens} output=${result.usage.completion_tokens} total=${result.usage.total_tokens}`);
    }

    // Parsear JSON (puede venir con markdown fence)
    let parsed;
    try {
        const content = result.content.trim();
        // Sacar markdown code fence si esta
        const jsonStr = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        parsed = JSON.parse(jsonStr);
    } catch (e) {
        log('ERROR', `No se pudo parsear JSON: ${e.message}`);
        log('ERROR', `Raw content: ${result.content.substring(0, 500)}`);
        process.exit(1);
    }

    const md = buildMarkdown(parsed, commitHash);
    const fileName = `analysis-${commitHash.substring(0, 7)}.md`;
    const filePath = path.join(CONFIG.vaultPath, CONFIG.aiLogsFolder, fileName);

    try {
        fs.writeFileSync(filePath, md, 'utf8');
        log('OK', `Analisis guardado en: ${filePath}`);
        process.exit(0);
    } catch (e) {
        log('ERROR', `No se pudo escribir archivo: ${e.message}`);
        process.exit(1);
    }
}

main();
