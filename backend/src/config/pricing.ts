/**
 * Pricing Configuration
 * All prices in USD
 */

export const PRICING = {
  // Chapter access
  CHAPTER_UNLOCK: 19.99,

  // Premium services (request-based)
  WARM_INTRO: 59.99,
  AMBASSADOR_REFERRAL: 99.99,

  // Top-up presets
  TOP_UP_PRESETS: [25, 50, 100, 250, 500],

  // Auto-reload defaults
  DEFAULT_AUTO_RELOAD_THRESHOLD: 10.00,
  DEFAULT_AUTO_RELOAD_AMOUNT: 50.00,

  // Free trial
  FREE_TRIAL_BALANCE: 50.00, // $50 = 2-3 chapter unlocks

  // Minimum amounts
  MIN_TOP_UP: 10.00,
  MIN_AUTO_RELOAD_THRESHOLD: 5.00,
  MIN_AUTO_RELOAD_AMOUNT: 25.00,
} as const;

export type ServiceType = 'chapter_unlock' | 'warm_intro' | 'ambassador_referral';

export function getServicePrice(serviceType: ServiceType): number {
  switch (serviceType) {
    case 'chapter_unlock':
      return PRICING.CHAPTER_UNLOCK;
    case 'warm_intro':
      return PRICING.WARM_INTRO;
    case 'ambassador_referral':
      return PRICING.AMBASSADOR_REFERRAL;
    default:
      throw new Error(`Unknown service type: ${serviceType}`);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
