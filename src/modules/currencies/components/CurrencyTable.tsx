'use client';
import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Currency } from '@/types/currency.types';
import { useCurrencies } from '../hooks/useCurrencies';
import { Edit, Trash2, Star } from 'lucide-react';

interface CurrencyTableProps {
  onEdit: (currency: Currency) => void;
  onDelete: (currency: Currency) => void;
}

export const CurrencyTable: React.FC<CurrencyTableProps> = ({ onEdit, onDelete }) => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { currencies, meta, isLoading, updateCurrency } = useCurrencies(params);

  const handleToggleActive = async (currency: Currency) => {
    await updateCurrency({ id: currency.id, data: { isActive: !currency.isActive } });
  };

  const columns: Column<Currency>[] = [
    {
      header: 'Code',
      accessor: (currency) => (
        <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          {currency.code}
        </span>
      ),
    },
    {
      header: 'Name',
      accessor: (currency) => (
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{currency.name}</p>
          <p className="text-xs text-gray-500">
            {currency.symbol} ({currency.symbolNative})
          </p>
        </div>
      ),
    },
    {
      header: 'Decimal Digits',
      accessor: (currency) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{currency.decimalDigits}</span>
      ),
    },
    {
      header: 'Rate → INR',
      accessor: (currency) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currency.exchangeRateToINR}
        </span>
      ),
    },
    {
      header: 'Default',
      accessor: (currency) =>
        currency.isDefault ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            Default
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      header: 'Status',
      accessor: (currency) => (
        <button
          onClick={() => handleToggleActive(currency)}
          className={`group relative overflow-hidden flex items-center justify-center px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors duration-300 ${
            currency.isActive
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/15 dark:hover:text-error-500'
              : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500 hover:bg-success-50 hover:text-success-600 dark:hover:bg-success-500/15 dark:hover:text-success-500'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
            {currency.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0 whitespace-nowrap">
            {currency.isActive ? 'Click to deactivate' : 'Click to activate'}
          </span>
          <span className="invisible whitespace-nowrap">
            {currency.isActive ? 'Click to deactivate' : 'Click to activate'}
          </span>
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (currency) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(currency)}
            className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(currency)}
            className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={currencies}
      columns={columns}
      isLoading={isLoading}
      serverSide
      totalItems={meta?.total}
      page={params.page}
      limit={params.limit}
      search={params.search}
      onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      onPageSizeChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
      onSearchChange={(search) => setParams((p) => ({ ...p, search, page: 1 }))}
    />
  );
};
