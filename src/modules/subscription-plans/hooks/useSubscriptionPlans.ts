import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionPlansService } from '@/services/subscription-plans.service';
import {
  SubscriptionPlanQueryParams,
  CreateSubscriptionPlanData,
  UpdateSubscriptionPlanData,
} from '@/types/subscription-plan.types';
import toast from 'react-hot-toast';

export const useSubscriptionPlans = (params: SubscriptionPlanQueryParams = {}) => {
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ['subscription-plans', params],
    queryFn: () => subscriptionPlansService.getPlans(params),
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: CreateSubscriptionPlanData) => subscriptionPlansService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Subscription plan created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create subscription plan');
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionPlanData }) =>
      subscriptionPlansService.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Subscription plan updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subscription plan');
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: subscriptionPlansService.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Subscription plan deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete subscription plan');
    },
  });

  const reorderPlansMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      subscriptionPlansService.reorderPlans(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan order updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reorder plans');
    },
  });

  return {
    plans: plansQuery.data?.data || [],
    meta: plansQuery.data?.meta,
    isLoading: plansQuery.isLoading,
    isError: plansQuery.isError,
    error: plansQuery.error,
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,
    reorderPlans: reorderPlansMutation.mutateAsync,
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
    isReordering: reorderPlansMutation.isPending,
  };
};

export const useSubscriptionPlan = (id: string | null) => {
  return useQuery({
    queryKey: ['subscription-plans', id],
    queryFn: () => (id ? subscriptionPlansService.getPlanById(id) : null),
    enabled: !!id,
  });
};
