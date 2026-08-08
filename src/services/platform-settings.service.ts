import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';
import { PlatformSettings, UpdatePlatformSettingsData } from '@/types/platform-settings.types';

/** Platform settings API — read for all admins, update restricted to DevOps. */
export const platformSettingsService = {
  async getSettings(): Promise<PlatformSettings> {
    return apiFetch<PlatformSettings>(API_ENDPOINTS.ADMIN.PLATFORM_SETTINGS.BASE, {
      method: 'GET',
    });
  },

  async updateSettings(data: UpdatePlatformSettingsData): Promise<PlatformSettings> {
    return apiFetch<PlatformSettings>(API_ENDPOINTS.ADMIN.PLATFORM_SETTINGS.BASE, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
