import { THEME_CRYPTO_CONTEXT } from './theme-crypto';

/**
 * Pre-paint theme boot <head> script (see layout.tsx). Runs synchronously
 * during HTML parsing — BEFORE the first paint — so the cached brand colors
 * are applied with zero default-red flash, INCLUDING ON THE UNAUTHENTICATED
 * LOGIN PAGE (the real settings are auth-gated, so the cache is the only
 * source until the user logs in on that browser).
 *
 *  - Must remain self-contained and SYNCHRONOUS (WebCrypto is async-only).
 *  - The decrypt algorithm below is a literal copy of decryptTheme() in
 *    theme-crypto.ts and MUST stay byte-for-byte identical.
 *
 * Payload:  CachedAdminTheme = { primaryColor, accentColor }
 */
export const ADMIN_THEME_BOOT_SCRIPT = `(function () {
  try {
    var NS=${JSON.stringify(THEME_CRYPTO_CONTEXT.namespace)};
    var SEC=${JSON.stringify(THEME_CRYPTO_CONTEXT.secret)};
    var KEY=${JSON.stringify(THEME_CRYPTO_CONTEXT.storageKey)};
    var raw = localStorage.getItem(KEY);
    if (!raw) return;
    function fnv(s) {
      var h = 0x811c9dc5, i;
      for (i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
      }
      return h >>> 0;
    }
    function ks(base, len) {
      var x = fnv(base), o = '', i;
      for (i = 0; i < len; i++) {
        x ^= (x << 13) >>> 0;
        x ^= x >>> 17;
        x ^= (x << 5) >>> 0;
        x >>>= 0;
        o += String.fromCharCode(x & 0xff);
      }
      return o;
    }
    var dec;
    try { dec = atob(raw); } catch (e) { return; }
    var last = dec.lastIndexOf('|');
    if (last < 0) return;
    var body = dec.slice(0, last), tag = dec.slice(last + 1);
    var bs = body.indexOf('|');
    if (bs < 0) return;
    var nonce = body.slice(0, bs), ct = body.slice(bs + 1);
    var expect = fnv(NS + SEC + nonce + ct).toString(16).padStart(8, '0');
    if (expect !== tag) return;
    var k2 = ks(NS + '-' + SEC + ':' + nonce, ct.length), p = '', i;
    for (i = 0; i < ct.length; i++) {
      p += String.fromCharCode(ct.charCodeAt(i) ^ k2.charCodeAt(i));
    }
    var bytes = new Uint8Array(p.length);
    for (i = 0; i < p.length; i++) bytes[i] = p.charCodeAt(i);
    var obj;
    try { obj = JSON.parse(new TextDecoder().decode(bytes)); } catch (e) { return; }
    if (!obj) return;
    var root = document.documentElement;
    if (obj.primaryColor) root.style.setProperty('--app-primary', obj.primaryColor);
    if (obj.accentColor) root.style.setProperty('--app-accent', obj.accentColor);
  } catch (e) {}
})();`;
