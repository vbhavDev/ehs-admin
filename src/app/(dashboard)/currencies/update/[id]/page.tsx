'use client';
import { CurrencyForm } from '@/modules/currencies/components/CurrencyForm';
import { useParams } from 'next/navigation';
import { useCurrency } from '@/modules/currencies/hooks/useCurrencies';

export default function UpdateCurrencyPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: currency, isLoading, isError } = useCurrency(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !currency) {
    return (
      <div className="flex justify-center items-center h-64 text-error-500 font-medium">
        Failed to load currency data. Currency might not exist.
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <CurrencyForm initialData={currency} />
    </div>
  );
}
