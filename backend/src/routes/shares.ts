import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import crypto from 'crypto';

const router = express.Router();

// Import pool from database.ts
import pool from '../database';

// Types
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    companyId: string;
  };
}

interface CreateShareBody {
  shareType: 'chapter' | 'map';
  chapterId?: string;
  mapConfig?: {
    filter?: string;
    state?: string;
    college?: string;
  };
  purpose?: string;
  expiresAt?: string;
  maxViews?: number;
  showFullRoster?: boolean;
  showContactInfo?: boolean;
  customMessage?: string;
  customTitle?: string;
}

// Generate unique share token
function generateShareToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

// ============================================
// CREATE SHARE LINK
// ============================================
// POST /api/shares
router.post('/', async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      shareType,
      chapterId,
      mapConfig,
      purpose,
      expiresAt,
      maxViews,
      showFullRoster = false,
      showContactInfo = false,
      customMessage,
      customTitle
    }: CreateShareBody = req.body;

    // Validation
    if (!shareType || !['chapter', 'map'].includes(shareType)) {
      return res.status(400).json({ success: false, error: 'Invalid shareType. Must be "chapter" or "map".' });
    }

    if (shareType === 'chapter' && !chapterId) {
      return res.status(400).json({ success: false, error: 'chapterId is required for chapter shares.' });
    }

    if (shareType === 'map' && !mapConfig) {
      return res.status(400).json({ success: false, error: 'mapConfig is required for map shares.' });
    }

    // Generate unique token
    let shareToken = generateShareToken();

    // Ensure token is unique
    let tokenExists = true;
    while (tokenExists) {
      const checkResult = await client.query(
        'SELECT id FROM chapter_shares WHERE share_token = $1',
        [shareToken]
      );
      if (checkResult.rows.length === 0) {
        tokenExists = false;
      } else {
        shareToken = generateShareToken();
      }
    }

    // Insert share record
    const insertQuery = `
      INSERT INTO chapter_shares (
        share_type,
        chapter_id,
        map_config,
        share_token,
        created_by,
        purpose,
        expires_at,
        max_views,
        show_full_roster,
        show_contact_info,
        custom_message,
        custom_title
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      shareType,
      chapterId || null,
      mapConfig ? JSON.stringify(mapConfig) : null,
      shareToken,
      req.user.id,
      purpose || null,
      expiresAt || null,
      maxViews || null,
      showFullRoster,
      showContactInfo,
      customMessage || null,
      customTitle || null
    ]);

    const share = result.rows[0];
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${frontendUrl}/share/${shareToken}`;

    res.json({
      success: true,
      data: {
        ...share,
        shareUrl
      }
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    res.status(500).json({ success: false, error: 'Failed to create share link' });
  } finally {
    client.release();
  }
});

// ============================================
// GET SHARED CONTENT (Public - No Auth)
// ============================================
// GET /api/shares/:token
router.get('/:token', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { token } = req.params;

    // Fetch share record
    const shareResult = await client.query(
      'SELECT * FROM chapter_shares WHERE share_token = $1',
      [token]
    );

    if (shareResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Share link not found' });
    }

    const share = shareResult.rows[0];

    // Check if active
    if (!share.is_active) {
      return res.status(403).json({ success: false, error: 'This share link has been deactivated' });
    }

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(403).json({ success: false, error: 'This share link has expired' });
    }

    // Check max views
    if (share.max_views && share.view_count >= share.max_views) {
      return res.status(403).json({ success: false, error: 'This share link has reached its maximum views' });
    }

    // Fetch data based on share type
    let data: any = {};

    if (share.share_type === 'chapter') {
      // Fetch chapter data
      const chapterQuery = `
        SELECT
          c.id,
          c.chapter_name,
          c.greek_letter_name,
          c.founded_year,
          c.member_count,
          c.website,
          c.instagram_handle_official,
          u.name as university_name,
          u.logo_url as university_logo,
          go.name as organization_name,
          go.greek_letters,
          go.organization_type
        FROM chapters c
        LEFT JOIN universities u ON c.university_id = u.id
        LEFT JOIN greek_organizations go ON c.greek_organization_id = go.id
        WHERE c.id = $1
      `;

      const chapterResult = await client.query(chapterQuery, [share.chapter_id]);

      if (chapterResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Chapter not found' });
      }

      const chapter = chapterResult.rows[0];

      // Fetch members (limited preview unless showFullRoster)
      let membersQuery;
      let queryParams: any[] = [share.chapter_id];

      if (share.show_full_roster) {
        const contactFields = share.show_contact_info ? 'email, phone,' : '';
        membersQuery = `
          SELECT
            name,
            position,
            ${contactFields}
            graduation_year,
            major,
            member_type
          FROM chapter_members
          WHERE chapter_id = $1
          ORDER BY
            CASE position
              WHEN 'President' THEN 1
              WHEN 'Vice President' THEN 2
              WHEN 'Treasurer' THEN 3
              WHEN 'Secretary' THEN 4
              ELSE 99
            END,
            name
          LIMIT 100
        `;
      } else {
        // Preview mode: show limited members with partial names
        membersQuery = `
          SELECT
            CASE
              WHEN position IN ('President', 'Vice President', 'Treasurer', 'Secretary')
              THEN name
              ELSE SUBSTRING(name, 1, 1) || '. ' || SPLIT_PART(name, ' ', 2)
            END as name,
            position,
            graduation_year,
            member_type
          FROM chapter_members
          WHERE chapter_id = $1
          ORDER BY
            CASE position
              WHEN 'President' THEN 1
              WHEN 'Vice President' THEN 2
              WHEN 'Treasurer' THEN 3
              WHEN 'Secretary' THEN 4
              ELSE 99
            END,
            name
          LIMIT 10
        `;
      }

      const membersResult = await client.query(membersQuery, queryParams);

      data = {
        chapter,
        members: membersResult.rows,
        isPreview: !share.show_full_roster,
        totalMemberCount: chapter.member_count
      };
    } else if (share.share_type === 'map') {
      // Map share - return config for frontend to render
      data = {
        mapConfig: share.map_config,
        isMapShare: true
      };
    }

    res.json({
      success: true,
      data: {
        ...data,
        shareInfo: {
          customMessage: share.custom_message,
          customTitle: share.custom_title,
          shareType: share.share_type,
          createdAt: share.created_at
        }
      }
    });
  } catch (error) {
    console.error('Error fetching shared content:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch shared content' });
  } finally {
    client.release();
  }
});

