-- Analyze current chapter data to understand what we have for grading

-- 1. Count total chapters
SELECT 
  COUNT(*) as total_chapters,
  COUNT(CASE WHEN organization_type = 'fraternity' THEN 1 END) as fraternities,
  COUNT(CASE WHEN organization_type = 'sorority' THEN 1 END) as sororities
FROM chapters;

-- 2. Check what data fields we have
SELECT 
  COUNT(*) as total,
  COUNT(rank) as has_rank,
  COUNT(member_count) as has_member_count,
  COUNT(greekrank_url) as has_greekrank_url,
  COUNT(status) as has_status,
  AVG(CASE WHEN rank IS NOT NULL THEN rank END) as avg_rank
FROM chapters;

-- 3. Check if we have any existing ranks
SELECT rank, COUNT(*) as count
FROM chapters
WHERE rank IS NOT NULL
GROUP BY rank
ORDER BY rank DESC;

-- 4. Sample of chapter data
SELECT 
  c.id,
  c.chapter_name,
  c.organization_type,
  c.rank,
  c.member_count,
  c.status,
  c.greekrank_url,
  u.name as university
FROM chapters c
LEFT JOIN universities u ON c.university_id = u.id
LIMIT 10;
