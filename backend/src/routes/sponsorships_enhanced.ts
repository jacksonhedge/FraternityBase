/**
 * Enhanced Sponsorship Opportunities Router
 * For Airbnb-style marketplace frontend
 * Includes extended chapter data: social media metrics, photos, achievements
 */

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Supabase clients - lazy initialization
let supabaseAdmin: any;
let supabase: any;

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

// ============================================================================
// SPONSORSHIP OPPORTUNITIES ENDPOINTS - ENHANCED
// ============================================================================

/**
 * GET /api/sponsorships
 * Browse/search all active sponsorship opportunities
 * Enhanced with full chapter data for Airbnb-style cards
 * Query params: type, state, min_budget, max_budget, status, limit, offset
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const {
      type,          // opportunity_type filter
      state,         // university state filter
      min_budget,
      max_budget,
      status = 'active',
      limit = '50',
      offset = '0'
    } = req.query;

    // Build query with extended chapter data
    let query = supabaseAdmin
      .from('sponsorship_opportunities')
      .select(`
        id,
        title,
        description,
        opportunity_type,
        budget_needed,
        budget_range,
        expected_reach,
        event_date,
        event_name,
        event_venue,
        expected_attendance,
        deliverables,
        geographic_scope,
        is_featured,
        is_urgent,
        status,
        posted_at,
        applications_count,
        views_count,
        chapters (
          id,
          chapter_name,
          member_count,
          grade,
          chapter_description,
          instagram_handle,
          instagram_followers,
          instagram_engagement_rate,
          average_post_reach,
          average_story_views,
          tiktok_handle,
          tiktok_followers,
          facebook_page,
          website_url,
          cover_photo_url,
          chapter_gpa,
          national_ranking,
          campus_ranking,
          philanthropy_name,
          philanthropy_amount_raised,
          philanthropy_hours_volunteered,
          years_established,
          greek_organizations (
            name,
            greek_letters
          ),
          universities (
            name,
            state,
            city,
            logo_url
          )
        )
      `)
      .order('is_featured', { ascending: false })
      .order('is_urgent', { ascending: false })
      .order('expected_reach', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply type filter
    if (type && type !== 'all') {
      query = query.eq('opportunity_type', type);
    }

    // Apply budget filters
    if (min_budget) {
      query = query.gte('budget_needed', parseInt(min_budget as string));
    }
    if (max_budget) {
      query = query.lte('budget_needed', parseInt(max_budget as string));
    }

    const { data: opportunities, error } = await query;

    if (error) {
      console.error('Error fetching opportunities:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch opportunities'
      });
    }

    // Post-filter by state if specified (can't filter in join)
    let filtered = opportunities || [];
    if (state && state !== 'All States') {
      filtered = filtered.filter((opp: any) =>
        opp.chapters?.universities?.state === state
      );
    }

    res.json({
      success: true,
      opportunities: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error in GET /api/sponsorships:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/sponsorships/:id
 * Get detailed view of a single sponsorship opportunity
 * Includes full chapter profile data
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
          chapter_description,
          instagram_handle,
          instagram_followers,
          instagram_engagement_rate,
          average_post_reach,
          average_story_views,
          tiktok_handle,
          tiktok_followers,
          facebook_page,
          website_url,
          cover_photo_url,
          chapter_gpa,
          national_ranking,
          campus_ranking,
          philanthropy_name,
          philanthropy_amount_raised,
          philanthropy_hours_volunteered,
          years_established,
          contact_email,
          phone,
          house_address,
          greek_organizations (
            name,
            greek_letters,
            national_website,
            colors
          ),
          universities (
            name,
            state,
            city,
            logo_url,
            location
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }

    res.json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Error in GET /api/sponsorships/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/sponsorships/:id/view
 * Track view count for an opportunity
 * Separate endpoint to avoid incrementing on every GET request
 */
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { id } = req.params;

    // Get current views count
    const { data: opportunity } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .select('views_count')
      .eq('id', id)
      .single();

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }

    // Increment views
    const { error } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .update({ views_count: (opportunity.views_count || 0) + 1 })
      .eq('id', id);

    if (error) {
      console.error('Error tracking view:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to track view'
      });
    }

    res.json({
      success: true,
      message: 'View tracked'
    });
  } catch (error) {
    console.error('Error in POST /api/sponsorships/:id/view:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/sponsorships
 * Create a new sponsorship opportunity
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const {
      chapter_id,
      title,
      description,
      opportunity_type,
      budget_needed,
      budget_range,
      expected_reach,
      event_date,
      event_name,
      event_venue,
      expected_attendance,
      deliverables,
      geographic_scope,
      is_featured,
      is_urgent,
      target_industries,
      application_deadline,
      expires_at
    } = req.body;

    // Validate required fields
    if (!chapter_id || !title || !opportunity_type) {
      return res.status(400).json({
        success: false,
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
        budget_needed,
        budget_range,
        expected_reach,
        event_date,
        event_name,
        event_venue,
        expected_attendance,
        deliverables,
        geographic_scope: geographic_scope || 'local',
        is_featured: is_featured || false,
        is_urgent: is_urgent || false,
        target_industries,
        application_deadline,
        expires_at,
        status: 'active',
        posted_at: new Date().toISOString(),
        views_count: 0,
        applications_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating opportunity:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create opportunity'
      });
    }

    res.status(201).json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Error in POST /api/sponsorships:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/sponsorships/:id
 * Update a sponsorship opportunity
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.id;
    delete updates.posted_at;
    delete updates.views_count;
    delete updates.applications_count;

    const { data: opportunity, error } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating opportunity:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update opportunity'
      });
    }

    res.json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Error in PATCH /api/sponsorships/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/sponsorships/:id
 * Cancel a sponsorship opportunity (soft delete)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { id } = req.params;

    // Soft delete - mark as cancelled
    const { error } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      console.error('Error cancelling opportunity:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel opportunity'
      });
    }

    res.json({
      success: true,
      message: 'Opportunity cancelled successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/sponsorships/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
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
      return res.status(400).json({
        success: false,
        error: 'company_id is required'
      });
    }

    // Check if already applied
    const { data: existingApplication } = await supabaseAdmin
      .from('sponsorship_applications')
      .select('id')
      .eq('opportunity_id', opportunity_id)
      .eq('company_id', company_id)
      .single();

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this opportunity'
      });
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
        status: 'pending',
        applied_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create application'
      });
    }

    // Increment applications count
    const { data: opportunity } = await supabaseAdmin
      .from('sponsorship_opportunities')
      .select('applications_count')
      .eq('id', opportunity_id)
      .single();

    await supabaseAdmin
      .from('sponsorship_opportunities')
      .update({ applications_count: (opportunity?.applications_count || 0) + 1 })
      .eq('id', opportunity_id);

    res.status(201).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Error in POST /api/sponsorships/:id/apply:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/sponsorships/applications/my
 * Get all applications for authenticated company
 */
