-- ============================================
-- CHAPTER SHARES TABLE
-- ============================================
-- Allows creating shareable links for chapters and map views
-- Use case: Send prospects/clients preview links for sales/outreach

CREATE TABLE IF NOT EXISTS chapter_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- What is being shared
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('chapter', 'map')),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE, -- For 'chapter' type shares

  -- Map share configuration (for 'map' type shares)
  map_config JSONB, -- { "filter": "big10", "state": "PA", "college": "Penn State" }

  -- Unique shareable token (used in URL)
  share_token VARCHAR(32) UNIQUE NOT NULL,

  -- Who created it & why
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  purpose TEXT, -- "Red Bull outreach - Penn State Sigma Chi alum"

  -- Access control
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = never expires
  is_active BOOLEAN DEFAULT true,
  max_views INTEGER, -- NULL = unlimited

  -- Access level
  show_full_roster BOOLEAN DEFAULT false,
  show_contact_info BOOLEAN DEFAULT false,

  -- Customization
  custom_message TEXT, -- "Hi John! Here's your chapter data..."
  custom_title TEXT, -- Override default title

  -- Analytics
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  unique_viewers JSONB DEFAULT '[]'::jsonb, -- Array of viewer fingerprints

  -- Conversion tracking
  led_to_signup BOOLEAN DEFAULT false,
  signup_user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapter_shares_token ON chapter_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_chapter_shares_chapter ON chapter_shares(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_shares_created_by ON chapter_shares(created_by);
CREATE INDEX IF NOT EXISTS idx_chapter_shares_active ON chapter_shares(is_active);
CREATE INDEX IF NOT EXISTS idx_chapter_shares_expires ON chapter_shares(expires_at);

-- Enable Row Level Security
ALTER TABLE chapter_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own share links
CREATE POLICY "Users can view their own shares"
  ON chapter_shares FOR SELECT
  USING (created_by = auth.uid());

-- RLS Policy: Users can create share links
CREATE POLICY "Users can create shares"
  ON chapter_shares FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- RLS Policy: Users can update their own share links
CREATE POLICY "Users can update their own shares"
  ON chapter_shares FOR UPDATE
  USING (created_by = auth.uid());

-- RLS Policy: Users can delete their own share links
CREATE POLICY "Users can delete their own shares"
  ON chapter_shares FOR DELETE
  USING (created_by = auth.uid());

-- Admin can do everything (service role)
CREATE POLICY "Service role can manage all shares"
  ON chapter_shares FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_chapter_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chapter_shares_updated_at
  BEFORE UPDATE ON chapter_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_chapter_shares_updated_at();

-- Helper function to generate random share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS VARCHAR(32) AS $$
DECLARE
  characters TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(characters, floor(random() * length(characters) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
