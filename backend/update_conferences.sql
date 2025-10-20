-- Update Power 5 Conference Schools
-- Big Ten
UPDATE universities SET conference = 'BIG 10' WHERE name IN (
  'Penn State University',
  'The Pennsylvania State University',
  'Ohio State University',
  'University of Michigan',
  'Michigan State University',
  'University of Wisconsin',
  'University of Iowa',
  'University of Minnesota',
  'Northwestern University',
  'Purdue University',
  'University of Illinois',
  'Indiana University',
  'University of Maryland',
  'Rutgers University',
  'University of Nebraska',
  'University of Oregon',
  'University of Washington',
  'University of Southern California',
  'University of California, Los Angeles'
);

-- SEC
UPDATE universities SET conference = 'SEC' WHERE name IN (
  'University of Alabama',
  'Auburn University',
  'University of Florida',
  'University of Georgia',
  'University of Kentucky',
  'Louisiana State University',
  'University of Mississippi',
  'Mississippi State University',
  'University of South Carolina',
  'University of Tennessee',
  'Vanderbilt University',
  'University of Arkansas',
  'University of Missouri',
  'Texas A&M University',
  'University of Oklahoma',
  'University of Texas'
);

-- ACC
UPDATE universities SET conference = 'ACC' WHERE name IN (
  'Clemson University',
  'Florida State University',
  'University of Miami',
  'University of North Carolina',
  'North Carolina State University',
  'Duke University',
  'Wake Forest University',
  'University of Virginia',
  'Virginia Tech',
  'Georgia Tech',
  'Boston College',
  'Syracuse University',
  'University of Pittsburgh',
  'University of Louisville',
  'Notre Dame University',
  'Stanford University',
  'California'
);

-- Big 12
UPDATE universities SET conference = 'BIG 12' WHERE name IN (
  'University of Kansas',
  'Kansas State University',
  'Baylor University',
  'Texas Christian University',
  'Texas Tech University',
  'West Virginia University',
  'Iowa State University',
  'Oklahoma State University',
  'University of Cincinnati',
  'University of Central Florida',
  'Brigham Young University',
  'University of Houston',
  'University of Colorado',
  'University of Arizona',
  'Arizona State University',
  'University of Utah'
);

-- Verify updates
SELECT name, conference, state FROM universities WHERE conference IN ('BIG 10', 'SEC', 'ACC', 'BIG 12') ORDER BY conference, name;
