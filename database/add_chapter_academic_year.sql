-- Add academic year tracking to chapters
-- This allows tracking the same fraternity chapter across different years
-- Example: "Sigma Chi at Penn State 2024-2025" vs "Sigma Chi at Penn State 2025-2026"

-- Add academic_year column to chapters table
ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(9) DEFAULT '2024-2025';

-- Add is_current_year flag to easily filter for current year
ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS is_current_year BOOLEAN DEFAULT true;

-- Add index for faster queries by year
CREATE INDEX IF NOT EXISTS idx_chapters_academic_year ON public.chapters(academic_year);
CREATE INDEX IF NOT EXISTS idx_chapters_current_year ON public.chapters(is_current_year) WHERE is_current_year = true;

-- Add composite unique constraint to prevent duplicate chapter-year combinations
-- A chapter can only exist once per academic year
CREATE UNIQUE INDEX IF NOT EXISTS idx_chapters_unique_year
ON public.chapters(greek_organization_id, university_id, academic_year);

-- Add comment explaining the structure
COMMENT ON COLUMN public.chapters.academic_year IS
'Academic year for this chapter snapshot (e.g., "2024-2025"). Each year creates a new record.';

COMMENT ON COLUMN public.chapters.is_current_year IS
'Flag indicating if this is the current academic year. Used for default filtering.';

-- Create helper function to get current academic year
CREATE OR REPLACE FUNCTION public.get_current_academic_year()
RETURNS VARCHAR(9) AS $$
DECLARE
    current_month INTEGER;
    current_year INTEGER;
    academic_year VARCHAR(9);
BEGIN
    current_month := EXTRACT(MONTH FROM CURRENT_DATE);
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);

    -- Academic year starts in August (month 8)
    -- If we're in Aug-Dec, academic year is YYYY-YYYY+1
    -- If we're in Jan-Jul, academic year is YYYY-1-YYYY
    IF current_month >= 8 THEN
        academic_year := current_year::TEXT || '-' || (current_year + 1)::TEXT;
    ELSE
        academic_year := (current_year - 1)::TEXT || '-' || current_year::TEXT;
    END IF;

    RETURN academic_year;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.get_current_academic_year IS
'Returns the current academic year in format YYYY-YYYY (e.g., "2024-2025"). Academic year starts in August.';

-- Example: Update existing chapters to have current academic year
UPDATE public.chapters
SET academic_year = public.get_current_academic_year(),
    is_current_year = true
WHERE academic_year IS NULL OR academic_year = '2024-2025';

-- View to show chapter history across years
CREATE OR REPLACE VIEW public.chapter_year_summary AS
SELECT
    c.greek_organization_id,
    c.university_id,
    go.name as organization_name,
    u.name as university_name,
    c.chapter_name,
    COUNT(*) as years_tracked,
    MIN(c.academic_year) as first_year,
    MAX(c.academic_year) as most_recent_year,
    ARRAY_AGG(c.academic_year ORDER BY c.academic_year DESC) as all_years,
    ARRAY_AGG(c.member_count ORDER BY c.academic_year DESC) as member_counts_by_year
FROM public.chapters c
LEFT JOIN public.greek_organizations go ON c.greek_organization_id = go.id
LEFT JOIN public.universities u ON c.university_id = u.id
GROUP BY c.greek_organization_id, c.university_id, go.name, u.name, c.chapter_name;

COMMENT ON VIEW public.chapter_year_summary IS
'Summary view showing all years tracked for each chapter with historical data';
