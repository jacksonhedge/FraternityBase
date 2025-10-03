-- FraternityBase Update Tracking System
-- Tracks database changes and manages partner notifications

-- Partner Subscriptions Table
CREATE TABLE partner_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  notification_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (notification_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  is_active BOOLEAN DEFAULT TRUE,

  -- Subscription preferences
  notify_new_colleges BOOLEAN DEFAULT TRUE,
  notify_new_chapters BOOLEAN DEFAULT TRUE,
  notify_chapter_updates BOOLEAN DEFAULT TRUE,
  notify_contact_info_updates BOOLEAN DEFAULT TRUE,
  notify_officer_changes BOOLEAN DEFAULT TRUE,
  notify_event_opportunities BOOLEAN DEFAULT TRUE,

  -- Filters
  interested_universities UUID[], -- Array of university IDs
  interested_states VARCHAR(50)[], -- Array of state codes
  interested_org_types VARCHAR(20)[], -- ['fraternity', 'sorority', 'honor_society']

  last_notification_sent TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Database Update Log
CREATE TABLE database_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_type VARCHAR(50) NOT NULL, -- 'new_college', 'new_chapter', 'contact_info', 'officer_change', 'chapter_update', 'warm_intro'
  entity_type VARCHAR(50) NOT NULL, -- 'university', 'chapter', 'officer', 'company'
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255) NOT NULL,

  -- Update details
  change_summary TEXT NOT NULL,
  change_details JSONB, -- Structured data about what changed

  -- Context
  university_id UUID REFERENCES universities(id),
  university_name VARCHAR(255),
  university_state VARCHAR(50),
  chapter_id UUID REFERENCES chapters(id),
  chapter_name VARCHAR(255),

  -- Metadata
  created_by VARCHAR(100) DEFAULT 'system', -- 'system', 'admin', 'scraper'
  is_major_update BOOLEAN DEFAULT FALSE, -- Flag for significant updates
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_update_type (update_type),
  INDEX idx_entity_type (entity_type),
  INDEX idx_created_at (created_at),
  INDEX idx_university_state (university_state)
);

-- Notification Digest Queue
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_subscription_id UUID REFERENCES partner_subscriptions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  email VARCHAR(255) NOT NULL,

  -- Digest content
  digest_period_start TIMESTAMP NOT NULL,
  digest_period_end TIMESTAMP NOT NULL,
  update_ids UUID[] NOT NULL, -- Array of database_updates IDs
  update_count INTEGER NOT NULL,

  -- Email content (pre-generated)
  subject VARCHAR(255) NOT NULL,
  html_body TEXT,
  text_body TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  scheduled_send_time TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_status (status),
  INDEX idx_scheduled_send (scheduled_send_time)
);

-- Warm Introduction Opportunities
CREATE TABLE warm_intro_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  chapter_id UUID REFERENCES chapters(id),
  officer_id UUID REFERENCES chapter_officers(id),

  intro_type VARCHAR(50) NOT NULL, -- 'mutual_connection', 'alumni', 'previous_partner', 'event_interest'
  connection_details JSONB,
  confidence_score INTEGER DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),

  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'sent', 'accepted', 'declined', 'expired')),
  offered_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_company_status (company_id, status),
  INDEX idx_expires_at (expires_at)
);

-- Partner Update Preferences (Advanced)
CREATE TABLE partner_update_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_subscription_id UUID REFERENCES partner_subscriptions(id) ON DELETE CASCADE,

  -- Minimum thresholds for notifications
  min_chapter_size INTEGER, -- Only notify for chapters with X+ members
  min_engagement_score INTEGER, -- Only notify for chapters with engagement score X+

  -- Exclude criteria
  exclude_suspended_chapters BOOLEAN DEFAULT TRUE,
  exclude_colony_chapters BOOLEAN DEFAULT FALSE,

  -- Advanced filters
  preferred_event_types VARCHAR(50)[], -- ['rush', 'social', 'philanthropy', etc.]
  budget_range_min DECIMAL(10,2),
  budget_range_max DECIMAL(10,2),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification Analytics
CREATE TABLE notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_queue_id UUID REFERENCES notification_queue(id),
  partner_subscription_id UUID REFERENCES partner_subscriptions(id),

  email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP NOT NULL,

  -- Engagement metrics
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  clicked_updates UUID[], -- Which updates they clicked on

  -- Actions taken
  contacted_chapters UUID[], -- Chapters they reached out to
  created_partnerships UUID[], -- Partnerships created from this digest

  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_sent_at (sent_at),
  INDEX idx_email (email)
);

