/** Self-service profile payloads — backend `Admin | Auth` /admin/auth/profile + /change-password */

export interface UpdateProfileData {
  fullName?: string;
  /** File ObjectId from FilesModule upload (File Upload Law — never a raw URL) */
  profileImageId?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