router.get('/applications/my', async (req: Request, res: Response) => {
  try {
    const { supabaseAdmin } = getSupabaseClients();
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        error: 'company_id is required'
      });
    }

    const { data: applications, error } = await supabaseAdmin
      .from('sponsorship_applications')
      .select(`
        *,
        sponsorship_opportunities (
          *,
          chapters (
            chapter_name,
            instagram_handle,
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
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch applications'
      });
    }

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error in GET /api/sponsorships/applications/my:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
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
      return res.status(400).json({
        success: false,
        error: 'company_id is required'
      });
    }

    const { data: saved, error } = await supabaseAdmin
      .from('sponsorship_saved_opportunities')
      .insert({
        opportunity_id,
        company_id,
        notes,
        saved_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          error: 'You have already saved this opportunity'
        });
      }
      console.error('Error saving opportunity:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save opportunity'
      });
    }

    res.status(201).json({
      success: true,
      saved
    });
  } catch (error) {
    console.error('Error in POST /api/sponsorships/:id/save:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
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
      return res.status(400).json({
        success: false,
        error: 'company_id is required'
      });
    }

    const { error } = await supabaseAdmin
      .from('sponsorship_saved_opportunities')
      .delete()
      .eq('opportunity_id', opportunity_id)
      .eq('company_id', company_id);

    if (error) {
      console.error('Error unsaving opportunity:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to unsave opportunity'
      });
    }

    res.json({
      success: true,
      message: 'Opportunity unsaved successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/sponsorships/:id/save:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
