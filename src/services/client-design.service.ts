import { apiFetch } from './apiFetch';
import { ClientDesignOverview, UpsertClientDesignDraftData } from '@/types/client-design.types';

/** Admin (DevOps) management API for the Client App design configuration. */
export const clientDesignService = {
  async getOverview(): Promise<ClientDesignOverview> {
    return apiFetch<ClientDesignOverview>('/admin/client-design', { method: 'GET' });
  },

  async saveDraft(data: UpsertClientDesignDraftData): Promise<ClientDesignOverview> {
    return apiFetch<ClientDesignOverview>('/admin/client-design/draft', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async publish(changeSummary?: string): Promise<ClientDesignOverview> {
    return apiFetch<ClientDesignOverview>('/admin/client-design/publish', {
      method: 'POST',
      body: JSON.stringify({ changeSummary }),
    });
  },

  async rollback(version: number): Promise<ClientDesignOverview> {
    return apiFetch<ClientDesignOverview>(`/admin/client-design/rollback/${version}`, {
      method: 'POST',
    });
  },
};
