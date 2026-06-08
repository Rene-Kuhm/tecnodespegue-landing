#!/usr/bin/env node
/**
 * scripts/test-blog-responsive.mjs
 *
 * Captura screenshots del blog en varios viewports para diagnosticar
 * problemas de responsive design.
 *
 * Usage: node scripts/test-blog-responsive.mjs
 *   (requiere que astro dev este corriendo en localhost:4321)
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';

const VIEWS = [
  { name: 'mobile-375', width: 375, height: 812 },   // iPhone X
  { name: 'mobile-414', width: 414, height: 896 },   // Samsung Galaxy
  { name: 'tablet-768', width: 768, height: 1024 },  // iPad
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'ultrawide-1920', width: 1920, height: 1080 },
  { name: 'ultrawide-2560', width: 2560, height: 1440 },
];

const URL = 'http://localhost:4321/blog/';
const OUT_DIR = 'scripts/screenshots/blog';

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

const browser = await chromium.launch();

for (const view of VIEWS) {
  const context = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const file = `${OUT_DIR}/${view.name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✓ ${view.name} (${view.width}x${view.height}) → ${file}`);
  await context.close();
}

await browser.close();
console.log(`\n✅ Screenshots saved to ${OUT_DIR}/`);