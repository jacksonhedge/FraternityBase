-- User Profiles Table
-- Links Supabase Auth users to companies and stores user metadata

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,  -- Links to auth.users(id) in Supabase
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  position VARCHAR(100),

  -- Subscription & trial info
  subscription_tier VARCHAR(50) DEFAULT 'free_trial' CHECK (subscription_tier IN ('free_trial', 'starter', 'growth', 'pro', 'enterprise')),
  trial_lookups_used INTEGER DEFAULT 0,
  trial_expires_at TIMESTAMP,

  -- Metadata
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Comments
COMMENT ON TABLE user_profiles IS 'User profiles linking Supabase Auth users to companies';
COMMENT ON COLUMN user_profiles.user_id IS 'References auth.users(id) from Supabase Auth';
COMMENT ON COLUMN user_profiles.company_id IS 'Company this user belongs to (shared credits/unlocks)';
COMMENT ON COLUMN user_profiles.role IS 'User role: admin (full access), user (can unlock), viewer (read-only)';
COMMENT ON COLUMN user_profiles.subscription_tier IS 'Subscription level for the user/company';
