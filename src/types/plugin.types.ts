export type PluginCategory = 'email' | 'payment' | 'whatsapp' | 'sms' | 'storage' | 'ai' | 'other';

export interface PluginItem {
  id: string;
  pluginKey: string;
  name: string;
  description?: string;
  category: PluginCategory;
  provider: string;
  icon?: string;
  isEnabled: boolean;
  isTestMode: boolean;
  credentials: Record<string, unknown>;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  lastTestedAt?: string;
  lastTestStatus: 'success' | 'failed' | 'untested';
  lastTestMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePluginData {
  name?: string;
  description?: string;
  category?: PluginCategory;
  provider?: string;
  icon?: string;
  isEnabled?: boolean;
  isTestMode?: boolean;
  credentials?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface CreatePluginData extends UpdatePluginData {
  pluginKey: string;
  name: string;
  category: PluginCategory;
  provider: string;
}

export interface TestConnectionResult {
  pluginKey: string;
  name: string;
  lastTestedAt: string;
  status: 'success' | 'failed';
  message: string;
}
