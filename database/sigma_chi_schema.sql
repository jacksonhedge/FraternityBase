-- Fraternity Base - Sigma Chi Member Database Schema
-- Handles sensitive PII with encryption and audit trails

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas for organization
CREATE SCHEMA IF NOT EXISTS fraternity_data;
CREATE SCHEMA IF NOT EXISTS encrypted_pii;
CREATE SCHEMA IF NOT EXISTS audit_logs;

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Fraternities (could expand beyond Sigma Chi)
CREATE TABLE fraternity_data.fraternities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    greek_letters VARCHAR(20),
    national_website VARCHAR(255),
    founded_year INTEGER,
    total_chapters INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Universities
CREATE TABLE fraternity_data.universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    state VARCHAR(2),
    city VARCHAR(100),
    enrollment INTEGER,
    type VARCHAR(50), -- 'public', 'private', 'community'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chapters (e.g., "Iota Psi" at Northeastern)
CREATE TABLE fraternity_data.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fraternity_id UUID REFERENCES fraternity_data.fraternities(id),
    university_id UUID REFERENCES fraternity_data.universities(id),
    chapter_name VARCHAR(100) NOT NULL, -- "Iota Psi"
    chapter_designation VARCHAR(50), -- Sometimes different from name
    charter_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'closed'

    -- Public aggregate data
    approximate_size INTEGER,
    house_address TEXT,
    social_instagram VARCHAR(100),
    social_facebook VARCHAR(100),
    website VARCHAR(255),

    -- Data quality tracking
    last_roster_update DATE,
    data_completeness DECIMAL(3,2), -- 0.00 to 1.00

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(fraternity_id, chapter_name),
    INDEX idx_chapter_university (university_id),
    INDEX idx_chapter_status (status)
);

-- ==========================================
-- ENCRYPTED MEMBER DATA
-- ==========================================

-- Main member table with encrypted PII
CREATE TABLE encrypted_pii.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES fraternity_data.chapters(id),

    -- Encrypted PII fields (using pgcrypto)
    first_name_encrypted BYTEA NOT NULL,
    last_name_encrypted BYTEA NOT NULL,
    email_encrypted BYTEA NOT NULL,
    cell_phone_encrypted BYTEA,
    birthday_encrypted BYTEA,

    -- Address components (encrypted separately for flexibility)
    street_address_encrypted BYTEA,
    city_encrypted BYTEA,
    state VARCHAR(2), -- Not encrypted, useful for filtering
    zip_code_encrypted BYTEA,

    -- Alternative address (work/school)
    alt_street_address_encrypted BYTEA,
    alt_city_encrypted BYTEA,
    alt_state VARCHAR(2),
    alt_zip_code_encrypted BYTEA,

    -- Hashes for lookups without decryption
    email_hash VARCHAR(64) UNIQUE, -- SHA-256 hash
    phone_hash VARCHAR(64),
    name_hash VARCHAR(64), -- For duplicate detection

    -- Non-PII fields (not encrypted)
    member_type VARCHAR(50), -- 'Undergrad', 'Alumni', 'Graduate'
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Inactive', 'Alumni'
    initiation_date DATE,
    initiating_chapter VARCHAR(100), -- Could be different from current chapter
    graduation_year INTEGER,
    major VARCHAR(100),
    minor VARCHAR(100),

    -- LinkedIn/professional info (optional, not encrypted)
    linkedin_url VARCHAR(255),
    employer VARCHAR(255),
    job_title VARCHAR(255),
    industry VARCHAR(100),

    -- Internal metadata
    sigma_chi_id VARCHAR(100), -- Their internal ID if available
    data_source VARCHAR(50), -- 'roster_import', 'manual', 'api'
    import_batch_id UUID, -- Track which import batch
    last_verified DATE,
    opt_out BOOLEAN DEFAULT FALSE, -- Member requested removal

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_member_chapter (chapter_id),
    INDEX idx_member_status (chapter_id, status),
    INDEX idx_member_grad_year (chapter_id, graduation_year),
    INDEX idx_member_type (chapter_id, member_type),
    INDEX idx_email_hash (email_hash),
    INDEX idx_initiation_date (initiation_date)
);

