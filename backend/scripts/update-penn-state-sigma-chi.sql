-- Update Penn State Sigma Chi (Alpha Chi chapter) with social media
-- Based on:
-- Instagram: https://www.instagram.com/sigmachisc/
-- Website: https://pennstatesig.org/

UPDATE chapters
SET
  website = 'https://pennstatesig.org/',
  instagram_handle_official = 'sigmachisc',
  updated_at = NOW()
WHERE greek_letter_name = 'Gamma' -- Penn State is listed as Gamma in the comprehensive list
  AND greek_organization_id = (SELECT id FROM greek_organizations WHERE name = 'Sigma Chi')
  AND university_id = (SELECT id FROM universities WHERE name ILIKE '%Pennsylvania State%' LIMIT 1);

-- Verify the update
SELECT
  c.id,
  c.chapter_name,
  c.greek_letter_name,
  u.name as university_name,
  c.website,
  c.instagram_handle_official,
  c.city,
  c.state_province
FROM chapters c
JOIN universities u ON c.university_id = u.id
WHERE c.greek_letter_name = 'Gamma'
  AND c.greek_organization_id = (SELECT id FROM greek_organizations WHERE name = 'Sigma Chi');
