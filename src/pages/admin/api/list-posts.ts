/**
 * src/pages/admin/api/list-posts.ts
 * GET — lista todos los posts (ES + EN) ordenados por fecha.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const all = await getCollection('posts');
    const sorted = all
      .map(p => ({
        id: p.id,
        slug: p.id.replace(/^en\//, ''),
        locale: (p.data.locale ?? 'es') as 'es' | 'en',
        title: p.data.title,
        description: p.data.description,
        date: p.data.date,
        category: p.data.category,
        tags: p.data.tags ?? [],
        draft: p.data.draft ?? false,
        featured: p.data.featured ?? false,
        author: p.data.author,
      }))
      .sort((a, b) => b.date.valueOf() - a.date.valueOf());
    return new Response(JSON.stringify({ ok: true, posts: sorted }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String((err as Error).message) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};