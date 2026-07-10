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

test.describe('Contact form', () => {
  const fillContactForm = async (page: import('@playwright/test').Page) => {
    const form = page.locator('[data-contact-form]');
    await form.scrollIntoViewIfNeeded();
    await form.getByLabel(/Nombre|Name/).fill('Test User');
    await form.getByLabel('Email *').fill('test@example.com');
    await form.getByLabel(/proyecto|project/i).fill('A sufficiently detailed test project request.');
    return form;
  };

  test('exposes accessible field metadata', async ({ page }) => {
    for (const path of ['/', '/en']) {
      await page.goto(path);
      const form = page.locator('[data-contact-form]');
      await expect(form.getByLabel(/Nombre|Name/)).toHaveAttribute('autocomplete', 'name');
      await expect(form.getByLabel('Email *')).toHaveAttribute('autocomplete', 'email');
      await expect(form.getByLabel(/proyecto|project/i)).toHaveAttribute('autocomplete', 'off');
      await expect(form.locator('[data-contact-error]')).toHaveAttribute('aria-live', 'assertive');
    }
  });

  test('disables submit while pending and announces success', async ({ page }) => {
    await page.route('https://formspree.io/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 400));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.goto('/');
    const form = await fillContactForm(page);
    const submit = form.locator('[data-contact-submit]');
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toContainText(/Enviando|Sending/);
    const success = page.locator('[data-contact-success]');
    await expect(success).toBeVisible();
    await expect(success).toBeFocused();
  });

  test('shows inline error and restores submit after a failed request', async ({ page }) => {
    await page.route('https://formspree.io/**', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
    await page.goto('/');
    const form = await fillContactForm(page);
    const submit = form.locator('[data-contact-submit]');
    await submit.click();
    const error = form.locator('[data-contact-error]');
    await expect(error).toBeVisible();
    await expect(error).toBeFocused();
    await expect(submit).toBeEnabled();
  });
});
