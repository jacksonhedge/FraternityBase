-- Create partnerships table for tracking brand deals
-- This table tracks partnerships between brands and chapters facilitated by FraternityBase

CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

  -- Partnership details
  brand_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  partnership_type TEXT CHECK (partnership_type IN ('sponsorship', 'event', 'product_placement', 'ambassador', 'other')),

  -- Financial details
  deal_value NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  commission_earned NUMERIC(10, 2),

  -- Dates
  signed_date TIMESTAMP,
  start_date TIMESTAMP,
  end_date TIMESTAMP,

  -- Additional info
  contact_name TEXT,
  contact_email TEXT,
  description TEXT,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID -- Reference to user who created it
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partnerships_chapter_id ON partnerships(chapter_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_company_id ON partnerships(company_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_created_at ON partnerships(created_at);
CREATE INDEX IF NOT EXISTS idx_partnerships_signed_date ON partnerships(signed_date);

-- Comments for documentation
COMMENT ON TABLE partnerships IS 'Tracks brand partnerships facilitated through FraternityBase';
COMMENT ON COLUMN partnerships.status IS 'pending: in discussion, active: signed and ongoing, completed: finished successfully, cancelled: did not complete';
COMMENT ON COLUMN partnerships.deal_value IS 'Total value of the partnership deal in dollars';
COMMENT ON COLUMN partnerships.commission_earned IS 'Commission earned by FraternityBase for facilitating this partnership';
