import { Router } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PRICING, SubscriptionTier, getSubscriptionInfo } from '../config/pricing';

const router = Router();

let stripe: Stripe;
let supabaseAdmin: ReturnType<typeof createClient>;

function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

function getSupabaseAdmin(): any {
  if (!supabaseAdmin) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return supabaseAdmin;
}

// GET /subscriptions/tiers - Get available subscription tiers
router.get('/tiers', async (req, res) => {
  try {
    const tiers = [
      {
        id: 'starter',
        ...PRICING.SUBSCRIPTIONS.STARTER
      },
      {
        id: 'growth',
        ...PRICING.SUBSCRIPTIONS.GROWTH
      },
      {
        id: 'enterprise',
        ...PRICING.SUBSCRIPTIONS.ENTERPRISE
      }
    ];

    res.json({ success: true, tiers });
  } catch (error: any) {
    console.error('Error fetching tiers:', error);
    res.status(500).json({ error: 'Failed to fetch subscription tiers' });
  }
});

// GET /subscriptions/status - Get current subscription status
router.get('/status', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const supabase = getSupabaseAdmin();

    const { data: account, error } = await supabase
      .from('account_balance')
      .select(`
        subscription_tier,
        subscription_status,
        stripe_subscription_id,
        subscription_current_period_end,
        subscription_started_at,
        partnership_requests_quota,
        partnership_requests_used,
        partnership_requests_reset_at
      `)
      .eq('company_id', companyId)
      .single();

    if (error || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const tierInfo = getSubscriptionInfo(account.subscription_tier as SubscriptionTier);

    res.json({
      success: true,
      subscription: {
        tier: account.subscription_tier,
        status: account.subscription_status || 'active',
        stripeSubscriptionId: account.stripe_subscription_id,
        currentPeriodEnd: account.subscription_current_period_end,
        startedAt: account.subscription_started_at,
        ...tierInfo
      },
      quota: {
        total: account.subscription_tier === 'enterprise' ? 'unlimited' : account.partnership_requests_quota,
        used: account.partnership_requests_used,
        remaining: account.subscription_tier === 'enterprise'
          ? 'unlimited'
          : Math.max(0, account.partnership_requests_quota - account.partnership_requests_used),
        resetAt: account.partnership_requests_reset_at
      }
    });
  } catch (error: any) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// POST /subscriptions/subscribe - Create subscription checkout
router.post('/subscribe', async (req, res) => {
  try {
    const { tier, period, companyId } = req.body;

    if (!['starter', 'growth', 'enterprise'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    if (!['monthly', 'annual'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period' });
    }

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('id', companyId)
      .single();

    // Map to Stripe price ID
    const priceIds: Record<string, Record<string, string>> = {
      starter: {
        monthly: PRICING.STRIPE_PRICE_IDS.STARTER_MONTHLY,
        annual: PRICING.STRIPE_PRICE_IDS.STARTER_ANNUAL
      },
      growth: {
        monthly: PRICING.STRIPE_PRICE_IDS.GROWTH_MONTHLY,
        annual: PRICING.STRIPE_PRICE_IDS.GROWTH_ANNUAL
      },
      enterprise: {
        monthly: PRICING.STRIPE_PRICE_IDS.ENTERPRISE_MONTHLY,
        annual: PRICING.STRIPE_PRICE_IDS.ENTERPRISE_ANNUAL
      }
    };

    const priceId = priceIds[tier][period];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/app/team?subscription=success&tier=${tier}`,
      cancel_url: `${process.env.FRONTEND_URL}/app/team?subscription=cancelled`,
      metadata: {
        type: 'subscription',
        company_id: companyId,
        company_name: company?.company_name || 'Unknown',
        tier,
        period,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error('Error creating subscription checkout:', error);
    res.status(500).json({ error: 'Failed to create subscription checkout' });
  }
});

// POST /subscriptions/change - Change subscription tier
router.post('/change', async (req, res) => {
  try {
    const { companyId, newTier } = req.body;

    if (!companyId || !newTier) {
      return res.status(400).json({ error: 'Company ID and new tier required' });
    }

    if (!['starter', 'growth', 'enterprise'].includes(newTier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    // Get current subscription info
    const { data: account, error: accountError } = await supabase
      .from('account_balance')
      .select('stripe_subscription_id, subscription_tier')
      .eq('company_id', companyId)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (!account.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Get the Stripe subscription
    const subscription = await stripe.subscriptions.retrieve(account.stripe_subscription_id);

    // Get new price ID
    const priceId = PRICING.STRIPE_PRICE_IDS[`${newTier.toUpperCase()}_MONTHLY` as keyof typeof PRICING.STRIPE_PRICE_IDS];

    // Update subscription with proration
    const updatedSubscription = await stripe.subscriptions.update(
      account.stripe_subscription_id,
      {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'always_invoice',
        metadata: {
          ...subscription.metadata,
          tier: newTier,
          changed_from: account.subscription_tier
        }
      }
    );

    // Update local database
    const newQuota = PRICING.getQuotaForTier(newTier);
    await supabase
      .from('account_balance')
      .update({
        subscription_tier: newTier,
        partnership_requests_quota: newQuota,
        subscription_current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString()
      })
      .eq('company_id', companyId);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      newTier,
      quota: newQuota === 999 ? 'unlimited' : newQuota
    });
  } catch (error: any) {
    console.error('Subscription change error:', error);
    res.status(500).json({ error: 'Failed to change subscription' });
  }
});

// POST /subscriptions/cancel - Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const supabase = getSupabaseAdmin();

    // Get subscription info
    const { data: account, error: accountError } = await supabase
      .from('account_balance')
      .select('stripe_subscription_id')
      .eq('company_id', companyId)
      .single();

    if (accountError || !account || !account.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel the subscription in Stripe
    const stripe = getStripe();
    await stripe.subscriptions.cancel(account.stripe_subscription_id);

    // Update local database
    await supabase
      .from('account_balance')
      .update({ subscription_status: 'canceled' })
      .eq('company_id', companyId);

    res.json({
      success: true,
      message: 'Subscription cancelled. You can continue using your current tier until the end of the billing period.'
    });
  } catch (error: any) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Webhook handler
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).send('Webhook signature missing');
  }

  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = getSupabaseAdmin();
  console.log('🔔 Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (metadata?.type === 'subscription') {
          const companyId = metadata.company_id;
          const tier = metadata.tier as SubscriptionTier;

          // Get subscription details
          if (session.subscription) {
            const subscription = await getStripe().subscriptions.retrieve(
              typeof session.subscription === 'string' ? session.subscription : session.subscription.id
            );

            const quota = PRICING.getQuotaForTier(tier);
            const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

            // Update account with subscription
            await supabase
              .from('account_balance')
              .update({
                subscription_tier: tier,
                subscription_status: 'active',
                stripe_subscription_id: subscription.id,
                stripe_customer_id: typeof session.customer === 'string'
                  ? session.customer
                  : session.customer?.id || null,
                subscription_current_period_end: currentPeriodEnd.toISOString(),
                subscription_started_at: new Date().toISOString(),
                partnership_requests_quota: quota,
                partnership_requests_used: 0,
                partnership_requests_reset_at: new Date().toISOString()
              })
              .eq('company_id', companyId);

            console.log(`✅ Activated ${tier} subscription for company ${companyId}`);
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find company by stripe_customer_id
        const { data: account } = await supabase
          .from('account_balance')
          .select('company_id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (account) {
          if (event.type === 'customer.subscription.deleted') {
            // Downgrade to starter
            await supabase
              .from('account_balance')
              .update({
                subscription_tier: 'starter',
                subscription_status: 'canceled',
                partnership_requests_quota: 5
              })
              .eq('company_id', account.company_id);

            console.log(`⚠️ Subscription cancelled for company ${account.company_id}`);
          } else {
            // Update subscription status
            await supabase
              .from('account_balance')
              .update({
                subscription_status: subscription.status,
                subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
              })
              .eq('company_id', account.company_id);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        // Only process for subscription renewals
        if (invoice.billing_reason === 'subscription_cycle') {
          const { data: account } = await supabase
            .from('account_balance')
            .select('company_id, partnership_requests_quota')
            .eq('stripe_customer_id', invoice.customer)
            .single();

          if (account) {
            // Reset monthly partnership requests
            await supabase
              .from('account_balance')
              .update({
                partnership_requests_used: 0,
                partnership_requests_reset_at: new Date().toISOString()
              })
              .eq('company_id', account.company_id);

            console.log(`✅ Reset partnership requests for company ${account.company_id}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        const { data: account } = await supabase
          .from('account_balance')
          .select('company_id')
          .eq('stripe_customer_id', invoice.customer)
          .single();

        if (account) {
          await supabase
            .from('account_balance')
            .update({ subscription_status: 'past_due' })
            .eq('company_id', account.company_id);

          console.log(`⚠️ Payment failed for company ${account.company_id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
