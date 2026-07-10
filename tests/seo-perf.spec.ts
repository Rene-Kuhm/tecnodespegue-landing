import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * E2E: Performance & SEO basics
 * Verifica que las paginas cargan rapido y tienen los meta tags criticos.
 */

test.describe('Performance', () => {
  test('home reports LCP < 3s through PerformanceObserver', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __lastLcp?: number }).__lastLcp = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const latest = entries.at(-1);
        if (latest) (window as Window & { __lastLcp?: number }).__lastLcp = latest.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(1_000);
    const lcp = await page.evaluate(() => (window as Window & { __lastLcp?: number }).__lastLcp ?? 0);
    expect(lcp, 'browser should report an LCP entry').toBeGreaterThan(0);
    expect(lcp).toBeLessThan(3_000);
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
  const translatedPairs = [
    ['/', '/en'],
    ['/blog', '/en/blog'],
    ['/privacidad', '/en/privacidad'],
    ['/templates', '/en/templates'],
    ['/blog/astro-framework-mas-rapido', '/en/blog/astro-fastest-landing-framework'],
    ['/blog/automatizacion-ia-caso-real', '/en/blog/ai-automation-case-study'],
    ['/blog/caso-real-ecommerce-n8n', '/en/blog/ecommerce-automation-n8n-case-study'],
    ['/blog/elegir-stack-startup-2025', '/en/blog/choosing-tech-stack-startup-2025'],
    ['/blog/typescript-tips-produccion', '/en/blog/typescript-production-tips'],
  ] as const;

  test('hreflang targets are reciprocal, canonical, and return 200', async ({ page, request }) => {
    for (const [esPath, enPath] of translatedPairs) {
      for (const path of [esPath, enPath]) {
        await page.goto(path);
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        const esHref = await page.locator('link[rel="alternate"][hreflang="es-AR"]').getAttribute('href');
        const enHref = await page.locator('link[rel="alternate"][hreflang="en-US"]').getAttribute('href');
        expect(new URL(esHref!).pathname).toBe(esPath);
        expect(new URL(enHref!).pathname).toBe(enPath);
        expect(new URL(canonical!).pathname).toBe(path);
        expect((await request.get(esHref!)).status()).toBe(200);
        expect((await request.get(enHref!)).status()).toBe(200);
      }
    }
  });

  test('Spanish-only template details omit nonexistent English alternates', async ({ page }) => {
    await page.goto('/templates/aurora-landing');
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
  });

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

  test('sitemap.xml existe y tiene URLs', async ({ request }) => {
    const response = await request.get('/sitemap-index.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    const childPath = new URL(body.match(/<loc>([^<]+)<\/loc>/)?.[1] || '').pathname;
    const childResponse = await request.get(childPath);
    expect(childResponse.status()).toBe(200);
    expect(await childResponse.text()).toMatch(/<loc>https:\/\/www\.tecnodespegue\.com\/?<\/loc>/);
  });
});

test.describe('Security headers', () => {
  test('preview matches production CSP and allows Formspree connections', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    const vercelConfig = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
    const productionCsp = vercelConfig.headers
      .flatMap((rule: { headers: Array<{ key: string; value: string }> }) => rule.headers)
      .find((header: { key: string }) => header.key === 'Content-Security-Policy')?.value;

    expect(productionCsp).toContain("connect-src 'self'");
    expect(productionCsp.match(/connect-src[^;]+/)?.[0]).toContain('https://formspree.io');
    expect(headers['content-security-policy']).toBe(productionCsp);
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
  });
});