-- Officer positions (separate table for history tracking)
CREATE TABLE fraternity_data.officer_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES encrypted_pii.members(id),
    chapter_id UUID REFERENCES fraternity_data.chapters(id),
    position VARCHAR(100) NOT NULL, -- 'President', 'Treasurer', etc.
    term_start DATE,
    term_end DATE,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_current_officers (chapter_id, is_current),
    INDEX idx_officer_member (member_id)
);

-- ==========================================
-- ACCESS CONTROL & AUDIT
-- ==========================================

-- Track what data each company has unlocked
CREATE TABLE fraternity_data.unlocked_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL, -- References your existing companies table
    chapter_id UUID REFERENCES fraternity_data.chapters(id),
    access_type VARCHAR(50) NOT NULL, -- 'roster_view', 'emails', 'phones', 'full_access'
    member_ids UUID[], -- Specific members if not full chapter
    credits_spent INTEGER NOT NULL,
    expires_at TIMESTAMP, -- For time-limited access
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL, -- User who made the purchase

    -- Prevent duplicate purchases
    UNIQUE(company_id, chapter_id, access_type),
    INDEX idx_company_access (company_id),
    INDEX idx_access_expiry (expires_at)
);

-- Detailed audit log for compliance
CREATE TABLE audit_logs.data_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'view_member', 'export_roster', 'unlock_emails', etc.

    -- What was accessed
    chapter_id UUID,
    member_ids UUID[],
    fields_accessed TEXT[], -- ['email', 'phone', 'birthday']
    record_count INTEGER,

    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id UUID, -- For tracing
    purpose TEXT, -- User-provided reason
    credits_charged INTEGER,

    -- Response
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    response_time_ms INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Partitioning for performance (monthly partitions)
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions for audit logs (example for next 12 months)
CREATE TABLE audit_logs.data_access_log_2024_10 PARTITION OF audit_logs.data_access_log
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE audit_logs.data_access_log_2024_11 PARTITION OF audit_logs.data_access_log
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
-- Continue for each month...

-- ==========================================
-- DATA QUALITY & IMPORT TRACKING
-- ==========================================

-- Track import batches for data lineage
CREATE TABLE fraternity_data.import_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES fraternity_data.chapters(id),
    file_name VARCHAR(255),
    file_hash VARCHAR(64), -- SHA-256 of file for deduplication
    import_type VARCHAR(50), -- 'full_roster', 'updates', 'new_members'

    -- Statistics
    total_rows INTEGER,
    imported_count INTEGER,
    updated_count INTEGER,
    skipped_count INTEGER,
    error_count INTEGER,

    -- Metadata
    imported_by UUID, -- Admin user who ran import
    import_started_at TIMESTAMP,
    import_completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    error_log JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ==========================================

-- Chapter statistics (refreshed nightly)
CREATE MATERIALIZED VIEW fraternity_data.chapter_stats AS
SELECT
    c.id as chapter_id,
    c.chapter_name,
    c.university_id,
    COUNT(DISTINCT m.id) as total_members,
    COUNT(DISTINCT CASE WHEN m.status = 'Active' THEN m.id END) as active_members,
    COUNT(DISTINCT CASE WHEN m.member_type = 'Undergrad' THEN m.id END) as undergrads,
    COUNT(DISTINCT CASE WHEN m.member_type = 'Alumni' THEN m.id END) as alumni,
    COUNT(DISTINCT op.member_id) as officer_count,

    -- Demographic breakdowns
    jsonb_build_object(
        'graduation_years', jsonb_agg(DISTINCT m.graduation_year ORDER BY m.graduation_year),
        'majors', jsonb_agg(DISTINCT m.major ORDER BY m.major),
        'states', jsonb_agg(DISTINCT m.state ORDER BY m.state)
    ) as demographics,

    -- Data quality metrics
    AVG(CASE
        WHEN m.email_encrypted IS NOT NULL THEN 1
        ELSE 0
    END) as email_completeness,
    AVG(CASE
        WHEN m.cell_phone_encrypted IS NOT NULL THEN 1
        ELSE 0
    END) as phone_completeness,
    MAX(m.created_at) as last_member_added,

    NOW() as refreshed_at
