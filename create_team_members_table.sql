-- Create team_members table to track team membership
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_number INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique user per company
  UNIQUE(company_id, user_id),

  -- Ensure unique member number per company
  UNIQUE(company_id, member_number)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_members_company ON team_members(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- RLS Policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Users can view team members in their company
CREATE POLICY "Users can view team members in their company"
  ON team_members FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Only admins can insert team members
CREATE POLICY "Admins can invite team members"
  ON team_members FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update team members
CREATE POLICY "Admins can update team members"
  ON team_members FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete team members
CREATE POLICY "Admins can remove team members"
  ON team_members FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();
