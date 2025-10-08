-- Drop the old check constraint
ALTER TABLE chapter_unlocks
DROP CONSTRAINT IF EXISTS chapter_unlocks_unlock_type_check;

-- Add the correct check constraint with all valid unlock types
ALTER TABLE chapter_unlocks
ADD CONSTRAINT chapter_unlocks_unlock_type_check
CHECK (unlock_type IN ('basic_info', 'roster', 'officers', 'warm_introduction', 'full'));
