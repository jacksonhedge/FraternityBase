-- Migration: Create coming_tomorrow table for Dashboard "Coming Tomorrow" section
-- This allows admins to manage upcoming chapter/roster additions

CREATE TABLE IF NOT EXISTS coming_tomorrow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_name TEXT NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  anticipated_score NUMERIC(2, 1) CHECK (anticipated_score >= 0 AND anticipated_score <= 5.0),
  update_type TEXT NOT NULL CHECK (update_type IN ('new_chapter', 'roster_update', 'new_sorority')),
  expected_member_count INTEGER,
  chapter_name TEXT, -- Optional: e.g., "Delta Tau Delta", "Kappa Sigma"
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '1 day',
  is_displayed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_coming_tomorrow_scheduled_date ON coming_tomorrow(scheduled_date);
CREATE INDEX idx_coming_tomorrow_is_displayed ON coming_tomorrow(is_displayed);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coming_tomorrow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coming_tomorrow_updated_at
BEFORE UPDATE ON coming_tomorrow
FOR EACH ROW
EXECUTE FUNCTION update_coming_tomorrow_updated_at();
