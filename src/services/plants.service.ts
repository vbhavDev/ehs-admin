import { apiFetch } from './apiFetch';

export interface PlantAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface GeoCoordinates {
  latitude?: number;
  longitude?: number;
}

export interface PlantItem {
  id?: string;
  _id?: string;
  orgId: string;
  name: string;
  code: string;
  type: 'MANUFACTURING' | 'WAREHOUSE' | 'CONSTRUCTION_SITE' | 'OFFICE' | 'REFINERY' | 'OTHER';
  address?: PlantAddress;
  geoCoordinates?: GeoCoordinates;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
}

export const adminPlantsService = {
  async getPlants(params?: {
    search?: string;
    type?: string;
    orgId?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.type && params.type !== 'ALL') query.append('type', params.type);
    if (params?.orgId) query.append('orgId', params.orgId);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<{
      data: PlantItem[];
      meta: { total: number; page?: number; limit?: number; totalPages?: number };
    }>(`/admin/plants${queryString}`);
  },

  async createPlant(payload: Partial<PlantItem>) {
    return apiFetch<PlantItem>('/admin/plants', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updatePlant(id: string, payload: Partial<PlantItem>) {
    return apiFetch<PlantItem>(`/admin/plants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
