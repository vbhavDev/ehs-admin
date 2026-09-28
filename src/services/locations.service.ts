import { apiFetch } from './apiFetch';
import { PaginatedResponse } from '@/types/api.types';

export interface LocationItem {
  id: string;
  pincode: string;
  cityName: string;
  stateName: string;
  district?: string;
  country: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  stateName?: string;
  cityName?: string;
  pincode?: string;
  isActive?: boolean;
}

export interface CreateLocationData {
  pincode: string;
  cityName: string;
  stateName: string;
  district?: string;
  country?: string;
  isActive?: boolean;
}

export interface UpdateLocationData {
  pincode?: string;
  cityName?: string;
  stateName?: string;
  district?: string;
  country?: string;
  isActive?: boolean;
}

function buildQueryString(params: LocationQueryParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, value.toString());
    }
  });
  return query.toString();
}

export const locationsService = {
  getLocations: async (
    params: LocationQueryParams = {},
  ): Promise<PaginatedResponse<LocationItem>> => {
    return apiFetch<PaginatedResponse<LocationItem>>(
      `/admin/locations?${buildQueryString(params)}`,
    );
  },

  getLocationById: async (id: string): Promise<LocationItem> => {
    return apiFetch<LocationItem>(`/admin/locations/${id}`);
  },

  getStates: async (): Promise<string[]> => {
    return apiFetch<string[]>('/admin/locations/states');
  },

  getCitiesByState: async (state: string): Promise<string[]> => {
    return apiFetch<string[]>(`/admin/locations/cities?state=${encodeURIComponent(state)}`);
  },

  getLocationByPincode: async (pincode: string): Promise<LocationItem[]> => {
    return apiFetch<LocationItem[]>(`/admin/locations/pincode/${encodeURIComponent(pincode)}`);
  },

  createLocation: async (data: CreateLocationData): Promise<LocationItem> => {
    return apiFetch<LocationItem>('/admin/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLocation: async (id: string, data: UpdateLocationData): Promise<LocationItem> => {
    return apiFetch<LocationItem>(`/admin/locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteLocation: async (id: string): Promise<void> => {
    await apiFetch(`/admin/locations/${id}`, {
      method: 'DELETE',
    });
  },
};
