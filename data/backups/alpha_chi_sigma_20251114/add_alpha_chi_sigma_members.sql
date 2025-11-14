-- Migration: Add 10 Alpha Chi Sigma Members from Penn State
-- Created: 2025-11-14
-- Description: Adds 10 members to the Alpha Chi Sigma chapter at Penn State

-- First, ensure the Alpha Chi Sigma organization exists
INSERT INTO greek_organizations (
  id,
  name,
  greek_letters,
  organization_type,
  founded_year,
  national_website,
  philanthropy,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Alpha Chi Sigma',
  'ΑΧΣ',
  'honor_society',
  1902,
  'https://www.alphachisigma.org',
  'Chemistry Education and Research',
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Store the organization ID in a variable for reuse
DO $$
DECLARE
  v_org_id UUID;
  v_university_id UUID;
  v_chapter_id UUID;
BEGIN
  -- Get or create Penn State University
  INSERT INTO universities (
    name,
    location,
    state,
    student_count,
    website,
    created_at,
    updated_at
  ) VALUES (
    'Penn State University',
    'University Park, PA',
    'Pennsylvania',
    46800,
    'https://www.psu.edu',
    NOW(),
    NOW()
  ) ON CONFLICT DO NOTHING;

  SELECT id INTO v_university_id FROM universities WHERE name = 'Penn State University' LIMIT 1;

  -- Get Alpha Chi Sigma organization ID
  SELECT id INTO v_org_id FROM greek_organizations WHERE name = 'Alpha Chi Sigma' LIMIT 1;

  -- Create chapter if it doesn't exist
  INSERT INTO chapters (
    id,
    greek_organization_id,
    university_id,
    chapter_name,
    charter_date,
    status,
    contact_email,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_org_id,
    v_university_id,
    'Alpha Chi Sigma - Penn State',
    '1905-01-01',
    'active',
    'alphachisigma@psu.edu',
    NOW(),
    NOW()
  ) ON CONFLICT (greek_organization_id, university_id) DO NOTHING;

  -- Get chapter ID
  SELECT id INTO v_chapter_id FROM chapters
  WHERE greek_organization_id = v_org_id AND university_id = v_university_id
  LIMIT 1;

  -- Insert the 10 members
  INSERT INTO chapter_members (
    id,
    chapter_id,
    name,
    position,
    email,
    phone,
    graduation_year,
    member_type,
    is_primary_contact,
    created_at,
    updated_at
  ) VALUES
    -- User 1: Sebastiano Abbatiello
    (
      gen_random_uuid(),
      v_chapter_id,
      'Sebastiano Abbatiello',
      NULL,
      'sebastianoabbatiello123@gmail.com',
      '5169027725',
      2028,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 2: Ryan Aber
    (
      gen_random_uuid(),
      v_chapter_id,
      'Ryan Aber',
      NULL,
      'ryaber8@gmail.com',
      '724-393-5491',
      2025,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 3: Andrew Acker
    (
      gen_random_uuid(),
      v_chapter_id,
      'Andrew Acker',
      NULL,
      'andrewacker4@gmail.com',
      '(215) 530-0499',
      2026,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 4: Tyler Alesso
    (
      gen_random_uuid(),
      v_chapter_id,
      'Tyler Alesso',
      NULL,
      'tda5161@psu.edu',
      '(201) 320-8123',
      2026,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 5: Zane Alexander
    (
      gen_random_uuid(),
      v_chapter_id,
      'Zane Alexander',
      NULL,
      'zmalexander2590@gmail.com',
      '(814) 688-2087',
      2025,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 6: Marcus Allen
    (
      gen_random_uuid(),
      v_chapter_id,
      'Marcus Allen',
      NULL,
      'marcusallen1204@gmail.com',
      '7176689565',
      2028,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 7: Brandon Bart
    (
      gen_random_uuid(),
      v_chapter_id,
      'Brandon Bart',
      NULL,
      'brandon.bart14@outlook.com',
      '412-316-5874',
      2026,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 8: Christopher Barto
    (
      gen_random_uuid(),
      v_chapter_id,
      'Christopher Barto',
      NULL,
      'christopherbarto87@gmail.com',
      '(315) 368-3953',
      2026,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 9: Saje Behari
    (
      gen_random_uuid(),
      v_chapter_id,
      'Saje Behari',
      NULL,
      'sajel.behari@gmail.com',
      '(703) 901-1341',
      2025,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 10: Carlos Benitez
    (
      gen_random_uuid(),
      v_chapter_id,
      'Carlos Benitez',
      NULL,
      'maxbenitez777@gmail.com',
      '(914) 648-8311',
      2027,
      'member',
      false,
      NOW(),
      NOW()
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully added 10 Alpha Chi Sigma members to chapter_id: %', v_chapter_id;

END $$;
