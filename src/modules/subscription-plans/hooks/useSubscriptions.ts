import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  subscriptionsService,
  SubscriptionQueryParams,
  SubscriptionItem,
} from '@/services/subscriptions.service';
import toast from 'react-hot-toast';

export const useSubscriptions = (params: SubscriptionQueryParams = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-subscriptions', params],
    queryFn: () => subscriptionsService.getSubscriptions(params),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubscriptionItem> }) =>
      subscriptionsService.updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Subscription updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subscription');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionsService.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Subscription deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete subscription');
    },
  });

  return {
    subscriptions: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateSubscription: updateMutation.mutateAsync,
    deleteSubscription: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
