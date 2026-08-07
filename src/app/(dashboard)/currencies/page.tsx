'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { CurrencyTable } from '@/modules/currencies/components/CurrencyTable';
import { Currency } from '@/types/currency.types';
import { useCurrencies } from '@/modules/currencies/hooks/useCurrencies';
import Button from '@/components/ui/button/Button';
import { Plus } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export default function CurrenciesPage() {
  const router = useRouter();
  const { deleteCurrency } = useCurrencies();
  const { confirm } = useGlobalModal();

  const handleCreate = () => {
    router.push('/currencies/create');
  };

  const handleEdit = (currency: Currency) => {
    router.push(`/currencies/update/${currency.id}`);
  };

  const handleDelete = async (currency: Currency) => {
    confirm({
      title: 'Delete Currency',
      message: `Are you sure you want to delete "${currency.name} (${currency.code})"? This action cannot be undone.`,
      confirmText: 'Delete Currency',
      type: 'danger',
      onConfirm: async () => {
        await deleteCurrency(currency.id);
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="Currencies" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Currencies</h1>
          <p className="text-sm text-gray-500">
            Create, edit and manage supported currencies and exchange rates
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          Add New Currency
        </Button>
      </div>

      <CurrencyTable onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
