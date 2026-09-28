import { apiFetch } from './apiFetch';
import { PaginatedResponse } from '@/types/api.types';

export interface SubscriptionItem {
  id: string;
  userId?: {
    id: string;
    fullName?: string;
    email?: string;
  } | null;
  organizationId?: {
    id: string;
    name?: string;
    companyName?: string;
  } | null;
  planId?: {
    id: string;
    name?: string;
    tier?: string;
  } | null;
  currencyId?: {
    id: string;
    code?: string;
    symbol?: string;
  } | null;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | string;
  currencyCode: string;
  amountPaid: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  paymentProvider?: string;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  snapshotLimits?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  planId?: string;
  status?: string;
  sort?: string;
}

function buildQueryString(params: SubscriptionQueryParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, value.toString());
    }
  });
  return query.toString();
}

export const subscriptionsService = {
  getSubscriptions: async (
    params: SubscriptionQueryParams = {},
  ): Promise<PaginatedResponse<SubscriptionItem>> => {
    return apiFetch<PaginatedResponse<SubscriptionItem>>(
      `/admin/subscriptions?${buildQueryString(params)}`,
    );
  },

  getSubscriptionById: async (id: string): Promise<SubscriptionItem> => {
    return apiFetch<SubscriptionItem>(`/admin/subscriptions/${id}`);
  },

  updateSubscription: async (
    id: string,
    data: Partial<SubscriptionItem>,
  ): Promise<SubscriptionItem> => {
    return apiFetch<SubscriptionItem>(`/admin/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteSubscription: async (id: string): Promise<void> => {
    await apiFetch(`/admin/subscriptions/${id}`, {
      method: 'DELETE',
    });
  },
};
