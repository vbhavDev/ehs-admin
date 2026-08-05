import { apiFetch } from './apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import {
  EndUser,
  EndUserQueryParams,
  CreateEndUserData,
  UpdateEndUserData,
} from '@/types/end-user.types';

function buildQueryString(params: EndUserQueryParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, value.toString());
    }
  });
  return query.toString();
}

export const endUsersService = {
  getEndUsers: async (params: EndUserQueryParams = {}): Promise<PaginatedResponse<EndUser>> => {
    return apiFetch<PaginatedResponse<EndUser>>(`/admin/end-users?${buildQueryString(params)}`);
  },

  getEndUserById: async (id: string): Promise<EndUser> => {
    return apiFetch<EndUser>(`/admin/end-users/${id}`);
  },

  createEndUser: async (data: CreateEndUserData): Promise<EndUser> => {
    return apiFetch<EndUser>('/admin/end-users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEndUser: async (id: string, data: UpdateEndUserData): Promise<EndUser> => {
    return apiFetch<EndUser>(`/admin/end-users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteEndUser: async (id: string): Promise<void> => {
    await apiFetch(`/admin/end-users/${id}`, {
      method: 'DELETE',
    });
  },
};
