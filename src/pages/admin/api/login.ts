/**
 * src/pages/admin/api/login.ts
 * POST { password }
 * - Valida rate limit (5 intentos / 15 min por IP)
 * - Verifica password contra ADMIN_PASSWORD_HASH
 * - Crea sesión HttpOnly
 * - Devuelve 204 + Set-Cookie
 */

import type { APIRoute } from 'astro';
import {
  createSession,
  isAdminEnabled,
  isAdminPasswordConfigured,
  rateLimit,
  verifyPassword,
} from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  if (!isAdminEnabled()) {
    return new Response('Not Found', { status: 404 });
  }
  if (!isAdminPasswordConfigured()) {
    return new Response('Admin is misconfigured.', { status: 503 });
  }

  // Rate limit por IP: 5 intentos cada 15 min
  const ip = clientAddress || 'unknown';
  const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many login attempts. Try again later.',
        resetAt: limit.resetAt,
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse body
  let body: { password?: string; next?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const password = body.password ?? '';
  if (typeof password !== 'string' || password.length < 8 || password.length > 200) {
    // No leak info about min length; just generic error
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stored = import.meta.env.ADMIN_PASSWORD_HASH;
  if (!verifyPassword(password, stored)) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // OK — create session
  createSession(cookies, 'admin');

  // Redirect to "next" if same-origin path, else default
  const next = body.next;
  const safeNext = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
    ? next
    : '/admin/';

  return new Response(JSON.stringify({ ok: true, next: safeNext }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};