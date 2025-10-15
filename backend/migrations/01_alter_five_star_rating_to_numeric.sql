-- Migration: Convert five_star_rating from BOOLEAN to NUMERIC
-- Date: 2025-10-14
-- Purpose: Change five_star_rating column from boolean to numeric(3,1) to store 1.0-5.0 ratings

-- Step 1: Add a temporary numeric column
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS five_star_rating_new NUMERIC(3,1);

-- Step 2: Convert existing boolean values to numeric defaults
-- true -> 4.0 (good default), false/null -> NULL (will be calculated later)
UPDATE chapters
SET five_star_rating_new = CASE
  WHEN five_star_rating = true THEN 4.0
  ELSE NULL
END;

-- Step 3: Drop the old boolean column
ALTER TABLE chapters
DROP COLUMN IF EXISTS five_star_rating;

-- Step 4: Rename the new column to five_star_rating
ALTER TABLE chapters
RENAME COLUMN five_star_rating_new TO five_star_rating;

-- Step 5: Add comment
COMMENT ON COLUMN chapters.five_star_rating IS 'Chapter quality rating from 1.0 to 5.0 based on data quality, membership, and verification';

-- Verify the change
SELECT
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_name = 'chapters'
  AND column_name = 'five_star_rating';
