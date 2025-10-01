import { Router } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Lazy initialization - these will be created when first accessed
let stripe: Stripe;
let supabase: ReturnType<typeof createClient>;

function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

function getSupabase() {
  if (!supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
    }
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }
  return supabase;
}

// Credit packages configuration
const PACKAGES: Record<string, any> = {
  starter: {
    credits: 100,
    price: 59,
    stripePrice: process.env.VITE_STRIPE_PRICE_STARTER || 'price_1SCo7FGCEQehRVO2DuF4YivE',
    name: 'Starter Pack'
  },
  popular: {
    credits: 500,
    price: 275,
    stripePrice: process.env.VITE_STRIPE_PRICE_POPULAR || 'price_1SCo7uGCEQehRVO2aeKPhB5D',
    name: 'Popular Pack'
  },
  professional: {
    credits: 1000,
    price: 500,
    stripePrice: process.env.VITE_STRIPE_PRICE_PROFESSIONAL || 'price_1SCo8HGCEQehRVO2THIU6hiP',
    name: 'Professional Pack'
  },
  enterprise: {
    credits: 5000,
    price: 2000,
    stripePrice: process.env.VITE_STRIPE_PRICE_ENTERPRISE || 'price_1SCo8yGCEQehRVO2ItYM17aV',
    name: 'Enterprise Pack'
  }
};

// Get credit balance
router.get('/balance', async (req, res) => {
  try {
    // TODO: Get companyId from auth token
    // For now, return mock data
    res.json({ balance: 0 });
  } catch (error: any) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Create checkout session
router.post('/checkout', async (req, res) => {
  const { packageId, priceId, companyId, userEmail } = req.body;

  const pkg = PACKAGES[packageId];
  if (!pkg) {
    return res.status(400).json({ error: 'Invalid package' });
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId || pkg.stripePrice,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/dashboard?payment=success&credits=${pkg.credits}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/credits?payment=cancelled`,
      customer_email: userEmail,
      metadata: {
        companyId: companyId || 'demo',
        packageId,
        credits: pkg.credits.toString()
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
  }
});

// Stripe webhook handler
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('No signature');
  }

  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('💳 Payment successful:', {
        companyId: session.metadata?.companyId,
        credits: session.metadata?.credits,
        amount: session.amount_total
      });

      // TODO: Add credits to Supabase database
      // const { data, error } = await supabase.rpc('add_credits', {
      //   p_company_id: session.metadata?.companyId,
      //   p_company_email: session.customer_email,
      //   p_amount: parseInt(session.metadata?.credits || '0'),
      //   p_stripe_payment_intent: session.payment_intent,
      //   p_amount_paid: (session.amount_total || 0) / 100,
      //   p_description: `Purchased ${PACKAGES[session.metadata?.packageId || '']?.name}`
      // });

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;