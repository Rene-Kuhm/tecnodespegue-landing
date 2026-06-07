// src/i18n/link.ts
// Helpers para generar URLs con locale-aware path prefix.

import type { Locale } from './locales';
import { defaultLocale } from './locales';

/**
 * Devuelve el path con el prefijo de locale.
 * ES (default): sin prefijo → "/blog" → "/blog"
 * EN: con prefijo → "/blog" → "/en/blog"
 */
export function localizedPath(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  // Ensure path starts with /
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/en${normalized}`;
}

/**
 * Dado el locale actual, devuelve la versión opuesta (toggle).
 */
export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es';
}

/**
 * Genera el href para el toggle de idioma.
 * ES → /en/...   EN → /...
 */
export function languageToggleHref(currentLocale: Locale, currentPath: string): string {
  if (currentLocale === 'en') {
    // From EN: /en/blog → /
    if (currentPath.startsWith('/en')) {
      const stripped = currentPath.replace(/^\/en/, '') || '/';
      return stripped;
    }
    return '/';
  } else {
    // From ES: /blog → /en/blog
    const normalized = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
    return `/en${normalized}`;
  }
}