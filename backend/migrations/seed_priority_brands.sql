-- Seed Priority Brands for Fraternity Interest System
-- These brands are immediately available for fraternities to browse and mark interest in

-- Insert priority brands (visible to fraternities immediately)
INSERT INTO companies (company_name, email, description, approval_status, subscription_tier, created_at) VALUES
  (
    'FanDuel',
    'partnerships@fanduel.com',
    'Leading sports betting and daily fantasy sports platform. Partner with college chapters for exclusive promotions and game day experiences.',
    'approved',
    'enterprise',
    NOW()
  ),
  (
    'DraftKings',
    'partnerships@draftkings.com',
    'Premier sports betting, daily fantasy, and online casino platform. Engage with college communities through sponsorship opportunities.',
    'approved',
    'enterprise',
    NOW()
  ),
  (
    'Sleeper',
    'partnerships@sleeper.com',
    'Modern fantasy sports and social platform. Connect with college students through fantasy leagues and community engagement.',
    'approved',
    'growth',
    NOW()
  ),
  (
    'ESPN',
    'college@espn.com',
    'The worldwide leader in sports media. Partner for campus events, watch parties, and exclusive ESPN+ subscriptions.',
    'approved',
    'enterprise',
    NOW()
  ),
  (
    'HBO (Max)',
    'campus@hbo.com',
    'Premium entertainment streaming service. Offer exclusive content access and viewing party sponsorships for college organizations.',
    'approved',
    'enterprise',
    NOW()
  ),
  (
    'ProphetX',
    'hello@prophetx.com',
    'Next-generation prediction markets platform. Engage college students in real-time event predictions and competitions.',
    'approved',
    'growth',
    NOW()
  ),
  (
    'Kalshi',
    'partnerships@kalshi.com',
    'Regulated event contracts marketplace. Partner with students interested in prediction markets and event trading.',
    'approved',
    'growth',
    NOW()
  ),
  (
    'Polymarket',
    'team@polymarket.com',
    'Decentralized information markets platform. Connect with crypto-savvy college communities and blockchain enthusiasts.',
    'approved',
    'growth',
    NOW()
  ),
  (
    'LineLeap',
    'partners@lineleap.com',
    'Skip-the-line nightlife app for college students. Partner with Greek organizations for exclusive bar and club access.',
    'approved',
    'growth',
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  approval_status = EXCLUDED.approval_status,
  subscription_tier = EXCLUDED.subscription_tier;

-- Create account_balance entries for these companies (with 0 credits to start)
INSERT INTO account_balance (company_id, credits_balance, subscription_tier, created_at)
SELECT
  id,
  0 as credits_balance,
  subscription_tier,
  NOW()
FROM companies
WHERE company_name IN (
  'FanDuel', 'DraftKings', 'Sleeper', 'ESPN', 'HBO (Max)',
  'ProphetX', 'Kalshi', 'Polymarket', 'LineLeap'
)
ON CONFLICT (company_id) DO NOTHING;

-- Log the seed operation
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully seeded % priority brands for fraternity interest system',
    (SELECT COUNT(*) FROM companies WHERE company_name IN (
      'FanDuel', 'DraftKings', 'Sleeper', 'ESPN', 'HBO (Max)',
      'ProphetX', 'Kalshi', 'Polymarket', 'LineLeap'
    ));
END $$;
