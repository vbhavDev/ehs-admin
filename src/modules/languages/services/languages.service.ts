import { apiFetch } from '@/services/apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/store/auth.store';
import {
  Language,
  CreateLanguageDto,
  UpdateLanguageDto,
  QueryLanguageDto,
  ImportCatalogResult,
  AiGenerateTranslationDto,
  AiGenerateTranslationResult,
  AiStatusResponse,
  MessageRecord,
} from '../types/languages.types';

function buildQueryString(params: QueryLanguageDto): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, value.toString());
    }
  });
  return query.toString();
}

export const languagesService = {
  getLanguages: async (params: QueryLanguageDto = {}): Promise<PaginatedResponse<Language>> => {
    return apiFetch<PaginatedResponse<Language>>(`/admin/languages?${buildQueryString(params)}`);
  },

  getLanguageById: async (id: string): Promise<Language> => {
    return apiFetch<Language>(`/admin/languages/${id}`);
  },

  createLanguage: async (data: CreateLanguageDto): Promise<Language> => {
    return apiFetch<Language>('/admin/languages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLanguage: async (id: string, data: UpdateLanguageDto): Promise<Language> => {
    return apiFetch<Language>(`/admin/languages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  toggleLanguageStatus: async (id: string, isActive: boolean): Promise<Language> => {
    return apiFetch<Language>(`/admin/languages/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  setDefaultLanguage: async (id: string): Promise<Language> => {
    return apiFetch<Language>(`/admin/languages/${id}/default`, {
      method: 'PATCH',
    });
  },

  deleteLanguage: async (id: string): Promise<void> => {
    await apiFetch(`/admin/languages/${id}`, {
      method: 'DELETE',
    });
  },

  downloadCatalog: async (code: string): Promise<void> => {
    const { access_token } = useAuthStore.getState();
    const res = await fetch(`${API_BASE_URL}/admin/languages/${code}/export`, {
      headers: {
        ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to export catalog');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${code.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  getCatalogMessages: async (code: string): Promise<MessageRecord> => {
    const { access_token } = useAuthStore.getState();
    const res = await fetch(`${API_BASE_URL}/admin/languages/${code}/export`, {
      headers: {
        ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to fetch catalog messages');
    return res.json();
  },

  importCatalog: async (
    code: string,
    messages: MessageRecord,
    mode: 'merge' | 'replace' = 'merge',
  ): Promise<ImportCatalogResult> => {
    return apiFetch<ImportCatalogResult>(`/admin/languages/${code}/import`, {
      method: 'POST',
      body: JSON.stringify({ messages, mode }),
    });
  },

  uploadCatalogFile: async (
    code: string,
    file: File,
    mode: 'merge' | 'replace' = 'merge',
  ): Promise<ImportCatalogResult> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<ImportCatalogResult>(`/admin/languages/${code}/upload?mode=${mode}`, {
      method: 'POST',
      body: formData,
    });
  },

  generateAiTranslation: async (
    dto: AiGenerateTranslationDto,
  ): Promise<AiGenerateTranslationResult> => {
    return apiFetch<AiGenerateTranslationResult>('/admin/languages/ai-generate', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getAiStatus: async (): Promise<AiStatusResponse> => {
    return apiFetch<AiStatusResponse>('/admin/languages/ai-status');
  },
};
