// suggest-commit.js
// Asistente de Conventional Commits powered by OpenRouter.
// Lee los cambios stageados, sugiere un mensaje siguiendo el estandar
// Conventional Commits.
//
// Uso:
//   1. git add <archivos>
//   2. node suggest-commit.js
//   3. Aceptar (s), editar (e), o rechazar
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
    maxDiffLength: 4000,
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

function buildPrompt(diff, stat) {
    return `Actua como un asistente de commits. Genera UN mensaje de commit siguiendo
Conventional Commits estricto.

Formato: <tipo>(<scope>): <descripcion corta en imperativo>

Tipos validos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
Scope: modulo afectado (auth, api, db, ui, etc.) o vacio si no aplica

Reglas:
- Descripcion en espanol, en imperativo ("agregar" no "agregado")
- Maximo 72 caracteres
- Sin punto final
- Si hay breaking change, agregar ! despues del scope (ej: feat(api)!: ...)
- SOLO devuelve UNA linea con el mensaje, nada mas

Archivos cambiados:
${stat}

Diff:
\`\`\`diff
${diff}
\`\`\``;
}

function main() {
    log('INFO', '=== suggest-commit (OpenRouter) ===');

    if (!process.env.OPENROUTER_API_KEY) {
        log('ERROR', 'OPENROUTER_API_KEY no seteada.');
        log('INFO', 'Configurala en ~/.gemini/antigravity/.env primero.');
        process.exit(1);
    }

    if (safeExec('git rev-parse --is-inside-work-tree') !== 'true') {
        log('ERROR', 'No estamos en un repo git');
        process.exit(1);
    }

    const diff = safeExec('git diff --staged');
    if (!diff || diff.trim() === '') {
        log('WARN', 'No hay cambios stageados. Hacé git add primero.');
        process.exit(1);
    }

    const stat = safeExec('git diff --staged --stat') || '';
    const truncated = diff.length > CONFIG.maxDiffLength
        ? diff.substring(0, CONFIG.maxDiffLength) + '\n...[TRUNCADO]'
        : diff;
    const prompt = buildPrompt(truncated, stat);

    log('INFO', `Modelo: ${process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001 (default)'}`);
    log('INFO', 'Generando sugerencia...');

    let result;
    try {
        result = callOpenRouterSync(prompt, { maxTokens: 200 });
    } catch (e) {
        if (e.isQuotaError) {
            log('ERROR', `OpenRouter quota: ${e.message}`);
        } else {
            log('ERROR', `OpenRouter error: ${e.message}`);
        }
        process.exit(1);
    }

    if (result.usage) {
        log('INFO', `Tokens: total=${result.usage.total_tokens}`);
    }

    // Tomar la primera linea no vacia
    let suggested = result.content
        .split('\n')
        .map(l => l.trim())
        .find(l => l.length > 0) || '';

    // Limpiar markdown/explicaciones
    suggested = suggested
        .replace(/^```.*$/gm, '')
        .replace(/^["']|["']$/g, '')
        .replace(/^\*\*.*\*\*:?\s*/gm, '')
        .trim();

    console.log('');
    console.log('='.repeat(70));
    console.log('SUGERENCIA DE OPENROUTER:');
    console.log('='.repeat(70));
    console.log(suggested);
    console.log('='.repeat(70));
    console.log('');

    const validTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];
    const isValid = validTypes.some(t =>
        suggested.toLowerCase().startsWith(t + ':') ||
        suggested.toLowerCase().startsWith(t + '(')
    );

    if (!isValid) {
        console.log('NOTA: la sugerencia no sigue Conventional Commits estricto.');
        console.log('      Vas a tener que ajustarla a mano.');
    } else {
        console.log('OK: la sugerencia sigue Conventional Commits.');
    }

    console.log('');
    console.log('Para usar:');
    console.log(`  git commit -m "${suggested}"`);
}

main();
