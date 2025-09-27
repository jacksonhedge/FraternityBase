-- Sample data for College Org Network
-- Insert sample universities, Greek organizations, chapters, and companies

-- Insert Universities
INSERT INTO universities (name, location, state, student_count, greek_percentage, website) VALUES
('University of Alabama', 'Tuscaloosa, AL', 'Alabama', 38500, 0.36, 'https://www.ua.edu'),
('University of Georgia', 'Athens, GA', 'Georgia', 39100, 0.28, 'https://www.uga.edu'),
('Auburn University', 'Auburn, AL', 'Alabama', 31500, 0.32, 'https://www.auburn.edu'),
('University of Mississippi', 'Oxford, MS', 'Mississippi', 23800, 0.35, 'https://olemiss.edu'),
('University of Tennessee', 'Knoxville, TN', 'Tennessee', 31700, 0.22, 'https://www.utk.edu'),
('Florida State University', 'Tallahassee, FL', 'Florida', 42000, 0.26, 'https://www.fsu.edu'),
('Penn State University', 'University Park, PA', 'Pennsylvania', 47000, 0.17, 'https://www.psu.edu'),
('Ohio State University', 'Columbus, OH', 'Ohio', 61400, 0.13, 'https://www.osu.edu'),
('University of Texas', 'Austin, TX', 'Texas', 51900, 0.14, 'https://www.utexas.edu'),
('University of Southern California', 'Los Angeles, CA', 'California', 47300, 0.23, 'https://www.usc.edu');

-- Insert Greek Organizations (Fraternities)
INSERT INTO greek_organizations (name, greek_letters, organization_type, founded_year, total_chapters, total_members, colors, philanthropy) VALUES
('Sigma Chi', 'ΣΧ', 'fraternity', 1855, 246, 350000, 'Blue and Old Gold', 'Huntsman Cancer Foundation'),
('Phi Delta Theta', 'ΦΔΘ', 'fraternity', 1848, 190, 300000, 'Azure and Argent', 'ALS Association'),
('Delta Tau Delta', 'ΔΤΔ', 'fraternity', 1858, 133, 175000, 'Purple, White, and Gold', 'JDRF'),
('Kappa Sigma', 'ΚΣ', 'fraternity', 1869, 318, 300000, 'Scarlet, White, and Emerald Green', 'Military Heroes Campaign'),
('Pi Kappa Alpha', 'ΠΚΑ', 'fraternity', 1868, 220, 300000, 'Garnet and Old Gold', 'Taylor Trudeau Cycle for Life'),
('Sigma Alpha Epsilon', 'ΣΑΕ', 'fraternity', 1856, 237, 340000, 'Purple and Gold', 'Children''s Miracle Network');

-- Insert Greek Organizations (Sororities)
INSERT INTO greek_organizations (name, greek_letters, organization_type, founded_year, total_chapters, total_members, colors, philanthropy) VALUES
('Kappa Kappa Gamma', 'ΚΚΓ', 'sorority', 1870, 140, 260000, 'Light Blue and Dark Blue', 'Reading Is Fundamental'),
('Chi Omega', 'ΧΩ', 'sorority', 1895, 181, 400000, 'Cardinal and Straw', 'Make-A-Wish Foundation'),
('Alpha Phi', 'ΑΦ', 'sorority', 1872, 172, 250000, 'Silver and Bordeaux', 'Women''s Heart Health'),
('Delta Delta Delta', 'ΔΔΔ', 'sorority', 1888, 142, 250000, 'Silver, Gold, and Blue', 'St. Jude Children''s Research Hospital'),
('Kappa Alpha Theta', 'ΚΑΘ', 'sorority', 1870, 147, 250000, 'Black and Gold', 'Court Appointed Special Advocates'),
('Alpha Chi Omega', 'ΑΧΩ', 'sorority', 1885, 147, 230000, 'Scarlet and Olive Green', 'Domestic Violence Awareness');

