import { apiFetch } from './apiFetch';

export interface HazardMetrics {
  statusStats: Record<string, number>;
  priorityStats: Record<string, number>;
  categoryStats: Record<string, number>;
}

export const hazardsService = {
  getMetrics: async (orgId?: string): Promise<HazardMetrics> => {
    const queryParams = new URLSearchParams();
    if (orgId) {
      queryParams.append('orgId', orgId);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiFetch<HazardMetrics>(`/admin/hazards/metrics${queryString}`);
  },
};
