'use client';

import React, { useEffect, useState } from 'react';
import { Check, Monitor, Moon, Palette, Save, Sparkles, Sun } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { cn } from '@/lib/utils';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import { COLOR_HUNT_PRESETS } from '@/lib/colorhunt';

const COLOR_PRESETS = [
  { name: 'EHS Red', value: '#e31e24' },
  { name: 'Safety Blue', value: '#1565c0' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Pink', value: '#db2777' },
] as const;

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

type ThemeMode = 'dark' | 'light' | 'system';

/** One color field — preset swatches + native picker + hex input. */
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const valid = HEX_RE.test(value);

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            title={preset.name}
            aria-label={`${label}: ${preset.name}`}
            onClick={() => onChange(preset.value)}
            style={{ backgroundColor: preset.value }}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500/50',
              value.toLowerCase() === preset.value &&
                'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-navy-900',
            )}
          >
            {value.toLowerCase() === preset.value && <Check size={14} className="text-white" />}
          </button>
        ))}
        {/* Custom color via native picker */}
        <label
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-gray-300 text-gray-400 transition-transform duration-200 hover:scale-110 dark:border-navy-600"
          title="Custom color"
        >
          <Palette size={14} />
          <input
            type="color"
            value={valid ? value : '#e31e24'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={`${label} custom color picker`}
          />
        </label>
        <div className="w-28">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#e31e24"
            error={value !== '' && !valid ? 'Invalid hex color' : undefined}
            className="font-mono uppercase"
          />
        </div>
      </div>
    </div>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Moon }[] = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
];

/** UI Colors group — brand colors, Color Hunt palette picker, default theme, and a live preview. */
export function UiColorsTab() {
  const { settings, updateSettings, isUpdating } = usePlatformSettings();

  const [primaryColor, setPrimaryColor] = useState('#e31e24');
  const [accentColor, setAccentColor] = useState('#fb6514');
  const [defaultTheme, setDefaultTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    if (settings) {
      setPrimaryColor(settings.primaryColor);
      setAccentColor(settings.accentColor);
      setDefaultTheme(settings.defaultTheme);
    }
  }, [settings]);

  const isDirty =
    !!settings &&
    (primaryColor !== settings.primaryColor ||
      accentColor !== settings.accentColor ||
      defaultTheme !== settings.defaultTheme);

  const canSave = isDirty && HEX_RE.test(primaryColor) && HEX_RE.test(accentColor);

  const handleSave = async () => {
    try {
      await updateSettings({ primaryColor, accentColor, defaultTheme });
    } catch {
      // Error toast handled by the mutation
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      {/* Controls */}
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800/40 xl:col-span-3">
        {/* Color Hunt Fast Swatch Quick-Picker */}
        <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <Sparkles size={14} /> Color Hunt Fast Palette Swatches
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Select a pair to set Primary & Accent colors instantly:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {COLOR_HUNT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setPrimaryColor(preset.colors[0]);
                  setAccentColor(preset.colors[2]);
                }}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs transition-transform hover:scale-105 dark:border-navy-700 dark:bg-navy-900"
                title={`Set Primary: ${preset.colors[0]}, Accent: ${preset.colors[2]}`}
              >
                <div className="flex h-4 overflow-hidden rounded">
                  <span className="w-3" style={{ backgroundColor: preset.colors[0] }} />
                  <span className="w-3" style={{ backgroundColor: preset.colors[2] }} />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <ColorField label="Primary brand color" value={primaryColor} onChange={setPrimaryColor} />
        <ColorField label="Accent color" value={accentColor} onChange={setAccentColor} />

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Default theme</p>
          <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-navy-700 dark:bg-navy-900/60">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDefaultTheme(option.value)}
                aria-pressed={defaultTheme === option.value}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                  defaultTheme === option.value
                    ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-navy-800 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
                )}
              >
                <option.icon size={15} />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-white/5">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!canSave}
            isLoading={isUpdating}
            startIcon={<Save size={16} />}
            className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Save colors
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-navy-700 dark:bg-navy-900/60 xl:col-span-2">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Live preview
        </p>
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-navy-700 dark:bg-navy-950">
          <div
            className="h-2 w-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: primaryColor }}
            >
              Primary action
            </button>
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-transform hover:scale-[1.03]"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Outline
            </button>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: accentColor }}
            >
              Accent badge
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
            Links & focus rings use the primary color
          </div>
        </div>
      </div>
    </div>
  );
}
