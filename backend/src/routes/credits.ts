import { Router } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PRICING } from '../config/pricing';

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

// Note: GET /balance is now handled directly in server.ts before this router is mounted

// Get transaction history
router.get('/transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await getSupabase().auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Get user's company_id from user_profiles
    const { data: profile, error: profileError } = await getSupabase()
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get all transactions for this company
    const { data: transactions, error } = await getSupabase()
      .from('balance_transactions')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    res.json({ success: true, transactions });
  } catch (error: any) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Update auto-reload settings
router.post('/auto-reload/settings', async (req, res) => {
  const { companyId, enabled, threshold, amount } = req.body;

  // Validate
  if (!companyId) {
    return res.status(400).json({ error: 'Company ID required' });
  }

  if (threshold !== undefined && threshold < PRICING.MIN_AUTO_RELOAD_THRESHOLD) {
    return res.status(400).json({
      error: `Threshold must be at least $${PRICING.MIN_AUTO_RELOAD_THRESHOLD}`
    });
  }

  if (amount !== undefined && amount < PRICING.MIN_AUTO_RELOAD_AMOUNT) {
    return res.status(400).json({
      error: `Auto-reload amount must be at least $${PRICING.MIN_AUTO_RELOAD_AMOUNT}`
    });
  }

  try {
    const updateData: any = {};
    if (enabled !== undefined) updateData.auto_reload_enabled = enabled;
    if (threshold !== undefined) updateData.auto_reload_threshold = threshold;
    if (amount !== undefined) updateData.auto_reload_amount = amount;

    const { data, error } = await getSupabase()
      .from('account_balance')
      .update(updateData)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update auto-reload settings:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }

    res.json({
      enabled: data.auto_reload_enabled,
      threshold: data.auto_reload_threshold,
      amount: data.auto_reload_amount
    });
  } catch (error: any) {
    console.error('Auto-reload settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Trigger auto-reload manually or via scheduled check
router.post('/auto-reload/trigger', async (req, res) => {
  const { companyId } = req.body;

  if (!companyId) {
    return res.status(400).json({ error: 'Company ID required' });
  }

  try {
    // Get account balance and settings
    const { data: account, error: accountError } = await getSupabase()
      .from('account_balance')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check if auto-reload is needed
    if (!account.auto_reload_enabled) {
      return res.json({ message: 'Auto-reload not enabled', triggered: false });
    }

    if (account.balance_dollars >= account.auto_reload_threshold) {
      return res.json({
        message: 'Balance above threshold',
        triggered: false,
        balance: account.balance_dollars,
        threshold: account.auto_reload_threshold
      });
    }

    // Check if payment method is saved
    if (!account.stripe_customer_id || !account.stripe_payment_method_id) {
      return res.status(400).json({
        error: 'No payment method saved. Please add funds and save payment method.'
      });
    }

    // Create off-session payment
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(account.auto_reload_amount * 100), // Convert to cents
      currency: 'usd',
      customer: account.stripe_customer_id,
      payment_method: account.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      description: `Auto-reload: $${account.auto_reload_amount.toFixed(2)}`,
      metadata: {
        companyId,
        transaction_type: 'auto_reload'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Add balance
      const { data: transactionId, error: balanceError } = await getSupabase().rpc('add_balance', {
        p_company_id: companyId,
        p_amount: account.auto_reload_amount,
        p_transaction_type: 'auto_reload',
        p_description: `Auto-reload: $${account.auto_reload_amount.toFixed(2)}`,
        p_stripe_payment_intent_id: paymentIntent.id
      });

      if (balanceError) {
        console.error('Failed to add auto-reload balance:', balanceError);
        return res.status(500).json({ error: 'Payment succeeded but failed to add balance' });
      }

      // Update last auto-reload timestamp
      await getSupabase()
        .from('account_balance')
        .update({ last_auto_reload_at: new Date().toISOString() })
        .eq('company_id', companyId);

      res.json({
        message: 'Auto-reload successful',
        triggered: true,
        amount: account.auto_reload_amount,
        transactionId,
        paymentIntentId: paymentIntent.id
      });
    } else {
      res.status(400).json({
        error: 'Payment requires authentication',
        paymentIntentStatus: paymentIntent.status
      });
    }
  } catch (error: any) {
    console.error('Auto-reload error:', error);
    res.status(500).json({
      error: 'Auto-reload failed',
      details: error.message
    });
  }
});

// Create checkout session for top-up
router.post('/checkout', async (req, res) => {
  const { amount, companyId, userEmail, savePaymentMethod = false } = req.body;

  // Validate amount
  if (!amount || typeof amount !== 'number' || amount < PRICING.MIN_TOP_UP) {
    return res.status(400).json({
      error: `Invalid amount. Minimum top-up is $${PRICING.MIN_TOP_UP}`
    });
  }

  try {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Account Balance Top-Up',
            description: `Add $${amount.toFixed(2)} to your account balance`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/dashboard?payment=success&amount=${amount}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/credits?payment=cancelled`,
      customer_email: userEmail,
      metadata: {
        companyId: companyId || 'demo',
        amount: amount.toString(),
        transaction_type: 'top_up'
      }
    };

    // If user wants to save payment method for auto-reload
    if (savePaymentMethod) {
      sessionConfig.payment_intent_data = {
        setup_future_usage: 'off_session',
      };
    }

    const session = await getStripe().checkout.sessions.create(sessionConfig);

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
      const session = event.data.object as Stripe.Checkout.Session;
      const amountDollars = (session.amount_total || 0) / 100;
      const companyId = session.metadata?.companyId;
      const transactionType = session.metadata?.transaction_type || 'top_up';

      console.log('💳 Payment successful:', {
        companyId,
        amount: amountDollars,
        transactionType,
        paymentIntent: session.payment_intent
      });

      if (!companyId || companyId === 'demo') {
        console.error('⚠️ Invalid company ID in webhook metadata');
        break;
      }

      try {
        // Call the add_balance SQL function
        const { data, error } = await getSupabase().rpc('add_balance', {
          p_company_id: companyId,
          p_amount: amountDollars,
          p_transaction_type: transactionType,
          p_description: `Account top-up: $${amountDollars.toFixed(2)}`,
          p_stripe_payment_intent_id: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null
        });

        if (error) {
          console.error('❌ Failed to add balance:', error);
        } else {
          console.log('✅ Balance added successfully. Transaction ID:', data);

          // If payment method was saved, update the account_balance record
          if (session.setup_intent || session.payment_intent) {
            const paymentIntent = await getStripe().paymentIntents.retrieve(
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id || ''
            );

            if (paymentIntent.customer && paymentIntent.payment_method) {
              await getSupabase()
                .from('account_balance')
                .update({
                  stripe_customer_id: typeof paymentIntent.customer === 'string'
                    ? paymentIntent.customer
                    : paymentIntent.customer?.id,
                  stripe_payment_method_id: typeof paymentIntent.payment_method === 'string'
                    ? paymentIntent.payment_method
                    : paymentIntent.payment_method?.id
                })
                .eq('company_id', companyId);

              console.log('💾 Saved payment method for auto-reload');
            }
          }
        }
      } catch (err: any) {
        console.error('❌ Error processing payment:', err);
      }

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Create warm introduction request ($59.99)
router.post('/warm-intro/request', async (req, res) => {
  const { companyId, chapterId, message, preferredContactMethod, urgency } = req.body;

  if (!companyId || !chapterId) {
    return res.status(400).json({ error: 'Company ID and Chapter ID required' });
  }

  try {
    // Check balance
    const { data: account, error: accountError } = await getSupabase()
      .from('account_balance')
      .select('balance_dollars')
      .eq('company_id', companyId)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.balance_dollars < PRICING.WARM_INTRO) {
      return res.status(402).json({
        error: 'Insufficient balance',
        required: PRICING.WARM_INTRO,
        available: account.balance_dollars
      });
    }

    // Deduct balance
    const { data: transactionId, error: deductError } = await getSupabase().rpc('deduct_balance', {
      p_company_id: companyId,
      p_amount: PRICING.WARM_INTRO,
      p_transaction_type: 'warm_intro',
      p_description: `Warm introduction request for chapter`,
      p_chapter_id: chapterId
    });

    if (deductError) {
      console.error('Error deducting balance:', deductError);
      return res.status(500).json({ error: 'Failed to process payment' });
    }

    // Create warm intro request
    const { data: request, error: requestError } = await getSupabase()
      .from('warm_intro_requests')
      .insert({
        company_id: companyId,
        chapter_id: chapterId,
        message,
        preferred_contact_method: preferredContactMethod,
        urgency: urgency || 'normal',
        amount_paid: PRICING.WARM_INTRO,
        transaction_id: transactionId,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating warm intro request:', requestError);
      return res.status(500).json({ error: 'Failed to create request' });
    }

    res.json({
      success: true,
      requestId: request.id,
      amountPaid: PRICING.WARM_INTRO,
      status: 'pending',
      message: 'Warm introduction request submitted. Our team will contact you within 24-48 hours.'
    });
  } catch (error: any) {
    console.error('Warm intro request error:', error);
    res.status(500).json({ error: 'Failed to process request', details: error.message });
  }
});

// Get warm intro requests for a company
router.get('/warm-intro/requests', async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return res.status(400).json({ error: 'Company ID required' });
  }

  try {
    const { data: requests, error } = await getSupabase()
      .from('warm_intro_requests')
      .select(`
        *,
        chapters(chapter_name, universities(name))
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching warm intro requests:', error);
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    res.json({ success: true, requests });
  } catch (error: any) {
    console.error('Fetch warm intro requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Create ambassador referral request ($99.99)
router.post('/ambassador/request', async (req, res) => {
  const { companyId, chapterId, campaignDescription, budgetRange, timeline } = req.body;

  if (!companyId || !chapterId) {
    return res.status(400).json({ error: 'Company ID and Chapter ID required' });
  }

  try {
    // Check balance
    const { data: account, error: accountError } = await getSupabase()
      .from('account_balance')
      .select('balance_dollars')
      .eq('company_id', companyId)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.balance_dollars < PRICING.AMBASSADOR_REFERRAL) {
      return res.status(402).json({
        error: 'Insufficient balance',
        required: PRICING.AMBASSADOR_REFERRAL,
        available: account.balance_dollars
      });
    }

    // Deduct balance
    const { data: transactionId, error: deductError } = await getSupabase().rpc('deduct_balance', {
      p_company_id: companyId,
      p_amount: PRICING.AMBASSADOR_REFERRAL,
      p_transaction_type: 'ambassador_referral',
      p_description: `Ambassador referral request for chapter`,
      p_chapter_id: chapterId
    });

    if (deductError) {
      console.error('Error deducting balance:', deductError);
      return res.status(500).json({ error: 'Failed to process payment' });
    }

    // Create ambassador request
    const { data: request, error: requestError } = await getSupabase()
      .from('ambassador_referral_requests')
      .insert({
        company_id: companyId,
        chapter_id: chapterId,
        campaign_description: campaignDescription,
        budget_range: budgetRange,
        timeline,
        amount_paid: PRICING.AMBASSADOR_REFERRAL,
        transaction_id: transactionId,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating ambassador request:', requestError);
      return res.status(500).json({ error: 'Failed to create request' });
    }

    res.json({
      success: true,
      requestId: request.id,
      amountPaid: PRICING.AMBASSADOR_REFERRAL,
      status: 'pending',
      message: 'Ambassador referral request submitted. Our team will match you with an ambassador within 48-72 hours.'
    });
  } catch (error: any) {
    console.error('Ambassador request error:', error);
    res.status(500).json({ error: 'Failed to process request', details: error.message });
  }
});

// Get ambassador requests for a company
router.get('/ambassador/requests', async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return res.status(400).json({ error: 'Company ID required' });
  }

  try {
    const { data: requests, error } = await getSupabase()
      .from('ambassador_referral_requests')
      .select(`
        *,
        chapters(chapter_name, universities(name))
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ambassador requests:', error);
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    res.json({ success: true, requests });
  } catch (error: any) {
    console.error('Fetch ambassador requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

export default router;