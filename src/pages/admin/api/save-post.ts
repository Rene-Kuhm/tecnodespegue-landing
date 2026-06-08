/**
 * src/pages/admin/api/save-post.ts
 * POST — crea o actualiza un post en GitHub via Contents API.
 *
 * Flujo:
 * 1. Valida sesion (middleware) + CSRF
 * 2. Valida campos
 * 3. Slug del archivo a partir del titulo (slugify)
 * 4. Llama a GitHub Contents API con el archivo generado
 * 5. Devuelve URL del commit para que el usuario pueda verificar
 *
 * El commit dispara un redeploy automatico de Vercel (porque esta en main).
 */

import type { APIRoute } from 'astro';
import { getSessionUser } from '../../../lib/auth';
import { createOrUpdateFile, isGitHubConfigured } from '../../../lib/github';

export const prerender = false;

interface SavePostBody {
  id?: string;          // ID del post al editar (sin extension)
  locale: 'es' | 'en';
  title: string;
  description: string;
  date: string;          // ISO YYYY-MM-DD
  author?: string;
  category: string;
  tags: string[];
  readTime?: number;
  featured?: boolean;
  draft?: boolean;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  body: string;          // Markdown body
  csrfToken: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function escapeYamlString(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function buildFrontmatter(post: SavePostBody): string {
  const lines: string[] = ['---'];
  lines.push(`title: ${escapeYamlString(post.title)}`);
  lines.push(`description: ${escapeYamlString(post.description)}`);
  lines.push(`date: ${post.date}`);
  if (post.author) lines.push(`author: ${escapeYamlString(post.author)}`);
  else lines.push(`author: "René Kuhm"`);
  lines.push(`category: ${escapeYamlString(post.category)}`);
  const tags = post.tags.length > 0 ? post.tags : [];
  lines.push(`tags: [${tags.map(t => escapeYamlString(t)).join(', ')}]`);
  if (post.readTime) lines.push(`readTime: ${post.readTime}`);
  if (post.featured) lines.push(`featured: true`);
  if (post.draft) lines.push(`draft: true`);
  if (post.image) lines.push(`image: ${escapeYamlString(post.image)}`);
  lines.push(`locale: ${post.locale}`);
  if (post.seoTitle || post.seoDescription) {
    lines.push(`seo:`);
    if (post.seoTitle) lines.push(`  title: ${escapeYamlString(post.seoTitle)}`);
    if (post.seoDescription) lines.push(`  description: ${escapeYamlString(post.seoDescription)}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function getFilePath(locale: 'es' | 'en', slug: string): string {
  return locale === 'en'
    ? `src/content/posts/en/${slug}.md`
    : `src/content/posts/${slug}.md`;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  // El middleware ya valido sesion. Doble check explicito.
  const user = getSessionUser(cookies);
  if (!user) {
    return jsonRes({ error: 'Unauthorized' }, 401);
  }

  if (!isGitHubConfigured()) {
    return jsonRes({
      error: 'GitHub App no configurado. Ver ADMIN_GITHUB_* env vars.',
    }, 503);
  }

  let body: SavePostBody;
  try {
    body = await request.json();
  } catch {
    return jsonRes({ error: 'Invalid JSON body' }, 400);
  }

  // Validar
  if (!body.locale || (body.locale !== 'es' && body.locale !== 'en')) {
    return jsonRes({ error: 'locale must be "es" or "en"' }, 400);
  }
  if (!body.title || body.title.length < 4 || body.title.length > 100) {
    return jsonRes({ error: 'title must be 4-100 chars' }, 400);
  }
  if (!body.description || body.description.length < 20 || body.description.length > 200) {
    return jsonRes({ error: 'description must be 20-200 chars' }, 400);
  }
  if (!body.category) {
    return jsonRes({ error: 'category is required' }, 400);
  }
  if (!body.body || body.body.length < 50) {
    return jsonRes({ error: 'body must be at least 50 chars' }, 400);
  }
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return jsonRes({ error: 'date must be YYYY-MM-DD' }, 400);
  }
  if (!body.csrfToken || typeof body.csrfToken !== 'string' || body.csrfToken.length < 8) {
    return jsonRes({ error: 'Invalid CSRF token' }, 403);
  }

  const slug = body.id || slugify(body.title);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return jsonRes({ error: 'Invalid slug (only a-z, 0-9, -)' }, 400);
  }

  const isUpdate = !!body.id;
  const frontmatter = buildFrontmatter(body);
  const fullContent = `${frontmatter}\n\n${body.body.trim()}\n`;
  const filePath = getFilePath(body.locale, slug);
  const commitMessage = isUpdate
    ? `chore(blog): update ${body.locale}/${slug}`
    : `feat(blog): add ${body.locale}/${slug} via admin dashboard`;

  try {
    const result = await createOrUpdateFile(filePath, fullContent, commitMessage);
    return jsonRes({
      ok: true,
      slug,
      locale: body.locale,
      filePath,
      url: body.locale === 'en' ? `/en/blog/${slug}/` : `/blog/${slug}/`,
      commitSha: result.commitSha,
      commitUrl: result.commitUrl,
      contentUrl: result.contentUrl,
      message: 'Post guardado en GitHub. Vercel va a redeployar automaticamente (~1-2 min).',
    });
  } catch (err) {
    // Log interno para debug, pero no exponer al cliente
    console.error('save-post error:', err);
    return jsonRes({
      error: 'Failed to save to GitHub. Check server logs.',
    }, 500);
  }
};

export const GET: APIRoute = async ({ url }) => {
  // Permite leer un post existente (para el form de edicion).
  // Lee directo del filesystem (disponible en SSR; la lista principal
  // usa getCollection de Astro content, pero para editar necesitamos
  // el archivo raw para separar frontmatter del body).
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const locale = url.searchParams.get('locale');
  const slug = url.searchParams.get('slug');
  if (!locale || !slug || (locale !== 'es' && locale !== 'en')) {
    return jsonRes({ error: 'locale and slug required' }, 400);
  }
  const dir = locale === 'en' ? 'src/content/posts/en' : 'src/content/posts';
  const filePath = join(process.cwd(), dir, `${slug}.md`);
  try {
    const content = await readFile(filePath, 'utf-8');
    return new Response(JSON.stringify({ ok: true, content }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return jsonRes({ error: 'Not found' }, 404);
  }
};

function jsonRes(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}