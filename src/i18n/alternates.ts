import type { Locale } from '../i18n';

export type AlternatePaths = Partial<Record<Locale, string>>;

const postPairs = [
  ['astro-framework-mas-rapido', 'astro-fastest-landing-framework'],
  ['automatizacion-ia-caso-real', 'ai-automation-case-study'],
  ['caso-real-ecommerce-n8n', 'ecommerce-automation-n8n-case-study'],
  ['elegir-stack-startup-2025', 'choosing-tech-stack-startup-2025'],
  ['typescript-tips-produccion', 'typescript-production-tips'],
] as const;

export function getPostAlternatePaths(locale: Locale, slug: string): AlternatePaths | undefined {
  const pair = postPairs.find(([es, en]) => (locale === 'es' ? es : en) === slug);
  if (!pair) return undefined;

  return {
    es: `/blog/${pair[0]}`,
    en: `/en/blog/${pair[1]}`,
  };
}
