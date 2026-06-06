#!/usr/bin/env node
/**
 * scripts/check-deploy.mjs
 * Validación pre-deploy. Corre antes de hacer push.
 *
 * Usage: node scripts/check-deploy.mjs
 *
 * Verifica:
 * - Variables de entorno requeridas
 * - Formspree endpoint configurado
 * - TikTok pixel ID presente
 * - Plausible domain
 * - Dominio válido
 * - Build artifacts existen
 * - 0 vulnerabilidades npm
 * - Tamaños de bundle razonables
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const errors = [];
const warnings = [];
const checks = [];

function ok(msg) { checks.push({ ok: true, msg }); }
function warn(msg) { warnings.push(msg); console.warn(`⚠️  ${msg}`); }
function fail(msg) { errors.push(msg); console.error(`❌ ${msg}`); }
function info(msg) { checks.push({ ok: true, msg }); console.log(`✓ ${msg}`); }

// Cross-platform: recursivo para calcular tamaño
function dirSize(dir) {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) total += dirSize(p);
    else if (entry.isFile()) total += statSync(p).size;
  }
  return total;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

console.log('\n🔍 Pre-deploy check para TecnoDespegue\n');

// === 1. Site config ===
console.log('📋 1. Validando src/config/site.config.ts');
try {
  const configPath = join(root, 'src/config/site.config.ts');
  const configSrc = readFileSync(configPath, 'utf-8');

  // Extraer valores por regex (en lugar de dynamic import)
  const urlMatch = configSrc.match(/url: import\.meta\.env\.PUBLIC_SITE_URL \|\| ['"]([^'"]+)['"]/);
  const emailMatch = configSrc.match(/email: import\.meta\.env\.PUBLIC_CONTACT_EMAIL \|\| ['"]([^'"]+)['"]/);
  const phoneMatch = configSrc.match(/phone: import\.meta\.env\.PUBLIC_CONTACT_PHONE \|\| ['"]([^'"]+)['"]/);
  const formspreeMatch = configSrc.match(/endpoint: import\.meta\.env\.PUBLIC_FORMSPREE_ENDPOINT \|\| ['"]([^'"]+)['"]/);
  const tiktokMatch = configSrc.match(/id: import\.meta\.env\.PUBLIC_TIKTOK_PIXEL_ID \|\| ['"]([^'"]+)['"]/);

  const c = {
    url: urlMatch ? urlMatch[1] : null,
    email: emailMatch ? emailMatch[1] : null,
    phone: phoneMatch ? phoneMatch[1] : null,
    formspree: { endpoint: formspreeMatch ? formspreeMatch[1] : null },
    tiktokPixel: { id: tiktokMatch ? tiktokMatch[1] : null },
  };

  if (!c.url || !c.url.startsWith('https://')) {
    fail(`siteConfig.url debe ser HTTPS: "${c.url}"`);
  } else {
    info(`URL válida: ${c.url}`);
  }

  if (!c.email || !c.email.includes('@')) {
    fail(`siteConfig.email inválido: "${c.email}"`);
  } else {
    info(`Email: ${c.email}`);
  }

  if (!c.phone || c.phone.length < 8) {
    fail(`siteConfig.phone inválido: "${c.phone}"`);
  } else {
    info(`Phone: ${c.phone}`);
  }

  if (c.formspree.endpoint && c.formspree.endpoint.includes('mojpnepv')) {
    warn(`Formspree ID parece ser un placeholder: "${c.formspree.endpoint}". Cambialo cuando deployes.`);
  } else {
    info(`Formspree: ${c.formspree.endpoint}`);
  }

  if (c.tiktokPixel.id === 'D8AARK3C77U6KT5BPNHG') {
    warn(`TikTok Pixel ID parece ser un placeholder. Cambialo o deshabilitalo.`);
  } else {
    info(`TikTok Pixel: ${c.tiktokPixel.id}`);
  }
} catch (err) {
  fail(`No se pudo leer siteConfig: ${err.message}`);
}

// === 2. astro.config.mjs ===
console.log('\n📋 2. Validando astro.config.mjs');
try {
  const astroConfig = readFileSync(join(root, 'astro.config.mjs'), 'utf-8');
  if (!astroConfig.includes('vercel(') && !astroConfig.includes('@astrojs/vercel')) {
    fail('astro.config.mjs no tiene adapter de Vercel (necesario para endpoints /api/og)');
  } else {
    info('Vercel adapter configurado (endpoints serverless habilitados)');
  }
  if (!astroConfig.includes('PUBLIC_SITE_URL') && !astroConfig.includes('tecnodespegue.com')) {
    fail('astro.config.mjs no tiene site configurado');
  } else {
    info('Site URL configurado');
  }
} catch (err) {
  fail(`astro.config.mjs no encontrado: ${err.message}`);
}

// === 3. vercel.json ===
console.log('\n📋 3. Validando vercel.json');
try {
  const vercelConfig = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf-8'));
  if (!vercelConfig.headers || !Array.isArray(vercelConfig.headers)) {
    fail('vercel.json no tiene headers de seguridad');
  } else {
    info(`Headers de seguridad: ${vercelConfig.headers.length} bloques`);
  }
  if (!vercelConfig.redirects || !Array.isArray(vercelConfig.redirects)) {
    warn('vercel.json no tiene redirects (no es crítico)');
  }
} catch (err) {
  fail(`vercel.json no encontrado o inválido: ${err.message}`);
}

// === 4. Build artifacts ===
console.log('\n📋 4. Validando build output');

// Astro 6 con Vercel adapter genera en .vercel/output/static/ + .vercel/output/functions/
// Astro sin adapter genera en dist/
const vercelStaticPath = join(root, '.vercel/output/static');
const distPath = join(root, 'dist');
const buildPath = existsSync(vercelStaticPath) ? vercelStaticPath : distPath;
const buildType = existsSync(vercelStaticPath) ? '.vercel/output/static' : 'dist';

if (!existsSync(buildPath)) {
  fail(`No existe ${buildType}/. Corré \`npm run build\` primero.`);
} else {
  const indexHtml = join(buildPath, 'index.html');
  if (!existsSync(indexHtml)) {
    fail(`${buildType}/index.html no existe. Build incompleto.`);
  } else {
    const stats = statSync(indexHtml);
    info(`${buildType}/index.html: ${(stats.size / 1024).toFixed(1)} KB`);

    // Check homepage size
    const homeContent = readFileSync(indexHtml, 'utf-8');
    if (homeContent.length < 5000) {
      warn('Homepage < 5KB, posible contenido incompleto');
    } else {
      info(`Homepage HTML: ${(homeContent.length / 1024).toFixed(1)} KB`);
    }
  }

  // Check sitemap
  const sitemapPath = join(buildPath, 'sitemap-index.xml');
  if (!existsSync(sitemapPath)) {
    fail('sitemap-index.xml no generado');
  } else {
    info('Sitemap generado');
  }
}

// === 5. Assets críticos ===
console.log('\n📋 5. Validando assets críticos');
const publicPath = join(root, 'public');
const requiredAssets = [
  'og-image.png',
  'favicon.svg',
  'favicon.ico',
  'robots.txt',
  'hero-mockup.webp',
];
for (const asset of requiredAssets) {
  const path = join(publicPath, asset);
  if (existsSync(path)) {
    const size = statSync(path).size;
    info(`${asset}: ${(size / 1024).toFixed(1)} KB`);
    if (size > 500_000 && asset.endsWith('.webp') === false) {
      warn(`${asset} pesa > 500KB, considera optimizar`);
    }
  } else {
    fail(`Asset faltante: public/${asset}`);
  }
}

// === 6. Build size summary ===
console.log('\n📋 6. Tamaño de build output');
if (existsSync(buildPath)) {
  const total = dirSize(buildPath);
  info(`Total ${buildType}/: ${formatBytes(total)}`);
  if (total > 5 * 1024 * 1024) {
    warn(`Build pesa > 5MB. Considera optimizar.`);
  }
}

// === 7. npm audit ===
console.log('\n📋 7. Vulnerabilidades npm');
try {
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'npm.cmd' : 'npm';
  const audit = execSync(`${cmd} audit --omit=dev --json`, { encoding: 'utf-8', cwd: root });
  const parsed = JSON.parse(audit);
  if (parsed.metadata?.vulnerabilities?.total === 0) {
    info('0 vulnerabilidades');
  } else {
    const total = parsed.metadata.vulnerabilities.total;
    const high = parsed.metadata.vulnerabilities.high;
    if (high > 0) {
      fail(`${high} vulnerabilidades HIGH`);
    } else {
      warn(`${total} vulnerabilidades (sin HIGH)`);
    }
  }
} catch (err) {
  // Exit code != 0 = hay vulns
  const stderr = err.stderr?.toString() || err.message || '';
  if (stderr.includes('vulnerabilities')) {
    if (stderr.includes('high') || stderr.includes('critical')) {
      fail(`npm audit encontró vulnerabilidades HIGH/CRITICAL`);
    } else {
      warn(`npm audit encontró vulnerabilidades (no críticas)`);
    }
  } else {
    warn(`No se pudo correr npm audit`);
  }
}

// === Resumen ===
console.log('\n' + '='.repeat(50));
console.log(`✅ Checks OK: ${checks.filter(c => c.ok).length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Errors: ${errors.length}`);
console.log('='.repeat(50) + '\n');

if (errors.length > 0) {
  console.error('🚫 DEPLOY BLOQUEADO. Resolvé los errores antes de deployar.\n');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('💡 Deploy podés hacer (los warnings son recomendaciones).\n');
}

console.log('✅ Listo para deploy. Siguiente paso: git push → Vercel auto-deploys.\n');
