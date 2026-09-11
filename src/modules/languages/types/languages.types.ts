export type TextDirection = 'ltr' | 'rtl';

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: TextDirection;
  isDefault: boolean;
  isActive: boolean;
  totalKeys: number;
  lastTranslatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLanguageDto {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  direction?: TextDirection;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateLanguageDto {
  name?: string;
  nativeName?: string;
  flag?: string;
  direction?: TextDirection;
  isActive?: boolean;
}

export interface QueryLanguageDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface ImportCatalogResult {
  languageCode: string;
  totalKeys: number;
  mode: string;
  version: number;
}

export interface AiGenerateTranslationDto {
  targetCode: string;
  targetName: string;
  provider?: 'gemini' | 'openai';
  apiKey?: string;
  sourceCode?: string;
  customGuidelines?: string;
}

export type MessageRecord = Record<string, unknown>;

export interface AiGenerateTranslationResult {
  targetCode: string;
  targetName: string;
  providerUsed: string;
  totalKeys: number;
  sourceKeyCount: number;
  messages: MessageRecord;
  sourceMessages?: MessageRecord;
}

export interface AiPluginStatus {
  isEnabled: boolean;
  hasKey: boolean;
  name: string;
}

export interface AiStatusResponse {
  gemini: AiPluginStatus;
  openai: AiPluginStatus;
}
