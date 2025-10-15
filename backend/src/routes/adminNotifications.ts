import express, { Request, Response } from 'express';
import AdminNotificationService from '../services/AdminNotificationService';

const router = express.Router();

// Initialize notification service
let notificationService: AdminNotificationService | null = null;

function getNotificationService(): AdminNotificationService {
  if (!notificationService) {
    notificationService = new AdminNotificationService(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }
  return notificationService;
}

// Admin authentication middleware
const requireAdminAuth = (req: Request, res: Response, next: Function) => {
  const adminToken = req.headers['x-admin-token'] as string;
  const expectedToken = process.env.ADMIN_TOKEN || process.env.VITE_ADMIN_TOKEN;

  if (!adminToken || adminToken !== expectedToken) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  next();
};

/**
 * GET /api/admin/notifications
 * Get all notifications with optional filters
 */
router.get('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const service = getNotificationService();

    const filters = {
      unreadOnly: req.query.unreadOnly === 'true',
      type: req.query.type as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    const result = await service.getNotifications(filters);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const service = getNotificationService();
    const result = await service.getUnreadCount();

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/notifications/:id/mark-read
 * Mark a notification as read
 */
router.post('/:id/mark-read', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = getNotificationService();

    const result = await service.markAsRead(id);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/notifications/mark-all-read
 * Mark all notifications as read
 */
router.post('/mark-all-read', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const service = getNotificationService();
    const result = await service.markAllAsRead();

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/admin/notifications/:id
 * Delete a notification
 */
router.delete('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = getNotificationService();

    const result = await service.deleteNotification(id);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/notifications/create (for testing/manual creation)
 * Create a new notification
 */
router.post('/create', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { type, title, message, data, relatedCompanyId, relatedUserEmail } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, title, message'
      });
    }

    const service = getNotificationService();
    const result = await service.createNotification({
      type,
      title,
      message,
      data,
      relatedCompanyId,
      relatedUserEmail
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
