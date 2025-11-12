-- Migration: Add Enhanced Marketplace Fields for Airbnb-Style Frontend
-- Date: 2025-11-04
-- Purpose: Ensure all fields required by the new marketplace frontend exist

-- ============================================================================
-- CHAPTERS TABLE - Add social media and achievement fields
-- ============================================================================

-- Social Media Metrics
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS instagram_followers INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS instagram_engagement_rate DECIMAL(5,2);
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS average_post_reach INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS average_story_views INTEGER;

ALTER TABLE chapters ADD COLUMN IF NOT EXISTS tiktok_handle TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS tiktok_followers INTEGER;

ALTER TABLE chapters ADD COLUMN IF NOT EXISTS facebook_page TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Visual Assets
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Chapter Achievements
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS chapter_description TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS chapter_gpa DECIMAL(3,2);
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS national_ranking TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS campus_ranking TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS years_established INTEGER;

-- Philanthropy
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS philanthropy_name TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS philanthropy_amount_raised INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS philanthropy_hours_volunteered INTEGER;

-- ============================================================================
-- SPONSORSHIP_OPPORTUNITIES TABLE - Add enhanced fields
-- ============================================================================

-- Event Details
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS event_name TEXT;
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS event_venue TEXT;
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS expected_attendance INTEGER;

-- Deliverables (array of strings)
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS deliverables TEXT[];

-- Geographic Scope
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS geographic_scope TEXT DEFAULT 'local';

-- Budget Range (for display purposes, e.g. "$2,500-$5,000")
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS budget_range TEXT;

-- Metrics
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0;

-- Ensure required fields exist
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE;
ALTER TABLE sponsorship_opportunities ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- UNIVERSITIES TABLE - Add logo field
-- ============================================================================

ALTER TABLE universities ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS city TEXT;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for filtering opportunities by type and status
CREATE INDEX IF NOT EXISTS idx_sponsorship_opportunities_type_status
ON sponsorship_opportunities(opportunity_type, status);

-- Index for filtering by featured/urgent
CREATE INDEX IF NOT EXISTS idx_sponsorship_opportunities_featured_urgent
ON sponsorship_opportunities(is_featured, is_urgent) WHERE status = 'active';

-- Index for budget range queries
CREATE INDEX IF NOT EXISTS idx_sponsorship_opportunities_budget
ON sponsorship_opportunities(budget_needed) WHERE status = 'active';

-- Index for chapter lookups with social media
CREATE INDEX IF NOT EXISTS idx_chapters_instagram
ON chapters(instagram_handle) WHERE instagram_handle IS NOT NULL;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Note: Update this with your actual chapter_id after creating chapters
-- This is an example showing the structure

/*
-- Example: Insert a test sponsorship opportunity
INSERT INTO sponsorship_opportunities (
  chapter_id,
  title,
  description,
  opportunity_type,
  budget_needed,
  budget_range,
  expected_reach,
  event_date,
  event_name,
  event_venue,
  expected_attendance,
  deliverables,
  geographic_scope,
  is_featured,
  is_urgent,
  status,
  posted_at,
  views_count,
  applications_count
) VALUES (
  'YOUR_CHAPTER_ID_HERE',
  'Spring Formal Sponsorship',
  'Looking for a sponsor for our annual spring formal event with 200+ students. This is a premium opportunity to reach college-aged consumers in a luxury event setting.',
  'event_sponsor',
  2500,
  '$2,500 - $5,000',
  5000,
  '2025-04-15',
  'Spring Formal 2025',
  'Hilton Downtown',
  200,
  ARRAY[
    '3 Instagram posts (5,000 impressions)',
    '5 Instagram stories (1,200 views)',
    'Event banner placement (200 attendees)',
    'Logo on 200 event t-shirts',
    'Email blast to 85 members',
    'Exclusive booth space at venue'
  ],
  'local',
  true,  -- featured
  false, -- urgent
  'active',
  NOW(),
  0,
  0
);
*/

-- ============================================================================
-- VERIFY MIGRATION
-- ============================================================================

-- Check that all columns exist
DO $$
BEGIN
  -- Check chapters table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'instagram_followers'
  ) THEN
    RAISE NOTICE 'Warning: instagram_followers column not found in chapters table';
  END IF;

  -- Check sponsorship_opportunities table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsorship_opportunities' AND column_name = 'deliverables'
  ) THEN
    RAISE NOTICE 'Warning: deliverables column not found in sponsorship_opportunities table';
  END IF;

  RAISE NOTICE 'Migration verification complete';
END $$;

-- ============================================================================
-- GRANT PERMISSIONS (if using RLS)
-- ============================================================================

-- Allow public read access to opportunities
GRANT SELECT ON sponsorship_opportunities TO anon, authenticated;
GRANT SELECT ON chapters TO anon, authenticated;
GRANT SELECT ON universities TO anon, authenticated;
GRANT SELECT ON greek_organizations TO anon, authenticated;

-- Allow authenticated users to create applications
GRANT INSERT ON sponsorship_applications TO authenticated;
GRANT INSERT ON sponsorship_saved_opportunities TO authenticated;

COMMIT;
