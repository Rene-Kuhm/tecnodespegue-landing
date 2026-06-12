import type { APIRoute } from 'astro';

/**
 * /api/github-stars?repo=owner/name
 *
 * Devuelve { stars: number, fetchedAt: ISO } para el repo indicado.
 * Cacheado en el edge de Vercel por 1h (s-maxage=3600, stale-while-revalidate=86400)
 * para soportar el rate-limit de la API pública de GitHub (60 req/h por IP sin auth)
 * sin necesidad de un Personal Access Token.
 *
 * Si GitHub responde 403/429 (rate-limited) y tenemos un valor cacheado reciente en
 * memoria, lo servimos como "stale" para no romper la UI del visitante.
 */

export const prerender = false;

interface CacheEntry {
  stars: number;
  fullName: string;
  expiresAt: number;
  fetchedAt: string;
}

// Cache in-memory por instancia serverless.
// En Vercel cada region tiene su propia instancia, así que la cache es
// efectivamente per-warm-instance. Combinado con s-maxage de CDN, las llamadas
// a GitHub quedan en 1-2 por hora POR region, no por visitante.
const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

const REPO_DEFAULT = 'Rene-Kuhm/Gestor-de-Contrase-as';
// Whitelist: solo permitimos consultar repos de nuestra org/usuario para
// evitar que cualquiera nos use como proxy abierto de GitHub.
const ALLOWED_REPOS = new Set<string>([
  'Rene-Kuhm/Gestor-de-Contrase-as',
  'Rene-Kuhm/tecnodespegue-landing',
  'Rene-Kuhm/tecnodespegue',
]);

const GITHUB_API = 'https://api.github.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const GET: APIRoute = async ({ url }) => {
  const repo = url.searchParams.get('repo')?.trim() || REPO_DEFAULT;

  if (!ALLOWED_REPOS.has(repo)) {
    return jsonResponse({ error: 'Repository not allowed' }, 400);
  }

  // 1) Sirvo cache fresca si está vigente.
  const now = Date.now();
  const cached = memoryCache.get(repo);
  if (cached && cached.expiresAt > now) {
    return jsonResponse(
      {
        stars: cached.stars,
        fullName: cached.fullName,
        fetchedAt: cached.fetchedAt,
        cached: true,
      },
      200,
      // s-maxage: cache de CDN. stale-while-revalidate: sirve viejo mientras
      // refetch en background, así el visitante nunca espera al upstream.
      { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
    );
  }

  // 2) Pido a GitHub.
  try {
    const ghRes = await fetch(`${GITHUB_API}/repos/${repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'tecnodespegue-landing',
        // Sin token: respeta el rate limit anónimo (60/h/IP) que GitHub
        // aplica por origen. Con cache de 1h esto es ~24 req/día, holgado.
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!ghRes.ok) {
      // 403/429 (rate-limited) o 5xx → fallback a cache aunque esté vencido.
      if (cached) {
        return jsonResponse(
          {
            stars: cached.stars,
            fullName: cached.fullName,
            fetchedAt: cached.fetchedAt,
            cached: true,
            stale: true,
          },
          200,
          { 'Cache-Control': 'public, s-maxage=60' }
        );
      }
      return jsonResponse({ error: `GitHub responded ${ghRes.status}` }, 502);
    }

    const data = (await ghRes.json()) as { stargazers_count?: number; full_name?: string };
    const stars = typeof data.stargazers_count === 'number' ? data.stargazers_count : 0;
    const fullName = typeof data.full_name === 'string' ? data.full_name : repo;
    const fetchedAt = new Date().toISOString();

    memoryCache.set(repo, {
      stars,
      fullName,
      expiresAt: now + CACHE_TTL_MS,
      fetchedAt,
    });

    return jsonResponse(
      { stars, fullName, fetchedAt, cached: false },
      200,
      { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
    );
  } catch (err) {
    if (cached) {
      return jsonResponse(
        {
          stars: cached.stars,
          fullName: cached.fullName,
          fetchedAt: cached.fetchedAt,
          cached: true,
          stale: true,
        },
        200,
        { 'Cache-Control': 'public, s-maxage=60' }
      );
    }
    return jsonResponse({ error: 'Upstream fetch failed' }, 502);
  }
};

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}
