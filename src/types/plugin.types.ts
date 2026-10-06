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

export interface AiModelInfo {
  id: string;
  name: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  isDefault: boolean;
  isLiveFetched?: boolean;
  category?: string;
  bestFor?: string;
  ehsPlatformRecommendation?: string;
  recommendedRoles?: string[];
  latencyTier?: string;
  costTier?: string;
  modalities?: string[];
  recommendedTemp?: number;
}

export interface AvailableAiModelsResult {
  pluginKey: string;
  defaultModel: string;
  models: AiModelInfo[];
  lastFetchedAt: string;
}

export interface AiOrchestrationConfig {
  primaryProvider: string;
  primaryModel: string;
  secondaryProvider: string;
  secondaryModel: string;
  fallbackMethod: 'AUTO_FAILOVER' | 'COST_OPTIMIZED' | 'SEQUENTIAL_CHAIN';
  timeoutSeconds: number;
  retryAttempts: number;
  enableAutomaticFallback: boolean;
  features?: {
    HAZARD_DETECTION?: {
      primaryProvider: string;
      primaryModel: string;
      secondaryProvider: string;
      secondaryModel: string;
    };
    AI_COPILOT?: {
      primaryProvider: string;
      primaryModel: string;
      secondaryProvider: string;
      secondaryModel: string;
    };
    AI_TRANSLATION?: {
      primaryProvider: string;
      primaryModel: string;
      secondaryProvider: string;
      secondaryModel: string;
    };
    AI_REPORTING?: {
      primaryProvider: string;
      primaryModel: string;
      secondaryProvider: string;
      secondaryModel: string;
    };
  };
  availableProviders?: Array<{
    key: string;
    name: string;
    currentModel: string;
    isEnabled: boolean;
  }>;
}
