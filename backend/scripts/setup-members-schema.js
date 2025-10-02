import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const schema = `
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
  chapter_name TEXT,
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

  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('Executive', 'Financial', 'Social', 'Philanthropy', 'Recruitment', 'Operations', 'Other')),
  description TEXT,
  responsibilities TEXT[],

  level INTEGER DEFAULT 0,
  reports_to UUID REFERENCES leadership_positions(id),

  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  is_active BOOLEAN DEFAULT true,

  UNIQUE(chapter_id, title)
);

-- Member leadership assignments
CREATE TABLE IF NOT EXISTS member_leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  position_id UUID REFERENCES leadership_positions(id) ON DELETE CASCADE,

  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  notes TEXT,

  UNIQUE(member_id, position_id, start_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_chapter ON members(chapter_id);
CREATE INDEX IF NOT EXISTS idx_members_org ON members(organization_id);
CREATE INDEX IF NOT EXISTS idx_members_university ON members(university_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_type ON members(member_type);

CREATE INDEX IF NOT EXISTS idx_leadership_chapter ON leadership_positions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_leadership_org ON leadership_positions(organization_id);
CREATE INDEX IF NOT EXISTS idx_leadership_active ON leadership_positions(is_active);

CREATE INDEX IF NOT EXISTS idx_member_leadership_member ON member_leadership(member_id);
CREATE INDEX IF NOT EXISTS idx_member_leadership_position ON member_leadership(position_id);
CREATE INDEX IF NOT EXISTS idx_member_leadership_current ON member_leadership(is_current);

-- RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_leadership ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Members are viewable by authenticated users" ON members;
CREATE POLICY "Members are viewable by authenticated users" ON members
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Leadership positions are viewable by authenticated users" ON leadership_positions;
CREATE POLICY "Leadership positions are viewable by authenticated users" ON leadership_positions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Member leadership is viewable by authenticated users" ON member_leadership;
CREATE POLICY "Member leadership is viewable by authenticated users" ON member_leadership
  FOR SELECT TO authenticated USING (true);
`;

console.log('Setting up members schema in Supabase...\n');

// Execute schema using RPC or direct SQL
try {
  const { data, error } = await supabase.rpc('exec_sql', { sql: schema });

  if (error) {
    console.error('❌ Error creating schema:', error.message);
    console.log('\nNote: You may need to run this SQL directly in the Supabase SQL Editor.');
    console.log('SQL saved to: /tmp/create_members_schema.sql');
  } else {
    console.log('✅ Schema created successfully!');
  }
} catch (err) {
  console.log('ℹ️  RPC method not available. Please run the SQL manually in Supabase SQL Editor:');
  console.log('\n1. Go to https://supabase.com/dashboard/project/gxtspzttmwnnlxwwudct/sql/new');
  console.log('2. Copy the SQL from /tmp/create_members_schema.sql');
  console.log('3. Run it in the SQL Editor');
}
