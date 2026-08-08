'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { platformSettingsService } from '@/services/platform-settings.service';
import { BRAND_SETTINGS_QUERY_KEY } from '@/providers/BrandThemeProvider';
import { UpdatePlatformSettingsData } from '@/types/platform-settings.types';

export const PLATFORM_SETTINGS_QUERY_KEY = ['platform-settings'];

export function usePlatformSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: PLATFORM_SETTINGS_QUERY_KEY,
    queryFn: () => platformSettingsService.getSettings(),
    staleTime: 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePlatformSettingsData) => platformSettingsService.updateSettings(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(PLATFORM_SETTINGS_QUERY_KEY, updated);
      // Recolor the panel instantly — don't wait for the 30s brand poll
      queryClient.invalidateQueries({ queryKey: BRAND_SETTINGS_QUERY_KEY });
      toast.success('Platform settings updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update platform settings');
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
