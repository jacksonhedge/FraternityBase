-- CRM Tables for FraternityBase Instagram Engagement Management
-- Created: 2025-11-18

-- =============================================================================
-- 1. Chapter Outreach Tracking
-- =============================================================================
CREATE TABLE chapter_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,

  -- Outreach Pipeline Status
  status TEXT NOT NULL DEFAULT 'not_contacted',
  -- Possible values: 'not_contacted', 'reached_out', 'responded', 'in_conversation', 'partnership', 'not_interested', 'archived'

  -- Contact Information
  primary_contact_name TEXT,
  primary_contact_role TEXT, -- e.g., "President", "Social Chair", "Alumni Advisor"
  contact_email TEXT,
  contact_phone TEXT,

  -- Tracking Dates
  last_contact_date TIMESTAMP,
  next_follow_up_date TIMESTAMP,
  first_contacted_at TIMESTAMP,

  -- Engagement Metrics
  engagement_score INTEGER DEFAULT 0, -- Calculated score based on posts, activity, etc.
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_chapter_outreach_chapter ON chapter_outreach(chapter_id);
CREATE INDEX idx_chapter_outreach_status ON chapter_outreach(status);
CREATE INDEX idx_chapter_outreach_next_follow_up ON chapter_outreach(next_follow_up_date);
CREATE INDEX idx_chapter_outreach_engagement_score ON chapter_outreach(engagement_score DESC);

-- =============================================================================
-- 2. Communication Log
-- =============================================================================
CREATE TABLE chapter_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,

  -- Communication Details
  type TEXT NOT NULL, -- 'dm', 'email', 'phone', 'comment', 'meeting', 'other'
  direction TEXT NOT NULL, -- 'outbound', 'inbound'
  subject TEXT,
  content TEXT,

  -- Instagram-specific
  instagram_post_url TEXT,
  instagram_dm_thread_id TEXT,

  -- Metadata
  communicated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID, -- Admin user who logged this
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chapter_communications_chapter ON chapter_communications(chapter_id);
CREATE INDEX idx_chapter_communications_date ON chapter_communications(communicated_at DESC);

-- =============================================================================
-- 3. Instagram Metrics (from APIFY_SCRAPING_PLAN.md)
-- =============================================================================
CREATE TABLE chapter_instagram_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,

  -- Profile Metrics
  followers INTEGER,
  following INTEGER,
  post_count INTEGER,
  is_verified BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,

  -- Profile Data
  profile_pic_url TEXT,
  bio TEXT,
  external_url TEXT,

  -- Metadata
  scraped_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chapter_instagram_metrics_chapter ON chapter_instagram_metrics(chapter_id);
CREATE INDEX idx_chapter_instagram_metrics_scraped ON chapter_instagram_metrics(scraped_at DESC);
CREATE INDEX idx_chapter_instagram_metrics_followers ON chapter_instagram_metrics(followers DESC);

-- =============================================================================
-- 4. Instagram Posts
-- =============================================================================
CREATE TABLE chapter_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,

  -- Post Data
  instagram_post_id TEXT UNIQUE,
  post_url TEXT NOT NULL,
  caption TEXT,
  media_urls TEXT[],

  -- Engagement Metrics
  like_count INTEGER,
  comment_count INTEGER,
  engagement_rate DECIMAL(5,2), -- Calculated: (likes + comments) / followers * 100

  -- Post Classification
  post_type TEXT, -- 'photo', 'video', 'carousel'
  detected_event_type TEXT, -- 'recruitment', 'philanthropy', 'social', 'brotherhood', 'sports', 'other'
  hashtags TEXT[],

  -- Engagement Opportunity Flags
  is_opportunity BOOLEAN DEFAULT false,
  opportunity_reason TEXT, -- Why this is flagged as an opportunity
  opportunity_score INTEGER DEFAULT 0, -- 0-100 score

  -- Dates
  posted_at TIMESTAMP,
  scraped_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chapter_posts_chapter ON chapter_posts(chapter_id);
CREATE INDEX idx_chapter_posts_posted_at ON chapter_posts(posted_at DESC);
CREATE INDEX idx_chapter_posts_is_opportunity ON chapter_posts(is_opportunity);
CREATE INDEX idx_chapter_posts_opportunity_score ON chapter_posts(opportunity_score DESC);

-- =============================================================================
-- 5. Engagement Opportunity Keywords
-- =============================================================================
CREATE TABLE engagement_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'event_type', 'partnership_signal', 'vendor_need', etc.
  weight INTEGER DEFAULT 1, -- How much this keyword boosts opportunity score
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed some default keywords
INSERT INTO engagement_keywords (keyword, category, weight) VALUES
  -- Event Types
  ('recruitment', 'event_type', 10),
  ('rush', 'event_type', 10),
  ('philanthropy', 'event_type', 8),
  ('social', 'event_type', 5),
  ('mixer', 'event_type', 5),
  ('brotherhood', 'event_type', 3),
  ('formals', 'event_type', 7),
  ('date party', 'event_type', 7),

  -- Partnership Signals
  ('sponsor', 'partnership_signal', 15),
  ('partnership', 'partnership_signal', 15),
  ('vendor', 'partnership_signal', 12),
  ('looking for', 'partnership_signal', 8),
  ('need', 'partnership_signal', 5),
  ('seeking', 'partnership_signal', 8),

  -- Vendor Needs
  ('merch', 'vendor_need', 10),
  ('merchandise', 'vendor_need', 10),
  ('apparel', 'vendor_need', 10),
  ('shirts', 'vendor_need', 8),
  ('swag', 'vendor_need', 8),
  ('photographer', 'vendor_need', 12),
  ('DJ', 'vendor_need', 12),
  ('catering', 'vendor_need', 10)
