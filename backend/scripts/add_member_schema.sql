-- ====================
-- CHAPTER SCHEMA UPDATES
-- ====================

-- Add new fields to chapters table for fraternity-specific data
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS greek_letter_name TEXT,
ADD COLUMN IF NOT EXISTS chapter_type TEXT CHECK (chapter_type IN ('Undergraduate', 'Associate', 'Alumni')),
ADD COLUMN IF NOT EXISTS fraternity_province TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state_province TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

-- Create index for faster lookups by greek letter name
CREATE INDEX IF NOT EXISTS idx_chapters_greek_letter ON chapters(greek_letter_name);
CREATE INDEX IF NOT EXISTS idx_chapters_type ON chapters(chapter_type);
CREATE INDEX IF NOT EXISTS idx_chapters_province ON chapters(fraternity_province);

-- ====================
-- MEMBERS SCHEMA
-- ====================

-- Members table for all fraternity/sorority members
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Personal Information
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Member Status
  member_type TEXT NOT NULL CHECK (member_type IN ('Undergrad', 'Grad', 'Alumni')),
  status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Alumni')),

  -- Chapter Association
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,

  -- Chapter-specific details
  chapter_name TEXT, -- Greek letter designation (e.g., "Alpha Chi")
  pledge_class TEXT,
  initiation_date DATE,
  graduation_year INTEGER,

  -- Metadata
  is_verified BOOLEAN DEFAULT false,
  last_active_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(email, chapter_id)
);

-- Leadership positions table
CREATE TABLE IF NOT EXISTS leadership_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Position Details
  title TEXT NOT NULL, -- e.g., "President", "Vice President", "Treasurer"
  category TEXT CHECK (category IN ('Executive', 'Financial', 'Social', 'Philanthropy', 'Recruitment', 'Operations', 'Other')),
  description TEXT,
  responsibilities TEXT[],

  -- Hierarchy
  level INTEGER DEFAULT 0, -- 0 = executive board, 1 = committee chairs, etc.
  reports_to UUID REFERENCES leadership_positions(id),

  -- Chapter Association
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Term Information
  is_active BOOLEAN DEFAULT true,

  UNIQUE(chapter_id, title)
);

-- Member leadership assignments (junction table)
CREATE TABLE IF NOT EXISTS member_leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Relationships
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  position_id UUID REFERENCES leadership_positions(id) ON DELETE CASCADE,

  -- Term Details
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,

  -- Additional Info
  notes TEXT,

  UNIQUE(member_id, position_id, start_date)
);

-- ====================
-- INDEXES
-- ====================

-- Members indexes
CREATE INDEX IF NOT EXISTS idx_members_chapter ON members(chapter_id);
CREATE INDEX IF NOT EXISTS idx_members_org ON members(organization_id);
CREATE INDEX IF NOT EXISTS idx_members_university ON members(university_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_type ON members(member_type);

-- Leadership positions indexes
CREATE INDEX IF NOT EXISTS idx_leadership_chapter ON leadership_positions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_leadership_org ON leadership_positions(organization_id);
CREATE INDEX IF NOT EXISTS idx_leadership_active ON leadership_positions(is_active);

-- Member leadership indexes
CREATE INDEX IF NOT EXISTS idx_member_leadership_member ON member_leadership(member_id);
CREATE INDEX IF NOT EXISTS idx_member_leadership_position ON member_leadership(position_id);
CREATE INDEX IF NOT EXISTS idx_member_leadership_current ON member_leadership(is_current);

-- ====================
-- ROW LEVEL SECURITY
-- ====================

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_leadership ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Members are viewable by authenticated users" ON members;
DROP POLICY IF EXISTS "Leadership positions are viewable by authenticated users" ON leadership_positions;
DROP POLICY IF EXISTS "Member leadership is viewable by authenticated users" ON member_leadership;

-- Create policies for authenticated users
CREATE POLICY "Members are viewable by authenticated users" ON members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Leadership positions are viewable by authenticated users" ON leadership_positions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Member leadership is viewable by authenticated users" ON member_leadership
  FOR SELECT TO authenticated USING (true);

-- ====================
-- TRIGGERS
-- ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leadership_positions_updated_at ON leadership_positions;
CREATE TRIGGER update_leadership_positions_updated_at BEFORE UPDATE ON leadership_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_member_leadership_updated_at ON member_leadership;
CREATE TRIGGER update_member_leadership_updated_at BEFORE UPDATE ON member_leadership
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
