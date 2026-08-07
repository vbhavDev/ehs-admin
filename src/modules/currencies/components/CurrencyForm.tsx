'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { Currency } from '@/types/currency.types';
import { useCurrencies } from '../hooks/useCurrencies';

const currencySchema = z.object({
  code: z.string().min(3, 'Code must be 3 characters').max(3, 'Code must be 3 characters'),
  name: z.string().min(2, 'Name is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  symbolNative: z.string().min(1, 'Native symbol is required'),
  decimalDigits: z.coerce.number().min(0, 'Must be 0 or more'),
  exchangeRateToINR: z.coerce.number().min(0, 'Must be 0 or more'),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

type CurrencyFormData = z.infer<typeof currencySchema>;

interface CurrencyFormProps {
  initialData?: Currency | null;
}

export const CurrencyForm: React.FC<CurrencyFormProps> = ({ initialData }) => {
  const router = useRouter();
  const isEdit = !!initialData;
  const { createCurrency, updateCurrency, isCreating, isUpdating } = useCurrencies();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CurrencyFormData>({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    resolver: zodResolver(currencySchema) as any,
    defaultValues: initialData
      ? {
          code: initialData.code,
          name: initialData.name,
          symbol: initialData.symbol,
          symbolNative: initialData.symbolNative,
          decimalDigits: initialData.decimalDigits,
          exchangeRateToINR: initialData.exchangeRateToINR,
          isDefault: initialData.isDefault,
          isActive: initialData.isActive,
        }
      : {
          code: '',
          name: '',
          symbol: '',
          symbolNative: '',
          decimalDigits: 2,
          exchangeRateToINR: 1,
          isDefault: false,
          isActive: true,
        },
  });

  const onSubmit = async (data: CurrencyFormData) => {
    try {
      const payload = { ...data, code: data.code.toUpperCase() };
      if (isEdit && initialData) {
        delete (payload as Partial<CurrencyFormData>).code;
        await updateCurrency({ id: initialData.id, data: payload });
      } else {
        await createCurrency(payload);
      }
      router.push('/currencies');
    } catch (error) {
      // Error handled by mutation hooks (toast)
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => router.push('/currencies')}
        className="flex items-center gap-2 text-gray-500 hover:text-brand-500 mb-6 transition-colors font-medium group text-sm"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back to Currencies
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden shadow-theme-sm"
      >
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Currency Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Currency Code <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="e.g. USD"
                  disabled={isEdit}
                  {...register('code')}
                  error={!!errors.code}
                  hint={errors.code?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. US Dollar"
                  {...register('name')}
                  error={!!errors.name}
                  hint={errors.name?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symbol">
                  Symbol <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="symbol"
                  placeholder="e.g. $"
                  {...register('symbol')}
                  error={!!errors.symbol}
                  hint={errors.symbol?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symbolNative">
                  Native Symbol <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="symbolNative"
                  placeholder="e.g. $"
                  {...register('symbolNative')}
                  error={!!errors.symbolNative}
                  hint={errors.symbolNative?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="decimalDigits">
                  Decimal Digits <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="decimalDigits"
                  type="number"
                  min={0}
                  placeholder="e.g. 2"
                  {...register('decimalDigits')}
                  error={!!errors.decimalDigits}
                  hint={errors.decimalDigits?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exchangeRateToINR">
                  Exchange Rate → INR <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="exchangeRateToINR"
                  type="number"
                  step="0.0001"
                  min={0}
                  placeholder="e.g. 0.012"
                  {...register('exchangeRateToINR')}
                  error={!!errors.exchangeRateToINR}
                  hint={errors.exchangeRateToINR?.message}
                />
                <p className="text-xs text-gray-400 mt-1">INR = 1.0 (system base currency)</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Settings
            </h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  {...register('isDefault')}
                  className="w-5 h-5 rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                />
                <Label
                  htmlFor="isDefault"
                  className="mb-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
                >
                  Default Currency
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="w-5 h-5 rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                />
                <Label
                  htmlFor="isActive"
                  className="mb-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
                >
                  Currency is Active
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 dark:bg-navy-900/50 border-t border-gray-100 dark:border-navy-700 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/currencies')}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-8 shadow-lg shadow-brand-500/20"
          >
            {isCreating || isUpdating
              ? 'Saving...'
              : isEdit
                ? 'Update Currency'
                : 'Create Currency'}
          </Button>
        </div>
      </form>
    </div>
  );
};
