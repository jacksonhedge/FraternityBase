import { Router, Request, Response } from 'express';
import multer from 'multer';

const router = Router();

// Supabase clients will be injected by server.ts
let supabaseAdmin: any;

export const setSupabaseClient = (client: any) => {
  supabaseAdmin = client;
};

// Configure multer for photo uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// ============================================================================
// CHAPTER LISTING MANAGEMENT
// ============================================================================

/**
 * POST /api/marketplace/listings
 * Create a new marketplace listing
 */
router.post('/listings', async (req: Request, res: Response) => {
  try {
    const {
      chapter_id,
      listing_type,
      title,
      description,
      price,

      // Event fields
      event_name,
      event_type,
      event_date,
      event_venue,
      expected_attendance,

      // Semester/Annual fields
      partnership_start_date,
      partnership_end_date,
      posts_per_month,
      stories_per_month,
      events_included,
      category_exclusive,
      exclusive_category,

      // Performance fields
      cpa_rate,
      cpa_type,
      estimated_conversions,
      preferred_industries,

      // Location
      location_address,
      location_lat,
      location_lng,

      // Deliverables
      deliverables
    } = req.body;

    // Validate required fields
    if (!chapter_id || !listing_type || !title || !price) {
      return res.status(400).json({
        error: 'Missing required fields: chapter_id, listing_type, title, price'
      });
    }

    // Insert listing
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('marketplace_listings')
      .insert({
        chapter_id,
        listing_type,
        title,
        description,
        price,
        event_name,
        event_type,
        event_date,
        event_venue,
        expected_attendance,
        partnership_start_date,
        partnership_end_date,
        posts_per_month,
        stories_per_month,
        events_included,
        category_exclusive,
        exclusive_category,
        cpa_rate,
        cpa_type,
        estimated_conversions,
        preferred_industries,
        location_address,
        location_lat,
        location_lng,
        status: 'draft'
      })
      .select()
      .single();

    if (listingError) {
      console.error('Error creating listing:', listingError);
      return res.status(500).json({ error: 'Failed to create listing', details: listingError.message });
    }

    // Insert deliverables if provided
    if (deliverables && Array.isArray(deliverables) && deliverables.length > 0) {
      const deliverablesToInsert = deliverables.map((d: any, index: number) => ({
        listing_id: listing.id,
        deliverable_type: d.deliverable_type,
        quantity: d.quantity,
        description: d.description,
        display_order: index
      }));

      const { error: deliverablesError } = await supabaseAdmin
        .from('listing_deliverables')
        .insert(deliverablesToInsert);

      if (deliverablesError) {
        console.error('Error creating deliverables:', deliverablesError);
        // Continue anyway - listing is created
      }
    }

    res.json({
      listing_id: listing.id,
      status: listing.status
    });
  } catch (error: any) {
    console.error('Error in POST /listings:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/marketplace/listings/:listingId/photos
 * Upload photos for a listing
 */
router.post('/listings/:listingId/photos', upload.array('photos', 20), async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { category, is_cover } = req.query;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${listingId}/${category || 'general'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('listing-photos')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('listing-photos')
        .getPublicUrl(fileName);

      // Save to database
      const { data: photo, error: photoError } = await supabaseAdmin
        .from('listing_photos')
        .insert({
          listing_id: listingId,
          photo_url: publicUrl,
          photo_category: category || 'general',
          is_cover_photo: is_cover === 'true'
        })
        .select()
        .single();

      if (!photoError && photo) {
        uploadedPhotos.push(photo);
      }
    }

    res.json({
      photos: uploadedPhotos,
      count: uploadedPhotos.length
    });
  } catch (error: any) {
    console.error('Error in POST /listings/:listingId/photos:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * PATCH /api/marketplace/listings/:listingId
 * Update a listing
 */
router.patch('/listings/:listingId', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.view_count;
    delete updateData.inquiry_count;
    delete updateData.booking_count;

    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .update(updateData)
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      return res.status(500).json({ error: 'Failed to update listing', details: error.message });
    }

    res.json({ success: true, listing });
  } catch (error: any) {
    console.error('Error in PATCH /listings/:listingId:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/marketplace/listings/:listingId/publish
 * Submit listing for review
 */
router.post('/listings/:listingId/publish', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .update({
        status: 'pending_review',
        published_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      console.error('Error publishing listing:', error);
      return res.status(500).json({ error: 'Failed to publish listing', details: error.message });
    }

    res.json({ status: listing.status });
  } catch (error: any) {
    console.error('Error in POST /listings/:listingId/publish:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * GET /api/marketplace/listings/my-listings
 * Get chapter's listings
 */
router.get('/listings/my-listings', async (req: Request, res: Response) => {
  try {
    const { chapter_id } = req.query;

    if (!chapter_id) {
      return res.status(400).json({ error: 'chapter_id is required' });
    }

    const { data: listings, error } = await supabaseAdmin
      .from('marketplace_listings')
      .select(`
        *,
        listing_photos(*),
        listing_deliverables(*)
      `)
      .eq('chapter_id', chapter_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
      return res.status(500).json({ error: 'Failed to fetch listings', details: error.message });
    }

    res.json({ listings });
  } catch (error: any) {
    console.error('Error in GET /listings/my-listings:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * DELETE /api/marketplace/listings/:listingId
 * Delete a listing
 */
router.delete('/listings/:listingId', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const { error } = await supabaseAdmin
      .from('marketplace_listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      console.error('Error deleting listing:', error);
      return res.status(500).json({ error: 'Failed to delete listing', details: error.message });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /listings/:listingId:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ============================================================================
// BRAND MARKETPLACE BROWSING
// ============================================================================

/**
 * GET /api/marketplace/listings
 * Search and filter listings for brands
 */
router.get('/listings', async (req: Request, res: Response) => {
  try {
    const {
      listing_type,
      university_id,
      chapter_id,
      min_price,
      max_price,
      min_followers,
      max_followers,
      event_date_start,
      event_date_end,
      category_exclusive,
      industry,
      verified_only,
      available_now,
      sort_by = 'recent',
      page = '1',
      limit = '20'
    } = req.query;

    let query = supabaseAdmin
      .from('marketplace_listings')
      .select(`
        *,
        chapter:chapters(
          id,
          chapter_name,
          member_count,
          verified_partner,
          average_rating,
          total_reviews,
          university:universities(
            id,
            name
          )
        ),
        listing_photos(*)
      `, { count: 'exact' })
      .eq('status', 'active'); // Only show active listings

    // Apply filters
    if (listing_type) {
      query = query.eq('listing_type', listing_type);
    }

    if (chapter_id) {
      query = query.eq('chapter_id', chapter_id);
    }

    if (min_price) {
      query = query.gte('price', parseFloat(min_price as string));
    }

    if (max_price) {
      query = query.lte('price', parseFloat(max_price as string));
    }

    if (event_date_start && event_date_end) {
      query = query
        .gte('event_date', event_date_start)
        .lte('event_date', event_date_end);
    }

    if (category_exclusive === 'true') {
      query = query.eq('category_exclusive', true);
    }

    if (available_now === 'true') {
      query = query.is('expires_at', null).or(`expires_at.gt.${new Date().toISOString()}`);
    }

    // Apply sorting
    switch (sort_by) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('chapter.average_rating', { ascending: false });
        break;
      case 'followers':
        query = query.order('chapter.instagram_followers', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    query = query.range(offset, offset + limitNum - 1);

    const { data: listings, error, count } = await query;

    if (error) {
      console.error('Error fetching listings:', error);
      return res.status(500).json({ error: 'Failed to fetch listings', details: error.message });
    }

    res.json({
      listings: listings || [],
      total: count || 0,
      page: pageNum,
      pages: Math.ceil((count || 0) / limitNum)
    });
  } catch (error: any) {
    console.error('Error in GET /listings:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * GET /api/marketplace/listings/:listingId
 * Get single listing details
 */
router.get('/listings/:listingId', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .select(`
        *,
        chapter:chapters(
          id,
          chapter_name,
          member_count,
          verified_partner,
          average_rating,
          total_reviews,
          total_partnerships_completed,
          university:universities(
            id,
            name
          )
        ),
        photos:listing_photos(*),
        deliverables:listing_deliverables(*),
        reviews:listing_reviews(*)
      `)
      .eq('id', listingId)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      return res.status(404).json({ error: 'Listing not found', details: error.message });
    }

    // Increment view count
    await supabaseAdmin
      .from('marketplace_listings')
      .update({ view_count: (listing.view_count || 0) + 1 })
      .eq('id', listingId);

    // Get similar listings
    const { data: similarListings } = await supabaseAdmin
      .from('marketplace_listings')
      .select(`
        *,
        chapter:chapters(
          chapter_name,
          instagram_followers,
          average_rating,
          university:universities(name)
        ),
        listing_photos(photo_url, is_cover_photo)
      `)
      .eq('listing_type', listing.listing_type)
      .eq('status', 'active')
      .neq('id', listingId)
      .limit(3);

    res.json({
      listing,
      similar_listings: similarListings || []
    });
  } catch (error: any) {
    console.error('Error in GET /listings/:listingId:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/marketplace/listings/:listingId/view
 * Increment view count
 */
router.post('/listings/:listingId/view', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const { error } = await supabaseAdmin.rpc('increment_view_count', {
      listing_id: listingId
    });

    // If RPC doesn't exist, fall back to manual increment
    if (error) {
      const { data: listing } = await supabaseAdmin
        .from('marketplace_listings')
        .select('view_count')
        .eq('id', listingId)
        .single();

      if (listing) {
        await supabaseAdmin
          .from('marketplace_listings')
          .update({ view_count: (listing.view_count || 0) + 1 })
          .eq('id', listingId);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error in POST /listings/:listingId/view:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/marketplace/listings/:listingId/save
 * Save/unsave a listing
 */
router.post('/listings/:listingId/save', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Check if already saved
    const { data: existing } = await supabaseAdmin
      .from('saved_listings')
      .select('id')
      .eq('user_id', user_id)
      .eq('listing_id', listingId)
      .single();

    if (existing) {
      // Unsave
      await supabaseAdmin
        .from('saved_listings')
        .delete()
        .eq('user_id', user_id)
        .eq('listing_id', listingId);

      res.json({ saved: false });
    } else {
      // Save
      await supabaseAdmin
        .from('saved_listings')
        .insert({
          user_id,
          listing_id: listingId
        });

      res.json({ saved: true });
    }
  } catch (error: any) {
    console.error('Error in POST /listings/:listingId/save:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * GET /api/marketplace/saved-listings
 * Get user's saved listings
 */
router.get('/saved-listings', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const { data: savedListings, error } = await supabaseAdmin
      .from('saved_listings')
      .select(`
        *,
        listing:marketplace_listings(
          *,
          chapter:chapters(
            chapter_name,
            instagram_followers,
            average_rating,
            university:universities(name)
          ),
          listing_photos(photo_url, is_cover_photo)
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved listings:', error);
      return res.status(500).json({ error: 'Failed to fetch saved listings', details: error.message });
    }

    res.json({ listings: savedListings || [] });
  } catch (error: any) {
    console.error('Error in GET /saved-listings:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ============================================================================
// INQUIRIES
// ============================================================================

/**
 * POST /api/marketplace/listings/:listingId/inquire
 * Create inquiry for a listing
 */
router.post('/listings/:listingId/inquire', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { message, brand_company_id, sender_user_id } = req.body;

    if (!message || !brand_company_id || !sender_user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: inquiry, error } = await supabaseAdmin
      .from('listing_inquiries')
      .insert({
        listing_id: listingId,
        brand_company_id,
        sender_user_id,
        message
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating inquiry:', error);
      return res.status(500).json({ error: 'Failed to create inquiry', details: error.message });
    }

    // Increment inquiry count - fallback approach
    const { data: currentListing } = await supabaseAdmin
      .from('marketplace_listings')
      .select('inquiry_count')
      .eq('id', listingId)
      .single();

    if (currentListing) {
      await supabaseAdmin
        .from('marketplace_listings')
        .update({ inquiry_count: (currentListing.inquiry_count || 0) + 1 })
        .eq('id', listingId);
    }

    res.json({ inquiry_id: inquiry.id });
  } catch (error: any) {
    console.error('Error in POST /listings/:listingId/inquire:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * GET /api/marketplace/listings/:listingId/inquiries
 * Get inquiries for a listing (chapter side)
 */
router.get('/listings/:listingId/inquiries', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const { data: inquiries, error } = await supabaseAdmin
      .from('listing_inquiries')
      .select(`
        *,
        company:companies(
          id,
          company_name,
          brand_logo_url
        ),
        sender:fraternity_users(
          id,
          full_name,
          email
        )
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inquiries:', error);
      return res.status(500).json({ error: 'Failed to fetch inquiries', details: error.message });
    }

    res.json({ inquiries: inquiries || [] });
  } catch (error: any) {
    console.error('Error in GET /listings/:listingId/inquiries:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/marketplace/pending-listings
 * Get listings pending approval
 */
router.get('/admin/pending-listings', async (req: Request, res: Response) => {
  try {
    const { data: listings, error } = await supabaseAdmin
      .from('marketplace_listings')
      .select(`
        *,
        chapter:chapters(
          chapter_name,
          university:universities(name)
        ),
        listing_photos(*),
        listing_deliverables(*)
      `)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pending listings:', error);
      return res.status(500).json({ error: 'Failed to fetch pending listings', details: error.message });
    }

    res.json({ listings: listings || [] });
  } catch (error: any) {
    console.error('Error in GET /admin/pending-listings:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/admin/marketplace/listings/:listingId/approve
 * Approve a listing
 */
router.post('/admin/listings/:listingId/approve', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const { error } = await supabaseAdmin
      .from('marketplace_listings')
      .update({ status: 'active' })
      .eq('id', listingId);

    if (error) {
      console.error('Error approving listing:', error);
      return res.status(500).json({ error: 'Failed to approve listing', details: error.message });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error in POST /admin/listings/:listingId/approve:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * POST /api/admin/marketplace/listings/:listingId/reject
 * Reject a listing
 */
router.post('/admin/listings/:listingId/reject', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { reason } = req.body;

    const { error } = await supabaseAdmin
      .from('marketplace_listings')
      .update({
        status: 'draft',
        // Could add a rejection_reason field to store this
      })
      .eq('id', listingId);

    if (error) {
      console.error('Error rejecting listing:', error);
      return res.status(500).json({ error: 'Failed to reject listing', details: error.message });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error in POST /admin/listings/:listingId/reject:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
