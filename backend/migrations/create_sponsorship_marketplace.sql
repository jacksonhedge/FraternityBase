-- Create Sponsorship Marketplace Tables
-- This migration creates the infrastructure for fraternities to list sponsorship opportunities
-- and for companies to receive daily/weekly email notifications about new opportunities

-- ============================================================================
-- SPONSORSHIP OPPORTUNITIES TABLE
-- ============================================================================
-- Tracks sponsorship opportunities posted by chapters looking for sponsors
CREATE TABLE IF NOT EXISTS sponsorship_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,

  -- Opportunity details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  opportunity_type VARCHAR(50) NOT NULL CHECK (opportunity_type IN (
    'event_sponsor',
    'merchandise_partner',
    'philanthropy_partner',
    'long_term_partnership',
    'venue_rental',
    'ambassador_program',
    'product_placement',
    'other'
  )),

  -- Targeting
  target_industries TEXT ARRAY, -- e.g., ['apparel', 'food_beverage', 'tech']
  geographic_scope VARCHAR(50) DEFAULT 'local' CHECK (geographic_scope IN ('local', 'regional', 'national')),

  -- Financial details
  budget_needed NUMERIC(10,2),
  budget_range VARCHAR(50), -- e.g., '$1,000-$5,000', 'Under $500', '$10,000+'

  -- Timeline
  event_date TIMESTAMP, -- When the event/opportunity happens
  application_deadline TIMESTAMP, -- When applications close
  timeline_description VARCHAR(255), -- e.g., "3-month partnership starting Fall 2025"

  -- Engagement expectations
  expected_reach INTEGER, -- Number of students/audience reached
  deliverables TEXT ARRAY, -- e.g., ['social_media_posts', 'banner_at_event', 'email_blast']

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'filled', 'expired', 'cancelled')),
  applications_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,

  -- Visibility
  is_featured BOOLEAN DEFAULT FALSE, -- Highlighted in emails
  is_urgent BOOLEAN DEFAULT FALSE, -- Send immediate notifications

  -- Metadata
  posted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  filled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_budget_range CHECK (budget_needed IS NULL OR budget_needed > 0),
  CONSTRAINT valid_reach CHECK (expected_reach IS NULL OR expected_reach > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sponsorship_opportunities_chapter_id ON sponsorship_opportunities(chapter_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_opportunities_status ON sponsorship_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_opportunities_expires_at ON sponsorship_opportunities(expires_at);
CREATE INDEX IF NOT EXISTS idx_sponsorship_opportunities_posted_at ON sponsorship_opportunities(posted_at);
CREATE INDEX IF NOT EXISTS idx_sponsorship_opportunities_opportunity_type ON sponsorship_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_sponsorship_opportunities_featured ON sponsorship_opportunities(is_featured);

-- ============================================================================
-- SPONSORSHIP APPLICATIONS TABLE
-- ============================================================================
-- Tracks when companies apply/express interest in sponsorship opportunities
CREATE TABLE IF NOT EXISTS sponsorship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  opportunity_id UUID NOT NULL REFERENCES sponsorship_opportunities(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Application details
  message TEXT,
  proposed_budget NUMERIC(10,2),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn')),

  -- Response from chapter
  chapter_response TEXT,
  responded_at TIMESTAMP,

  -- Metadata
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Ensure company can only apply once per opportunity
  UNIQUE(opportunity_id, company_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sponsorship_applications_opportunity_id ON sponsorship_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_applications_company_id ON sponsorship_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_applications_status ON sponsorship_applications(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_applications_applied_at ON sponsorship_applications(applied_at);

-- ============================================================================
-- SPONSORSHIP NOTIFICATIONS TABLE
-- ============================================================================
-- Tracks email notifications sent to companies about sponsorship opportunities
CREATE TABLE IF NOT EXISTS sponsorship_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES sponsorship_opportunities(id) ON DELETE SET NULL,

  -- Notification details
  notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN (
    'daily_digest',
    'weekly_digest',
    'immediate_alert',
    'featured_opportunity'
  )),

  -- Delivery tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,

  -- Engagement tracking
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Email metadata
  email_address VARCHAR(255),
  resend_email_id VARCHAR(255), -- Resend API email ID for tracking

  -- Content snapshot (for historical record)
  opportunities_included UUID ARRAY, -- Array of opportunity IDs in this email
  opportunities_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sponsorship_notifications_company_id ON sponsorship_notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_notifications_opportunity_id ON sponsorship_notifications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_notifications_status ON sponsorship_notifications(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_notifications_sent_at ON sponsorship_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_sponsorship_notifications_notification_type ON sponsorship_notifications(notification_type);

-- ============================================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================================
-- Stores company preferences for sponsorship email notifications
CREATE TABLE IF NOT EXISTS sponsorship_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key (one preferences record per company)
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,

  -- Email frequency preferences
  email_frequency VARCHAR(20) DEFAULT 'daily' CHECK (email_frequency IN ('immediate', 'daily', 'weekly', 'never')),
  send_time_utc INTEGER DEFAULT 9 CHECK (send_time_utc >= 0 AND send_time_utc <= 23), -- Hour of day (0-23)

  -- Filtering preferences
  target_states TEXT ARRAY, -- e.g., ['CA', 'NY', 'TX']
  target_organizations TEXT ARRAY, -- e.g., ['Sigma Chi', 'Delta Delta Delta']
  target_universities UUID ARRAY, -- Array of university IDs

  -- Industry/opportunity type preferences
  interested_opportunity_types TEXT ARRAY, -- e.g., ['event_sponsor', 'merchandise_partner']
  excluded_opportunity_types TEXT ARRAY, -- Types to exclude

  -- Budget preferences
  min_budget_range INTEGER, -- Minimum budget in dollars
  max_budget_range INTEGER, -- Maximum budget in dollars

  -- Geographic preferences
  preferred_geographic_scope TEXT ARRAY, -- ['local', 'regional', 'national']

  -- Engagement preferences
  min_expected_reach INTEGER, -- Minimum audience size

  -- Feature flags
  receive_featured_opportunities BOOLEAN DEFAULT TRUE,
  receive_urgent_alerts BOOLEAN DEFAULT TRUE,

  -- Opt-out
  unsubscribed_at TIMESTAMP,
  unsubscribe_reason TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_sponsorship_notification_preferences_company_id ON sponsorship_notification_preferences(company_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_notification_preferences_email_frequency ON sponsorship_notification_preferences(email_frequency);
CREATE INDEX IF NOT EXISTS idx_sponsorship_notification_preferences_unsubscribed_at ON sponsorship_notification_preferences(unsubscribed_at);

-- ============================================================================
-- SPONSORSHIP SAVED/FAVORITES TABLE
-- ============================================================================
-- Allows companies to save/favorite opportunities for later review
CREATE TABLE IF NOT EXISTS sponsorship_saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES sponsorship_opportunities(id) ON DELETE CASCADE,

  -- Notes
  notes TEXT,

  -- Metadata
  saved_at TIMESTAMP DEFAULT NOW(),

  -- Ensure company can only save an opportunity once
  UNIQUE(company_id, opportunity_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sponsorship_saved_company_id ON sponsorship_saved_opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_saved_opportunity_id ON sponsorship_saved_opportunities(opportunity_id);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE sponsorship_opportunities IS 'Sponsorship opportunities posted by fraternities seeking brand partnerships';
COMMENT ON TABLE sponsorship_applications IS 'Company applications/expressions of interest in sponsorship opportunities';
COMMENT ON TABLE sponsorship_notifications IS 'Email notifications sent to companies about new sponsorship opportunities';
COMMENT ON TABLE sponsorship_notification_preferences IS 'Company preferences for receiving sponsorship email notifications';
COMMENT ON TABLE sponsorship_saved_opportunities IS 'Saved/favorited sponsorship opportunities by companies';

COMMENT ON COLUMN sponsorship_opportunities.is_featured IS 'Featured opportunities appear at top of daily/weekly digests';
COMMENT ON COLUMN sponsorship_opportunities.is_urgent IS 'Urgent opportunities trigger immediate email alerts to matching companies';
COMMENT ON COLUMN sponsorship_notification_preferences.email_frequency IS 'How often companies want to receive sponsorship digest emails';
COMMENT ON COLUMN sponsorship_notification_preferences.send_time_utc IS 'Preferred hour (UTC) to receive daily digest (0-23)';

-- ============================================================================
-- FUNCTIONS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_sponsorship_opportunities_updated_at
  BEFORE UPDATE ON sponsorship_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsorship_applications_updated_at
  BEFORE UPDATE ON sponsorship_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsorship_notifications_updated_at
  BEFORE UPDATE ON sponsorship_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsorship_notification_preferences_updated_at
  BEFORE UPDATE ON sponsorship_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE sponsorship_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Sponsorship Opportunities Policies
-- Companies can view active opportunities
CREATE POLICY "Companies can view active sponsorship opportunities"
  ON sponsorship_opportunities
  FOR SELECT
  USING (status = 'active' OR status = 'filled');

-- Chapters can manage their own opportunities (via service role key in backend)
-- Note: Chapter management will be done through backend API with service role

-- Sponsorship Applications Policies
-- Companies can view their own applications
CREATE POLICY "Companies can view their own applications"
  ON sponsorship_applications
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM company_users WHERE id = auth.uid()
  ));

-- Companies can create applications
CREATE POLICY "Companies can create applications"
  ON sponsorship_applications
  FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM company_users WHERE id = auth.uid()
  ));

-- Companies can update their own applications (withdraw, update message)
CREATE POLICY "Companies can update their own applications"
  ON sponsorship_applications
  FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM company_users WHERE id = auth.uid()
  ));

-- Notification Preferences Policies
-- Companies can view and manage their own preferences
CREATE POLICY "Companies can manage their own notification preferences"
  ON sponsorship_notification_preferences
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM company_users WHERE id = auth.uid()
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM company_users WHERE id = auth.uid()
  ));

-- Saved Opportunities Policies
-- Companies can manage their own saved opportunities
CREATE POLICY "Companies can manage their own saved opportunities"
  ON sponsorship_saved_opportunities
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM company_users WHERE id = auth.uid()
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM company_users WHERE id = auth.uid()
  ));

-- Notifications are read-only for companies (managed by backend)
CREATE POLICY "Companies can view their own notifications"
  ON sponsorship_notifications
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM company_users WHERE id = auth.uid()
  ));

-- ============================================================================
-- DEFAULT NOTIFICATION PREFERENCES FOR EXISTING COMPANIES
-- ============================================================================
-- Create default notification preferences for all existing companies
INSERT INTO sponsorship_notification_preferences (company_id, email_frequency, send_time_utc)
SELECT id, 'daily', 9
FROM companies
ON CONFLICT (company_id) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
