// openrouter.js
// Wrapper simple para OpenRouter API.
// Reemplaza al gemini CLI con HTTP directo. Sin TTY issues, sin quotas estrictas.
//
// Documentacion: https://openrouter.ai/docs
// Modelo default: google/gemini-2.0-flash-001 (barato y rapido)
// Override via env var OPENROUTER_MODEL

const https = require('https');

const CONFIG = {
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'google/gemini-2.5-flash-lite',
    timeoutMs: 90000,
};

function callOpenRouter(prompt, options = {}) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            reject(new Error('OPENROUTER_API_KEY no seteada. Corré load-secrets.ps1 primero.'));
            return;
        }

        const model = options.model || process.env.OPENROUTER_MODEL || CONFIG.defaultModel;
        const responseFormat = options.json ? { type: 'json_object' } : undefined;
        const maxTokens = options.maxTokens || 4096;
        const temperature = options.temperature !== undefined ? options.temperature : 0.7;

        const body = JSON.stringify({
            model,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: maxTokens,
            temperature,
            ...(responseFormat && { response_format: responseFormat }),
        });

        const url = new URL(CONFIG.endpoint);

        const reqOptions = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://github.com/insyd-ai/mavis', // requerido por OpenRouter
                'X-Title': 'Mavis Git-Obsidian Bridge', // opcional, mostrado en dashboard
                'Content-Length': Buffer.byteLength(body, 'utf8'),
            },
            timeout: CONFIG.timeoutMs,
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    let parsed;
                    try { parsed = JSON.parse(data); } catch (e) { parsed = { raw: data }; }
                    const errMsg = parsed.error?.message || `HTTP ${res.statusCode}`;
                    const err = new Error(`OpenRouter error: ${errMsg}`);
                    err.statusCode = res.statusCode;
                    err.body = parsed;
                    reject(err);
                    return;
                }
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        reject(new Error(`OpenRouter error: ${parsed.error.message}`));
                        return;
                    }
                    const content = parsed.choices?.[0]?.message?.content || '';
                    if (!content) {
                        reject(new Error(`OpenRouter devolvio respuesta vacia`));
                        return;
                    }
                    resolve({
                        content,
                        model: parsed.model,
                        usage: parsed.usage, // { prompt_tokens, completion_tokens, total_tokens }
                    });
                } catch (e) {
                    reject(new Error(`No se pudo parsear respuesta: ${e.message}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Request error: ${e.message}`));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Timeout despues de ${CONFIG.timeoutMs}ms`));
        });

        req.write(body);
        req.end();
    });
}

// Sync version (para usar desde scripts sync)
function callOpenRouterSync(prompt, options = {}) {
    const { execSync } = require('child_process');
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY no seteada. Corré load-secrets.ps1 primero.');
    }

    const model = options.model || process.env.OPENROUTER_MODEL || CONFIG.defaultModel;
    const responseFormat = options.json ? 'json_object' : undefined;

    // Crear el body como JSON escaped para el -d de curl
    const body = JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
        ...(responseFormat && { response_format: { type: responseFormat } }),
    });

    // Usar curl que esta en Windows por defecto
    const curlCmd = `curl -s -X POST "${CONFIG.endpoint}" -H "Content-Type: application/json" -H "Authorization: Bearer ${apiKey}" -H "HTTP-Referer: https://github.com/insyd-ai/mavis" -H "X-Title: Mavis Bridge" -d ${JSON.stringify(body)}`;

    try {
        const stdout = execSync(curlCmd, {
            timeout: CONFIG.timeoutMs,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        const parsed = JSON.parse(stdout);
        if (parsed.error) {
            throw new Error(`OpenRouter error: ${parsed.error.message}`);
        }
        const content = parsed.choices?.[0]?.message?.content || '';
        if (!content) {
            throw new Error('OpenRouter devolvio respuesta vacia');
        }
        return {
            content,
            model: parsed.model,
            usage: parsed.usage,
        };
    } catch (e) {
        if (e.status === 429) {
            const err = new Error(`OpenRouter quota exceeded: ${e.message}`);
            err.isQuotaError = true;
            throw err;
        }
        throw e;
    }
}

module.exports = { callOpenRouter, callOpenRouterSync, CONFIG };
