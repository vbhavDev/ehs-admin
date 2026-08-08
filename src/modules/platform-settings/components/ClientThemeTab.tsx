'use client';

import React, { useEffect, useState } from 'react';
import { Check, History, Loader2, Moon, Rocket, Save, Sparkles, Sun, Wand2 } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import Switch from '@/components/form/switch/Switch';
import Input from '@/components/form/input/InputField';
import { cn } from '@/lib/utils';
import { useClientDesign } from '../hooks/useClientDesign';
import {
  ClientDesignConfig,
  ClientTheme,
  THEME_TOKEN_KEYS,
  ThemeTokenKey,
} from '@/types/client-design.types';
import {
  COLOR_HUNT_PRESETS,
  ColorHuntPreset,
  createThemeFromColorHunt,
  generateThemeTokensFromColorHunt,
  parseColorHuntPalette,
} from '@/lib/colorhunt';

/** Human-readable labels for the 19 semantic tokens, grouped for the editor. */
const TOKEN_GROUPS: { title: string; keys: ThemeTokenKey[] }[] = [
  { title: 'Brand', keys: ['primary', 'primaryForeground', 'accent', 'accentForeground'] },
  {
    title: 'Surfaces & Text',
    keys: [
      'background',
      'foreground',
      'surface',
      'surfaceForeground',
      'surfaceElevated',
      'mutedForeground',
      'border',
    ],
  },
  {
    title: 'Status',
    keys: [
      'success',
      'successForeground',
      'warning',
      'warningForeground',
      'error',
      'errorForeground',
      'info',
      'infoForeground',
    ],
  },
];

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Compact token editor row — native color well + hex text input. */
function TokenColorInput({
  tokenKey,
  value,
  onChange,
}: {
  tokenKey: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <label
        className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-transform hover:scale-110 dark:border-navy-600"
        style={{ backgroundColor: HEX_RE.test(value) ? value : '#000000' }}
      >
        <input
          type="color"
          value={HEX_RE.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={`${tokenKey} color`}
        />
      </label>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{tokenKey}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full border-0 bg-transparent p-0 font-mono text-[11px] uppercase text-gray-500 focus:outline-none dark:text-gray-400',
            value !== '' && !HEX_RE.test(value) && 'text-error-500',
          )}
          aria-label={`${tokenKey} hex value`}
        />
      </div>
    </div>
  );
}