ON CONFLICT (keyword) DO NOTHING;

-- =============================================================================
-- 6. View: Chapter CRM Dashboard
-- =============================================================================
CREATE OR REPLACE VIEW chapter_crm_view AS
SELECT
  c.id as chapter_id,
  c.chapter_name,
  c.instagram_handle,
  c.status as chapter_status,
  u.name as university_name,
  g.name as fraternity_name,

  -- Outreach Data
  co.status as outreach_status,
  co.engagement_score,
  co.priority,
  co.last_contact_date,
  co.next_follow_up_date,
  co.primary_contact_name,
  co.notes,

  -- Instagram Metrics (most recent)
  cim.followers,
  cim.following,
  cim.post_count,
  cim.scraped_at as metrics_updated_at,

  -- Recent Activity
  (SELECT COUNT(*) FROM chapter_posts cp
   WHERE cp.chapter_id = c.id
   AND cp.posted_at > NOW() - INTERVAL '7 days') as posts_last_7_days,

  (SELECT COUNT(*) FROM chapter_posts cp
   WHERE cp.chapter_id = c.id
   AND cp.is_opportunity = true
   AND cp.posted_at > NOW() - INTERVAL '30 days') as opportunities_last_30_days,

  -- Most Recent Post
  (SELECT posted_at FROM chapter_posts cp
   WHERE cp.chapter_id = c.id
   ORDER BY cp.posted_at DESC LIMIT 1) as last_post_date

FROM chapters c
LEFT JOIN universities u ON c.university_id = u.id
LEFT JOIN greek_organizations g ON c.greek_organization_id = g.id
LEFT JOIN chapter_outreach co ON c.id = co.chapter_id
LEFT JOIN LATERAL (
  SELECT * FROM chapter_instagram_metrics
  WHERE chapter_id = c.id
  ORDER BY scraped_at DESC
  LIMIT 1
) cim ON true
WHERE c.instagram_handle IS NOT NULL;

-- =============================================================================
-- 7. Function: Calculate Engagement Score
-- =============================================================================
CREATE OR REPLACE FUNCTION calculate_engagement_score(p_chapter_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_followers INTEGER;
  v_recent_posts INTEGER;
  v_avg_engagement DECIMAL;
  v_opportunities INTEGER;
BEGIN
  -- Get follower count (0-30 points based on followers)
  SELECT followers INTO v_followers
  FROM chapter_instagram_metrics
  WHERE chapter_id = p_chapter_id
  ORDER BY scraped_at DESC
  LIMIT 1;

  v_score := v_score + LEAST(30, COALESCE(v_followers, 0) / 100);

  -- Recent activity (0-25 points: 5 points per post in last 7 days)
  SELECT COUNT(*) INTO v_recent_posts
  FROM chapter_posts
  WHERE chapter_id = p_chapter_id
  AND posted_at > NOW() - INTERVAL '7 days';

  v_score := v_score + LEAST(25, v_recent_posts * 5);

  -- Average engagement rate (0-20 points)
  SELECT AVG(engagement_rate) INTO v_avg_engagement
  FROM chapter_posts
  WHERE chapter_id = p_chapter_id
  AND posted_at > NOW() - INTERVAL '30 days';

  v_score := v_score + LEAST(20, COALESCE(v_avg_engagement, 0));

  -- Opportunity posts (0-25 points: 5 points per opportunity in last 30 days)
  SELECT COUNT(*) INTO v_opportunities
  FROM chapter_posts
  WHERE chapter_id = p_chapter_id
  AND is_opportunity = true
  AND posted_at > NOW() - INTERVAL '30 days';

  v_score := v_score + LEAST(25, v_opportunities * 5);

  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 8. Trigger: Auto-update engagement score
-- =============================================================================
CREATE OR REPLACE FUNCTION update_engagement_score_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chapter_outreach
  SET engagement_score = calculate_engagement_score(NEW.chapter_id),
      updated_at = NOW()
  WHERE chapter_id = NEW.chapter_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chapter_posts_update_score
AFTER INSERT OR UPDATE ON chapter_posts
FOR EACH ROW
EXECUTE FUNCTION update_engagement_score_trigger();

CREATE TRIGGER chapter_instagram_metrics_update_score
AFTER INSERT OR UPDATE ON chapter_instagram_metrics
FOR EACH ROW
EXECUTE FUNCTION update_engagement_score_trigger();
