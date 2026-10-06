import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';
import {
  PluginItem,
  CreatePluginData,
  UpdatePluginData,
  TestConnectionResult,
  PluginCategory,
} from '@/types/plugin.types';

export const pluginsService = {
  async getPlugins(params?: {
    category?: PluginCategory;
    search?: string;
    isEnabled?: boolean;
  }): Promise<PluginItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (typeof params?.isEnabled === 'boolean') {
      searchParams.set('isEnabled', String(params.isEnabled));
    }

    const url = `${API_ENDPOINTS.ADMIN.PLUGINS.BASE}${
      searchParams.toString() ? `?${searchParams.toString()}` : ''
    }`;

    return apiFetch<PluginItem[]>(url, { method: 'GET' });
  },

  async getPluginByKey(key: string): Promise<PluginItem> {
    return apiFetch<PluginItem>(API_ENDPOINTS.ADMIN.PLUGINS.BY_KEY(key), {
      method: 'GET',
    });
  },

  async createPlugin(data: CreatePluginData): Promise<PluginItem> {
    return apiFetch<PluginItem>(API_ENDPOINTS.ADMIN.PLUGINS.BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePlugin(key: string, data: UpdatePluginData): Promise<PluginItem> {
    return apiFetch<PluginItem>(API_ENDPOINTS.ADMIN.PLUGINS.BY_KEY(key), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async togglePluginStatus(key: string, isEnabled?: boolean): Promise<PluginItem> {
    return apiFetch<PluginItem>(API_ENDPOINTS.ADMIN.PLUGINS.TOGGLE(key), {
      method: 'POST',
      body: JSON.stringify({ isEnabled }),
    });
  },

  async testConnection(key: string): Promise<TestConnectionResult> {
    return apiFetch<TestConnectionResult>(API_ENDPOINTS.ADMIN.PLUGINS.TEST_CONNECTION(key), {
      method: 'POST',
    });
  },

  async getBrevoSenders(key: string): Promise<{
    pluginKey: string;
    senders: Array<{ id: number; name: string; email: string; active: boolean }>;
    activeSenders: Array<{ id: number; name: string; email: string; active: boolean }>;
    activeSenderId: number | null;
    activeSenderEmail: string | null;
    activeSenderName: string | null;
    defaultSenderId?: number | null;
    defaultSenderEmail?: string | null;
    defaultSenderName?: string | null;
  }> {
    return apiFetch(`${API_ENDPOINTS.ADMIN.PLUGINS.BY_KEY(key)}/brevo-senders`, {
      method: 'GET',
    });
  },

  async setDefaultSender(
    key: string,
    data: { senderId: number; senderEmail: string; senderName?: string },
  ): Promise<{ success: boolean; message: string; plugin: PluginItem }> {
    return apiFetch(`${API_ENDPOINTS.ADMIN.PLUGINS.BY_KEY(key)}/default-sender`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async registerBrevoWebhook(
    key: string,
    url: string,
  ): Promise<{ success: boolean; webhookId: number; url: string; plugin: PluginItem }> {
    return apiFetch(`${API_ENDPOINTS.ADMIN.PLUGINS.BY_KEY(key)}/brevo-webhook`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  async unregisterBrevoWebhook(key: string): Promise<{ success: boolean; plugin: PluginItem }> {
    return apiFetch(`${API_ENDPOINTS.ADMIN.PLUGINS.BY_KEY(key)}/brevo-webhook`, {
      method: 'DELETE',
    });
  },

  async getAvailableAiModels(key: string): Promise<{
    pluginKey: string;
    defaultModel: string;
    models: Array<{
      id: string;
      name: string;
      description?: string;
      inputTokenLimit?: number;
      outputTokenLimit?: number;
      isDefault: boolean;
      isLiveFetched?: boolean;
    }>;
    lastFetchedAt: string;
  }> {
    return apiFetch(API_ENDPOINTS.ADMIN.PLUGINS.AI_MODELS(key), {
      method: 'GET',
    });
  },

  async setDefaultAiModel(
    key: string,
    modelId: string,
  ): Promise<{ success: boolean; message: string; plugin: PluginItem }> {
    return apiFetch(API_ENDPOINTS.ADMIN.PLUGINS.SET_DEFAULT_MODEL(key), {
      method: 'POST',
      body: JSON.stringify({ modelId }),
    });
  },

  async getAiOrchestrationConfig(): Promise<{
    primaryProvider: string;
    primaryModel: string;
    secondaryProvider: string;
    secondaryModel: string;
    fallbackMethod: 'AUTO_FAILOVER' | 'COST_OPTIMIZED' | 'SEQUENTIAL_CHAIN';
    timeoutSeconds: number;
    retryAttempts: number;
    enableAutomaticFallback: boolean;
    features?: Record<
      string,
      {
        primaryProvider: string;
        primaryModel: string;
        secondaryProvider: string;
        secondaryModel: string;
      }
    >;
    availableProviders?: Array<{
      key: string;
      name: string;
      currentModel: string;
      isEnabled: boolean;
    }>;
  }> {
    return apiFetch(API_ENDPOINTS.ADMIN.PLUGINS.AI_ORCHESTRATION, {
      method: 'GET',
    });
  },

  async updateAiOrchestrationConfig(config: Record<string, unknown>): Promise<{
    success: boolean;
    message: string;
    config: Record<string, unknown>;
  }> {
    return apiFetch(API_ENDPOINTS.ADMIN.PLUGINS.AI_ORCHESTRATION, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};
