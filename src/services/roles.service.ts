import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';
import { Role } from '@/types/user.types';

export const rolesService = {
  getRoles: async (scope?: 'SYSTEM' | 'CLIENT'): Promise<Role[]> => {
    const url = scope
      ? `${API_ENDPOINTS.ADMIN.ROLES.BASE}?scope=${scope}`
      : API_ENDPOINTS.ADMIN.ROLES.BASE;
    return apiFetch<Role[]>(url);
  },

  getRoleById: async (id: string): Promise<Role> => {
    return apiFetch<Role>(API_ENDPOINTS.ADMIN.ROLES.BY_ID(id));
  },

  createRole: async (data: Omit<Role, 'id'>): Promise<Role> => {
    return apiFetch<Role>(API_ENDPOINTS.ADMIN.ROLES.BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRole: async (id: string, data: Partial<Omit<Role, 'id'>>): Promise<Role> => {
    return apiFetch<Role>(API_ENDPOINTS.ADMIN.ROLES.BY_ID(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteRole: async (id: string): Promise<void> => {
    return apiFetch<void>(API_ENDPOINTS.ADMIN.ROLES.BY_ID(id), {
      method: 'DELETE',
    });
  },
};
