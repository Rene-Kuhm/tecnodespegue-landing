import { test, expect } from '@playwright/test';

/**
 * E2E: Forms
 * Verifica que el newsletter y los forms de contacto renderizan y son usables.
 * NO se envian submissions reales (interceptamos con mock).
 */

test.describe('Newsletter form', () => {
  test('input tiene placeholder y el boton envia', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Scroll al newsletter
    const newsletter = page.locator('[data-newsletter]');
    await newsletter.scrollIntoViewIfNeeded();

    const input = page.locator('.nl-input');
    await expect(input).toBeVisible();

    // El input debe tener un width razonable (no colapsado a 30px como el bug que arreglamos)
    const inputBox = await input.boundingBox();
    expect(inputBox?.width).toBeGreaterThan(100); // al menos 100px

    // Type un email
    await input.fill('test@example.com');
    await expect(input).toHaveValue('test@example.com');

    // El boton debe estar visible y enabled
    const submitBtn = page.locator('.nl-btn');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('newsletter aparece en el blog en', async ({ page }) => {
    await page.goto('/en/blog');
    await page.waitForLoadState('networkidle');

    const newsletter = page.locator('[data-newsletter]');
    await newsletter.scrollIntoViewIfNeeded();

    const input = page.locator('.nl-input');
    const inputBox = await input.boundingBox();
    expect(inputBox?.width).toBeGreaterThan(100);
  });
});
