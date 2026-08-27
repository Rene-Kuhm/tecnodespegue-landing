/**
 * robots.txt — fuente única de verdad para producción y staging.
 *
 * Esta ruta dinámica existe porque Astro+Vercel preferirían servir
 * el archivo estático public/robots.txt, pero necesitamos reglas
 * distintas en staging (host ≠ www.tecnodespegue.com).
 *
 * Si public/robots.txt existe, Astro+Vercel sirven ese y esta ruta
 * queda como código muerto. Por eso public/robots.txt fue eliminado.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request }) => {
  const url = new URL(request.url);
  const isStaging = url.hostname !== 'www.tecnodespegue.com';

  const stagingDisallows = [
    'Disallow: /.netlify/',
    'Disallow: /.vercel/',
    'Disallow: /__astro/',
  ];

  const lines: string[] = [
    '# tecNodespegue / robots.txt',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Block private areas (siempre)',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /_astro/',
    // Staging-only: paths de build que no deben crawlearse en preview deployments
    ...(isStaging ? stagingDisallows : []),
    '',
    '# Sitemaps',
    'Sitemap: https://www.tecnodespegue.com/sitemap-index.xml',
    '',
    '# AI crawlers — allow (citaciones en ChatGPT, Perplexity, etc.)',
    'User-agent: OAI-SearchBot',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: Applebot-Extended',
    'Allow: /',
    '',
    '# Aggressive scrapers — bloquear',
    'User-agent: AhrefsBot',
    'Disallow: /',
    '',
    'User-agent: SemrushBot',
    'Disallow: /',
    '',
    'User-agent: MJ12bot',
    'Disallow: /',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
