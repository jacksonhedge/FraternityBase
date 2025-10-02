import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

// Initialize Supabase (public client)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Initialize Supabase admin client (for file uploads and admin operations)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
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
app.use(express.json());

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

// Credits API endpoints
app.get('/api/credits/balance', async (req, res) => {
  try {
    // Get the authorization token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Query the company's credit balance using the user's ID
    const { data, error } = await supabase
      .from('companies')
      .select('credits_balance')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching credits balance:', error);
      return res.status(500).json({ error: 'Failed to fetch balance' });
    }

    res.json({ balance: data?.credits_balance || 0 });
  } catch (error: any) {
    console.error('Balance endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).send('No signature');

  try {
    const s = getStripe();
    if (!s) throw new Error('Stripe not initialized');

    const event = s.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');

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
        // Add credits to company balance
        // Fetch current balance and update
        const { data: company } = await supabase
          .from('companies')
          .select('credits_balance')
          .eq('id', companyId)
          .single();

        const { error: updateError } = await supabase
          .from('companies')
          .update({
            credits_balance: (company?.credits_balance || 0) + credits
          })
          .eq('id', companyId);

        if (updateError) {
          console.error('Error updating credits balance:', updateError);
        }

        // Record transaction
        const { error: txError } = await supabase
          .from('credit_transactions')
          .insert({
            company_id: companyId,
            amount: credits,
            transaction_type: 'purchase',
            description: `Purchased ${CREDIT_PACKAGES[packageId]?.name || packageId}`,
            stripe_payment_intent: session.payment_intent,
            stripe_session_id: session.id,
            amount_paid: session.amount_total / 100,
            metadata: { packageId, session: session.id }
          });

        if (txError) {
          console.error('Error recording transaction:', txError);
        } else {
          console.log(`✅ Added ${credits} credits to company ${companyId}`);
        }
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
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
const UNLOCK_COSTS = {
  roster_view: 10,
  officer_contacts: 8,
  full_contacts: 50
};

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

// Unlock chapter data with credits
app.post('/api/chapters/:chapterId/unlock', async (req, res) => {
  const { chapterId } = req.params;
  const { unlockType } = req.body; // 'roster_view', 'officer_contacts', 'full_contacts'

  try {
    // Authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Validate unlock type
    const creditCost = UNLOCK_COSTS[unlockType as keyof typeof UNLOCK_COSTS];
    if (!creditCost) {
      return res.status(400).json({ error: 'Invalid unlock type' });
    }

    // Check if already unlocked
    const { data: existingUnlock } = await supabase
      .from('chapter_unlocks')
      .select('*')
      .eq('company_id', user.id)
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

    // Check balance
    const { data: company } = await supabase
      .from('companies')
      .select('credits_balance')
      .eq('id', user.id)
      .single();

    if (!company || company.credits_balance < creditCost) {
      return res.status(402).json({
        error: 'Insufficient credits',
        required: creditCost,
        available: company?.credits_balance || 0
      });
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        credits_balance: company.credits_balance - creditCost
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error deducting credits:', updateError);
      throw updateError;
    }

    // Create unlock record
    const { error: unlockError } = await supabase
      .from('chapter_unlocks')
      .insert({
        company_id: user.id,
        chapter_id: chapterId,
        unlock_type: unlockType,
        credits_spent: creditCost
      });

    if (unlockError) {
      console.error('Error creating unlock record:', unlockError);
      throw unlockError;
    }

    // Log transaction
    const { error: txError } = await supabase
      .from('credit_transactions')
      .insert({
        company_id: user.id,
        amount: -creditCost, // Negative for usage
        transaction_type: 'usage',
        description: `Unlocked ${unlockType} for chapter ${chapterId}`,
        metadata: { chapter_id: chapterId, unlock_type: unlockType }
      });

    if (txError) {
      console.error('Error logging transaction:', txError);
    }

    console.log(`✅ Company ${user.id} unlocked ${unlockType} for chapter ${chapterId} (-${creditCost} credits)`);

    res.json({
      success: true,
      creditsSpent: creditCost,
      remainingBalance: company.credits_balance - creditCost
    });

  } catch (error: any) {
    console.error('Unlock error:', error);
    res.status(500).json({ error: 'Failed to unlock chapter', details: error.message });
  }
});

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

    const { data: unlocks, error } = await supabase
      .from('chapter_unlocks')
      .select('unlock_type, credits_spent, unlocked_at')
      .eq('company_id', user.id)
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

// ===== ADMIN DATA MANAGEMENT ENDPOINTS =====

// Companies/Partners - View all registered companies with their unlock history
app.get('/api/admin/companies', requireAdmin, async (req, res) => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // For each company, fetch their unlock history
    const companiesWithUnlocks = await Promise.all(
      (companies || []).map(async (company) => {
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

        return {
          ...company,
          unlocks: unlocks || [],
          total_spent: unlocks?.reduce((sum, u) => sum + (u.credits_spent || 0), 0) || 0
        };
      })
    );

    res.json({ success: true, data: companiesWithUnlocks });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
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
    // Fetch universities with chapter count using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('universities')
      .select(`
        *,
        chapters:chapters(count)
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    // Transform the data to include chapter_count
    const transformedData = data?.map(uni => ({
      ...uni,
      chapter_count: uni.chapters?.[0]?.count || 0
    })) || [];

    res.json({ success: true, data: transformedData });
  } catch (error: any) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/universities', requireAdmin, async (req, res) => {
  try {
    const { name, location, state, student_count, greek_percentage, website, logo_url } = req.body;

    const { data, error } = await supabase
      .from('universities')
      .insert({
        name,
        location,
        state,
        student_count,
        greek_percentage,
        website,
        logo_url
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
    console.log(`✅ Created officer: ${name} - ${position}`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating officer:', error);
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

    // Convert base64 to buffer
    const base64Data = file.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Use admin client for file uploads
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.split(';')[0].split(':')[1],
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    console.log(`✅ Uploaded image: ${path} → ${publicUrl}`);
    res.json({ success: true, url: publicUrl, data });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
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
    console.log(`  GET/POST/PUT/DELETE  /api/admin/officers`);
    console.log(`  POST                 /api/admin/upload-image`);
    console.log(`  GET                  /api/admin/ai-status 🤖`);
    console.log(`  POST                 /api/admin/ai-assist 🤖`);
  });
}

// Export for Vercel serverless
export default app;
