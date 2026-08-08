import { ImageLinks } from '@/modules/websites/types/website.types';

export interface Role {
  id: string;
  name: string;
  roleKey: string;
  isActive: boolean;
  isShow: boolean;
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role?: Role;
  roles?: Role[];
  isActive: boolean;
  acceptTerms: boolean;
  /**
   * Avatar links — ResponseInterceptor maps the populated `profileImageId`
   * File to `{ original, ...urlVariants }` (or a legacy string URL).
   */
  profileImage?: string | ImageLinks | null;
  /** File Upload Law compliant avatar reference (populated File or its ID) */
  profileImageId?: string | { id: string; url?: string } | null;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role?: Role;
  roles?: Role[];
  profileImage?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
  acceptTerms: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
  message?: string;
}
