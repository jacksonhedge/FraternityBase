-- Migration: Fix team member roles
-- Issue: Table constraint only allows 'admin' and 'member', but trigger tries to assign 'owner'
-- This causes first members to get 'admin' instead of 'owner', and new signups get 'admin' instead of 'member'

-- Step 1: Drop the existing role constraint
ALTER TABLE team_members
DROP CONSTRAINT IF EXISTS team_members_role_check;

-- Step 2: Add new constraint that allows 'owner', 'admin', and 'member'
ALTER TABLE team_members
ADD CONSTRAINT team_members_role_check
CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text]));

-- Step 3: Update existing member_number = 1 records from 'admin' to 'owner'
-- These are the account creators/first members
UPDATE team_members
SET role = 'owner',
    updated_at = NOW()
WHERE member_number = 1
  AND role = 'admin';

-- Step 4: Verify the fix
DO $$
DECLARE
  owner_count INTEGER;
  admin_count INTEGER;
  member_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO owner_count FROM team_members WHERE role = 'owner';
  SELECT COUNT(*) INTO admin_count FROM team_members WHERE role = 'admin';
  SELECT COUNT(*) INTO member_count FROM team_members WHERE role = 'member';

  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE 'Owners: % (should match number of companies)', owner_count;
  RAISE NOTICE 'Admins: %', admin_count;
  RAISE NOTICE 'Members: %', member_count;
END $$;
