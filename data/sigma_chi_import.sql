-- Sigma Chi Chapter Import
-- 240 Chapters with Geocoded Coordinates

-- Insert Sigma Chi Fraternity
INSERT INTO fraternity_data.fraternities (name, founding_year, headquarters)
VALUES ('Sigma Chi', 1855, 'Evanston, IL')
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
    v_fraternity_id UUID;
BEGIN
    SELECT id INTO v_fraternity_id FROM fraternity_data.fraternities WHERE name = 'Sigma Chi';

    -- Insert Chapters
    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha',
        'Miami University',
        'Oxford',
        'OH',
        'United States',
        'Southern Ohio',
        39.5094198,
        -84.7311546,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Alpha',
        'Hobart College',
        'Geneva',
        'NY',
        'United States',
        'Northwestern New York',
        42.8570498,
        -76.9871974,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Beta',
        'University of California-Berkeley',
        'Berkeley',
        'CA',
        'United States',
        'California Bay Area',
        37.8754996,
        -122.2390685,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Epsilon',
        'University of Nebraska',
        'Lincoln',
        'NE',
        'United States',
        'Kansas/Nebraska',
        40.8205941,
        -96.7026058,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Gamma',
        'Ohio State University',
        'Columbus',
        'OH',
        'United States',
        'Southern Ohio',
        40.0056802,
        -83.0286612,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Kappa',
        'Hillsdale College',
        'Hillsdale',
        'MI',
        'United States',
        'West Michigan',
        41.9318835,
        -84.6302306,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Nu',
        'University of Texas-Austin',
        'Austin',
        'TX',
        'United States',
        'Central Texas',
        30.2851494,
        -97.7339352,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Omega',
        'Stanford University',
        'Stanford',
        'CA',
        'United States',
        'California Bay Area',
        37.4313138,
        -122.1693654,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Omicron',
        'Tulane University',
        'New Orleans',
        'LA',
        'United States',
        'Southern',
        29.9412196,
        -90.1201009,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Phi',
        'Cornell University',
        'Ithaca',
        'NY',
        'United States',
        'Northwestern New York',
        42.4529076,
        -76.4800842,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Pi',
        'Albion College',
        'Albion',
        'MI',
        'United States',
        'West Michigan',
        42.2437255,
        -84.742901,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Sigma',
        'University of Minnesota',
        'Minneapolis',
        'MN',
        'United States',
        'North Central',
        44.956789,
        -93.2661251,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Tau',
        'University of North Carolina',
        'Chapel Hill',
        'NC',
        'United States',
        'Eastern North Carolina',
        35.9050353,
        -79.0477533,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Upsilon',
        'University of Southern California',
        'Los Angeles',
        'CA',
        'United States',
        'Los Angeles Coastal',
        34.0218689,
        -118.2858579,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Alpha Zeta',
        'Beloit College',
        'Beloit',
        'WI',
        'United States',
        'Wisconsin',
        42.5009819,
        -89.0157777,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Chi',
        'Emory University',
        'Atlanta',
        'GA',
        'United States',
        'North Georgia',
        33.7969409,
        -84.3237147,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Delta',
        'University of Montana',
        'Missoula',
        'MT',
        'United States',
        'The Big Sky',
        46.8541841,
        -113.9655283,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Epsilon',
        'University of Utah',
        'Salt Lake City',
        'UT',
        'United States',
        'Utah/Nevada',
        40.7628137,
        -111.8368719,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Eta',
        'Case Western Reserve University',
        'Cleveland',
        'OH',
        'United States',
        'Northern Ohio',
        41.501387,
        -81.6007022,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Gamma',
        'Colorado College',
        'Colorado Springs',
        'CO',
        'United States',
        'Rocky Mountain',
        38.8480439,
        -104.8239509,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Iota',
        'University of Oregon',
        'Eugene',
        'OR',
        'United States',
        'Northwestern',
        44.0444197,
        -123.0717603,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Kappa',
        'University of Oklahoma',
        'Norman',
        'OK',
        'United States',
        'Oklahoma/Arkansas',
        35.1959878,
        -97.4457083,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Lambda',
        'Duke University',
        'Durham',
        'NC',
        'United States',
        'Eastern North Carolina',
        36.0001557,
        -78.9442297,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Mu',
        'University of Colorado-Boulder',
        'Boulder',
        'CO',
        'United States',
        'Rocky Mountain',
        40.0070061,
        -105.2664423,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Omega',
        'University of Toronto-Toronto Metropolitan University',
        'Toronto',
        'ON',
        'Canada',
        'Ontario',
        43.663462,
        -79.3977597,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Phi',
        'University of Arizona',
        'Tucson',
        'AZ',
        'United States',
        'Grand Canyon',
        32.2356928,
        -110.951744,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Pi',
        'Oregon State University',
        'Corvallis',
        'OR',
        'United States',
        'Northwestern',
        44.563056,
        -123.2839234,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Psi',
        'Georgia Tech',
        'Atlanta',
        'GA',
        'United States',
        'North Georgia',
        33.7760948,
        -84.3988077,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Rho',
        'Montana State University',
        'Bozeman',
        'MT',
        'United States',
        'The Big Sky',
        45.6638859,
        -111.079287,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Sigma',
        'University of Tennessee-Knoxville',
        'Knoxville',
        'TN',
        'United States',
        'East Tennessee',
        35.9516352,
        -83.9308819,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Upsilon',
        'Washington State University',
        'Pullman',
        'WA',
        'United States',
        'The Big Sky',
        46.7337716,
        -117.1498035,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Xi',
        'University of New Mexico',
        'Albuquerque',
        'NM',
        'United States',
        'Southwestern',
        35.0866327,
        -106.6202094,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Beta Zeta',
        'University of North Dakota',
        'Grand Forks',
        'ND',
        'United States',
        'North Central',
        47.9265412,
        -97.0721209,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Chi',
        'Hanover College',
        'Hanover',
        'IN',
        'United States',
        'Central Kentucky',
        38.7165177,
        -85.4616428,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Chi Chi',
        'Birmingham-Southern College',
        'Birmingham',
        'AL',
        'United States',
        'Alabama Northern',
        33.5161855,
        -86.855847,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta',
        'University of Georgia',
        'Athens',
        'GA',
        'United States',
        'North Georgia',
        33.9404278,
        -83.373049,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Chi',
        'Wabash College',
        'Crawfordsville',
        'IN',
        'United States',
        'Central Indiana',
        40.0367972,
        -86.9072703,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Delta',
        'Purdue University',
        'West Lafayette',
        'IN',
        'United States',
        'Central Indiana',
        40.430028,
        -86.9264211,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Epsilon',
        'North Carolina State University',
        'Raleigh',
        'NC',
        'United States',
        'Eastern North Carolina',
        35.7718497,
        -78.674087,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Eta',
        'University of California-Los Angeles',
        'Los Angeles',
        'CA',
        'United States',
        'Los Angeles Coastal',
        34.0708777,
        -118.4468503,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Iota',
        'University of Denver',
        'Denver',
        'CO',
        'United States',
        'Rocky Mountain',
        39.6766157,
        -104.9623745,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Kappa',
        'Bowling Green State University',
        'Bowling Green',
        'OH',
        'United States',
        'Northern Ohio',
        41.3795005,
        -83.629789,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Mu',
        'Southern Methodist University',
        'Dallas',
        'TX',
        'United States',
        'Northern Texas',
        32.8418011,
        -96.7815281,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Nu',
        'Wake Forest University',
        'Winston-Salem',
        'NC',
        'United States',
        'Western North Carolina',
        36.133893,
        -80.2755578,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Omega',
        'University of Tulsa',
        'Tulsa',
        'OK',
        'United States',
        'Oklahoma/Arkansas',
        36.1523306,
        -95.9459602,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Phi',
        'University of Puget Sound',
        'Tacoma',
        'WA',
        'United States',
        'Northwestern',
        47.261437,
        -122.4809573,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Psi',
        'Rensselaer Polytechnic Institute',
        'Troy',
        'NY',
        'United States',
        'Hudson Valley',
        42.7298969,
        -73.6796678,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Rho',
        'Bradley University',
        'Peoria',
        'IL',
        'United States',
        'Central Illinois',
        40.6981131,
        -89.6155139,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Theta',
        'University of Tennessee-Chattanooga',
        'Chattanooga',
        'TN',
        'United States',
        'East Tennessee',
        35.0470904,
        -85.298257,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Upsilon',
        'Kansas State University',
        'Manhattan',
        'KS',
        'United States',
        'Kansas/Nebraska',
        39.2094557,
        -96.5884991,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Xi',
        'San Diego State University',
        'San Diego',
        'CA',
        'United States',
        'Southern California',
        32.7761529,
        -117.0733037,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Delta Zeta',
        'Willamette University',
        'Salem',
        'OR',
        'United States',
        'Northwestern',
        44.9355889,
        -123.0308129,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon',
        'George Washington University',
        'Washington',
        'DC',
        'United States',
        'Eastern',
        38.8998938,
        -77.0474483,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Eta',
        'California State University-Fresno',
        'Fresno',
        'CA',
        'United States',
        'California Central Valley',
        36.8209963,
        -119.7372976,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Kappa',
        'University of Memphis',
        'Memphis',
        'TN',
        'United States',
        'Mississippi River',
        35.1189387,
        -89.9372196,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Lambda',
        'Ripon College',
        'Ripon',
        'WI',
        'United States',
        'Wisconsin',
        43.8410236,
        -88.8539386,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Mu',
        'Texas Christian University',
        'Fort Worth',
        'TX',
        'United States',
        'Northern Texas',
        32.7080148,
        -97.3611939,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Nu',
        'Texas Tech University',
        'Lubbock',
        'TX',
        'United States',
        'Southwestern',
        33.5937526,
        -101.8995955,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Omega',
        'Ball State University',
        'Muncie',
        'IN',
        'United States',
        'Central Indiana',
        40.2097296,
        -85.4112151,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Omicron',
        'Western University',
        'London',
        'ON',
        'Canada',
        'Ontario',
        43.0054234,
        -81.274801,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Phi',
        'Southeast Missouri State University',
        'Cape Girardeau',
        'MO',
        'United States',
        'Mississippi River',
        37.3177704,
        -89.5285427,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Sigma',
        'Florida Southern College',
        'Lakeland',
        'FL',
        'United States',
        'Central Florida',
        28.0304561,
        -81.9455425,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Tau',
        'Murray State University',
        'Murray',
        'KY',
        'United States',
        'Mississippi River',
        36.6129699,
        -88.322088,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Theta',
        'San Jose State University',
        'San Jose',
        'CA',
        'United States',
        'California Bay Area',
        37.3351903,
        -121.8812255,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Xi',
        'University of Houston',
        'Houston',
        'TX',
        'United States',
        'East Texas',
        29.7207902,
        -95.3440627,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Epsilon Zeta',
        'Florida State University',
        'Tallahassee',
        'FL',
        'United States',
        'North Florida',
        30.442216,
        -84.297453,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta',
        'University of Mississippi',
        'Oxford',
        'MS',
        'United States',
        'Southern',
        34.3646125,
        -89.5396349,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Alpha',
        'Eastern Kentucky University',
        'Richmond',
        'KY',
        'United States',
        'Central Kentucky',
        37.7341619,
        -84.3011984,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Beta',
        'California State University-Long Beach',
        'Long Beach',
        'CA',
        'United States',
        'Los Angeles Coastal',
        33.7817709,
        -118.1152001,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Chi',
        'Youngstown State University',
        'Youngstown',
        'OH',
        'United States',
        'Northern Ohio',
        41.1067218,
        -80.6477542,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Delta',
        'Tennessee Tech University',
        'Cookeville',
        'TN',
        'United States',
        'East Tennessee',
        36.1748736,
        -85.5089051,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Epsilon',
        'University of South Alabama',
        'Mobile',
        'AL',
        'United States',
        'Alabama/Gulf Coast',
        30.6972412,
        -88.1892334,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Gamma',
        'Middle Tennessee State University',
        'Murfreesboro',
        'TN',
        'United States',
        'Mid-South',
        35.8486008,
        -86.3609036,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Iota',
        'Embry-Riddle Aeronautical University-Daytona Beach',
        'Daytona Beach',
        'FL',
        'United States',
        'Central Florida',
        29.1917532,
        -81.0495839,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Kappa',
        'Missouri State University',
        'Springfield',
        'MO',
        'United States',
        'Missouri',
        37.2017202,
        -93.2807714,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Omega',
        'Baylor University',
        'Waco',
        'TX',
        'United States',
        'Central Texas',
        31.5504341,
        -97.1102906,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Omicron',
        'Indiana University of Pennsylvania',
        'Indiana',
        'PA',
        'United States',
        'West Virginia/West Pennsylvania',
        40.6142019,
        -79.1609915,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Phi',
        'Troy University',
        'Troy',
        'AL',
        'United States',
        'Alabama/Gulf Coast',
        31.8022234,
        -85.9556867,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Pi',
        'University of Central Florida',
        'Orlando',
        'FL',
        'United States',
        'Central Florida',
        28.599591,
        -81.1971284,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Rho',
        'University of North Alabama',
        'Florence',
        'AL',
        'United States',
        'Alabama Northern',
        34.8075226,
        -87.6816129,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Sigma',
        'University of California-Irvine',
        'Irvine',
        'CA',
        'United States',
        'Southern California',
        33.6429469,
        -117.8401606,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Tau',
        'Stephen F. Austin State University',
        'Nacogdoches',
        'TX',
        'United States',
        'East Texas',
        31.623554,
        -94.6434449,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Theta',
        'Georgia Southwestern State University',
        'Americus',
        'GA',
        'United States',
        'North Georgia',
        32.0558951,
        -84.2174431,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Upsilon',
        'Texas A&M University-College Station',
        'College Station',
        'TX',
        'United States',
        'East Texas',
        30.6108618,
        -96.3520606,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Xi',
        'Austin Peay State University',
        'Clarksville',
        'TN',
        'United States',
        'Mid-South',
        36.5342965,
        -87.3543085,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Eta Zeta',
        'Georgia Southern University',
        'Statesboro',
        'GA',
        'United States',
        'South Carolina',
        32.4214381,
        -81.7845053,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Chi',
        'University of Maryland',
        'College Park',
        'MD',
        'United States',
        'Eastern',
        38.9784587,
        -76.9282678,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Delta',
        'Oklahoma State University',
        'Stillwater',
        'OK',
        'United States',
        'Oklahoma/Arkansas',
        36.1313523,
        -97.0890651,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Epsilon',
        'Whitman College',
        'Walla Walla',
        'WA',
        'United States',
        'The Big Sky',
        46.0705767,
        -118.3303124,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Eta',
        'University of Idaho',
        'Moscow',
        'ID',
        'United States',
        'The Big Sky',
        46.7237978,
        -117.020439,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Iota',
        'Louisiana State University',
        'Baton Rouge',
        'LA',
        'United States',
        'Southern',
        30.4062005,
        -91.1854129,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Kappa',
        'Utah State University',
        'Logan',
        'UT',
        'United States',
        'Utah/Nevada',
        41.7526959,
        -111.808733,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Nu',
        'University of South Carolina',
        'Columbia',
        'SC',
        'United States',
        'South Carolina',
        33.9928841,
        -81.0268676,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Omega',
        'University of Connecticut',
        'Storrs Mansfield',
        'CT',
        'United States',
        'Connecticut/Rhode Island',
        41.8111114,
        -72.2483889,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Phi',
        'University of Miami',
        'Coral Gables',
        'FL',
        'United States',
        'South Florida/Everglades',
        25.7172724,
        -80.2787069,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Pi',
        'University of Rochester',
        'Rochester',
        'NY',
        'United States',
        'Northwestern New York',
        43.129864,
        -77.628784,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Sigma',
        'Auburn University',
        'Auburn',
        'AL',
        'United States',
        'Alabama/Gulf Coast',
        32.5919528,
        -85.4959775,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Tau',
        'North Dakota State University',
        'Fargo',
        'ND',
        'United States',
        'North Central',
        46.897155,
        -96.8182654,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Theta',
        'University of Florida',
        'Gainesville',
        'FL',
        'United States',
        'North Florida',
        29.6411884,
        -82.3562296,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Upsilon',
        'Mississippi State University',
        'Mississippi State',
        'MS',
        'United States',
        'Southern',
        33.4386876,
        -88.7943232,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Xi',
        'University of Wyoming',
        'Laramie',
        'WY',
        'United States',
        'Rocky Mountain',
        41.314986,
        -105.5643222,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Gamma Zeta',
        'Union College',
        'Schenectady',
        'NY',
        'United States',
        'Hudson Valley',
        42.8175752,
        -73.9283917,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Epsilon',
        'College of Charleston',
        'Charleston',
        'SC',
        'United States',
        'South Carolina',
        32.7836311,
        -79.9380666,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Eta',
        'Western Connecticut State University',
        'Danbury',
        'CT',
        'United States',
        'Hudson Valley',
        41.4004954,
        -73.445022,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Gamma',
        'Jacksonville University',
        'Jacksonville',
        'FL',
        'United States',
        'North Florida',
        30.3537227,
        -81.6073061,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Iota',
        'University of Alabama',
        'Tuscaloosa',
        'AL',
        'United States',
        'Alabama Northern',
        33.2120822,
        -87.5396735,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Lambda',
        'University of Louisville',
        'Louisville',
        'KY',
        'United States',
        'Central Kentucky',
        38.2133223,
        -85.7577075,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Mu',
        'Wilfrid Laurier University',
        'Waterloo',
        'ON',
        'Canada',
        'Ontario',
        43.4727989,
        -80.5280863,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Nu',
        'Furman University',
        'Greenville',
        'SC',
        'United States',
        'South Carolina',
        34.9257744,
        -82.4385258,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Omega',
        'Loyola Marymount University',
        'Los Angeles',
        'CA',
        'United States',
        'Southern California',
        33.9687824,
        -118.4182021,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Omicron',
        'Western Illinois University',
        'Macomb',
        'IL',
        'United States',
        'Mid-Central',
        40.4771468,
        -90.6862024,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Phi',
        'University of North Texas',
        'Denton',
        'TX',
        'United States',
        'Northern Texas',
        33.2098926,
        -97.1514762,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Pi',
        'Marquette University',
        'Milwaukee',
        'WI',
        'United States',
        'Wisconsin',
        43.0374344,
        -87.9294774,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Sigma',
        'Valparaiso University',
        'Valparaiso',
        'IN',
        'United States',
        'Chicagoland',
        41.4629628,
        -87.044689,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Tau',
        'University of St. Thomas',
        'Saint Paul',
        'MN',
        'United States',
        'North Central',
        44.9421059,
        -93.1894522,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Upsilon',
        'Boston University',
        'Boston',
        'MA',
        'United States',
        'Boston Harbor',
        42.3504215,
        -71.1032247,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Xi',
        'George Mason University',
        'Fairfax',
        'VA',
        'United States',
        'Eastern',
        38.8313333,
        -77.3079884,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Iota Zeta',
        'Clarkson University',
        'Potsdam',
        'NY',
        'United States',
        'Saint Lawrence',
        44.6595887,
        -75.0062397,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa',
        'Bucknell University',
        'Lewisburg',
        'PA',
        'United States',
        'Central Pennsylvania',
        40.9588852,
        -76.8819128,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Beta',
        'University of North Florida',
        'jacksonville',
        'FL',
        'United States',
        'North Florida',
        30.2689865,
        -81.5096561,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Chi',
        'Villanova University',
        'Villanova',
        'PA',
        'United States',
        'Mid Atlantic',
        40.0367774,
        -75.3420233,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Epsilon',
        'University of Delaware',
        'Newark',
        'DE',
        'United States',
        'Mid Atlantic',
        39.6803338,
        -75.7530749,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Eta',
        'Harvard University',
        'Cambridge',
        'MA',
        'United States',
        'Boston Harbor',
        42.3657432,
        -71.1222139,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Gamma',
        'Western Carolina University',
        'Cullowhee',
        'NC',
        'United States',
        'Western North Carolina',
        35.3100146,
        -83.1990402,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Iota',
        'Southern Utah University',
        'Cedar City',
        'UT',
        'United States',
        'Utah/Nevada',
        37.6748541,
        -113.0731048,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Kappa',
        'University of Illinois',
        'Champaign',
        'IL',
        'United States',
        'Central Illinois',
        40.0761545,
        -88.2233134,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Mu',
        'University of Windsor',
        'Windsor',
        'ON',
        'Canada',
        'East Michigan',
        42.3052014,
        -83.0664914,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Omicron',
        'Pepperdine University',
        'Malibu',
        'CA',
        'United States',
        'Los Angeles Coastal',
        34.0430103,
        -118.7093459,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Phi',
        'Embry-Riddle Aeronautical University-Prescott',
        'Prescott',
        'AZ',
        'United States',
        'Grand Canyon',
        34.6483681,
        -112.4204169,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Pi',
        'Towson University',
        'Towson',
        'MD',
        'United States',
        'Eastern',
        39.3869768,
        -76.6185804,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Psi',
        'University of Tennessee-Martin',
        'Martin',
        'TN',
        'United States',
        'Mississippi River',
        36.3414523,
        -88.8642273,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Rho',
        'American University',
        'Washington',
        'DC',
        'United States',
        'Eastern',
        38.9377511,
        -77.0894676,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Sigma',
        'University of the Pacific',
        'Stockton',
        'CA',
        'United States',
        'California Central Valley',
        37.9804237,
        -121.3128472,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Tau',
        'Minnesota State University-Mankato',
        'Mankato',
        'MN',
        'United States',
        'North Central',
        44.1453537,
        -93.9977525,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Theta',
        'California State University-Chico',
        'Chico',
        'CA',
        'United States',
        'California Central Valley',
        39.7295014,
        -121.8481099,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Xi',
        'Tarleton State University',
        'Stephenville',
        'TX',
        'United States',
        'Central Texas',
        32.214673,
        -98.2196882,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Kappa Zeta',
        'Radford University',
        'Radford',
        'VA',
        'United States',
        'Western Virginia',
        37.1370242,
        -80.5499612,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda',
        'Indiana University',
        'Bloomington',
        'IN',
        'United States',
        'Central Indiana',
        39.1802358,
        -86.5093526,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Alpha',
        'Knox College',
        'Galesburg',
        'IL',
        'United States',
        'Mid-Central',
        40.9419283,
        -90.3722583,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Chi',
        'University of Wisconsin-Milwaukee',
        'Milwaukee',
        'WI',
        'United States',
        'Wisconsin',
        43.077639,
        -87.8819425,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Delta',
        'University of California-Merced',
        'Merced',
        'CA',
        'United States',
        'California Central Valley',
        37.365182,
        -120.4225275,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Epsilon',
        'University of New Haven',
        'West Haven',
        'CT',
        'United States',
        'Connecticut/Rhode Island',
        41.2909137,
        -72.9626388,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Eta',
        'Bryant University',
        'Smithfield',
        'RI',
        'United States',
        'Connecticut/Rhode Island',
        41.9220914,
        -71.5371517,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Gamma',
        'Santa Clara University',
        'Santa Clara',
        'CA',
        'United States',
        'California Bay Area',
        37.3486243,
        -121.936544,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Iota',
        'Florida International University',
        'Miami',
        'FL',
        'United States',
        'South Florida/Everglades',
        25.7553898,
        -80.3762833,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Kappa',
        'Rochester Institute of Technology',
        'Rochester',
        'NY',
        'United States',
        'Northwestern New York',
        43.0826701,
        -77.6729322,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Lambda',
        'University of Kentucky',
        'Lexington',
        'KY',
        'United States',
        'Central Kentucky',
        38.0266291,
        -84.5047222,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Mu',
        'Valdosta State University',
        'Valdosta',
        'GA',
        'United States',
        'North Florida',
        30.8472323,
        -83.2889807,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Nu',
        'Loyola University-Chicago',
        'Chicago',
        'IL',
        'United States',
        'Chicagoland',
        41.9991492,
        -87.6573704,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Omega',
        'DePaul University',
        'Chicago',
        'IL',
        'United States',
        'Chicagoland',
        41.9245803,
        -87.6507223,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Omicron',
        'Southern Illinois University-Carbondale',
        'Carbondale',
        'IL',
        'United States',
        'Mississippi River',
        37.7083423,
        -89.2275556,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Phi',
        'University of West Georgia',
        'Carrollton',
        'GA',
        'United States',
        'North Georgia',
        33.5750493,
        -85.103361,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Pi',
        'Carnegie Mellon University',
        'Pittsburgh',
        'PA',
        'United States',
        'West Virginia/West Pennsylvania',
        40.4441897,
        -79.9427192,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Psi',
        'University of Louisiana-Lafayette',
        'Lafayette',
        'LA',
        'United States',
        'Southern',
        30.2117256,
        -92.0195772,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Sigma',
        'University of New Hampshire',
        'Durham',
        'NH',
        'United States',
        'North Atlantic',
        43.1350987,
        -70.9462079,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Theta',
        'University of Ottawa',
        'Ottawa',
        'ON',
        'Canada',
        'Saint Lawrence',
        45.422527,
        -75.6833904,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Upsilon',
        'Bentley University',
        'Waltham',
        'MA',
        'United States',
        'Boston Harbor',
        42.3834189,
        -71.2225864,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Xi',
        'Boise State University',
        'Boise',
        'ID',
        'United States',
        'The Big Sky',
        43.6032821,
        -116.19941,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Lambda Zeta',
        'Florida Gulf Coast University',
        'Fort Myers',
        'FL',
        'United States',
        'South Florida/Everglades',
        26.4636477,
        -81.7747246,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu',
        'Denison University',
        'Granville',
        'OH',
        'United States',
        'Southern Ohio',
        40.0730051,
        -82.5224859,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu Alpha',
        'University of North Carolina-Charlotte',
        'Charlotte',
        'NC',
        'United States',
        'Western North Carolina',
        35.3064945,
        -80.7349705,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu Beta',
        'California State University-San Marcos',
        'San Marcos',
        'CA',
        'United States',
        'Southern California',
        33.1295667,
        -117.1606492,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu Epsilon',
        'University of Massachusetts-Amherst',
        'Amherst',
        'MA',
        'United States',
        'North Atlantic',
        42.3875741,
        -72.5299209,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu Eta',
        'West Chester University of Pennsylvania',
        'West Chester',
        'PA',
        'United States',
        'Mid Atlantic',
        39.9519084,
        -75.5972947,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu Gamma',
        'Binghamton University',
        'Binghamton',
        'NY',
        'United States',
        'Northwestern New York',
        42.0877998,
        -75.9706607,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu Iota',
        'University of Texas-San Antonio',
        'San Antonio',
        'TX',
        'United States',
        'Central Texas',
        29.583331,
        -98.6194451,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu Kappa',
        'University of North Carolina-Wilmington',
        'Wilmington',
        'NC',
        'United States',
        'Eastern North Carolina',
        34.2249827,
        -77.8690774,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu Lambda',
        'Sacred Heart University',
        'Fairfield',
        'CT',
        'United States',
        'Connecticut/Rhode Island',
        41.2225974,
        -73.2444673,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu Mu',
        'West Virginia University',
        'Morgantown',
        'WV',
        'United States',
        'West Virginia/West Pennsylvania',
        39.6348397,
        -79.9542095,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Mu Theta',
        'Georgetown University',
        'Washington',
        'DC',
        'United States',
        'Eastern',
        38.9089393,
        -77.0745796,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Nu',
        'Cumberland University',
        'Lebanon',
        'TN',
        'United States',
        'Mid-South',
        36.2046352,
        -86.2997137,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Nu Nu',
        'Columbia University',
        'New York',
        'NY',
        'United States',
        'Hudson Valley',
        40.8077559,
        -73.9616141,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Omega Omega',
        'University of Arkansas',
        'Fayetteville',
        'AR',
        'United States',
        'Oklahoma/Arkansas',
        36.0970389,
        -94.1703322,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Omicron Omicron',
        'University of Chicago',
        'Chicago',
        'IL',
        'United States',
        'Chicagoland',
        41.7913969,
        -87.6008439,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Phi Phi',
        'University of Pennsylvania',
        'Philadelphia',
        'PA',
        'United States',
        'Mid Atlantic',
        39.9503945,
        -75.1946713,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Psi',
        'University of Virginia',
        'Charlottesville',
        'VA',
        'United States',
        'Eastern Virginia',
        38.0324342,
        -78.4990607,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Psi Psi',
        'Syracuse University',
        'Syracuse',
        'NY',
        'United States',
        'Northwestern New York',
        43.0171129,
        -76.1185536,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Rho',
        'Butler University',
        'Indianapolis',
        'IN',
        'United States',
        'Central Indiana',
        39.8407191,
        -86.1737494,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Rho Rho',
        'University of Maine',
        'Orono',
        'ME',
        'United States',
        'North Atlantic',
        44.9015188,
        -68.6617222,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Sigma',
        'Princeton University',
        'Princeton',
        'NJ',
        'United States',
        'Central Pennsylvania',
        40.3386752,
        -74.6583655,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Sigma Sigma',
        'Hampden-Sydney College',
        'Hampden Sydney',
        'VA',
        'United States',
        'Eastern Virginia',
        37.2423749,
        -78.4605692,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Tau',
        'Roanoke College',
        'Salem',
        'VA',
        'United States',
        'Western Virginia',
        37.2977875,
        -80.0549996,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta',
        'Gettysburg College',
        'Gettysburg',
        'PA',
        'United States',
        'Central Pennsylvania',
        39.8374688,
        -77.2396405,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Beta',
        'University of South Florida',
        'Tampa',
        'FL',
        'United States',
        'Central Florida',
        28.0599999,
        -82.4138362,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Chi',
        'Arkansas State University',
        'State University',
        'AR',
        'United States',
        'Oklahoma/Arkansas',
        35.8369546,
        -90.6693414,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Epsilon',
        'University of North Georgia',
        'Dahlonega',
        'GA',
        'United States',
        'North Georgia',
        34.527878,
        -83.9844784,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Gamma',
        'Drake University',
        'Des Moines',
        'IA',
        'United States',
        'Mid-Central',
        41.6030742,
        -93.6552753,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Iota',
        'Saint Louis University',
        'Saint Louis',
        'MO',
        'United States',
        'Missouri',
        38.635359,
        -90.231845,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Mu',
        'Spring Hill College',
        'Mobile',
        'AL',
        'United States',
        'Alabama/Gulf Coast',
        30.6920656,
        -88.135704,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Nu',
        'Alma College',
        'Alma',
        'MI',
        'United States',
        'East Michigan',
        43.381474,
        -84.671349,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Omega',
        'Elon University',
        'Elon',
        'NC',
        'United States',
        'Eastern North Carolina',
        36.1063398,
        -79.5027368,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Omicron',
        'University of California-Davis',
        'Davis',
        'CA',
        'United States',
        'California Central Valley',
        38.5337904,
        -121.7907544,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Psi',
        'University of Waterloo',
        'Waterloo',
        'ON',
        'Canada',
        'Ontario',
        43.4701994,
        -80.5452429,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Rho',
        'Illinois State University',
        'Normal',
        'IL',
        'United States',
        'Central Illinois',
        40.5179938,
        -89.0084607,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Sigma',
        'California State Polytechnic University-Pomona',
        'Pomona',
        'CA',
        'United States',
        'Southern California',
        34.0556686,
        -117.8239282,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Tau',
        'Texas State University-San Marcos',
        'San Marcos',
        'TX',
        'United States',
        'Central Texas',
        29.8910941,
        -97.9376839,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Theta',
        'University of Michigan',
        'Ann Arbor',
        'MI',
        'United States',
        'East Michigan',
        42.2942142,
        -83.7100389,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Upsilon',
        'Yale University',
        'New Haven',
        'CT',
        'United States',
        'Connecticut/Rhode Island',
        41.3135727,
        -72.9231731,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Theta Zeta',
        'Bridgewater State University',
        'Bridgewater',
        'MA',
        'United States',
        'Boston Harbor',
        41.9882958,
        -70.9635926,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Upsilon Upsilon',
        'University of Washington',
        'Seattle',
        'WA',
        'United States',
        'Northwestern',
        47.6554303,
        -122.3001692,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Xi',
        'DePauw University',
        'Greencastle',
        'IN',
        'United States',
        'Central Indiana',
        39.6380494,
        -86.8668737,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta',
        'Washington & Lee University',
        'Lexington',
        'VA',
        'United States',
        'Western Virginia',
        37.7869705,
        -79.4413852,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Eta',
        'Texas A&M University-Commerce',
        'Commerce',
        'TX',
        'United States',
        'Northern Texas',
        33.2399911,
        -95.9182528,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Iota',
        'Pittsburg State University',
        'Pittsburg',
        'KS',
        'United States',
        'Kansas/Nebraska',
        37.3904299,
        -94.6953939,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Lambda',
        'Kent State University',
        'Kent',
        'OH',
        'United States',
        'Northern Ohio',
        41.1442325,
        -81.3398321,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Mu',
        'Western Kentucky University',
        'Bowling Green',
        'KY',
        'United States',
        'Mid-South',
        36.984529,
        -86.457647,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Nu',
        'Western Michigan University',
        'Kalamazoo',
        'MI',
        'United States',
        'West Michigan',
        42.2832928,
        -85.6102611,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Omega',
        'East Tennessee State University',
        'Johnson City',
        'TN',
        'United States',
        'East Tennessee',
        36.3024236,
        -82.3692822,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Omicron',
        'Northern Arizona University',
        'Flagstaff',
        'AZ',
        'United States',
        'Grand Canyon',
        35.1830867,
        -111.654961,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Phi',
        'New Mexico State University',
        'Las Cruces',
        'NM',
        'United States',
        'Southwestern',
        32.2729032,
        -106.7434927,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Pi',
        'Texas A&M University-Kingsville',
        'Kingsville',
        'TX',
        'United States',
        'Central Texas',
        27.5279817,
        -97.8836721,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Psi',
        'University of Cincinnati',
        'Cincinnati',
        'OH',
        'United States',
        'Southern Ohio',
        39.1318991,
        -84.5157575,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Tau',
        'Fort Hays State University',
        'Hays',
        'KS',
        'United States',
        'Kansas/Nebraska',
        38.8706832,
        -99.3442115,
        'active'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO fraternity_data.chapters (
        fraternity_id, chapter_name, university, city, state, country, region,
        latitude, longitude, status
    ) VALUES (
        v_fraternity_id,
        'Zeta Zeta',
        'Centre College',
        'Danville',
        'KY',
        'United States',
        'Central Kentucky',
        37.6444259,
        -84.7809759,
        'active'
    ) ON CONFLICT DO NOTHING;

END $$;
