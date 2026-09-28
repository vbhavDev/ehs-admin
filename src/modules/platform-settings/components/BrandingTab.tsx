'use client';

import React, { useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { FileUploadModal } from '@/modules/media/components/FileUploadModal';
import Button from '@/components/ui/button/Button';
import { getImageUrl, cn } from '@/lib/utils';
import { usePlatformSettings } from '../hooks/usePlatformSettings';

type SlotField = 'logoFileId' | 'logoDarkFileId' | 'faviconFileId';

interface LogoSlotProps {
  title: string;
  description: string;
  previewUrl: string;
  darkSurface?: boolean;
  compact?: boolean;
  disabled?: boolean;
  onChange: () => void;
  onRemove: () => void;
}

/** Single brand asset slot — preview tile + change/remove actions. */
function LogoSlot({
  title,
  description,
  previewUrl,
  darkSurface = false,
  compact = false,
  disabled = false,
  onChange,
  onRemove,
}: LogoSlotProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow duration-300 hover:shadow-theme-md dark:border-navy-700 dark:bg-navy-800/40">
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-xl border border-dashed',
          compact ? 'h-24' : 'h-32',
          darkSurface
            ? 'border-navy-600 bg-navy-950'
            : 'border-gray-200 bg-gray-50 dark:border-navy-700 dark:bg-navy-900',
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={title}
            className={cn('object-contain p-3', compact ? 'max-h-16' : 'max-h-24')}
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-300 dark:text-gray-600">
            <ImagePlus size={compact ? 22 : 28} />
            <span className="text-[11px] font-medium">No {title.toLowerCase()} set</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {previewUrl && (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              aria-label={`Remove ${title}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-error-500/10 hover:text-error-500 disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onChange}
            disabled={disabled}
            className="!px-3 !py-2 text-xs"
          >
            {previewUrl ? 'Change' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Branding group — platform logos & favicon via the shared upload dialog. */
export function BrandingTab() {
  const { settings, updateSettings, isUpdating } = usePlatformSettings();
  const [activeSlot, setActiveSlot] = useState<SlotField | null>(null);

  const clearSlot = async (field: SlotField) => {
    try {
      await updateSettings({ [field]: '' });
    } catch {
      // Error toast handled by the mutation
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <LogoSlot
          title="Platform Logo"
          description="Shown on light surfaces — sidebar, login card (PNG/SVG, transparent)"
          previewUrl={getImageUrl(settings?.logoFile)}
          disabled={isUpdating}
          onChange={() => setActiveSlot('logoFileId')}
          onRemove={() => void clearSlot('logoFileId')}
        />
        <LogoSlot
          title="Dark Logo"
          description="Variant used on dark surfaces and the dark sidebar"
          previewUrl={getImageUrl(settings?.logoDarkFile)}
          darkSurface
          disabled={isUpdating}
          onChange={() => setActiveSlot('logoDarkFileId')}
          onRemove={() => void clearSlot('logoDarkFileId')}
        />
        <LogoSlot
          title="Favicon"
          description="Browser tab icon (square PNG/ICO, 64×64+)"
          previewUrl={getImageUrl(settings?.faviconFile)}
          compact
          disabled={isUpdating}
          onChange={() => setActiveSlot('faviconFileId')}
          onRemove={() => void clearSlot('faviconFileId')}
        />
      </div>

      {isUpdating && (
        <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Saving brand asset…
        </p>
      )}

      <FileUploadModal
        isOpen={activeSlot !== null}
        onClose={() => setActiveSlot(null)}
        onUploaded={(uploaded) => {
          if (!activeSlot) return;
          void updateSettings({ [activeSlot]: uploaded.id }).catch(() => {
            // Error toast handled by the mutation
          });
        }}
        defaultModule="branding"
        entityType="platform-settings"
        entityId={settings?.id ?? 'singleton'}
        accept="image/*"
      />
    </div>
  );
}
