/**
 * src/pages/admin/api/categories.ts
 * GET — lista las categorías y tags existentes (para autocompletar).
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const all = await getCollection('posts');
    const categories = [...new Set(all.map(p => p.data.category))].sort();
    const tags = [...new Set(all.flatMap(p => p.data.tags ?? []))].sort();
    return new Response(JSON.stringify({ ok: true, categories, tags }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String((err as Error).message) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};