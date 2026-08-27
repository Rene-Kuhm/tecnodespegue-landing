import { test, expect } from '@playwright/test';

/**
 * E2E: Home page
 * Verifica que la home renderiza con sus elementos criticos para SEO y UX.
 */

test.describe('Home page', () => {
  test('carga con titulo y h1', async ({ page }) => {
    await page.goto('/');

    // Title aligned with the primary offer.
    await expect(page).toHaveTitle(/software interno.*automatización/i);

    await expect(page.locator('h1')).toHaveCount(1);
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/parches[\s\S]*tickets[\s\S]*dura/i);
  });

  test('tiene meta description y canonical', async ({ page }) => {
    await page.goto('/');

    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.{50,}/); // al menos 50 chars

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /tecnodespegue\.com/);
  });

  test('hreflang alternates para EN/ES', async ({ page }) => {
    await page.goto('/');

    const hreflangEs = page.locator('link[rel="alternate"][hreflang="es-AR"]');
    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en-US"]');
    await expect(hreflangEs).toHaveCount(1);
    await expect(hreflangEn).toHaveCount(1);
  });

  test('CTAs de contacto apuntan a #contacto', async ({ page }) => {
    await page.goto('/');
    const ctaButton = page.locator('a[href="#contacto"]:visible').first();
    await expect(ctaButton).toBeVisible();
  });

  test('skip link salta al main', async ({ page, browserName }) => {
    // skip links son un feature de accesibilidad WCAG 2.4.1
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
  });
});
