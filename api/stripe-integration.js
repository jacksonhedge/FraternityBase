// STRIPE INTEGRATION - Complete payment flow
// This handles everything from checkout to webhooks

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ==========================================
// CREDIT PACKAGES
// ==========================================

const PACKAGES = {
  starter: {
    credits: 100,
    price: 59,
    stripePrice: 'price_starter', // Create in Stripe Dashboard
    name: 'Starter Pack'
  },
  popular: {
    credits: 500,
    price: 275,
    stripePrice: 'price_popular',
    name: 'Popular Pack'
  },
  professional: {
    credits: 1000,
    price: 500,
    stripePrice: 'price_professional',
    name: 'Professional Pack'
  },
  enterprise: {
    credits: 5000,
    price: 2000,
    stripePrice: 'price_enterprise',
    name: 'Enterprise Pack'
  }
};

// ==========================================
// CREATE CHECKOUT SESSION
// ==========================================

export async function createCheckoutSession(req, res) {
  const { packageId, companyId, userEmail } = req.body;

  const package = PACKAGES[packageId];
  if (!package) {
    return res.status(400).json({ error: 'Invalid package' });
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: package.stripePrice,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success&credits=${package.credits}`,
      cancel_url: `${process.env.FRONTEND_URL}/credits?payment=cancelled`,
      customer_email: userEmail,
      metadata: {
        companyId,
        packageId,
        credits: package.credits
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

// ==========================================
// STRIPE WEBHOOK HANDLER
// ==========================================

export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Check if we've already processed this event
  const { data: existing } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('id', event.id)
    .single();

  if (existing) {
    return res.json({ received: true, skipped: 'duplicate' });
  }

  // Store event
  await supabase
    .from('stripe_events')
    .insert({
      id: event.id,
      type: event.type,
      data: event.data,
      processed: false
    });

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'payment_intent.succeeded':
      // Additional handling if needed
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Mark as processed
  await supabase
    .from('stripe_events')
    .update({ processed: true })
    .eq('id', event.id);

  res.json({ received: true });
}

// ==========================================
// HANDLE SUCCESSFUL PAYMENT
// ==========================================

async function handlePaymentSuccess(session) {
  const { companyId, packageId, credits } = session.metadata;
  const paymentIntent = session.payment_intent;
  const amountPaid = session.amount_total / 100; // Convert cents to dollars

  try {
    // Add credits using database function
    const { data, error } = await supabase.rpc('add_credits', {
      p_company_id: companyId,
      p_company_email: session.customer_email,
      p_amount: parseInt(credits),
      p_stripe_payment_intent: paymentIntent,
      p_amount_paid: amountPaid,
      p_description: `Purchased ${credits} credits - ${PACKAGES[packageId].name}`
    });

    if (error) throw error;

    console.log(`✅ Added ${credits} credits to company ${companyId}`);

    // Send confirmation email (optional)
    await sendPurchaseConfirmation(session.customer_email, credits, amountPaid);

  } catch (error) {
    console.error('Error adding credits:', error);
    // Consider sending alert to admin
  }
}

// ==========================================
// CREDIT BALANCE CHECK
// ==========================================

export async function getBalance(req, res) {
  const { companyId } = req.user;

  const { data, error } = await supabase
    .from('balances')
    .select('total_credits, lifetime_credits_purchased')
    .eq('company_id', companyId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: 'Failed to get balance' });
  }

  res.json({
    balance: data?.total_credits || 0,
    lifetime: data?.lifetime_credits_purchased || 0
  });
}

// ==========================================
// SPEND CREDITS
// ==========================================

export async function spendCredits(req, res) {
  const { companyId } = req.user;
  const { amount, actionType, resourceType, resourceId } = req.body;

  // Use database function to spend credits
  const { data, error } = await supabase.rpc('spend_credits', {
    p_company_id: companyId,
    p_amount: amount,
    p_action_type: actionType,
    p_resource_type: resourceType,
    p_resource_id: resourceId,
    p_description: `${actionType} for ${resourceType}`
  });

  if (error || !data) {
    return res.status(402).json({
      error: 'Insufficient credits',
      required: amount,
      balance: await getUserBalance(companyId)
    });
  }

  res.json({ success: true, spent: amount });
}

// ==========================================
// CHECK ACCESS TO DATA
// ==========================================

export async function checkAccess(companyId, chapterId, unlockType) {
  const { data } = await supabase
    .from('unlocked_data')
    .select('id, expires_at')
    .eq('company_id', companyId)
    .eq('chapter_id', chapterId)
    .eq('unlock_type', unlockType)
    .single();

  if (!data) return false;

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return false;
  }

  return true;
}

// ==========================================
// UNLOCK DATA (Main function for purchasing access)
// ==========================================

export async function unlockChapterData(req, res) {
  const { companyId } = req.user;
  const { chapterId, unlockType } = req.body;

  // Define costs
  const UNLOCK_COSTS = {
    'chapter_roster': 100,      // View roster (no contacts)
    'chapter_contacts': 500,    // All emails/phones
    'officer_contacts': 80,     // Just officers
    'export_chapter': 200,      // Download CSV
  };

  const cost = UNLOCK_COSTS[unlockType];
  if (!cost) {
    return res.status(400).json({ error: 'Invalid unlock type' });
  }

  // Check if already unlocked
  const hasAccess = await checkAccess(companyId, chapterId, unlockType);
  if (hasAccess) {
    return res.json({
      success: true,
      alreadyUnlocked: true,
      message: 'You already have access to this data'
    });
  }

  // Try to spend credits
  const spent = await supabase.rpc('spend_credits', {
    p_company_id: companyId,
    p_amount: cost,
    p_action_type: `unlock_${unlockType}`,
    p_resource_type: 'chapter',
    p_resource_id: chapterId,
    p_description: `Unlocked ${unlockType} for chapter`
  });

  if (!spent.data) {
    return res.status(402).json({
      error: 'Insufficient credits',
      required: cost,
      balance: await getUserBalance(companyId),
      purchaseUrl: '/credits/purchase'
    });
  }

  // Record unlock
  await supabase
    .from('unlocked_data')
    .insert({
      company_id: companyId,
      unlock_type: unlockType,
      chapter_id: chapterId,
      credits_spent: cost,
      expires_at: null // Permanent access
    });

  res.json({
    success: true,
    creditsSpent: cost,
    message: `Successfully unlocked ${unlockType}`,
    accessGranted: true
  });
}

// ==========================================
// TRANSACTION HISTORY
// ==========================================

export async function getTransactionHistory(req, res) {
  const { companyId } = req.user;

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return res.status(500).json({ error: 'Failed to get transactions' });
  }

  res.json(data);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function getUserBalance(companyId) {
  const { data } = await supabase
    .from('balances')
    .select('total_credits')
    .eq('company_id', companyId)
    .single();

  return data?.total_credits || 0;
}

async function sendPurchaseConfirmation(email, credits, amount) {
  // Implement email sending
  console.log(`Email to ${email}: You purchased ${credits} credits for $${amount}`);
}

// ==========================================
// CREDIT PRICING DISPLAY
// ==========================================

export async function getCreditPackages(req, res) {
  const packages = Object.entries(PACKAGES).map(([id, pkg]) => ({
    id,
    ...pkg,
    savings: calculateSavings(pkg.credits, pkg.price)
  }));

  res.json(packages);
}

function calculateSavings(credits, price) {
  const baseRate = 0.59; // Base rate per credit
  const fullPrice = credits * baseRate;
  const savings = ((fullPrice - price) / fullPrice * 100).toFixed(0);
  return savings > 0 ? `${savings}%` : null;
}

export default {
  createCheckoutSession,
  handleStripeWebhook,
  getBalance,
  spendCredits,
  unlockChapterData,
  getTransactionHistory,
  getCreditPackages
};