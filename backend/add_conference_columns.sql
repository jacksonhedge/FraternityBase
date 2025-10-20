-- Add conference and division columns to universities table
-- Run this in Supabase SQL Editor

-- Add conference column
ALTER TABLE universities
ADD COLUMN IF NOT EXISTS conference TEXT;

-- Add division column
ALTER TABLE universities
ADD COLUMN IF NOT EXISTS division TEXT;

-- Create index for better query performance on conference filtering
CREATE INDEX IF NOT EXISTS idx_universities_conference ON universities(conference);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'universities'
AND column_name IN ('conference', 'division')
ORDER BY column_name;
