export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  symbolNative: string;
  decimalDigits: number;
  exchangeRateToINR: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrencyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  code?: string;
  isActive?: boolean;
  sort?: string;
}

export interface CreateCurrencyData {
  code: string;
  name: string;
  symbol: string;
  symbolNative: string;
  decimalDigits: number;
  exchangeRateToINR: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateCurrencyData {
  name?: string;
  symbol?: string;
  symbolNative?: string;
  decimalDigits?: number;
  exchangeRateToINR?: number;
  isDefault?: boolean;
  isActive?: boolean;
}
