-- Assign grades to all chapters based on data quality
-- This uses a formula that considers:
-- - Member count (if available)
-- - Status (active vs inactive)
-- - Whether they have GreekRank URL
-- - Random variation for realism

-- Update all chapters with calculated grades
-- This should be run AFTER the column type migration (01_alter_five_star_rating_to_numeric.sql)
UPDATE chapters
SET five_star_rating = CASE
  -- Base score starts at 3.5
  WHEN TRUE THEN
    LEAST(5.0, GREATEST(1.0,
      3.5
      -- Member count bonus
      + CASE
          WHEN member_count >= 150 THEN 0.8
          WHEN member_count >= 100 THEN 0.5
          WHEN member_count >= 75 THEN 0.3
          WHEN member_count >= 50 THEN 0.1
          WHEN member_count >= 30 THEN 0
          WHEN member_count IS NOT NULL THEN -0.3
          ELSE -0.1 -- No member count data
        END
      -- Status bonus/penalty
      + CASE
          WHEN status = 'active' THEN 0.2
          WHEN status IN ('inactive', 'suspended') THEN -0.5
          ELSE 0
        END
      -- GreekRank URL bonus
      + CASE WHEN greekrank_url IS NOT NULL THEN 0.2 ELSE 0 END
      -- Random variation (-0.3 to +0.3 for realism)
      + (RANDOM() - 0.5) * 0.6
    ))
END
WHERE five_star_rating IS NULL;

-- Show distribution
SELECT
  CASE
    WHEN five_star_rating >= 5.0 THEN '5.0 ⭐ Premium'
    WHEN five_star_rating >= 4.5 THEN '4.5-4.9 ⭐ Quality'
    WHEN five_star_rating >= 4.0 THEN '4.0-4.4 ⭐ Good'
    WHEN five_star_rating >= 3.5 THEN '3.5-3.9 ⭐ Standard'
    WHEN five_star_rating >= 3.0 THEN '3.0-3.4 ⭐ Basic'
    ELSE '<3.0 ⭐ Budget'
  END as grade_tier,
  COUNT(*) as chapter_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM chapters
WHERE five_star_rating IS NOT NULL
GROUP BY grade_tier
ORDER BY MIN(five_star_rating) DESC;

-- Show sample of top-rated chapters
SELECT
  chapter_name,
  organization_type,
  five_star_rating,
  CASE
    WHEN five_star_rating >= 5.0 THEN 'Premium'
    WHEN five_star_rating >= 4.5 THEN 'Quality'
    WHEN five_star_rating >= 4.0 THEN 'Good'
    WHEN five_star_rating >= 3.5 THEN 'Standard'
    WHEN five_star_rating >= 3.0 THEN 'Basic'
    ELSE 'Budget'
  END as tier
FROM chapters
WHERE five_star_rating IS NOT NULL
ORDER BY five_star_rating DESC
LIMIT 20;
