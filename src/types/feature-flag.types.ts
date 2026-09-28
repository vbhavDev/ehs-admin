export type FeatureFlagScope = 'admin' | 'client' | 'both';

export interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string;
  category: string;
  scope: FeatureFlagScope;
  enabled: boolean;
  isLocked: boolean;
  updatedAt?: string;
}

/** Public projection returned by GET /public/feature-flags. */
export interface PublicFeatureFlag {
  key: string;
  enabled: boolean;
  scope: FeatureFlagScope;
}

/** Stable kill-switch keys used across the admin app for enforcement. */
export const FEATURE_FLAG_KEYS = {
  ADMIN_CONTENT_PROTECTION: 'admin_content_protection',
  ADMIN_SIGNUP: 'admin_signup',
  ADMIN_LOGIN: 'admin_login',
  CLIENT_SIGNUP: 'client_signup',
  CLIENT_LOGIN: 'client_login',
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[keyof typeof FEATURE_FLAG_KEYS];
