-- Admin activity log to track all important events
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'purchase', 'new_client', 'unlock', 'warm_intro_request', 'admin_upload'
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  company_name VARCHAR(255),
  reference_id UUID, -- chapter_id, transaction_id, etc.
  reference_type VARCHAR(50), -- 'chapter', 'transaction', 'upload', etc.
  metadata JSONB, -- Additional event-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_event_type ON admin_activity_log(event_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_company_id ON admin_activity_log(company_id);

-- Enable Row Level Security
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (admin only)
CREATE POLICY "Service role can manage activity log"
  ON admin_activity_log FOR ALL
  USING (auth.role() = 'service_role');

-- Function to log activity (called from various endpoints)
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_event_type VARCHAR,
  p_event_title VARCHAR,
  p_event_description TEXT DEFAULT NULL,
  p_company_id UUID DEFAULT NULL,
  p_company_name VARCHAR DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type VARCHAR DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_activity_log (
    event_type, event_title, event_description,
    company_id, company_name, reference_id, reference_type, metadata
  ) VALUES (
    p_event_type, p_event_title, p_event_description,
    p_company_id, p_company_name, p_reference_id, p_reference_type, p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
