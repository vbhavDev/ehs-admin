import { apiFetch } from './apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import {
  Organization,
  OrganizationQueryParams,
  CreateOrganizationData,
  UpdateOrganizationData,
} from '@/types/organization.types';

function buildQueryString(params: OrganizationQueryParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, value.toString());
    }
  });
  return query.toString();
}

export const organizationsService = {
  getOrganizations: async (
    params: OrganizationQueryParams = {},
  ): Promise<PaginatedResponse<Organization>> => {
    return apiFetch<PaginatedResponse<Organization>>(
      `/admin/organizations?${buildQueryString(params)}`,
    );
  },

  getOrganizationById: async (id: string): Promise<Organization> => {
    return apiFetch<Organization>(`/admin/organizations/${id}`);
  },

  createOrganization: async (data: CreateOrganizationData): Promise<Organization> => {
    return apiFetch<Organization>('/admin/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateOrganization: async (id: string, data: UpdateOrganizationData): Promise<Organization> => {
    return apiFetch<Organization>(`/admin/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteOrganization: async (id: string): Promise<void> => {
    await apiFetch(`/admin/organizations/${id}`, {
      method: 'DELETE',
    });
  },
};
