/**
 * Sponsorship Opportunities Router
 * Handles CRUD operations for sponsorship opportunities, applications, and saved opportunities
 */

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { SponsorshipNotificationService } from '../services/SponsorshipNotificationService';

const router = express.Router();

// Get Supabase clients - will be initialized by server.ts
let supabaseAdmin: any;
let supabase: any;
let notificationService: any;

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

// Lazy initialization for notification service
function getNotificationService() {
  if (!notificationService && process.env.RESEND_API_KEY) {
    notificationService = new SponsorshipNotificationService(
      process.env.RESEND_API_KEY,
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      'sponsorships@fraternitybase.com',
      process.env.FRONTEND_URL || 'https://fraternitybase.com'
    );
  }
  return notificationService;
}

// ============================================================================
// SPONSORSHIP OPPORTUNITIES ENDPOINTS
// ============================================================================

/**
 * GET /api/sponsorships
 * Browse/search all active sponsorship opportunities
 * Query params: opportunity_type, state, organization, min_budget, max_budget, scope
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const {
      opportunity_type,
      state,
      organization,
      min_budget,
      max_budget,
      scope,
      limit = '50',
      offset = '0'
    } = req.query;

    let query = supabaseAdmin
      .from('sponsorship_opportunities')
      .select(`
        *,
        chapters (
          id,
          chapter_name,
          member_count,
          grade,
          instagram_handle,
          universities (
            name,
            state
          ),
          greek_organizations (
            name
          )
        )
      `)
      .eq('status', 'active')
      .order('posted_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply filters
    if (opportunity_type) {
      query = query.eq('opportunity_type', opportunity_type);
    }

    if (scope) {
      query = query.eq('geographic_scope', scope);
    }

    if (min_budget) {
      query = query.gte('budget_needed', parseInt(min_budget as string));
    }

    if (max_budget) {
      query = query.lte('budget_needed', parseInt(max_budget as string));
    }

    const { data: opportunities, error } = await query;

    if (error) {
      console.error('Error fetching opportunities:', error);
      return res.status(500).json({ error: 'Failed to fetch opportunities' });
    }

    // Filter by state or organization (requires joining)
    let filtered = opportunities || [];

    if (state) {
      filtered = filtered.filter((opp: any) =>
        opp.chapters?.universities?.state === state
      );
    }

    if (organization) {
      filtered = filtered.filter((opp: any) =>
        opp.chapters?.greek_organizations?.name === organization
      );
    }

    res.json({
      opportunities: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error in GET /api/sponsorships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sponsorships/:id
 * Get details of a specific sponsorship opportunity
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { id } = req.params;

    const { data: opportunity, error } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .select(`
        *,
        chapters (
          id,
          chapter_name,
          member_count,
          grade,
          instagram_handle,
          contact_email,
          phone,
          house_address,
          universities (
            name,
            state,
            location
          ),
          greek_organizations (
            name,
            greek_letters,
            national_website,
            colors
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Increment views count
    await supabaseAdmin
      .from('sponsorship_opportunities')
      .update({ views_count: (opportunity.views_count || 0) + 1 })
      .eq('id', id);

    res.json(opportunity);
  } catch (error) {
    console.error('Error in GET /api/sponsorships/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sponsorships
 * Create a new sponsorship opportunity (admin only, or chapter if authenticated)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const {
      chapter_id,
      title,
      description,
      opportunity_type,
      target_industries,
      geographic_scope,
      budget_needed,
      budget_range,
      event_date,
      application_deadline,
      timeline_description,
      expected_reach,
      deliverables,
      is_featured,
      is_urgent,
      expires_at
    } = req.body;

    // Validate required fields
    if (!chapter_id || !title || !opportunity_type) {
      return res.status(400).json({
        error: 'Missing required fields: chapter_id, title, opportunity_type'
      });
    }

    // Create opportunity
    const { data: opportunity, error } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .insert({
        chapter_id,
        title,
        description,
        opportunity_type,
        target_industries,
        geographic_scope: geographic_scope || 'local',
        budget_needed,
        budget_range,
        event_date,
        application_deadline,
        timeline_description,
        expected_reach,
        deliverables,
        is_featured: is_featured || false,
        is_urgent: is_urgent || false,
        expires_at
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating opportunity:', error);
      return res.status(500).json({ error: 'Failed to create opportunity' });
    }

    // If urgent, send immediate notifications
    if (is_urgent) {
      try {
        const notificationService = getNotificationService();
        if (notificationService) {
          await notificationService.sendImmediateNotification(opportunity.id);
        }
      } catch (notifError) {
        console.error('Error sending immediate notification:', notifError);
        // Don't fail the request if notification fails
      }
    }

    res.status(201).json(opportunity);
  } catch (error) {
    console.error('Error in POST /api/sponsorships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/sponsorships/:id
 * Update a sponsorship opportunity (admin only, or chapter if authenticated)
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.id;
    delete updates.created_at;
    delete updates.posted_at;

    const { data: opportunity, error } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating opportunity:', error);
      return res.status(500).json({ error: 'Failed to update opportunity' });
    }

    res.json(opportunity);
  } catch (error) {
    console.error('Error in PATCH /api/sponsorships/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/sponsorships/:id
 * Delete a sponsorship opportunity (admin only, or chapter if authenticated)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { id } = req.params;

    // Instead of deleting, mark as cancelled
    const { error } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      console.error('Error deleting opportunity:', error);
      return res.status(500).json({ error: 'Failed to delete opportunity' });
    }

    res.json({ message: 'Opportunity cancelled successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/sponsorships/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// SPONSORSHIP APPLICATIONS ENDPOINTS
// ============================================================================

/**
 * POST /api/sponsorships/:id/apply
 * Apply to a sponsorship opportunity
 */
