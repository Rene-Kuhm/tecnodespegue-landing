/**
 * src/lib/github.ts
 *
 * GitHub App authentication + Contents API helpers.
 *
 * Crea un JWT firmado con la private key, lo usa para obtener un
 * installation token, y con ese token hace requests a la API de GitHub
 * en nombre de la instalación.
 *
 * Documentacion: https://docs.github.com/en/apps/creating-github-apps
 * /authenticating-with-a-github-app/about-authentication-with-github-apps
 */

import { createSign, randomBytes } from 'node:crypto';

interface AppConfig {
  appId: string;
  installationId: string;
  privateKey: string;
  repo: string; // formato "owner/repo"
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export function isGitHubConfigured(): boolean {
  return Boolean(
    import.meta.env.GITHUB_APP_ID &&
    import.meta.env.GITHUB_APP_INSTALLATION_ID &&
    import.meta.env.GITHUB_APP_PRIVATE_KEY &&
    import.meta.env.GITHUB_REPO
  );
}

function getConfig(): AppConfig {
  return {
    appId: import.meta.env.GITHUB_APP_ID,
    installationId: import.meta.env.GITHUB_APP_INSTALLATION_ID,
    privateKey: import.meta.env.GITHUB_APP_PRIVATE_KEY,
    repo: import.meta.env.GITHUB_REPO,
  };
}

// --- JWT generation ---

function base64UrlEncode(buf: Buffer | string): string {
  const b = typeof buf === 'string' ? Buffer.from(buf, 'utf-8') : buf;
  return b.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Crea un JWT firmado con RS256.
 * - Validez: 10 minutos (maximo permitido por GitHub: 15)
 * - Claims: iss (app id), iat, exp
 */
function createAppJwt(privateKey: string, appId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iat: now - 30, // 30s en el pasado para compensar drift
    exp: now + 600, // 10 min
    iss: appId,
  };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const message = `${headerB64}.${payloadB64}`;

  const signer = createSign('RSA-SHA256');
  signer.update(message);
  signer.end();
  const signature = signer.sign(privateKey);
  return `${message}.${base64UrlEncode(signature)}`;
}

// --- Installation token ---

/**
 * Obtiene un installation access token. Lo cachea hasta que falte
 * 60 segundos para expirar (los tokens viven 1 hora).
 */
async function getInstallationToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.token;
  }
  const cfg = getConfig();
  const jwt = createAppJwt(cfg.privateKey, cfg.appId);
  const res = await fetch(
    `https://api.github.com/app/installations/${cfg.installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'tecnodespegue-deploy',
      },
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to get installation token (${res.status}): ${body}`);
  }
  const data = await res.json() as { token: string; expires_at: string };
  cachedToken = {
    token: data.token,
    expiresAt: new Date(data.expires_at).getTime(),
  };
  return data.token;
}

// --- Contents API ---

export interface CreateOrUpdateFileResult {
  commitSha: string;
  commitUrl: string;
  contentUrl: string;
}

export interface CommitAuthor {
  name: string;
  email: string;
}

const DEFAULT_AUTHOR: CommitAuthor = {
  name: 'TecnoDespegue Admin',
  email: 'admin@tecnodespegue.com',
};

/**
 * Crea o actualiza un archivo en el repo via Contents API.
 * Si el archivo ya existe, primero obtiene su SHA y luego lo actualiza.
 */
export async function createOrUpdateFile(
  path: string,
  content: string,
  commitMessage: string,
  author: CommitAuthor = DEFAULT_AUTHOR
): Promise<CreateOrUpdateFileResult> {
  const cfg = getConfig();
  const token = await getInstallationToken();
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${encodeURIComponent(path)}`;

  // 1. Verificar si el archivo ya existe (necesitamos el SHA para update)
  let existingSha: string | undefined;
  const getRes = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tecnodespegue-deploy',
    },
  });
  if (getRes.ok) {
    const existing = await getRes.json() as { sha: string };
    existingSha = existing.sha;
  } else if (getRes.status !== 404) {
    const body = await getRes.text();
    throw new Error(`Failed to check existing file (${getRes.status}): ${body}`);
  }

  // 2. Crear o actualizar
  const body: Record<string, unknown> = {
    message: commitMessage,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch: 'main',
    committer: author,
    author,
  };
  if (existingSha) body.sha = existingSha;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'tecnodespegue-deploy',
    },
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const errBody = await putRes.text();
    throw new Error(`Failed to create/update file (${putRes.status}): ${errBody}`);
  }

  const data = await putRes.json() as {
    commit: { sha: string; html_url: string };
    content: { html_url: string };
  };
  return {
    commitSha: data.commit.sha,
    commitUrl: data.commit.html_url,
    contentUrl: data.content.html_url,
  };
}

/**
 * Verifica que la integración funcione (usado para /admin/api/_test-github).
 */
export async function testConnection(): Promise<{
  ok: boolean;
  repo: string;
  app: string;
  installation: string;
  error?: string;
}> {
  try {
    const cfg = getConfig();
    const token = await getInstallationToken();
    const res = await fetch(`https://api.github.com/repos/${cfg.repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'tecnodespegue-deploy',
      },
    });
    if (!res.ok) {
      return { ok: false, repo: cfg.repo, app: cfg.appId, installation: cfg.installationId, error: `Repo fetch failed: ${res.status}` };
    }
    return { ok: true, repo: cfg.repo, app: cfg.appId, installation: cfg.installationId };
  } catch (err) {
    return { ok: false, repo: '', app: '', installation: '', error: String((err as Error).message) };
  }
}