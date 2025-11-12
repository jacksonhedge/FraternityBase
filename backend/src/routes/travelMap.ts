import { Router, Request, Response } from 'express';
import { query, body, validationResult } from 'express-validator';
import { db } from '../database.js';

const router = Router();

/**
 * POST /api/travel-map/submit-email
 * Save email of travel map viewer
 */
router.post(
  '/submit-email',
  [
    body('email').isEmail().normalizeEmail(),
    body('token').notEmpty().trim(),
    body('timestamp').isISO8601()
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Invalid input', details: errors.array() });
        return;
      }

      const { email, token, timestamp } = req.body;

      // Insert or update email in database (SQLite syntax)
      const stmt = db.prepare(`
        INSERT INTO travel_map_viewers (email, token, viewed_at)
        VALUES (?, ?, ?)
        ON CONFLICT(email, token) DO UPDATE SET viewed_at = excluded.viewed_at
      `);

      stmt.run(email, token, timestamp);

      res.status(200).json({
        success: true,
        message: 'Email saved successfully'
      });
    } catch (error: any) {
      console.error('Error saving travel map viewer email:', error);
      res.status(500).json({
        error: 'Failed to save email',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/travel-map/viewers
 * Get all travel map viewers (admin only)
 */
router.get(
  '/viewers',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const stmt = db.prepare(`
        SELECT id, email, token, viewed_at, created_at
        FROM travel_map_viewers
        ORDER BY viewed_at DESC
      `);

      const rows = stmt.all();

      res.status(200).json({
        success: true,
        viewers: rows
      });
    } catch (error: any) {
      console.error('Error fetching travel map viewers:', error);
      res.status(500).json({
        error: 'Failed to fetch viewers',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/travel-map/viewers/:token
 * Get viewers for a specific token
 */
router.get(
  '/viewers/:token',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      const stmt = db.prepare(`
        SELECT id, email, viewed_at, created_at
        FROM travel_map_viewers
        WHERE token = ?
        ORDER BY viewed_at DESC
      `);

      const rows = stmt.all(token);

      res.status(200).json({
        success: true,
        viewers: rows
      });
    } catch (error: any) {
      console.error('Error fetching travel map viewers for token:', error);
      res.status(500).json({
        error: 'Failed to fetch viewers',
        details: error.message
      });
    }
  }
);

export default router;
