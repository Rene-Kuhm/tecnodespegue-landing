// src/i18n/locales.ts
// Define los locales soportados y sus configuraciones regionales.
// Solo soporta 'es' (default, en raíz) y 'en' (bajo /en/).

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const localeConfig: Record<Locale, {
  dateLocale: string;        // BCP-47 para date-fns / Intl
  href: string;              // path prefix
  ogLocale: string;          // og:locale meta
  htmlLang: string;          // <html lang>
  label: string;             // "Español" / "English"
  labelShort: string;        // "ES" / "EN"
}> = {
  es: {
    dateLocale: 'es-AR',
    href: '/',
    ogLocale: 'es_AR',
    htmlLang: 'es',
    label: 'Español',
    labelShort: 'ES',
  },
  en: {
    dateLocale: 'en-US',
    href: '/en',
    ogLocale: 'en_US',
    htmlLang: 'en',
    label: 'English',
    labelShort: 'EN',
  },
};