/** Theme gallery card — token dots preview, mode chip, active badge. */
function ThemeCard({
  theme,
  isActive,
  isSelected,
  onSelect,
}: {
  theme: ClientTheme;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const dots = [
    theme.tokens.primary,
    theme.tokens.accent,
    theme.tokens.surface,
    theme.tokens.success,
    theme.tokens.warning,
    theme.tokens.error,
  ];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        'rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5',
        isSelected
          ? 'border-brand-500 bg-brand-500/5 shadow-theme-sm'
          : 'border-gray-200 bg-white hover:border-brand-300 dark:border-navy-700 dark:bg-navy-800/40 dark:hover:border-brand-500/40',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {theme.name}
        </span>
        <span className="flex items-center gap-1">
          {isActive && (
            <span className="rounded-full bg-success-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success-600 dark:text-success-400">
              Live
            </span>
          )}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-300">
            {theme.mode === 'dark' ? <Moon size={11} /> : <Sun size={11} />}
          </span>
        </span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {dots.map((color, i) => (
          <span
            key={`${color}-${i}`}
            className="h-4 w-4 rounded-full border border-black/10"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      {isSelected && (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-brand-500">
          <Check size={12} /> Editing this theme
        </p>
      )}
    </button>
  );
}

/** Color Hunt Palette Card Component */
function ColorHuntPresetCard({
  preset,
  onApplyToCurrent,
  onAddAsNew,
}: {
  preset: ColorHuntPreset;
  onApplyToCurrent: (preset: ColorHuntPreset) => void;
  onAddAsNew: (preset: ColorHuntPreset) => void;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-3.5 transition-all hover:border-brand-300 dark:border-navy-700 dark:bg-navy-800/60 dark:hover:border-brand-500/40">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold text-gray-900 dark:text-white">
            {preset.name}
          </span>
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-navy-700 dark:text-gray-300">
            {preset.mode}
          </span>
        </div>
        {/* 4 Swatch Color Bar */}
        <div className="mt-2.5 flex h-8 overflow-hidden rounded-lg border border-gray-200 dark:border-navy-600">
          {preset.colors.map((color, i) => (
            <div
              key={`${color}-${i}`}
              className="h-full flex-1 transition-transform hover:scale-105"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        <button
          type="button"
          onClick={() => onApplyToCurrent(preset)}
          className="flex-1 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-500/20 dark:text-brand-400"
        >
          Apply to active
        </button>
        <button
          type="button"
          onClick={() => onAddAsNew(preset)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 dark:border-navy-700 dark:bg-navy-900 dark:text-gray-300 dark:hover:bg-navy-800"
          title="Add as a new theme"
        >
          + Add new
        </button>
      </div>
    </div>
  );
}

/** Deep clone helper — draft edits must never mutate the query cache. */
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

/**
 * Client Theme group — theme gallery, Color Hunt adapter, token editor, publish & rollback
 * (draft → preview → publish workflow, spec §20–22).
 */
export function ClientThemeTab() {
  const { overview, saveDraft, isSavingDraft, publish, isPublishing } = useClientDesign();

  const [draft, setDraft] = useState<ClientDesignConfig | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [changeSummary, setChangeSummary] = useState('');
  const [customColorHuntInput, setCustomColorHuntInput] = useState('');
  const [customInputError, setCustomInputError] = useState('');

  // Initialize working draft from the server overview (existing draft wins)
  useEffect(() => {
    if (overview && !draft) {
      const source = overview.draft ?? overview.published;
      if (source) {
        setDraft(clone(source));
        setSelectedThemeId(source.activeThemeId);
      }
    }
  }, [overview, draft]);

  if (!draft) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 dark:border-navy-700">
        <Loader2 className="animate-spin text-brand-500" size={28} />
      </div>
    );
  }

  const selectedTheme = draft.themes.find((t) => t.id === selectedThemeId) ?? draft.themes[0];

  const updateToken = (key: ThemeTokenKey, value: string) => {
    if (!selectedTheme) return;
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            themes: prev.themes.map((t) =>
              t.id === selectedTheme.id ? { ...t, tokens: { ...t.tokens, [key]: value } } : t,
            ),
          }
        : prev,
    );
  };

  const setActiveTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    setDraft((prev) => {
      if (!prev) return prev;
      const theme = prev.themes.find((t) => t.id === themeId);
      // Keep the published config coherent — the active theme's mode becomes
      // the default mode, so clients resolve exactly this theme.
      return theme
        ? { ...prev, activeThemeId: themeId, defaultMode: theme.mode }
        : { ...prev, activeThemeId: themeId };
    });
  };

  /** Apply a Color Hunt preset to the currently selected theme */
  const handleApplyColorHuntPreset = (preset: ColorHuntPreset) => {
    if (!selectedTheme) return;
    const { tokens } = generateThemeTokensFromColorHunt(preset.colors, preset.mode);

    setDraft((prev) =>
      prev
        ? {
            ...prev,
            themes: prev.themes.map((t) =>
              t.id === selectedTheme.id
                ? {
                    ...t,
                    mode: preset.mode,
                    tokens: { ...t.tokens, ...tokens },
                  }
                : t,
            ),
          }
        : prev,
    );
  };

  /** Add a new theme to draft generated from Color Hunt preset */
  const handleAddColorHuntAsNewTheme = (preset: ColorHuntPreset) => {
    const newThemeId = `colorhunt-${preset.id}-${Date.now()}`;
    const newTheme = createThemeFromColorHunt(
      preset.colors,
      `Color Hunt - ${preset.name}`,
      newThemeId,
      preset.mode,
    );

    setDraft((prev) =>
      prev
        ? {
            ...prev,
            themes: [...prev.themes, newTheme],
          }
        : prev,
    );
    setSelectedThemeId(newThemeId);
  };

  /** Apply custom Color Hunt input (URL, code, or hexes) */
  const handleCustomColorHuntImport = () => {
    setCustomInputError('');
    if (!customColorHuntInput.trim()) return;

    try {
      const colors = parseColorHuntPalette(customColorHuntInput);
      const { tokens, mode } = generateThemeTokensFromColorHunt(colors);

      if (selectedTheme) {
        setDraft((prev) =>
          prev
            ? {
                ...prev,
                themes: prev.themes.map((t) =>
                  t.id === selectedTheme.id
                    ? { ...t, mode, tokens: { ...t.tokens, ...tokens } }
                    : t,
                ),
              }
            : prev,
        );
      }
      setCustomColorHuntInput('');
    } catch (err) {
      setCustomInputError(
        err instanceof Error ? err.message : 'Invalid Color Hunt URL or palette code',
      );
    }
  };

  const allTokensValid = draft.themes.every((t) =>
    THEME_TOKEN_KEYS.every((k) => HEX_RE.test(t.tokens[k])),
  );

  const handleSaveDraft = async () => {
    try {
      await saveDraft({
        configVersion: draft.configVersion,
        themes: draft.themes,
        activeThemeId: draft.activeThemeId,
        defaultMode: draft.defaultMode,
        allowUserModeSwitch: draft.allowUserModeSwitch,
        features: draft.features,
        changeSummary: changeSummary || draft.changeSummary,
      });
    } catch {
      // Error toast handled by the mutation
    }
  };

  const handlePublish = async () => {
    try {
      await handleSaveDraft();
      await publish(changeSummary || undefined);
      setChangeSummary('');
      setDraft(null); // re-hydrate from the fresh overview
    } catch {
      // Error toast handled by the mutations
    }
  };

  return (
    <div className="space-y-6">
      {/* Color Hunt Dynamic Palettes Section */}
      <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/5 via-white to-purple-500/5 p-6 dark:from-brand-500/10 dark:via-navy-800/50 dark:to-purple-500/10 dark:border-brand-500/30">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <Sparkles size={16} className="text-brand-500" />
              Color Hunt Dynamic Palettes
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Apply curated Color Hunt 4-color palettes or paste any URL from colorhunt.com to
              auto-generate design system tokens.
            </p>
          </div>
          {/* Custom Color Hunt URL/Code Import */}
          <div className="flex items-center gap-2">
            <div className="w-64">
              <Input
                value={customColorHuntInput}
                onChange={(e) => setCustomColorHuntInput(e.target.value)}
                placeholder="Paste Color Hunt URL or code..."
                error={customInputError}
                className="text-xs"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleCustomColorHuntImport}
              startIcon={<Wand2 size={14} />}
              className="whitespace-nowrap"
            >
              Apply URL
            </Button>
          </div>
        </div>

        {/* Color Hunt Presets Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {COLOR_HUNT_PRESETS.map((preset) => (
            <ColorHuntPresetCard
              key={preset.id}
              preset={preset}
              onApplyToCurrent={handleApplyColorHuntPreset}
              onAddAsNew={handleAddColorHuntAsNewTheme}
            />
          ))}
        </div>
      </div>

      {/* Theme gallery */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Available themes</h3>
          <span className="text-xs text-gray-400">
            {draft.status === 'draft' ? 'Editing draft' : `Live v${draft.version}`}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {draft.themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={theme.id === draft.activeThemeId}
              isSelected={theme.id === selectedThemeId}
              onSelect={() => setActiveTheme(theme.id)}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
          Selecting a card sets it as the live theme after publishing (its dark/light mode becomes
          the platform default mode automatically).
        </p>
      </div>

      {/* Token editor */}
      {selectedTheme && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800/40">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Tokens — {selectedTheme.name}
            </h3>
            {!allTokensValid && (
              <span className="text-xs font-medium text-error-500">
                Fix invalid hex values before saving
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TOKEN_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {group.title}
                </p>
                <div className="space-y-3">
                  {group.keys.map((key) => (
                    <TokenColorInput
                      key={key}
                      tokenKey={key}
                      value={selectedTheme.tokens[key]}
                      onChange={(value) => updateToken(key, value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode options + actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800/40">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Default appearance mode
            </p>
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-navy-700 dark:bg-navy-900/60">
              {(['dark', 'light', 'system'] as const).map((modeOption) => (
                <button
                  key={modeOption}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => (prev ? { ...prev, defaultMode: modeOption } : prev))
                  }
                  aria-pressed={draft.defaultMode === modeOption}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all duration-200',
                    draft.defaultMode === modeOption
                      ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-navy-800 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
                  )}
                >
                  {modeOption}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Allow users to switch mode
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                End users may override with light/dark/system on their device
              </p>
            </div>
            <Switch
              checked={draft.allowUserModeSwitch}
              onChange={(checked) =>
                setDraft((prev) => (prev ? { ...prev, allowUserModeSwitch: checked } : prev))
              }
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="Change summary (e.g. 'Applied Midnight Sapphire from Color Hunt')"
            className="h-10 flex-1 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-navy-600 dark:text-white/90"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={!allTokensValid || isSavingDraft || isPublishing}
              isLoading={isSavingDraft}
              startIcon={<Save size={15} />}
            >
              Save draft
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePublish}
              disabled={!allTokensValid || isSavingDraft || isPublishing}
              isLoading={isPublishing}
              startIcon={<Rocket size={15} />}
              className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Version history / rollback */}
      {overview && overview.versions.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800/40">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <History size={16} className="text-gray-400" />
            Version history
          </h3>
          <ul className="divide-y divide-gray-100 dark:divide-white/5">
            {overview.versions.map((v) => (
              <VersionRow key={v.version} version={v} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Single version row with rollback action (hidden for the live version). */
function VersionRow({
  version,
}: {
  version: import('@/types/client-design.types').ClientDesignVersionSummary;
}) {
  const { rollback, isRollingBack } = useClientDesign();
  const isLive = version.status === 'published';

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
          v{version.version}
          {isLive && (
            <span className="rounded-full bg-success-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success-600 dark:text-success-400">
              Live
            </span>
          )}
        </p>
        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
          {version.changeSummary || '—'} ·{' '}
          {version.publishedAt ? new Date(version.publishedAt).toLocaleString() : 'draft'} ·{' '}
          {version.publishedBy?.fullName ?? 'system'}
        </p>
      </div>
      {!isLive && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isRollingBack}
          onClick={() => void rollback(version.version).catch(() => undefined)}
          className="!px-3 !py-1.5 text-xs"
        >
          Rollback
        </Button>
      )}
    </li>
  );
}
