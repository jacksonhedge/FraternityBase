-- Migration: Add 10 Additional Alpha Chi Sigma Members from Penn State (Users 11-20)
-- Created: 2025-11-14
-- Description: Adds 10 more members to the Alpha Chi Sigma chapter at Penn State
-- Prerequisite: Run add_alpha_chi_sigma_members.sql first

DO $$
DECLARE
  v_org_id UUID;
  v_university_id UUID;
  v_chapter_id UUID;
BEGIN
  -- Get Penn State University ID
  SELECT id INTO v_university_id FROM universities WHERE name = 'Penn State University' LIMIT 1;

  -- Get Alpha Chi Sigma organization ID
  SELECT id INTO v_org_id FROM greek_organizations WHERE name = 'Alpha Chi Sigma' LIMIT 1;

  -- Get chapter ID
  SELECT id INTO v_chapter_id FROM chapters
  WHERE greek_organization_id = v_org_id AND university_id = v_university_id
  LIMIT 1;

  -- Verify chapter exists
  IF v_chapter_id IS NULL THEN
    RAISE EXCEPTION 'Alpha Chi Sigma chapter at Penn State not found. Please run add_alpha_chi_sigma_members.sql first.';
  END IF;

  -- Insert the 10 additional members (Users 11-20)
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
    -- User 11: Sean Bienkowski
    (
      gen_random_uuid(),
      v_chapter_id,
      'Sean Bienkowski',
      NULL,
      'seanbien331@gmail.com',
      '973-941-0331',
      2026,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 12: Nicholas Blessing
    (
      gen_random_uuid(),
      v_chapter_id,
      'Nicholas Blessing',
      NULL,
      'nickdblessing@gmail.com',
      '781-568-0983',
      2027,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 13: Karl Bloomfield
    (
      gen_random_uuid(),
      v_chapter_id,
      'Karl Bloomfield',
      NULL,
      'karlbloomfield12@gmail.com',
      '(856) 812-5300',
      2026,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 14: Brian Boylan
    (
      gen_random_uuid(),
      v_chapter_id,
      'Brian Boylan',
      NULL,
      'brianboylan22@gmail.com',
      '(516) 273-6009',
      2025,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 15: Quinn Braddick
    (
      gen_random_uuid(),
      v_chapter_id,
      'Quinn Braddick',
      NULL,
      'quinnylax6@gmail.com',
      '(203) 816-1740',
      2025,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 16: Alec Calvitti
    (
      gen_random_uuid(),
      v_chapter_id,
      'Alec Calvitti',
      NULL,
      'aleccalvitti@icloud.com',
      '(610) 955-1232',
      2027,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 17: Antonio Campagna (Note: Incomplete address data)
    (
      gen_random_uuid(),
      v_chapter_id,
      'Antonio Campagna',
      NULL,
      'antcam1233@gmail.com',
      '2017322815',
      2028,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 18: Nicholas Cannon
    (
      gen_random_uuid(),
      v_chapter_id,
      'Nicholas Cannon',
      NULL,
      'nickcannon0518@gmail.com',
      '(215) 917-1084',
      2027,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 19: Jeff Casparro
    (
      gen_random_uuid(),
      v_chapter_id,
      'Jeff Casparro',
      NULL,
      'jeffcasp10@gmail.com',
      '(201) 848-2961',
      2027,
      'member',
      false,
      NOW(),
      NOW()
    ),
    -- User 20: Anthony Casso (Note: Incomplete address data)
    (
      gen_random_uuid(),
      v_chapter_id,
      'Anthony Casso',
      NULL,
      'antcas777@gmail.com',
      '3474150403',
      2028,
      'member',
      false,
      NOW(),
      NOW()
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully added 10 additional Alpha Chi Sigma members (Users 11-20) to chapter_id: %', v_chapter_id;

END $$;
