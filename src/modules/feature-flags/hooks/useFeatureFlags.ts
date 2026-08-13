import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureFlagsService } from '@/services/feature-flags.service';
import { FEATURE_FLAG_KEYS, FeatureFlag } from '@/types/feature-flag.types';
import { useFeatureFlagsContext } from '@/providers/FeatureFlagsProvider';
import toast from 'react-hot-toast';

/**
 * Admin CRUD hook for the Feature Toggles page (authenticated, super-admin /
 * devops only). Toggles persist instantly on the backend and refresh both the
 * detailed list and the public enforcement cache.
 */
export const useFeatureFlags = () => {
  const queryClient = useQueryClient();

  const flagsQuery = useQuery({
    queryKey: ['feature-flags', 'admin'],
    queryFn: () => featureFlagsService.getAll(),
    staleTime: 30_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
  };

  const enableMutation = useMutation({
    mutationFn: (key: string) => featureFlagsService.enable(key),
    onSuccess: () => {
      invalidate();
      toast.success('Feature enabled');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to enable feature'),
  });

  const disableMutation = useMutation({
    mutationFn: (key: string) => featureFlagsService.disable(key),
    onSuccess: () => {
      invalidate();
      toast.success('Feature disabled');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to disable feature'),
  });

  // Flip the flag to its opposite state: enabled → disable, disabled → enable.
  const toggleFlag = (flag: FeatureFlag): Promise<FeatureFlag> =>
    flag.enabled ? disableMutation.mutateAsync(flag.key) : enableMutation.mutateAsync(flag.key);

  return {
    flags: flagsQuery.data || [],
    isLoading: flagsQuery.isLoading,
    isError: flagsQuery.isError,
    toggleFlag,
    isToggling: enableMutation.isPending || disableMutation.isPending,
  };
};

/**
 * Convenience hook for enforcement checks across the app. Returns the enabled
 * state of a kill-switch flag (fail-open when unknown — the backend enforces
 * regardless).
 */
export const useFeatureFlag = (
  key: (typeof FEATURE_FLAG_KEYS)[keyof typeof FEATURE_FLAG_KEYS],
): boolean => {
  const ctx = useFeatureFlagsContext();
  return ctx.isFlagEnabled(key);
};
