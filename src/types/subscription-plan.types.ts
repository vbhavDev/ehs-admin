export interface CyclePricing {
  duration: string;
  days: number;
  status: boolean;
  price: number;
}

export interface PlanPricing {
  currencyCode: string;
  cycles: CyclePricing[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  maxInspectionsPerMonth: number;
  maxImagesPerInspection: number;
  maxVideoUploads: number;
  maxUsers: number;
  maxPlants?: number;
  maxStorageGB?: number;
  features: string[];
  pricing: PlanPricing[];
  defaultCurrency: string;
  isActive: boolean;
  isCustomPricing?: boolean;
  order?: number;
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
  maxPlants?: number;
  maxStorageGB?: number;
  features?: string[];
  pricing?: PlanPricing[];
  defaultCurrency?: string;
  isActive?: boolean;
  isCustomPricing?: boolean;
}

export interface UpdateSubscriptionPlanData {
  name?: string;
  maxInspectionsPerMonth?: number;
  maxImagesPerInspection?: number;
  maxVideoUploads?: number;
  maxUsers?: number;
  maxPlants?: number;
  maxStorageGB?: number;
  features?: string[];
  pricing?: PlanPricing[];
  defaultCurrency?: string;
  isActive?: boolean;
  isCustomPricing?: boolean;
}

export const SUBSCRIPTION_PLAN_TIERS = [
  'free',
  'individual_pro',
  'individual_business',
  'enterprise_starter',
  'enterprise_pro',
  'enterprise_custom',
] as const;

/**
 * Standard compliance / regulatory frameworks that can be attached to a plan
 * as feature tags. Offered as quick-toggle chips in the plan form; each selected
 * standard is stored in the plan's `features` array.
 */
export const COMPLIANCE_STANDARDS = ['OSHA', 'ISO 45001', 'General'] as const;
export type ComplianceStandard = (typeof COMPLIANCE_STANDARDS)[number];

export type SubscriptionPlanTier = (typeof SUBSCRIPTION_PLAN_TIERS)[number];

export const SUBSCRIPTION_PLAN_TIER_LABELS: Record<string, string> = {
  free: 'Free',
  individual_pro: 'Individual Pro',
  individual_business: 'Individual Business',
  enterprise_starter: 'Enterprise Starter',
  enterprise_pro: 'Enterprise Pro',
  enterprise_custom: 'Enterprise Custom',
};

/**
 * Visual identity per tier — drives the accent color, badge and icon
 * across the redesigned plans grid, detail and form pages.
 * Color values reference the Tailwind theme palette (no raw hex in JSX logic).
 */
export interface TierVisual {
  /** Tailwind color family key (e.g. 'brand', 'success', 'warning'). */
  accent: string;
  /** Soft chip background + text classes. */
  chip: string;
  /** Solid accent used for the card top bar / icon. */
  solid: string;
  /** Gradient used for the card hero accent. */
  gradient: string;
  /** Ring color for hover/selected affordances. */
  ring: string;
}

export const SUBSCRIPTION_PLAN_TIER_VISUALS: Record<string, TierVisual> = {
  free: {
    accent: 'gray',
    chip: 'bg-gray-100 text-gray-700 dark:bg-navy-700 dark:text-gray-300',
    solid: 'bg-gray-400 dark:bg-gray-500',
    gradient: 'from-gray-400/15 to-gray-400/0',
    ring: 'ring-gray-300 dark:ring-gray-600',
  },
  individual_pro: {
    accent: 'brand',
    chip: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
    solid: 'bg-brand-500',
    gradient: 'from-brand-500/15 to-brand-500/0',
    ring: 'ring-brand-400',
  },
  individual_business: {
    accent: 'success',
    chip: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
    solid: 'bg-success-500',
    gradient: 'from-success-500/15 to-success-500/0',
    ring: 'ring-success-400',
  },
  enterprise_starter: {
    accent: 'warning',
    chip: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500',
    solid: 'bg-warning-500',
    gradient: 'from-warning-500/15 to-warning-500/0',
    ring: 'ring-warning-400',
  },
  enterprise_pro: {
    accent: 'purple',
    chip: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
    solid: 'bg-purple-500',
    gradient: 'from-purple-500/15 to-purple-500/0',
    ring: 'ring-purple-400',
  },
  enterprise_custom: {
    accent: 'error',
    chip: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
    solid: 'bg-error-500',
    gradient: 'from-error-500/15 to-error-500/0',
    ring: 'ring-error-400',
  },
};

const DEFAULT_TIER_VISUAL: TierVisual = {
  accent: 'gray',
  chip: 'bg-gray-100 text-gray-700 dark:bg-navy-700 dark:text-gray-300',
  solid: 'bg-gray-400 dark:bg-gray-500',
  gradient: 'from-gray-400/15 to-gray-400/0',
  ring: 'ring-gray-300 dark:ring-gray-600',
};

export const getTierVisual = (tier: string): TierVisual =>
  SUBSCRIPTION_PLAN_TIER_VISUALS[tier] || DEFAULT_TIER_VISUAL;

/** Format a numeric plan limit; -1 is rendered as Unlimited. */
export const formatPlanLimit = (value?: number): string =>
  value === undefined || value === null ? '—' : value === -1 ? 'Unlimited' : String(value);

/** Human label for a billing cycle duration key. */
export const CYCLE_DURATION_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  halfyearly: 'Half-Yearly',
  annual: 'Annual',
  custom: 'Custom',
};

/** Short suffix used next to a price (e.g. /mo, /yr). */
export const CYCLE_DURATION_SUFFIX: Record<string, string> = {
  monthly: '/mo',
  quarterly: '/qtr',
  halfyearly: '/6mo',
  annual: '/yr',
};

/** Returns the lowest-priced active cycle across all pricing rows (for the headline price). */
export const getHeadlineCycle = (
  plan: SubscriptionPlan,
): { currencyCode: string; cycle: CyclePricing } | null => {
  let best: { currencyCode: string; cycle: CyclePricing } | null = null;
  for (const p of plan.pricing || []) {
    for (const c of p.cycles || []) {
      if (!c.status) continue;
      if (!best || c.price < best.cycle.price) {
        best = { currencyCode: p.currencyCode, cycle: c };
      }
    }
  }
  return best;
};
