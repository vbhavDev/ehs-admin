import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';
import { User } from '@/types/user.types';
import { ChangePasswordData, UpdateProfileData } from '@/types/profile.types';

/**
 * Self-service profile API (admin panel `/profile` page).
 * Whitelisted backend endpoints — roles/isActive can never change here.
 */
export const profileService = {
  /** Update own full name and/or profile photo (by File ID) */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    return apiFetch<User>(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /** Change own password (current password verified server-side) */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
