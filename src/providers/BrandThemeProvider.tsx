'use client';

import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformSettingsService } from '@/services/platform-settings.service';
import { useAuthStore } from '@/store/auth.store';
import { CachedAdminTheme, THEME_CRYPTO_CONTEXT, saveCachedTheme } from '@/lib/theme-crypto';

export const BRAND_SETTINGS_QUERY_KEY = ['platform-settings-brand'];
export const PUBLIC_BRANDING_QUERY_KEY = ['platform-branding-public'];

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Applies platform UI colors (DevOps → Platform Settings → UI Colors) to the
 * admin panel at runtime by setting `--app-primary` / `--app-accent` on :root.
 * The full brand/orange scales derive from those vars in globals.css.
 *
 * Fallbacks live in :root (current brand red/orange) — the panel is fully
 * usable if the settings API is unreachable. Polls every 30s + on window
 * focus so published color changes appear without a reload; the Platform
 * Settings save mutation invalidates this query for instant apply.
 *
 * Two sources:
 *  - PUBLIC branding (/public/branding, NO auth) runs ALWAYS — including on
 *    the logged-out LOGIN page and the very first visit — so the theme
 *    applies even before any local cache exists.
 *  - Full settings (/admin/platform-settings, auth-gated) is the authoritative
 *    source when logged in.
 * Every successful apply is PERSISTED ENCRYPTED to localStorage (see
 * lib/theme-boot.ts), which the pre-paint <head> script restores instantly.
 */
export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.access_token);

  // Public — themes the login page + first visit (no auth required).
  const { data: publicBranding } = useQuery({
    queryKey: PUBLIC_BRANDING_QUERY_KEY,
    queryFn: () => platformSettingsService.getPublicBranding(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Full settings — authoritative once logged in (admin-only endpoint).
  const { data } = useQuery({
    queryKey: BRAND_SETTINGS_QUERY_KEY,
    queryFn: () => platformSettingsService.getSettings(),
    enabled: !!accessToken, // admin-only endpoint — skip on auth pages
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  /** Validate hex, apply to :root, and persist encrypted for pre-paint restore. */
  const apply = useCallback((primary: string | undefined, accent: string | undefined) => {
    if (!primary && !accent) return;
    const root = document.documentElement;
    if (primary && HEX_RE.test(primary)) {
      root.style.setProperty('--app-primary', primary);
    }
    if (accent && HEX_RE.test(accent)) {
      root.style.setProperty('--app-accent', accent);
    }
    saveCachedTheme<CachedAdminTheme>(THEME_CRYPTO_CONTEXT, {
      primaryColor: primary ?? '',
      accentColor: accent ?? '',
    });
  }, []);

  useEffect(() => {
    if (data) apply(data.primaryColor, data.accentColor);
  }, [data, apply]);

  useEffect(() => {
    if (publicBranding) apply(publicBranding.primaryColor, publicBranding.accentColor);
  }, [publicBranding, apply]);

  return children;
}
