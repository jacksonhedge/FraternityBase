/**
 * Sponsorship Notification Preferences Router
 * Handles company preferences for sponsorship opportunity email notifications
 */

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Lazy initialization
let supabaseAdmin: any;

function getSupabaseAdmin() {
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
  return supabaseAdmin;
}

// ============================================================================
// NOTIFICATION PREFERENCES ENDPOINTS
// ============================================================================

/**
 * GET /api/sponsorship-notifications/preferences
 * Get notification preferences for a company
 */
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const { data: preferences, error } = await supabaseAdmin
      .from('sponsorship_notification_preferences')
      .select('*')
      .eq('company_id', company_id)
      .single();

    if (error) {
      // If preferences don't exist, create default ones
      if (error.code === 'PGRST116') {
        const { data: newPreferences, error: createError } = await supabaseAdmin
          .from('sponsorship_notification_preferences')
          .insert({
            company_id,
            email_frequency: 'daily',
            send_time_utc: 9
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating preferences:', createError);
          return res.status(500).json({ error: 'Failed to create preferences' });
        }

        return res.json(newPreferences);
      }

      console.error('Error fetching preferences:', error);
      return res.status(500).json({ error: 'Failed to fetch preferences' });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error in GET /api/sponsorship-notifications/preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/sponsorship-notifications/preferences
 * Update notification preferences for a company
 */
router.patch('/preferences', async (req: Request, res: Response) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { company_id } = req.query;
    const updates = req.body;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    // Don't allow updating certain fields
    delete updates.id;
    delete updates.company_id;
    delete updates.created_at;

    const { data: preferences, error } = await supabaseAdmin
      .from('sponsorship_notification_preferences')
      .update(updates)
      .eq('company_id', company_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating preferences:', error);
      return res.status(500).json({ error: 'Failed to update preferences' });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error in PATCH /api/sponsorship-notifications/preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sponsorship-notifications/unsubscribe
 * Unsubscribe from sponsorship notifications
 */
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { company_id, reason } = req.body;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const { data: preferences, error } = await supabaseAdmin
      .from('sponsorship_notification_preferences')
      .update({
        email_frequency: 'never',
        unsubscribed_at: new Date().toISOString(),
        unsubscribe_reason: reason || null
      })
      .eq('company_id', company_id)
      .select()
      .single();

    if (error) {
      console.error('Error unsubscribing:', error);
      return res.status(500).json({ error: 'Failed to unsubscribe' });
    }

    res.json({ message: 'Successfully unsubscribed from sponsorship notifications', preferences });
  } catch (error) {
    console.error('Error in POST /api/sponsorship-notifications/unsubscribe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sponsorship-notifications/resubscribe
 * Resubscribe to sponsorship notifications
 */
router.post('/resubscribe', async (req: Request, res: Response) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { company_id, email_frequency } = req.body;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const { data: preferences, error } = await supabaseAdmin
      .from('sponsorship_notification_preferences')
      .update({
        email_frequency: email_frequency || 'daily',
        unsubscribed_at: null,
        unsubscribe_reason: null
      })
      .eq('company_id', company_id)
      .select()
      .single();

    if (error) {
      console.error('Error resubscribing:', error);
      return res.status(500).json({ error: 'Failed to resubscribe' });
    }

    res.json({ message: 'Successfully resubscribed to sponsorship notifications', preferences });
  } catch (error) {
    console.error('Error in POST /api/sponsorship-notifications/resubscribe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sponsorship-notifications/history
 * Get notification history for a company
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { company_id, limit = '50', offset = '0' } = req.query;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const { data: notifications, error } = await supabaseAdmin
      .from('sponsorship_notifications')
      .select('*')
      .eq('company_id', company_id)
      .order('sent_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) {
      console.error('Error fetching notification history:', error);
      return res.status(500).json({ error: 'Failed to fetch notification history' });
    }

    res.json(notifications);
  } catch (error) {
    console.error('Error in GET /api/sponsorship-notifications/history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sponsorship-notifications/:id/track-open
 * Track when a notification email is opened
 */
router.post('/:id/track-open', async (req: Request, res: Response) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('sponsorship_notifications')
      .update({
        opened_at: new Date().toISOString(),
        open_count: supabaseAdmin.rpc('increment', { amount: 1 })
      })
      .eq('id', id);

    if (error) {
      console.error('Error tracking email open:', error);
      return res.status(500).json({ error: 'Failed to track email open' });
    }

    res.json({ message: 'Email open tracked successfully' });
  } catch (error) {
    console.error('Error in POST /api/sponsorship-notifications/:id/track-open:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sponsorship-notifications/:id/track-click
 * Track when a link in a notification email is clicked
 */
router.post('/:id/track-click', async (req: Request, res: Response) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('sponsorship_notifications')
      .update({
        clicked_at: new Date().toISOString(),
        click_count: supabaseAdmin.rpc('increment', { amount: 1 })
      })
      .eq('id', id);

    if (error) {
      console.error('Error tracking email click:', error);
      return res.status(500).json({ error: 'Failed to track email click' });
    }

    res.json({ message: 'Email click tracked successfully' });
  } catch (error) {
    console.error('Error in POST /api/sponsorship-notifications/:id/track-click:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
