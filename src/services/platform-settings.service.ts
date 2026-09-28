import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';
import {
  PlatformSettings,
  PublicBranding,
  UpdatePlatformSettingsData,
} from '@/types/platform-settings.types';

/** Platform settings API — read for all admins, update restricted to DevOps. */
export const platformSettingsService = {
  /** Full settings — requires admin auth (branding consumption). */
  async getSettings(): Promise<PlatformSettings> {
    return apiFetch<PlatformSettings>(API_ENDPOINTS.ADMIN.PLATFORM_SETTINGS.BASE, {
      method: 'GET',
    });
  },

  /**
   * Public branding — NO auth. Used on the login page (logged out, first
   * visit) so the theme applies before any cached/local credentials exist.
   */
  async getPublicBranding(): Promise<PublicBranding> {
    return apiFetch<PublicBranding>(API_ENDPOINTS.PUBLIC.BRANDING, {
      method: 'GET',
      requireAuth: false,
    });
  },

  async updateSettings(data: UpdatePlatformSettingsData): Promise<PlatformSettings> {
    return apiFetch<PlatformSettings>(API_ENDPOINTS.ADMIN.PLATFORM_SETTINGS.BASE, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async truncateClientData(): Promise<{ success: boolean; deletedCount: number }> {
    return apiFetch<{ success: boolean; deletedCount: number }>(
      API_ENDPOINTS.ADMIN.PLATFORM_SETTINGS.TRUNCATE_CLIENT_DATA,
      {
        method: 'PATCH',
      },
    );
  },
};
