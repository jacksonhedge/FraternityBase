-- Add state field to chapter_crm_view
-- This allows filtering chapters by state in the CRM

CREATE OR REPLACE VIEW chapter_crm_view AS
SELECT
  c.id as chapter_id,
  c.chapter_name,
  c.instagram_handle,
  c.status as chapter_status,
  u.name as university_name,
  u.state as state,  -- Added state field
  g.name as fraternity_name,

  -- Outreach Data
  co.status as outreach_status,
  co.engagement_score,
  co.priority,
  co.last_contact_date,
  co.next_follow_up_date,
  co.primary_contact_name,
  co.notes,
  co.fundraising_goal,
  co.fundraising_benefactor,
  co.fundraising_current,

  -- Instagram Metrics (most recent)
  cim.followers,
  cim.following,
  cim.post_count,
  cim.scraped_at as metrics_updated_at,

  -- Recent Activity
  (SELECT COUNT(*) FROM chapter_posts cp
   WHERE cp.chapter_id = c.id
   AND cp.posted_at > NOW() - INTERVAL '7 days') as posts_last_7_days,

  (SELECT COUNT(*) FROM chapter_posts cp
   WHERE cp.chapter_id = c.id
   AND cp.is_opportunity = true
   AND cp.posted_at > NOW() - INTERVAL '30 days') as opportunities_last_30_days,

  -- Most Recent Post
  (SELECT posted_at FROM chapter_posts cp
   WHERE cp.chapter_id = c.id
   ORDER BY cp.posted_at DESC LIMIT 1) as last_post_date

FROM chapters c
LEFT JOIN universities u ON c.university_id = u.id
LEFT JOIN greek_organizations g ON c.greek_organization_id = g.id
LEFT JOIN chapter_outreach co ON c.id = co.chapter_id
LEFT JOIN LATERAL (
  SELECT * FROM chapter_instagram_metrics
  WHERE chapter_id = c.id
  ORDER BY scraped_at DESC
  LIMIT 1
) cim ON true
WHERE c.instagram_handle IS NOT NULL;
