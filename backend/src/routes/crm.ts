import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

/**
 * GET /api/admin/crm/dashboard
 * Get CRM dashboard data with all chapters and their outreach status
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();

    const { data: chapters, error } = await supabase
      .from('chapter_crm_view')
      .select('*')
      .order('engagement_score', { ascending: false });

    if (error) throw error;

    // Group chapters by outreach status for Kanban board
    const grouped = {
      not_contacted: chapters?.filter(c => !c.outreach_status || c.outreach_status === 'not_contacted') || [],
      reached_out: chapters?.filter(c => c.outreach_status === 'reached_out') || [],
      responded: chapters?.filter(c => c.outreach_status === 'responded') || [],
      in_conversation: chapters?.filter(c => c.outreach_status === 'in_conversation') || [],
      partnership: chapters?.filter(c => c.outreach_status === 'partnership') || [],
      not_interested: chapters?.filter(c => c.outreach_status === 'not_interested') || [],
      archived: chapters?.filter(c => c.outreach_status === 'archived') || []
    };

    res.json({
      success: true,
      chapters: chapters || [],
      grouped,
      summary: {
        total: chapters?.length || 0,
        not_contacted: grouped.not_contacted.length,
        reached_out: grouped.reached_out.length,
        responded: grouped.responded.length,
        in_conversation: grouped.in_conversation.length,
        partnership: grouped.partnership.length,
        not_interested: grouped.not_interested.length,
        archived: grouped.archived.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching CRM dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch CRM dashboard',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/crm/chapters/:chapterId
 * Get detailed information for a specific chapter
 */
router.get('/chapters/:chapterId', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const supabase = getSupabase();

    // Get chapter CRM view
    const { data: chapter, error: chapterError } = await supabase
      .from('chapter_crm_view')
      .select('*')
      .eq('chapter_id', chapterId)
      .single();

    if (chapterError) throw chapterError;

    // Get outreach details
    const { data: outreach } = await supabase
      .from('chapter_outreach')
      .select('*')
      .eq('chapter_id', chapterId)
      .maybeSingle();

    // Get communication log
    const { data: communications } = await supabase
      .from('chapter_communications')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('communicated_at', { ascending: false })
      .limit(20);

    // Get recent posts
    const { data: posts } = await supabase
      .from('chapter_posts')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('posted_at', { ascending: false })
      .limit(10);

    // Get leadership (officers)
    const { data: leadership } = await supabase
      .from('chapter_officers')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get chapter size (count of officers/members)
    const { count: chapterSize } = await supabase
      .from('chapter_officers')
      .select('*', { count: 'exact', head: true })
      .eq('chapter_id', chapterId);

    res.json({
      success: true,
      chapter,
      outreach,
      communications: communications || [],
      posts: posts || [],
      leadership: leadership || [],
      chapter_size: chapterSize || 0
    });
  } catch (error: any) {
    console.error('Error fetching chapter details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chapter details',
      details: error.message
    });
  }
});

/**
 * POST /api/admin/crm/chapters/:chapterId/outreach
 * Create or update outreach record for a chapter
 */
