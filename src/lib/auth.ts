/**
 * src/lib/auth.ts
 *
 * Auth helpers para el dashboard /admin.
 * - Password hash con scrypt (Node built-in, no extra deps)
 * - Session via cookie HttpOnly + signed
 * - Rate limit in-memory (suficiente para single-user)
 *
 * NOTA: Este modulo es server-only. Si se importa en componentes cliente,
 * las funciones crypto fallaran en build time.
 */

import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import type { AstroCookies } from 'astro';

const SCRYPT_KEYLEN = 64;
const SESSION_COOKIE = 'td_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 horas

// --- Password hashing ---

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expectedBuf = Buffer.from(expected, 'hex');
  if (derived.length !== expectedBuf.length) return false;
  return timingSafeEqual(derived, expectedBuf);
}

// --- Session token ---

function getSessionSecret(): string {
  const secret = import.meta.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    // En dev, fallback que NO debe usarse en producción.
    // El middleware bloquea /admin si ADMIN_ENABLED=true sin secret,
    // así que este fallback solo corre en dev local.
    if (import.meta.env.DEV) {
      return 'dev-only-insecure-secret-do-not-use-in-prod';
    }
    throw new Error(
      'ADMIN_SESSION_SECRET is required when ADMIN_ENABLED=true. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  if (secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be at least 32 chars');
  }
  return secret;
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

function encodeSession(payload: SessionPayload, secret: string): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, 'utf-8').toString('base64url');
  const sig = sign(b64, secret);
  return `${b64}.${sig}`;
}

function decodeSession(token: string, secret: string): SessionPayload | null {
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;
  if (sign(b64, secret) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf-8')) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSession(cookies: AstroCookies, userId: string): void {
  const now = Date.now();
  const payload: SessionPayload = {
    sub: userId,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const token = encodeSession(payload, getSessionSecret());
  cookies.set(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function destroySession(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function getSessionUser(cookies: AstroCookies): string | null {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = decodeSession(token, getSessionSecret());
  return payload?.sub ?? null;
}

// --- Rate limit (in-memory, single-instance) ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  return {
    allowed: entry.count <= max,
    remaining: Math.max(0, max - entry.count),
    resetAt: entry.resetAt,
  };
}

// --- Feature flag ---

export function isAdminEnabled(): boolean {
  return import.meta.env.ADMIN_ENABLED === 'true';
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(import.meta.env.ADMIN_PASSWORD_HASH);
}