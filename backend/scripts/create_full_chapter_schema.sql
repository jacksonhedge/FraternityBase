-- ============================================
-- COMPREHENSIVE CHAPTER DATA SCHEMA
-- ============================================
-- This adds social media, leadership, contacts, and member rosters to chapters

-- ============================================
-- 1. ADD SOCIAL MEDIA TO CHAPTERS
-- ============================================
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle_official TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_handle TEXT;

-- ============================================
-- 2. POSITIONS TABLE (Leadership role definitions)
-- ============================================
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Position details
  title TEXT NOT NULL, -- "President", "Vice President", "Treasurer"
  category TEXT CHECK (category IN ('Executive', 'Financial', 'Social', 'Philanthropy', 'Recruitment', 'Operations', 'Communications', 'Other')),
  description TEXT,
  responsibilities TEXT[],

  -- Hierarchy
  display_order INTEGER DEFAULT 0, -- For sorting (President = 0, VP = 1, etc.)
  reports_to_title TEXT, -- "President" reports to no one, "Treasurer" reports to "President"

  -- Fraternity-specific (optional - can be null for universal positions)
  greek_organization_id UUID REFERENCES greek_organizations(id) ON DELETE CASCADE,

  -- Standard positions vs custom
  is_standard BOOLEAN DEFAULT true, -- Standard positions shared across all chapters

  UNIQUE(title, greek_organization_id)
);

-- ============================================
-- 3. MEMBERS TABLE (Individual people)
-- ============================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Personal Information
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Academic Information
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  graduation_year INTEGER,
  major TEXT,
  minor TEXT,
  gpa NUMERIC(3,2), -- 0.00 to 4.00

  -- Member Status
  member_status TEXT NOT NULL CHECK (member_status IN ('Active Undergrad', 'Active Graduate', 'Alumni', 'Inactive', 'Transferred')),

  -- Chapter Association
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  greek_organization_id UUID REFERENCES greek_organizations(id) ON DELETE CASCADE,

  -- Fraternity-specific
  pledge_class TEXT, -- "Fall 2022", "Alpha Class"
  initiation_date DATE,
  big_brother_id UUID REFERENCES members(id), -- For family tree

  -- Social & Professional
  linkedin_url TEXT,
  personal_website TEXT,
  hometown TEXT,
  current_city TEXT,

  -- Employment (for alumni)
  company TEXT,
  job_title TEXT,
  industry TEXT,

  -- Engagement
  is_verified BOOLEAN DEFAULT false,
  last_active_at TIMESTAMP WITH TIME ZONE,

  -- Privacy
  profile_visibility TEXT CHECK (profile_visibility IN ('public', 'members_only', 'private')) DEFAULT 'members_only',

  UNIQUE(email, chapter_id)
);

-- ============================================
-- 4. CHAPTER LEADERSHIP (Who holds what position)
-- ============================================
CREATE TABLE IF NOT EXISTS chapter_leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Relationships
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,

  -- Term Details
  term_start DATE NOT NULL,
  term_end DATE,
  is_current BOOLEAN DEFAULT true,

  -- Contact preferences (when someone is a point of contact)
  is_primary_contact BOOLEAN DEFAULT false,
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'linkedin')),

  -- Notes
  notes TEXT,

  UNIQUE(member_id, position_id, term_start)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Positions indexes
CREATE INDEX IF NOT EXISTS idx_positions_org ON positions(greek_organization_id);
CREATE INDEX IF NOT EXISTS idx_positions_standard ON positions(is_standard);

