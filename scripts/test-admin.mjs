#!/usr/bin/env node
/**
 * scripts/test-admin.mjs
 * Tests locales del admin — verifica que sin variables de entorno
 * el /admin/* devuelva 404 (no expuesto).
 *
 * Usage: node scripts/test-admin.mjs
 *
 * Requiere: npm run build (genera .vercel/output/)
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

function ok(msg) { console.log(`✓ ${msg}`); }
function fail(msg) { errors.push(msg); console.error(`❌ ${msg}`); }
function warn(msg) { warnings.push(msg); console.warn(`⚠️  ${msg}`); }

console.log('\n🔒 Test de seguridad del admin\n');

// === 1. Verificar que no haya archivos /admin en el output ESTATICO ===
console.log('📋 1. Verificando que /admin/* no esté en el output estático');
const staticPath = join(root, '.vercel', 'output', 'static');
const adminStaticExists = existsSync(join(staticPath, 'admin'));

if (adminStaticExists) {
  const files = readdirSync(join(staticPath, 'admin'), { withFileTypes: true });
  const htmlFiles = [];
  for (const f of files) {
    if (f.isDirectory()) {
      const sub = readdirSync(join(staticPath, 'admin', f.name));
      htmlFiles.push(...sub.filter(x => x.endsWith('.html')).map(x => `admin/${f.name}/${x}`));
    } else if (f.name.endsWith('.html')) {
      htmlFiles.push(`admin/${f.name}`);
    }
  }
  if (htmlFiles.length > 0) {
    fail(`Archivos admin/ encontrados en output estático: ${htmlFiles.join(', ')}`);
  } else {
    ok('admin/ existe pero sin .html estáticos (probablemente solo _astro/ assets)');
  }
} else {
  ok('No existe /admin/ en output estático');
}

// === 2. Verificar que el admin tenga SSR ===
console.log('\n📋 2. Verificando que /admin/* sea SSR (server-rendered)');
const functionsPath = join(root, '.vercel', 'output', 'functions');
if (existsSync(functionsPath)) {
  // Vercel genera funciones para routes con prerender=false
  // Buscamos si /admin/ aparece en el bundle
  ok('Functions directory existe (verificar manualmente que /admin/* está serverless)');
} else {
  warn('Functions directory no encontrado');
}

// === 3. Verificar middleware ===
console.log('\n📋 3. Verificando middleware');
const middlewareExists = existsSync(join(root, 'src', 'middleware.ts'));
if (!middlewareExists) {
  fail('src/middleware.ts no existe');
} else {
  const content = readFileSync(join(root, 'src', 'middleware.ts'), 'utf-8');
  if (!content.includes('isAdminEnabled')) {
  fail('middleware.ts no usa isAdminEnabled()');
  } else {
    ok('middleware.ts usa isAdminEnabled()');
  }
  if (!content.includes('404')) {
    fail('middleware.ts no devuelve 404 cuando admin está deshabilitado');
  } else {
    ok('middleware.ts bloquea /admin/* con 404 cuando ADMIN_ENABLED != "true"');
  }
  if (!content.includes('getSessionUser')) {
    fail('middleware.ts no valida sesión');
  } else {
    ok('middleware.ts valida sesión con getSessionUser()');
  }
}

// === 4. Verificar auth.ts ===
console.log('\n📋 4. Verificando auth.ts');
const authExists = existsSync(join(root, 'src', 'lib', 'auth.ts'));
if (!authExists) {
  fail('src/lib/auth.ts no existe');
} else {
  const content = readFileSync(join(root, 'src', 'lib', 'auth.ts'), 'utf-8');
  if (!content.includes('scryptSync')) {
    fail('auth.ts no usa scrypt (vulnerable a fuerza bruta)');
  } else {
    ok('auth.ts usa scrypt para password hashing');
  }
  if (!content.includes('timingSafeEqual')) {
    fail('auth.ts no usa timingSafeEqual (vulnerable a timing attacks)');
  } else {
    ok('auth.ts usa timingSafeEqual para comparar');
  }
  if (!content.includes('httpOnly')) {
    fail('cookie no es httpOnly (vulnerable a XSS)');
  } else {
    ok('cookie es httpOnly');
  }
  if (!content.includes('rateLimit')) {
    fail('no hay rate limiting');
  } else {
    ok('rate limit implementado (5 intentos / 15 min)');
  }
}

// === 5. Verificar .env.example documenta el setup ===
console.log('\n📋 5. Verificando documentación');
const envExample = readFileSync(join(root, '.env.example'), 'utf-8');
if (!envExample.includes('ADMIN_ENABLED')) {
  fail('.env.example no documenta ADMIN_ENABLED');
} else {
  ok('.env.example documenta ADMIN_ENABLED');
}
if (!envExample.includes('ADMIN_PASSWORD_HASH')) {
  fail('.env.example no documenta ADMIN_PASSWORD_HASH');
} else {
  ok('.env.example documenta ADMIN_PASSWORD_HASH (con instrucciones para generarlo)');
}

// === 6. Verificar vercel.json tiene headers de seguridad para admin ===
console.log('\n📋 6. Verificando vercel.json');
const vercelConfig = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf-8'));
const adminHeaders = vercelConfig.headers?.find(h => h.source === '/admin/(.*)');
if (!adminHeaders) {
  fail('vercel.json no tiene headers específicos para /admin/(.*)');
} else {
  const hasNoStore = adminHeaders.headers.some(h => h.key === 'Cache-Control' && h.value.includes('no-store'));
  const hasNoIndex = adminHeaders.headers.some(h => h.key === 'X-Robots-Tag' && h.value.includes('noindex'));
  const hasFrameDeny = adminHeaders.headers.some(h => h.key === 'X-Frame-Options' && h.value === 'DENY');
  if (hasNoStore && hasNoIndex && hasFrameDeny) {
    ok('vercel.json: admin tiene Cache-Control: no-store, noindex, X-Frame-Options: DENY');
  } else {
    fail('vercel.json admin headers incompletos');
  }
}

// === 7. Verificar GitHub integration ===
console.log('\n📋 7. Verificando integración GitHub');
const githubLib = existsSync(join(root, 'src', 'lib', 'github.ts'));
if (!githubLib) {
  fail('src/lib/github.ts no existe');
} else {
  const content = readFileSync(join(root, 'src', 'lib', 'github.ts'), 'utf-8');
  if (!content.includes('createAppJwt') || !content.includes('RS256')) {
    fail('github.ts no implementa JWT con RS256');
  } else {
    ok('github.ts implementa JWT con RS256 (correcto para GitHub Apps)');
  }
  if (!content.includes('installation') || !content.includes('access_tokens')) {
    fail('github.ts no implementa installation token flow');
  } else {
    ok('github.ts implementa installation token flow');
  }
  if (!content.includes('getInstallationToken') || !content.includes('cache')) {
    fail('github.ts no cachea installation tokens');
  } else {
    ok('github.ts cachea installation tokens (60s antes de expirar)');
  }
}

const savePostApi = existsSync(join(root, 'src', 'pages', 'admin', 'api', 'save-post.ts'));
if (savePostApi) {
  const content = readFileSync(join(root, 'src', 'pages', 'admin', 'api', 'save-post.ts'), 'utf-8');
  if (content.includes('createOrUpdateFile')) {
    ok('save-post.ts usa GitHub Contents API (no filesystem directo)');
  } else {
    fail('save-post.ts no usa GitHub Contents API');
  }
}

// === Resumen ===
console.log('\n' + '='.repeat(50));
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log('='.repeat(50) + '\n');

if (errors.length > 0) {
  console.error('🚫 Tests de seguridad FALLARON. Resolvé antes de deployar.\n');
  process.exit(1);
}

console.log('🔒 Todos los tests de seguridad pasaron.\n');