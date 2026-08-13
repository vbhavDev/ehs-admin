'use client';
import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { featureFlagsService } from '@/services/feature-flags.service';
import type { PublicFeatureFlag } from '@/types/feature-flag.types';

interface FeatureFlagsContextValue {
  /** Map of flag key → enabled, hydrated from the public endpoint. */
  flags: Record<string, boolean>;
  /** True until the first fetch resolves (used to avoid premature gating). */
  isLoading: boolean;
  /** Convenience checker. Returns true when a flag is enabled (or unknown). */
  isFlagEnabled: (key: string) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({
  flags: {},
  isLoading: true,
  isFlagEnabled: () => true,
});

/**
 * App-wide feature-flag state fetched from the public endpoint so it works
 * both when authenticated (admin panel) and logged-out (login page needs the
 * `admin_login` / `admin_signup` flags before any form renders).
 *
 * Enforcement points:
 *  - `SecurityProvider` → `admin_content_protection`
 *  - `LoginForm` → `admin_login`
 *  - `SignupForm` → `admin_signup`
 * (Backend enforces the same flags server-side regardless of the UI state.)
 */
export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading } = useQuery({
    queryKey: ['feature-flags', 'public'],
    queryFn: () => featureFlagsService.getPublic(),
    enabled: mounted,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const value = useMemo<FeatureFlagsContextValue>(() => {
    const flags: Record<string, boolean> = {};
    (data || []).forEach((f: PublicFeatureFlag) => {
      flags[f.key] = f.enabled;
    });
    return {
      flags,
      isLoading: mounted && isLoading,
      // Unknown flags default to enabled (fail-open for UX) — the backend
      // still enforces, so a missing flag cannot actually bypass security.
      isFlagEnabled: (key: string) => (key in flags ? !!flags[key] : true),
    };
  }, [data, isLoading, mounted]);

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
};

export const useFeatureFlagsContext = () => useContext(FeatureFlagsContext);
