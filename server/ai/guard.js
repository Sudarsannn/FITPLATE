/**
 * Who may call the AI routes, from where, and how often (review 2026-10-28 FIX 2).
 *
 *   verifyFirebaseToken  checks a Firebase ID token against Google's public keys
 *                        (RS256, audience = the Firebase project, issuer, expiry).
 *   corsHeaders          lets only the app's own web origins read answers in a browser.
 *   bump                 a daily counter per key. Uses the Workers KV binding AI_LIMITS
 *                        when it exists (shared by every Worker instance); otherwise a
 *                        per-instance map, which still slows a single caller but resets
 *                        whenever the Worker restarts.
 */

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
export const DEFAULT_ORIGINS = ['https://fitplate.sudarsanmohanchander.workers.dev', 'http://localhost:8081', 'http://localhost:19006'];

/** Daily caps. A "create" is one /compose call (the expensive, queue-writing step). */
export const LIMITS = { userCreate: 5, ipCreate: 20, userCalls: 60, ipCalls: 150 };

const unb64url = (s) => {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
const parseJson = (s) => JSON.parse(new TextDecoder().decode(unb64url(s)));

let jwks = { at: 0, keys: /** @type {any[]} */ ([]) };

async function keyFor(kid, fetchImpl, now) {
  const find = () => jwks.keys.find((k) => k.kid === kid);
  if (!find() || now - jwks.at > 3_600_000) {
    const res = await fetchImpl(JWKS_URL);
    if (res.ok) jwks = { at: now, keys: (await res.json()).keys ?? [] };
  }
  const jwk = find();
  if (!jwk) return null;
  return crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
}

/** The Firebase user id in a valid ID token for `projectId`, or null for anything else. Never throws. */
export async function verifyFirebaseToken(token, projectId, fetchImpl, now = Date.now()) {
  try {
    if (!token || !projectId) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = parseJson(parts[0]);
    const payload = parseJson(parts[1]);
    if (header.alg !== 'RS256' || !header.kid) return null;
    const sec = Math.floor(now / 1000);
    if (payload.aud !== projectId || payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (typeof payload.sub !== 'string' || !payload.sub || typeof payload.exp !== 'number' || payload.exp <= sec || (payload.iat ?? 0) > sec + 300) return null;
    const key = await keyFor(header.kid, fetchImpl, now);
    if (!key) return null;
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, unb64url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    return ok ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Short stable id for a user, so the queue never stores the raw Firebase uid. */
export async function hashId(id) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`fitplate-ai:${id}`));
  return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** CORS headers for this request: the caller's origin is echoed only when it is one of the app's own. */
export function corsHeaders(request, env) {
  const allowed = env.AI_ALLOWED_ORIGINS ? String(env.AI_ALLOWED_ORIGINS).split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_ORIGINS;
  const origin = request.headers.get('origin');
  const h = { vary: 'Origin', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type, authorization', 'access-control-max-age': '86400' };
  if (origin && allowed.includes(origin)) h['access-control-allow-origin'] = origin;
  return h;
}

/** True when a browser caller's origin is not one of the app's (native apps send no Origin and pass). */
export const originBlocked = (request, env) => {
  const origin = request.headers.get('origin');
  return Boolean(origin) && !corsHeaders(request, env)['access-control-allow-origin'];
};

const memory = new Map();

/** Adds one to today's count for `key`; false (and no count) when it is already at `limit`. */
export async function bump(env, key, limit, now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10);
  const k = `ai:${day}:${key}`;
  if (env.AI_LIMITS) {
    const n = Number(await env.AI_LIMITS.get(k)) || 0;
    if (n >= limit) return false;
    await env.AI_LIMITS.put(k, String(n + 1), { expirationTtl: 172_800 });
    return true;
  }
  for (const old of memory.keys()) if (!old.startsWith(`ai:${day}:`)) memory.delete(old);
  const n = memory.get(k) ?? 0;
  if (n >= limit) return false;
  memory.set(k, n + 1);
  return true;
}

/** Tests only: put signing keys in the cache so no network call is needed. */
export function __setKeysForTest(keys) {
  jwks = { at: Date.now(), keys };
}
