import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { currenciesService } from '@/services/currencies.service';
import {
  CurrencyQueryParams,
  CreateCurrencyData,
  UpdateCurrencyData,
} from '@/types/currency.types';
import toast from 'react-hot-toast';

export const useCurrencies = (params: CurrencyQueryParams = {}) => {
  const queryClient = useQueryClient();

  const currenciesQuery = useQuery({
    queryKey: ['currencies', params],
    queryFn: () => currenciesService.getCurrencies(params),
  });

  const createCurrencyMutation = useMutation({
    mutationFn: (data: CreateCurrencyData) => currenciesService.createCurrency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      toast.success('Currency created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create currency');
    },
  });

  const updateCurrencyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCurrencyData }) =>
      currenciesService.updateCurrency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      toast.success('Currency updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update currency');
    },
  });

  const deleteCurrencyMutation = useMutation({
    mutationFn: currenciesService.deleteCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      toast.success('Currency deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete currency');
    },
  });

  return {
    currencies: currenciesQuery.data?.data || [],
    meta: currenciesQuery.data?.meta,
    isLoading: currenciesQuery.isLoading,
    isError: currenciesQuery.isError,
    error: currenciesQuery.error,
    createCurrency: createCurrencyMutation.mutateAsync,
    updateCurrency: updateCurrencyMutation.mutateAsync,
    deleteCurrency: deleteCurrencyMutation.mutateAsync,
    isCreating: createCurrencyMutation.isPending,
    isUpdating: updateCurrencyMutation.isPending,
    isDeleting: deleteCurrencyMutation.isPending,
  };
};

export const useCurrency = (id: string | null) => {
  return useQuery({
    queryKey: ['currencies', id],
    queryFn: () => (id ? currenciesService.getCurrencyById(id) : null),
    enabled: !!id,
  });
};
