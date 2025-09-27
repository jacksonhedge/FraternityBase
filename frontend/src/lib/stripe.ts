import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// Replace with your actual Stripe publishable key
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

// Pricing configuration
export const PRICING_PLANS = {
  free_trial: {
    name: 'Free Trial',
    price: 0,
    priceIds: {
      monthly: '',
      annual: ''
    }
  },
  starter: {
    name: 'Starter',
    price: {
      monthly: 99,
      annual: 89
    },
    priceIds: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_STARTER_MONTHLY || '',
      annual: import.meta.env.VITE_STRIPE_PRICE_STARTER_ANNUAL || ''
    }
  },
  growth: {
    name: 'Growth',
    price: {
      monthly: 299,
      annual: 269
    },
    priceIds: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_GROWTH_MONTHLY || '',
      annual: import.meta.env.VITE_STRIPE_PRICE_GROWTH_ANNUAL || ''
    }
  },
  pro: {
    name: 'Pro',
    price: {
      monthly: 599,
      annual: 539
    },
    priceIds: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || '',
      annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL || ''
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 'custom',
    priceIds: {
      monthly: '',
      annual: ''
    }
  }
};

// Helper function to create a checkout session
export const createCheckoutSession = async (
  priceId: string,
  customerId?: string,
  successUrl?: string,
  cancelUrl?: string
) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerId,
        successUrl: successUrl || `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: cancelUrl || `${window.location.origin}/pricing`,
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Helper function to manage subscription
export const manageSubscription = async (customerId: string) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/dashboard`,
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    // Redirect to Stripe Customer Portal
    window.location.href = session.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

// Helper function to cancel subscription
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};