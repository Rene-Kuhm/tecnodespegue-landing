/**
 * src/pages/admin/api/_debug.ts
 * TEMPORARY — endpoint que devuelve el estado de las env vars.
 * Solo activo si ADMIN_ENABLED=true.
 * BORRAR DESPUÉS de debuggear.
 */

import type { APIRoute } from 'astro';
import { isAdminEnabled } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async () => {
  if (!isAdminEnabled()) {
    return new Response('Admin disabled', { status: 404 });
  }
  const stored = import.meta.env.ADMIN_PASSWORD_HASH;
  const secret = import.meta.env.ADMIN_SESSION_SECRET;
  return new Response(JSON.stringify({
    enabled: isAdminEnabled(),
    passwordHash: {
      exists: Boolean(stored),
      length: stored?.length ?? 0,
      hasColon: stored?.includes(':') ?? false,
      prefix: stored ? String(stored).slice(0, 6) : null,
      suffix: stored ? String(stored).slice(-6) : null,
      full: stored ?? null, // comentar esta linea despues
    },
    sessionSecret: {
      exists: Boolean(secret),
      length: secret?.length ?? 0,
    },
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};