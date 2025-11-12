-- Create travel_map_viewers table for tracking email gate viewers
CREATE TABLE IF NOT EXISTS travel_map_viewers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, token)
);

-- Create index for faster queries by token
CREATE INDEX IF NOT EXISTS idx_travel_map_viewers_token ON travel_map_viewers(token);

-- Create index for faster queries by viewed_at
CREATE INDEX IF NOT EXISTS idx_travel_map_viewers_viewed_at ON travel_map_viewers(viewed_at DESC);

COMMENT ON TABLE travel_map_viewers IS 'Tracks email submissions for public travel map viewers';
COMMENT ON COLUMN travel_map_viewers.email IS 'Email address of the viewer';
COMMENT ON COLUMN travel_map_viewers.token IS 'Custom token for the travel map URL (e.g., client-demo)';
COMMENT ON COLUMN travel_map_viewers.viewed_at IS 'Timestamp when the viewer submitted their email';
COMMENT ON COLUMN travel_map_viewers.created_at IS 'Timestamp when the record was created';
