-- Add admin_notes column to warm_intro_requests table
-- This allows admins to add notes when processing introduction requests

ALTER TABLE warm_intro_requests
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add comment for clarity
COMMENT ON COLUMN warm_intro_requests.admin_notes IS 'Notes added by admins when processing the introduction request';
