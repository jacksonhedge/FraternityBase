import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../utils/supabase.js';

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

      // Insert or update email in Supabase
      const { error: upsertError } = await supabase
        .from('travel_map_viewers')
        .upsert(
          { email, token, viewed_at: timestamp },
          { onConflict: 'email,token' }
        );

      if (upsertError) {
        throw upsertError;
      }

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
      const { data, error } = await supabase
        .from('travel_map_viewers')
        .select('id, email, token, viewed_at, created_at')
        .order('viewed_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.status(200).json({
        success: true,
        viewers: data || []
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

      const { data, error } = await supabase
        .from('travel_map_viewers')
        .select('id, email, viewed_at, created_at')
        .eq('token', token)
        .order('viewed_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.status(200).json({
        success: true,
        viewers: data || []
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
