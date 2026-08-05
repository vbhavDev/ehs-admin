export interface PlanPricing {
  currencyCode: string;
  priceMonthly: number;
  priceAnnual: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  maxInspectionsPerMonth: number;
  maxImagesPerInspection: number;
  maxVideoUploads: number;
  maxUsers: number;
  features: string[];
  pricing: PlanPricing[];
  defaultCurrency: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPlanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tier?: string;
  isActive?: boolean;
  sort?: string;
}

export interface CreateSubscriptionPlanData {
  name: string;
  tier: string;
  maxInspectionsPerMonth: number;
  maxImagesPerInspection: number;
  maxVideoUploads: number;
  maxUsers: number;
  features?: string[];
  pricing?: PlanPricing[];
  defaultCurrency?: string;
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanData {
  name?: string;
  maxInspectionsPerMonth?: number;
  maxImagesPerInspection?: number;
  maxVideoUploads?: number;
  maxUsers?: number;
  features?: string[];
  pricing?: PlanPricing[];
  defaultCurrency?: string;
  isActive?: boolean;
}

export const SUBSCRIPTION_PLAN_TIERS = [
  'free',
  'individual_pro',
  'individual_business',
  'enterprise_starter',
  'enterprise_pro',
  'enterprise_custom',
] as const;

export type SubscriptionPlanTier = (typeof SUBSCRIPTION_PLAN_TIERS)[number];

export const SUBSCRIPTION_PLAN_TIER_LABELS: Record<string, string> = {
  free: 'Free',
  individual_pro: 'Individual Pro',
  individual_business: 'Individual Business',
  enterprise_starter: 'Enterprise Starter',
  enterprise_pro: 'Enterprise Pro',
  enterprise_custom: 'Enterprise Custom',
};
