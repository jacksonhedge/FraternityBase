-- First, check what the current constraint allows
-- Run this in Supabase SQL Editor to see current state:
-- SELECT conname, pg_get_constraintdef(oid) as constraint_def
-- FROM pg_constraint
-- WHERE conrelid = 'chapter_unlocks'::regclass
--   AND conname = 'chapter_unlocks_unlock_type_check';

-- Drop the existing check constraint
ALTER TABLE chapter_unlocks
DROP CONSTRAINT IF EXISTS chapter_unlocks_unlock_type_check;

-- Add the new check constraint with all valid unlock types including 'full'
ALTER TABLE chapter_unlocks
ADD CONSTRAINT chapter_unlocks_unlock_type_check
CHECK (unlock_type IN ('basic_info', 'roster', 'officers', 'warm_introduction', 'full'));

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint
WHERE conrelid = 'chapter_unlocks'::regclass
  AND conname = 'chapter_unlocks_unlock_type_check';
