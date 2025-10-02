-- Simple migration to add Greek letter fields to chapters table
-- Run this in Supabase SQL Editor

ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS greek_letter_name TEXT,
ADD COLUMN IF NOT EXISTS chapter_type TEXT,
ADD COLUMN IF NOT EXISTS fraternity_province TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state_province TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chapters_greek_letter ON chapters(greek_letter_name);
CREATE INDEX IF NOT EXISTS idx_chapters_type ON chapters(chapter_type);
CREATE INDEX IF NOT EXISTS idx_chapters_province ON chapters(fraternity_province);
