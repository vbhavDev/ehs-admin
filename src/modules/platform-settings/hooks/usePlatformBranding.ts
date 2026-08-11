'use client';

import { useQuery } from '@tanstack/react-query';
import { platformSettingsService } from '@/services/platform-settings.service';
import { PUBLIC_BRANDING_QUERY_KEY } from '@/providers/BrandThemeProvider';
import { PublicBranding } from '@/types/platform-settings.types';

/**
 * Platform branding (logo/logoDark/platformName…) — PUBLIC, no auth needed.
 * Shares PUBLIC_BRANDING_QUERY_KEY with BrandThemeProvider so fetching the
 * full settings is not duplicated; the logo resolves the moment BrandTheme
 * or this hook mounts (works on the logged-out login page too).
 */
export function usePlatformBranding() {
  const { data, isLoading, isError } = useQuery<PublicBranding>({
    queryKey: PUBLIC_BRANDING_QUERY_KEY,
    queryFn: () => platformSettingsService.getPublicBranding(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return { branding: data ?? null, isLoading, isError };
}
