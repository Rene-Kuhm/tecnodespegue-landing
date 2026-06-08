/**
 * src/pages/admin/api/delete-post.ts
 * DELETE — borra un post via GitHub Contents API.
 *
 * Body: { locale: 'es'|'en', slug: string, csrfToken: string }
 *
 * GitHub requiere el SHA del archivo actual para borrarlo. Primero
 * hace GET para obtener el SHA, despues DELETE con ese SHA.
 */

import type { APIRoute } from 'astro';
import { getSessionUser } from '../../../lib/auth';
import { isGitHubConfigured } from '../../../lib/github';

export const prerender = false;

interface DeletePostBody {
  locale: 'es' | 'en';
  slug: string;
  csrfToken: string;
}

interface InstallationToken {
  token: string;
  expiresAt: number;
}

let cachedToken: InstallationToken | null = null;

async function getInstallationToken(cfg: {
  appId: string;
  installationId: string;
  privateKey: string;
}): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.token;
  }
  const { createSign } = await import('node:crypto');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = { iat: now - 30, exp: now + 600, iss: cfg.appId };
  const b64 = (s: string | Buffer) => (typeof s === 'string' ? Buffer.from(s, 'utf-8') : s)
    .toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const message = `${b64(JSON.stringify(header))}.${b64(JSON.stringify(payload))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(message);
  signer.end();
  const signature = signer.sign(cfg.privateKey);
  const jwt = `${message}.${b64(signature)}`;

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
  if (!res.ok) throw new Error(`Failed to get token (${res.status})`);
  const data = await res.json() as { token: string; expires_at: string };
  cachedToken = { token: data.token, expiresAt: new Date(data.expires_at).getTime() };
  return data.token;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = getSessionUser(cookies);
  if (!user) return jsonRes({ error: 'Unauthorized' }, 401);

  if (!isGitHubConfigured()) {
    return jsonRes({ error: 'GitHub App no configurado' }, 503);
  }

  let body: DeletePostBody;
  try { body = await request.json(); }
  catch { return jsonRes({ error: 'Invalid JSON' }, 400); }

  if (!body.locale || (body.locale !== 'es' && body.locale !== 'en')) {
    return jsonRes({ error: 'locale must be es or en' }, 400);
  }
  if (!body.slug || !/^[a-z0-9-]+$/.test(body.slug)) {
    return jsonRes({ error: 'Invalid slug' }, 400);
  }
  if (!body.csrfToken || body.csrfToken.length < 8) {
    return jsonRes({ error: 'Invalid CSRF token' }, 403);
  }

  const cfg = {
    appId: import.meta.env.GITHUB_APP_ID,
    installationId: import.meta.env.GITHUB_APP_INSTALLATION_ID,
    privateKey: import.meta.env.GITHUB_APP_PRIVATE_KEY,
    repo: import.meta.env.GITHUB_REPO,
  };
  const filePath = body.locale === 'en'
    ? `src/content/posts/en/${body.slug}.md`
    : `src/content/posts/${body.slug}.md`;
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${encodeURIComponent(filePath)}`;

  try {
    const token = await getInstallationToken(cfg);

    // 1. Obtener SHA del archivo
    const getRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'tecnodespegue-deploy',
      },
    });
    if (getRes.status === 404) {
      return jsonRes({ error: 'Post not found' }, 404);
    }
    if (!getRes.ok) {
      return jsonRes({ error: `Failed to fetch file: ${getRes.status}` }, 500);
    }
    const { sha } = await getRes.json() as { sha: string };

    // 2. Borrar el archivo
    const delRes = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'tecnodespegue-deploy',
      },
      body: JSON.stringify({
        message: `chore(blog): delete ${body.locale}/${body.slug} via admin dashboard`,
        sha,
        branch: 'main',
        committer: { name: 'TecnoDespegue Admin', email: 'admin@tecnodespegue.com' },
        author: { name: 'TecnoDespegue Admin', email: 'admin@tecnodespegue.com' },
      }),
    });

    if (!delRes.ok) {
      const errBody = await delRes.text();
      return jsonRes({ error: `Failed to delete: ${delRes.status}`, detail: errBody }, 500);
    }

    const data = await delRes.json() as { commit: { sha: string; html_url: string } };
    return jsonRes({
      ok: true,
      slug: body.slug,
      locale: body.locale,
      filePath,
      commitSha: data.commit.sha,
      commitUrl: data.commit.html_url,
      message: 'Post borrado en GitHub. Vercel va a redeployar (~1-2 min).',
    });
  } catch (err) {
    return jsonRes({ error: 'Failed to delete', detail: String((err as Error).message) }, 500);
  }
};

function jsonRes(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}