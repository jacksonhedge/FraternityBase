import { Router } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PRICING } from '../config/pricing';
import CreditNotificationService from '../services/CreditNotificationService';

const router = Router();

// Lazy initialization - these will be created when first accessed
let stripe: Stripe;
let supabase: ReturnType<typeof createClient>;
let supabaseAdmin: ReturnType<typeof createClient>;
let creditNotificationService: CreditNotificationService | null = null;

function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

function getSupabase(): any {
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

function getCreditNotificationService(): CreditNotificationService | null {
  if (!creditNotificationService && process.env.RESEND_API_KEY) {
    try {
      creditNotificationService = new CreditNotificationService(
        process.env.RESEND_API_KEY,
        process.env.SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        process.env.CREDITS_FROM_EMAIL || 'credits@fraternitybase.com',
        process.env.ADMIN_EMAIL || 'admin@fraternitybase.com'
      );
    } catch (error) {
      console.error('Failed to initialize Credit Notification Service:', error);
      return null;
    }
  }
  return creditNotificationService;
}

// Note: GET /balance is now handled directly in server.ts before this router is mounted

// Create Stripe checkout for credit purchase
router.post('/purchase', async (req, res) => {
  try {
    const { credits, companyId } = req.body;

    if (!credits || !companyId) {
      return res.status(400).json({ error: 'Credits amount and company ID required' });
    }

    // Find the matching credit package
    const creditPackage = PRICING.CREDIT_PACKAGES.find(pkg => pkg.credits === credits);
    if (!creditPackage) {
      return res.status(400).json({ error: 'Invalid credit package' });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('name, id')
      .eq('id', companyId)
      .single();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(creditPackage.price * 100),
          product_data: {
            name: `${creditPackage.credits} Credits - ${creditPackage.label}`,
            description: `Add ${creditPackage.credits} credits to your FraternityBase account`,
          },
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success&credits=${credits}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?payment=cancelled`,
      metadata: {
        type: 'credit_purchase',
        company_id: companyId,
        company_name: company?.name || 'Unknown',
        credits: credits.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Stripe subscription checkout
router.post('/subscribe', async (req, res) => {
  try {
    const { tier, companyId } = req.body;

    if (!['monthly', 'enterprise'].includes(tier) || !companyId) {
      return res.status(400).json({ error: 'Valid tier and company ID required' });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('name, id')
      .eq('id', companyId)
      .single();

    // Define subscription prices
    const subscriptionPrices = {
      monthly: {
        priceId: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly',
        amount: 29.99,
        credits: 100,
        name: 'Monthly Subscription'
      },
      enterprise: {
        priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
        amount: 299.99,
        credits: 800,
        name: 'Enterprise Subscription'
      }
    };

    const subInfo = subscriptionPrices[tier as 'monthly' | 'enterprise'];

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: subInfo.priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success&tier=${tier}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?subscription=cancelled`,
      metadata: {
        type: 'subscription',
        company_id: companyId,
        company_name: company?.name || 'Unknown',
        tier,
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating subscription checkout:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook handler
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).send('Webhook signature missing');
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    const supabase = getSupabaseAdmin();

    console.log('🔔 Stripe webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const metadata = session.metadata;

        if (metadata.type === 'credit_purchase') {
          // Add credits to account
          const credits = parseInt(metadata.credits);
          const dollarAmount = session.amount_total / 100;

          await supabase.rpc('add_credits', {
            p_company_id: metadata.company_id,
            p_credits: credits,
            p_dollars: dollarAmount,
            p_transaction_type: 'credit_purchase',
            p_description: `Purchased ${credits} credits`,
            p_stripe_payment_intent_id: session.payment_intent
          });

          console.log(`✅ Added ${credits} credits to ${metadata.company_name}`);
        } else if (metadata.type === 'subscription') {
          // Update subscription tier
          await supabase
            .from('account_balance')
            .update({ subscription_tier: metadata.tier })
            .eq('company_id', metadata.company_id);

          // Grant initial monthly credits
          await supabase.rpc('grant_monthly_credits', {
            p_company_id: metadata.company_id
          });

          console.log(`✅ Activated ${metadata.tier} subscription for ${metadata.company_name}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        // Downgrade to trial when subscription cancelled
        // Note: You'll need to store customer_id in metadata to match this
        console.log('⚠️ Subscription cancelled:', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        // Handle successful recurring payment
        console.log('✅ Recurring payment succeeded:', invoice.id);
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

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

  if (threshold !== undefined && threshold < 5.00) {
    return res.status(400).json({
      error: `Threshold must be at least $5.00`
    });
  }

  if (amount !== undefined && amount < 25.00) {
    return res.status(400).json({
      error: `Auto-reload amount must be at least $25.00`
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
      const balanceBeforeAmount = account.balance_dollars;

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

      const balanceAfterAmount = balanceBeforeAmount + account.auto_reload_amount;

      // Update last auto-reload timestamp
      await getSupabase()
        .from('account_balance')
        .update({ last_auto_reload_at: new Date().toISOString() })
        .eq('company_id', companyId);

      // Get company name
      const { data: company } = await getSupabase()
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();

      // Send notification emails
      const notificationService = getCreditNotificationService();
      if (notificationService && company) {
        notificationService.notifyCreditAdded({
          companyId,
          companyName: company.name,
          amount: account.auto_reload_amount,
          balanceBefore: balanceBeforeAmount,
          balanceAfter: balanceAfterAmount,
          transactionType: 'auto_reload',
          stripePaymentIntentId: paymentIntent.id,
          description: `Auto-reload triggered due to low balance`,
          metadata: {
            threshold: account.auto_reload_threshold,
            auto_reload_amount: account.auto_reload_amount
          }
        }).catch(err => console.error('Failed to send credit notification:', err));
      }

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
  if (!amount || typeof amount !== 'number' || amount < 10.00) {
    return res.status(400).json({
      error: `Invalid amount. Minimum top-up is $10.00`
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
        // Get balance before
        const { data: balanceBefore } = await getSupabaseAdmin()
          .from('account_balance')
          .select('balance_dollars')
          .eq('company_id', companyId)
          .single();

        const balanceBeforeAmount = balanceBefore?.balance_dollars || 0;

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

          const balanceAfterAmount = balanceBeforeAmount + amountDollars;

          // Get company name
          const { data: company } = await getSupabase()
            .from('companies')
            .select('name')
            .eq('id', companyId)
            .single();

          // Send notification emails
          const notificationService = getCreditNotificationService();
          if (notificationService && company) {
            notificationService.notifyCreditAdded({
              companyId,
              companyName: company.name,
              amount: amountDollars,
              balanceBefore: balanceBeforeAmount,
              balanceAfter: balanceAfterAmount,
              transactionType: 'stripe_purchase',
              stripePaymentIntentId: typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id || undefined,
              description: `Stripe payment processed`
            }).catch(err => console.error('Failed to send credit notification:', err));
          }

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
      .select('balance_credits')
      .eq('company_id', companyId)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.balance_credits < PRICING.WARM_INTRO) {
      return res.status(402).json({
        error: 'Insufficient credits',
        required: PRICING.WARM_INTRO,
        available: account.balance_credits
      });
    }

    // Deduct credits
    const { data: transactionId, error: deductError } = await getSupabase().rpc('deduct_credits', {
      p_company_id: companyId,
      p_credits: PRICING.WARM_INTRO,
      p_dollars: PRICING.DOLLAR_VALUES.WARM_INTRO,
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
      .select('balance_credits')
      .eq('company_id', companyId)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const accountBalance = account as { balance_credits: number };

    if (accountBalance.balance_credits < PRICING.AMBASSADOR_REFERRAL) {
      return res.status(402).json({
        error: 'Insufficient credits',
        required: PRICING.AMBASSADOR_REFERRAL,
        available: accountBalance.balance_credits
      });
    }

    // Deduct credits
    const { data: transactionId, error: deductError } = await (getSupabase().rpc as any)('deduct_credits', {
      p_company_id: companyId,
      p_credits: PRICING.AMBASSADOR_REFERRAL,
      p_dollars: PRICING.DOLLAR_VALUES.AMBASSADOR_REFERRAL,
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
      } as any)
      .select()
      .single();

    if (requestError) {
      console.error('Error creating ambassador request:', requestError);
      return res.status(500).json({ error: 'Failed to create request' });
    }

    const requestData = request as any;

    res.json({
      success: true,
      requestId: requestData.id,
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