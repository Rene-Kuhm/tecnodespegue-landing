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
    ['/casos/flow-engineering', '/en/case-studies/flow-engineering', 'no expone métricas comerciales'],
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

  for (const { locale, path, placement } of [
    { locale: 'es', path: '/', placement: 'primary' },
    { locale: 'es', path: '/', placement: 'portfolio' },
    { locale: 'en', path: '/en', placement: 'primary' },
    { locale: 'en', path: '/en', placement: 'portfolio' },
  ] as const) {
    test(`tracks the ${locale} hero ${placement} CTA exactly once`, async ({ page }) => {
      await page.goto(path);
      const cta = page.locator(`[data-hero-analytics="${placement}"]`);
      await cta.click();

      const destination = placement === 'primary' ? '#contacto' : '#portfolio';
      await expect(page.locator(destination)).toBeInViewport();
      expect(await events(page)).toEqual([
        {
          name: 'Hero CTA Click',
          options: { props: { locale, placement } },
        },
      ]);
    });
  }

  test('keeps one delegated handler after repeated Astro page-load lifecycle events', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.dispatchEvent(new Event('astro:page-load'));
      document.dispatchEvent(new Event('astro:page-load'));
    });

    await page.locator('[data-hero-analytics="portfolio"]').click();

    await expect(page.locator('#portfolio')).toBeInViewport();
    expect(await events(page)).toEqual([
      {
        name: 'Hero CTA Click',
        options: { props: { locale: 'es', placement: 'portfolio' } },
      },
    ]);
  });

  test('keeps navigation working when Plausible is unavailable', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => {
      delete window.plausible;
    });

    await page.locator('[data-hero-analytics="primary"]').click();

    await expect(page.locator('#contacto')).toBeInViewport();
    expect(pageErrors).toEqual([]);
  });

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

