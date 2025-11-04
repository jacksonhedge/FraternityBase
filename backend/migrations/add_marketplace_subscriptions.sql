-- Migration: Add Marketplace Subscriptions and Commission Tracking
-- Date: 2025-11-04
-- Purpose: Track business subscriptions ($99/month) and partnership commissions (15% fixed, 20% CPA)

-- ============================================================================
-- MARKETPLACE_SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL CHECK (plan IN ('standard', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'past_due')),

    -- Stripe integration
    stripe_session_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,

    -- Pricing
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    seats INTEGER NOT NULL DEFAULT 1 CHECK (seats >= 1 AND seats <= 10),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_subscriptions_company
ON marketplace_subscriptions(company_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_subscriptions_status
ON marketplace_subscriptions(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_marketplace_subscriptions_stripe_subscription
ON marketplace_subscriptions(stripe_subscription_id);

-- ============================================================================
-- PARTNERSHIP_COMMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS partnership_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_id UUID REFERENCES sponsorship_applications(id) ON DELETE CASCADE,

    -- Deal details
    deal_type VARCHAR(50) NOT NULL CHECK (deal_type IN ('fixed', 'cpa')),
    partnership_amount DECIMAL(10,2) NOT NULL,

    -- Commission calculation
    commission_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.15 = 15%, 0.20 = 20%
    commission_amount DECIMAL(10,2) NOT NULL,

    -- Payment status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'waived')),
    paid_at TIMESTAMPTZ,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_partnership_commissions_partnership
ON partnership_commissions(partnership_id);

CREATE INDEX IF NOT EXISTS idx_partnership_commissions_status
ON partnership_commissions(status);

-- ============================================================================
-- ADD SUBSCRIPTION CHECK TO COMPANIES TABLE
-- ============================================================================

-- Add column to track if company has active marketplace subscription
ALTER TABLE companies ADD COLUMN IF NOT EXISTS has_active_marketplace_subscription BOOLEAN DEFAULT FALSE;

-- Create function to update subscription status on companies table
CREATE OR REPLACE FUNCTION update_company_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE companies
        SET has_active_marketplace_subscription = TRUE
        WHERE id = NEW.company_id;
    ELSIF NEW.status IN ('cancelled', 'past_due') THEN
        UPDATE companies
        SET has_active_marketplace_subscription = FALSE
        WHERE id = NEW.company_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_company_subscription ON marketplace_subscriptions;
CREATE TRIGGER trigger_update_company_subscription
AFTER INSERT OR UPDATE OF status ON marketplace_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_company_subscription_status();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT ON marketplace_subscriptions TO authenticated;
GRANT SELECT ON partnership_commissions TO authenticated;

-- ============================================================================
-- SAMPLE DATA (FOR TESTING)
-- ============================================================================

-- Note: This is commented out - only use for testing
/*
-- Insert test subscription for first company
INSERT INTO marketplace_subscriptions (
    company_id,
    plan,
    status,
    amount,
    billing_cycle,
    activated_at
)
SELECT
    id,
    'standard',
    'active',
    99.00,
    'monthly',
    NOW()
FROM companies
LIMIT 1;
*/

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    -- Check tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_subscriptions') THEN
        RAISE NOTICE '✓ marketplace_subscriptions table created';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partnership_commissions') THEN
        RAISE NOTICE '✓ partnership_commissions table created';
    END IF;

    RAISE NOTICE 'Migration complete!';
END $$;
