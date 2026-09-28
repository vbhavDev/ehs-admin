/** Client App design configuration — backend `client-design` module contracts. */

export interface ThemeTokens {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  surface: string;
  surfaceForeground: string;
  surfaceElevated: string;
  mutedForeground: string;
  border: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;
}

export const THEME_TOKEN_KEYS = [
  'primary',
  'primaryForeground',
  'accent',
  'accentForeground',
  'background',
  'foreground',
  'surface',
  'surfaceForeground',
  'surfaceElevated',
  'mutedForeground',
  'border',
  'success',
  'successForeground',
  'warning',
  'warningForeground',
  'error',
  'errorForeground',
  'info',
  'infoForeground',
] as const;

export type ThemeTokenKey = (typeof THEME_TOKEN_KEYS)[number];

export interface ClientTheme {
  id: string;
  name: string;
  mode: 'dark' | 'light';
  description?: string;
  tokens: ThemeTokens;
}

export interface ClientDesignConfig {
  id: string;
  configVersion: number;
  version: number;
  status: 'draft' | 'published' | 'archived';
  themes: ClientTheme[];
  activeThemeId: string;
  defaultMode: 'dark' | 'light' | 'system';
  allowUserModeSwitch: boolean;
  features: Record<string, boolean>;
  changeSummary: string;
  publishedBy?: { fullName: string; email: string } | null;
  publishedAt?: string | null;
}

export interface ClientDesignVersionSummary {
  version: number;
  status: string;
  changeSummary: string;
  publishedAt?: string | null;
  publishedBy?: { fullName: string; email: string } | null;
}

export interface ClientDesignOverview {
  draft: ClientDesignConfig | null;
  published: ClientDesignConfig | null;
  versions: ClientDesignVersionSummary[];
}

/** PUT /admin/client-design/draft payload */
export interface UpsertClientDesignDraftData {
  configVersion: number;
  themes: ClientTheme[];
  activeThemeId: string;
  defaultMode: 'dark' | 'light' | 'system';
  allowUserModeSwitch: boolean;
  features: Record<string, boolean>;
  changeSummary?: string;
}
