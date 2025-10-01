-- CREDIT SYSTEM DATABASE SCHEMA
-- Run this FIRST THING in the morning!

-- ==========================================
-- CREDIT MANAGEMENT TABLES
-- ==========================================

CREATE SCHEMA IF NOT EXISTS credits;

-- Company credit balances
CREATE TABLE credits.balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL UNIQUE,
    company_email VARCHAR(255) NOT NULL,
    total_credits INTEGER DEFAULT 0 CHECK (total_credits >= 0),
    lifetime_credits_purchased INTEGER DEFAULT 0,
    free_credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit transactions log
CREATE TABLE credits.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'spend', 'refund', 'bonus'
    credits_amount INTEGER NOT NULL, -- negative for spends
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,

    -- For purchases
    stripe_payment_intent VARCHAR(255),
    amount_paid DECIMAL(10,2),

    -- For spends
    action_type VARCHAR(100), -- 'unlock_roster', 'unlock_contacts', etc
    resource_type VARCHAR(50), -- 'chapter', 'member', 'export'
    resource_id UUID,

    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_company_transactions (company_id, created_at DESC)
);

-- Track what's been unlocked (prevent double charging)
CREATE TABLE credits.unlocked_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    unlock_type VARCHAR(50) NOT NULL, -- 'chapter_roster', 'chapter_contacts', 'member_email'
    chapter_id UUID,
    member_ids UUID[],
    credits_spent INTEGER NOT NULL,
    expires_at TIMESTAMP, -- NULL = permanent
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(company_id, unlock_type, chapter_id),
    INDEX idx_company_unlocks (company_id),
    INDEX idx_expires (expires_at)
);

-- Stripe webhook events (for idempotency)
CREATE TABLE credits.stripe_events (
    id VARCHAR(255) PRIMARY KEY, -- Stripe event ID
    type VARCHAR(100) NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit packages configuration
CREATE TABLE credits.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stripe_price_id VARCHAR(255),
    description TEXT,
    popular BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default packages
INSERT INTO credits.packages (name, credits, price, description, popular) VALUES
('Starter', 100, 59.00, 'Perfect for trying out the platform', false),
('Popular', 500, 275.00, 'Most popular choice for small campaigns', true),
('Professional', 1000, 500.00, 'Best value for active users', false),
('Enterprise', 5000, 2000.00, 'For large-scale operations', false);

-- ==========================================
-- QUICK ACCESS VIEWS
-- ==========================================

-- View for checking if user has access to data
CREATE OR REPLACE VIEW credits.user_access AS
SELECT
    u.company_id,
    u.unlock_type,
    u.chapter_id,
    u.expires_at,
    CASE
        WHEN u.expires_at IS NULL THEN true
        WHEN u.expires_at > NOW() THEN true
        ELSE false
    END as has_access
FROM credits.unlocked_data u;

-- Company credit summary
CREATE OR REPLACE VIEW credits.company_summary AS
SELECT
    b.company_id,
    b.company_email,
    b.total_credits,
    b.lifetime_credits_purchased,
    COUNT(DISTINCT u.chapter_id) as chapters_unlocked,
    MAX(t.created_at) as last_activity
FROM credits.balances b
LEFT JOIN credits.unlocked_data u ON b.company_id = u.company_id
LEFT JOIN credits.transactions t ON b.company_id = t.company_id
GROUP BY b.company_id, b.company_email, b.total_credits, b.lifetime_credits_purchased;

-- ==========================================
-- FUNCTIONS FOR CREDIT OPERATIONS
-- ==========================================

-- Function to check if user can afford an action
CREATE OR REPLACE FUNCTION credits.can_afford(
    p_company_id UUID,
    p_cost INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    SELECT total_credits INTO v_balance
    FROM credits.balances
    WHERE company_id = p_company_id;

    RETURN COALESCE(v_balance, 0) >= p_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to spend credits
CREATE OR REPLACE FUNCTION credits.spend_credits(
    p_company_id UUID,
    p_amount INTEGER,
    p_action_type VARCHAR,
    p_resource_type VARCHAR,
    p_resource_id UUID,
    p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_balance_before INTEGER;
    v_balance_after INTEGER;
BEGIN
    -- Get current balance with lock
    SELECT total_credits INTO v_balance_before
    FROM credits.balances
    WHERE company_id = p_company_id
    FOR UPDATE;

    -- Check sufficient balance
    IF v_balance_before < p_amount THEN
        RETURN FALSE;
    END IF;

    -- Calculate new balance
    v_balance_after := v_balance_before - p_amount;

    -- Update balance
    UPDATE credits.balances
    SET total_credits = v_balance_after,
        updated_at = CURRENT_TIMESTAMP
    WHERE company_id = p_company_id;

    -- Log transaction
    INSERT INTO credits.transactions (
        company_id,
        transaction_type,
        credits_amount,
        balance_before,
        balance_after,
        action_type,
        resource_type,
        resource_id,
        description
    ) VALUES (
        p_company_id,
        'spend',
        -p_amount,
        v_balance_before,
        v_balance_after,
        p_action_type,
        p_resource_type,
        p_resource_id,
        p_description
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits (from purchase)
CREATE OR REPLACE FUNCTION credits.add_credits(
    p_company_id UUID,
    p_company_email VARCHAR,
    p_amount INTEGER,
    p_stripe_payment_intent VARCHAR,
    p_amount_paid DECIMAL,
    p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_balance_before INTEGER;
    v_balance_after INTEGER;
BEGIN
    -- Get or create balance
    INSERT INTO credits.balances (company_id, company_email, total_credits)
    VALUES (p_company_id, p_company_email, 0)
    ON CONFLICT (company_id) DO NOTHING;

    -- Get current balance with lock
    SELECT total_credits INTO v_balance_before
    FROM credits.balances
    WHERE company_id = p_company_id
    FOR UPDATE;

    -- Calculate new balance
    v_balance_after := v_balance_before + p_amount;

    -- Update balance
    UPDATE credits.balances
    SET total_credits = v_balance_after,
        lifetime_credits_purchased = lifetime_credits_purchased + p_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE company_id = p_company_id;

    -- Log transaction
    INSERT INTO credits.transactions (
        company_id,
        transaction_type,
        credits_amount,
        balance_before,
        balance_after,
        stripe_payment_intent,
        amount_paid,
        description
    ) VALUES (
        p_company_id,
        'purchase',
        p_amount,
        v_balance_before,
        v_balance_after,
        p_stripe_payment_intent,
        p_amount_paid,
        p_description
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX idx_balances_company ON credits.balances(company_id);
CREATE INDEX idx_transactions_company_date ON credits.transactions(company_id, created_at DESC);
CREATE INDEX idx_unlocked_company_chapter ON credits.unlocked_data(company_id, chapter_id);
CREATE INDEX idx_stripe_events_type ON credits.stripe_events(type, processed);