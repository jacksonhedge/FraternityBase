-- College Org Network Database Schema
-- PostgreSQL schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Universities table
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  state VARCHAR(50) NOT NULL,
  student_count INTEGER,
  greek_percentage DECIMAL(3,2),
  website VARCHAR(255),
  logo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Greek Organizations (National/International level)
CREATE TABLE greek_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  greek_letters VARCHAR(20) NOT NULL,
  organization_type VARCHAR(20) CHECK (organization_type IN ('fraternity', 'sorority', 'honor_society')),
  founded_year INTEGER,
  national_website VARCHAR(255),
  total_chapters INTEGER,
  total_members INTEGER,
  colors VARCHAR(255),
  symbols VARCHAR(255),
  philanthropy VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Local Chapters
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  greek_organization_id UUID REFERENCES greek_organizations(id),
  university_id UUID REFERENCES universities(id),
  chapter_name VARCHAR(255) NOT NULL,
  charter_date DATE,
  member_count INTEGER,
  officer_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'colony')),
  gpa_requirement DECIMAL(3,2),
  dues_amount DECIMAL(10,2),
  house_address VARCHAR(255),
  instagram_handle VARCHAR(100),
  facebook_page VARCHAR(255),
  website VARCHAR(255),
  contact_email VARCHAR(255),
  phone VARCHAR(20),
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  partnership_openness VARCHAR(20) DEFAULT 'open' CHECK (partnership_openness IN ('open', 'selective', 'closed')),
  event_frequency INTEGER DEFAULT 0, -- events per month
  philanthropy_focus VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(greek_organization_id, university_id)
);

-- Chapter Officers
CREATE TABLE chapter_officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id),
  name VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  linkedin_profile VARCHAR(255),
  graduation_year INTEGER,
  major VARCHAR(100),
  is_primary_contact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies/Brands
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  company_size VARCHAR(50) CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  website VARCHAR(255),
  logo_url VARCHAR(255),
  headquarters_location VARCHAR(255),
  description TEXT,
  target_demographics JSONB,
  marketing_budget_range VARCHAR(50),
  partnership_types TEXT[], -- ['events', 'ambassadors', 'sponsorships', 'merchandise']
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Company Users
CREATE TABLE company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  position VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  phone VARCHAR(20),
  linkedin_profile VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id),
  name VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'rush', 'social', 'philanthropy', 'formal', 'mixer', 'workshop'
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location VARCHAR(255),
  expected_attendance INTEGER,
  budget_range VARCHAR(50),
  sponsorship_opportunities TEXT[],
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  partnership_status VARCHAR(20) DEFAULT 'open' CHECK (partnership_status IN ('open', 'partnered', 'closed')),
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'partners_only')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Partnerships
CREATE TABLE partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  chapter_id UUID REFERENCES chapters(id),
  event_id UUID REFERENCES events(id) NULL,
  partnership_type VARCHAR(50) NOT NULL, -- 'event_sponsor', 'ambassador', 'merchandise', 'long_term'
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget_amount DECIMAL(10,2),
  deliverables TEXT[],
  notes TEXT,
  success_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ambassador Programs
CREATE TABLE ambassador_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  requirements TEXT[],
  compensation_type VARCHAR(50), -- 'paid', 'commission', 'products', 'experience'
  compensation_amount DECIMAL(10,2),
  duration_months INTEGER,
  target_demographics JSONB,
  application_deadline DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ambassador Applications
CREATE TABLE ambassador_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_program_id UUID REFERENCES ambassador_programs(id),
  chapter_officer_id UUID REFERENCES chapter_officers(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  application_data JSONB,
  applied_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewer_notes TEXT
);

-- Analytics and Tracking
CREATE TABLE engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id),
  metric_date DATE NOT NULL,
  website_views INTEGER DEFAULT 0,
  social_media_engagement INTEGER DEFAULT 0,
  event_attendance INTEGER DEFAULT 0,
  partnership_inquiries INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(chapter_id, metric_date)
);

-- Search and Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) -- 'industry', 'event_type', 'interest', etc.
);

CREATE TABLE chapter_tags (
  chapter_id UUID REFERENCES chapters(id),
  tag_id UUID REFERENCES tags(id),
  PRIMARY KEY (chapter_id, tag_id)
);

-- Saved Searches and Lists
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_user_id UUID REFERENCES company_users(id),
  name VARCHAR(255) NOT NULL,
  search_criteria JSONB NOT NULL,
  alert_frequency VARCHAR(20) DEFAULT 'none' CHECK (alert_frequency IN ('none', 'daily', 'weekly', 'monthly')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_user_id UUID REFERENCES company_users(id),
  chapter_id UUID REFERENCES chapters(id),
  list_name VARCHAR(255) DEFAULT 'favorites',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_user_id, chapter_id, list_name)
);

-- Create indexes for better query performance
CREATE INDEX idx_chapters_university ON chapters(university_id);
CREATE INDEX idx_chapters_org ON chapters(greek_organization_id);
CREATE INDEX idx_chapters_status ON chapters(status);
CREATE INDEX idx_chapters_engagement ON chapters(engagement_score);
CREATE INDEX idx_events_chapter ON events(chapter_id);
CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_partnerships_company ON partnerships(company_id);
CREATE INDEX idx_partnerships_chapter ON partnerships(chapter_id);
CREATE INDEX idx_partnerships_status ON partnerships(status);
CREATE INDEX idx_company_users_email ON company_users(email);
CREATE INDEX idx_engagement_metrics_date ON engagement_metrics(metric_date);
CREATE INDEX idx_engagement_metrics_chapter ON engagement_metrics(chapter_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_greek_organizations_updated_at BEFORE UPDATE ON greek_organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapter_officers_updated_at BEFORE UPDATE ON chapter_officers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_users_updated_at BEFORE UPDATE ON company_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON partnerships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ambassador_programs_updated_at BEFORE UPDATE ON ambassador_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();