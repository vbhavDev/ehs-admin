import { ImageLinks } from '@/modules/websites/types/website.types';

/** Platform settings singleton — backend `Admin | Platform Settings` module. */
export interface PlatformSettings {
  id: string;

  /* Branding — File refs (populated objects carry `url` via ResponseInterceptor) */
  logoFileId?: string | { id: string; url?: string } | null;
  logoDarkFileId?: string | { id: string; url?: string } | null;
  faviconFileId?: string | { id: string; url?: string } | null;
  /** Interceptor-mapped link objects (read time) */
  logoFile?: ImageLinks | null;
  logoDarkFile?: ImageLinks | null;
  faviconFile?: ImageLinks | null;

  /* UI Colors / Theme */
  primaryColor: string;
  accentColor: string;
  defaultTheme: 'dark' | 'light' | 'system';

  /* Platform */
  platformName: string;
  tagline: string;
  supportEmail: string;
  defaultLanguage: 'en' | 'hi' | 'ar';
  timezone: string;
  maintenanceMode: boolean;
  allowSignups: boolean;

  createdAt: string;
  updatedAt: string;
}

/**
 * Public platform branding — served WITHOUT auth so the login page can theme
 * on the very first visit (before any local cache exists). Safe projection:
 * colors + name + resolved logo/favicon CDN URLs only.
 */
export interface PublicBranding {
  platformName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  defaultTheme: 'dark' | 'light' | 'system';
  logo: string | null;
  logoDark: string | null;
  favicon: string | null;
}

/** Partial update — file fields accept a File ID string ('' clears the ref). */
export interface UpdatePlatformSettingsData {
  logoFileId?: string;
  logoDarkFileId?: string;
  faviconFileId?: string;
  primaryColor?: string;
  accentColor?: string;
  defaultTheme?: 'dark' | 'light' | 'system';
  platformName?: string;
  tagline?: string;
  supportEmail?: string;
  defaultLanguage?: 'en' | 'hi' | 'ar';
  timezone?: string;
  maintenanceMode?: boolean;
  allowSignups?: boolean;
}