FROM fraternity_data.chapters c
LEFT JOIN encrypted_pii.members m ON c.id = m.chapter_id
LEFT JOIN fraternity_data.officer_positions op ON c.id = op.chapter_id AND op.is_current = TRUE
GROUP BY c.id, c.chapter_name, c.university_id;

-- Index for fast lookups
CREATE INDEX idx_chapter_stats_chapter ON fraternity_data.chapter_stats(chapter_id);

-- ==========================================
-- FUNCTIONS FOR SECURE DATA ACCESS
-- ==========================================

-- Function to safely encrypt PII
CREATE OR REPLACE FUNCTION encrypted_pii.encrypt_pii(
    plain_text TEXT,
    encryption_key TEXT
) RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(plain_text, encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely decrypt PII (with audit logging)
CREATE OR REPLACE FUNCTION encrypted_pii.decrypt_pii(
    encrypted_data BYTEA,
    encryption_key TEXT,
    user_id UUID,
    member_id UUID
) RETURNS TEXT AS $$
DECLARE
    decrypted_text TEXT;
BEGIN
    -- Decrypt the data
    decrypted_text := pgp_sym_decrypt(encrypted_data, encryption_key);

    -- Log the access (simplified, expand as needed)
    INSERT INTO audit_logs.data_access_log (user_id, action, member_ids, created_at)
    VALUES (user_id, 'decrypt_pii', ARRAY[member_id], NOW());

    RETURN decrypted_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to hash emails for lookups
CREATE OR REPLACE FUNCTION encrypted_pii.hash_email(email TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(digest(lower(trim(email)), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==========================================
-- TRIGGERS FOR DATA INTEGRITY
-- ==========================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_members_timestamp
    BEFORE UPDATE ON encrypted_pii.members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chapters_timestamp
    BEFORE UPDATE ON fraternity_data.chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- INITIAL DATA
-- ==========================================

-- Insert Sigma Chi fraternity
INSERT INTO fraternity_data.fraternities (name, greek_letters, national_website, founded_year, total_chapters)
VALUES ('Sigma Chi', 'ΣΧ', 'https://www.sigmachi.org', 1855, 240);

-- Insert sample university (Northeastern for Iota Psi chapter)
INSERT INTO fraternity_data.universities (name, nickname, state, city, enrollment, type)
VALUES ('Northeastern University', 'Northeastern', 'MA', 'Boston', 22000, 'private');

-- ==========================================
-- SECURITY POLICIES (Row Level Security)
-- ==========================================

-- Enable RLS on sensitive tables
ALTER TABLE encrypted_pii.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs.data_access_log ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth system)
CREATE POLICY members_access_policy ON encrypted_pii.members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM fraternity_data.unlocked_access ua
            WHERE ua.chapter_id = members.chapter_id
            AND ua.company_id = current_setting('app.current_company_id')::UUID
            AND (ua.expires_at IS NULL OR ua.expires_at > NOW())
        )
    );

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX idx_members_chapter_status ON encrypted_pii.members(chapter_id, status);
CREATE INDEX idx_members_grad_year ON encrypted_pii.members(chapter_id, graduation_year);
CREATE INDEX idx_members_member_type ON encrypted_pii.members(chapter_id, member_type);
CREATE INDEX idx_audit_log_company ON audit_logs.data_access_log(company_id, created_at DESC);
CREATE INDEX idx_unlocked_access_company ON fraternity_data.unlocked_access(company_id);

-- ==========================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================

COMMENT ON TABLE encrypted_pii.members IS 'Stores encrypted PII for fraternity members. All PII fields use pgcrypto encryption.';
COMMENT ON COLUMN encrypted_pii.members.email_hash IS 'SHA-256 hash of lowercase, trimmed email for duplicate detection';
COMMENT ON COLUMN encrypted_pii.members.opt_out IS 'Member has requested their data not be shared';
COMMENT ON TABLE audit_logs.data_access_log IS 'Comprehensive audit trail for all data access. Required for compliance.';