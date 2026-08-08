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
