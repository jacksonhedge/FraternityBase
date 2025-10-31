/**
 * Fraternity Sign-Up Router
 * Handles fraternity/sorority user registration and management
 */

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Get Supabase clients - will be initialized by server.ts
let supabaseAdmin: any;
let supabase: any;

// Lazy initialization function
function getSupabaseClients() {
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
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }
  return { supabaseAdmin, supabase };
}

/**
 * POST /api/fraternity/signup
 * Register a new fraternity user
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const {
      firstName,
      lastName,
      email,
      password,
      college,
      fraternityOrSorority,
      position,
      sponsorshipType,
      instagram,
      website,
      preferredPaymentMethod,
      paymentRecipientName,
      paymentVenmo,
      paymentZelle,
      paymentPaypal,
      paymentBankAccount,
      paymentRoutingNumber,
      hasUpcomingEvent,
      eventName,
      eventDate,
      eventType
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !college || !fraternityOrSorority || !position) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if email already exists in fraternity_users
    const { data: existingUser } = await supabaseAdmin
      .from('fraternity_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'A user with this email already exists'
      });
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        user_type: 'fraternity'
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }

    // Create fraternity_users record
    const { data: fraternityUser, error: fraternityError } = await supabaseAdmin
      .from('fraternity_users')
      .insert({
        user_id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        college,
        fraternity_or_sorority: fraternityOrSorority,
        position,
        sponsorship_type: sponsorshipType || 'event',
        instagram: instagram || null,
        website: website || null,
        preferred_payment_method: preferredPaymentMethod || null,
        payment_recipient_name: paymentRecipientName || null,
        payment_venmo: paymentVenmo || null,
        payment_zelle: paymentZelle || null,
        payment_paypal: paymentPaypal || null,
        payment_bank_account: paymentBankAccount || null,
        payment_routing_number: paymentRoutingNumber || null,
        has_upcoming_event: hasUpcomingEvent || false,
        event_name: eventName || null,
        event_date: eventDate || null,
        event_type: eventType || null,
        approval_status: 'pending'
      })
      .select()
      .single();

    if (fraternityError) {
      console.error('Fraternity user creation error:', fraternityError);

      // Clean up auth user if fraternity_users creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return res.status(500).json({
        success: false,
        error: 'Failed to create fraternity user profile'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Your account is pending approval.',
      user: {
        id: fraternityUser.id,
        email: fraternityUser.email,
        first_name: fraternityUser.first_name,
        last_name: fraternityUser.last_name,
        approval_status: fraternityUser.approval_status
      }
    });

  } catch (error) {
    console.error('Fraternity signup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/fraternity/me
 * Get current fraternity user's profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get fraternity user profile
    const { data: fraternityUser, error: profileError } = await supabaseAdmin
      .from('fraternity_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !fraternityUser) {
      return res.status(404).json({
        success: false,
        error: 'Fraternity profile not found'
      });
    }

    return res.json({
      success: true,
      user: fraternityUser
    });

  } catch (error) {
    console.error('Get fraternity profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/fraternity-users
 * Get all fraternity users (admin only)
 */
router.get('/admin/users', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const adminToken = req.headers['x-admin-token'];

    // Verify admin token
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const { status, limit = '100', offset = '0' } = req.query;

    let query = supabaseAdmin
      .from('fraternity_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('approval_status', status);
    }

    query = query.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    const { data: users, error } = await query;

    if (error) {
      console.error('Get fraternity users error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch fraternity users'
      });
    }

    return res.json({
      success: true,
      users: users || [],
      count: users?.length || 0
    });

  } catch (error) {
    console.error('Get fraternity users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/admin/fraternity-users/:id/approve
 * Approve a fraternity user (admin only)
 */
router.patch('/admin/users/:id/approve', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const adminToken = req.headers['x-admin-token'];
    const { id } = req.params;

    // Verify admin token
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Update fraternity user approval status
    const { data: updatedUser, error } = await supabaseAdmin
      .from('fraternity_users')
      .update({
        approval_status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Approve fraternity user error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to approve user'
      });
    }

    return res.json({
      success: true,
      message: 'User approved successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Approve fraternity user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/admin/fraternity-users/:id/reject
 * Reject a fraternity user (admin only)
 */
router.patch('/admin/users/:id/reject', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const adminToken = req.headers['x-admin-token'];
    const { id } = req.params;
    const { reason } = req.body;

    // Verify admin token
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Update fraternity user approval status
    const { data: updatedUser, error } = await supabaseAdmin
      .from('fraternity_users')
      .update({
        approval_status: 'rejected',
        rejection_reason: reason || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Reject fraternity user error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to reject user'
      });
    }

    return res.json({
      success: true,
      message: 'User rejected',
      user: updatedUser
    });

  } catch (error) {
    console.error('Reject fraternity user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/admin/fraternity-users/:id
 * Delete a fraternity user (admin only)
 */
router.delete('/admin/users/:id', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const adminToken = req.headers['x-admin-token'];
    const { id } = req.params;

    // Verify admin token
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Get user_id before deleting
    const { data: user } = await supabaseAdmin
      .from('fraternity_users')
      .select('user_id')
      .eq('id', id)
      .single();

    // Delete fraternity user
    const { error: deleteError } = await supabaseAdmin
      .from('fraternity_users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete fraternity user error:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }

    // Also delete auth user if exists
    if (user?.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(user.user_id);
    }

    return res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete fraternity user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