-- Insert Sample Chapters at University of Alabama
INSERT INTO chapters (greek_organization_id, university_id, chapter_name, charter_date, member_count, officer_count, status, gpa_requirement, dues_amount, engagement_score, partnership_openness, event_frequency)
SELECT
    go.id,
    u.id,
    CASE
        WHEN go.name = 'Sigma Chi' THEN 'Alpha Iota'
        WHEN go.name = 'Phi Delta Theta' THEN 'Alabama Alpha'
        WHEN go.name = 'Delta Tau Delta' THEN 'Delta Eta'
        WHEN go.name = 'Kappa Sigma' THEN 'Delta Chi'
        WHEN go.name = 'Pi Kappa Alpha' THEN 'Gamma Alpha'
        WHEN go.name = 'Sigma Alpha Epsilon' THEN 'Alabama Mu'
    END as chapter_name,
    CASE
        WHEN go.name = 'Sigma Chi' THEN '1912-03-15'
        WHEN go.name = 'Phi Delta Theta' THEN '1877-10-20'
        WHEN go.name = 'Delta Tau Delta' THEN '1893-11-12'
        WHEN go.name = 'Kappa Sigma' THEN '1894-04-08'
        WHEN go.name = 'Pi Kappa Alpha' THEN '1924-09-10'
        WHEN go.name = 'Sigma Alpha Epsilon' THEN '1856-06-18'
    END::DATE as charter_date,
    FLOOR(RANDOM() * (180 - 120 + 1) + 120)::INT as member_count,
    12 as officer_count,
    'active' as status,
    2.7 as gpa_requirement,
    FLOOR(RANDOM() * (2000 - 1200 + 1) + 1200)::DECIMAL(10,2) as dues_amount,
    FLOOR(RANDOM() * (90 - 70 + 1) + 70)::INT as engagement_score,
    CASE
        WHEN RANDOM() < 0.7 THEN 'open'
        WHEN RANDOM() < 0.9 THEN 'selective'
        ELSE 'closed'
    END as partnership_openness,
    FLOOR(RANDOM() * (8 - 4 + 1) + 4)::INT as event_frequency
FROM greek_organizations go, universities u
WHERE go.organization_type = 'fraternity'
AND u.name = 'University of Alabama'
LIMIT 6;

-- Insert Sample Sorority Chapters at University of Alabama
INSERT INTO chapters (greek_organization_id, university_id, chapter_name, charter_date, member_count, officer_count, status, gpa_requirement, dues_amount, engagement_score, partnership_openness, event_frequency)
SELECT
    go.id,
    u.id,
    CASE
        WHEN go.name = 'Kappa Kappa Gamma' THEN 'Gamma Pi'
        WHEN go.name = 'Chi Omega' THEN 'Nu Beta'
        WHEN go.name = 'Alpha Phi' THEN 'Delta Mu'
        WHEN go.name = 'Delta Delta Delta' THEN 'Alpha Gamma'
        WHEN go.name = 'Kappa Alpha Theta' THEN 'Alpha Phi'
        WHEN go.name = 'Alpha Chi Omega' THEN 'Beta Psi'
    END as chapter_name,
    CASE
        WHEN go.name = 'Kappa Kappa Gamma' THEN '1928-05-10'
        WHEN go.name = 'Chi Omega' THEN '1922-03-20'
        WHEN go.name = 'Alpha Phi' THEN '1910-09-15'
        WHEN go.name = 'Delta Delta Delta' THEN '1914-11-08'
        WHEN go.name = 'Kappa Alpha Theta' THEN '1914-02-22'
        WHEN go.name = 'Alpha Chi Omega' THEN '1924-06-12'
    END::DATE as charter_date,
    FLOOR(RANDOM() * (220 - 160 + 1) + 160)::INT as member_count,
    10 as officer_count,
    'active' as status,
    2.9 as gpa_requirement,
    FLOOR(RANDOM() * (2500 - 1500 + 1) + 1500)::DECIMAL(10,2) as dues_amount,
    FLOOR(RANDOM() * (95 - 75 + 1) + 75)::INT as engagement_score,
    CASE
        WHEN RANDOM() < 0.8 THEN 'open'
        ELSE 'selective'
    END as partnership_openness,
    FLOOR(RANDOM() * (10 - 5 + 1) + 5)::INT as event_frequency
