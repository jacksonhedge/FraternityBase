/**
 * Pricing Configuration
 * Credits-based system with dollar values for purchases
 */

export const PRICING = {
  // Chapter access (in credits) - Dynamic pricing based on rating
  // Note: Actual pricing is calculated dynamically in server.ts based on five_star_rating
  // These values are deprecated in favor of grade-based pricing:
  // 5.0: 5 credits / $4.99
  // 4.5-4.9: 7 credits / $6.99
  // 4.0-4.4: 5 credits / $4.99
  // 3.5-3.9: 3 credits / $2.99
  // 3.0-3.4: 2 credits / $1.99
  // <3.0: 1 credit / $0.99
  CHAPTER_UNLOCK: 3, // Average chapter unlock (deprecated)
  FIVE_STAR_UNLOCK: 5, // 5.0 star chapter unlock

  // Premium services (in credits)
  WARM_INTRO: 200,
  AMBASSADOR_REFERRAL: 330,
  VENUE_CONNECTION: 160,

  // Subscription credits
  MONTHLY_SUBSCRIPTION_GRANT: 100, // Monthly credits for subscribers
  ENTERPRISE_SUBSCRIPTION_GRANT: 500, // Enterprise tier monthly credits

  // Credit purchase options (credits and dollar prices)
  CREDIT_PACKAGES: [
    { credits: 100, price: 29.99, label: 'Starter Pack' },
    { credits: 500, price: 139.99, label: 'Value Pack (7% bonus)' },
    { credits: 1000, price: 249.99, label: 'Pro Pack (17% bonus)' }
  ],

  // Dollar values for services (for analytics tracking)
  DOLLAR_VALUES: {
    FIVE_STAR_UNLOCK: 4.99,
    CHAPTER_UNLOCK: 2.99,
    WARM_INTRO: 59.99,
    AMBASSADOR_REFERRAL: 99.99,
    VENUE_CONNECTION: 49.99,
  },

  // Top-up presets (in credits)
  TOP_UP_PRESETS: [100, 200, 500, 1000],

  // Free trial
  FREE_TRIAL_CREDITS: 0, // Trial users start with 0 credits

  // Minimum amounts (in credits)
  MIN_CREDIT_PURCHASE: 100,
} as const;

export type ServiceType = 'chapter_unlock' | 'five_star_unlock' | 'warm_intro' | 'ambassador_referral' | 'venue_connection';

export function getServiceCredits(serviceType: ServiceType): number {
  switch (serviceType) {
    case 'chapter_unlock':
      return PRICING.CHAPTER_UNLOCK;
    case 'five_star_unlock':
      return PRICING.FIVE_STAR_UNLOCK;
    case 'warm_intro':
      return PRICING.WARM_INTRO;
    case 'ambassador_referral':
      return PRICING.AMBASSADOR_REFERRAL;
    case 'venue_connection':
      return PRICING.VENUE_CONNECTION;
    default:
      throw new Error(`Unknown service type: ${serviceType}`);
  }
}

export function getServiceDollarValue(serviceType: ServiceType): number {
  switch (serviceType) {
    case 'chapter_unlock':
      return PRICING.DOLLAR_VALUES.CHAPTER_UNLOCK;
    case 'five_star_unlock':
      return PRICING.DOLLAR_VALUES.FIVE_STAR_UNLOCK;
    case 'warm_intro':
      return PRICING.DOLLAR_VALUES.WARM_INTRO;
    case 'ambassador_referral':
      return PRICING.DOLLAR_VALUES.AMBASSADOR_REFERRAL;
    case 'venue_connection':
      return PRICING.DOLLAR_VALUES.VENUE_CONNECTION;
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

export function formatCredits(credits: number): string {
  return `${credits} credit${credits !== 1 ? 's' : ''}`;
}
