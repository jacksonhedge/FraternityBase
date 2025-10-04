-- Add five_star_rating to chapters table
-- Five-star chapters are those with comprehensive contact information

ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS five_star_rating BOOLEAN DEFAULT FALSE;

-- Create index for fast five-star chapter queries
CREATE INDEX IF NOT EXISTS idx_chapters_five_star ON chapters(five_star_rating) WHERE five_star_rating = TRUE;

-- Add comment
COMMENT ON COLUMN chapters.five_star_rating IS 'True if chapter has comprehensive data (65+ members, full contact info, social media)';

-- Update Michigan Sigma Chi to be five-star
UPDATE chapters
SET five_star_rating = TRUE
WHERE chapter_name = 'Sigma Chi'
  AND university_id IN (
    SELECT id FROM universities WHERE name LIKE '%Michigan%'
  )
  AND member_count >= 65;

-- Function to automatically calculate five-star rating
CREATE OR REPLACE FUNCTION update_five_star_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- A chapter is five-star if:
  -- 1. Has 65+ members
  -- 2. Has contact email
  -- 3. Has house address
  -- 4. Has at least 2 social media handles
  -- 5. Has at least 5 officers with contact info

  NEW.five_star_rating := (
    NEW.member_count >= 65
    AND NEW.contact_email IS NOT NULL
    AND NEW.house_address IS NOT NULL
    AND (
      (CASE WHEN NEW.instagram_handle IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN NEW.facebook_page IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN NEW.website IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN NEW.twitter_handle IS NOT NULL THEN 1 ELSE 0 END)
    ) >= 2
    AND NEW.officer_count >= 5
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update five-star rating on chapter changes
DROP TRIGGER IF EXISTS trigger_update_five_star_rating ON chapters;
CREATE TRIGGER trigger_update_five_star_rating
  BEFORE INSERT OR UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_five_star_rating();

-- Update all existing chapters to calculate their five-star rating
UPDATE chapters
SET updated_at = CURRENT_TIMESTAMP; -- This triggers the function
