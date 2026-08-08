'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformSettingsService } from '@/services/platform-settings.service';
import { useAuthStore } from '@/store/auth.store';

export const BRAND_SETTINGS_QUERY_KEY = ['platform-settings-brand'];

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
 */
export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.access_token);

  const { data } = useQuery({
    queryKey: BRAND_SETTINGS_QUERY_KEY,
    queryFn: () => platformSettingsService.getSettings(),
    enabled: !!accessToken, // admin-only endpoint — skip on auth pages
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    if (data.primaryColor && HEX_RE.test(data.primaryColor)) {
      root.style.setProperty('--app-primary', data.primaryColor);
    }
    if (data.accentColor && HEX_RE.test(data.accentColor)) {
      root.style.setProperty('--app-accent', data.accentColor);
    }
  }, [data]);

  return children;
}
