import { apiFetch } from './apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import {
  SubscriptionPlan,
  SubscriptionPlanQueryParams,
  CreateSubscriptionPlanData,
  UpdateSubscriptionPlanData,
} from '@/types/subscription-plan.types';

function buildQueryString(params: SubscriptionPlanQueryParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, value.toString());
    }
  });
  return query.toString();
}

export const subscriptionPlansService = {
  getPlans: async (
    params: SubscriptionPlanQueryParams = {},
  ): Promise<PaginatedResponse<SubscriptionPlan>> => {
    return apiFetch<PaginatedResponse<SubscriptionPlan>>(
      `/admin/subscription-plans?${buildQueryString(params)}`,
    );
  },

  getPlanById: async (id: string): Promise<SubscriptionPlan> => {
    return apiFetch<SubscriptionPlan>(`/admin/subscription-plans/${id}`);
  },

  createPlan: async (data: CreateSubscriptionPlanData): Promise<SubscriptionPlan> => {
    return apiFetch<SubscriptionPlan>('/admin/subscription-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePlan: async (id: string, data: UpdateSubscriptionPlanData): Promise<SubscriptionPlan> => {
    return apiFetch<SubscriptionPlan>(`/admin/subscription-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deletePlan: async (id: string): Promise<void> => {
    await apiFetch(`/admin/subscription-plans/${id}`, {
      method: 'DELETE',
    });
  },

  reorderPlans: async (items: { id: string; order: number }[]): Promise<void> => {
    await apiFetch('/admin/subscription-plans/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },
};
