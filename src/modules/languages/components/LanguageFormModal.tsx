'use client';
import React, { useEffect } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Switch from '@/components/form/switch/Switch';
import { Globe, Languages as LangIcon } from 'lucide-react';
import { Language, CreateLanguageDto, UpdateLanguageDto } from '../types/languages.types';

const languageFormSchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(10, 'Code cannot exceed 10 characters')
    .regex(/^[a-z]{2,3}(-[A-Za-z0-9]+)?$/, 'Valid language code format (e.g., en, es, fr, zh-CN)'),
  name: z.string().min(2, 'English name is required'),
  nativeName: z.string().min(1, 'Native script name is required'),
  flag: z.string().min(1, 'Flag emoji is required (e.g. 🇺🇸, 🇪🇸, 🇫🇷)'),
  direction: z.enum(['ltr', 'rtl']),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

type LanguageFormData = z.infer<typeof languageFormSchema>;

interface LanguageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Language | null;
  onSubmit: (data: CreateLanguageDto | UpdateLanguageDto) => Promise<void>;
}

export const LanguageFormModal: React.FC<LanguageFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}) => {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LanguageFormData>({
    resolver: zodResolver(languageFormSchema) as unknown as Resolver<LanguageFormData>,
    defaultValues: {
      code: '',
      name: '',
      nativeName: '',
      flag: '🌐',
      direction: 'ltr',
      isDefault: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code,
        name: initialData.name,
        nativeName: initialData.nativeName,
        flag: initialData.flag || '🌐',
        direction: initialData.direction || 'ltr',
        isDefault: !!initialData.isDefault,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      reset({
        code: '',
        name: '',
        nativeName: '',
        flag: '🌐',
        direction: 'ltr',
        isDefault: false,
        isActive: true,
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data: LanguageFormData) => {
    try {
      const sanitized: CreateLanguageDto = {
        ...data,
        code: data.code.trim().toLowerCase(),
        name: data.name.trim(),
        nativeName: data.nativeName.trim(),
        flag: data.flag.trim(),
      };
      await onSubmit(sanitized);
      onClose();
    } catch (err) {
      // Error handled by parent mutation hooks
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 md:p-8">
      <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-navy-700">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          <Globe size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Language' : 'Add New Language'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isEdit
              ? `Update configuration for language code: ${initialData?.code}`
              : 'Add a new localization locale and catalog to the platform'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Language Code *"
              placeholder="e.g. en, es, ar, fr"
              disabled={isEdit}
              error={errors.code?.message}
              {...register('code')}
              hint={isEdit ? 'Code cannot be changed once created' : 'ISO-639-1 code'}
            />
          </div>

          <div>
            <Input
              label="Flag Emoji *"
              placeholder="e.g. 🇺🇸, 🇪🇸, 🇸🇦"
              error={errors.flag?.message}
              {...register('flag')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="English Name *"
              placeholder="e.g. Spanish"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div>
            <Input
              label="Native Name *"
              placeholder="e.g. Español"
              error={errors.nativeName?.message}
              {...register('nativeName')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Controller
              name="direction"
              control={control}
              render={({ field }) => (
                <Select
                  label="Text Direction"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'ltr', label: 'LTR (Left-to-Right)' },
                    { value: 'rtl', label: 'RTL (Right-to-Left)' },
                  ]}
                  error={errors.direction?.message}
                />
              )}
            />
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900/30">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      Active Status
                    </span>
                    <p className="text-[11px] text-gray-500">Enable in language picker</p>
                  </div>
                  <Switch checked={field.value} onChange={field.onChange} color="blue" />
                </div>
              )}
            />
          </div>
        </div>

        <div className="pt-1">
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/5">
                <div className="pr-4">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-400">
                    Primary Default Language
                  </span>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70">
                    Fallback locale used when requested translation is missing or browser locale is
                    not matched.
                  </p>
                </div>
                <Switch checked={field.value} onChange={field.onChange} color="blue" />
              </div>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 dark:border-navy-700">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
            <LangIcon size={16} />
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Language' : 'Add Language'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