-- Triggers to auto-log updates

-- Trigger for new universities
CREATE OR REPLACE FUNCTION log_new_university()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO database_updates (
    update_type, entity_type, entity_id, entity_name,
    change_summary, change_details,
    university_id, university_name, university_state,
    is_major_update
  ) VALUES (
    'new_college', 'university', NEW.id, NEW.name,
    'New college added: ' || NEW.name || ' in ' || NEW.state,
    jsonb_build_object(
      'location', NEW.location,
      'state', NEW.state,
      'student_count', NEW.student_count,
      'greek_percentage', NEW.greek_percentage
    ),
    NEW.id, NEW.name, NEW.state,
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_new_university
AFTER INSERT ON universities
FOR EACH ROW EXECUTE FUNCTION log_new_university();

-- Trigger for new chapters
CREATE OR REPLACE FUNCTION log_new_chapter()
RETURNS TRIGGER AS $$
DECLARE
  v_university_name VARCHAR(255);
  v_university_state VARCHAR(50);
  v_org_name VARCHAR(255);
BEGIN
  SELECT name, state INTO v_university_name, v_university_state
  FROM universities WHERE id = NEW.university_id;

  SELECT name INTO v_org_name
  FROM greek_organizations WHERE id = NEW.greek_organization_id;

  INSERT INTO database_updates (
    update_type, entity_type, entity_id, entity_name,
    change_summary, change_details,
    university_id, university_name, university_state,
    chapter_id, chapter_name,
    is_major_update
  ) VALUES (
    'new_chapter', 'chapter', NEW.id, NEW.chapter_name,
    'New chapter added: ' || v_org_name || ' at ' || v_university_name,
    jsonb_build_object(
      'organization', v_org_name,
      'university', v_university_name,
      'member_count', NEW.member_count,
      'status', NEW.status,
      'instagram_handle', NEW.instagram_handle,
      'contact_email', NEW.contact_email
    ),
    NEW.university_id, v_university_name, v_university_state,
    NEW.id, NEW.chapter_name,
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_new_chapter
AFTER INSERT ON chapters
FOR EACH ROW EXECUTE FUNCTION log_new_chapter();

-- Trigger for chapter contact info updates
CREATE OR REPLACE FUNCTION log_chapter_contact_update()
RETURNS TRIGGER AS $$
DECLARE
  v_university_name VARCHAR(255);
  v_university_state VARCHAR(50);
  v_changes JSONB := '{}';
  v_summary TEXT := 'Contact info updated: ';
BEGIN
  -- Only log if contact info actually changed
  IF OLD.contact_email IS DISTINCT FROM NEW.contact_email OR
     OLD.phone IS DISTINCT FROM NEW.phone OR
     OLD.instagram_handle IS DISTINCT FROM NEW.instagram_handle OR
     OLD.facebook_page IS DISTINCT FROM NEW.facebook_page OR
     OLD.website IS DISTINCT FROM NEW.website THEN

    SELECT name, state INTO v_university_name, v_university_state
    FROM universities WHERE id = NEW.university_id;

    -- Build changes object
    IF OLD.contact_email IS DISTINCT FROM NEW.contact_email THEN
      v_changes := v_changes || jsonb_build_object('contact_email', NEW.contact_email);
      v_summary := v_summary || 'email, ';
    END IF;

    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
      v_changes := v_changes || jsonb_build_object('phone', NEW.phone);
      v_summary := v_summary || 'phone, ';
    END IF;

    IF OLD.instagram_handle IS DISTINCT FROM NEW.instagram_handle THEN
      v_changes := v_changes || jsonb_build_object('instagram_handle', NEW.instagram_handle);
      v_summary := v_summary || 'Instagram, ';
    END IF;

    IF OLD.website IS DISTINCT FROM NEW.website THEN
      v_changes := v_changes || jsonb_build_object('website', NEW.website);
      v_summary := v_summary || 'website, ';
    END IF;

    -- Remove trailing comma
    v_summary := TRIM(TRAILING ', ' FROM v_summary);

    INSERT INTO database_updates (
      update_type, entity_type, entity_id, entity_name,
      change_summary, change_details,
      university_id, university_name, university_state,
      chapter_id, chapter_name,
      is_major_update
    ) VALUES (
      'contact_info', 'chapter', NEW.id, NEW.chapter_name,
      v_summary || ' for ' || NEW.chapter_name,
      v_changes,
      NEW.university_id, v_university_name, v_university_state,
      NEW.id, NEW.chapter_name,
      TRUE
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_chapter_contact_update
AFTER UPDATE ON chapters
FOR EACH ROW EXECUTE FUNCTION log_chapter_contact_update();

-- Trigger for new/updated officers
CREATE OR REPLACE FUNCTION log_officer_change()
RETURNS TRIGGER AS $$
DECLARE
  v_chapter_name VARCHAR(255);
  v_university_name VARCHAR(255);
  v_university_state VARCHAR(50);
  v_university_id UUID;
BEGIN
  SELECT c.chapter_name, c.university_id, u.name, u.state
  INTO v_chapter_name, v_university_id, v_university_name, v_university_state
  FROM chapters c
  JOIN universities u ON u.id = c.university_id
  WHERE c.id = NEW.chapter_id;

  INSERT INTO database_updates (
    update_type, entity_type, entity_id, entity_name,
    change_summary, change_details,
    university_id, university_name, university_state,
    chapter_id, chapter_name,
    is_major_update
  ) VALUES (
    'officer_change', 'officer', NEW.id, NEW.name,
    'New officer: ' || NEW.name || ' (' || NEW.position || ') at ' || v_chapter_name,
    jsonb_build_object(
      'position', NEW.position,
      'email', NEW.email,
      'phone', NEW.phone,
      'linkedin_profile', NEW.linkedin_profile,
      'is_primary_contact', NEW.is_primary_contact
    ),
    v_university_id, v_university_name, v_university_state,
    NEW.chapter_id, v_chapter_name,
    NEW.is_primary_contact -- Major update if primary contact
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_new_officer
AFTER INSERT ON chapter_officers
FOR EACH ROW EXECUTE FUNCTION log_officer_change();

-- Trigger for warm intro opportunities
CREATE OR REPLACE FUNCTION log_warm_intro()
RETURNS TRIGGER AS $$
DECLARE
  v_company_name VARCHAR(255);
  v_chapter_name VARCHAR(255);
  v_university_name VARCHAR(255);
  v_university_state VARCHAR(50);
  v_university_id UUID;
BEGIN
  SELECT name INTO v_company_name FROM companies WHERE id = NEW.company_id;

  SELECT c.chapter_name, c.university_id, u.name, u.state
  INTO v_chapter_name, v_university_id, v_university_name, v_university_state
  FROM chapters c
  JOIN universities u ON u.id = c.university_id
  WHERE c.id = NEW.chapter_id;

  INSERT INTO database_updates (
    update_type, entity_type, entity_id, entity_name,
    change_summary, change_details,
    university_id, university_name, university_state,
    chapter_id, chapter_name,
    is_major_update
  ) VALUES (
    'warm_intro', 'opportunity', NEW.id, v_chapter_name,
    'Warm intro opportunity: ' || v_company_name || ' → ' || v_chapter_name,
    jsonb_build_object(
      'company', v_company_name,
      'intro_type', NEW.intro_type,
      'confidence_score', NEW.confidence_score,
      'connection_details', NEW.connection_details
    ),
    v_university_id, v_university_name, v_university_state,
    NEW.chapter_id, v_chapter_name,
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_warm_intro
AFTER INSERT ON warm_intro_opportunities
FOR EACH ROW EXECUTE FUNCTION log_warm_intro();

-- Updated_at triggers for new tables
CREATE TRIGGER update_partner_subscriptions_updated_at BEFORE UPDATE ON partner_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_update_preferences_updated_at BEFORE UPDATE ON partner_update_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_partner_subscriptions_active ON partner_subscriptions(is_active, notification_frequency);
CREATE INDEX idx_partner_subscriptions_company ON partner_subscriptions(company_id);
CREATE INDEX idx_database_updates_created_at ON database_updates(created_at DESC);
CREATE INDEX idx_database_updates_major ON database_updates(is_major_update, created_at DESC);
CREATE INDEX idx_warm_intro_status ON warm_intro_opportunities(status, company_id);
