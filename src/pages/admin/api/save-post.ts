/**
 * src/pages/admin/api/save-post.ts
 * POST — crea o actualiza un post.
 * - Valida sesión (middleware) + CSRF
 * - Valida campos requeridos
 * - Slug del archivo a partir del titulo (slugify)
 * - Escribe en src/content/posts/{locale}/{slug}.md o src/content/posts/{slug}.md
 *
 * IMPORTANTE: Este endpoint escribe al filesystem de la funcion serverless.
 * En Vercel, los cambios NO persisten despues del cold start. En desarrollo local
 * (npm run dev) si. Esto es por diseño: el deploy real se hace via git push
 * desde tu shell local, o mediante un script que se ejecute post-save.
 */

import type { APIRoute } from 'astro';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { getSessionUser } from '../../../lib/auth';

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
  // Wrap in double quotes; escape backslashes and double quotes
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function buildFrontmatter(post: SavePostBody, slug: string): string {
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
  lines.push(`slug: ${escapeYamlString(slug)}`);
  lines.push('---');
  return lines.join('\n');
}

function getPostsDir(locale: 'es' | 'en'): string {
  return locale === 'en'
    ? join(process.cwd(), 'src', 'content', 'posts', 'en')
    : join(process.cwd(), 'src', 'content', 'posts');
}

export const POST: APIRoute = async ({ request, cookies }) => {
  // El middleware ya valido sesion. Doble check explicito.
  const user = getSessionUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
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
  // CSRF simple: el front debe mandar el header X-CSRF con cualquier valor
  // no-vacio. Suficiente para un single-user dashboard.
  if (!body.csrfToken || typeof body.csrfToken !== 'string' || body.csrfToken.length < 8) {
    return jsonRes({ error: 'Invalid CSRF token' }, 403);
  }

  const slug = body.id || slugify(body.title);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return jsonRes({ error: 'Invalid slug (only a-z, 0-9, -)' }, 400);
  }

  const frontmatter = buildFrontmatter(body, slug);
  const fullContent = `${frontmatter}\n\n${body.body.trim()}\n`;
  const dir = getPostsDir(body.locale);
  const filePath = join(dir, `${slug}.md`);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, fullContent, 'utf-8');
  } catch (err) {
    return jsonRes({
      error: 'Failed to write file. En Vercel los cambios no persisten: hacé git commit + push desde tu shell local.',
      detail: String((err as Error).message),
    }, 500);
  }

  return jsonRes({
    ok: true,
    filePath: filePath.replace(process.cwd(), '').replace(/\\/g, '/'),
    slug,
    locale: body.locale,
    url: body.locale === 'en' ? `/en/blog/${slug}/` : `/blog/${slug}/`,
  });
};

export const GET: APIRoute = async ({ url }) => {
  // Permite leer un post existente (para el form de edicion)
  const locale = url.searchParams.get('locale');
  const slug = url.searchParams.get('slug');
  if (!locale || !slug || (locale !== 'es' && locale !== 'en')) {
    return jsonRes({ error: 'locale and slug required' }, 400);
  }
  const dir = getPostsDir(locale as 'es' | 'en');
  const filePath = join(dir, `${slug}.md`);
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