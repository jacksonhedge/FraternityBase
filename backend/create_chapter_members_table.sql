-- Chapter members table to store roster data for each chapter
CREATE TABLE IF NOT EXISTS chapter_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  linkedin_url TEXT,
  graduation_year INTEGER,
  major VARCHAR(255),
  member_type VARCHAR(50) DEFAULT 'member',
  is_primary_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapter_members_chapter_id ON chapter_members(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_members_position ON chapter_members(position);
CREATE INDEX IF NOT EXISTS idx_chapter_members_email ON chapter_members(email);

-- Enable Row Level Security
ALTER TABLE chapter_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view members of chapters they've unlocked
CREATE POLICY "Users can view members of unlocked chapters"
  ON chapter_members FOR SELECT
  USING (
    chapter_id IN (
      SELECT chapter_id
      FROM chapter_unlocks
      WHERE company_id = auth.uid()
      AND unlock_type IN ('roster', 'full')
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    )
  );

-- Admin can do everything (service role)
CREATE POLICY "Service role can manage all members"
  ON chapter_members FOR ALL
  USING (auth.role() = 'service_role');