router.post('/chapters/:chapterId/outreach', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const {
      status,
      primary_contact_name,
      primary_contact_role,
      contact_email,
      contact_phone,
      next_follow_up_date,
      priority,
      notes
    } = req.body;

    const supabase = getSupabase();

    // Check if outreach record exists
    const { data: existing } = await supabase
      .from('chapter_outreach')
      .select('id')
      .eq('chapter_id', chapterId)
      .maybeSingle();

    let result;
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('chapter_outreach')
        .update({
          status,
          primary_contact_name,
          primary_contact_role,
          contact_email,
          contact_phone,
          next_follow_up_date,
          priority,
          notes,
          last_contact_date: status === 'reached_out' || status === 'responded' ? new Date().toISOString() : undefined,
          first_contacted_at: existing ? undefined : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('chapter_id', chapterId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('chapter_outreach')
        .insert({
          chapter_id: chapterId,
          status: status || 'not_contacted',
          primary_contact_name,
          primary_contact_role,
          contact_email,
          contact_phone,
          next_follow_up_date,
          priority: priority || 'medium',
          notes,
          first_contacted_at: status === 'reached_out' ? new Date().toISOString() : undefined,
          last_contact_date: status === 'reached_out' || status === 'responded' ? new Date().toISOString() : undefined
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({
      success: true,
      outreach: result
    });
  } catch (error: any) {
    console.error('Error updating outreach:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update outreach',
      details: error.message
    });
  }
});

/**
 * PATCH /api/admin/crm/chapters/:chapterId/status
 * Update just the outreach status (for Kanban drag-and-drop)
 */
router.patch('/chapters/:chapterId/status', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const validStatuses = ['not_contacted', 'reached_out', 'responded', 'in_conversation', 'partnership', 'not_interested', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const supabase = getSupabase();

    // Check if outreach record exists
    const { data: existing } = await supabase
      .from('chapter_outreach')
      .select('id')
      .eq('chapter_id', chapterId)
      .maybeSingle();

    let result;
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('chapter_outreach')
        .update({
          status,
          last_contact_date: status === 'reached_out' || status === 'responded' ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('chapter_id', chapterId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new record with this status
      const { data, error } = await supabase
        .from('chapter_outreach')
        .insert({
          chapter_id: chapterId,
          status,
          first_contacted_at: status === 'reached_out' ? new Date().toISOString() : undefined,
          last_contact_date: status === 'reached_out' || status === 'responded' ? new Date().toISOString() : undefined
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({
      success: true,
      outreach: result
    });
  } catch (error: any) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      details: error.message
    });
  }
});

/**
 * POST /api/admin/crm/chapters/:chapterId/communications
 * Log a communication with a chapter
 */
router.post('/chapters/:chapterId/communications', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const {
      type,
      direction,
      subject,
      content,
      instagram_post_url,
      instagram_dm_thread_id,
      communicated_at
    } = req.body;

    if (!type || !direction) {
      return res.status(400).json({
        success: false,
        error: 'Type and direction are required'
      });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('chapter_communications')
      .insert({
        chapter_id: chapterId,
        type,
        direction,
        subject,
        content,
        instagram_post_url,
        instagram_dm_thread_id,
        communicated_at: communicated_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update last_contact_date in outreach record
    await supabase
      .from('chapter_outreach')
      .update({
        last_contact_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('chapter_id', chapterId);

    res.json({
      success: true,
      communication: data
    });
  } catch (error: any) {
    console.error('Error logging communication:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log communication',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/crm/chapters/:chapterId/posts
 * Get Instagram posts for a chapter
 */
router.get('/chapters/:chapterId/posts', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const { limit = 20, opportunities_only = false } = req.query;

    const supabase = getSupabase();

    let query = supabase
      .from('chapter_posts')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('posted_at', { ascending: false })
      .limit(parseInt(limit as string));

    if (opportunities_only === 'true') {
      query = query.eq('is_opportunity', true);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      posts: posts || []
    });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/crm/opportunities
 * Get all recent engagement opportunities across all chapters
 */
router.get('/opportunities', async (req: Request, res: Response) => {
  try {
    const { days = 30, limit = 50 } = req.query;

    const supabase = getSupabase();

    const { data: opportunities, error } = await supabase
      .from('chapter_posts')
      .select(`
        *,
        chapters:chapter_id (
          id,
          chapter_name,
          instagram_handle,
          universities (name),
          greek_organizations (name)
        )
      `)
      .eq('is_opportunity', true)
      .gte('posted_at', new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000).toISOString())
      .order('opportunity_score', { ascending: false })
      .limit(parseInt(limit as string));

    if (error) throw error;

    res.json({
      success: true,
      opportunities: opportunities || []
    });
  } catch (error: any) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunities',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/crm/follow-ups
 * Get chapters that need follow-up
 */
router.get('/follow-ups', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();

    const { data: followUps, error } = await supabase
      .from('chapter_outreach')
      .select(`
        *,
        chapters:chapter_id (
          id,
          chapter_name,
          instagram_handle,
          universities (name),
          greek_organizations (name)
        )
      `)
      .not('next_follow_up_date', 'is', null)
      .lte('next_follow_up_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('next_follow_up_date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      follow_ups: followUps || []
    });
  } catch (error: any) {
    console.error('Error fetching follow-ups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch follow-ups',
      details: error.message
    });
  }
});

/**
 * POST /api/admin/crm/bulk-status-update
 * Update status for multiple chapters at once
 */
router.post('/bulk-status-update', async (req: Request, res: Response) => {
  try {
    const { chapter_ids, status } = req.body;

    if (!Array.isArray(chapter_ids) || chapter_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'chapter_ids array is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const supabase = getSupabase();

    // For each chapter, upsert the outreach record
    const results = [];
    for (const chapterId of chapter_ids) {
      const { data: existing } = await supabase
        .from('chapter_outreach')
        .select('id')
        .eq('chapter_id', chapterId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('chapter_outreach')
          .update({
            status,
            updated_at: new Date().toISOString()
          })
          .eq('chapter_id', chapterId);
      } else {
        await supabase
          .from('chapter_outreach')
          .insert({
            chapter_id: chapterId,
            status
          });
      }

      results.push({ chapter_id: chapterId, status });
    }

    res.json({
      success: true,
      updated: results.length,
      results
    });
  } catch (error: any) {
    console.error('Error bulk updating status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update status',
      details: error.message
    });
  }
});

export default router;
