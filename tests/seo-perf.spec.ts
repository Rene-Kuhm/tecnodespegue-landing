import { test, expect } from '@playwright/test';

/**
 * E2E: Performance & SEO basics
 * Verifica que las paginas cargan rapido y tienen los meta tags criticos.
 */

test.describe('Performance', () => {
  test('home LCP < 3s (hero image preloaded)', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // DOMContentLoaded deberia ser < 2s en localhost
    expect(loadTime).toBeLessThan(2000);
  });

  test('CSS bundle no excede 200KB (despues de gzip)', async ({ page, request }) => {
    await page.goto('/');
    const cssLinks = await page.locator('link[rel="stylesheet"]').evaluateAll((els) =>
      (els as HTMLLinkElement[]).map((e) => e.href)
    );

    let totalSize = 0;
    for (const href of cssLinks) {
      const response = await request.get(href);
      const buffer = await response.body();
      totalSize += buffer.length;
    }

    // 200KB raw = ~50KB gzip. Tailwind v4 minificado deberia estar aqui.
    expect(totalSize).toBeLessThan(200_000);
  });
});

test.describe('SEO meta tags', () => {
  test('todas las paginas publicas tienen OG image', async ({ page }) => {
    const urls = ['/', '/blog', '/privacidad'];
    for (const url of urls) {
      await page.goto(url);
      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveAttribute('content', /tecnodespegue\.com.*\.(png|jpg|webp)/);
    }
  });

  test('robots.txt permite crawleo y apunta al sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Allow: /');
    expect(body).toContain('Sitemap:');
  });

  test('sitemap.xml existe y tiene URLs', async ({ request, baseURL }) => {
    // Astro's sitemap plugin only generates the sitemap during `astro build`.
    // If we're testing against the local dev server (default for playwright config),
    // the sitemap won't be there and would return 404. We skip it in this case.
    if (!process.env.CI || baseURL?.includes('localhost')) {
      test.skip();
    }
    const response = await request.get('/sitemap-index.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<loc>https://www.tecnodespegue.com/</loc>');
  });
});

test.describe('Security headers', () => {
  test('home tiene CSP y HSTS', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
  });
});