-- Members indexes
CREATE INDEX IF NOT EXISTS idx_members_chapter ON members(chapter_id);
CREATE INDEX IF NOT EXISTS idx_members_org ON members(greek_organization_id);
CREATE INDEX IF NOT EXISTS idx_members_university ON members(university_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(member_status);
CREATE INDEX IF NOT EXISTS idx_members_grad_year ON members(graduation_year);
CREATE INDEX IF NOT EXISTS idx_members_verified ON members(is_verified);

-- Leadership indexes
CREATE INDEX IF NOT EXISTS idx_leadership_member ON chapter_leadership(member_id);
CREATE INDEX IF NOT EXISTS idx_leadership_position ON chapter_leadership(position_id);
CREATE INDEX IF NOT EXISTS idx_leadership_chapter ON chapter_leadership(chapter_id);
CREATE INDEX IF NOT EXISTS idx_leadership_current ON chapter_leadership(is_current);
CREATE INDEX IF NOT EXISTS idx_leadership_primary ON chapter_leadership(is_primary_contact);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_leadership ENABLE ROW LEVEL SECURITY;

-- Positions: Everyone can see standard positions
DROP POLICY IF EXISTS "Standard positions are viewable by everyone" ON positions;
CREATE POLICY "Standard positions are viewable by everyone" ON positions
  FOR SELECT USING (is_standard = true OR auth.role() = 'authenticated');

-- Members: Different visibility based on profile settings and user access
DROP POLICY IF EXISTS "Public member profiles are viewable by everyone" ON members;
CREATE POLICY "Public member profiles are viewable by everyone" ON members
  FOR SELECT USING (
    profile_visibility = 'public'
    OR auth.role() = 'authenticated'
  );

-- Leadership: Public info for current leadership (points of contact)
DROP POLICY IF EXISTS "Current leadership is viewable by everyone" ON chapter_leadership;
CREATE POLICY "Current leadership is viewable by everyone" ON chapter_leadership
  FOR SELECT USING (
    is_current = true
    OR auth.role() = 'authenticated'
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Create triggers
DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapter_leadership_updated_at ON chapter_leadership;
CREATE TRIGGER update_chapter_leadership_updated_at BEFORE UPDATE ON chapter_leadership
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED STANDARD POSITIONS
-- ============================================

INSERT INTO positions (title, category, display_order, is_standard, description) VALUES
  ('President', 'Executive', 0, true, 'Chief executive officer of the chapter'),
  ('Vice President', 'Executive', 1, true, 'Second in command, supports President'),
  ('Treasurer', 'Financial', 2, true, 'Manages chapter finances and budgets'),
  ('Secretary', 'Executive', 3, true, 'Maintains records and documentation'),
  ('Recruitment Chair', 'Recruitment', 4, true, 'Oversees new member recruitment'),
  ('Philanthropy Chair', 'Philanthropy', 5, true, 'Organizes charitable events and fundraising'),
  ('Social Chair', 'Social', 6, true, 'Plans social events and activities'),
  ('Risk Management Chair', 'Operations', 7, true, 'Ensures safety and compliance'),
  ('Scholarship Chair', 'Executive', 8, true, 'Promotes academic excellence'),
  ('New Member Educator', 'Recruitment', 9, true, 'Educates and mentors new members'),
  ('Communications Chair', 'Communications', 10, true, 'Manages chapter communications and marketing'),
  ('Alumni Relations Chair', 'Communications', 11, true, 'Maintains relationships with alumni')
ON CONFLICT (title, greek_organization_id) DO NOTHING;

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View: Current chapter leadership with member info
CREATE OR REPLACE VIEW current_chapter_officers AS
SELECT
  cl.chapter_id,
  c.chapter_name,
  c.greek_letter_name,
  p.title as position_title,
  p.category as position_category,
  p.display_order,
  m.full_name as officer_name,
  m.email as officer_email,
  m.phone as officer_phone,
  m.linkedin_url as officer_linkedin,
  cl.is_primary_contact,
  cl.preferred_contact_method,
  cl.term_start,
  cl.term_end
FROM chapter_leadership cl
JOIN members m ON cl.member_id = m.id
JOIN positions p ON cl.position_id = p.id
JOIN chapters c ON cl.chapter_id = c.id
WHERE cl.is_current = true
ORDER BY c.chapter_name, p.display_order;

-- View: Chapter roster summary
CREATE OR REPLACE VIEW chapter_roster_summary AS
SELECT
  c.id as chapter_id,
  c.chapter_name,
  c.greek_letter_name,
  COUNT(m.id) as total_members,
  COUNT(CASE WHEN m.member_status = 'Active Undergrad' THEN 1 END) as active_undergrads,
  COUNT(CASE WHEN m.member_status = 'Alumni' THEN 1 END) as alumni_count,
  ROUND(AVG(m.gpa), 2) as average_gpa
FROM chapters c
LEFT JOIN members m ON c.id = m.chapter_id
GROUP BY c.id, c.chapter_name, c.greek_letter_name;
