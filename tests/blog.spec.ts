import { test, expect } from '@playwright/test';

/**
 * E2E: Blog
 * Verifica que el blog index, los filtros y los posts individuales funcionan.
 */

test.describe('Blog', () => {
  test('blog index muestra posts y categorias', async ({ page }) => {
    await page.goto('/blog');

    // h1
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Title SEO-optimizado
    await expect(page).toHaveTitle(/Blog.*Fullstack.*IA.*Arquitectura/i);

    // Al menos un post card
    const cards = page.locator('[data-blog-card]');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('filtro por categoria oculta posts que no matchean', async ({ page }) => {
    await page.goto('/blog');

    // Antes del filtro: todos los posts visibles
    const allCards = page.locator('[data-blog-card]');
    await expect(allCards.first()).toBeVisible();
    const totalBefore = await allCards.count();

    // Click en una categoria especifica
    const filterButton = page.locator('[data-filter-cat]').nth(1); // segundo boton (skip "All")
    const filterCat = await filterButton.getAttribute('data-filter-cat');
    
    // El filtro tiene JS. Nos aseguramos de esperar un poco a que el JS hidrate si es necesario.
    await page.waitForTimeout(500); 
    await filterButton.click();

    // Despues del filtro: solo posts de esa categoria
    const visibleCards = page.locator('[data-blog-card]:not(.is-hidden)');
    
    // Esperamos a que la cantidad de cartas cambie (el filtro se aplique)
    await expect(async () => {
      const count = await visibleCards.count();
      expect(count).toBeLessThan(totalBefore);
    }).toPass();

    const totalAfter = await visibleCards.count();
    expect(totalAfter).toBeGreaterThan(0);

    // Verificar que cada post visible tiene la categoria esperada
    for (const card of await visibleCards.all()) {
      const cats = JSON.parse((await card.getAttribute('data-categories')) || '[]');
      expect(cats).toContain(filterCat);
    }
  });

  test('post individual tiene structured data BlogPosting', async ({ page }) => {
    await page.goto('/blog');

    // Tomar el primer post link
    const firstPostLink = page.locator('[data-blog-card] a').first();
    await firstPostLink.click();
    await page.waitForLoadState('networkidle');

    // h1 con el titulo del post
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // BlogPosting structured data
    const structuredData = page.locator('script[type="application/ld+json"]');
    const count = await structuredData.count();
    expect(count).toBeGreaterThan(0);

    // Verificar que alguno es BlogPosting
    const hasBlogPosting = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return Array.from(scripts).some((s) => {
        try {
          return JSON.parse(s.textContent || '{}')['@type'] === 'BlogPosting';
        } catch {
          return false;
        }
      });
    });
    expect(hasBlogPosting).toBe(true);
  });
});
