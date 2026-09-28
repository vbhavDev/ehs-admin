import { apiFetch } from './apiFetch';
import { FeatureFlag, PublicFeatureFlag } from '@/types/feature-flag.types';

/** Query key shared by the admin UI + FeatureFlagsProvider. */
export const FEATURE_FLAGS_QUERY_KEY = ['feature-flags'] as const;

export const featureFlagsService = {
  /** Detailed list (admin UI) — requires authentication. */
  getAll: async (): Promise<FeatureFlag[]> => {
    return apiFetch<FeatureFlag[]>('/admin/feature-flags');
  },

  /** Public projection (used by the client app + logged-out admin login page). */
  getPublic: async (): Promise<PublicFeatureFlag[]> => {
    return apiFetch<PublicFeatureFlag[]>('/public/feature-flags', { requireAuth: false });
  },

  enable: async (key: string): Promise<FeatureFlag> => {
    return apiFetch<FeatureFlag>(`/admin/feature-flags/${key}/enable`, { method: 'POST' });
  },

  disable: async (key: string): Promise<FeatureFlag> => {
    return apiFetch<FeatureFlag>(`/admin/feature-flags/${key}/disable`, { method: 'POST' });
  },

  reset: async (key: string): Promise<FeatureFlag> => {
    return apiFetch<FeatureFlag>(`/admin/feature-flags/${key}/override`, { method: 'DELETE' });
  },
};
