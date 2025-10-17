-- Migration: Add wizard_admin field for platform super admins
-- This allows specific users to access ANY company account for support/debugging

-- Add wizard_admin field to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_wizard_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster wizard admin queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_wizard_admin
ON user_profiles(is_wizard_admin)
WHERE is_wizard_admin = TRUE;

-- Add wizard_sessions table to track impersonation
CREATE TABLE IF NOT EXISTS wizard_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wizard_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  impersonated_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  ip_address TEXT,
  user_agent TEXT
);

-- Partial unique index to ensure only one active session per wizard
CREATE UNIQUE INDEX IF NOT EXISTS idx_wizard_sessions_unique_active
ON wizard_sessions(wizard_user_id)
WHERE is_active = TRUE;

-- Index for active wizard sessions
CREATE INDEX IF NOT EXISTS idx_wizard_sessions_active
ON wizard_sessions(wizard_user_id, is_active)
WHERE is_active = TRUE;

-- Function to check if user is wizard admin
CREATE OR REPLACE FUNCTION is_wizard_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = user_id_param
    AND is_wizard_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get wizard's active impersonation
CREATE OR REPLACE FUNCTION get_wizard_impersonation(wizard_user_id_param UUID)
RETURNS UUID AS $$
DECLARE
  company_id_result UUID;
BEGIN
  SELECT impersonated_company_id INTO company_id_result
  FROM wizard_sessions
  WHERE wizard_user_id = wizard_user_id_param
  AND is_active = TRUE
  LIMIT 1;

  RETURN company_id_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy: Wizard admins can read all user_profiles
CREATE POLICY wizard_admin_read_all_profiles ON user_profiles
  FOR SELECT
  USING (is_wizard_admin(auth.uid()));

-- RLS Policy: Wizard admins can read all companies
CREATE POLICY wizard_admin_read_all_companies ON companies
  FOR SELECT
  USING (is_wizard_admin(auth.uid()));

-- RLS Policy: Wizard admins can read all team_members
CREATE POLICY wizard_admin_read_all_team_members ON team_members
  FOR SELECT
  USING (is_wizard_admin(auth.uid()));

COMMENT ON COLUMN user_profiles.is_wizard_admin IS 'Platform super admin with access to all companies';
COMMENT ON TABLE wizard_sessions IS 'Tracks wizard admin impersonation sessions for audit purposes';
