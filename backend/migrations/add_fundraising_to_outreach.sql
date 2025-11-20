-- Add fundraising fields to chapter_outreach table
-- This allows tracking fundraising campaigns for each chapter

ALTER TABLE chapter_outreach
ADD COLUMN IF NOT EXISTS fundraising_goal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS fundraising_current DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fundraising_benefactor TEXT;

-- Add comments for documentation
COMMENT ON COLUMN chapter_outreach.fundraising_goal IS 'Target fundraising amount for the chapter';
COMMENT ON COLUMN chapter_outreach.fundraising_current IS 'Current amount raised';
COMMENT ON COLUMN chapter_outreach.fundraising_benefactor IS 'Who/what the fundraising is for (e.g., "Children''s Hospital", "Make-A-Wish Foundation")';
