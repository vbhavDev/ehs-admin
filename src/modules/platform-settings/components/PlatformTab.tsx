'use client';

import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertTriangle, Mail, Save, Type } from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Switch from '@/components/form/switch/Switch';
import Button from '@/components/ui/button/Button';
import { usePlatformSettings } from '../hooks/usePlatformSettings';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'ar', label: 'العربية (Arabic)' },
];

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC — Coordinated Universal Time' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata — IST (India)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai — GST (UAE)' },
  { value: 'Europe/London', label: 'Europe/London — GMT/BST (UK)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin — CET (EU)' },
  { value: 'America/New_York', label: 'America/New_York — ET (US East)' },
  { value: 'America/Chicago', label: 'America/Chicago — CT (US Central)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles — PT (US West)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore — SGT' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney — AEST' },
];

const platformSchema = z.object({
  platformName: z.string().min(2, 'Platform name is required').max(80),
  tagline: z.string().max(160, 'Keep it under 160 characters'),
  supportEmail: z.union([z.literal(''), z.email('Enter a valid email address')]),
  defaultLanguage: z.enum(['en', 'hi', 'ar']),
  timezone: z.string().min(1, 'Select a timezone'),
  maintenanceMode: z.boolean(),
  allowSignups: z.boolean(),
});

type PlatformFormData = z.infer<typeof platformSchema>;

/** Platform group — identity, localization, and operational switches. */
export function PlatformTab() {
  const { settings, updateSettings, isUpdating } = usePlatformSettings();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<PlatformFormData>({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      platformName: '',
      tagline: '',
      supportEmail: '',
      defaultLanguage: 'en',
      timezone: 'UTC',
      maintenanceMode: false,
      allowSignups: true,
    },
  });

  // Hydrate the form once the settings singleton arrives
  useEffect(() => {
    if (settings) {
      reset({
        platformName: settings.platformName,
        tagline: settings.tagline,
        supportEmail: settings.supportEmail,
        defaultLanguage: settings.defaultLanguage,
        timezone: settings.timezone,
        maintenanceMode: settings.maintenanceMode,
        allowSignups: settings.allowSignups,
      });
    }
  }, [settings, reset]);

  const maintenanceMode = watch('maintenanceMode');

  const onSubmit = async (data: PlatformFormData) => {
    try {
      await updateSettings(data);
      reset(data);
    } catch {
      // Error toast handled by the mutation
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800/40"
      noValidate
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Platform name"
          placeholder="AI Safety Check"
          startIcon={<Type size={16} />}
          error={errors.platformName?.message}
          {...register('platformName')}
        />
        <Input
          label="Tagline"
          placeholder="AI Workplace Safety Hazard Detection Platform"
          error={errors.tagline?.message}
          {...register('tagline')}
        />
        <Input
          label="Support email"
          type="email"
          placeholder="support@ehsclubhouse.com"
          startIcon={<Mail size={16} />}
          hint="Shown to users on error & maintenance pages"
          error={errors.supportEmail?.message}
          {...register('supportEmail')}
        />
        <Controller
          control={control}
          name="defaultLanguage"
          render={({ field }) => (
            <Select
              label="Default language"
              options={LANGUAGE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="timezone"
          render={({ field }) => (
            <Select
              label="Platform timezone"
              options={TIMEZONE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="mt-6 space-y-4 border-t border-gray-100 pt-6 dark:border-white/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Allow public signups
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              When off, new client accounts can only be created via org invitations
            </p>
          </div>
          <Controller
            control={control}
            name="allowSignups"
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Maintenance mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Client app shows a maintenance notice instead of login
            </p>
          </div>
          <Controller
            control={control}
            name="maintenanceMode"
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
          />
        </div>

        {maintenanceMode && (
          <p className="flex items-start gap-2 rounded-lg bg-warning-500/10 px-3 py-2.5 text-xs font-medium text-warning-600 dark:text-warning-400">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            Maintenance mode is ON — end users will not be able to use the client app.
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end border-t border-gray-100 pt-5 dark:border-white/5">
        <Button
          type="submit"
          size="sm"
          isLoading={isUpdating}
          disabled={!isDirty || isUpdating}
          startIcon={<Save size={16} />}
          className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Save platform settings
        </Button>
      </div>
    </form>
  );
}
