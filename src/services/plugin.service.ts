import { apiFetch, PaginatedResponse } from './apiFetch';

const BASE = '/admin/plugins';
const TRACKING_BASE = '/admin/ai-tracking';

export interface Plugin {
  id: string;
  pluginKey: string;
  name: string;
  description?: string;
  category: string;
  provider: string;
  icon: string;
  isEnabled: boolean;
  isTestMode: boolean;
  credentials?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  lastTestedAt?: string;
  lastTestStatus: 'success' | 'failed' | 'untested';
  lastTestMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiTrackingStats {
  byProvider?: {
    _id: string;
    total: number;
    totalInput?: number;
    totalOutput?: number;
    cost: number;
    count: number;
  }[];
  byFeature: {
    _id: string;
    total: number;
    totalInput?: number;
    totalOutput?: number;
    cost: number;
    count: number;
  }[];
  byModel: {
    _id: string;
    total: number;
    totalInput?: number;
    totalOutput?: number;
    cost: number;
    count: number;
  }[];
  totals: {
    totalInput: number;
    totalOutput: number;
    totalTokens?: number;
    totalCost: number;
    totalRequests?: number;
  };
}

export interface AiTokenLog {
  id: string;
  userId?: { id: string; email: string; name: string };
  orgId?: { id: string; name: string };
  feature: string;
  provider: string;
  model?: string;
  aiModel?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  createdAt: string;
}

export const pluginService = {
  getPlugins: async (category?: string): Promise<PaginatedResponse<Plugin>> => {
    let url = BASE;
    if (category) {
      url += `?category=${category}`;
    }
    return apiFetch<PaginatedResponse<Plugin>>(url);
  },

  getAiTrackingStats: async (params: {
    provider?: string;
    feature?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AiTrackingStats> => {
    const qp = new URLSearchParams();
    if (params.provider) qp.append('provider', params.provider);
    if (params.feature) qp.append('feature', params.feature);
    if (params.startDate) qp.append('startDate', params.startDate);
    if (params.endDate) qp.append('endDate', params.endDate);
    const qs = qp.toString();
    return apiFetch<AiTrackingStats>(`${TRACKING_BASE}/stats${qs ? `?${qs}` : ''}`);
  },

  getAiTrackingLogs: async (params: {
    page?: number;
    limit?: number;
    provider?: string;
    feature?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<AiTokenLog>> => {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', params.page.toString());
    if (params.limit) qp.append('limit', params.limit.toString());
    if (params.provider) qp.append('provider', params.provider);
    if (params.feature) qp.append('feature', params.feature);
    if (params.startDate) qp.append('startDate', params.startDate);
    if (params.endDate) qp.append('endDate', params.endDate);
    const qs = qp.toString();
    return apiFetch<PaginatedResponse<AiTokenLog>>(`${TRACKING_BASE}/logs${qs ? `?${qs}` : ''}`);
  },
};
