import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

type TrackedEvent = { name: string; options?: { props?: Record<string, string> } };

async function captureAnalytics(page: Page) {
  await page.route('https://plausible.io/**', route => route.abort());
  await page.addInitScript(() => {
    (window as any).__trackedEvents = [];
    window.plausible = ((name: string, options?: { props?: Record<string, string> }) => {
      (window as any).__trackedEvents.push({ name, options });
    }) as typeof window.plausible;
  });
}

async function events(page: Page): Promise<TrackedEvent[]> {
  return page.evaluate(() => (window as any).__trackedEvents);
}

test.describe('Evidence-based case studies', () => {
  for (const [path, counterpart, limitation] of [
    ['/casos/flow-engineering', '/en/case-studies/flow-engineering', 'repositorio es privado'],
    ['/casos/vaulta', '/en/case-studies/vaulta', 'auditoría criptográfica externa'],
  ] as const) {
    test(`${path} has unique H1, canonical, reciprocal alternates and limits`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${path}$`));
      await expect(page.locator('link[hreflang="es-AR"]')).toHaveAttribute('href', new RegExp(`${path}$`));
      await expect(page.locator('link[hreflang="en-US"]')).toHaveAttribute('href', new RegExp(`${counterpart}$`));
      await expect(page.locator('main')).toContainText(new RegExp(limitation, 'i'));
    });
  }

  test('English alternate points back to the Spanish case', async ({ page }) => {
    await page.goto('/en/case-studies/vaulta');
    await expect(page.locator('link[hreflang="es-AR"]')).toHaveAttribute('href', /\/casos\/vaulta$/);
    await expect(page.locator('link[hreflang="en-US"]')).toHaveAttribute('href', /\/en\/case-studies\/vaulta$/);
  });

  test('visible desktop or mobile language switcher targets the explicit counterpart', async ({ page }) => {
    for (const [path, expected] of [
      ['/casos/vaulta', '/en/case-studies/vaulta'],
      ['/en/case-studies/flow-engineering', '/casos/flow-engineering'],
    ] as const) {
      await page.goto(path);
      const mobile = (page.viewportSize()?.width ?? 1024) < 768;
      if (mobile) {
        await page.locator('[data-nav-burger]').click();
      }
      const toggle = page.locator(mobile ? '.nav-mobile [data-lang-toggle]' : '.nav-actions [data-lang-toggle]');
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('href', expected);
    }
  });

  test('case studies are present in the generated sitemap', async ({ request }) => {
    const index = await request.get('/sitemap-index.xml');
    const indexText = await index.text();
    const sitemapPath = new URL(indexText.match(/<loc>(.*?)<\/loc>/)?.[1] ?? '').pathname;
    const sitemap = await request.get(sitemapPath);
    const body = await sitemap.text();
    expect(body).toContain('/casos/flow-engineering');
    expect(body).toContain('/en/case-studies/vaulta');
    expect(body).toContain('hreflang="es-AR" href="https://www.tecnodespegue.com/casos/vaulta"');
    expect(body).toContain('hreflang="en-US" href="https://www.tecnodespegue.com/en/case-studies/vaulta"');
  });
});

test.describe('Plausible funnel', () => {
  test.beforeEach(async ({ page }) => captureAnalytics(page));

  test('tracks hero, portfolio and WhatsApp clicks with bounded props', async ({ page }) => {
    await page.goto('/');
    const dispatchWithoutNavigation = async (selector: string) => page.locator(selector).first().evaluate((element) => {
      element.addEventListener('click', event => event.preventDefault(), { once: true });
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await dispatchWithoutNavigation('[data-hero-analytics="primary"]');
    await dispatchWithoutNavigation('[data-analytics-event="Portfolio Project Open"]');
    await dispatchWithoutNavigation('[data-whatsapp-analytics]');
    const tracked = await events(page);
    expect(tracked.map(event => event.name)).toEqual(expect.arrayContaining(['Hero CTA Click', 'Portfolio Project Open', 'WhatsApp Click']));
    expect(tracked.flatMap(event => Object.keys(event.options?.props ?? {}))).not.toContain('email');
  });

  test('tracks form start and success without sending personal data', async ({ page }) => {
    await page.route('https://formspree.io/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await page.goto('/');
    const form = page.locator('[data-contact-form]');
    await form.getByLabel(/Nombre|Name/).fill('Test User');
    await form.getByLabel('Email *').fill('test@example.com');
    await form.getByLabel(/proyecto|project/i).fill('A sufficiently detailed test request.');
    await form.locator('[data-contact-submit]').click();
    await expect(page.locator('[data-contact-success]')).toBeVisible();
    const tracked = await events(page);
    expect(tracked.map(event => event.name)).toEqual(expect.arrayContaining(['Contact Form Start', 'Contact Form Success']));
    expect(JSON.stringify(tracked)).not.toContain('test@example.com');
  });

  test('tracks form delivery errors', async ({ page }) => {
    await page.route('https://formspree.io/**', route => route.fulfill({ status: 500, body: '{}' }));
    await page.goto('/en');
    const form = page.locator('[data-contact-form]');
    await form.getByLabel(/Nombre|Name/).fill('Test User');
    await form.getByLabel('Email *').fill('test@example.com');
    await form.getByLabel(/proyecto|project/i).fill('A sufficiently detailed test request.');
    await form.locator('[data-contact-submit]').click();
    await expect(form.locator('[data-contact-error]')).toBeVisible();
    expect((await events(page)).map(event => event.name)).toContain('Contact Form Error');
  });
});

test.describe('Blog honesty', () => {
  test('shows the actual latest publication date and no cadence promise', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByText('Última publicación')).toBeVisible();
    await expect(page.locator('.stat-month')).toHaveText('12 de junio de 2025');
    await expect(page.locator('body')).not.toContainText(/cada dos semanas|quincenal/i);

    await page.goto('/en/blog');
    await expect(page.locator('.stat-month')).toHaveText('June 12, 2025');
  });

  test('labels historical articles without pretending they were reviewed', async ({ page }) => {
    await page.goto('/blog/astro-framework-mas-rapido');
    await expect(page.getByRole('note')).toContainText('Contenido publicado en 2025');
    await expect(page.getByRole('note')).toContainText('fecha original');
  });
});

test('CI sticky summary paginates comments and preserves update/create paths', () => {
  const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  expect(workflow).toContain('github.paginate(github.rest.issues.listComments');
  expect(workflow).toContain('github.rest.issues.updateComment');
  expect(workflow).toContain('github.rest.issues.createComment');
});
