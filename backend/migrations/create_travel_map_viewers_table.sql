-- Migration: Create travel_map_viewers table
-- Purpose: Track emails of users who view the public travel map
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS travel_map_viewers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(100) NOT NULL,
  viewed_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_email (email),
  INDEX idx_token (token),
  INDEX idx_viewed_at (viewed_at),

  -- Unique constraint to prevent duplicate email+token combinations
  UNIQUE KEY unique_email_token (email, token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE travel_map_viewers COMMENT = 'Tracks emails of users who view the public travel map';
