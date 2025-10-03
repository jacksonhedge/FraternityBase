/**
 * Update Tracking Routes
 * API endpoints for managing partner subscriptions and viewing database updates
 */

import { Router, Request, Response } from 'express';
import UpdateTrackingService from '../services/UpdateTrackingService';

const router = Router();

// Initialize service (should use env variables in production)
const updateService = new UpdateTrackingService(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * POST /api/update-tracking/subscribe
 * Subscribe a partner to database updates
 */
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const subscription = await updateService.subscribePartner(req.body);
    res.json({
      success: true,
      data: subscription,
      message: 'Successfully subscribed to updates'
    });
  } catch (error: any) {
    console.error('Error subscribing partner:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/update-tracking/subscriptions/:id
 * Update partner subscription preferences
 */
router.patch('/subscriptions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = await updateService.updateSubscription(id, req.body);
    res.json({
      success: true,
      data: subscription,
      message: 'Subscription updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/update-tracking/updates/recent
 * Get recent database updates (admin view)
 */
router.get('/updates/recent', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const updates = await updateService.getRecentUpdates(limit, offset);
    res.json({
      success: true,
      data: updates,
      pagination: {
        limit,
        offset,
        count: updates.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching recent updates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/update-tracking/updates/stats
 * Get update statistics for a time period
 */
router.get('/updates/stats', async (req: Request, res: Response) => {
  try {
    const daysBack = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const stats = await updateService.getUpdateStats(startDate);
    res.json({
      success: true,
      data: stats,
      period: {
        start: startDate,
        end: new Date(),
        days: daysBack
      }
    });
  } catch (error: any) {
    console.error('Error fetching update stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/update-tracking/updates/manual
 * Manually log a database update (admin only)
 */
router.post('/updates/manual', async (req: Request, res: Response) => {
  try {
    const update = await updateService.logUpdate(req.body);
    res.json({
      success: true,
      data: update,
      message: 'Update logged successfully'
    });
  } catch (error: any) {
    console.error('Error logging update:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/update-tracking/process/:frequency
 * Trigger notification processing for a specific frequency
 * Should be called by cron jobs
 */
router.post('/process/:frequency', async (req: Request, res: Response) => {
  try {
    const { frequency } = req.params;

    if (!['daily', 'weekly', 'biweekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid frequency. Must be daily, weekly, biweekly, or monthly'
      });
    }

    const count = await updateService.processNotifications(
      frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly'
    );

    res.json({
      success: true,
      message: `Processed ${count} notifications for ${frequency} frequency`,
      count
    });
  } catch (error: any) {
    console.error('Error processing notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/update-tracking/notifications/pending
 * Get pending notifications (for email service)
 */
router.get('/notifications/pending', async (req: Request, res: Response) => {
  try {
    const notifications = await updateService.getPendingNotifications();
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error: any) {
    console.error('Error fetching pending notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/update-tracking/notifications/:id/sent
 * Mark notification as sent
 */
router.post('/notifications/:id/sent', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await updateService.markNotificationSent(id);
    res.json({
      success: true,
      message: 'Notification marked as sent'
    });
  } catch (error: any) {
    console.error('Error marking notification as sent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/update-tracking/notifications/:id/failed
 * Mark notification as failed
 */
router.post('/notifications/:id/failed', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error_message } = req.body;
    await updateService.markNotificationFailed(id, error_message);
    res.json({
      success: true,
      message: 'Notification marked as failed'
    });
  } catch (error: any) {
    console.error('Error marking notification as failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
