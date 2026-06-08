/**
 * robots.txt.ts
 * robots.txt personalizado con hints para crawlers.
 * - Permite todo el crawling (no hay secciones privadas)
 * - Apunta al sitemap index
 * - Excluye rutas de staging/development si las hay
 */
import type { APIRoute } from 'astro';

const STAGING_PATHS = [
  '/.netlify/',
  '/.vercel/',
  '/__astro/',
  '/_astro/',
];

export const GET: APIRoute = ({ request }) => {
  const url = new URL(request.url);
  const isStaging = url.hostname !== 'www.tecnodespegue.com';

  const lines: string[] = [
    'User-agent: *',
    'Allow: /',
    // Excluir rutas de build assets y CDN en staging
    ...(isStaging ? STAGING_PATHS.map(p => `Disallow: ${p}`) : []),
    '',
    `# TecnoDespegue — ${isStaging ? 'STAGING ENVIRONMENT' : 'PRODUCTION'}`,
    `Sitemap: https://www.tecnodespegue.com/sitemap-index.xml`,
    '',
    '# i18n: Google sabe que /en/ es la version en ingles de cada pagina',
    '# gracias a las etiquetas hreflang en el HTML y en el sitemap.',
    '# No necesitamos bloquear crawlers para i18n - x-default lo cover.',
    '',
    '# Rendimiento: no rastrear archivos de desarrollo o assets privados',
    'Disallow: /src/',
    'Disallow: /scripts/',
    'Disallow: /node_modules/',
    'Disallow: /dist/',
    'Disallow: /.git/',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};