-- Add is_platinum field to chapters table
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS is_platinum BOOLEAN DEFAULT FALSE;

-- Add comment to explain the field
COMMENT ON COLUMN chapters.is_platinum IS 'Indicates if this chapter has been referred/introduced to partners and has platinum status';

-- Update the existing platinum chapters
UPDATE chapters
SET is_platinum = TRUE
WHERE id IN (
  'e502e257-6dd3-4797-95f9-bb204636a26e', -- Sigma Chi at University of Michigan
  '813a94af-5d70-4df4-b968-e5ef5987d65f', -- Sigma Chi at Rutgers
  '22493c14-2d30-4d60-8e26-0004362e6f71', -- Sigma Chi at Michigan State
  '9a5881d7-7d1c-48a0-8b2b-ecdd8c045907', -- Sigma Chi at Texas A&M
  '0f783e4b-6140-49e0-9aa5-244d1e68d08f', -- Sigma Chi at Pitt
  'c3977257-4ea6-45bb-ac5b-3a694878c7aa', -- Phi Sigma Phi at WVU
  'dbdcbaa0-85df-4ded-baed-b364f295dae4', -- Sigma Chi at Illinois
  '9798592f-3821-4641-a07b-48329e760002', -- Zeta Psi at Rutgers
  'd449ab49-26a3-490d-b7b4-eb82d688c902', -- Chi Phi at Penn State
  '34bb9467-4719-4013-8d92-88842d97d1e1'  -- Lambda Chi Alpha at Penn State
);
