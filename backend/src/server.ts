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
import roadmapRouter from './routes/roadmap';
import adminNotificationsRouter from './routes/adminNotifications';
import aiRouter from './routes/ai';
// TEMPORARILY DISABLED - shares router needs PostgreSQL pool that doesn't exist yet
// import sharesRouter from './routes/shares';
import CreditNotificationService from './services/CreditNotificationService';
import AdminNotificationService from './services/AdminNotificationService';
import DailyReportService from './services/DailyReportService';
import { EnhancedDailyReportService } from './services/EnhancedDailyReportService';
import { fetchInstagramData, getInstagramHandle } from './utils/instagram';
import { slack } from './utils/slackNotifier';

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

// Initialize Admin Notification Service
let adminNotificationService: AdminNotificationService | null = null;
function getAdminNotificationService(): AdminNotificationService {
  if (!adminNotificationService) {
    adminNotificationService = new AdminNotificationService(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    console.log('✅ Admin Notification Service initialized');
  }
  return adminNotificationService;
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://fraternitybase.com',
      'https://www.fraternitybase.com'
    ];

    // Allow all Vercel preview deployments for frontend
    const isVercelPreview = origin && origin.match(/^https:\/\/frontend-[a-z0-9]+-jackson-fitzgeralds-projects\.vercel\.app$/);

    if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Stripe webhook needs raw body for signature verification
app.use('/api/credits/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());

// Auth verification endpoint - verifies token and returns user data
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: 'Invalid token',
        details: authError?.message || 'User not found'
      });
    }

    // Get user's profile and company information
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select(`
        company_id,
        role,
        companies (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Return user data in the format expected by the frontend
    const companyData = profile.companies as any;
    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        firstName: user.user_metadata?.firstName || user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.lastName || user.user_metadata?.last_name || '',
        company: companyData ? {
          id: companyData.id,
          name: companyData.name
        } : undefined,
        companyId: profile.company_id,
        companyName: companyData?.name,
        role: profile.role || 'user'
      }
    });
  } catch (error) {
    console.error('❌ Auth verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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

    // Verify the token with Supabase using the same client that issued it
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('👤 User verification:', user ? `User ID: ${user.id}` : 'NO USER');
    console.log('⚠️ Auth error:', authError ? authError.message : 'No error');

    if (authError || !user) {
      console.log('❌ Invalid token or user not found');
      console.log('❌ Auth error details:', JSON.stringify(authError));
      return res.status(401).json({
        error: 'Invalid token or user not found',
        details: authError?.message || 'User not found'
      });
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

    // Create admin client for database queries to bypass RLS
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Query the new account_balance table using service_role to bypass RLS
    const { data: balanceRows, error } = await supabaseAdmin
      .from('account_balance')
      .select(`
        balance_credits,
        balance_dollars,
        lifetime_spent_credits,
        lifetime_spent_dollars,
        lifetime_earned_credits,
        lifetime_added_dollars,
        subscription_tier,
        subscription_status,
        subscription_current_period_end,
        subscription_started_at,
        last_monthly_credit_grant_at,
        unlocks_5_star_remaining,
        unlocks_4_star_remaining,
        unlocks_3_star_remaining,
        monthly_unlocks_5_star,
        monthly_unlocks_4_star,
        monthly_unlocks_3_star,
        warm_intros_remaining,
        monthly_warm_intros,
        max_team_seats,
        auto_reload_enabled,
        auto_reload_threshold,
        auto_reload_amount,
        company_id
      `)
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .limit(1);

    const data = balanceRows?.[0] || null;

    // Fetch company info separately
    let companyData = null;
    if (data && profile.company_id) {
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .select('id, name, created_at')
        .eq('id', profile.company_id)
        .single();

      if (companyError) {
        console.error('⚠️ Error fetching company info:', companyError);
      } else {
        companyData = company;
      }
    }

    // Get current team member count
    let currentTeamCount = 0;
    if (profile.company_id) {
      const { count } = await supabaseAdmin
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id);
      currentTeamCount = count || 0;
    }

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
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        error: 'Failed to fetch balance',
        message: error.message,
        code: error.code,
        details: error.details || error.hint
      });
    }

    // Calculate if warm intros are available for monthly tier (first 3 months only)
    let warmIntrosAvailable = data?.warm_intros_remaining || 0;
    let warmIntroExpiry = null;

    if (data?.subscription_tier === 'monthly' && data?.subscription_started_at) {
      const startDate = new Date(data.subscription_started_at);
      const threeMonthsLater = new Date(startDate);
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      warmIntroExpiry = threeMonthsLater.toISOString();

      const monthsElapsed = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsElapsed > 3) {
        warmIntrosAvailable = 0; // Expired
      }
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
      subscriptionStatus: data?.subscription_status || null,
      subscriptionPeriodEnd: data?.subscription_current_period_end || null,
      subscriptionStartedAt: data?.subscription_started_at || null,
      lastMonthlyGrant: data?.last_monthly_credit_grant_at || null,
      companyName: companyData?.name || null,
      companyId: companyData?.id || profile.company_id || null,
      companyCreatedAt: companyData?.created_at || null,
      // Tier-specific unlock allowances
      unlocks: {
        fiveStar: {
          remaining: data?.unlocks_5_star_remaining || 0,
          monthly: data?.monthly_unlocks_5_star || 0,
          isUnlimited: data?.unlocks_5_star_remaining === -1
        },
        fourStar: {
          remaining: data?.unlocks_4_star_remaining || 0,
          monthly: data?.monthly_unlocks_4_star || 0,
          isUnlimited: data?.unlocks_4_star_remaining === -1
        },
        threeStar: {
          remaining: data?.unlocks_3_star_remaining || 0,
          monthly: data?.monthly_unlocks_3_star || 0,
          isUnlimited: data?.unlocks_3_star_remaining === -1
        }
      },
      warmIntros: {
        remaining: warmIntrosAvailable,
        monthly: data?.monthly_warm_intros || 0,
        expiresAt: warmIntroExpiry // For monthly tier only
      },
      team: {
        currentSeats: currentTeamCount,
        maxSeats: data?.max_team_seats || 1,
        available: (data?.max_team_seats || 1) - currentTeamCount
      },
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
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
});

// Team members endpoint
app.get('/api/team/members', async (req, res) => {
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

    // Get user's profile to find company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return res.status(404).json({ error: 'User profile or company not found' });
    }

    // Get all team members for this company using service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: teamMembers, error: teamError } = await supabaseAdmin
      .from('team_members')
      .select('id, member_number, role, status, joined_at, user_id')
      .eq('company_id', profile.company_id)
      .order('member_number', { ascending: true });

    if (teamError) {
      console.error('Error fetching team members:', teamError);
      return res.status(500).json({ error: 'Failed to fetch team members' });
    }

    // For each team member, get their user profile and email
    const membersWithProfiles = await Promise.all(
      (teamMembers || []).map(async (member) => {
        // Get user profile
        const { data: userProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('user_id', member.user_id)
          .single();

        // Get email from auth.users using admin client
        const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(member.user_id);

        return {
          id: member.id,
          member_number: member.member_number,
          role: member.role,
          status: member.status,
          joined_at: member.joined_at,
          user_profiles: {
            first_name: userProfile?.first_name || null,
            last_name: userProfile?.last_name || null,
            email: authUser?.email || null
          }
        };
      })
    );

    res.json(membersWithProfiles);
  } catch (error: any) {
    console.error('Team members endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/team/invite - Invite a team member
app.post('/api/team/invite', async (req, res) => {
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

    // Get user's profile to find company_id and verify they're admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return res.status(404).json({ error: 'User profile or company not found' });
    }

    // Check if user is admin (only admins can invite)
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('company_id', profile.company_id)
      .eq('user_id', user.id)
      .single();

    if (!teamMember || (teamMember.role !== 'admin' && teamMember.role !== 'owner')) {
      return res.status(403).json({ error: 'Only admins can invite team members' });
    }

    const { email, role, firstName, lastName } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "admin" or "member"' });
    }

    // Check team size limit (max 3 members)
    const { data: existingMembers, error: countError } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('company_id', profile.company_id);

    if (countError) {
      console.error('Error counting team members:', countError);
      return res.status(500).json({ error: 'Failed to check team size' });
    }

    if (existingMembers && existingMembers.length >= 3) {
      return res.status(400).json({ error: 'Team is full. Maximum 3 members allowed.' });
    }

    // Check if user already exists with this email
    const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingAuth.users.find(u => u.email === email);

    let invitedUserId: string;

    if (existingUser) {
      // User already has an account
      invitedUserId = existingUser.id;

      // Check if they're already a team member of this company
      const { data: existingTeamMember } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('company_id', profile.company_id)
        .eq('user_id', invitedUserId)
        .single();

      if (existingTeamMember) {
        return res.status(400).json({ error: 'This user is already a member of your team' });
      }
    } else {
      // Create new user via Supabase Auth invite
      const { data: newUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
      });

      if (inviteError || !newUser.user) {
        console.error('Failed to invite user:', inviteError);
        return res.status(500).json({ error: 'Failed to send invitation email' });
      }

      invitedUserId = newUser.user.id;
    }

    // Get the next member number
    const nextMemberNumber = (existingMembers?.length || 0) + 1;

    // Create team_member record with pending status
    const { data: newTeamMember, error: teamMemberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        company_id: profile.company_id,
        user_id: invitedUserId,
        member_number: nextMemberNumber,
        role: role,
        status: 'pending',
        invited_by: user.id,
        first_name: firstName || null,
        last_name: lastName || null
      })
      .select()
      .single();

    if (teamMemberError) {
      console.error('Error creating team member:', teamMemberError);
      return res.status(500).json({ error: 'Failed to create team member record' });
    }

    // Get company name for the email
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('name')
      .eq('id', profile.company_id)
      .single();

    console.log(`✅ Team member invited: ${email} as team member #${nextMemberNumber} for company ${company?.name || profile.company_id}`);

    res.json({
      success: true,
      message: 'Team member invited successfully',
      teamMember: {
        id: newTeamMember.id,
        email: email,
        role: role,
        member_number: nextMemberNumber,
        status: 'pending'
      }
    });
  } catch (error: any) {
    console.error('Team invite endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/team/resend-invite - Resend invitation to a pending team member
app.post('/api/team/resend-invite', async (req, res) => {
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

    // Get user's profile to find company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return res.status(404).json({ error: 'User profile or company not found' });
    }

    // Check if user is admin (only admins can resend invites)
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('company_id', profile.company_id)
      .eq('user_id', user.id)
      .single();

    if (!teamMember || (teamMember.role !== 'admin' && teamMember.role !== 'owner')) {
      return res.status(403).json({ error: 'Only admins can resend invitations' });
    }

    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: 'Member ID is required' });
    }

    // Get the team member to resend invitation to
    const { data: targetMember, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('user_id, status, role')
      .eq('id', memberId)
      .eq('company_id', profile.company_id)
      .single();

    if (memberError || !targetMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    if (targetMember.status !== 'pending') {
      return res.status(400).json({ error: 'Can only resend invitations to pending members' });
    }

    // Get user email from auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const targetAuthUser = authUsers.users.find(u => u.id === targetMember.user_id);

    if (!targetAuthUser || !targetAuthUser.email) {
      return res.status(404).json({ error: 'User email not found' });
    }

    // Check if user has already confirmed their email
    const isConfirmed = targetAuthUser.email_confirmed_at !== null;

    if (isConfirmed) {
      // User already confirmed - just notify them they have a pending team invitation
      // For now, we'll just return success without sending another Supabase invite
      console.log(`✅ User ${targetAuthUser.email} already confirmed. Pending team invitation exists.`);

      res.json({
        success: true,
        message: 'User has already created their account. They can log in to accept the team invitation.',
        email: targetAuthUser.email,
        alreadyConfirmed: true
      });
    } else {
      // User hasn't confirmed yet - resend the Supabase invitation
      const { error: resendError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        targetAuthUser.email,
        {
          redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
        }
      );

      if (resendError) {
        console.error('Failed to resend invitation:', resendError);
        return res.status(500).json({ error: 'Failed to resend invitation email' });
      }

      console.log(`✅ Invitation resent to: ${targetAuthUser.email}`);

      res.json({
        success: true,
        message: 'Invitation email resent successfully',
        email: targetAuthUser.email,
        alreadyConfirmed: false
      });
    }
  } catch (error: any) {
    console.error('Resend invite endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/team/remove - Remove a team member
app.post('/api/team/remove', async (req, res) => {
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

    // Get user's profile to find company_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return res.status(404).json({ error: 'User profile or company not found' });
    }

    // Check if user is admin (only admins can remove members)
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('company_id', profile.company_id)
      .eq('user_id', user.id)
      .single();

    if (!teamMember || (teamMember.role !== 'admin' && teamMember.role !== 'owner')) {
      return res.status(403).json({ error: 'Only admins can remove team members' });
    }

    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: 'Member ID is required' });
    }

    // Get the team member to remove
    const { data: targetMember, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('user_id, member_number, role')
      .eq('id', memberId)
      .eq('company_id', profile.company_id)
      .single();

    if (memberError || !targetMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Prevent removing member #1 (owner)
    if (targetMember.member_number === 1) {
      return res.status(400).json({ error: 'Cannot remove the team owner (member #1)' });
    }

    // Delete the team member record
    const { error: deleteError } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('company_id', profile.company_id);

    if (deleteError) {
      console.error('Error removing team member:', deleteError);
      return res.status(500).json({ error: 'Failed to remove team member' });
    }

    console.log(`✅ Team member removed: member_number=${targetMember.member_number} from company ${profile.company_id}`);

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error: any) {
    console.error('Remove team member endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
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
app.use('/api/roadmap', roadmapRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin/notifications', adminNotificationsRouter);
// TEMPORARILY DISABLED - shares router needs PostgreSQL pool
// app.use('/api/shares', sharesRouter);

// Admin authentication middleware (temporarily disabled for debugging)
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminToken = req.headers['x-admin-token'];
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

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

// Wizard Admin middleware - checks if user is a platform super admin
const checkWizardAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // Check for admin token first (for admin panel compatibility)
    const adminToken = req.headers['x-admin-token'];
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

    if (adminToken && adminToken === ADMIN_TOKEN) {
      // Admin token is valid - check wizard status for the admin email
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jacksonfitzgerald25@gmail.com';

      const { data: adminUser } = await supabaseAdmin.auth.admin.listUsers();
      const user = adminUser?.users?.find(u => u.email === ADMIN_EMAIL);

      if (user) {
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('is_wizard_admin')
          .eq('user_id', user.id)
          .single();

        if (profile?.is_wizard_admin) {
          console.log('✅ Wizard admin auth via admin token:', ADMIN_EMAIL);
          (req as any).wizardUser = user;
          return next();
        }
      }
      return res.status(403).json({ error: 'Forbidden: Wizard admin access required' });
    }

    // Fall back to Supabase Bearer token auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Check if user is wizard admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_wizard_admin')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.is_wizard_admin) {
      return res.status(403).json({ error: 'Forbidden: Wizard admin access required' });
    }

    // Attach user to request for downstream use
    (req as any).wizardUser = user;
    next();
  } catch (error: any) {
    console.error('Wizard admin auth error:', error);
    res.status(500).json({ error: error.message });
  }
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
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      console.error('Profile fetch error:', profileError);
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Query all unlocks for this company with chapter details
    const { data, error } = await supabaseAdmin
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
          five_star_rating,
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
      .eq('company_id', profile.company_id);

    if (error) {
      console.error('Error fetching unlocked chapters:', error);
      return res.status(500).json({ error: 'Failed to fetch unlocked chapters' });
    }

    // Filter out expired unlocks (if expires_at is set and in the past)
    const validUnlocks = data?.filter(unlock =>
      !unlock.expires_at || new Date(unlock.expires_at) > new Date()
    ) || [];

    // Group by chapter
    const chaptersMap = new Map();
    validUnlocks.forEach((unlock: any) => {
      const chapterId = unlock.chapter_id;
      if (!chaptersMap.has(chapterId)) {
        chaptersMap.set(chapterId, {
          id: chapterId,
          name: unlock.chapters?.greek_organizations?.name || 'Unknown',
          chapter: unlock.chapters?.chapter_name || '',
          university: unlock.chapters?.universities?.name || 'Unknown University',
          state: unlock.chapters?.universities?.state || '',
          memberCount: unlock.chapters?.member_count || 0,
          chapterScore: unlock.chapters?.five_star_rating || null,
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

// Get greek organizations with real chapter counts
app.get('/api/greek-organizations', async (req, res) => {
  try {
    // Get all greek organizations
    const { data: orgs, error: orgsError } = await supabaseAdmin
      .from('greek_organizations')
      .select('*')
      .order('name', { ascending: true });

    if (orgsError) {
      console.error('Error fetching greek organizations:', orgsError);
      return res.status(500).json({ error: 'Failed to fetch greek organizations' });
    }

    // Get chapter counts for each organization
    const orgsWithCounts = await Promise.all(
      (orgs || []).map(async (org: any) => {
        const { count } = await supabaseAdmin
          .from('chapters')
          .select('*', { count: 'exact', head: true })
          .eq('greek_organization_id', org.id);

        return {
          ...org,
          chapter_count: count || 0
        };
      })
    );

    res.json({
      success: true,
      data: orgsWithCounts
    });
  } catch (error: any) {
    console.error('Greek organizations endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get 20 newest chapters for tickertape
app.get('/api/chapters/recent', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .select(`
        id,
        chapter_name,
        created_at,
        greek_organizations (
          name,
          greek_letters
        ),
        universities (
          name,
          state
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching recent chapters:', error);
      return res.status(500).json({ error: 'Failed to fetch recent chapters' });
    }

    // Format for tickertape
    const formattedChapters = data.map((chapter: any) => ({
      id: chapter.id,
      universityName: chapter.universities?.name || 'Unknown University',
      greekOrgName: chapter.greek_organizations?.name || 'Unknown Organization',
      greekLetters: chapter.greek_organizations?.greek_letters || '',
      chapterName: chapter.chapter_name,
      event_type: 'new_chapter',
      created_at: chapter.created_at
    }));

    res.json({
      success: true,
      data: formattedChapters
    });
  } catch (error: any) {
    console.error('Recent chapters endpoint error:', error);
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

    // Fetch officers from chapter_officers table
    const { data: officers, error: officersError } = await supabaseAdmin
      .from('chapter_officers')
      .select('*')
      .eq('chapter_id', id)
      .order('position', { ascending: true });

    // Fetch regular members from chapter_members table
    const { data: regularMembers, error: membersError } = await supabaseAdmin
      .from('chapter_members')
      .select('*')
      .eq('chapter_id', id)
      .order('name', { ascending: true });

    if (officersError && membersError) {
      console.error('Error fetching chapter data:', { officersError, membersError });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch members'
      });
    }

    // Combine officers and members
    const allMembers = [
      ...(officers || []).map(o => ({ ...o, type: 'officer' })),
      ...(regularMembers || []).map(m => ({ ...m, type: 'member' }))
    ];

    res.json({ success: true, data: allMembers, officers: officers || [], regularMembers: regularMembers || [] });
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
  console.log('🚀 === UNLOCK ENDPOINT HIT ===');
  console.log('📍 Method:', req.method);
  console.log('📍 URL:', req.url);
  console.log('📍 Params:', req.params);
  console.log('📍 Body:', req.body);
  console.log('📍 Headers:', {
    contentType: req.headers['content-type'],
    authorization: req.headers.authorization?.substring(0, 30) + '...'
  });

  try {
    const { id: chapterId } = req.params;
    const { unlockType } = req.body;

    console.log('🔑 Extracted data:', { chapterId, unlockType });

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

    // Support 'full' and 'warm_introduction' unlock types
    if (unlockType !== 'full' && unlockType !== 'warm_introduction') {
      return res.status(400).json({
        error: 'Invalid unlock type',
        message: 'Please use unlock type "full" or "warm_introduction"'
      });
    }

    // Get chapter to check if it's a 5-star unlock and platinum status
    console.log(`🔓 Unlock request for chapter: ${chapterId}`);
    const { data: chapterData, error: chapterError } = await supabaseAdmin
      .from('chapters')
      .select('grade, five_star_rating, chapter_name, is_platinum, universities(name)')
      .eq('id', chapterId)
      .single();

    console.log(`📊 Chapter query result:`, { chapterData, chapterError });

    if (chapterError || !chapterData) {
      console.log(`❌ Chapter not found: ${chapterId}`, chapterError);
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Get user's company_id from user_profiles FIRST
    console.log(`👤 Fetching user profile for user ID: ${user.id}`);
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    console.log(`🏢 Profile fetched:`, { profile, profileError });

    if (profileError || !profile?.company_id) {
      console.log(`❌ User profile not found`);
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get subscription tier to determine pricing
    const { data: accountBalance } = await supabaseAdmin
      .from('account_balance')
      .select('subscription_tier')
      .eq('company_id', profile.company_id)
      .single();

    const isEnterprise = accountBalance?.subscription_tier === 'enterprise';

    // Determine credits cost based on unlock type
    const rank = parseFloat(chapterData.grade) || 0;
    const is5Star = rank >= 5.0;
    const isPlatinum = chapterData.is_platinum || false;
    let credits = 1; // Default for lowest-ranked chapters
    let dollarValue = 0.99;

    if (unlockType === 'warm_introduction') {
      // Special pricing for warm introductions
      if (isPlatinum) {
        // Platinum chapters - 20 credits
        credits = 20;
        dollarValue = 19.99;
        console.log(`💎 Platinum warm introduction pricing: ${credits} credits ($${dollarValue})`);
      } else {
        // Regular chapters - 100 credits
        credits = 100;
        dollarValue = 99.99;
        console.log(`🤝 Standard warm introduction pricing: ${credits} credits ($${dollarValue})`);
      }
    } else {
      // Full unlock - Behavioral Economics Pricing based on rating
      // Higher rank = more expensive (better chapters cost more)
      if (rank >= 5.0) {
        // 5.0 star chapter - Premium tier
        // Enterprise gets 50% off (5 credits vs 10)
        credits = isEnterprise ? 5 : 10;
        dollarValue = isEnterprise ? 4.99 : 9.99;
        console.log(`💰 5.0⭐ Premium unlock: ${credits} credits ($${dollarValue}) ${isEnterprise ? '[Enterprise 50% off]' : ''}`);
      } else if (rank >= 4.5) {
        // 4.5-4.9 star chapter - Quality tier (Most Popular)
        credits = 7;
        dollarValue = 6.99;
      } else if (rank >= 4.0) {
        // 4.0-4.4 star chapter - Good tier (Best Value)
        credits = 5;
        dollarValue = 4.99;
      } else if (rank >= 3.5) {
        // 3.5-3.9 star chapter - Standard tier
        credits = 3;
        dollarValue = 2.99;
      } else if (rank >= 3.0) {
        // 3.0-3.4 star chapter - Basic tier
        credits = 2;
        dollarValue = 1.99;
      } else {
        // Below 3.0 or no rank - Budget tier (impulse purchase)
        credits = 1;
        dollarValue = 0.99;
      }
      console.log(`💰 Full unlock pricing: ${credits} credits ($${dollarValue}) for rank ${rank}`);
    }

    // Get account balance with subscription unlock allowances
    const { data: accountData, error: accountError } = await supabaseAdmin
      .from('account_balance')
      .select(`
        subscription_tier,
        unlocks_5_star_remaining,
        unlocks_4_star_remaining,
        unlocks_3_star_remaining,
        warm_intros_remaining,
        subscription_started_at
      `)
      .eq('company_id', profile.company_id)
      .single();

    if (accountError) {
      console.error('❌ Error fetching account data:', accountError);
      return res.status(500).json({ error: 'Failed to fetch account data' });
    }

    console.log('📊 Account Data:', {
      tier: accountData.subscription_tier,
      unlocks_5_star: accountData.unlocks_5_star_remaining,
      unlocks_4_star: accountData.unlocks_4_star_remaining,
      unlocks_3_star: accountData.unlocks_3_star_remaining,
      warm_intros: accountData.warm_intros_remaining
    });

    // Check if already unlocked
    console.log(`🔍 Checking if chapter already unlocked for company: ${profile.company_id}`);
    const { data: existingUnlock } = await supabaseAdmin
      .from('chapter_unlocks')
      .select('*')
      .eq('company_id', profile.company_id)
      .eq('chapter_id', chapterId)
      .eq('unlock_type', unlockType)
      .maybeSingle();

    console.log(`🔍 Existing unlock check result:`, { existingUnlock });

    if (existingUnlock) {
      console.log(`✅ Already unlocked, returning early`);
      return res.json({
        success: true,
        alreadyUnlocked: true,
        message: 'Chapter already unlocked'
      });
    }

    // Check if we can use subscription unlocks instead of credits
    let useSubscriptionUnlock = false;
    let unlockColumn = '';
    let transactionId = null;

    if (unlockType === 'warm_introduction') {
      // Check warm intro allowance
      if (accountData.warm_intros_remaining > 0) {
        // For monthly tier, check if within first 3 months
        if (accountData.subscription_tier === 'monthly') {
          if (accountData.subscription_started_at) {
            const startDate = new Date(accountData.subscription_started_at);
            const monthsElapsed = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
            if (monthsElapsed <= 3) {
              useSubscriptionUnlock = true;
              unlockColumn = 'warm_intros_remaining';
              console.log(`🎁 Using monthly subscription warm intro (within first 3 months)`);
            } else {
              console.log(`⏰ Monthly subscription warm intro expired (${Math.floor(monthsElapsed)} months since start)`);
            }
          }
        } else if (accountData.subscription_tier === 'enterprise') {
          // Enterprise always gets warm intros
          useSubscriptionUnlock = true;
          unlockColumn = 'warm_intros_remaining';
          console.log(`🎁 Using enterprise subscription warm intro`);
        }
      }
    } else {
      // Full chapter unlock - check tier-specific allowances
      console.log(`🔍 Checking subscription unlock eligibility: rank=${rank}`);
      if (rank >= 5.0) {
        // 5.0⭐ chapter
        console.log(`⭐ 5.0⭐ chapter detected. Checking unlocks_5_star_remaining: ${accountData.unlocks_5_star_remaining}`);
        if (accountData.unlocks_5_star_remaining === -1 || accountData.unlocks_5_star_remaining > 0) {
          useSubscriptionUnlock = true;
          unlockColumn = 'unlocks_5_star_remaining';
          console.log(`🎁 ✅ Using subscription unlock for 5.0⭐ chapter (remaining: ${accountData.unlocks_5_star_remaining === -1 ? 'unlimited' : accountData.unlocks_5_star_remaining})`);
        } else {
          console.log(`❌ NO 5⭐ subscription unlocks remaining (${accountData.unlocks_5_star_remaining}), will use credits`);
        }
      } else if (rank >= 4.0 && rank < 5.0) {
        // 4.0-4.9⭐ chapter
        console.log(`💎 4.0-4.9⭐ chapter detected. Checking unlocks_4_star_remaining: ${accountData.unlocks_4_star_remaining}`);
        if (accountData.unlocks_4_star_remaining === -1 || accountData.unlocks_4_star_remaining > 0) {
          useSubscriptionUnlock = true;
          unlockColumn = 'unlocks_4_star_remaining';
          console.log(`🎁 ✅ Using subscription unlock for 4.0-4.9⭐ chapter (remaining: ${accountData.unlocks_4_star_remaining === -1 ? 'unlimited' : accountData.unlocks_4_star_remaining})`);
        } else {
          console.log(`❌ NO 4⭐ subscription unlocks remaining (${accountData.unlocks_4_star_remaining}), will use credits`);
        }
      } else if (rank >= 3.0 && rank < 4.0) {
        // 3.0-3.9⭐ chapter
        console.log(`🟢 3.0-3.9⭐ chapter detected. Checking unlocks_3_star_remaining: ${accountData.unlocks_3_star_remaining}`);
        if (accountData.unlocks_3_star_remaining === -1 || accountData.unlocks_3_star_remaining > 0) {
          useSubscriptionUnlock = true;
          unlockColumn = 'unlocks_3_star_remaining';
          console.log(`🎁 ✅ Using subscription unlock for 3.0-3.9⭐ chapter (remaining: ${accountData.unlocks_3_star_remaining === -1 ? 'unlimited' : accountData.unlocks_3_star_remaining})`);
        } else {
          console.log(`❌ NO 3⭐ subscription unlocks remaining (${accountData.unlocks_3_star_remaining}), will use credits`);
        }
      } else {
        console.log(`⚠️ Below 3.0⭐ chapter (rank: ${rank}), no subscription unlocks available`);
      }
      // Below 3.0⭐ chapters have no subscription unlocks, must use credits
    }

    console.log(`🎯 DECISION: useSubscriptionUnlock=${useSubscriptionUnlock}, unlockColumn=${unlockColumn}`);

    // Call deduct_credits function or use subscription unlock
    let transactionType, description;

    if (unlockType === 'warm_introduction') {
      transactionType = 'warm_introduction';
      description = isPlatinum
        ? `💎 Platinum warm introduction: ${chapterData.chapter_name}`
        : `🤝 Warm introduction: ${chapterData.chapter_name}`;
    } else {
      // Full unlock
      const rankLabel = rank >= 5.0 ? 'Premium (5.0⭐)' :
                        rank >= 4.5 ? 'Quality (4.5⭐)' :
                        rank >= 4.0 ? 'Good (4.0⭐)' :
                        rank >= 3.5 ? 'Standard (3.5⭐)' :
                        rank >= 3.0 ? 'Basic (3.0⭐)' :
                        'Budget (<3.0⭐)';
      transactionType = rank >= 5.0 ? 'five_star_unlock' : 'chapter_unlock';
      description = `Unlocked ${rankLabel} chapter: ${chapterData.chapter_name}`;
    }

    if (useSubscriptionUnlock) {
      // Use subscription unlock instead of credits
      console.log(`🎁 Using subscription unlock - decrementing ${unlockColumn}`);

      // Decrement the subscription unlock counter (unless it's -1 for unlimited)
      const currentValue = accountData[unlockColumn as keyof typeof accountData] as number;
      const newValue = currentValue === -1 ? -1 : currentValue - 1;

      const { error: updateError } = await supabaseAdmin
        .from('account_balance')
        .update({ [unlockColumn]: newValue })
        .eq('company_id', profile.company_id);

      if (updateError) {
        console.error('❌ Error updating subscription unlock counter:', updateError);
        return res.status(500).json({ error: 'Failed to update subscription unlock' });
      }

      // Create a transaction record for tracking (0 credits, 0 dollars since it's from subscription)
      const { data: txData, error: txError } = await supabaseAdmin
        .from('balance_transactions')
        .insert({
          company_id: profile.company_id,
          credits: 0,
          dollars: 0,
          transaction_type: useSubscriptionUnlock && unlockType === 'warm_introduction'
            ? 'subscription_warm_intro'
            : 'subscription_unlock',
          description: `${description} (subscription)`,
          chapter_id: chapterId
        })
        .select('id')
        .single();

      transactionId = txData?.id || null;
      console.log(`✅ Subscription unlock used successfully. New ${unlockColumn}: ${newValue === -1 ? 'unlimited' : newValue}`);
    } else {
      // Fall back to deducting credits
      console.log(`💰 Calling deduct_credits RPC with ${credits} credits ($${dollarValue}) for company ${profile.company_id}`);
      const { data: rpcTransactionId, error: deductError } = await supabaseAdmin.rpc('deduct_credits', {
        p_company_id: profile.company_id,
        p_credits: credits,
        p_dollars: dollarValue,
        p_transaction_type: transactionType,
        p_description: description,
        p_chapter_id: chapterId
      });

      console.log(`💳 Deduct credits result:`, { transactionId: rpcTransactionId, deductError });

      if (deductError) {
        console.error('❌ Error deducting credits:', deductError);
        if (deductError.message?.includes('Insufficient credits')) {
          return res.status(402).json({
            error: 'Insufficient credits',
            message: deductError.message,
            required: credits
          });
        }
        return res.status(500).json({ error: 'Failed to unlock chapter' });
      }

      transactionId = rpcTransactionId;
    }

    // Create unlock record
    const finalAmountPaid = useSubscriptionUnlock ? 0 : credits;
    console.log('💾 Attempting to insert unlock record:', {
      company_id: profile.company_id,
      chapter_id: chapterId,
      unlock_type: unlockType,
      amount_paid: finalAmountPaid,
      useSubscriptionUnlock,
      transaction_id: transactionId
    });

    const { data: unlockData, error: unlockError } = await supabaseAdmin
      .from('chapter_unlocks')
      .insert({
        company_id: profile.company_id,
        chapter_id: chapterId,
        unlock_type: unlockType,
        amount_paid: finalAmountPaid, // 0 for subscription unlocks, credits for credit unlocks
        transaction_id: transactionId
      })
      .select();

    console.log('💾 Unlock insert result:', { unlockData, unlockError });

    if (unlockError) {
      console.error('❌ Error creating unlock record:', unlockError);
      return res.status(500).json({ error: 'Failed to create unlock record' });
    }

    console.log('✅ Unlock record created successfully:', unlockData);

    // Get company info for logging
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('company_name')
      .eq('id', profile.company_id)
      .single();

    // Get updated balance and subscription unlocks
    const { data: balanceData } = await supabaseAdmin
      .from('account_balance')
      .select(`
        balance_credits,
        balance_dollars,
        unlocks_5_star_remaining,
        unlocks_4_star_remaining,
        unlocks_3_star_remaining,
        warm_intros_remaining,
        subscription_tier
      `)
      .eq('company_id', profile.company_id)
      .single();

    // Log activity
    await supabaseAdmin.rpc('log_admin_activity', {
      p_event_type: 'unlock',
      p_event_title: `${is5Star ? '5-star' : 'Standard'} chapter unlocked: ${chapterData?.chapter_name || 'Chapter'}`,
      p_event_description: `${company?.company_name || 'User'} unlocked ${unlockType} ${useSubscriptionUnlock ? 'using subscription' : `for ${credits} credits ($${dollarValue} value)`}`,
      p_company_id: profile.company_id,
      p_company_name: company?.company_name,
      p_reference_id: chapterId,
      p_reference_type: 'chapter',
      p_metadata: {
        unlockType,
        creditsSpent: useSubscriptionUnlock ? 0 : credits,
        dollarValue: dollarValue,
        is5Star: is5Star,
        chapterName: chapterData?.chapter_name,
        universityName: (chapterData?.universities as any)?.name,
        usedSubscriptionUnlock: useSubscriptionUnlock
      }
    });

    // Create admin notification
    const adminService = getAdminNotificationService();
    adminService.createNotification({
      type: 'unlock',
      title: `🔓 Chapter Unlocked${is5Star ? ' (5-Star)' : ''}`,
      message: `${company?.company_name || 'A company'} unlocked ${chapterData?.chapter_name || 'a chapter'} at ${(chapterData?.universities as any)?.name || 'a university'} ${useSubscriptionUnlock ? 'using subscription' : `for ${credits} credits ($${dollarValue})`}`,
      data: {
        companyId: profile.company_id,
        companyName: company?.company_name,
        chapterId,
        chapterName: chapterData?.chapter_name,
        universityName: (chapterData?.universities as any)?.name,
        unlockType,
        creditsSpent: useSubscriptionUnlock ? 0 : credits,
        dollarValue: dollarValue,
        is5Star: is5Star,
        transactionId,
        usedSubscriptionUnlock: useSubscriptionUnlock
      },
      relatedCompanyId: profile.company_id
    }).catch(err => console.error('Failed to create admin notification:', err));

    // Send Slack notification
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Unknown User';

    await slack.notifyChapterUnlock({
      userName,
      company: company?.company_name || 'Unknown Company',
      chapterName: chapterData?.chapter_name || 'Unknown Chapter',
      universityName: (chapterData?.universities as any)?.name || 'Unknown University',
      grade: parseFloat(chapterData?.grade || '0'),
      creditsSpent: useSubscriptionUnlock ? 0 : credits,
      remainingBalance: balanceData?.balance_credits || 0
    });

    res.json({
      success: true,
      balance: balanceData?.balance_credits || 0,
      creditsSpent: useSubscriptionUnlock ? 0 : credits,
      dollarValue: dollarValue,
      is5Star: is5Star,
      unlockType,
      transactionId,
      // New fields to inform user about subscription usage
      usedSubscriptionUnlock: useSubscriptionUnlock,
      paymentMethod: useSubscriptionUnlock ? 'subscription' : 'credits',
      remainingSubscriptionUnlocks: {
        fiveStar: balanceData?.unlocks_5_star_remaining || 0,
        fourStar: balanceData?.unlocks_4_star_remaining || 0,
        threeStar: balanceData?.unlocks_3_star_remaining || 0,
        isUnlimited: balanceData?.unlocks_5_star_remaining === -1
      },
      remainingWarmIntros: balanceData?.warm_intros_remaining || 0
    });
  } catch (error: any) {
    console.error('Unlock endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chapters/:id/unlock-status', async (req, res) => {
  try {
    const { id: chapterId } = req.params;
    console.log('🔍 === UNLOCK STATUS ENDPOINT HIT ===');
    console.log('📍 Chapter ID:', chapterId);

    // Get the authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header found');
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('👤 User from token:', { userId: user?.id, error: authError });

    if (authError || !user) {
      console.log('❌ Invalid token or user not found');
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Get user's company_id from user_profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    console.log('🏢 User profile:', { profile, profileError });

    if (profileError || !profile?.company_id) {
      console.log('❌ User profile not found');
      return res.status(404).json({ error: 'User profile not found' });
    }

    console.log('🔎 Querying chapter_unlocks with:', {
      company_id: profile.company_id,
      chapter_id: chapterId
    });

    // Query unlocks for this chapter
    const { data, error } = await supabaseAdmin
      .from('chapter_unlocks')
      .select('unlock_type, unlocked_at, expires_at, amount_paid')
      .eq('company_id', profile.company_id)
      .eq('chapter_id', chapterId);

    // Filter out expired unlocks (if expires_at is set and in the past)
    const validUnlocks = data?.filter(unlock =>
      !unlock.expires_at || new Date(unlock.expires_at) > new Date()
    ) || [];

    console.log('📊 Unlock status query result:', { data, error, count: data?.length, validCount: validUnlocks.length });

    if (error) {
      console.error('❌ Error fetching unlock status:', error);
      return res.status(500).json({ error: 'Failed to fetch unlock status' });
    }

    const unlockedTypes = validUnlocks.map(u => u.unlock_type);
    console.log('✅ Returning unlock types:', unlockedTypes);

    res.json({
      success: true,
      unlocked: unlockedTypes
    });
  } catch (error: any) {
    console.error('Unlock status endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Instagram data for a chapter (with caching)
app.get('/api/chapters/:id/instagram', async (req, res) => {
  try {
    const { id: chapterId } = req.params;
    console.log('📸 === INSTAGRAM DATA ENDPOINT HIT ===');
    console.log('📍 Chapter ID:', chapterId);

    // Fetch chapter data to get Instagram handle
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from('chapters')
      .select('instagram_handle, instagram_handle_official')
      .eq('id', chapterId)
      .single();

    if (chapterError || !chapter) {
      console.log('❌ Chapter not found');
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Get the Instagram handle (prefer official over regular)
    const instagramHandle = getInstagramHandle(
      chapter.instagram_handle,
      chapter.instagram_handle_official
    );

    if (!instagramHandle) {
      console.log('❌ No Instagram handle found for chapter');
      return res.status(404).json({
        error: 'No Instagram handle available for this chapter',
        has_handle: false
      });
    }

    console.log('📱 Instagram handle:', instagramHandle);

    // Fetch Instagram data from API
    const instagramData = await fetchInstagramData(instagramHandle, 6);

    if (!instagramData) {
      console.log('❌ Failed to fetch Instagram data');
      return res.status(500).json({
        error: 'Failed to fetch Instagram data',
        has_handle: true,
        handle: instagramHandle
      });
    }

    console.log('✅ Instagram data fetched successfully');
    console.log('📊 Profile:', instagramData.profile.username, 'Followers:', instagramData.profile.follower_count);
    console.log('📸 Posts:', instagramData.recent_posts.length);

    res.json({
      success: true,
      data: instagramData,
      handle: instagramHandle
    });
  } catch (error: any) {
    console.error('Instagram endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
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

    // Send Slack notification
    await slack.notifySignup({
      name,
      email,
      company: companyName,
      tier: newUser.status || 'pending'
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
    const { universityName } = req.query;

    let query = supabaseAdmin
      .from('chapters')
      .select(`
        *,
        greek_organizations(id, name, greek_letters, organization_type),
        universities(id, name, location, state, student_count, logo_url, conference, division)
      `)
      .eq('status', 'active')
      .eq('is_viewable', true);

    // Filter by university name if provided
    if (universityName && typeof universityName === 'string') {
      // First get the university ID
      const { data: university, error: universityError } = await supabaseAdmin
        .from('universities')
        .select('id')
        .ilike('name', universityName)
        .single();

      if (university && !universityError) {
        query = query.eq('university_id', university.id);
      }
    }

    const { data, error } = await query
      .order('is_favorite', { ascending: false, nullsFirst: false })
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

// Request intro for high-grade chapters
app.post('/api/intro-requests', async (req, res) => {
  try {
    const { chapter_id, chapter_name, fraternity_name, university_name, grade } = req.body;

    // Store the request in the database
    const { data, error } = await supabase
      .from('intro_requests')
      .insert({
        chapter_id,
        chapter_name,
        fraternity_name,
        university_name,
        grade,
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing intro request:', error);
      // Don't fail the request if storage fails - still send notification
    }

    console.log(`📨 Intro Request: ${fraternity_name} - ${chapter_name} at ${university_name} (Grade: ${grade})`);

    res.json({ success: true, message: 'Intro request received' });
  } catch (error: any) {
    console.error('Error processing intro request:', error);
    res.status(500).json({ error: 'Failed to process intro request' });
  }
});

// Admin endpoint to update chapter details
app.patch('/api/admin/chapters/:chapterId', requireAdmin, async (req, res) => {
  const { chapterId } = req.params;
  const updateData = req.body;

  console.log('⭐ === PATCH CHAPTER REQUEST ===');
  console.log('Chapter ID:', chapterId);
  console.log('Update Data:', JSON.stringify(updateData, null, 2));

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
      'charter_date',
      'chapter_name',
      'greek_letter_name',
      'status',
      'grade',
      'is_favorite',
      'is_viewable',
      'contact_email',
      'phone',
      'instagram_handle',
      'engagement_score',
      'partnership_openness',
      'event_frequency'
    ];

    // Filter update data to only include allowed fields
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    console.log('Filtered Data:', JSON.stringify(filteredData, null, 2));


    // Sanitize date fields - convert empty strings to null
    if (filteredData.charter_date === '') {
      filteredData.charter_date = null;
    }
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
      console.error('❌ Supabase Error updating chapter:', JSON.stringify(error, null, 2));
      return res.status(500).json({ error: 'Failed to update chapter', details: error.message });
    }

    if (!data) {
      console.error('❌ No data returned - Chapter not found');
      return res.status(404).json({ error: 'Chapter not found' });
    }

    console.log('✅ Chapter updated successfully:', JSON.stringify(data, null, 2));
    res.json({
      success: true,
      message: 'Chapter updated successfully',
      data
    });
  } catch (error: any) {
    console.error('❌ Caught exception in chapter update:', error);
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
              grade,
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
          .select('balance_credits, lifetime_spent_credits, subscription_tier')
          .eq('company_id', company.id)
          .single();

        return {
          ...company,
          company_name: company.name, // Map 'name' to 'company_name' for frontend
          email: email,
          unlocks: unlocks || [],
          total_spent: accountBalance?.lifetime_spent_credits || 0,
          credits_balance: accountBalance?.balance_credits || 0,
          subscription_tier: accountBalance?.subscription_tier || 'trial'
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

    // Get all team members for this company
    const { data: teamMembers, error: teamError } = await supabaseAdmin
      .from('team_members')
      .select('id, member_number, role, status, joined_at, user_id')
      .eq('company_id', id)
      .order('member_number', { ascending: true });

    // Fetch user details (name and email) for each team member
    const users = await Promise.all(
      (teamMembers || []).map(async (member) => {
        // Get user profile for name
        const { data: userProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('user_id', member.user_id)
          .single();

        // Get email from auth
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(member.user_id);

        return {
          user_id: member.user_id,
          email: authUser?.user?.email || null,
          first_name: userProfile?.first_name || null,
          last_name: userProfile?.last_name || null,
          member_number: member.member_number,
          role: member.role,
          status: member.status,
          joined_at: member.joined_at,
          created_at: member.joined_at
        };
      })
    );

    // Get unlock history (use admin client to bypass RLS)
    const { data: unlocks } = await supabaseAdmin
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

    // Get balance transaction history (use admin client to bypass RLS)
    const { data: transactions } = await supabaseAdmin
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

// Delete company account (admin only)
app.delete('/api/admin/companies/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get company name for logging
    const { data: company, error: fetchError } = await supabaseAdmin
      .from('companies')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const companyName = company.name;

    // Get all user_ids associated with this company
    const { data: userProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('company_id', id);

    const userIds = userProfiles?.map(p => p.user_id) || [];

    // Delete in correct order to respect foreign key constraints

    // 1. Delete team members
    const { error: teamError } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('company_id', id);

    if (teamError) {
      console.error('Error deleting team members:', teamError);
      throw new Error('Failed to delete team members');
    }

    // 2. Delete credit transactions
    const { error: transactionsError } = await supabaseAdmin
      .from('credit_transactions')
      .delete()
      .eq('company_id', id);

    if (transactionsError) {
      console.error('Error deleting credit transactions:', transactionsError);
      throw new Error('Failed to delete credit transactions');
    }

    // 3. Delete account balance
    const { error: balanceError } = await supabaseAdmin
      .from('account_balance')
      .delete()
      .eq('company_id', id);

    if (balanceError) {
      console.error('Error deleting account balance:', balanceError);
      throw new Error('Failed to delete account balance');
    }

    // 4. Delete user profiles
    const { error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('company_id', id);

    if (profilesError) {
      console.error('Error deleting user profiles:', profilesError);
      throw new Error('Failed to delete user profiles');
    }

    // 5. Delete company
    const { error: companyError } = await supabaseAdmin
      .from('companies')
      .delete()
      .eq('id', id);

    if (companyError) {
      console.error('Error deleting company:', companyError);
      throw new Error('Failed to delete company');
    }

    // 6. Delete auth users (best effort - may fail if users are referenced elsewhere)
    for (const userId of userIds) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (authError) {
        console.error(`Failed to delete auth user ${userId}:`, authError);
        // Continue even if auth deletion fails
      }
    }

    console.log(`✅ Admin deleted company account: ${companyName} (${id})`);
    res.json({
      success: true,
      message: `Successfully deleted account for ${companyName}`,
      deletedUsers: userIds.length
    });
  } catch (error: any) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: error.message || 'Failed to delete company' });
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

// Cron job to send daily reports (should be called daily by a cron service)
app.post('/api/cron/send-daily-reports', async (req, res) => {
  try {
    // Verify cron secret
    const cronSecret = req.headers['x-cron-secret'];
    if (cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('📊 Starting daily report generation...');

    // Initialize the daily report service
    const reportService = new DailyReportService(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      process.env.RESEND_API_KEY || '',
      process.env.FROM_EMAIL || 'updates@fraternitybase.com'
    );

    // Send all daily reports
    const result = await reportService.sendAllDailyReports();

    console.log(`✅ Daily reports complete: ${result.sent} sent, ${result.failed} failed`);

    res.json({
      success: true,
      message: `Daily reports sent to ${result.sent} companies`,
      sent: result.sent,
      failed: result.failed,
      total: result.sent + result.failed
    });
  } catch (error: any) {
    console.error('❌ Error sending daily reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cron job to send enhanced daily reports with partnerships and revenue metrics
app.post('/api/cron/send-enhanced-daily-reports', async (req, res) => {
  try {
    // Verify cron secret
    const cronSecret = req.headers['x-cron-secret'];
    if (cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('📊 Starting enhanced daily report generation...');

    // Initialize the enhanced daily report service
    const reportService = new EnhancedDailyReportService(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      process.env.RESEND_API_KEY || '',
      process.env.FROM_EMAIL || 'updates@fraternitybase.com'
    );

    // Send all enhanced daily reports
    const result = await reportService.sendAllEnhancedDailyReports();

    console.log(`✅ Enhanced daily reports complete: ${result.sent} sent, ${result.failed} failed`);

    res.json({
      success: true,
      message: `Enhanced daily reports sent to ${result.sent} companies`,
      sent: result.sent,
      failed: result.failed,
      total: result.sent + result.failed
    });
  } catch (error: any) {
    console.error('❌ Error sending enhanced daily reports:', error);
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
    console.log('📍 Client: supabaseAdmin (bypasses RLS)');
    console.log('📍 Table: universities');
    console.log('📍 Query: SELECT * with chapter count, ORDER BY name ASC');

    // Fetch universities with chapter count
    const { data, error } = await supabaseAdmin
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

    const { data, error } = await supabaseAdmin
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

    const { data, error } = await supabaseAdmin
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

    const { error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .select(`
        *,
        greek_organizations(id, name, organization_type),
        universities(id, name, state)
      `)
      .order('is_favorite', { ascending: false, nullsFirst: false })
      .order('member_count', { ascending: false })
      .limit(5000); // Increase limit to get all chapters

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
      event_frequency,
      grade,
      is_favorite,
      is_viewable
    } = req.body;

    // Validate required fields
    if (!greek_organization_id || greek_organization_id === '') {
      return res.status(400).json({
        success: false,
        error: 'Please select a Greek Organization'
      });
    }
    if (!university_id || university_id === '') {
      return res.status(400).json({
        success: false,
        error: 'Please select a University'
      });
    }
    if (!chapter_name || chapter_name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Chapter name is required'
      });
    }

    // Check for existing chapter (including inactive/hidden ones)
    const { data: existingChapter } = await supabaseAdmin
      .from('chapters')
      .select(`
        id,
        chapter_name,
        status,
        is_viewable,
        greek_organizations(name),
        universities(name)
      `)
      .eq('greek_organization_id', greek_organization_id)
      .eq('university_id', university_id)
      .maybeSingle();

    if (existingChapter) {
      const orgName = (existingChapter as any).greek_organizations?.name || 'Unknown Org';
      const uniName = (existingChapter as any).universities?.name || 'Unknown University';
      return res.status(400).json({
        success: false,
        error: `A chapter for ${orgName} at ${uniName} already exists (Status: ${existingChapter.status}, Visible: ${existingChapter.is_viewable}). Chapter ID: ${existingChapter.id}`
      });
    }

    const { data, error } = await supabaseAdmin
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
        event_frequency,
        grade,
        is_favorite,
        is_viewable
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

    // Provide user-friendly error messages
    let errorMessage = error.message;
    if (error.message?.includes('invalid input syntax for type uuid')) {
      errorMessage = 'Invalid Greek Organization or University selected. Please select valid options from the dropdowns.';
    } else if (error.message?.includes('duplicate key')) {
      errorMessage = 'A chapter with this information already exists.';
    } else if (error.message?.includes('violates foreign key constraint')) {
      errorMessage = 'Selected Greek Organization or University does not exist. Please refresh the page and try again.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Quick Add Chapter - just provide names, we'll match them
app.post('/api/admin/chapters/quick-add', requireAdmin, async (req, res) => {
  try {
    const {
      organization_name,
      university_name,
      chapter_name,
      grade,
      member_count,
      status = 'active',
      is_viewable = true
    } = req.body;

    console.log('🚀 [Quick Add] Starting chapter creation...');
    console.log('  Organization:', organization_name);
    console.log('  University:', university_name);
    console.log('  Chapter Name:', chapter_name);

    // Find Greek Organization (fuzzy match)
    const { data: orgs, error: orgError } = await supabaseAdmin
      .from('greek_organizations')
      .select('id, name, greek_letters, organization_type')
      .ilike('name', `%${organization_name}%`);

    if (orgError || !orgs || orgs.length === 0) {
      return res.status(400).json({
        success: false,
        error: `Could not find Greek organization matching "${organization_name}". Please check spelling or add it first.`
      });
    }

    const org = orgs[0];
    console.log(`  ✅ Matched org: ${org.name} (${org.id})`);

    // Find University (fuzzy match)
    const { data: unis, error: uniError } = await supabaseAdmin
      .from('universities')
      .select('id, name, state')
      .ilike('name', `%${university_name}%`);

    if (uniError || !unis || unis.length === 0) {
      return res.status(400).json({
        success: false,
        error: `Could not find university matching "${university_name}". Please check spelling or add it first.`
      });
    }

    const uni = unis[0];
    console.log(`  ✅ Matched university: ${uni.name} (${uni.id})`);

    // Check for existing chapter
    const { data: existingChapter } = await supabaseAdmin
      .from('chapters')
      .select('id, chapter_name, status, is_viewable')
      .eq('greek_organization_id', org.id)
      .eq('university_id', uni.id)
      .maybeSingle();

    if (existingChapter) {
      return res.status(400).json({
        success: false,
        error: `A chapter for ${org.name} at ${uni.name} already exists (Status: ${existingChapter.status}, Visible: ${existingChapter.is_viewable}). Chapter ID: ${existingChapter.id}`,
        existing_chapter: existingChapter
      });
    }

    // Create the chapter
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .insert({
        greek_organization_id: org.id,
        university_id: uni.id,
        chapter_name: chapter_name || `${uni.name} Chapter`,
        member_count: member_count ? parseInt(member_count) : null,
        status,
        grade: grade ? parseFloat(grade) : null,
        is_favorite: false,
        is_viewable
      })
      .select(`
        *,
        greek_organizations(name, greek_letters, organization_type),
        universities(name, state)
      `)
      .single();

    if (error) throw error;

    console.log(`✅ Created chapter: ${org.name} at ${uni.name}`);

    res.json({
      success: true,
      data,
      message: `Successfully created ${org.name} chapter at ${uni.name}`
    });
  } catch (error: any) {
    console.error('Error in quick-add:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/admin/chapters/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
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

    const { error } = await supabaseAdmin
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

    let query = supabaseAdmin
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

    const { data, error } = await supabaseAdmin
      .from('chapter_officers')
      .insert({
        chapter_id,
        name,
        position: position || 'Member',
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

    const { data, error } = await supabaseAdmin
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

    const { error } = await supabaseAdmin
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

    // Send Slack notification
    await slack.notifyWaitlistJoin({
      email,
      position: count || 1,
      source: source || 'unknown'
    });

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

// Coming Tomorrow Management Routes
app.get('/api/admin/coming-tomorrow', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coming_tomorrow')
      .select(`
        *,
        university:universities(id, name, state)
      `)
      .eq('is_displayed', true)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;

    console.log(`✅ Retrieved ${data?.length || 0} coming tomorrow items`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching coming tomorrow items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/coming-tomorrow', requireAdmin, async (req, res) => {
  try {
    const {
      college_name,
      university_id,
      anticipated_score,
      update_type,
      expected_member_count,
      chapter_name,
      scheduled_date
    } = req.body;

    const { data, error } = await supabase
      .from('coming_tomorrow')
      .insert({
        college_name,
        university_id,
        anticipated_score,
        update_type,
        expected_member_count,
        chapter_name,
        scheduled_date: scheduled_date || new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        is_displayed: true
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Created coming tomorrow item: ${college_name} - ${chapter_name || update_type}`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating coming tomorrow item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/coming-tomorrow/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('coming_tomorrow')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Updated coming tomorrow item: ${id}`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating coming tomorrow item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/coming-tomorrow/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('coming_tomorrow')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log(`✅ Deleted coming tomorrow item: ${id}`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting coming tomorrow item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recently added items - show items from last 3 days
app.get('/api/dashboard/recent-additions', async (req, res) => {
  try {
    // Calculate date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoISO = threeDaysAgo.toISOString();

    // Fetch recent universities (last 3 days)
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('id, name, created_at, logo_url')
      .gte('created_at', threeDaysAgoISO)
      .order('created_at', { ascending: false })
      .limit(20);

    if (uniError) throw uniError;

    // Fetch recent chapters (last 3 days)
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select(`
        id,
        chapter_name,
        created_at,
        universities(name, logo_url),
        greek_organizations(name)
      `)
      .gte('created_at', threeDaysAgoISO)
      .order('created_at', { ascending: false })
      .limit(20);

    if (chaptersError) throw chaptersError;

    // Fetch recent officers (for roster updates) - last 3 days
    const { data: officers, error: officersError } = await supabase
      .from('officers')
      .select(`
        id,
        name,
        created_at,
        chapters(
          id,
          chapter_name,
          universities(name, logo_url),
          greek_organizations(name)
        )
      `)
      .gte('created_at', threeDaysAgoISO)
      .order('created_at', { ascending: false })
      .limit(100);

    if (officersError) throw officersError;

    // Combine and format the results
    const recentAdditions = [
      ...(universities || []).map(uni => ({
        type: 'university',
        id: uni.id,
        name: uni.name,
        college_name: uni.name,
        logo_url: uni.logo_url,
        created_at: uni.created_at,
        description: 'New school added to database'
      })),
      ...(chapters || []).map(ch => ({
        type: 'chapter',
        id: ch.id,
        name: `${(ch.universities as any)?.name} ${(ch.greek_organizations as any)?.name}`,
        college_name: (ch.universities as any)?.name,
        chapter_name: (ch.greek_organizations as any)?.name,
        logo_url: (ch.universities as any)?.logo_url,
        created_at: ch.created_at,
        description: (ch.universities as any)?.name
      })),
      // Group officers by chapter to show roster updates
      ...Object.values(
        (officers || []).reduce((acc: any, officer: any) => {
          const chapterId = officer.chapters?.id;

          // Only include if chapter exists
          if (!chapterId || !officer.chapters) return acc;

          if (!acc[chapterId]) {
            acc[chapterId] = {
              type: 'roster',
              id: chapterId,
              name: `${officer.chapters.universities?.name} ${officer.chapters.greek_organizations?.name} Roster`,
              college_name: officer.chapters.universities?.name,
              chapter_name: officer.chapters.greek_organizations?.name,
              logo_url: officer.chapters.universities?.logo_url,
              created_at: officer.created_at,
              description: `${officer.chapters.universities?.name} • Updated roster`,
              member_count: 1
            };
          } else {
            acc[chapterId].member_count++;
            // Update description with member count
            acc[chapterId].description = `${officer.chapters.universities?.name} • ${acc[chapterId].member_count} members`;
          }
          return acc;
        }, {})
      )
    ];

    // Sort by created_at descending and limit to 10 most recent
    const sorted = recentAdditions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    console.log(`✅ Retrieved ${sorted.length} recent additions from past 3 days`);
    res.json({ success: true, data: sorted });
  } catch (error: any) {
    console.error('Error fetching recent additions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle university visibility in dashboard "Newly Added"
app.patch('/api/admin/universities/:id/dashboard-visibility', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { show_in_dashboard } = req.body;

    const { data, error } = await supabase
      .from('universities')
      .update({ show_in_dashboard })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Updated university ${id} dashboard visibility to:`, show_in_dashboard);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating university dashboard visibility:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle chapter visibility in dashboard "Newly Added"
app.patch('/api/admin/chapters/:id/dashboard-visibility', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { show_in_dashboard } = req.body;

    const { data, error } = await supabase
      .from('chapters')
      .update({ show_in_dashboard })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Updated chapter ${id} dashboard visibility to:`, show_in_dashboard);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating chapter dashboard visibility:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== WIZARD ADMIN ROUTES ====================
// Platform super admin routes for account impersonation and management

// Get wizard admin status
app.get('/api/wizard/status', async (req, res) => {
  try {
    // Check for admin token first (for admin panel compatibility)
    const adminToken = req.headers['x-admin-token'];
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

    console.log('🔍 Wizard status check:', {
      hasToken: !!adminToken,
      tokensMatch: adminToken === ADMIN_TOKEN
    });

    if (adminToken && adminToken === ADMIN_TOKEN) {
      // Admin token is valid - check wizard status for the admin email
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jacksonfitzgerald25@gmail.com';
      console.log('🔑 Admin token valid, checking email:', ADMIN_EMAIL);

      const { data: adminUser, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      console.log('👥 List users result:', {
        userCount: adminUser?.users?.length,
        error: listError?.message
      });

      const user = adminUser?.users?.find(u => u.email === ADMIN_EMAIL);
      console.log('👤 Found user:', { found: !!user, userId: user?.id });

      if (user) {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .select('is_wizard_admin')
          .eq('user_id', user.id)
          .single();

        console.log('📋 Profile query result:', {
          profile,
          error: profileError?.message
        });

        console.log('✅ Wizard status check via admin token:', {
          email: ADMIN_EMAIL,
          userId: user.id,
          isWizard: profile?.is_wizard_admin || false
        });

        return res.json({
          isWizardAdmin: profile?.is_wizard_admin || false,
          userId: user.id,
          authMethod: 'admin-token'
        });
      } else {
        console.log('❌ User not found for email:', ADMIN_EMAIL);
      }
    }

    // Fall back to Supabase Bearer token auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ isWizardAdmin: false });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.json({ isWizardAdmin: false });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_wizard_admin')
      .eq('user_id', user.id)
      .single();

    res.json({
      isWizardAdmin: profile?.is_wizard_admin || false,
      userId: user.id,
      authMethod: 'supabase-token'
    });
  } catch (error: any) {
    console.error('Error checking wizard status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all companies (wizard admin only)
app.get('/api/wizard/companies', checkWizardAdmin, async (req, res) => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        created_at,
        team_members:team_members(count),
        balance:account_balance(balance_dollars, balance_credits)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, companies });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start impersonation session
app.post('/api/wizard/impersonate', checkWizardAdmin, async (req, res) => {
  try {
    const { companyId } = req.body;
    const wizardUser = (req as any).wizardUser;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Verify company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // End any existing active session
    await supabase
      .from('wizard_sessions')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('wizard_user_id', wizardUser.id)
      .eq('is_active', true);

    // Create new impersonation session
    const { data: session, error: sessionError } = await supabase
      .from('wizard_sessions')
      .insert({
        wizard_user_id: wizardUser.id,
        impersonated_company_id: companyId,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || null,
        is_active: true
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    console.log(`🧙 Wizard ${wizardUser.email} started impersonating company: ${company.name}`);
    res.json({
      success: true,
      session,
      company
    });
  } catch (error: any) {
    console.error('Error starting impersonation:', error);
    res.status(500).json({ error: error.message });
  }
});

// End impersonation session
app.post('/api/wizard/end-impersonation', checkWizardAdmin, async (req, res) => {
  try {
    const wizardUser = (req as any).wizardUser;

    const { data, error } = await supabase
      .from('wizard_sessions')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('wizard_user_id', wizardUser.id)
      .eq('is_active', true)
      .select()
      .single();

    if (error) throw error;

    console.log(`🧙 Wizard ${wizardUser.email} ended impersonation`);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error ending impersonation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active impersonation session
app.get('/api/wizard/current-session', checkWizardAdmin, async (req, res) => {
  try {
    const wizardUser = (req as any).wizardUser;

    const { data: session, error } = await supabase
      .from('wizard_sessions')
      .select(`
        *,
        company:companies(id, name)
      `)
      .eq('wizard_user_id', wizardUser.id)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    res.json({
      success: true,
      session: session || null
    });
  } catch (error: any) {
    console.error('Error fetching current session:', error);
    res.status(500).json({ error: error.message });
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

// CSV PASTE endpoint - accepts CSV text directly in body
app.post('/api/admin/chapters/:chapterId/paste-roster', requireAdmin, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { csvText } = req.body;

    if (!csvText || typeof csvText !== 'string') {
      return res.status(400).json({ success: false, error: 'No CSV text provided' });
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

    // Parse CSV text
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Array<Record<string, string>>;

    console.log(`📋 Pasting ${records.length} members for chapter: ${rosterChapter.chapter_name}`);

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
          is_primary_contact: record.is_primary_contact?.toLowerCase() === 'true',
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

    console.log(`✅ Roster paste complete: ${insertedCount} inserted, ${updatedCount} updated, ${skippedCount} skipped`);

    // Log activity
    await supabaseAdmin.rpc('log_admin_activity', {
      p_event_type: 'admin_paste',
      p_event_title: `Roster pasted: ${rosterChapter.chapter_name}`,
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
    console.error('Error pasting roster CSV:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================================
// DASHBOARD COMING SOON ENDPOINTS
// ===================================

// Public endpoint - Get active coming soon items for dashboard
app.get('/api/dashboard/coming-soon', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('dashboard_coming_soon')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('❌ Error fetching coming soon items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin endpoint - Get all coming soon items
app.get('/api/admin/coming-soon', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('dashboard_coming_soon')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('❌ Error fetching coming soon items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin endpoint - Create new coming soon item
app.post('/api/admin/coming-soon', requireAdmin, async (req, res) => {
  try {
    const { university_name, description, display_order, is_active } = req.body;

    const { data, error } = await supabaseAdmin
      .from('dashboard_coming_soon')
      .insert([{
        university_name,
        description: description || 'New chapters being added',
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Error creating coming soon item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin endpoint - Update coming soon item
app.put('/api/admin/coming-soon/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { university_name, description, display_order, is_active } = req.body;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (university_name !== undefined) updateData.university_name = university_name;
    if (description !== undefined) updateData.description = description;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('dashboard_coming_soon')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Error updating coming soon item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin endpoint - Delete coming soon item
app.delete('/api/admin/coming-soon/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error} = await supabaseAdmin
      .from('dashboard_coming_soon')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Coming soon item deleted successfully' });
  } catch (error: any) {
    console.error('❌ Error deleting coming soon item:', error);
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
