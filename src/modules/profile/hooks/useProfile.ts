'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { profileService } from '@/services/profile.service';
import { fileService } from '@/modules/media/services/file.service';
import { getImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { User } from '@/types/user.types';
import { ChangePasswordData, UpdateProfileData } from '@/types/profile.types';

export function useProfile() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  /** Keep zustand store + TanStack profile cache in sync after a mutation. */
  const syncUser = (updated: User) => {
    updateUser(updated);
    queryClient.setQueryData(['auth-profile'], updated);
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => profileService.updateProfile(data),
    onSuccess: (updated) => {
      syncUser(updated);
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  // Avatar: FileUploadModal uploads via FilesModule → attach File ID to profile
  const updateAvatarMutation = useMutation({
    mutationFn: (fileId: string) => profileService.updateProfile({ profileImageId: fileId }),
    onSuccess: (updated) => {
      syncUser(updated);
      queryClient.invalidateQueries({ queryKey: ['avatar-url'] });
      toast.success('Profile photo updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile photo');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => profileService.changePassword(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });

  return {
    user,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateAvatar: updateAvatarMutation.mutateAsync,
    isUpdatingAvatar: updateAvatarMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
}

/**
 * Resolve the avatar URL at read time (File Upload Law §3.5). Priority:
 * 1. `profileImage` — backend ResponseInterceptor maps the populated File to
 *    an ImageLinks object `{ original, ...variants }` (legacy string URL also handled)
 * 2. `profileImageId.url` — injected onto the populated File by the interceptor
 * 3. `GET /admin/files/:id/url` query fallback (cached)
 */
export function useAvatarUrl(user: User | null | undefined): string {
  const directUrl = getImageUrl(user?.profileImage);
  const populatedUrl =
    typeof user?.profileImageId === 'object' ? user?.profileImageId?.url : undefined;
  const fileId =
    typeof user?.profileImageId === 'string' ? user.profileImageId : user?.profileImageId?.id;

  const urlQuery = useQuery({
    queryKey: ['avatar-url', fileId],
    queryFn: () => fileService.getFileUrl(fileId as string),
    enabled: !!fileId && !directUrl && !populatedUrl,
    staleTime: 5 * 60 * 1000,
  });

  return directUrl || populatedUrl || urlQuery.data?.url || '';
}
