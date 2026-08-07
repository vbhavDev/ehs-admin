import { apiFetch } from './apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import {
  Currency,
  CurrencyQueryParams,
  CreateCurrencyData,
  UpdateCurrencyData,
} from '@/types/currency.types';

function buildQueryString(params: CurrencyQueryParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, value.toString());
    }
  });
  return query.toString();
}

export const currenciesService = {
  getCurrencies: async (params: CurrencyQueryParams = {}): Promise<PaginatedResponse<Currency>> => {
    return apiFetch<PaginatedResponse<Currency>>(`/admin/currencies?${buildQueryString(params)}`);
  },

  getCurrencyById: async (id: string): Promise<Currency> => {
    return apiFetch<Currency>(`/admin/currencies/${id}`);
  },

  createCurrency: async (data: CreateCurrencyData): Promise<Currency> => {
    return apiFetch<Currency>('/admin/currencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCurrency: async (id: string, data: UpdateCurrencyData): Promise<Currency> => {
    return apiFetch<Currency>(`/admin/currencies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteCurrency: async (id: string): Promise<void> => {
    await apiFetch(`/admin/currencies/${id}`, {
      method: 'DELETE',
    });
  },
};
