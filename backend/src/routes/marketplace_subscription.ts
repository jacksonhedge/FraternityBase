import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const router = Router();

// Supabase admin client - lazy initialization
let supabaseAdmin: any;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
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

// Stripe client - lazy initialization (matching pattern from server.ts)
let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

/**
 * POST /api/marketplace/subscribe
 * Create a Stripe checkout session for marketplace subscription
 */
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { plan, paymentMethod, billingCycle = 'monthly', seats = 1 } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (plan !== 'standard' && plan !== 'enterprise') {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan'
      });
    }

    // Validate billing cycle
    if (billingCycle !== 'monthly' && billingCycle !== 'annual') {
      return res.status(400).json({
        success: false,
        error: 'Invalid billing cycle'
      });
    }

    // Validate seats
    const maxSeats = plan === 'standard' ? 4 : 10;
    if (seats < 1 || seats > maxSeats) {
      return res.status(400).json({
        success: false,
        error: `Invalid number of seats. ${plan === 'standard' ? 'Standard' : 'Enterprise'} plan supports 1-${maxSeats} seats.`
      });
    }

    // Get user's company info
    const { data: profile} = await getSupabaseAdmin()
      .from('user_profiles')
      .select('companies(id, name, email)')
      .eq('user_id', userId)
      .single();

    if (!profile || !(profile as any).companies) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const company = (profile as any).companies;

    // Create Stripe checkout session for Standard plan
    if (plan === 'standard') {
      const s = getStripe();
      if (!s) throw new Error("Stripe not initialized");

      // Pricing calculation
      const PRICE_PER_SEAT_MONTHLY = 99; // $99/month per seat
      const ANNUAL_DISCOUNT = 0.20; // 20% off for annual

      let unitAmount: number;
      let interval: 'month' | 'year';
      let totalAmount: number;

      if (billingCycle === 'annual') {
        // Annual: 12 months * price per seat * seats * (1 - discount)
        const annualPrice = PRICE_PER_SEAT_MONTHLY * 12 * (1 - ANNUAL_DISCOUNT);
        unitAmount = Math.round(annualPrice * 100); // Convert to cents and round
        interval = 'year';
        totalAmount = (annualPrice * seats) / 100; // Store in database as dollars
      } else {
        // Monthly: price per seat
        unitAmount = PRICE_PER_SEAT_MONTHLY * 100; // $99 in cents
        interval = 'month';
        totalAmount = PRICE_PER_SEAT_MONTHLY * seats;
      }

      const session = await s.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `FraternityBase Marketplace - Standard Plan (${seats} seat${seats > 1 ? 's' : ''})`,
                description: `Access 5,000+ fraternity chapters. ${billingCycle === 'annual' ? 'Annual billing (20% savings)' : 'Monthly billing'}.`,
              },
              unit_amount: unitAmount,
              recurring: {
                interval: interval,
              },
            },
            quantity: seats,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/dashboard?subscription=success`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/marketplace-pricing?subscription=cancelled`,
        customer_email: company.email,
        metadata: {
          companyId: company.id,
          userId: userId,
          plan: 'standard',
          billingCycle: billingCycle,
          seats: seats.toString(),
        },
      });

      // Store subscription info in database
      await getSupabaseAdmin()
        .from('marketplace_subscriptions')
        .upsert({
          company_id: company.id,
          plan: 'standard',
          status: 'pending',
          stripe_session_id: session.id,
          amount: totalAmount,
          currency: 'usd',
          billing_cycle: billingCycle,
          seats: seats,
          created_at: new Date().toISOString(),
        });

      return res.json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    }

    // Enterprise plan - contact sales
    if (plan === 'enterprise') {
      return res.json({
        success: true,
        message: 'Enterprise plan requires sales contact',
        contactEmail: 'sales@fraternitybase.com',
      });
    }

  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
    });
  }
});

/**
 * POST /api/marketplace/webhook
 * Handle Stripe webhooks for subscription events
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  try {
    const s = getStripe();
    if (!s) throw new Error("Stripe not initialized");

    const event = s.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (metadata && metadata.companyId) {
          // Update subscription status
          await getSupabaseAdmin()
            .from('marketplace_subscriptions')
            .update({
              status: 'active',
              stripe_subscription_id: session.subscription as string,
              activated_at: new Date().toISOString(),
            })
            .eq('stripe_session_id', session.id);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status === 'active' ? 'active' : 'cancelled';

        await getSupabaseAdmin()
          .from('marketplace_subscriptions')
          .update({
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({
      success: false,
      error: 'Webhook signature verification failed',
    });
  }
});

/**
 * GET /api/marketplace/subscription/status
 * Get current subscription status
 */
router.get('/subscription/status', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Get user's company
    const { data: profile } = await getSupabaseAdmin()
      .from('user_profiles')
      .select('companies(id)')
      .eq('user_id', userId)
      .single();

    if (!profile || !(profile as any).companies) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const companyId = (profile as any).companies.id;

    // Get subscription
    const { data: subscription } = await getSupabaseAdmin()
      .from('marketplace_subscriptions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return res.json({
      success: true,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get subscription status',
    });
  }
});

/**
 * POST /api/marketplace/partnership/commission
 * Calculate and record commission for a partnership
 */
router.post('/partnership/commission', async (req: Request, res: Response) => {
  try {
    const { partnershipId, amount, dealType } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Commission rates
    const FIXED_COMMISSION_RATE = 0.15; // 15%
    const CPA_COMMISSION_RATE = 0.20; // 20%

    const commissionRate = dealType === 'cpa' ? CPA_COMMISSION_RATE : FIXED_COMMISSION_RATE;
    const commissionAmount = amount * commissionRate;

    // Record commission
    const { data: commission, error } = await getSupabaseAdmin()
      .from('partnership_commissions')
      .insert({
        partnership_id: partnershipId,
        deal_type: dealType,
        partnership_amount: amount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      commission: {
        id: commission.id,
        amount: commissionAmount,
        rate: commissionRate,
        dealType: dealType,
      },
    });
  } catch (error) {
    console.error('Commission calculation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate commission',
    });
  }
});

export default router;