FROM greek_organizations go, universities u
WHERE go.organization_type = 'sorority'
AND u.name = 'University of Alabama'
LIMIT 6;

-- Insert Sample Companies
INSERT INTO companies (name, industry, company_size, website, headquarters_location, description, marketing_budget_range, partnership_types) VALUES
('Nike', 'Apparel & Fashion', 'enterprise', 'https://www.nike.com', 'Beaverton, OR', 'Global leader in athletic footwear and apparel', '1M+', ARRAY['events', 'ambassadors', 'sponsorships']),
('Red Bull', 'Food & Beverage', 'large', 'https://www.redbull.com', 'Santa Monica, CA', 'Energy drink and lifestyle brand', '500k-1M', ARRAY['events', 'ambassadors', 'sponsorships', 'merchandise']),
('Spotify', 'Technology', 'large', 'https://www.spotify.com', 'New York, NY', 'Music streaming platform', '100k-500k', ARRAY['events', 'ambassadors']),
('Chipotle', 'Food & Beverage', 'large', 'https://www.chipotle.com', 'Newport Beach, CA', 'Fast-casual restaurant chain', '50k-100k', ARRAY['events', 'sponsorships']),
('Adobe', 'Technology', 'enterprise', 'https://www.adobe.com', 'San Jose, CA', 'Creative software company', '100k-500k', ARRAY['ambassadors', 'events']),
('Lululemon', 'Apparel & Fashion', 'large', 'https://www.lululemon.com', 'Vancouver, BC', 'Athletic apparel retailer', '100k-500k', ARRAY['ambassadors', 'events', 'merchandise']),
('Amazon Prime Student', 'Technology', 'enterprise', 'https://www.amazon.com/primestudent', 'Seattle, WA', 'Student-focused membership program', '1M+', ARRAY['ambassadors', 'sponsorships']),
('Wells Fargo', 'Financial Services', 'enterprise', 'https://www.wellsfargo.com', 'San Francisco, CA', 'Banking and financial services', '100k-500k', ARRAY['events', 'sponsorships']),
('Bumble', 'Technology', 'medium', 'https://www.bumble.com', 'Austin, TX', 'Dating and social networking app', '50k-100k', ARRAY['ambassadors', 'events']),
('KIND Snacks', 'Food & Beverage', 'medium', 'https://www.kindsnacks.com', 'New York, NY', 'Healthy snack company', '25k-50k', ARRAY['events', 'merchandise']);

-- Insert Sample Company Users
INSERT INTO company_users (company_id, email, password_hash, first_name, last_name, position, role, is_verified)
SELECT
    c.id,
    LOWER(REPLACE(c.name, ' ', '')) || '.admin@' || LOWER(REPLACE(c.name, ' ', '')) || '.com',
    '$2b$10$YourHashedPasswordHere', -- In production, use proper bcrypt hashing
    'John',
    'Smith',
    'Marketing Director',
    'admin',
    true
FROM companies c;

