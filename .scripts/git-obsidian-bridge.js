// git-obsidian-bridge.js
// v5.0 - Auditor silencioso + analizador IA con OpenRouter
//
// Comportamiento:
// - SIEMPRE: auditor silencioso (~120ms, registra commit en audit file)
// - SI AGY_AUDIT=1 antes de git commit: ademas dispara analizador IA
//   via OpenRouter (~5-15s, escribe analysis-XXXXX.md en vault)
//
// Credenciales: lee OPENROUTER_API_KEY de ~/.gemini/antigravity/.env
//
// El commit NUNCA se rompe por culpa del bridge:
// - Si el auditor falla: warning pero exit 0
// - Si el analizador falla: warning pero exit 0

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { callOpenRouterSync } = require('./openrouter.js');

// ============================================
// CARGAR SECRETS DESDE .env
// ============================================
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

// ============================================
// CONFIGURACION
// ============================================
const CONFIG = {
    vaultPath: 'F:/Tecnodespegue',
    aiLogsFolder: '99-AI-Logs',
    auditFileName: 'git-commits-audit.md',
    maxDiffLength: 3000,
    iaMaxDiffLength: 3000,
};

const IA_ENABLED = process.env.AGY_AUDIT === '1';
const HAS_API_KEY = !!process.env.OPENROUTER_API_KEY;

// ============================================
// UTILIDADES
// ============================================
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

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function isInGitRepo() {
    return safeExec('git rev-parse --is-inside-work-tree') === 'true';
}

function getHeader() {
    return `---
type: audit
status: active
area: logs
tags:
  - audit/git
  - audit/commits
created: 2026-06-15
updated: 2026-06-15
review_after: 2027-06-15
---

# Auditoria de Commits

> Registro automatico de todos los commits en esta maquina.
> Generado por Git-Obsidian Bridge v5.0 (auditor + OpenRouter opcional)
> Activar analisis IA: \`$env:AGY_AUDIT = "1"\` antes de \`git commit\`

---

`;
}

// ============================================
// AUDITOR SILENCIOSO
// ============================================
function runSilentAudit(commitData) {
    const { commitHash, commitMsg, author, date, repoName, diff } = commitData;

    const safeCommitMsg = commitMsg.replace(/\|/g, '\\|');
    const safeRepoName = repoName.replace(/\|/g, '\\|');

    const entry = `
## ${safeCommitMsg.split('\n')[0].substring(0, 80)}

| Campo | Valor |
| --- | --- |
| Repo | \`${safeRepoName}\` |
| Commit | \`${commitHash.substring(0, 7)}\` |
| Autor | ${author} |
| Fecha | ${date} |

<details>
<summary>Ver diff completo</summary>

\`\`\`diff
${diff}
\`\`\`

</details>

---

`;

    const aiLogsDir = path.join(CONFIG.vaultPath, CONFIG.aiLogsFolder);
    ensureDir(aiLogsDir);
    const auditFilePath = path.join(aiLogsDir, CONFIG.auditFileName);

    if (!fs.existsSync(auditFilePath)) {
        fs.writeFileSync(auditFilePath, getHeader(), 'utf8');
    }

    try {
        fs.appendFileSync(auditFilePath, entry, 'utf8');
        log('OK', `Auditor: ${commitHash.substring(0, 7)} registrado`);
        return true;
    } catch (e) {
        log('ERROR', `Auditor fallo: ${e.message}`);
        return false;
    }
}

// ============================================
// ANALIZADOR IA (OpenRouter)
// ============================================
function buildIAPrompt(commitData) {
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
- Diff (max ${CONFIG.iaMaxDiffLength} chars):
${diff}

IMPORTANTE: SOLO JSON valido, sin markdown, sin explicaciones fuera del JSON.`;
}

function runIAAnalysis(commitData) {
    if (!HAS_API_KEY) {
        log('WARN', 'AGY_AUDIT=1 pero no hay OPENROUTER_API_KEY. Carga load-secrets.ps1 primero.');
        return false;
    }

    log('INFO', 'AGY_AUDIT=1 detectado, disparando analizador IA via OpenRouter...');
    log('INFO', `Modelo: ${process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001 (default)'}`);

    const prompt = buildIAPrompt(commitData);

    let result;
    try {
        result = callOpenRouterSync(prompt, { json: true, maxTokens: 4096 });
    } catch (e) {
        if (e.isQuotaError) {
            log('WARN', `OpenRouter quota exceeded: ${e.message} (commit sigue OK)`);
        } else {
            log('WARN', `OpenRouter error: ${e.message} (commit sigue OK)`);
        }
        return false;
    }

    if (result.usage) {
        log('INFO', `Tokens usados: input=${result.usage.prompt_tokens} output=${result.usage.completion_tokens} total=${result.usage.total_tokens}`);
    }

    let parsed;
    try {
        const content = result.content.trim()
            .replace(/^```json\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
        parsed = JSON.parse(content);
    } catch (e) {
        log('WARN', `No se pudo parsear JSON: ${e.message} (commit sigue OK)`);
        return false;
    }

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

    const md =
        `${yaml}\n\n` +
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

    const fileName = `analysis-${commitData.commitHash.substring(0, 7)}.md`;
    const filePath = path.join(CONFIG.vaultPath, CONFIG.aiLogsFolder, fileName);

    try {
        fs.writeFileSync(filePath, md, 'utf8');
        log('OK', `Analisis IA: ${filePath}`);
        return true;
    } catch (e) {
        log('WARN', `No se pudo escribir analisis: ${e.message}`);
        return false;
    }
}

// ============================================
// MAIN
// ============================================
function main() {
    log('INFO', '=== Git-Obsidian Bridge v5.0 (OpenRouter) ===');
    log('INFO', `Modo IA: ${IA_ENABLED ? 'ACTIVADO (AGY_AUDIT=1)' : 'desactivado'}`);
    log('INFO', `OpenRouter API key: ${HAS_API_KEY ? 'cargada' : 'NO (carga load-secrets.ps1)'}`);

    if (!isInGitRepo()) {
        log('WARN', 'No estamos en un repo git. Abortando.');
        process.exit(0);
    }

    const commitHash = safeExec('git rev-parse HEAD');
    if (!commitHash) {
        log('ERROR', 'No se pudo leer HEAD. Abortando.');
        process.exit(1);
    }

    const commitMsg = safeExec('git log -1 --pretty=%B') || '(sin mensaje)';
    const author = safeExec('git log -1 --pretty=%an') || '(desconocido)';
    const date = safeExec('git log -1 --pretty=%ci') || new Date().toISOString();
    const repoName = path.basename(process.cwd());

    let diff = safeExec('git diff HEAD~1 HEAD');
    if (!diff) {
        diff = '_(No hay diff disponible: primer commit, merge commit, o error de lectura)_';
    } else if (diff.length > CONFIG.maxDiffLength) {
        diff = diff.substring(0, CONFIG.maxDiffLength) + '\n... [DIFF TRUNCADO a ' + CONFIG.maxDiffLength + ' chars]';
    }

    const commitData = { commitHash, commitMsg, author, date, repoName, diff };

    const auditOk = runSilentAudit(commitData);

    if (IA_ENABLED) {
        runIAAnalysis(commitData);
    }

    if (!auditOk) {
        log('WARN', 'Auditor fallo, pero saliendo con exit 0 para no romper commit');
    }
    process.exit(0);
}

main();
