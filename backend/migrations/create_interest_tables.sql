-- Migration: Create Two-Way Interest System
-- Description: Allow fraternities to mark interest in brands, and companies to mark interest in chapters
-- Date: 2025-01-04

-- =============================================================================
-- Table 1: fraternity_brand_interests
-- Fraternities marking interest in brands/companies
-- =============================================================================
CREATE TABLE IF NOT EXISTS fraternity_brand_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fraternity_user_id UUID NOT NULL REFERENCES fraternity_users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'withdrawn')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one interest per fraternity-brand pair
  UNIQUE(fraternity_user_id, company_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_frat_brand_interests_frat
  ON fraternity_brand_interests(fraternity_user_id);

CREATE INDEX IF NOT EXISTS idx_frat_brand_interests_company
  ON fraternity_brand_interests(company_id);

CREATE INDEX IF NOT EXISTS idx_frat_brand_interests_status
  ON fraternity_brand_interests(status);

CREATE INDEX IF NOT EXISTS idx_frat_brand_interests_created
  ON fraternity_brand_interests(created_at DESC);

-- =============================================================================
-- Table 2: company_chapter_interests
-- Companies marking interest in chapters
-- =============================================================================
CREATE TABLE IF NOT EXISTS company_chapter_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'withdrawn')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one interest per company-chapter pair
  UNIQUE(company_id, chapter_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_company_chapter_interests_company
  ON company_chapter_interests(company_id);

CREATE INDEX IF NOT EXISTS idx_company_chapter_interests_chapter
  ON company_chapter_interests(chapter_id);

CREATE INDEX IF NOT EXISTS idx_company_chapter_interests_status
  ON company_chapter_interests(status);

CREATE INDEX IF NOT EXISTS idx_company_chapter_interests_created
  ON company_chapter_interests(created_at DESC);

-- =============================================================================
-- Auto-update timestamp triggers
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for fraternity_brand_interests
DROP TRIGGER IF EXISTS update_fraternity_brand_interests_updated_at ON fraternity_brand_interests;
CREATE TRIGGER update_fraternity_brand_interests_updated_at
  BEFORE UPDATE ON fraternity_brand_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for company_chapter_interests
DROP TRIGGER IF EXISTS update_company_chapter_interests_updated_at ON company_chapter_interests;
CREATE TRIGGER update_company_chapter_interests_updated_at
  BEFORE UPDATE ON company_chapter_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE fraternity_brand_interests IS 'Tracks which fraternities have marked interest in which brands/companies';
COMMENT ON TABLE company_chapter_interests IS 'Tracks which companies have marked interest in which chapters';

COMMENT ON COLUMN fraternity_brand_interests.status IS 'active = currently interested, withdrawn = no longer interested';
COMMENT ON COLUMN company_chapter_interests.status IS 'active = currently interested, withdrawn = no longer interested';

COMMENT ON COLUMN fraternity_brand_interests.notes IS 'Optional notes from fraternity about why they are interested in this brand';
COMMENT ON COLUMN company_chapter_interests.notes IS 'Optional notes from company about partnership interest in this chapter';
