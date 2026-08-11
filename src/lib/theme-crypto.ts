/**
 * Synchronous encrypted local-storage for the admin brand theme (anti-flash).
 *
 * THREAT MODEL — read this before relying on it:
 *  - This is OBFUSCATION / tamper-evidence grade. The key ships inside the
 *    client bundle, so a determined user can always extract it. There is NO
 *    real secrecy achievable in a browser. The goal here is to keep the
 *    cached theme unreadable / not casually editable in localStorage and to
 *    satisfy the "encrypted at rest on the client" requirement.
 *
 *  - It MUST be SYNCHRONOUS because the pre-paint boot <script> (see
 *    theme-boot.ts) runs in <head> before React hydrates, where WebCrypto's
 *    SubtleCrypto is async-only and therefore unusable.
 *
 * Keep the algorithm byte-for-byte identical to the copy embedded in
 * theme-boot.ts — a corrupt/mismatched read is silently discarded.
 *
 * Wire format (base64 via btoa/atob):
 *    nonce(8) || '|' || ciphertext || '|' || authTag
 * Cipher : XOR against a keyed xorshift32 keystream derived from
 *          (namespace, secret, nonce). No crypto dependency required.
 * Auth   : FNV-1a over (namespace || secret || nonce || ciphertext).
 */
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function fnv1a(str: string): number {
  let h = FNV_OFFSET;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h >>> 0;
}

/** Deterministic pseudo-random keystream of `len` bytes (xorshift32). */
function keystream(base: string, len: number): string {
  let x = fnv1a(base);
  let out = '';
  for (let i = 0; i < len; i++) {
    x ^= (x << 13) >>> 0;
    x ^= x >>> 17;
    x ^= (x << 5) >>> 0;
    x >>>= 0;
    out += String.fromCharCode(x & 0xff);
  }
  return out;
}

export interface ThemeCryptoContext {
  /** Per-app namespace — keeps client & admin caches distinct. */
  namespace: string;
  /** Per-app embedded secret (obfuscation — see header). */
  secret: string;
  /** localStorage key that holds the encrypted payload. */
  storageKey: string;
}

function bytesToBinary(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i] ?? 0);
  }
  return bin;
}

function randomNonce(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 8; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytesToBinary(bytes);
}

/** Encrypt + base64 a JSON-able payload for storage. */
export function encryptTheme<T>(ctx: ThemeCryptoContext, payload: T): string {
  const plain = bytesToBinary(new TextEncoder().encode(JSON.stringify(payload)));
  const nonce = randomNonce();
  const ks = keystream(`${ctx.namespace}-${ctx.secret}:${nonce}`, plain.length);
  let ct = '';
  for (let i = 0; i < plain.length; i++) {
    ct += String.fromCharCode(plain.charCodeAt(i) ^ ks.charCodeAt(i));
  }
  const tag = fnv1a(ctx.namespace + ctx.secret + nonce + ct)
    .toString(16)
    .padStart(8, '0');
  return btoa(`${nonce}|${ct}|${tag}`);
}

/** Attempt to decrypt; returns null on any tamper / foreign-key / parse error. */
export function decryptTheme<T>(ctx: ThemeCryptoContext, encoded: string | null): T | null {
  if (!encoded) return null;
  let raw: string;
  try {
    raw = atob(encoded);
  } catch {
    return null;
  }
  const last = raw.lastIndexOf('|');
  if (last < 0) return null;
  const body = raw.slice(0, last);
  const tag = raw.slice(last + 1);
  const bs = body.indexOf('|');
  if (bs < 0) return null;
  const nonce = body.slice(0, bs);
  const ct = body.slice(bs + 1);
  const expect = fnv1a(ctx.namespace + ctx.secret + nonce + ct)
    .toString(16)
    .padStart(8, '0');
  if (expect !== tag) return null; // tampered or written with a different key

  const ks = keystream(`${ctx.namespace}-${ctx.secret}:${nonce}`, ct.length);
  let plain = '';
  for (let i = 0; i < ct.length; i++) {
    plain += String.fromCharCode(ct.charCodeAt(i) ^ ks.charCodeAt(i));
  }
  const bytes = new Uint8Array(plain.length);
  for (let i = 0; i < plain.length; i++) bytes[i] = plain.charCodeAt(i);
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}

/** Read + safely decrypt the cached theme (null if absent/invalid/failed). */
export function loadCachedTheme<T>(ctx: ThemeCryptoContext): T | null {
  if (typeof window === 'undefined') return null;
  try {
    return decryptTheme<T>(ctx, window.localStorage.getItem(ctx.storageKey));
  } catch {
    return null;
  }
}

/** Encrypt + persist the theme payload. Failures are non-fatal. */
export function saveCachedTheme<T>(ctx: ThemeCryptoContext, payload: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ctx.storageKey, encryptTheme(ctx, payload));
  } catch {
    // storage full/unavailable — the theme is still applied in-memory
  }
}

/**
 * Admin context. Distinct namespace/secret/key from the client app so the
 * caches never collide, and the admin cache works on the LOGIN page (logged
 * out) because it is local, not fetched from the auth-gated settings API.
 */
export const THEME_CRYPTO_CONTEXT: ThemeCryptoContext = {
  namespace: 'ehs:theme:admin',
  secret: 'ad9c2e7f1b6d8a3c4e5f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
  storageKey: 'ehs-admin-theme-encrypted',
};

/** Shape of the encrypted admin cache — the two runtime brand colors. */
export interface CachedAdminTheme {
  primaryColor: string;
  accentColor: string;
}
