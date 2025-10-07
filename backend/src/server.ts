import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import creditsRouter from './routes/credits';
import activityTrackingRouter from './routes/activityTracking';
import CreditNotificationService from './services/CreditNotificationService';

dotenv.config();

// Initialize Supabase (public client)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Initialize Supabase admin client (for file uploads and admin operations)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Stripe
let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Initialize Credit Notification Service
let creditNotificationService: CreditNotificationService | null = null;
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
      console.log('✅ Credit Notification Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Credit Notification Service:', error);
      return null;
    }
  }
  return creditNotificationService;
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://fraternitybase.com',
    'https://www.fraternitybase.com',
    'https://frontend-gxqgrycnw-jackson-fitzgeralds-projects.vercel.app'
  ],
  credentials: true
}));

// Stripe webhook needs raw body for signature verification
app.use('/api/credits/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());

// Credits balance endpoint - must come BEFORE router mount to override deprecated endpoint
app.get('/api/credits/balance', async (req, res) => {
  console.log('💰 === BALANCE ENDPOINT CALLED ===');
  try {
    // Get the authorization token from headers
    const authHeader = req.headers.authorization;
    console.log('📝 Auth header:', authHeader ? 'Bearer token present' : 'NO AUTH HEADER');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization token');
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔑 Token extracted:', token.substring(0, 20) + '...');

    // Verify the token with Supabase and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('👤 User verification:', user ? `User ID: ${user.id}` : 'NO USER');
    console.log('⚠️ Auth error:', authError ? authError.message : 'No error');

    if (authError || !user) {
      console.log('❌ Invalid token or user not found');
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Get user's company_id from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    console.log('🏢 Profile lookup:', profile ? `Company ID: ${profile.company_id}` : 'NO PROFILE');
    console.log('⚠️ Profile error:', profileError ? profileError.message : 'No error');

    if (profileError || !profile?.company_id) {
      console.log('❌ User profile not found');
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Query the new account_balance table using service_role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: balanceRows, error } = await supabaseAdmin
      .from('account_balance')
      .select('balance_credits, balance_dollars, lifetime_spent_credits, lifetime_spent_dollars, lifetime_earned_credits, lifetime_added_dollars, subscription_tier, last_monthly_credit_grant_at, auto_reload_enabled, auto_reload_threshold, auto_reload_amount')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .limit(1);

    const data = balanceRows?.[0] || null;

    console.log('💵 Balance rows returned:', balanceRows?.length || 0);
    console.log('💵 Balance data:', data ? `${data.balance_credits} credits ($${data.balance_dollars})` : 'NO DATA');
    console.log('⚠️ Balance error:', error ? error.message : 'No error');

    // If no balance record exists, create one with 0 credits (shouldn't happen in production after signup fix)
    if (!data) {
      console.log('⚠️ No balance record found - creating one with 0 credits');
      const { error: insertError } = await supabaseAdmin
        .from('account_balance')
        .insert({
          company_id: profile.company_id,
          balance_credits: 0,
          balance_dollars: 0.00,
          lifetime_spent_credits: 0,
          lifetime_spent_dollars: 0.00,
          lifetime_earned_credits: 0,
          lifetime_added_dollars: 0.00,
          subscription_tier: 'trial',
        });

      if (insertError) {
        console.error('❌ Failed to create balance record:', insertError);
      } else {
        console.log('✅ Created balance record with 0 credits');
      }
    }

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error fetching account balance:', error);
      return res.status(500).json({ error: 'Failed to fetch balance' });
    }

    const response = {
      balance: data?.balance_credits || 0,
      balanceCredits: data?.balance_credits || 0,
      balanceDollars: data?.balance_dollars || 0,
      lifetimeSpentCredits: data?.lifetime_spent_credits || 0,
      lifetimeSpentDollars: data?.lifetime_spent_dollars || 0,
      lifetimeEarnedCredits: data?.lifetime_earned_credits || 0,
      lifetimeAddedDollars: data?.lifetime_added_dollars || 0,
      subscriptionTier: data?.subscription_tier || 'trial',
      lastMonthlyGrant: data?.last_monthly_credit_grant_at || null,
      autoReload: {
        enabled: data?.auto_reload_enabled || false,
        threshold: data?.auto_reload_threshold || 10.00,
        amount: data?.auto_reload_amount || 50.00
      }
    };

    console.log('✅ Sending response:', response);
    console.log('=== END BALANCE ENDPOINT ===');
    res.json(response);
  } catch (error: any) {
    console.error('❌ Balance endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User profile endpoint
app.get('/api/user/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Get user's company_id from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id, role, created_at')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      user_id: user.id,
      email: user.email,
      company_id: profile.company_id,
      role: profile.role,
      created_at: profile.created_at
    });
  } catch (error: any) {
    console.error('User profile endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mount credits router
app.use('/api/credits', creditsRouter);
app.use('/api/activity', activityTrackingRouter);

// Admin authentication middleware (temporarily disabled for debugging)
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminToken = req.headers['x-admin-token'];
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '***REMOVED***';

  console.log('🔐 Admin auth check:', {
    receivedToken: adminToken ? `${String(adminToken).substring(0, 10)}...` : 'none',
    expectedToken: ADMIN_TOKEN ? `${ADMIN_TOKEN.substring(0, 10)}...` : 'none',
    match: adminToken === ADMIN_TOKEN
  });

  // Temporarily allow all requests for debugging
  next();

  // if (adminToken === ADMIN_TOKEN) {
  //   next();
  // } else {
  //   res.status(403).json({ error: 'Forbidden: Admin access required' });
  // }
};

// Credit packages
const CREDIT_PACKAGES: Record<string, any> = {
  trial: { credits: 10, price: 0.99, priceId: process.env.VITE_STRIPE_PRICE_TRIAL || 'price_trial' },
  starter: { credits: 100, price: 59, priceId: process.env.VITE_STRIPE_PRICE_STARTER || 'price_1SCo7FGCEQehRVO2DuF4YivE' },
  popular: { credits: 500, price: 275, priceId: process.env.VITE_STRIPE_PRICE_POPULAR || 'price_1SCo7uGCEQehRVO2aeKPhB5D' },
  professional: { credits: 1000, price: 500, priceId: process.env.VITE_STRIPE_PRICE_PROFESSIONAL || 'price_1SCo8HGCEQehRVO2THIU6hiP' },
  enterprise: { credits: 5000, price: 2000, priceId: process.env.VITE_STRIPE_PRICE_ENTERPRISE || 'price_1SCo8yGCEQehRVO2ItYM17aV' }
};

// Credits API endpoints (balance endpoint moved above to override router)

app.post('/api/credits/checkout', async (req, res) => {
  const { packageId, priceId } = req.body;
  const pkg = CREDIT_PACKAGES[packageId];

  if (!pkg) {
    return res.status(400).json({ error: 'Invalid package' });
  }

  try {
    // Get the authorization token and extract user ID
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    const s = getStripe();
    if (!s) {
      throw new Error('Stripe not initialized');
    }

    const session = await s.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId || pkg.priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/dashboard?payment=success&credits=${pkg.credits}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/credits?payment=cancelled`,
      metadata: {
        packageId,
        credits: pkg.credits.toString(),
        companyId: user.id // Add the user ID to metadata
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/credits/webhook', async (req, res) => {
  console.log('🎣 Webhook received from Stripe');
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    console.log('❌ No Stripe signature found');
    return res.status(400).send('No signature');
  }

  try {
    const s = getStripe();
    if (!s) throw new Error('Stripe not initialized');

    // req.body is a Buffer when using express.raw()
    const event = s.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    console.log(`📦 Stripe event received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const companyId = session.metadata?.companyId;
      const credits = parseInt(session.metadata?.credits || '0');
      const packageId = session.metadata?.packageId;

      console.log('💳 Payment successful:', {
        companyId,
        credits,
        packageId,
        amountPaid: session.amount_total / 100
      });

      if (companyId && credits > 0) {
        // Use the add_credits function to atomically add credits and record transaction
        const { data: result, error: addError } = await supabaseAdmin.rpc('add_credits', {
          p_company_id: companyId,
          p_amount: credits,
          p_description: `Purchased ${CREDIT_PACKAGES[packageId]?.name || packageId} package`,
          p_reference_id: session.payment_intent,
          p_reference_type: 'stripe_payment'
        });

        if (addError) {
          console.error('Error adding credits:', addError);
        } else {
          console.log(`✅ Added ${credits} credits to company ${companyId}. New balance: ${result.balance}`);

          // Get company info for logging
          const { data: company } = await supabaseAdmin
            .from('companies')
            .select('company_name')
            .eq('id', companyId)
            .single();

          // Log activity
          await supabaseAdmin.rpc('log_admin_activity', {
            p_event_type: 'purchase',
            p_event_title: `${credits} credits purchased`,
            p_event_description: `${company?.company_name || 'User'} purchased ${CREDIT_PACKAGES[packageId]?.name || packageId} package for $${session.amount_total / 100}`,
            p_company_id: companyId,
            p_company_name: company?.company_name,
            p_reference_id: session.payment_intent,
            p_reference_type: 'stripe_payment',
            p_metadata: {
              credits,
              packageId,
              amountPaid: session.amount_total / 100,
              newBalance: result.balance
            }
          });
        }
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Get unlocked chapters for a company
app.get('/api/chapters/unlocked', async (req, res) => {
  try {
    // Get the authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Get user's company_id from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      console.error('Profile fetch error:', profileError);
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Query all unlocks for this company with chapter details
    const { data, error } = await supabase
      .from('chapter_unlocks')
      .select(`
        chapter_id,
        unlock_type,
        unlocked_at,
        expires_at,
        chapters (
          id,
          chapter_name,
          member_count,
          greek_organizations (
            name,
            greek_letters
          ),
          universities (
            name,
            state
          )
        )
      `)
      .eq('company_id', profile.company_id)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    if (error) {
      console.error('Error fetching unlocked chapters:', error);
      return res.status(500).json({ error: 'Failed to fetch unlocked chapters' });
    }

    // Group by chapter
    const chaptersMap = new Map();
    data?.forEach((unlock: any) => {
      const chapterId = unlock.chapter_id;
      if (!chaptersMap.has(chapterId)) {
        chaptersMap.set(chapterId, {
          id: chapterId,
          name: unlock.chapters?.greek_organizations?.name || 'Unknown',
          chapter: unlock.chapters?.chapter_name || '',
          university: unlock.chapters?.universities?.name || 'Unknown University',
          state: unlock.chapters?.universities?.state || '',
          memberCount: unlock.chapters?.member_count || 0,
          unlockedTypes: []
        });
      }
      chaptersMap.get(chapterId).unlockedTypes.push(unlock.unlock_type);
    });

    const chapters = Array.from(chaptersMap.values());

    res.json({
      success: true,
      data: chapters
    });
  } catch (error: any) {
    console.error('Unlocked chapters endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single chapter by ID
app.get('/api/chapters/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: chapterInfo, error} = await supabaseAdmin
      .from('chapters')
      .select(`
        *,
        greek_organizations (
          id,
          name,
          organization_type
        ),
        universities (
          id,
          name,
          state
        )
      `)
      .eq('id', id)
      .single();

    if (error || !chapterInfo) {
      return res.status(404).json({
        success: false,
        error: 'Chapter not found'
      });
    }

    res.json({ success: true, data: chapterInfo });
  } catch (error: any) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get chapter members/roster
app.get('/api/chapters/:id/members', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: members, error } = await supabaseAdmin
      .from('chapter_members')
      .select('*')
      .eq('chapter_id', id)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching chapter members:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch members'
      });
    }

    res.json({ success: true, data: members || [] });
  } catch (error: any) {
    console.error('Error fetching chapter members:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Unlock endpoints
app.post('/api/chapters/:id/unlock', async (req, res) => {
  try {
    const { id: chapterId } = req.params;
    const { unlockType } = req.body;

    // Validate unlock type
    const validTypes = ['basic_info', 'roster', 'officers', 'warm_introduction', 'full'];
    if (!unlockType || !validTypes.includes(unlockType)) {
      return res.status(400).json({ error: 'Invalid unlock type' });
    }

    // Get the authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Only 'full' unlock is supported now
    if (unlockType !== 'full') {
      return res.status(400).json({
        error: 'Only full chapter unlock is available',
        message: 'Please use unlock type "full"'
      });
    }

    // Get chapter to check if it's a 5-star unlock
    const { data: chapterData, error: chapterError } = await supabaseAdmin
      .from('chapters')
      .select('greek_rank, chapter_name, universities(name)')
      .eq('id', chapterId)
      .single();

    if (chapterError || !chapterData) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Determine credits cost based on greek_rank (rating out of 5.0)
    // Higher rank = more expensive (better chapters cost more)
    const rank = chapterData.greek_rank || 0;
    let credits = 20; // Default for low-ranked chapters
    let dollarValue = 5.99;

    if (rank >= 5.0) {
      // 5.0 star chapter - premium
      credits = 40;
      dollarValue = 11.99;
    } else if (rank >= 4.0) {
      // 4.0-4.9 star chapter
      credits = 25;
      dollarValue = 7.49;
    } else if (rank >= 3.5) {
      // 3.5-3.9 star chapter
      credits = 20;
      dollarValue = 5.99;
    } else {
      // Below 3.5 or no rank - cheapest
      credits = 20;
      dollarValue = 5.99;
    }

    // Get user's company_id from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Check if already unlocked
    const { data: existingUnlock } = await supabaseAdmin
      .from('chapter_unlocks')
      .select('*')
      .eq('company_id', profile.company_id)
      .eq('chapter_id', chapterId)
      .eq('unlock_type', unlockType)
      .single();

    if (existingUnlock) {
      return res.json({
        success: true,
        alreadyUnlocked: true,
        message: 'Chapter already unlocked'
      });
    }

    // Call deduct_credits function
    const rankLabel = rank >= 5.0 ? '5.0⭐' : rank >= 4.0 ? '4.0⭐' : rank >= 3.5 ? '3.5⭐' : 'Standard';
    const { data: transactionId, error: deductError } = await supabaseAdmin.rpc('deduct_credits', {
      p_company_id: profile.company_id,
      p_credits: credits,
      p_dollars: dollarValue,
      p_transaction_type: rank >= 5.0 ? 'five_star_unlock' : 'chapter_unlock',
      p_description: `Unlocked ${rankLabel} chapter: ${chapterData.chapter_name}`,
      p_chapter_id: chapterId
    });

    if (deductError) {
      console.error('Error deducting credits:', deductError);
      if (deductError.message?.includes('Insufficient credits')) {
        return res.status(402).json({
          error: 'Insufficient credits',
          message: deductError.message,
          required: credits
        });
      }
      return res.status(500).json({ error: 'Failed to unlock chapter' });
    }

    // Create unlock record
    const { error: unlockError } = await supabaseAdmin
      .from('chapter_unlocks')
      .insert({
        company_id: profile.company_id,
        chapter_id: chapterId,
        unlock_type: unlockType,
        amount_paid: credits, // Store credits amount
        transaction_id: transactionId
      });

    if (unlockError) {
      console.error('Error creating unlock record:', unlockError);
      return res.status(500).json({ error: 'Failed to create unlock record' });
    }

    // Get company info for logging
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('company_name')
      .eq('id', profile.company_id)
      .single();

    // Get updated balance
    const { data: balanceData } = await supabaseAdmin
      .from('account_balance')
      .select('balance_credits, balance_dollars')
      .eq('company_id', profile.company_id)
      .single();

    // Log activity
    await supabaseAdmin.rpc('log_admin_activity', {
      p_event_type: 'unlock',
      p_event_title: `${is5Star ? '5-star' : 'Standard'} chapter unlocked: ${chapterData?.chapter_name || 'Chapter'}`,
      p_event_description: `${company?.company_name || 'User'} unlocked ${unlockType} for ${credits} credits ($${dollarValue} value)`,
      p_company_id: profile.company_id,
      p_company_name: company?.company_name,
      p_reference_id: chapterId,
      p_reference_type: 'chapter',
      p_metadata: {
        unlockType,
        creditsSpent: credits,
        dollarValue: dollarValue,
        is5Star: is5Star,
        chapterName: chapterData?.chapter_name,
        universityName: (chapterData?.universities as any)?.name
      }
    });

    res.json({
      success: true,
      balance: balanceData?.balance_credits || 0,
      creditsSpent: credits,
      dollarValue: dollarValue,
      is5Star: is5Star,
      unlockType,
      transactionId
    });
  } catch (error: any) {
    console.error('Unlock endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chapters/:id/unlock-status', async (req, res) => {
  try {
    const { id: chapterId } = req.params;

    // Get the authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Get user's company_id from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Query unlocks for this chapter
    const { data, error } = await supabase
      .from('chapter_unlocks')
      .select('unlock_type, unlocked_at, expires_at, amount_paid')
      .eq('company_id', profile.company_id)
      .eq('chapter_id', chapterId)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    if (error) {
      console.error('Error fetching unlock status:', error);
      return res.status(500).json({ error: 'Failed to fetch unlock status' });
    }

    const unlockedTypes = data?.map(u => u.unlock_type) || [];

    res.json({
      success: true,
      unlocked: unlockedTypes
    });
  } catch (error: any) {
    console.error('Unlock status endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Store signups (in production, use a database)
const signups: any[] = [];

// Email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jacksonfitzgerald25@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // Use Resend's test email for now

// Helper function to send admin notification
async function sendAdminNotification(userData: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🏢 New Company Onboarding Request - ${userData.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">New Company Onboarding Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">A company wants to partner with Greek organizations</p>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 20px; margin: 20px 0;">
            <h2 style="color: #075985; margin-top: 0; font-size: 20px;">🏢 Company Information</h2>
            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Company Name:</strong> <span style="color: #0f172a; font-size: 18px; font-weight: 600;">${userData.companyName}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Industry/Description:</strong></p>
              <div style="background: #f8fafc; padding: 12px; border-left: 3px solid #3b82f6; margin: 10px 0; border-radius: 4px;">
                <p style="margin: 0; color: #334155; line-height: 1.6;">${userData.companyDescription}</p>
              </div>
            </div>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">👤 Contact Person</h3>
            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Name:</strong> <span style="color: #0f172a;">${userData.name}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Email:</strong> <a href="mailto:${userData.email}" style="color: #2563eb;">${userData.email}</a></p>
              <p style="margin: 8px 0;"><strong style="color: #64748b;">Submitted:</strong> <span style="color: #0f172a;">${new Date(userData.signupDate).toLocaleString()}</span></p>
            </div>
          </div>

          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b; font-weight: 600;">
              ⚡ ACTION REQUIRED: Review and approve this company for platform access
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://fraternitybase.com/admin"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px;
                      text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Review Company in Admin Dashboard →
            </a>
          </div>

          <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              <strong>Why review?</strong> Verify this is a legitimate company that would benefit from connecting with Greek organizations on your platform.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Error sending admin email:', error);
      return { success: false, error };
    }

    console.log('Admin notification sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, error };
  }
}

// Helper function to send user confirmation
async function sendUserConfirmation(userData: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userData.email,
      subject: 'Welcome to Fraternity Base - Application Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for signing up, ${userData.name}!</h2>

          <p style="color: #4b5563; line-height: 1.6;">
            We've received your application to join Fraternity Base. Our team is reviewing
            your information and will get back to you within 24 hours.
          </p>

          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">What happens next?</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>Our team will review your company information</li>
              <li>You'll receive an approval email within 24 hours</li>
              <li>Once approved, you'll have access to your 14-day free trial</li>
              <li>You'll get 1 free chapter lookup to test our platform</li>
            </ul>
          </div>

          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <h4 style="color: #111827; margin-top: 0;">Your Submission Details:</h4>
            <p style="color: #4b5563; margin: 4px 0;"><strong>Company:</strong> ${userData.companyName}</p>
            <p style="color: #4b5563; margin: 4px 0;"><strong>Email:</strong> ${userData.email}</p>
            <p style="color: #4b5563; margin: 4px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Pending Review</span></p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
            If you have any questions, feel free to reply to this email or contact our support team.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #9ca3af; font-size: 12px;">
            © 2024 Fraternity Base. All rights reserved.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending user confirmation:', error);
      return { success: false, error };
    }

    console.log('User confirmation sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send user confirmation:', error);
    return { success: false, error };
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Sign-up endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, companyName, companyDescription } = req.body;

    // Validate required fields
    if (!name || !email || !companyName || !companyDescription) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Create user object
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      companyName,
      companyDescription,
      signupDate: new Date().toISOString(),
      status: 'pending',
      verifiedAt: null,
      verifiedBy: null
    };

    // Store the signup (in production, save to database)
    signups.push(newUser);

    // Send email notifications
    const adminNotification = await sendAdminNotification(newUser);
    const userConfirmation = await sendUserConfirmation(newUser);

    // Log the results
    console.log('New signup processed:', {
      user: newUser.email,
      adminEmailSent: adminNotification.success,
      userEmailSent: userConfirmation.success
    });

    // Log activity
    await supabaseAdmin.rpc('log_admin_activity', {
      p_event_type: 'new_client',
      p_event_title: `New signup: ${companyName}`,
      p_event_description: `${name} (${email}) signed up`,
      p_company_name: companyName,
      p_metadata: {
        name,
        email,
        companyDescription
      }
    });

    // Return success response
    res.json({
      success: true,
      message: 'Signup successful! Check your email for confirmation.',
      data: {
        id: newUser.id,
        status: newUser.status,
        emailsSent: {
          admin: adminNotification.success,
          user: userConfirmation.success
        }
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process signup',
      details: error.message
    });
  }
});

// Get all signups (admin endpoint)
app.get('/api/admin/signups', requireAdmin, async (req, res) => {
  // In production, add authentication here
  res.json({
    success: true,
    data: signups
  });
});

// Update signup status (admin endpoint)
app.patch('/api/admin/signups/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verifiedBy } = req.body;

    const signup = signups.find(s => s.id === id);
    if (!signup) {
      return res.status(404).json({
        success: false,
        error: 'Signup not found'
      });
    }

    // Update status
    signup.status = status;
    signup.verifiedAt = new Date().toISOString();
    signup.verifiedBy = verifiedBy || 'Admin';

    // Send approval/rejection email to user
    if (status === 'approved') {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: signup.email,
        subject: '✅ Your Fraternity Base Account is Approved!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Great news, ${signup.name}!</h2>

            <p style="color: #4b5563; line-height: 1.6;">
              Your Fraternity Base account has been approved! You now have full access to
              your 14-day free trial with 1 chapter lookup included.
            </p>

            <a href="https://fraternitybase.com/login"
               style="display: inline-block; background: #10b981; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Access Your Account
            </a>

            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0;">
              <h3 style="color: #166534; margin-top: 0;">Your Free Trial Includes:</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li>14 days of full platform access</li>
                <li>1 free chapter lookup to test our system</li>
                <li>Access to browse all universities and Greek organizations</li>
                <li>No credit card required</li>
              </ul>
            </div>
          </div>
        `
      });

      if (error) console.error('Error sending approval email:', error);
    }

    res.json({
      success: true,
      data: signup
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      details: error.message
    });
  }
});

// Chapter unlock endpoints - Credit usage system
// DEPRECATED: Old unlock costs - now using dollar-based pricing ($19.99 for full unlock)
// const UNLOCK_COSTS = {
//   roster_view: 10,
//   officer_contacts: 8,
//   full_contacts: 50
// };

// Public endpoint - Browse all chapters (for company dashboard)
app.get('/api/chapters', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select(`
        *,
        greek_organizations(id, name, greek_letters, organization_type),
        universities(id, name, location, state, student_count, logo_url)
      `)
      .eq('status', 'active')
      .order('member_count', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: error.message });
  }
});

// DEPRECATED: This is a duplicate unlock endpoint - now using POST /api/chapters/:id/unlock above
// which uses the new dollar-based pricing system ($19.99 for full unlock)
/*
app.post('/api/chapters/:chapterId/unlock', async (req, res) => {
  // ... old implementation removed ...
  return res.status(410).json({
    error: 'This endpoint is deprecated',
    message: 'Please use POST /api/chapters/:id/unlock with unlockType="full" for $19.99'
  });
});
*/

// Check unlock status for a chapter
app.get('/api/chapters/:chapterId/unlock-status', async (req, res) => {
  const { chapterId } = req.params;

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);

    if (!token) {
      return res.json({ unlocked: [] });
    }

    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return res.json({ unlocked: [] });
    }

    // Get user's company_id from user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.company_id) {
      return res.json({ unlocked: [] });
    }

    const { data: unlocks, error } = await supabase
      .from('chapter_unlocks')
      .select('unlock_type, amount_paid, unlocked_at')
      .eq('company_id', profile.company_id)
      .eq('chapter_id', chapterId);

    if (error) {
      console.error('Error fetching unlock status:', error);
      return res.status(500).json({ error: 'Failed to check unlock status' });
    }

    res.json({
      unlocked: unlocks?.map(u => u.unlock_type) || [],
      details: unlocks || []
    });
  } catch (error: any) {
    console.error('Unlock status error:', error);
    res.status(500).json({ error: 'Failed to check unlock status' });
  }
});

// Admin endpoint to update chapter details
app.patch('/api/admin/chapters/:chapterId', requireAdmin, async (req, res) => {
  const { chapterId } = req.params;
  const updateData = req.body;

  try {
    // Validate that we have a chapter ID
    if (!chapterId) {
      return res.status(400).json({ error: 'Chapter ID is required' });
    }

    // Allowed fields to update
    const allowedFields = [
      'website',
      'twitter_handle',
      'instagram_handle_official',
      'linkedin_url',
      'tiktok_handle',
      'city',
      'state_province',
      'country',
      'fraternity_province',
      'house_address',
      'member_count',
      'founded_year',
      'chapter_name',
      'greek_letter_name',
      'status'
    ];

    // Filter update data to only include allowed fields
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Add last_updated_at timestamp
    filteredData.last_updated_at = new Date().toISOString();

    // Update the chapter
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .update(filteredData)
      .eq('id', chapterId)
      .select(`
        *,
        greek_organizations(id, name, greek_letters),
        universities(id, name, location, state)
      `)
      .single();

    if (error) {
      console.error('Error updating chapter:', error);
      return res.status(500).json({ error: 'Failed to update chapter', details: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json({
      success: true,
      message: 'Chapter updated successfully',
      data
    });
  } catch (error: any) {
    console.error('Chapter update error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ===== ADMIN ANALYTICS ENDPOINTS =====

// Get overall analytics (revenue, credits sold, users)
app.get('/api/admin/analytics/overview', requireAdmin, async (req, res) => {
  try {
    // Total revenue from credit purchases
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('amount, transaction_type, created_at')
      .eq('transaction_type', 'purchase');

    const totalCreditsSold = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

    // Calculate revenue (assuming package prices)
    const totalRevenue = transactions?.reduce((sum, t) => {
      // Match credits to package price
      if (t.amount === 10) return sum + 0.99; // trial
      if (t.amount === 100) return sum + 59;
      if (t.amount === 500) return sum + 275;
      if (t.amount === 1000) return sum + 500;
      if (t.amount === 5000) return sum + 2000;
      return sum;
    }, 0) || 0;

    // Total credits used
    const { data: usageTransactions } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('transaction_type', 'usage');

    const totalCreditsUsed = Math.abs(usageTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0);

    // Total active users
    const { count: totalUsers } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    // Total chapters unlocked
    const { count: totalUnlocks } = await supabase
      .from('chapter_unlocks')
      .select('*', { count: 'exact', head: true });

    res.json({
      totalRevenue,
      totalCreditsSold,
      totalCreditsUsed,
      totalUsers: totalUsers || 0,
      totalUnlocks: totalUnlocks || 0,
      utilizationRate: totalCreditsSold > 0 ? (totalCreditsUsed / totalCreditsSold * 100).toFixed(1) : 0
    });
  } catch (error: any) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get credit spending by college/university
app.get('/api/admin/analytics/colleges', requireAdmin, async (req, res) => {
  try {
    const { data: unlocks } = await supabase
      .from('chapter_unlocks')
      .select('chapter_id, credits_spent, unlocked_at');

    // Group by college (mock data - you'd extract college from chapter_id in real implementation)
    const collegeStats: Record<string, { name: string; totalCredits: number; unlockCount: number; lastUnlock: string }> = {};

    // Mock college mapping (in reality, you'd join with chapters table)
    const mockColleges = ['Penn State', 'Ohio State', 'USC', 'Alabama', 'Texas', 'Florida', 'Michigan', 'Georgia'];

    unlocks?.forEach((unlock, idx) => {
      const college = mockColleges[idx % mockColleges.length];
      if (!collegeStats[college]) {
        collegeStats[college] = { name: college, totalCredits: 0, unlockCount: 0, lastUnlock: unlock.unlocked_at };
      }
      collegeStats[college].totalCredits += unlock.credits_spent;
      collegeStats[college].unlockCount += 1;
      if (unlock.unlocked_at > collegeStats[college].lastUnlock) {
        collegeStats[college].lastUnlock = unlock.unlocked_at;
      }
    });

    const sorted = Object.values(collegeStats).sort((a, b) => b.totalCredits - a.totalCredits);

    res.json({ colleges: sorted });
  } catch (error: any) {
    console.error('College analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch college analytics' });
  }
});

// Get credit spending timeline (daily/weekly)
app.get('/api/admin/analytics/timeline', requireAdmin, async (req, res) => {
  try {
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('amount, transaction_type, created_at')
      .order('created_at', { ascending: true });

    // Group by date
    const dailyStats: Record<string, { date: string; purchased: number; used: number }> = {};

    transactions?.forEach(tx => {
      const date = new Date(tx.created_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { date, purchased: 0, used: 0 };
      }
      if (tx.transaction_type === 'purchase') {
        dailyStats[date].purchased += tx.amount;
      } else {
        dailyStats[date].used += Math.abs(tx.amount);
      }
    });

    const timeline = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ timeline });
  } catch (error: any) {
    console.error('Timeline analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// Get popular unlock types
app.get('/api/admin/analytics/unlock-types', requireAdmin, async (req, res) => {
  try {
    const { data: unlocks } = await supabase
      .from('chapter_unlocks')
      .select('unlock_type, credits_spent');

    const typeStats: Record<string, { type: string; count: number; totalCredits: number }> = {};

    unlocks?.forEach(unlock => {
      if (!typeStats[unlock.unlock_type]) {
        typeStats[unlock.unlock_type] = { type: unlock.unlock_type, count: 0, totalCredits: 0 };
      }
      typeStats[unlock.unlock_type].count += 1;
      typeStats[unlock.unlock_type].totalCredits += unlock.credits_spent;
    });

    const sorted = Object.values(typeStats).sort((a, b) => b.count - a.count);

    res.json({ unlockTypes: sorted });
  } catch (error: any) {
    console.error('Unlock types analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch unlock type analytics' });
  }
});

// Get recent transactions
app.get('/api/admin/analytics/recent-transactions', requireAdmin, async (req, res) => {
  try {
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('*, companies(company_name, email)')
      .order('created_at', { ascending: false })
      .limit(50);

    res.json({ transactions: transactions || [] });
  } catch (error: any) {
    console.error('Recent transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent transactions' });
  }
});

// Get top spending companies
app.get('/api/admin/analytics/top-companies', requireAdmin, async (req, res) => {
  try {
    const { data: companies } = await supabase
      .from('companies')
      .select('company_name, email, credits_balance, created_at')
      .order('credits_balance', { ascending: false })
      .limit(20);

    // Get spending by company
    const { data: spending } = await supabase
      .from('credit_transactions')
      .select('company_id, amount, transaction_type');

    const companySpending: Record<string, number> = {};
    spending?.forEach(tx => {
      if (!companySpending[tx.company_id]) companySpending[tx.company_id] = 0;
      if (tx.transaction_type === 'usage') {
        companySpending[tx.company_id] += Math.abs(tx.amount);
      }
    });

    res.json({ companies: companies || [], spending: companySpending });
  } catch (error: any) {
    console.error('Top companies error:', error);
    res.status(500).json({ error: 'Failed to fetch top companies' });
  }
});

// ===== ADMIN REVENUE & PAYMENT ANALYTICS ENDPOINTS =====

// Get revenue summary statistics
app.get('/api/admin/revenue/summary', requireAdmin, async (req, res) => {
  try {
    const { dateRange } = req.query; // 7, 30, 90, 365, or 'all'

    let dateFilter = '';
    if (dateRange && dateRange !== 'all') {
      const daysAgo = parseInt(dateRange as string);
      dateFilter = `created_at >= NOW() - INTERVAL '${daysAgo} days'`;
    }

    // Get all transactions
    let query = supabase
      .from('balance_transactions')
      .select('amount, type, created_at, stripe_payment_intent_id');

    if (dateFilter) {
      const daysAgo = parseInt(dateRange as string);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      query = query.gte('created_at', cutoffDate.toISOString());
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    // Calculate total revenue
    const totalRevenue = transactions?.reduce((sum, tx) => {
      // Only count positive amounts (purchases, not deductions)
      return tx.amount > 0 ? sum + tx.amount : sum;
    }, 0) || 0;

    // Calculate this month's revenue
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthRevenue = transactions?.filter(tx =>
      new Date(tx.created_at) >= firstDayOfMonth && tx.amount > 0
    ).reduce((sum, tx) => sum + tx.amount, 0) || 0;

    // Calculate last month's revenue for percentage change
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthRevenue = transactions?.filter(tx => {
      const txDate = new Date(tx.created_at);
      return txDate >= firstDayOfLastMonth && txDate <= lastDayOfLastMonth && tx.amount > 0;
    }).reduce((sum, tx) => sum + tx.amount, 0) || 0;

    const monthlyGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    // Calculate average transaction
    const positiveTransactions = transactions?.filter(tx => tx.amount > 0) || [];
    const averageTransaction = positiveTransactions.length > 0
      ? totalRevenue / positiveTransactions.length
      : 0;

    // Count failed payments (transactions without payment intent ID or $0 amount)
    const failedPayments = transactions?.filter(tx =>
      !tx.stripe_payment_intent_id && tx.amount === 0
    ).length || 0;

    res.json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue: Math.round(thisMonthRevenue),
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
        averageTransaction: Math.round(averageTransaction),
        failedPayments,
        transactionCount: positiveTransactions.length
      }
    });
  } catch (error: any) {
    console.error('Revenue summary error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue summary' });
  }
});

// Get detailed transaction history with company and user info
app.get('/api/admin/revenue/transactions', requireAdmin, async (req, res) => {
  try {
    const { dateRange, limit = '100' } = req.query;

    let query = supabase
      .from('balance_transactions')
      .select(`
        id,
        amount,
        type,
        description,
        stripe_payment_intent_id,
        stripe_customer_id,
        created_at,
        company_id,
        companies!inner (
          id,
          company_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    if (dateRange && dateRange !== 'all') {
      const daysAgo = parseInt(dateRange as string);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      query = query.gte('created_at', cutoffDate.toISOString());
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    // For each transaction, try to get the user who made it
    const enrichedTransactions = await Promise.all(
      (transactions || []).map(async (tx) => {
        // Try to find the user from the company who made this transaction
        // by checking team_members for the company
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select(`
            user_id,
            user_profiles!inner (
              first_name,
              last_name,
              email
            )
          `)
          .eq('company_id', tx.company_id)
          .eq('member_number', 1) // Get the primary member
          .single();

        const companies = tx.companies as any;
          const userProfiles = teamMembers?.user_profiles as any;

        return {
          id: tx.id,
          company_name: companies.company_name,
          company_email: companies.email,
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          status: tx.stripe_payment_intent_id ? 'completed' : 'pending',
          payment_method: tx.stripe_customer_id ? 'stripe' : 'manual',
          confirmation_id: tx.stripe_payment_intent_id,
          created_at: tx.created_at,
          user_name: userProfiles
            ? `${userProfiles.first_name} ${userProfiles.last_name}`
            : 'Unknown',
          user_email: userProfiles?.email || companies.email
        };
      })
    );

    res.json({
      success: true,
      transactions: enrichedTransactions
    });
  } catch (error: any) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get revenue breakdown by company
app.get('/api/admin/revenue/by-company', requireAdmin, async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('balance_transactions')
      .select(`
        amount,
        company_id,
        companies!inner (
          company_name,
          email
        )
      `)
      .gt('amount', 0);

    if (error) throw error;

    // Group by company
    const companyRevenue: Record<string, {
      company_name: string;
      email: string;
      total: number;
      count: number;
    }> = {};

    transactions?.forEach(tx => {
      const companies = tx.companies as any;
      if (!companyRevenue[tx.company_id]) {
        companyRevenue[tx.company_id] = {
          company_name: companies.company_name,
          email: companies.email,
          total: 0,
          count: 0
        };
      }
      companyRevenue[tx.company_id].total += tx.amount;
      companyRevenue[tx.company_id].count += 1;
    });

    // Convert to array and sort by revenue
    const sortedCompanies = Object.entries(companyRevenue)
      .map(([companyId, data]) => ({
        company_id: companyId,
        ...data,
        average: Math.round(data.total / data.count)
      }))
      .sort((a, b) => b.total - a.total);

    res.json({
      success: true,
      companies: sortedCompanies
    });
  } catch (error: any) {
    console.error('Revenue by company error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue by company' });
  }
});

// Get revenue breakdown by time period
app.get('/api/admin/revenue/by-time', requireAdmin, async (req, res) => {
  try {
    const { period = 'day', days = '30' } = req.query; // period: 'day', 'week', 'month'

    const daysAgo = parseInt(days as string);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const { data: transactions, error } = await supabase
      .from('balance_transactions')
      .select('amount, created_at')
      .gte('created_at', cutoffDate.toISOString())
      .gt('amount', 0)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by time period
    const periodMap: Record<string, number> = {};

    transactions?.forEach(tx => {
      const date = new Date(tx.created_at);
      let key: string;

      if (period === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else { // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      periodMap[key] = (periodMap[key] || 0) + tx.amount;
    });

    const chartData = Object.entries(periodMap).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue)
    }));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error: any) {
    console.error('Revenue by time error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue by time' });
  }
});

// ===== ADMIN DATA MANAGEMENT ENDPOINTS =====

// Companies/Partners - View all registered companies with their unlock history
app.get('/api/admin/companies', requireAdmin, async (req, res) => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // For each company, fetch their unlock history and user email
    const companiesWithUnlocks = await Promise.all(
      (companies || []).map(async (company) => {
        // Get unlocks
        const { data: unlocks } = await supabase
          .from('chapter_unlocks')
          .select(`
            *,
            chapters(
              chapter_name,
              greek_organizations(name),
              universities(name)
            )
          `)
          .eq('company_id', company.id)
          .order('unlocked_at', { ascending: false });

        // Get user email from user_profiles
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('company_id', company.id)
          .limit(1)
          .single();

        let email = null;
        if (userProfile) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userProfile.user_id);
          email = authUser?.user?.email || null;
        }

        // Get account balance
        const { data: accountBalance } = await supabaseAdmin
          .from('account_balance')
          .select('balance_credits, lifetime_spent_credits')
          .eq('company_id', company.id)
          .single();

        return {
          ...company,
          company_name: company.name, // Map 'name' to 'company_name' for frontend
          email: email,
          unlocks: unlocks || [],
          total_spent: accountBalance?.lifetime_spent_credits || 0,
          credits_balance: accountBalance?.balance_credits || 0
        };
      })
    );

    res.json({ success: true, data: companiesWithUnlocks });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get detailed company information with users (admin only)
app.get('/api/admin/companies/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get all users for this company (up to 3)
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, role, created_at')
      .eq('company_id', id)
      .limit(3);

    // Fetch user emails from auth
    const users = await Promise.all(
      (userProfiles || []).map(async (profile) => {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
        return {
          user_id: profile.user_id,
          email: authUser?.user?.email || null,
          role: profile.role || 'member',
          created_at: profile.created_at
        };
      })
    );

    // Get unlock history
    const { data: unlocks } = await supabase
      .from('chapter_unlocks')
      .select(`
        *,
        chapters(
          chapter_name,
          greek_organizations(name),
          universities(name, state)
        )
      `)
      .eq('company_id', id)
      .order('unlocked_at', { ascending: false });

    // Get balance transaction history
    const { data: transactions } = await supabase
      .from('balance_transactions')
      .select('*')
      .eq('company_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get account balance (use admin client to bypass RLS)
    const { data: accountBalance, error: balanceError } = await supabaseAdmin
      .from('account_balance')
      .select('balance_credits, balance_dollars, lifetime_spent_credits, lifetime_spent_dollars, lifetime_earned_credits, lifetime_added_dollars, subscription_tier')
      .eq('company_id', id)
      .single();

    console.log('💰 Account balance query for company:', id);
    console.log('💰 Balance data:', accountBalance);
    console.log('💰 Balance error:', balanceError);

    res.json({
      success: true,
      data: {
        ...company,
        company_name: company.name,
        users: users || [],
        unlocks: unlocks || [],
        transactions: transactions || [],
        total_spent: accountBalance?.lifetime_spent_credits || 0,
        credits_balance: accountBalance?.balance_credits || 0,
        lifetime_spent: accountBalance?.lifetime_spent_credits || 0,
        lifetime_added: accountBalance?.lifetime_earned_credits || 0
      }
    });
  } catch (error: any) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add credits to a company (admin only)
app.post('/api/admin/companies/:id/add-credits', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { credits } = req.body;

    if (!credits || isNaN(credits) || credits <= 0) {
      return res.status(400).json({ error: 'Invalid credit amount' });
    }

    // Get current company and balance BEFORE adding credits
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get balance before
    const { data: balanceBefore } = await supabaseAdmin
      .from('account_balance')
      .select('balance_credits')
      .eq('company_id', id)
      .single();

    const balanceBeforeAmount = balanceBefore?.balance_credits || 0;

    // Add credits using the stored procedure
    const { data, error } = await supabaseAdmin.rpc('add_credits', {
      p_company_id: id,
      p_credits: credits,
      p_dollars: 0.00,
      p_transaction_type: 'credit_purchase',
      p_description: `Admin added ${credits} credits`,
      p_stripe_payment_intent_id: null
    });

    if (error) throw error;

    const balanceAfterAmount = balanceBeforeAmount + credits;

    // Get admin user info
    const adminUser = (req as any).user;
    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email')
      .eq('user_id', adminUser?.id)
      .single();

    // Send notification emails
    const notificationService = getCreditNotificationService();
    if (notificationService) {
      notificationService.notifyCreditAdded({
        companyId: id,
        companyName: company.name,
        amount: credits,
        balanceBefore: balanceBeforeAmount,
        balanceAfter: balanceAfterAmount,
        transactionType: 'admin_manual_add',
        adminEmail: adminProfile?.email,
        adminName: adminProfile ? `${adminProfile.first_name} ${adminProfile.last_name || ''}`.trim() : undefined,
        description: `Admin manually added credits`
      }).catch(err => console.error('Failed to send credit notification:', err));
    }

    console.log(`✅ Admin added ${credits} credits to ${company.name} (${id})`);
    res.json({
      success: true,
      message: `Added ${credits} credits to ${company.name}`,
      new_balance: balanceAfterAmount
    });
  } catch (error: any) {
    console.error('Error adding credits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update subscription tier (admin only)
app.post('/api/admin/companies/:id/subscription-tier', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;

    if (!['trial', 'monthly', 'enterprise'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier value' });
    }

    // Get company name for logging
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('name')
      .eq('id', id)
      .single();

    // Update subscription tier in account_balance
    const { error } = await supabaseAdmin
      .from('account_balance')
      .update({ subscription_tier: tier })
      .eq('company_id', id);

    if (error) throw error;

    console.log(`🎫 Updated subscription tier for ${company?.name || id} to: ${tier.toUpperCase()}`);
    res.json({ success: true, message: `Updated subscription tier to ${tier}` });
  } catch (error: any) {
    console.error('❌ Error updating subscription tier:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update company status (admin only)
app.patch('/api/admin/companies/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(approval_status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const { data, error } = await supabase
      .from('companies')
      .update({ approval_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Updated company ${id} status to ${approval_status}`);
    res.json({
      success: true,
      message: `Status updated to ${approval_status}`,
      data
    });
  } catch (error: any) {
    console.error('Error updating company status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cron job to grant monthly credits (should be called daily by a cron service)
app.post('/api/cron/grant-monthly-credits', async (req, res) => {
  try {
    // Verify cron secret
    const cronSecret = req.headers['x-cron-secret'];
    if (cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all companies with active subscriptions
    const { data: activeSubscriptions, error } = await supabaseAdmin
      .from('account_balance')
      .select('company_id, subscription_tier, last_monthly_credit_grant_at')
      .in('subscription_tier', ['monthly', 'enterprise']);

    if (error) throw error;

    const results = [];
    for (const account of activeSubscriptions || []) {
      // Call grant_monthly_credits function for each account
      const { data, error: grantError } = await supabaseAdmin.rpc('grant_monthly_credits', {
        p_company_id: account.company_id
      });

      results.push({
        company_id: account.company_id,
        success: !grantError,
        granted: data,
        error: grantError?.message
      });

      if (data) {
        console.log(`✅ Granted monthly credits to company ${account.company_id} (${account.subscription_tier})`);
      }
    }

    res.json({
      success: true,
      message: `Processed ${activeSubscriptions?.length || 0} accounts`,
      results
    });
  } catch (error: any) {
    console.error('❌ Error granting monthly credits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Greek Organizations (Fraternities/Sororities)
app.get('/api/admin/greek-organizations', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('greek_organizations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching greek organizations:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/greek-organizations', requireAdmin, async (req, res) => {
  try {
    const { name, greek_letters, organization_type, founded_year, national_website, total_chapters, colors, symbols, philanthropy } = req.body;

    const { data, error } = await supabase
      .from('greek_organizations')
      .insert({
        name,
        greek_letters,
        organization_type,
        founded_year,
        national_website,
        total_chapters,
        colors,
        symbols,
        philanthropy
      })
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Created greek organization: ${name}`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating greek organization:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/greek-organizations/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('greek_organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Updated greek organization: ${id}`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating greek organization:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/greek-organizations/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('greek_organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log(`✅ Deleted greek organization: ${id}`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting greek organization:', error);
    res.status(500).json({ error: error.message });
  }
});

// Universities
app.get('/api/admin/universities', requireAdmin, async (req, res) => {
  try {
    console.log('\n🔍 === FETCHING UNIVERSITIES FROM DATABASE ===');
    console.log('📍 Client: supabase (regular client - may be subject to RLS)');
    console.log('📍 Table: universities');
    console.log('📍 Query: SELECT * with chapter count, ORDER BY name ASC');

    // Fetch universities with chapter count
    // TODO: Use supabaseAdmin once SUPABASE_SERVICE_ROLE_KEY is set in production
    // TODO: Add unlock_history table relationship for unlock_count
    const { data, error } = await supabase
      .from('universities')
      .select(`
        *,
        chapters:chapters(count)
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ DATABASE ERROR:', error);
      throw error;
    }

    console.log(`✅ Raw data received: ${data?.length || 0} universities`);
    if (data && data.length > 0) {
      console.log('📋 First 3 universities:', data.slice(0, 3).map(u => ({
        id: u.id,
        name: u.name,
        state: u.state,
        chapters: u.chapters?.[0]?.count || 0
      })));
    }

    // Transform the data to include chapter_count, bars_nearby, and unlock_count
    const transformedData = data?.map(uni => ({
      ...uni,
      chapter_count: uni.chapters?.[0]?.count || 0,
      bars_nearby: uni.bars_nearby || 0,
      unlock_count: 0 // TODO: Add unlock_history table
    })) || [];

    console.log(`✅ Sending ${transformedData.length} universities to frontend`);
    console.log('=== END DATABASE FETCH ===\n');

    res.json({ success: true, data: transformedData });
  } catch (error: any) {
    console.error('❌ Error fetching universities:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/universities', requireAdmin, async (req, res) => {
  try {
    const { name, location, state, student_count, greek_percentage, website, logo_url, bars_nearby, unlock_count } = req.body;

    const { data, error } = await supabase
      .from('universities')
      .insert({
        name,
        location,
        state,
        student_count,
        greek_percentage,
        website,
        logo_url,
        bars_nearby,
        unlock_count
      })
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Created university: ${name}`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating university:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/universities/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('universities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Updated university: ${id}`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating university:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/universities/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('universities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log(`✅ Deleted university: ${id}`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting university:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chapters
app.get('/api/admin/chapters', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select(`
        *,
        greek_organizations(id, name, organization_type),
        universities(id, name, state)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/chapters', requireAdmin, async (req, res) => {
  try {
    const {
      greek_organization_id,
      university_id,
      chapter_name,
      charter_date,
      member_count,
      status,
      house_address,
      instagram_handle,
      website,
      contact_email,
      phone,
      engagement_score,
      partnership_openness,
      event_frequency
    } = req.body;

    const { data, error } = await supabase
      .from('chapters')
      .insert({
        greek_organization_id,
        university_id,
        chapter_name,
        charter_date,
        member_count,
        status,
        house_address,
        instagram_handle,
        website,
        contact_email,
        phone,
        engagement_score,
        partnership_openness,
        event_frequency
      })
      .select(`
        *,
        greek_organizations(name),
        universities(name)
      `)
      .single();

    if (error) throw error;
    console.log(`✅ Created chapter: ${chapter_name}`);

    // Log to activity feed for public display
    await supabaseAdmin.rpc('log_admin_activity', {
      p_event_type: 'new_chapter',
      p_event_title: `New chapter added: ${chapter_name}`,
      p_event_description: `${(data as any).greek_organizations?.name || 'Chapter'} at ${(data as any).universities?.name || 'University'}`,
      p_reference_id: (data as any).id,
      p_reference_type: 'chapter',
      p_metadata: {
        chapterName: chapter_name,
        universityName: (data as any).universities?.name,
        greekOrgName: (data as any).greek_organizations?.name,
        memberCount: member_count
      }
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/chapters/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        greek_organizations(name),
        universities(name)
      `)
      .single();

    if (error) throw error;
    console.log(`✅ Updated chapter: ${id}`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/chapters/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log(`✅ Deleted chapter: ${id}`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chapter Officers
app.get('/api/admin/officers', requireAdmin, async (req, res) => {
  try {
    const { chapter_id } = req.query;

    let query = supabase
      .from('chapter_officers')
      .select(`
        *,
        chapters(
          chapter_name,
          greek_organizations(name),
          universities(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (chapter_id) {
      query = query.eq('chapter_id', chapter_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching officers:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/officers', requireAdmin, async (req, res) => {
  try {
    const {
      chapter_id,
      name,
      position,
      member_type,
      email,
      phone,
      linkedin_profile,
      graduation_year,
      major,
      is_primary_contact
    } = req.body;

    const { data, error } = await supabase
      .from('chapter_officers')
      .insert({
        chapter_id,
        name,
        position,
        member_type: member_type || 'member',
        email,
        phone,
        linkedin_profile,
        graduation_year,
        major,
        is_primary_contact
      })
      .select(`
        *,
        chapters(
          chapter_name,
          greek_organizations(name),
          universities(name)
        )
      `)
      .single();

    if (error) throw error;
    console.log(`✅ Created user: ${name} - ${position} (${member_type || 'member'})`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/officers/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('chapter_officers')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        chapters(
          chapter_name,
          greek_organizations(name),
          universities(name)
        )
      `)
      .single();

    if (error) throw error;
    console.log(`✅ Updated officer: ${id}`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating officer:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/officers/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('chapter_officers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log(`✅ Deleted officer: ${id}`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting officer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Image Upload Endpoint (Supabase Storage)
app.post('/api/admin/upload-image', requireAdmin, async (req, res) => {
  try {
    const { file, bucket, path } = req.body;

    if (!file || !bucket || !path) {
      return res.status(400).json({ error: 'Missing required fields: file, bucket, path' });
    }

    console.log(`📤 Uploading image to bucket: ${bucket}, path: ${path}`);

    // Check if bucket exists, create if it doesn't
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      throw listError;
    }

    const bucketExists = buckets.some((b: any) => b.name === bucket);
    if (!bucketExists) {
      console.log(`📦 Creating bucket: ${bucket}`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        throw createError;
      }
      console.log(`✅ Bucket created: ${bucket}`);
    }

    // Convert base64 to buffer
    const base64Data = file.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid base64 file data');
    }
    const buffer = Buffer.from(base64Data, 'base64');

    // Extract content type from base64 string
    const contentTypeMatch = file.match(/data:([^;]+);/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream';

    console.log(`📁 File size: ${buffer.length} bytes, type: ${contentType}`);

    // Use admin client for file uploads
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    console.log(`✅ Uploaded image: ${path} → ${publicUrl}`);
    res.json({ success: true, url: publicUrl, data });
  } catch (error: any) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed',
      details: error
    });
  }
});

// AI Status check endpoint
app.get('/api/admin/ai-status', requireAdmin, async (req, res) => {
  try {
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'ADD_YOUR_ANTHROPIC_API_KEY_HERE';

    if (!hasApiKey) {
      return res.json({
        connected: false,
        model: 'No API Key'
      });
    }

    // Try a simple API call to verify the key works
    try {
      await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      });

      res.json({
        connected: true,
        model: 'Claude 3.5 Sonnet'
      });
    } catch (error: any) {
      res.json({
        connected: false,
        model: error.message || 'API Error'
      });
    }
  } catch (error: any) {
    console.error('Error checking AI status:', error);
    res.json({ connected: false, model: 'Unknown' });
  }
});

// AI Assistant endpoint for admin data entry help
app.post('/api/admin/ai-assist', requireAdmin, async (req, res) => {
  try {
    const { prompt, context, existingData } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Build context-aware system message based on the current tab
    let systemPrompt = '';
    let dataFormat = '';

    switch (context) {
      case 'colleges':
        systemPrompt = `You are a helpful assistant for adding university data to a fraternity/sorority database.
The user is working with university records that include: name, location, state, student_count, greek_percentage, website, logo_url.
Existing universities: ${JSON.stringify(existingData.slice(0, 10).map((u: any) => u.name))}`;
        dataFormat = `Return a JSON array of university objects with structure:
{
  "name": "University Name",
  "location": "City, State",
  "state": "State Abbreviation",
  "student_count": 0,
  "greek_percentage": 0.0,
  "website": "https://...",
  "logo_url": ""
}`;
        break;

      case 'fraternities':
        systemPrompt = `You are a helpful assistant for adding Greek organization data to a database.
The user is working with fraternity/sorority records that include: name, greek_letters, organization_type, founded_year, total_chapters, website, logo_url, national_website.
Existing organizations: ${JSON.stringify(existingData.slice(0, 10).map((g: any) => g.name))}`;
        dataFormat = `Return a JSON array of organization objects with structure:
{
  "name": "Organization Name",
  "greek_letters": "ΑΒΓ",
  "organization_type": "fraternity" or "sorority",
  "founded_year": 1900,
  "total_chapters": 0,
  "website": "https://...",
  "national_website": "https://..."
}`;
        break;

      case 'chapters':
        systemPrompt = `You are a helpful assistant for adding chapter data to a fraternity/sorority database.
Chapters connect a Greek organization to a university and include: chapter_name, member_count, house_address, status, instagram_handle.`;
        dataFormat = `Return a JSON array of chapter objects with structure:
{
  "greek_organization_id": "uuid",
  "university_id": "uuid",
  "chapter_name": "Alpha Chapter",
  "member_count": 0,
  "house_address": "123 Greek Row",
  "status": "active",
  "instagram_handle": "@handle"
}`;
        break;

      case 'officers':
        systemPrompt = `You are a helpful assistant for adding chapter officer contact data.
Officers include: name, position, email, phone, linkedin_url, major, graduation_year.`;
        dataFormat = `Return a JSON array of officer objects with structure:
{
  "chapter_id": "uuid",
  "name": "Full Name",
  "position": "President",
  "email": "email@university.edu",
  "phone": "(555) 123-4567",
  "linkedin_url": "https://linkedin.com/in/...",
  "major": "Major",
  "graduation_year": 2025
}`;
        break;

      default:
        systemPrompt = 'You are a helpful assistant for managing fraternity and sorority data.';
        dataFormat = 'Provide helpful suggestions or data in JSON format if applicable.';
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `${systemPrompt}

${dataFormat}

User request: ${prompt}

If the user is asking to add data, provide a properly formatted JSON array that can be directly inserted into the database.
If they're asking for suggestions or information, provide a helpful text response.
Be concise and accurate.`
      }]
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    console.log(`🤖 AI Assist: ${prompt.substring(0, 50)}...`);
    res.json({ success: true, response, suggestion: response });
  } catch (error: any) {
    console.error('Error with AI assist:', error);
    res.status(500).json({ error: error.message || 'AI assist failed' });
  }
});

// ==================== WAITLIST ENDPOINT ====================
// Waitlist signup with email notifications
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, source, referrer } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email is required'
      });
    }

    // Check if email already exists in waitlist
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Email already on waitlist'
      });
    }

    // Add to waitlist
    const { data: waitlistEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        source: source || 'unknown',
        referrer: referrer || null,
        signup_date: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Get waitlist position
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: '🎯 You\'re on the FraternityBase waitlist!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Welcome to the waitlist!</h1>
            </div>

            <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; color: #374151; line-height: 1.6; margin-top: 0;">
                Thanks for joining! You're in position <strong style="color: #667eea;">#${count || 1}</strong> on the FraternityBase waitlist.
              </p>

              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">What happens next?</h3>
                <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
                  <li>We'll email you <strong>48 hours before launch</strong></li>
                  <li>You'll get <strong>early access</strong> ahead of everyone else</li>
                  <li>Receive a <strong>30% discount code</strong> for your first purchase</li>
                </ul>
              </div>

              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <p style="color: white; margin: 0; font-size: 16px;">
                  <strong>🚀 Early Access Perk:</strong><br/>
                  Join <strong style="color: #d1fae5;">${count || 500}+</strong> brands already on the waitlist
                </p>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                Questions? Just reply to this email - we'd love to hear from you!<br/>
                <br/>
                <strong>The FraternityBase Team</strong>
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending waitlist confirmation:', emailError);
    }

    // Send notification email to admin
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `🎯 New Waitlist Signup: ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1f2937;">New Waitlist Signup</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Position:</strong> #${count || 1}</p>
            <p><strong>Source:</strong> ${source || 'unknown'}</p>
            <p><strong>Referrer:</strong> ${referrer || 'direct'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `
      });
    } catch (adminEmailError) {
      console.error('Error sending admin notification:', adminEmailError);
    }

    console.log(`📧 Waitlist signup: ${email} (Position: #${count || 1})`);

    res.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: {
        email: email,
        position: count || 1
      }
    });

  } catch (error: any) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join waitlist'
    });
  }
});

// Get all waitlist entries (admin only)
app.get('/api/admin/waitlist', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('signup_date', { ascending: false });

    if (error) throw error;

    console.log(`✅ Retrieved ${data?.length || 0} waitlist entries`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching waitlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync missing universities from chapters (admin only)
app.post('/api/admin/sync-universities', requireAdmin, async (req, res) => {
  try {
    // Get all chapters with their university data
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('university_id, universities(id, name, state, location)');

    if (chaptersError) throw chaptersError;

    // Get all existing universities
    const { data: existingUniversities, error: universitiesError } = await supabase
      .from('universities')
      .select('id, name');

    if (universitiesError) throw universitiesError;

    const existingIds = new Set(existingUniversities?.map(u => u.id) || []);
    const missingUniversities = new Map<string, any>();

    // Find universities that are referenced by chapters but don't exist in universities table
    chapters?.forEach((chapter: any) => {
      const uni = chapter.universities;
      if (uni && !existingIds.has(uni.id)) {
        missingUniversities.set(uni.id, uni);
      }
    });

    console.log(`Found ${missingUniversities.size} universities referenced by chapters but missing from universities table`);

    // These universities exist (they're referenced by chapters) but we need to ensure they appear in the admin list
    // This is actually not a missing data issue - the foreign key ensures they exist
    // The issue might be with RLS policies or the query

    res.json({
      success: true,
      message: 'All universities referenced by chapters already exist in the database',
      totalChapters: chapters?.length || 0,
      uniqueUniversities: new Set(chapters?.map((c: any) => c.university_id)).size,
      existingUniversities: existingUniversities?.length || 0
    });
  } catch (error: any) {
    console.error('Error syncing universities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clean up duplicate universities (admin only)
app.post('/api/admin/clean-duplicates', requireAdmin, async (req, res) => {
  try {
    // Fetch all universities
    const { data: universities, error: fetchError } = await supabase
      .from('universities')
      .select('*')
      .order('created_at', { ascending: true }); // Keep oldest entries

    if (fetchError) throw fetchError;

    // Group by normalized name
    const grouped = new Map<string, any[]>();
    universities?.forEach((uni) => {
      const key = uni.name.trim().toLowerCase();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(uni);
    });

    // Find duplicates and keep only the first (oldest) one
    const duplicates = Array.from(grouped.entries())
      .filter(([_, unis]) => unis.length > 1);

    let deletedCount = 0;
    let mergedChapters = 0;
    const deletedIds: string[] = [];

    for (const [name, unis] of duplicates) {
      // Keep the first one (oldest), merge and delete the rest
      const keepUni = unis[0];
      const toDelete = unis.slice(1);

      for (const uni of toDelete) {
        // First, move any chapters from duplicate to the kept university
        const { data: chaptersToMove, error: chaptersError } = await supabase
          .from('chapters')
          .select('id')
          .eq('university_id', uni.id);

        if (chaptersError) {
          console.error(`Error fetching chapters for ${uni.id}:`, chaptersError);
          continue;
        }

        if (chaptersToMove && chaptersToMove.length > 0) {
          const { error: updateError } = await supabase
            .from('chapters')
            .update({ university_id: keepUni.id })
            .eq('university_id', uni.id);

          if (updateError) {
            console.error(`Error moving chapters from ${uni.id} to ${keepUni.id}:`, updateError);
            continue;
          }

          mergedChapters += chaptersToMove.length;
          console.log(`✅ Moved ${chaptersToMove.length} chapters from duplicate to original`);
        }

        // Now delete the duplicate university
        const { error: deleteError } = await supabase
          .from('universities')
          .delete()
          .eq('id', uni.id);

        if (deleteError) {
          console.error(`Error deleting university ${uni.id}:`, deleteError);
        } else {
          deletedCount++;
          deletedIds.push(uni.id);
          console.log(`✅ Deleted duplicate: ${name} (ID: ${uni.id})`);
        }
      }
    }

    console.log(`✅ Cleaned up ${deletedCount} duplicate universities, merged ${mergedChapters} chapters`);
    res.json({
      success: true,
      deletedCount,
      mergedChapters,
      duplicatesFound: duplicates.length,
      message: `Removed ${deletedCount} duplicate entries from ${duplicates.length} duplicate universities and merged ${mergedChapters} chapters`
    });
  } catch (error: any) {
    console.error('Error cleaning duplicates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configure multer for CSV file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Claude CSV Processing endpoint
app.post('/api/admin/process-csv-with-claude', requireAdmin, upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No CSV file uploaded' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const userPrompt = req.body.prompt || '';

    // Get all chapters and universities for context
    const { data: chapters } = await supabaseAdmin
      .from('chapters')
      .select(`
        id,
        chapter_name,
        universities (id, name, state)
      `);

    const prompt = `You are a data processing assistant helping upload chapter roster data to a fraternity database.

${userPrompt ? `IMPORTANT USER INSTRUCTIONS: ${userPrompt}\n` : ''}

I'm providing you with:
1. A CSV file with member roster data
2. A list of existing chapters in the database

Your task:
1. Parse the CSV and identify what chapter this roster belongs to
2. Match it to an existing chapter in the database (or indicate if you can't find a match)
3. Clean and format ALL member data from the CSV according to our schema - DO NOT truncate or skip any members
4. Provide warnings about any data quality issues

IMPORTANT: Include EVERY single member from the CSV in your response, even if data is incomplete. Do not summarize or skip members.

CSV Content:
${csvContent}

Existing Chapters in Database:
${JSON.stringify(chapters, null, 2)}

Member Data Schema:
- name (required): Full name
- position: Officer position or "Member"
- email: Email address
- phone: Phone number (format: (XXX) XXX-XXXX or XXX-XXX-XXXX)
- linkedin: LinkedIn profile URL
- graduation_year: Year as integer
- major: Academic major
- member_type: "member", "officer", "alumni", or "advisor"
- is_primary_contact: boolean (true/false)

Please respond ONLY with valid JSON in this exact format:
{
  "chapterId": "uuid-of-matched-chapter",
  "chapterName": "Chapter Name",
  "universityName": "University Name",
  "members": [
    {
      "name": "John Doe",
      "position": "President",
      "email": "john@example.com",
      "phone": "(555) 123-4567",
      "linkedin": "",
      "graduation_year": 2025,
      "major": "Business",
      "member_type": "officer",
      "is_primary_contact": true
    }
  ],
  "explanation": "Brief explanation of what you did (1-2 sentences)",
  "warnings": ["Array of any warnings or data quality issues"],
  "confidence": "high|medium|low"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response (handle markdown code blocks)
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      jsonMatch = responseText.match(/\{[\s\S]*\}/);
    }

    if (!jsonMatch) {
      throw new Error('Could not parse Claude response as JSON');
    }

    const processedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    res.json({
      success: true,
      data: processedData
    });

  } catch (error: any) {
    console.error('Error processing CSV with Claude:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Warm introduction request endpoint
app.post('/api/chapters/:id/warm-intro-request', async (req, res) => {
  try {
    const { id: chapterId } = req.params;
    const { name, email, companyName, proposal, preferredContact } = req.body;

    // Get the authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Get user's company_id
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      return res.status(400).json({ error: 'Company not found' });
    }

    // Get chapter info
    const { data: warmIntroChapter } = await supabaseAdmin
      .from('chapters')
      .select('chapter_name, universities(name)')
      .eq('id', chapterId)
      .single();

    // Fraternity introduction costs 333 credits ($99.99)
    const credits = 333;
    const dollarValue = 99.99;

    // Deduct credits for the introduction request
    const { data: transactionId, error: deductError } = await supabaseAdmin.rpc('deduct_credits', {
      p_company_id: profile.company_id,
      p_credits: credits,
      p_dollars: dollarValue,
      p_transaction_type: 'fraternity_introduction',
      p_description: `Fraternity introduction request: ${warmIntroChapter?.chapter_name}`,
      p_chapter_id: chapterId
    });

    if (deductError) {
      console.error('Error deducting credits:', deductError);
      return res.status(400).json({ error: 'Insufficient credits or failed to process payment' });
    }

    console.log(`💳 Fraternity introduction requested - ${credits} credits deducted from company ${profile.company_id}`);

    // Log activity
    await supabaseAdmin.rpc('log_admin_activity', {
      p_event_type: 'warm_intro_request',
      p_event_title: `Warm intro requested: ${warmIntroChapter?.chapter_name || 'Chapter'}`,
      p_event_description: `${companyName} requested introduction to ${warmIntroChapter?.chapter_name}`,
      p_company_id: user.id,
      p_company_name: companyName,
      p_reference_id: chapterId,
      p_reference_type: 'chapter',
      p_metadata: {
        name,
        email,
        companyName,
        proposal,
        preferredContact,
        chapterName: warmIntroChapter?.chapter_name,
        universityName: (warmIntroChapter?.universities as any)?.name,
        creditsCharged: credits
      }
    });

    res.json({ success: true, message: 'Warm introduction request received', creditsCharged: credits });
  } catch (error: any) {
    console.error('Warm intro request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ambassador introduction request endpoint
app.post('/api/officers/:id/ambassador-intro-request', async (req, res) => {
  try {
    const { id: officerId } = req.params;
    const { name, email, companyName, proposal, preferredContact } = req.body;

    // Get the authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Get user's company_id
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      return res.status(400).json({ error: 'Company not found' });
    }

    // Get officer/ambassador info
    const { data: officer } = await supabaseAdmin
      .from('chapter_officers')
      .select(`
        *,
        chapters (
          chapter_name,
          universities (name),
          greek_organizations (name)
        )
      `)
      .eq('id', officerId)
      .single();

    if (!officer) {
      return res.status(404).json({ error: 'Ambassador not found' });
    }

    // Ambassador introduction costs 25 credits ($7.49)
    const credits = 25;
    const dollarValue = 7.49;

    // Deduct credits for the introduction request
    const { data: transactionId, error: deductError } = await supabaseAdmin.rpc('deduct_credits', {
      p_company_id: profile.company_id,
      p_credits: credits,
      p_dollars: dollarValue,
      p_transaction_type: 'ambassador_introduction',
      p_description: `Ambassador introduction request: ${officer.first_name} ${officer.last_name}`,
      p_chapter_id: officer.chapter_id
    });

    if (deductError) {
      console.error('Error deducting credits:', deductError);
      return res.status(400).json({ error: 'Insufficient credits or failed to process payment' });
    }

    console.log(`💳 Ambassador introduction requested - ${credits} credits deducted from company ${profile.company_id}`);

    // Log activity
    const chapterInfo = officer.chapters as any;
    await supabaseAdmin.rpc('log_admin_activity', {
      p_event_type: 'ambassador_intro_request',
      p_event_title: `Ambassador intro requested: ${officer.first_name} ${officer.last_name}`,
      p_event_description: `${companyName} requested introduction to ${officer.first_name} ${officer.last_name} (${chapterInfo?.chapter_name})`,
      p_company_id: user.id,
      p_company_name: companyName,
      p_reference_id: officerId,
      p_reference_type: 'officer',
      p_metadata: {
        name,
        email,
        companyName,
        proposal,
        preferredContact,
        officerName: `${officer.first_name} ${officer.last_name}`,
        position: officer.position,
        chapterName: chapterInfo?.chapter_name,
        organizationName: chapterInfo?.greek_organizations?.name,
        universityName: chapterInfo?.universities?.name,
        creditsCharged: credits
      }
    });

    res.json({ success: true, message: 'Ambassador introduction request received', creditsCharged: credits });
  } catch (error: any) {
    console.error('Ambassador intro request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ambassador profile unlock endpoint
app.post('/api/ambassadors/:id/unlock', async (req, res) => {
  try {
    const { id: ambassadorId } = req.params;

    // Get the authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Get user's company_id
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      return res.status(400).json({ error: 'Company not found' });
    }

    // Check if already unlocked
    const { data: existingUnlock } = await supabaseAdmin
      .from('ambassador_unlocks')
      .select('id')
      .eq('company_id', profile.company_id)
      .eq('officer_id', ambassadorId)
      .single();

    if (existingUnlock) {
      return res.status(400).json({ error: 'Ambassador already unlocked' });
    }

    // Check subscription tier for enterprise access
    const { data: accountBalance } = await supabaseAdmin
      .from('account_balance')
      .select('subscription_tier')
      .eq('company_id', profile.company_id)
      .single();

    // Enterprise tier gets free ambassador unlocks
    if (accountBalance?.subscription_tier === 'enterprise') {
      // Create unlock record without charging
      const { error: unlockError } = await supabaseAdmin
        .from('ambassador_unlocks')
        .insert({
          company_id: profile.company_id,
          officer_id: ambassadorId,
          unlock_type: 'full_profile',
          credits_spent: 0,
          amount_paid: 0.00
        });

      if (unlockError) {
        console.error('Error creating unlock:', unlockError);
        return res.status(500).json({ error: 'Failed to unlock ambassador' });
      }

      console.log(`✨ Enterprise tier - Free ambassador unlock for company ${profile.company_id}`);
      return res.json({ success: true, message: 'Ambassador unlocked (Enterprise)', creditsCharged: 0 });
    }

    // Non-enterprise: charge 50 credits
    const credits = 50;
    const dollarValue = 14.99;

    // Get ambassador info for description
    const { data: ambassador } = await supabaseAdmin
      .from('chapter_officers')
      .select('first_name, last_name')
      .eq('id', ambassadorId)
      .single();

    // Deduct credits
    const { data: transactionId, error: deductError } = await supabaseAdmin.rpc('deduct_credits', {
      p_company_id: profile.company_id,
      p_credits: credits,
      p_dollars: dollarValue,
      p_transaction_type: 'ambassador_unlock',
      p_description: `Unlocked ambassador profile: ${ambassador?.first_name} ${ambassador?.last_name}`,
      p_chapter_id: null
    });

    if (deductError) {
      console.error('Error deducting credits:', deductError);
      return res.status(400).json({ error: 'Insufficient credits or failed to process payment' });
    }

    // Create unlock record
    const { error: unlockError } = await supabaseAdmin
      .from('ambassador_unlocks')
      .insert({
        company_id: profile.company_id,
        officer_id: ambassadorId,
        unlock_type: 'full_profile',
        credits_spent: credits,
        amount_paid: dollarValue,
        transaction_id: transactionId
      });

    if (unlockError) {
      console.error('Error creating unlock:', unlockError);
      return res.status(500).json({ error: 'Failed to create unlock record' });
    }

    console.log(`💳 Ambassador unlocked - ${credits} credits deducted from company ${profile.company_id}`);

    res.json({ success: true, message: 'Ambassador profile unlocked', creditsCharged: credits });
  } catch (error: any) {
    console.error('Ambassador unlock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Activity Feed endpoint (private - all events)
app.get('/api/admin/activity-feed', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const eventType = req.query.eventType as string;

    let query = supabaseAdmin
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (eventType && eventType !== 'all') {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activity feed:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in activity feed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Public Activity Feed endpoint (new chapters and roster uploads only)
app.get('/api/activity-feed/public', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const { data, error } = await supabaseAdmin
      .from('admin_activity_log')
      .select('*')
      .in('event_type', ['new_chapter', 'admin_upload'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching public activity feed:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in public activity feed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CSV Upload endpoint for chapter rosters
app.post('/api/admin/chapters/:chapterId/upload-roster', requireAdmin, upload.single('csv'), async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No CSV file uploaded' });
    }

    // Verify chapter exists
    const { data: rosterChapter, error: chapterError } = await supabaseAdmin
      .from('chapters')
      .select(`
        id,
        chapter_name,
        universities (id, name),
        greek_organizations (id, name)
      `)
      .eq('id', chapterId)
      .single();

    if (chapterError || !rosterChapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    // Parse CSV
    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Array<Record<string, string>>;

    console.log(`📁 Uploading ${records.length} members for chapter: ${rosterChapter.chapter_name}`);

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Process each record
    for (const record of records) {
      try {
        // Validate required fields
        if (!record.name || record.name.trim() === '') {
          skippedCount++;
          errors.push(`Skipped row: missing name`);
          continue;
        }

        // Prepare member data
        const memberData = {
          chapter_id: chapterId,
          name: record.name.trim(),
          position: record.position?.trim() || null,
          email: record.email?.trim() || null,
          phone: record.phone?.trim() || null,
          linkedin_url: record.linkedin?.trim() || null,
          graduation_year: record.graduation_year ? parseInt(record.graduation_year) : null,
          major: record.major?.trim() || null,
          member_type: record.member_type?.trim() || 'member',
          is_primary_contact: record.is_primary_contact === 'true',
          updated_at: new Date().toISOString()
        };

        // Upsert (insert or update if email already exists for this chapter)
        if (memberData.email) {
          // Check if member exists with this email in this chapter
          const { data: existing } = await supabaseAdmin
            .from('chapter_members')
            .select('id')
            .eq('chapter_id', chapterId)
            .eq('email', memberData.email)
            .single();

          if (existing) {
            // Update existing
            const { error: updateError } = await supabaseAdmin
              .from('chapter_members')
              .update(memberData)
              .eq('id', existing.id);

            if (updateError) {
              errors.push(`Error updating ${memberData.name}: ${updateError.message}`);
              skippedCount++;
            } else {
              updatedCount++;
            }
          } else {
            // Insert new
            const { error: insertError } = await supabaseAdmin
              .from('chapter_members')
              .insert(memberData);

            if (insertError) {
              errors.push(`Error inserting ${memberData.name}: ${insertError.message}`);
              skippedCount++;
            } else {
              insertedCount++;
            }
          }
        } else {
          // No email - just insert (can't check for duplicates)
          const { error: insertError } = await supabaseAdmin
            .from('chapter_members')
            .insert(memberData);

          if (insertError) {
            errors.push(`Error inserting ${memberData.name}: ${insertError.message}`);
            skippedCount++;
          } else {
            insertedCount++;
          }
        }
      } catch (recordError: any) {
        errors.push(`Error processing ${record.name}: ${recordError.message}`);
        skippedCount++;
      }
    }

    console.log(`✅ Roster upload complete: ${insertedCount} inserted, ${updatedCount} updated, ${skippedCount} skipped`);

    // Log activity
    await supabaseAdmin.rpc('log_admin_activity', {
      p_event_type: 'admin_upload',
      p_event_title: `Roster uploaded: ${rosterChapter.chapter_name}`,
      p_event_description: `${insertedCount} members inserted, ${updatedCount} updated`,
      p_reference_id: chapterId,
      p_reference_type: 'chapter',
      p_metadata: {
        totalRecords: records.length,
        insertedCount,
        updatedCount,
        skippedCount,
        chapterName: rosterChapter.chapter_name,
        universityName: (rosterChapter as any).universities?.name,
        greekOrgName: (rosterChapter as any).greek_organizations?.name
      }
    });

    res.json({
      success: true,
      chapterId,
      chapterName: rosterChapter.chapter_name,
      totalRecords: records.length,
      insertedCount,
      updatedCount,
      skippedCount,
      errors: errors.slice(0, 10) // Return first 10 errors only
    });

  } catch (error: any) {
    console.error('Error uploading roster CSV:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server (only in development, not in Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
    console.log(`📧 Admin email: ${ADMIN_EMAIL}`);
    console.log(`📤 From email: ${FROM_EMAIL}`);
    console.log('\nEndpoints:');
    console.log(`  POST   /api/signup - Process new signups`);
    console.log(`  POST   /api/waitlist - Join waitlist with email notifications 📧`);
    console.log(`  GET    /api/admin/signups - Get all signups (admin)`);
    console.log(`  PATCH  /api/admin/signups/:id - Update signup status (admin)`);
    console.log(`  GET    /api/admin/analytics/* - Admin analytics endpoints`);
    console.log(`  \n  🔧 ADMIN DATA MANAGEMENT:`);
    console.log(`  GET                  /api/admin/companies`);
    console.log(`  GET/POST/PUT/DELETE  /api/admin/greek-organizations`);
    console.log(`  GET/POST/PUT/DELETE  /api/admin/universities`);
    console.log(`  GET/POST/PUT/DELETE  /api/admin/chapters`);
    console.log(`  POST                 /api/admin/chapters/:id/upload-roster 📁`);
    console.log(`  GET/POST/PUT/DELETE  /api/admin/officers`);
    console.log(`  POST                 /api/admin/upload-image`);
    console.log(`  GET                  /api/admin/ai-status 🤖`);
    console.log(`  POST                 /api/admin/ai-assist 🤖`);
  });
}

// Export for Vercel serverless
export default app;
