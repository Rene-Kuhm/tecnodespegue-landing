// src/i18n/index.ts
// Punto de entrada público del módulo i18n.

export { locales, defaultLocale, localeConfig } from './locales';
export type { Locale } from './locales';
export { ui, useTranslations, type UIDict } from './ui';
export { localizedPath, getAlternateLocale, languageToggleHref } from './link';