// ============================================
// TRACK VIEW (Public - No Auth)
// ============================================
// POST /api/shares/:token/view
router.post('/:token/view', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { token } = req.params;
    const { fingerprint } = req.body;

    // Increment view count
    const updateQuery = `
      UPDATE chapter_shares
      SET
        view_count = view_count + 1,
        last_viewed_at = CURRENT_TIMESTAMP,
        unique_viewers = CASE
          WHEN $2 IS NOT NULL AND NOT (unique_viewers @> $2::jsonb)
          THEN unique_viewers || $2::jsonb
          ELSE unique_viewers
        END
      WHERE share_token = $1
      RETURNING view_count
    `;

    const result = await client.query(updateQuery, [
      token,
      fingerprint ? JSON.stringify([fingerprint]) : null
    ]);

    res.json({ success: true, viewCount: result.rows[0]?.view_count || 0 });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ success: false, error: 'Failed to track view' });
  } finally {
    client.release();
  }
});

// ============================================
// GET USER'S SHARE LINKS
// ============================================
// GET /api/shares/my/all
router.get('/my/all', async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const query = `
      SELECT
        cs.*,
        c.chapter_name,
        c.greek_letter_name,
        u.name as university_name
      FROM chapter_shares cs
      LEFT JOIN chapters c ON cs.chapter_id = c.id
      LEFT JOIN universities u ON c.university_id = u.id
      WHERE cs.created_by = $1
      ORDER BY cs.created_at DESC
    `;

    const result = await client.query(query, [req.user.id]);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shares = result.rows.map(share => ({
      ...share,
      shareUrl: `${frontendUrl}/share/${share.share_token}`,
      isExpired: share.expires_at && new Date(share.expires_at) < new Date(),
      hasReachedMaxViews: share.max_views && share.view_count >= share.max_views
    }));

    res.json({ success: true, data: shares });
  } catch (error) {
    console.error('Error fetching user shares:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch share links' });
  } finally {
    client.release();
  }
});

// ============================================
// UPDATE SHARE LINK
// ============================================
// PUT /api/shares/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    const {
      purpose,
      expiresAt,
      maxViews,
      isActive,
      showFullRoster,
      showContactInfo,
      customMessage,
      customTitle
    } = req.body;

    const updateQuery = `
      UPDATE chapter_shares
      SET
        purpose = COALESCE($2, purpose),
        expires_at = COALESCE($3, expires_at),
        max_views = COALESCE($4, max_views),
        is_active = COALESCE($5, is_active),
        show_full_roster = COALESCE($6, show_full_roster),
        show_contact_info = COALESCE($7, show_contact_info),
        custom_message = COALESCE($8, custom_message),
        custom_title = COALESCE($9, custom_title)
      WHERE id = $1 AND created_by = $10
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      id,
      purpose,
      expiresAt,
      maxViews,
      isActive,
      showFullRoster,
      showContactInfo,
      customMessage,
      customTitle,
      req.user.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Share link not found or unauthorized' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating share link:', error);
    res.status(500).json({ success: false, error: 'Failed to update share link' });
  } finally {
    client.release();
  }
});

// ============================================
// DELETE SHARE LINK
// ============================================
// DELETE /api/shares/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    const result = await client.query(
      'DELETE FROM chapter_shares WHERE id = $1 AND created_by = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Share link not found or unauthorized' });
    }

    res.json({ success: true, message: 'Share link deleted successfully' });
  } catch (error) {
    console.error('Error deleting share link:', error);
    res.status(500).json({ success: false, error: 'Failed to delete share link' });
  } finally {
    client.release();
  }
});

export default router;
