-- ============================================================================
-- SEED DATA FOR AIRBNB-STYLE MARKETPLACE
-- ============================================================================
-- This script creates sample data to test the enhanced marketplace frontend
-- Run this after applying the add_marketplace_enhanced_fields migration
-- ============================================================================

-- First, let's update an existing chapter with enhanced data
-- Note: Replace the chapter_id with an actual chapter ID from your database

-- Update Sigma Chi Penn State chapter (you'll need to find the actual ID)
-- This is an example - you'll need to run a SELECT first to get the real chapter_id

DO $$
DECLARE
    v_chapter_id UUID;
    v_organization_id UUID;
    v_university_id UUID;
BEGIN
    -- Try to find Sigma Chi organization
    SELECT id INTO v_organization_id
    FROM greek_organizations
    WHERE name ILIKE '%Sigma Chi%'
    LIMIT 1;

    -- Try to find Penn State university
    SELECT id INTO v_university_id
    FROM universities
    WHERE name ILIKE '%Penn State%' OR name ILIKE '%Pennsylvania State%'
    LIMIT 1;

    -- If we have both, try to find or create the chapter
    IF v_organization_id IS NOT NULL AND v_university_id IS NOT NULL THEN
        -- Try to find existing chapter
        SELECT id INTO v_chapter_id
        FROM chapters
        WHERE organization_id = v_organization_id
        AND university_id = v_university_id
        LIMIT 1;

        -- If no chapter exists, we'll just update the first chapter we find
        IF v_chapter_id IS NULL THEN
            SELECT id INTO v_chapter_id FROM chapters LIMIT 1;
        END IF;

        -- Update the chapter with enhanced marketplace data
        IF v_chapter_id IS NOT NULL THEN
            UPDATE chapters SET
                instagram_handle = 'sigmachipennstate',
                instagram_followers = 3200,
                instagram_engagement_rate = 4.5,
                average_post_reach = 5000,
                average_story_views = 1200,
                tiktok_handle = 'sigmachipennstate',
                tiktok_followers = 1500,
                facebook_page = 'https://facebook.com/sigmachipennstate',
                website_url = 'https://sigmachipennstate.com',
                cover_photo_url = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
                chapter_description = 'One of the top fraternities at Penn State, known for leadership, brotherhood, and community service. Our members are active across campus in athletics, academics, and student government.',
                chapter_gpa = 3.45,
                national_ranking = 'Top 10',
                campus_ranking = '#3',
                years_established = 1912,
                philanthropy_name = 'St. Jude Children''s Research Hospital',
                philanthropy_amount_raised = 15000,
                philanthropy_hours_volunteered = 450,
                member_count = 85,
                grade = 4.5
            WHERE id = v_chapter_id;

            -- Create a featured sponsorship opportunity for Spring Formal
            INSERT INTO sponsorship_opportunities (
                chapter_id,
                title,
                description,
                opportunity_type,
                budget_needed,
                budget_range,
                expected_reach,
                event_date,
                event_name,
                event_venue,
                expected_attendance,
                deliverables,
                geographic_scope,
                is_featured,
                is_urgent,
                status,
                posted_at,
                views_count,
                applications_count
            ) VALUES (
                v_chapter_id,
                'Spring Formal 2025 - Premium Event Sponsorship',
                'We''re seeking a premier sponsor for our annual Spring Formal, one of the most anticipated events of the year. This black-tie event will host 200+ students at the prestigious Hilton Downtown. Your brand will receive extensive exposure through our social media channels (5,000+ followers), event marketing materials, and direct member engagement. This is a unique opportunity to connect with college-aged consumers in an upscale, memorable setting.',
                'event_sponsor',
                2500,
                '$2,500 - $5,000',
                5000,
                '2025-04-15',
                'Spring Formal 2025',
                'Hilton Downtown, State College PA',
                200,
                ARRAY[
                    '3 Instagram posts (5,000+ impressions)',
                    '5 Instagram stories (1,200+ views)',
                    'Event banner placement (200 attendees)',
                    'Logo on 200 custom event t-shirts',
                    'Email blast to 85 active members',
                    'Exclusive booth space at venue entrance',
                    'Mention in event program',
                    'Post-event highlight reel feature'
                ],
                'local',
                true,  -- featured
                false, -- not urgent
                'active',
                NOW() - INTERVAL '2 days',
                34,
                3
            );

            RAISE NOTICE 'Created Spring Formal sponsorship for chapter %', v_chapter_id;

            -- Create another opportunity for Social Media Campaign
            INSERT INTO sponsorship_opportunities (
                chapter_id,
                title,
                description,
                opportunity_type,
                budget_needed,
                budget_range,
                expected_reach,
                event_date,
                deliverables,
                geographic_scope,
                is_featured,
                is_urgent,
                status,
                posted_at,
                views_count,
                applications_count
            ) VALUES (
                v_chapter_id,
                'Month-Long Social Media Partnership',
                'Partner with us for a dedicated month-long social media campaign across Instagram and TikTok. We''ll create authentic, engaging content featuring your brand integrated into our daily chapter activities, events, and lifestyle content. Perfect for brands targeting college students.',
                'social_media',
                1500,
                '$1,500 - $3,000',
                8000,
                NULL,
                ARRAY[
                    '8 Instagram feed posts throughout the month',
                    '12 Instagram story features',
                    '4 TikTok videos',
                    'Monthly analytics report',
                    'Dedicated highlight reel on Instagram',
                    'Product placement in chapter house'
                ],
                'regional',
                false,
                false,
                'active',
                NOW() - INTERVAL '5 days',
                18,
                1
            );

            RAISE NOTICE 'Created Social Media sponsorship for chapter %', v_chapter_id;

        END IF;
    ELSE
        RAISE NOTICE 'Could not find Sigma Chi or Penn State - skipping seed data';
    END IF;
END $$;

-- ============================================================================
-- Add a few more sample opportunities for other chapters
-- ============================================================================

-- Create an urgent merchandise opportunity
INSERT INTO sponsorship_opportunities (
    chapter_id,
    title,
    description,
    opportunity_type,
    budget_needed,
    budget_range,
    expected_reach,
    deliverables,
    geographic_scope,
    is_featured,
    is_urgent,
    status,
    posted_at,
    views_count,
    applications_count
)
SELECT
    id,
    'Custom Chapter Merchandise - URGENT',
    'We need a sponsor for our custom chapter merchandise line ASAP! This includes hoodies, t-shirts, and hats that will be worn by all 75 members throughout the semester. Your logo will be prominently displayed on all items.',
    'merchandise',
    1000,
    '$1,000 - $2,000',
    3000,
    ARRAY[
        'Logo on 200 pieces of apparel',
        '3 Instagram posts showcasing merchandise',
        'Members wearing merch at campus events',
        'Photo gallery on chapter website'
    ],
    'local',
    false,
    true,  -- URGENT
    'active',
    NOW() - INTERVAL '1 day',
    12,
    0
FROM chapters
WHERE id != (SELECT chapter_id FROM sponsorship_opportunities LIMIT 1)
LIMIT 1;

-- Create a philanthropy event opportunity
INSERT INTO sponsorship_opportunities (
    chapter_id,
    title,
    description,
    opportunity_type,
    budget_needed,
    budget_range,
    expected_reach,
    event_date,
    event_name,
    expected_attendance,
    deliverables,
    geographic_scope,
    is_featured,
    is_urgent,
    status,
    posted_at,
    views_count,
    applications_count
)
SELECT
    id,
    'Annual Charity Basketball Tournament',
    'Join us as we host our 5th Annual Charity Basketball Tournament benefiting the local food bank. This campus-wide event attracts students from all organizations and raises significant funds for our community. Be the title sponsor and get your brand in front of 500+ students.',
    'philanthropy',
    3500,
    '$3,500 - $7,500',
    6000,
    '2025-03-20',
    'Hoops for Hunger 2025',
    500,
    ARRAY[
        'Title sponsor branding on all materials',
        '10+ Instagram posts leading up to event',
        'Banner display at tournament venue',
        'Logo on tournament t-shirts (500 shirts)',
        'Halftime brand activation opportunity',
        'Feature in campus newspaper coverage',
        'Email marketing to 1,200+ students'
    ],
    'local',
    true,  -- featured
    false,
    'active',
    NOW() - INTERVAL '3 days',
    28,
    2
FROM chapters
WHERE id NOT IN (SELECT DISTINCT chapter_id FROM sponsorship_opportunities)
LIMIT 1;

-- ============================================================================
-- Verify the data was created
-- ============================================================================

DO $$
DECLARE
    opportunity_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO opportunity_count
    FROM sponsorship_opportunities
    WHERE status = 'active';

    RAISE NOTICE '✓ Migration complete! Created % active sponsorship opportunities', opportunity_count;
    RAISE NOTICE 'Run GET /api/sponsorships to see the marketplace data';
END $$;
