-- Create user_activity_logs table for tracking user interactions
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'click', 'page_view', 'chapter_view', 'chapter_unlock', 'search', etc.
  page_path TEXT NOT NULL,
  element_type TEXT, -- 'button', 'link', 'card', 'nav_item', etc.
  element_text TEXT, -- The text content of the clicked element
  element_id TEXT, -- The ID or data attribute of the element
  metadata JSONB DEFAULT '{}', -- Additional context (chapter_id, search_query, etc.)
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_company_id ON user_activity_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_session_id ON user_activity_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON user_activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_page_path ON user_activity_logs(page_path);

-- Add RLS policies (admin can see all, users can only insert their own)
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert their own activity logs
CREATE POLICY "Users can insert their own activity logs"
  ON user_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Add comment to table
COMMENT ON TABLE user_activity_logs IS 'Tracks user click events and interactions for analytics';
