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

  /* ── Added for balanced dark/light variety on Shuffle ──────────────── */
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    url: 'https://colorhunt.com/palette/f0f7f4b6e3d476c7b03aa87e',
    colors: ['#f0f7f4', '#b6e3d4', '#76c7b0', '#3aa87e'],
    mode: 'light',
  },
  {
    id: 'blush-sand',
    name: 'Blush Sand',
    url: 'https://colorhunt.com/palette/fdf2f2fbd8d8f7a8a8e76f8a',
    colors: ['#fdf2f2', '#fbd8d8', '#f7a8a8', '#e76f8a'],
    mode: 'light',
  },
  {
    id: 'lavender-fog',
    name: 'Lavender Fog',
    url: 'https://colorhunt.com/palette/f7f5ffded6f6b9a7ea8c6fe0',
    colors: ['#f7f5ff', '#ded6f6', '#b9a7ea', '#8c6fe0'],
    mode: 'light',
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    url: 'https://colorhunt.com/palette/eaf6fbb7e0f263b7e02b87c4',
    colors: ['#eaf6fb', '#b7e0f2', '#63b7e0', '#2b87c4'],
    mode: 'light',
  },
  {
    id: 'sunny-sorbet',
    name: 'Sunny Sorbet',
    url: 'https://colorhunt.com/palette/fff7e6ffe39affc85cff9e2c',
    colors: ['#fff7e6', '#ffe39a', '#ffc85c', '#ff9e2c'],
    mode: 'light',
  },
  {
    id: 'royal-burgundy',
    name: 'Royal Burgundy',
    url: 'https://colorhunt.com/palette/1a0b2e5e2b68d14d72ffa43a',
    colors: ['#1a0b2e', '#5e2b68', '#d14d72', '#ffa43a'],
    mode: 'dark',
  },
  {
    id: 'crimson-night',
    name: 'Crimson Night',
    url: 'https://colorhunt.com/palette/0d0d0d3c096c9d4eddff4d6d',
    colors: ['#0d0d0d', '#3c096c', '#9d4edd', '#ff4d6d'],
    mode: 'dark',
  },
  {
    id: 'deep-ocean-teal',
    name: 'Deep Ocean Teal',
    url: 'https://colorhunt.com/palette/0211140a3d461f7a8c65d6ce',
    colors: ['#021114', '#0a3d46', '#1f7a8c', '#65d6ce'],
    mode: 'dark',
  },
];
