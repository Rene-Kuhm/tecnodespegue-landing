/**
 * src/pages/admin/api/logout.ts
 * POST — destruye la sesión.
 */

import type { APIRoute } from 'astro';
import { destroySession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  destroySession(cookies);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};