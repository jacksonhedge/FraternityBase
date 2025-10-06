/**
 * Activity Tracking Routes
 * API endpoints for logging and viewing user click/interaction activity
 */

import { Router, Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const router = Router();

// Lazy initialize Supabase admin client
let supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}

interface ActivityLog {
  user_id?: string;
  company_id?: string;
  session_id: string;
  event_type: string;
  page_path: string;
  element_type?: string;
  element_text?: string;
  element_id?: string;
  metadata?: Record<string, any>;
  user_agent?: string;
  ip_address?: string;
}

/**
 * POST /api/activity/log
 * Log a user interaction/click event
 */
router.post('/log', async (req: Request, res: Response) => {
  try {
    const activityData: ActivityLog = {
      user_id: req.body.user_id || null,
      company_id: req.body.company_id || null,
      session_id: req.body.session_id,
      event_type: req.body.event_type,
      page_path: req.body.page_path,
      element_type: req.body.element_type,
      element_text: req.body.element_text,
      element_id: req.body.element_id,
      metadata: req.body.metadata || {},
      user_agent: req.headers['user-agent'],
      ip_address: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
    };

    const { data, error } = await getSupabaseAdmin()
      .from('user_activity_logs')
      .insert([activityData])
      .select()
      .single();

    if (error) {
      console.error('Error logging activity:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data,
      message: 'Activity logged successfully'
    });
  } catch (error: any) {
    console.error('Error in activity log endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/activity/log/batch
 * Log multiple user interactions in a batch
 */
router.post('/log/batch', async (req: Request, res: Response) => {
  try {
    const activities = req.body.activities || [];

    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'activities must be a non-empty array'
      });
    }

    const activityData = activities.map((activity: any) => ({
      user_id: activity.user_id || null,
      company_id: activity.company_id || null,
      session_id: activity.session_id,
      event_type: activity.event_type,
      page_path: activity.page_path,
      element_type: activity.element_type,
      element_text: activity.element_text,
      element_id: activity.element_id,
      metadata: activity.metadata || {},
      user_agent: req.headers['user-agent'],
      ip_address: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
    }));

    const { data, error } = await getSupabaseAdmin()
      .from('user_activity_logs')
      .insert(activityData)
      .select();

    if (error) {
      console.error('Error logging batch activities:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data,
      count: data?.length || 0,
      message: `${data?.length || 0} activities logged successfully`
    });
  } catch (error: any) {
    console.error('Error in batch activity log endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/activity/recent
 * Get recent user activity logs (admin only)
 */
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const companyId = req.query.company_id as string;
    const eventType = req.query.event_type as string;

    let query = getSupabaseAdmin()
      .from('user_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching activity logs:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data,
      pagination: {
        limit,
        offset,
        count: data?.length || 0,
        total: count
      }
    });
  } catch (error: any) {
    console.error('Error in recent activity endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/activity/stats
 * Get activity statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const daysBack = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get total events
    const { count: totalEvents } = await getSupabaseAdmin()
      .from('user_activity_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get events by type
    const { data: eventsByType } = await getSupabaseAdmin()
      .from('user_activity_logs')
      .select('event_type')
      .gte('created_at', startDate.toISOString());

    const eventTypeCounts = eventsByType?.reduce((acc: Record<string, number>, log: any) => {
      acc[log.event_type] = (acc[log.event_type] || 0) + 1;
      return acc;
    }, {});

    // Get unique users
    const { data: uniqueUserData } = await getSupabaseAdmin()
      .from('user_activity_logs')
      .select('user_id')
      .gte('created_at', startDate.toISOString())
      .not('user_id', 'is', null);

    const uniqueUsers = new Set(uniqueUserData?.map((log: any) => log.user_id)).size;

    // Get unique companies
    const { data: uniqueCompanyData } = await getSupabaseAdmin()
      .from('user_activity_logs')
      .select('company_id')
      .gte('created_at', startDate.toISOString())
      .not('company_id', 'is', null);

    const uniqueCompanies = new Set(uniqueCompanyData?.map((log: any) => log.company_id)).size;

    res.json({
      success: true,
      data: {
        totalEvents: totalEvents || 0,
        eventsByType: eventTypeCounts || {},
        uniqueUsers,
        uniqueCompanies,
        period: {
          start: startDate,
          end: new Date(),
          days: daysBack
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/activity/by-company/:companyId
 * Get activity logs for a specific company
 */
router.get('/by-company/:companyId', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    const { data, error } = await getSupabaseAdmin()
      .from('user_activity_logs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching company activity:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data,
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('Error in company activity endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
