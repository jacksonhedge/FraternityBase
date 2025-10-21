import { Router } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PRICING } from '../config/pricing';
import CreditNotificationService from '../services/CreditNotificationService';
import AdminNotificationService from '../services/AdminNotificationService';
import { slack } from '../utils/slackNotifier';

const router = Router();

// Lazy initialization - these will be created when first accessed
let stripe: Stripe;
let supabase: ReturnType<typeof createClient>;
let supabaseAdmin: ReturnType<typeof createClient>;
let creditNotificationService: CreditNotificationService | null = null;
let adminNotificationService: AdminNotificationService | null = null;

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

function getAdminNotificationService(): AdminNotificationService {
  if (!adminNotificationService) {
    adminNotificationService = new AdminNotificationService(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }
  return adminNotificationService;
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
    const { tier, period, companyId } = req.body;

    if (!['monthly', 'team', 'enterprise'].includes(tier) || !companyId) {
      return res.status(400).json({ error: 'Valid tier and company ID required' });
    }

    if (!['monthly', 'annual'].includes(period)) {
      return res.status(400).json({ error: 'Valid billing period required (monthly or annual)' });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('name, id')
      .eq('id', companyId)
      .single();

    // Normalize tier names (team -> monthly for backend consistency)
    const normalizedTier = tier === 'team' ? 'monthly' : tier;

    // Define subscription prices
    const subscriptionPrices = {
      monthly: {
        monthly: {
          priceId: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly',
          amount: 29.99,
          credits: 100,
          name: 'Team - Monthly'
        },
        annual: {
          priceId: process.env.STRIPE_PRICE_MONTHLY_ANNUAL || 'price_monthly_annual',
          amount: 323.89, // $29.99 * 12 * 0.9 (10% discount)
          credits: 100,
          name: 'Team - Annual'
        }
      },
      enterprise: {
        monthly: {
          priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
          amount: 299.99,
          credits: 1000,
          name: 'Enterprise - Monthly'
        },
        annual: {
          priceId: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_enterprise_annual',
          amount: 3239.89, // $299.99 * 12 * 0.9 (10% discount)
          credits: 1000,
          name: 'Enterprise - Annual'
        }
      }
    };

    const subInfo = subscriptionPrices[normalizedTier as 'monthly' | 'enterprise'][period as 'monthly' | 'annual'];

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: subInfo.priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success&tier=${tier}&period=${period}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?subscription=cancelled`,
      metadata: {
        type: 'subscription',
        company_id: companyId,
        company_name: company?.name || 'Unknown',
        tier: normalizedTier,
        period,
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating subscription checkout:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to grant subscription benefits
async function grantSubscriptionBenefits(
  companyId: string,
  tier: string,
  stripeSubscriptionId: string,
  currentPeriodEnd: Date,
  isInitial: boolean = false
) {
  const supabase = getSupabaseAdmin();

  // Define benefits by tier
  const benefits = {
    monthly: {
      monthly_credit_refresh: 0, // No automatic credits - must purchase separately
      monthly_unlocks_5_star: 1, // 1 Premium unlock (5.0⭐) per month
      monthly_unlocks_4_star: 4, // 4 Quality unlocks (4.0-4.9⭐) per month
      monthly_unlocks_3_star: 7, // 7 Standard unlocks (3.0-3.9⭐) per month
      monthly_warm_intros: 1, // 1 warm intro (new clients only, one-time benefit)
      max_team_seats: 3,
    },
    enterprise: {
      monthly_credit_refresh: 1000, // 1000 credits per month
      monthly_unlocks_5_star: 3, // 3 Premium unlocks (5.0⭐) per month
      monthly_unlocks_4_star: 25, // 25 Quality unlocks (4.0-4.9⭐) per month
      monthly_unlocks_3_star: 60, // 60 Standard unlocks (3.0-3.9⭐) per month
      monthly_warm_intros: 3, // 3 warm intros per month
      max_team_seats: 10,
    }
  };

  const tierBenefits = benefits[tier as 'monthly' | 'enterprise'] || benefits.monthly;

  // Update account_balance with subscription info and benefits
  const updateData: any = {
    subscription_tier: tier,
    subscription_status: 'active',
    stripe_subscription_id: stripeSubscriptionId,
    subscription_current_period_end: currentPeriodEnd.toISOString(),
    last_benefit_reset_at: new Date().toISOString(),
    monthly_credit_refresh: tierBenefits.monthly_credit_refresh,
    monthly_unlocks_5_star: tierBenefits.monthly_unlocks_5_star,
    monthly_unlocks_4_star: tierBenefits.monthly_unlocks_4_star,
    monthly_unlocks_3_star: tierBenefits.monthly_unlocks_3_star,
    monthly_warm_intros: tierBenefits.monthly_warm_intros,
    unlocks_5_star_remaining: tierBenefits.monthly_unlocks_5_star,
    unlocks_4_star_remaining: tierBenefits.monthly_unlocks_4_star,
    unlocks_3_star_remaining: tierBenefits.monthly_unlocks_3_star,
    warm_intros_remaining: tierBenefits.monthly_warm_intros,
    max_team_seats: tierBenefits.max_team_seats,
  };

  // Set subscription_started_at if this is the initial subscription
  if (isInitial) {
    updateData.subscription_started_at = new Date().toISOString();
  }

  await supabase
    .from('account_balance')
    .update(updateData)
    .eq('company_id', companyId);

  // Grant initial credits if applicable
  if (tierBenefits.monthly_credit_refresh > 0) {
    await supabase.rpc('add_credits', {
      p_company_id: companyId,
      p_credits: tierBenefits.monthly_credit_refresh,
      p_dollars: tierBenefits.monthly_credit_refresh * 0.30, // Rough dollar equivalent
      p_transaction_type: isInitial ? 'subscription_initial_grant' : 'subscription_renewal',
      p_description: isInitial
        ? `Initial ${tier} subscription credits`
        : `Monthly ${tier} subscription credits`,
      p_stripe_payment_intent_id: stripeSubscriptionId
    });
  }

  console.log(`✅ Granted ${tier} benefits to company ${companyId}:`, tierBenefits);
}

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

// Consolidated Stripe webhook handler
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

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;
        const companyId = metadata?.companyId || metadata?.company_id;

        if (!companyId || companyId === 'demo') {
          console.error('⚠️ Invalid company ID in webhook metadata');
          break;
        }

        // Handle different transaction types
        if (metadata?.type === 'credit_purchase') {
          // One-time credit purchase
          const credits = parseInt(metadata.credits);
          const dollarAmount = (session.amount_total || 0) / 100;

          await supabase.rpc('add_credits', {
            p_company_id: companyId,
            p_credits: credits,
            p_dollars: dollarAmount,
            p_transaction_type: 'credit_purchase',
            p_description: `Purchased ${credits} credits`,
            p_stripe_payment_intent_id: typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || null
          });

          console.log(`✅ Added ${credits} credits to company ${companyId}`);

          // Get updated balance and company/user info for Slack notification
          const { data: updatedAccount } = await supabase
            .from('account_balance')
            .select('balance_credits')
            .eq('company_id', companyId)
            .single();

          const { data: company } = await supabase
            .from('companies')
            .select('company_name')
            .eq('id', companyId)
            .single();

          const { data: teamMember } = await supabase
            .from('team_members')
            .select('user_id, user_profiles(first_name, last_name)')
            .eq('company_id', companyId)
            .limit(1)
            .single();

          const userName = teamMember?.user_profiles
            ? `${teamMember.user_profiles.first_name} ${teamMember.user_profiles.last_name}`
            : 'Unknown User';

          // Find the credit package to get the label
          const creditPackage = PRICING.CREDIT_PACKAGES.find(pkg => pkg.credits === credits);

          // Send Slack notification
          await slack.notifyCreditPurchase({
            userName,
            company: company?.company_name || metadata.company_name || 'Unknown Company',
            packageName: creditPackage?.label || `${credits} Credits`,
            credits,
            amount: dollarAmount,
            newBalance: updatedAccount?.balance_credits || 0
          });

        } else if (metadata?.type === 'subscription') {
          // New subscription created
          const tier = metadata.tier;

          // Get subscription details to find period end
          if (session.subscription) {
            const subscription = await getStripe().subscriptions.retrieve(
              typeof session.subscription === 'string' ? session.subscription : session.subscription.id
            );

            const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

            // Update customer ID in account_balance for future webhook matching
            await supabase
              .from('account_balance')
              .update({
                stripe_customer_id: typeof session.customer === 'string'
                  ? session.customer
                  : session.customer?.id || null
              })
              .eq('company_id', companyId);

            // Grant subscription benefits
            await grantSubscriptionBenefits(companyId, tier, subscription.id, currentPeriodEnd, true);

            console.log(`✅ Activated ${tier} subscription for company ${companyId}`);

            // Get company info for notification
            const { data: company } = await supabase
              .from('companies')
              .select('name')
              .eq('id', companyId)
              .single();

            // Create admin notification for new subscription
            const adminService = getAdminNotificationService();
            adminService.createNotification({
              type: 'subscription',
              title: '⭐ New Subscription',
              message: `${company?.name || 'A company'} subscribed to the ${tier} plan`,
              data: {
                companyId,
                companyName: company?.name,
                tier,
                subscriptionId: subscription.id,
                currentPeriodEnd: currentPeriodEnd.toISOString()
              },
              relatedCompanyId: companyId
            }).catch(err => console.error('Failed to create admin notification:', err));
          }

        } else {
          // Regular top-up payment
          const amountDollars = (session.amount_total || 0) / 100;
          const transactionType = metadata?.transaction_type || 'top_up';

          // Get balance before
          const { data: balanceBefore } = await supabase
            .from('account_balance')
            .select('balance_dollars')
            .eq('company_id', companyId)
            .single();

          const balanceBeforeAmount = balanceBefore?.balance_dollars || 0;

          // Call the add_balance SQL function
          const { data, error } = await supabase.rpc('add_balance', {
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
            const { data: company } = await supabase
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

            // Create admin notification for payment
            const adminService = getAdminNotificationService();
            adminService.createNotification({
              type: 'payment',
              title: '💳 Payment Received',
              message: `${company?.name || 'A company'} added $${amountDollars.toFixed(2)} to their account`,
              data: {
                companyId,
                companyName: company?.name,
                amount: amountDollars,
                balanceBefore: balanceBeforeAmount,
                balanceAfter: balanceAfterAmount,
                transactionType,
                stripePaymentIntentId: typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : session.payment_intent?.id || undefined
              },
              relatedCompanyId: companyId
            }).catch(err => console.error('Failed to create admin notification:', err));

            // If payment method was saved, update the account_balance record
            if (session.setup_intent || session.payment_intent) {
              const paymentIntent = await getStripe().paymentIntents.retrieve(
                typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : session.payment_intent?.id || ''
              );

              if (paymentIntent.customer && paymentIntent.payment_method) {
                await supabase
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
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find company by stripe_customer_id
        const { data: account, error: accountError } = await supabase
          .from('account_balance')
          .select('company_id, subscription_tier')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (accountError || !account) {
          console.error('⚠️ Could not find company for customer:', subscription.customer);
          break;
        }

        const tier = account.subscription_tier || 'monthly';
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Update subscription status
        await supabase
          .from('account_balance')
          .update({
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
            subscription_current_period_end: currentPeriodEnd.toISOString()
          })
          .eq('company_id', account.company_id);

        console.log(`✅ Updated subscription ${subscription.id} status to ${subscription.status}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        // Only process for subscription renewals (not initial payment)
        if (invoice.billing_reason === 'subscription_cycle') {
          // Find company by stripe_customer_id
          const { data: account, error: accountError } = await supabase
            .from('account_balance')
            .select('company_id, subscription_tier, stripe_subscription_id, subscription_current_period_end')
            .eq('stripe_customer_id', invoice.customer)
            .single();

          if (accountError || !account) {
            console.error('⚠️ Could not find company for customer:', invoice.customer);
            break;
          }

          // Get subscription to find new period end
          if (account.stripe_subscription_id) {
            const subscription = await getStripe().subscriptions.retrieve(account.stripe_subscription_id);
            const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

            // Grant monthly benefits (credits, reset chapter unlocks, reset warm intros)
            await grantSubscriptionBenefits(
              account.company_id,
              account.subscription_tier,
              account.stripe_subscription_id,
              currentPeriodEnd,
              false // Not initial
            );

            console.log(`✅ Granted monthly benefits for company ${account.company_id}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find company by stripe_customer_id
        const { data: account, error: accountError } = await supabase
          .from('account_balance')
          .select('company_id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (accountError || !account) {
          console.error('⚠️ Could not find company for customer:', subscription.customer);
          break;
        }

        // Downgrade to trial - remove all benefits
        await supabase
          .from('account_balance')
          .update({
            subscription_tier: 'trial',
            subscription_status: 'canceled',
            monthly_credit_refresh: 0,
            monthly_unlocks_5_star: 0,
            monthly_unlocks_4_star: 0,
            monthly_unlocks_3_star: 0,
            monthly_warm_intros: 0,
            unlocks_5_star_remaining: 0,
            unlocks_4_star_remaining: 0,
            unlocks_3_star_remaining: 0,
            warm_intros_remaining: 0,
            max_team_seats: 1,
          })
          .eq('company_id', account.company_id);

        console.log(`⚠️ Subscription cancelled for company ${account.company_id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        // Find company and update status
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

          console.log(`⚠️ Payment failed for company ${account.company_id} - marked past_due`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
});

// Get subscription status and benefit information
router.get('/subscription/status', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const supabase = getSupabaseAdmin();

    // Get subscription info from account_balance
    const { data: account, error } = await supabase
      .from('account_balance')
      .select(`
        subscription_tier,
        subscription_status,
        stripe_subscription_id,
        subscription_current_period_end,
        last_benefit_reset_at,
        monthly_credit_refresh,
        monthly_unlocks_5_star,
        monthly_unlocks_4_star,
        monthly_unlocks_3_star,
        monthly_warm_intros,
        unlocks_5_star_remaining,
        unlocks_4_star_remaining,
        unlocks_3_star_remaining,
        warm_intros_remaining,
        max_team_seats
      `)
      .eq('company_id', companyId)
      .single();

    if (error || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Calculate days until renewal
    let daysUntilRenewal = null;
    if (account.subscription_current_period_end) {
      const periodEnd = new Date(account.subscription_current_period_end);
      const now = new Date();
      daysUntilRenewal = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    res.json({
      success: true,
      subscription: {
        tier: account.subscription_tier,
        status: account.subscription_status,
        stripeSubscriptionId: account.stripe_subscription_id,
        currentPeriodEnd: account.subscription_current_period_end,
        daysUntilRenewal,
        lastBenefitResetAt: account.last_benefit_reset_at,
      },
      benefits: {
        monthlyCredits: account.monthly_credit_refresh,
        monthlyUnlocks5Star: account.monthly_unlocks_5_star,
        monthlyUnlocks4Star: account.monthly_unlocks_4_star,
        monthlyUnlocks3Star: account.monthly_unlocks_3_star,
        monthlyWarmIntros: account.monthly_warm_intros,
        maxTeamSeats: account.max_team_seats,
      },
      remaining: {
        unlocks5Star: account.unlocks_5_star_remaining,
        unlocks4Star: account.unlocks_4_star_remaining,
        unlocks3Star: account.unlocks_3_star_remaining,
        warmIntros: account.warm_intros_remaining,
      }
    });
  } catch (error: any) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// Manually trigger benefit reset (admin only)
router.post('/subscription/reset-benefits', async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const supabase = getSupabaseAdmin();

    // Get current subscription info
    const { data: account, error: accountError } = await supabase
      .from('account_balance')
      .select(`
        subscription_tier,
        stripe_subscription_id,
        subscription_current_period_end
      `)
      .eq('company_id', companyId)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (!account.subscription_tier || account.subscription_tier === 'trial') {
      return res.status(400).json({ error: 'No active subscription' });
    }

    // Trigger benefit grant
    const currentPeriodEnd = account.subscription_current_period_end
      ? new Date(account.subscription_current_period_end)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    await grantSubscriptionBenefits(
      companyId,
      account.subscription_tier,
      account.stripe_subscription_id || 'manual_reset',
      currentPeriodEnd,
      false
    );

    res.json({
      success: true,
      message: 'Benefits reset successfully'
    });
  } catch (error: any) {
    console.error('Benefit reset error:', error);
    res.status(500).json({ error: 'Failed to reset benefits', details: error.message });
  }
});

// Change/upgrade subscription with proration
router.post('/subscription/change', async (req, res) => {
  try {
    const { companyId, newTier, newPeriod } = req.body;

    if (!companyId || !newTier || !newPeriod) {
      return res.status(400).json({ error: 'Company ID, tier, and period required' });
    }

    if (!['monthly', 'team', 'enterprise'].includes(newTier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be team or enterprise' });
    }

    if (!['monthly', 'annual'].includes(newPeriod)) {
      return res.status(400).json({ error: 'Invalid period. Must be monthly or annual' });
    }

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    // Get current subscription info
    const { data: account, error: accountError } = await supabase
      .from('account_balance')
      .select('stripe_subscription_id, subscription_tier, stripe_customer_id')
      .eq('company_id', companyId)
      .single();

    if (accountError || !account || !account.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Normalize tier names (team -> monthly for backend consistency)
    const normalizedNewTier = newTier === 'team' ? 'monthly' : newTier;
    const currentTier = account.subscription_tier || 'monthly';

    // Define subscription prices
    const subscriptionPrices = {
      monthly: {
        monthly: {
          priceId: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly',
          amount: 29.99,
          credits: 100,
          name: 'Team - Monthly'
        },
        annual: {
          priceId: process.env.STRIPE_PRICE_MONTHLY_ANNUAL || 'price_monthly_annual',
          amount: 323.89,
          credits: 100,
          name: 'Team - Annual'
        }
      },
      enterprise: {
        monthly: {
          priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
          amount: 299.99,
          credits: 1000,
          name: 'Enterprise - Monthly'
        },
        annual: {
          priceId: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_enterprise_annual',
          amount: 3239.89,
          credits: 1000,
          name: 'Enterprise - Annual'
        }
      }
    };

    const newPriceInfo = subscriptionPrices[normalizedNewTier as 'monthly' | 'enterprise'][newPeriod as 'monthly' | 'annual'];

    // Get the current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(account.stripe_subscription_id);

    // Update the subscription with proration
    const updatedSubscription = await stripe.subscriptions.update(
      account.stripe_subscription_id,
      {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceInfo.priceId,
        }],
        proration_behavior: 'always_invoice', // Create invoice immediately for prorated amount
        metadata: {
          type: 'subscription',
          company_id: companyId,
          tier: normalizedNewTier,
          period: newPeriod,
          changed_from: currentTier,
        }
      }
    );

    // Update local database with new tier
    await supabase
      .from('account_balance')
      .update({
        subscription_tier: normalizedNewTier,
        subscription_current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString()
      })
      .eq('company_id', companyId);

    // Grant new tier benefits immediately
    const currentPeriodEnd = new Date(updatedSubscription.current_period_end * 1000);
    await grantSubscriptionBenefits(
      companyId,
      normalizedNewTier,
      updatedSubscription.id,
      currentPeriodEnd,
      false
    );

    // Get company info for notification
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();

    // Log subscription change in balance_transactions for history tracking
    const proratedAmount = updatedSubscription.latest_invoice ?
      (typeof updatedSubscription.latest_invoice === 'string' ? 0 : (updatedSubscription.latest_invoice.amount_due || 0) / 100) :
      0;

    await supabase
      .from('balance_transactions')
      .insert({
        company_id: companyId,
        amount_dollars: proratedAmount,
        transaction_type: 'subscription_change',
        description: `Subscription changed from ${currentTier} to ${normalizedNewTier} (${newPeriod})`,
        stripe_payment_intent_id: updatedSubscription.id,
        created_at: new Date().toISOString()
      });

    // Create admin notification for subscription change
    const adminService = getAdminNotificationService();
    adminService.createNotification({
      type: 'subscription',
      title: currentTier === 'monthly' && normalizedNewTier === 'enterprise' ? '⬆️ Subscription Upgraded' : '🔄 Subscription Changed',
      message: `${company?.name || 'A company'} changed from ${currentTier} to ${normalizedNewTier} (${newPeriod})`,
      data: {
        companyId,
        companyName: company?.name,
        oldTier: currentTier,
        newTier: normalizedNewTier,
        period: newPeriod,
        subscriptionId: updatedSubscription.id,
        currentPeriodEnd: currentPeriodEnd.toISOString()
      },
      relatedCompanyId: companyId
    }).catch(err => console.error('Failed to create admin notification:', err));

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      newTier: normalizedNewTier,
      newPeriod,
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      proratedAmount: updatedSubscription.latest_invoice ?
        (typeof updatedSubscription.latest_invoice === 'string' ? null : updatedSubscription.latest_invoice.amount_due / 100) :
        null
    });
  } catch (error: any) {
    console.error('Subscription change error:', error);
    res.status(500).json({ error: 'Failed to change subscription', details: error.message });
  }
});

// Cancel subscription
router.post('/subscription/cancel', async (req, res) => {
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

    res.json({
      success: true,
      message: 'Subscription cancelled. Benefits will remain active until the end of the current billing period.'
    });
  } catch (error: any) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription', details: error.message });
  }
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

    // Get company and chapter info for notification
    const { data: company } = await getSupabase()
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();

    const { data: chapter } = await getSupabase()
      .from('chapters')
      .select('chapter_name, universities(name)')
      .eq('id', chapterId)
      .single();

    // Create admin notification
    const adminNotificationService = getAdminNotificationService();
    adminNotificationService.createNotification({
      type: 'intro_request',
      title: '🤝 New Introduction Request',
      message: `${company?.name || 'A company'} requested a warm introduction to ${chapter?.chapter_name || 'a chapter'} at ${chapter?.universities?.name || 'a university'}`,
      data: {
        companyId,
        companyName: company?.name,
        chapterId,
        chapterName: chapter?.chapter_name,
        universityName: chapter?.universities?.name,
        message,
        preferredContactMethod,
        urgency: urgency || 'normal',
        amountPaid: PRICING.WARM_INTRO,
        requestId: request.id
      },
      relatedCompanyId: companyId
    }).catch(err => console.error('Failed to create admin notification:', err));

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

// GET /warm-intro/admin/all - Get ALL introduction requests (admin only)
router.get('/warm-intro/admin/all', async (req, res) => {
  try {
    // Admin authentication check
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Unauthorized - admin access required' });
    }

    const { data: requests, error } = await getSupabaseAdmin()
      .from('warm_intro_requests')
      .select(`
        *,
        chapters(
          chapter_name,
          universities(name),
          greek_organizations(name)
        ),
        companies!company_id(
          id,
          company_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add user/contact info for each request
    const enrichedRequests = await Promise.all(
      (requests || []).map(async (request) => {
        // Get the user who made the request from team_members
        const { data: teamMember } = await getSupabaseAdmin()
          .from('team_members')
          .select('user_id, users:user_id(email), user_profiles!user_id(first_name, last_name)')
          .eq('company_id', request.company_id)
          .limit(1)
          .single();

        return {
          ...request,
          requestedBy: teamMember ? {
            firstName: teamMember.user_profiles?.first_name,
            lastName: teamMember.user_profiles?.last_name,
            email: teamMember.users?.email
          } : null
        };
      })
    );

    res.json({ success: true, requests: enrichedRequests });
  } catch (error: any) {
    console.error('Error fetching all intro requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests', details: error.message });
  }
});

// PATCH /warm-intro/admin/:id/status - Update request status (admin only)
router.patch('/warm-intro/admin/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  // Admin authentication check
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized - admin access required' });
  }

  if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updateData: any = { status };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { data, error } = await getSupabaseAdmin()
      .from('warm_intro_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, request: data });
  } catch (error: any) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Failed to update status', details: error.message });
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

// Get payment method details
router.get('/payment-method', async (req, res) => {
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

    // Get payment method info from account_balance
    const { data: account, error: accountError } = await getSupabaseAdmin()
      .from('account_balance')
      .select('stripe_customer_id, stripe_payment_method_id')
      .eq('company_id', profile.company_id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // If no payment method saved
    if (!account.stripe_payment_method_id) {
      return res.json({ hasPaymentMethod: false });
    }

    // Get payment method details from Stripe
    const stripe = getStripe();
    const paymentMethod = await stripe.paymentMethods.retrieve(account.stripe_payment_method_id);

    res.json({
      hasPaymentMethod: true,
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
        } : null,
      }
    });
  } catch (error: any) {
    console.error('Payment method fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch payment method' });
  }
});

// Create Stripe Setup Intent to add/update payment method
router.post('/payment-method/setup', async (req, res) => {
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
      .select('company_id, email')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // Get or create Stripe customer
    const { data: account } = await supabase
      .from('account_balance')
      .select('stripe_customer_id')
      .eq('company_id', profile.company_id)
      .single();

    let customerId = account?.stripe_customer_id;

    if (!customerId) {
      // Create a new Stripe customer
      const { data: company } = await supabase
        .from('companies')
        .select('company_name')
        .eq('id', profile.company_id)
        .single();

      const customer = await stripe.customers.create({
        email: profile.email || user.email,
        metadata: {
          company_id: profile.company_id,
          company_name: company?.company_name || 'Unknown'
        }
      });

      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('account_balance')
        .update({ stripe_customer_id: customerId })
        .eq('company_id', profile.company_id);
    }

    // Create Setup Intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    res.json({
      clientSecret: setupIntent.client_secret,
      customerId: customerId
    });
  } catch (error: any) {
    console.error('Setup Intent creation error:', error);
    res.status(500).json({ error: 'Failed to create setup intent', details: error.message });
  }
});

// Save payment method after Setup Intent confirmation
router.post('/payment-method/save', async (req, res) => {
  try {
    const { paymentMethodId, companyId } = req.body;

    if (!paymentMethodId || !companyId) {
      return res.status(400).json({ error: 'Payment method ID and company ID required' });
    }

    const supabase = getSupabaseAdmin();

    // Save payment method ID to account_balance
    await supabase
      .from('account_balance')
      .update({ stripe_payment_method_id: paymentMethodId })
      .eq('company_id', companyId);

    res.json({ success: true, message: 'Payment method saved successfully' });
  } catch (error: any) {
    console.error('Payment method save error:', error);
    res.status(500).json({ error: 'Failed to save payment method', details: error.message });
  }
});

// Remove payment method
router.delete('/payment-method', async (req, res) => {
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

    // Get user's company_id
    const { data: profile, error: profileError } = await getSupabase()
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const supabase = getSupabaseAdmin();

    // Remove payment method
    await supabase
      .from('account_balance')
      .update({ stripe_payment_method_id: null })
      .eq('company_id', profile.company_id);

    res.json({ success: true, message: 'Payment method removed successfully' });
  } catch (error: any) {
    console.error('Payment method removal error:', error);
    res.status(500).json({ error: 'Failed to remove payment method' });
  }
});

// Submit Enterprise Tier 2 contact request
router.post('/enterprise/contact-request', async (req, res) => {
  try {
    const { message, userEmail, userName, companyName } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const supabase = getSupabaseAdmin();

    // Create contact request
    const { data, error } = await supabase
      .from('enterprise_contact_requests')
      .insert({
        message,
        user_email: userEmail,
        user_name: userName,
        company_name: companyName,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating contact request:', error);
      return res.status(500).json({ error: 'Failed to submit contact request' });
    }

    // Send Slack notification
    await slack.notify({
      text: `🚀 New Enterprise Tier 2 Inquiry`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚀 Enterprise Tier 2 Contact Request',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*From:*\n${userName || 'Unknown'}`
            },
            {
              type: 'mrkdwn',
              text: `*Company:*\n${companyName || 'Not provided'}`
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n${userEmail || 'Not provided'}`
            },
            {
              type: 'mrkdwn',
              text: `*Request ID:*\n${data.id}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Message:*\n${message}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Submitted at ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    });

    // Create admin notification
    const adminService = getAdminNotificationService();
    adminService.createNotification({
      type: 'contact_request',
      title: '🚀 Enterprise Tier 2 Inquiry',
      message: `${userName || 'Someone'} from ${companyName || 'a company'} requested information about Enterprise Tier 2`,
      data: {
        userEmail,
        userName,
        companyName,
        message,
        requestId: data.id
      }
    }).catch(err => console.error('Failed to create admin notification:', err));

    res.json({
      success: true,
      message: 'Contact request submitted successfully. Our team will reach out within 24 hours.',
      requestId: data.id
    });
  } catch (error: any) {
    console.error('Enterprise contact request error:', error);
    res.status(500).json({ error: 'Failed to submit contact request', details: error.message });
  }
});

// Get all Enterprise Tier 2 contact requests (admin only)
router.get('/enterprise/contact-requests', async (req, res) => {
  try {
    // Admin authentication check
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Unauthorized - admin access required' });
    }

    const supabase = getSupabaseAdmin();

    const { data: requests, error } = await supabase
      .from('enterprise_contact_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact requests:', error);
      return res.status(500).json({ error: 'Failed to fetch contact requests' });
    }

    res.json({ success: true, requests });
  } catch (error: any) {
    console.error('Fetch contact requests error:', error);
    res.status(500).json({ error: 'Failed to fetch contact requests', details: error.message });
  }
});

// Update Enterprise Tier 2 contact request status (admin only)
router.patch('/enterprise/contact-requests/:id/status', async (req, res) => {
  try {
    // Admin authentication check
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Unauthorized - admin access required' });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['pending', 'contacted', 'converted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const supabase = getSupabaseAdmin();

    const updateData: any = { status };
    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }
    if (status === 'contacted') {
      updateData.contacted_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('enterprise_contact_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact request:', error);
      return res.status(500).json({ error: 'Failed to update contact request' });
    }

    res.json({ success: true, request: data });
  } catch (error: any) {
    console.error('Update contact request error:', error);
    res.status(500).json({ error: 'Failed to update contact request', details: error.message });
  }
});

export default router;