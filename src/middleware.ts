/**
 * src/middleware.ts
 *
 * Middleware Astro que protege /admin/*.
 * - Si ADMIN_ENABLED no es 'true', /admin/* da 404 (route no existe).
 * - Si está habilitado, requiere cookie de sesión válida.
 * - El form de login es público (/admin/login).
 *
 * Esto corre en el edge, antes que cualquier handler de página.
 */

import { defineMiddleware } from 'astro:middleware';
import { getSessionUser, isAdminEnabled, isAdminPasswordConfigured } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Solo interceptar rutas /admin/*
  if (!pathname.startsWith('/admin')) {
    return next();
  }

  // Si admin no está habilitado, las rutas no existen. 404 silencioso.
  if (!isAdminEnabled()) {
    return new Response('Not Found', { status: 404 });
  }

  // Fail-safe: si está habilitado pero falta password, no se puede loguear nadie.
  if (!isAdminPasswordConfigured()) {
    return new Response('Admin is misconfigured. Set ADMIN_PASSWORD_HASH.', {
      status: 503,
    });
  }

  // /admin/login es público (necesita acceso para que se pueda loguear)
  if (pathname === '/admin/login' || pathname === '/admin/api/login') {
    // Si ya tiene sesión válida, redirigir al dashboard (solo en /admin/login, no en /api/login)
    if (pathname === '/admin/login' && getSessionUser(context.cookies)) {
      return context.redirect('/admin/');
    }
    return next();
  }

  // /admin/api/* requiere sesión. Las API routes validan CSRF token internamente.
  const isApiRoute = pathname.startsWith('/admin/api/');
  const isPage = !isApiRoute;

  // Validar sesión
  const user = getSessionUser(context.cookies);
  if (!user) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }

  // Headers de seguridad extra para todas las páginas admin autenticadas
  const response = await next();
  if (isPage) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'no-referrer');
  }
  return response;
});