-- Insert Sample Events for Chapters
INSERT INTO events (chapter_id, name, event_type, description, start_date, end_date, location, expected_attendance, budget_range, partnership_status)
SELECT
    c.id,
    CASE
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 1 THEN 'Spring Formal 2025'
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 2 THEN 'Rush Week 2025'
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 3 THEN 'Charity 5K Run'
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 4 THEN 'Alumni Weekend'
        ELSE 'Social Mixer'
    END as name,
    CASE
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 1 THEN 'formal'
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 2 THEN 'rush'
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 3 THEN 'philanthropy'
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 4 THEN 'social'
        ELSE 'mixer'
    END as event_type,
    CASE
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 1 THEN 'Annual spring formal dinner and dance'
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 2 THEN 'Recruitment week for potential new members'
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 3 THEN 'Fundraising run for local charity'
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id) = 4 THEN 'Weekend celebration with alumni'
        ELSE 'Social gathering with other Greek organizations'
    END as description,
    CURRENT_DATE + INTERVAL '30 days' + (ROW_NUMBER() OVER (PARTITION BY c.id) * INTERVAL '14 days') as start_date,
    CURRENT_DATE + INTERVAL '31 days' + (ROW_NUMBER() OVER (PARTITION BY c.id) * INTERVAL '14 days') as end_date,
    'Chapter House',
    FLOOR(RANDOM() * (300 - 100 + 1) + 100)::INT as expected_attendance,
    '5k-10k' as budget_range,
    CASE
        WHEN RANDOM() < 0.6 THEN 'open'
        WHEN RANDOM() < 0.9 THEN 'partnered'
        ELSE 'closed'
    END as partnership_status
FROM chapters c
CROSS JOIN LATERAL generate_series(1, 5) AS event_num
LIMIT 50;

-- Insert Sample Tags
INSERT INTO tags (name, category) VALUES
('Greek Week', 'event_type'),
('Philanthropy', 'event_type'),
('Rush', 'event_type'),
('Formal', 'event_type'),
('Social', 'event_type'),
('Technology', 'industry'),
('Fashion', 'industry'),
('Food & Beverage', 'industry'),
('Finance', 'industry'),
('Health & Wellness', 'industry'),
('High Engagement', 'interest'),
('Large Chapter', 'interest'),
('New Partnership', 'interest'),
('Athletic', 'interest'),
('Academic', 'interest');

-- Add some chapter officers for sample chapters
INSERT INTO chapter_officers (chapter_id, name, position, email, graduation_year, major, is_primary_contact)
SELECT
    c.id,
    CASE position_num
        WHEN 1 THEN 'Michael Johnson'
        WHEN 2 THEN 'Sarah Williams'
        WHEN 3 THEN 'David Brown'
        WHEN 4 THEN 'Emily Davis'
    END as name,
    CASE position_num
        WHEN 1 THEN 'President'
        WHEN 2 THEN 'Vice President'
        WHEN 3 THEN 'Treasurer'
        WHEN 4 THEN 'Social Chair'
    END as position,
    CASE position_num
        WHEN 1 THEN 'president@' || LOWER(REPLACE(go.name, ' ', '')) || 'ua.edu'
        WHEN 2 THEN 'vp@' || LOWER(REPLACE(go.name, ' ', '')) || 'ua.edu'
        WHEN 3 THEN 'treasurer@' || LOWER(REPLACE(go.name, ' ', '')) || 'ua.edu'
        WHEN 4 THEN 'social@' || LOWER(REPLACE(go.name, ' ', '')) || 'ua.edu'
    END as email,
    EXTRACT(YEAR FROM CURRENT_DATE)::INT + FLOOR(RANDOM() * 3 + 1)::INT as graduation_year,
    CASE FLOOR(RANDOM() * 5)::INT
        WHEN 0 THEN 'Business'
        WHEN 1 THEN 'Engineering'
        WHEN 2 THEN 'Communications'
        WHEN 3 THEN 'Pre-Med'
        ELSE 'Liberal Arts'
    END as major,
    CASE position_num
        WHEN 1 THEN true
        ELSE false
    END as is_primary_contact
FROM chapters c
JOIN greek_organizations go ON c.greek_organization_id = go.id
CROSS JOIN generate_series(1, 4) AS position_num
WHERE c.university_id = (SELECT id FROM universities WHERE name = 'University of Alabama')
LIMIT 48;