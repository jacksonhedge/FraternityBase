/**
 * Product Roadmap Routes
 * API endpoints for managing product roadmap items
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

interface RoadmapItem {
  id?: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
  quarter?: string;
  category: 'features' | 'data';
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * GET /api/roadmap
 * Get all roadmap items
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('roadmap_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching roadmap items:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch roadmap items' });
  }
});

/**
 * GET /api/roadmap/:id
 * Get a single roadmap item by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('roadmap_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching roadmap item:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch roadmap item' });
  }
});

/**
 * POST /api/roadmap
 * Create a new roadmap item (admin only)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const itemData: RoadmapItem = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || 'planned',
      quarter: req.body.quarter,
      category: req.body.category,
      icon: req.body.icon
    };

    // Basic validation
    if (!itemData.title || !itemData.description || !itemData.category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    if (!['features', 'data'].includes(itemData.category)) {
      return res.status(400).json({ error: 'Category must be either "features" or "data"' });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('roadmap_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating roadmap item:', error);
    res.status(500).json({ error: error.message || 'Failed to create roadmap item' });
  }
});

/**
 * PUT /api/roadmap/:id
 * Update an existing roadmap item (admin only)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: Partial<RoadmapItem> = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      quarter: req.body.quarter,
      category: req.body.category,
      icon: req.body.icon,
      updated_at: new Date().toISOString()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof RoadmapItem] === undefined) {
        delete updateData[key as keyof RoadmapItem];
      }
    });

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('roadmap_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error updating roadmap item:', error);
    res.status(500).json({ error: error.message || 'Failed to update roadmap item' });
  }
});

/**
 * DELETE /api/roadmap/:id
 * Delete a roadmap item (admin only)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('roadmap_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Roadmap item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting roadmap item:', error);
    res.status(500).json({ error: error.message || 'Failed to delete roadmap item' });
  }
});

export default router;