test.describe('Deferred mobile performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://analytics.tiktok.com/**', route => route.abort());
  });

  test('renders the complete hero title with real CSS when JavaScript is disabled', async ({ browser, page }, testInfo) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: page.viewportSize() ?? { width: 1280, height: 720 },
      colorScheme: 'dark',
      baseURL: String(testInfo.project.use.baseURL ?? 'http://localhost:4321'),
    });
    const noJavaScriptPage = await context.newPage();
    try {
      await noJavaScriptPage.goto('/');
      const title = noJavaScriptPage.locator('[data-hero-title]');
      await expect(title).toBeVisible();
      await expect(title).toContainText(/Programamos\.\s+Automatizamos\.\s+Vos despegás\./i);
      const bounds = await title.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.width).toBeGreaterThan(100);
      expect(bounds!.height).toBeGreaterThan(50);

      const lcpWord = title.locator('.side-accent');
      const renderedState = await lcpWord.evaluate((element) => {
        const opacityChain: Array<{ tag: string; opacity: number }> = [];
        for (let node: Element | null = element; node; node = node.parentElement) {
          opacityChain.push({
            tag: node.tagName.toLowerCase(),
            opacity: Number.parseFloat(getComputedStyle(node).opacity),
          });
        }

        const style = getComputedStyle(element);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrix(style.transform);
        const translateValues = style.translate === 'none'
          ? []
          : [...style.translate.matchAll(/-?\d*\.?\d+/g)].map(match => Number.parseFloat(match[0]));
        return {
          opacityChain,
          transformOffset: { x: matrix.e, y: matrix.f },
          translateOffset: translateValues,
        };
      });
      expect(renderedState.opacityChain.length).toBeGreaterThan(3);
      for (const node of renderedState.opacityChain) {
        expect(node.opacity, `${node.tag} must not hide the LCP word`).toBeGreaterThan(0.99);
      }
      expect(Math.abs(renderedState.transformOffset.x)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(renderedState.transformOffset.y)).toBeLessThanOrEqual(0.5);
      expect(renderedState.translateOffset.every(offset => Math.abs(offset) <= 0.5)).toBe(true);
    } finally {
      await context.close();
    }
  });

  test('reports the hero title as LCP close to first contentful paint', async ({ page }) => {
    await page.addInitScript(() => {
      const metrics = (window as any).__heroPaintMetrics = {
        fcp: null as number | null,
        lcp: null as null | { time: number; element: string; text: string },
      };
      new PerformanceObserver((list) => {
        const fcp = list.getEntriesByName('first-contentful-paint').at(-1);
        if (fcp) metrics.fcp = fcp.startTime;
      }).observe({ type: 'paint', buffered: true });
      new PerformanceObserver((list) => {
        const entry = list.getEntries().at(-1) as PerformanceEntry & { element?: Element };
        if (!entry) return;
        const element = entry.element;
        metrics.lcp = {
          time: entry.startTime,
          element: element?.closest('[data-hero-title]') ? 'hero-title' : (element?.tagName.toLowerCase() ?? 'unknown'),
          text: element?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ?? '',
        };
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });

    await page.goto('/');
    await expect.poll(() => page.evaluate(() => (window as any).__heroPaintMetrics.lcp?.time ?? 0)).toBeGreaterThan(0);
    await page.waitForTimeout(1000);
    const metrics = await page.evaluate(() => (window as any).__heroPaintMetrics as {
      fcp: number | null;
      lcp: { time: number; element: string; text: string } | null;
    });
    expect(metrics.fcp).not.toBeNull();
    expect(metrics.lcp).not.toBeNull();
    expect(metrics.lcp!.element).toBe('hero-title');
    expect(metrics.lcp!.text).toMatch(/Automatizamos\./i);
    expect(metrics.lcp!.time - metrics.fcp!).toBeLessThanOrEqual(450);
  });

  test('loads the TikTok SDK once after the real delay', async ({ page }) => {
    await page.clock.install();
    const sdkRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('analytics.tiktok.com/i18n/pixel/events.js')) sdkRequests.push(request.url());
    });

    await page.goto('/');
    await page.clock.fastForward(3000);
    expect(sdkRequests).toHaveLength(0);

    await page.clock.fastForward(1500);
    await expect.poll(() => sdkRequests.length).toBe(1);
    await page.clock.fastForward(5000);
    expect(sdkRequests).toHaveLength(1);
  });

  test('loads the TikTok SDK once on meaningful interaction', async ({ page }) => {
    const sdkRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('analytics.tiktok.com/i18n/pixel/events.js')) sdkRequests.push(request.url());
    });

    await page.goto('/');
    expect(sdkRequests).toHaveLength(0);
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerdown')));
    await expect.poll(() => sdkRequests.length).toBe(1);

    await page.evaluate(() => {
      window.dispatchEvent(new PointerEvent('pointerdown'));
      document.dispatchEvent(new Event('astro:page-load'));
      document.dispatchEvent(new Event('astro:page-load'));
    });
    await page.waitForTimeout(100);
    expect(sdkRequests).toHaveLength(1);
  });

  test('preserves the TikTok queue and emits one semantic page view per Astro URL', async ({ page }) => {
    await page.route('**/api/tiktok-event', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await page.addInitScript(() => {
      (window as any).ttq = [['preexisting-event', { consent: 'queued' }]];
    });
    await page.goto('/');
    await page.evaluate(() => {
      const original = window.tdTrackTikTok;
      (window as any).__tiktokSemanticCalls = [];
      window.tdTrackTikTok = ((...args: Parameters<NonNullable<typeof window.tdTrackTikTok>>) => {
        (window as any).__tiktokSemanticCalls.push(args);
        return original?.(...args);
      }) as typeof window.tdTrackTikTok;
    });

    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerdown')));
    await expect.poll(() => page.evaluate(() => ((window as any).ttq as unknown[][]).length)).toBeGreaterThan(2);

    await page.evaluate(() => {
      document.dispatchEvent(new Event('astro:page-load'));
      document.dispatchEvent(new Event('astro:page-load'));
      window.dispatchEvent(new PointerEvent('pointerdown'));
      history.pushState({}, '', '/en');
      document.dispatchEvent(new Event('astro:page-load'));
      window.dispatchEvent(new PointerEvent('pointerdown'));
      history.pushState({}, '', '/');
      document.dispatchEvent(new Event('astro:page-load'));
      window.dispatchEvent(new PointerEvent('pointerdown'));
    });

    const result = await page.evaluate(() => {
      const queue = (window as any).ttq as unknown[][];
      return {
        queue,
        calls: (window as any).__tiktokSemanticCalls as unknown[][],
      };
    });
    expect(result.queue[0]).toEqual(['preexisting-event', { consent: 'queued' }]);

    const pageCalls = result.queue.filter(entry => entry[0] === 'page');
    const viewContentCalls = result.queue.filter(entry => entry[0] === 'track' && entry[1] === 'ViewContent');
    expect(pageCalls).toHaveLength(2);
    expect(viewContentCalls).toHaveLength(2);
    for (const entry of viewContentCalls) {
      const payload = entry[2] as Record<string, unknown>;
      const options = entry[3] as Record<string, unknown>;
      expect(payload).toMatchObject({
        content_type: 'product',
        content_id: 'tecnodespegue',
        currency: 'USD',
      });
      expect(payload.event_id).toEqual(options.event_id);
      expect(typeof payload.event_id).toBe('string');
    }

    expect(result.calls).toHaveLength(2);
    expect(result.calls.map(call => call[0])).toEqual(['ViewContent', 'ViewContent']);
    expect(result.calls.map(call => (call[1] as Record<string, string>).url)).toEqual([
      'http://localhost:4321/',
      'http://localhost:4321/en',
    ]);
  });

  test('does not request Lenis on touch mobile and keeps native anchors working', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile-only behavior');
    await page.clock.install();
    const lenisRequests: string[] = [];
    page.on('request', request => {
      if (/\/_astro\/lenis\.[^/]+\.js/.test(request.url())) lenisRequests.push(request.url());
    });

    await page.goto('/');
    await page.clock.fastForward(5000);
    expect(lenisRequests).toHaveLength(0);

    await page.locator('[data-hero-analytics="portfolio"]').click();
    await expect(page.locator('#portfolio')).toBeInViewport();
    expect(lenisRequests).toHaveLength(0);
  });

  test('loads Lenis once on desktop after interaction', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Desktop-only behavior');
    await page.clock.install();
    const lenisRequests: string[] = [];
    page.on('request', request => {
      if (/\/_astro\/lenis\.[^/]+\.js/.test(request.url())) lenisRequests.push(request.url());
    });

    await page.goto('/');
    await page.clock.fastForward(3000);
    expect(lenisRequests).toHaveLength(0);

    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerdown')));
    await expect.poll(() => lenisRequests.length).toBe(1);
    await page.evaluate(() => {
      window.dispatchEvent(new PointerEvent('pointerdown'));
      document.dispatchEvent(new Event('astro:page-load'));
    });
    await page.clock.fastForward(5000);
    expect(lenisRequests).toHaveLength(1);
  });

  test('does not request Lenis with reduced motion', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Desktop-only behavior');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    const lenisRequests: string[] = [];
    page.on('request', request => {
      if (/\/_astro\/lenis\.[^/]+\.js/.test(request.url())) lenisRequests.push(request.url());
    });

    await page.goto('/');
    await page.clock.fastForward(5000);
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerdown')));
    await page.waitForTimeout(100);
    expect(lenisRequests).toHaveLength(0);
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
