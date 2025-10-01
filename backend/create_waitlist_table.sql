-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(100),
  referrer TEXT,
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index on signup_date for ordering
CREATE INDEX IF NOT EXISTS idx_waitlist_signup_date ON waitlist(signup_date DESC);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insert for all users
CREATE POLICY "Allow public insert" ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow select for authenticated users
CREATE POLICY "Allow authenticated select" ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Also allow anon to select their own entry
CREATE POLICY "Allow anon select" ON waitlist
  FOR SELECT
  TO anon
  USING (true);
