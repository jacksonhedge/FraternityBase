/**
 * Pricing Configuration
 * Subscription-based model with partnership requests
 */

export const PRICING = {
  // Subscription Tiers (monthly pricing)
  SUBSCRIPTIONS: {
    STARTER: {
      name: 'Starter',
      monthlyPrice: 29.99,
      annualPrice: 29.99 * 12, // No discount for now
      partnershipRequests: 5,
      features: [
        '5 partnership requests per month',
        'Basic marketplace listing',
        'Email support',
        '20% platform fee on partnerships'
      ]
    },
    GROWTH: {
      name: 'Growth',
      monthlyPrice: 99.99,
      annualPrice: 99.99 * 12, // No discount for now
      partnershipRequests: 20,
      features: [
        '20 partnership requests per month',
        'Enhanced visibility',
        'Priority listing placement',
        'Advanced analytics',
        'Priority support',
        '20% platform fee on partnerships'
      ]
    },
    ENTERPRISE: {
      name: 'Enterprise',
      monthlyPrice: 999.00,
      annualPrice: 999.00 * 12,
      partnershipRequests: 'unlimited',
      features: [
        'Unlimited partnership requests',
        'Contracts & partnership management',
        'Advanced analytics & reporting',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        '20% platform fee on partnerships'
      ]
    }
  },

  // Platform fee (added on top of compensation)
  PLATFORM_FEE_PERCENTAGE: 0.20, // 20%

  // Stripe Price IDs (set these in environment variables)
  STRIPE_PRICE_IDS: {
    STARTER_MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    STARTER_ANNUAL: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual',
    GROWTH_MONTHLY: process.env.STRIPE_PRICE_GROWTH_MONTHLY || 'price_growth_monthly',
    GROWTH_ANNUAL: process.env.STRIPE_PRICE_GROWTH_ANNUAL || 'price_growth_annual',
    ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    ENTERPRISE_ANNUAL: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_enterprise_annual',
  },

  // Minimum partnership compensation
  MIN_PARTNERSHIP_COMPENSATION: 100.00, // $100 minimum

  // Helper function to calculate total amount (compensation + platform fee)
  calculateTotal(compensation: number): { compensation: number; platformFee: number; total: number } {
    const platformFee = Math.round(compensation * this.PLATFORM_FEE_PERCENTAGE * 100) / 100;
    const total = Math.round((compensation + platformFee) * 100) / 100;
    return {
      compensation,
      platformFee,
      total
    };
  },

  // Get quota for a subscription tier
  getQuotaForTier(tier: string): number {
    switch (tier) {
      case 'starter':
        return this.SUBSCRIPTIONS.STARTER.partnershipRequests;
      case 'growth':
        return this.SUBSCRIPTIONS.GROWTH.partnershipRequests;
      case 'enterprise':
        return 999; // Unlimited represented as 999
      default:
        return 0;
    }
  }
} as const;

export type SubscriptionTier = 'starter' | 'growth' | 'enterprise';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getSubscriptionInfo(tier: SubscriptionTier) {
  switch (tier) {
    case 'starter':
      return PRICING.SUBSCRIPTIONS.STARTER;
    case 'growth':
      return PRICING.SUBSCRIPTIONS.GROWTH;
    case 'enterprise':
      return PRICING.SUBSCRIPTIONS.ENTERPRISE;
    default:
      return PRICING.SUBSCRIPTIONS.STARTER;
  }
}
