import { ClientTheme, ThemeTokens } from '@/types/client-design.types';

/**
 * Color Hunt Adapter for EHS Admin Platform Settings.
 * Converts 4-color palettes or Color Hunt URLs into WCAG contrast-compliant design system tokens.
 */

export interface ColorHuntPreset {
  id: string;
  name: string;
  url: string;
  colors: [string, string, string, string];
  mode: 'dark' | 'light';
}

/** Calculate YIQ contrast to select white (#ffffff) or dark (#0f172a) text */
export function getContrastingColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2) || '0', 16);
  const g = parseInt(hex.substring(2, 4) || '0', 16);
  const b = parseInt(hex.substring(4, 6) || '0', 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0f172a' : '#ffffff';
}

/** Calculate relative luminance (0.0 to 1.0) */
export function getLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2) || '0', 16) / 255;
  const g = parseInt(hex.substring(2, 4) || '0', 16) / 255;
  const b = parseInt(hex.substring(4, 6) || '0', 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Parses Color Hunt input:
 * - URL: `https://colorhunt.com/palette/070f2b1b1a55535c919290c3`
 * - 24-character code: `"070f2b1b1a55535c919290c3"`
 * - Hex array: `["#070F2B", "#1B1A55", "#535C91", "#9290C3"]`
 */
export function parseColorHuntPalette(input: string | string[]): [string, string, string, string] {
  let colors: string[] = [];

  if (Array.isArray(input)) {
    colors = input.map((c) => (c.startsWith('#') ? c : `#${c}`));
  } else {
    let clean = input.trim();
    if (clean.includes('/palette/')) {
      clean = clean.split('/palette/')[1] || clean;
    }
    clean = clean.replace(/[^0-9a-fA-F]/g, '');

    if (clean.length === 24) {
      colors = [
        `#${clean.slice(0, 6)}`,
        `#${clean.slice(6, 12)}`,
        `#${clean.slice(12, 18)}`,
        `#${clean.slice(18, 24)}`,
      ];
    }
  }

  if (colors.length < 4) {
    throw new Error(
      'Invalid Color Hunt palette format. Provide 4 hex colors or a 24-character palette code.',
    );
  }

  return [colors[0]!, colors[1]!, colors[2]!, colors[3]!];
}

/** Generate 19 ThemeTokens from 4 Color Hunt colors */
export function generateThemeTokensFromColorHunt(
  input: string | string[],
  modeOverride?: 'dark' | 'light',
): { tokens: ThemeTokens; mode: 'dark' | 'light' } {
  const colors = parseColorHuntPalette(input);
  const sorted = [...colors].sort((a, b) => getLuminance(a) - getLuminance(b));

  const c0 = sorted[0] ?? '#0a0e1a';
  const c1 = sorted[1] ?? '#111827';
  const c2 = sorted[2] ?? '#1f2937';
  const c3 = sorted[3] ?? '#38bdf8';

  const avgLuminance =
    (getLuminance(c0) + getLuminance(c1) + getLuminance(c2) + getLuminance(c3)) / 4;
  const mode = modeOverride || (avgLuminance < 0.5 ? 'dark' : 'light');

  let bg: string;
  let surface: string;
  let surfaceElevated: string;
  let primary: string;
  let accent: string;
  let fg: string;

  if (mode === 'dark') {
    bg = c0;
    surface = c1;
    surfaceElevated = c2;
    primary = c3;
    accent = c2;
    fg = getContrastingColor(bg);
  } else {
    bg = c3;
    surface = c2;
    surfaceElevated = c1;
    primary = c0;
    accent = c1;
    fg = getContrastingColor(bg);
  }

  const tokens: ThemeTokens = {
    primary,
    primaryForeground: getContrastingColor(primary),
    accent,
    accentForeground: getContrastingColor(accent),
    background: bg,
    foreground: fg,
    surface,
    surfaceForeground: getContrastingColor(surface),
    surfaceElevated,
    mutedForeground: mode === 'dark' ? '#9ca3af' : '#6b7280',
    border: c1,
    success: '#388e3c',
    successForeground: '#ffffff',
    warning: '#f9a825',
    warningForeground: '#1a1000',
    error: '#d32f2f',
    errorForeground: '#ffffff',
    info: primary,
    infoForeground: getContrastingColor(primary),
  };

  return { tokens, mode };
}

/** Create a full ClientTheme object from Color Hunt input */
export function createThemeFromColorHunt(
  input: string | string[],
  name: string,
  id: string,
  modeOverride?: 'dark' | 'light',
): ClientTheme {
  const { tokens, mode } = generateThemeTokensFromColorHunt(input, modeOverride);
  return {
    id,
    name,
    mode,
    description: `Generated from Color Hunt palette`,
    tokens,
  };
}

/** Curated Color Hunt Presets for Admin & Client Design System */
export const COLOR_HUNT_PRESETS: ColorHuntPreset[] = [
  {
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire',
    url: 'https://colorhunt.com/palette/070f2b1b1a55535c919290c3',
    colors: ['#070f2b', '#1b1a55', '#535c91', '#9290c3'],
    mode: 'dark',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    url: 'https://colorhunt.com/palette/0f0e17ff8906f25f4cfffffe',
    colors: ['#0f0e17', '#ff8906', '#f25f4c', '#fffffe'],
    mode: 'dark',
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate',
    url: 'https://colorhunt.com/palette/222831393e4600adb5eeeeee',
    colors: ['#222831', '#393e46', '#00adb5', '#eeeeee'],
    mode: 'dark',
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    url: 'https://colorhunt.com/palette/0926351b42425c83749ec8b9',
    colors: ['#092635', '#1b4242', '#5c8374', '#9ec8b9'],
    mode: 'dark',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    url: 'https://colorhunt.com/palette/2b10557597deff6b6bffe66d',
    colors: ['#2b1055', '#7597de', '#ff6b6b', '#ffe66d'],
    mode: 'dark',
  },
  {
    id: 'pastel-mint',
    name: 'Pastel Mint',
    url: 'https://colorhunt.com/palette/e8f9fd79dae80aa1dd2155cd',
    colors: ['#2155cd', '#0aa1dd', '#79dae8', '#e8f9fd'],
    mode: 'light',
  },
];