router.post('/:id/apply', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { id: opportunity_id } = req.params;
    const {
      company_id,
      message,
      proposed_budget,
      contact_name,
      contact_email,
      contact_phone
    } = req.body;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    // Check if company has already applied
    const { data: existingApplication } = await supabaseAdmin
      .from('sponsorship_applications')
      .select('id')
      .eq('opportunity_id', opportunity_id)
      .eq('company_id', company_id)
      .single();

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this opportunity' });
    }

    // Create application
    const { data: application, error } = await supabaseAdmin
      .from('sponsorship_applications')
      .insert({
        opportunity_id,
        company_id,
        message,
        proposed_budget,
        contact_name,
        contact_email,
        contact_phone,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return res.status(500).json({ error: 'Failed to create application' });
    }

    // Increment applications count
    await supabaseAdmin
      .from('sponsorship_opportunities')
      .update({
        applications_count: supabaseAdmin.rpc('increment', { amount: 1 })
      })
      .eq('id', opportunity_id);

    res.status(201).json(application);
  } catch (error) {
    console.error('Error in POST /api/sponsorships/:id/apply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sponsorships/applications/my
 * Get all applications for the authenticated company
 */
router.get('/applications/my', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const { data: applications, error } = await supabaseAdmin
      .from('sponsorship_applications')
      .select(`
        *,
        sponsorship_opportunities (
          *,
          chapters (
            chapter_name,
            universities (
              name,
              state
            ),
            greek_organizations (
              name
            )
          )
        )
      `)
      .eq('company_id', company_id)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }

    res.json(applications);
  } catch (error) {
    console.error('Error in GET /api/sponsorships/applications/my:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/sponsorships/applications/:id
 * Update an application (withdraw, update message, etc.)
 */
router.patch('/applications/:id', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.id;
    delete updates.opportunity_id;
    delete updates.company_id;
    delete updates.applied_at;

    const { data: application, error } = await supabaseAdmin
      .from('sponsorship_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating application:', error);
      return res.status(500).json({ error: 'Failed to update application' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error in PATCH /api/sponsorships/applications/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// SAVED OPPORTUNITIES ENDPOINTS
// ============================================================================

/**
 * POST /api/sponsorships/:id/save
 * Save/favorite an opportunity
 */
router.post('/:id/save', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { id: opportunity_id } = req.params;
    const { company_id, notes } = req.body;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const { data: saved, error } = await supabaseAdmin
      .from('sponsorship_saved_opportunities')
      .insert({
        opportunity_id,
        company_id,
        notes
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Duplicate key
        return res.status(400).json({ error: 'You have already saved this opportunity' });
      }
      console.error('Error saving opportunity:', error);
      return res.status(500).json({ error: 'Failed to save opportunity' });
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error('Error in POST /api/sponsorships/:id/save:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/sponsorships/:id/save
 * Unsave/unfavorite an opportunity
 */
router.delete('/:id/save', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { id: opportunity_id } = req.params;
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const { error } = await supabaseAdmin
      .from('sponsorship_saved_opportunities')
      .delete()
      .eq('opportunity_id', opportunity_id)
      .eq('company_id', company_id);

    if (error) {
      console.error('Error unsaving opportunity:', error);
      return res.status(500).json({ error: 'Failed to unsave opportunity' });
    }

    res.json({ message: 'Opportunity unsaved successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/sponsorships/:id/save:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sponsorships/saved/my
 * Get all saved opportunities for the authenticated company
 */
router.get('/saved/my', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const { data: saved, error } = await supabaseAdmin
      .from('sponsorship_saved_opportunities')
      .select(`
        *,
        sponsorship_opportunities (
          *,
          chapters (
            chapter_name,
            universities (
              name,
              state
            ),
            greek_organizations (
              name
            )
          )
        )
      `)
      .eq('company_id', company_id)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved opportunities:', error);
      return res.status(500).json({ error: 'Failed to fetch saved opportunities' });
    }

    res.json(saved);
  } catch (error) {
    console.error('Error in GET /api/sponsorships/saved/my:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
