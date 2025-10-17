-- Migration: Auto-add users to team_members when user_profile is created
-- Purpose: Every user should automatically be added to their company's team_members table
-- This fixes the issue where team seats show 0/3 instead of 1/3 for the account owner

-- Drop the trigger and function if they exist (for idempotency)
DROP TRIGGER IF EXISTS auto_add_team_member_trigger ON user_profiles;
DROP FUNCTION IF EXISTS auto_add_team_member();

-- Create function to automatically add user to team_members
CREATE OR REPLACE FUNCTION auto_add_team_member()
RETURNS TRIGGER AS $$
DECLARE
  next_member_number INTEGER;
BEGIN
  -- Only proceed if the user has a company_id
  IF NEW.company_id IS NOT NULL THEN
    -- Get the next member number for this company
    SELECT COALESCE(MAX(member_number), 0) + 1
    INTO next_member_number
    FROM team_members
    WHERE company_id = NEW.company_id;

    -- Insert the user into team_members
    INSERT INTO team_members (
      company_id,
      user_id,
      member_number,
      role,
      status,
      joined_at
    )
    VALUES (
      NEW.company_id,
      NEW.user_id,
      next_member_number,
      CASE
        WHEN next_member_number = 1 THEN 'owner'  -- First member is the owner
        ELSE 'member'
      END,
      'active',
      NOW()
    )
    ON CONFLICT (company_id, user_id) DO NOTHING;  -- Prevent duplicates
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after a user_profile is inserted
CREATE TRIGGER auto_add_team_member_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_team_member();

-- Backfill existing users who don't have team_member entries
-- This fixes existing accounts
INSERT INTO team_members (company_id, user_id, member_number, role, status, joined_at)
SELECT
  up.company_id,
  up.user_id,
  ROW_NUMBER() OVER (PARTITION BY up.company_id ORDER BY up.created_at) as member_number,
  CASE
    WHEN ROW_NUMBER() OVER (PARTITION BY up.company_id ORDER BY up.created_at) = 1
    THEN 'owner'
    ELSE 'member'
  END as role,
  'active' as status,
  COALESCE(up.created_at, NOW()) as joined_at
FROM user_profiles up
WHERE up.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.company_id = up.company_id
    AND tm.user_id = up.user_id
  )
ON CONFLICT (company_id, user_id) DO NOTHING;

-- Verify the migration worked
DO $$
DECLARE
  backfilled_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO backfilled_count FROM team_members;
  RAISE NOTICE 'Migration complete. Total team members: %', backfilled_count;
END $$;
