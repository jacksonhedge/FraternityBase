-- Migration: Add GreekRank integration fields
-- Date: 2025-10-14
-- Purpose: Add Greek letters and GreekRank URL fields for data enrichment

-- Add greek_letters column for Unicode Greek characters (e.g., "ΣΧ" for Sigma Chi)
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS greek_letters VARCHAR(20);

-- Add greekrank_url for external validation and reference
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS greekrank_url VARCHAR(500);

-- Add greekrank_verified flag
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS greekrank_verified BOOLEAN DEFAULT false;

-- Create index for greekrank_url lookups
CREATE INDEX IF NOT EXISTS idx_chapters_greekrank_url ON chapters(greekrank_url);

-- Create index for verified chapters
CREATE INDEX IF NOT EXISTS idx_chapters_greekrank_verified ON chapters(greekrank_verified) WHERE greekrank_verified = true;

-- Add organization_type to chapters (to distinguish fraternities from sororities)
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS organization_type VARCHAR(20);

-- Add check constraint for organization_type
ALTER TABLE chapters
ADD CONSTRAINT check_organization_type
CHECK (organization_type IN ('fraternity', 'sorority', 'professional', 'honor', 'service', NULL));

-- Comment on new columns
COMMENT ON COLUMN chapters.greek_letters IS 'Unicode Greek letters for the organization (e.g., ΣΧ, ΑΤΩ)';
COMMENT ON COLUMN chapters.greekrank_url IS 'Direct link to GreekRank profile page';
COMMENT ON COLUMN chapters.greekrank_verified IS 'Whether this chapter data has been verified against GreekRank';
COMMENT ON COLUMN chapters.organization_type IS 'Type of Greek organization (fraternity, sorority, etc.)';
