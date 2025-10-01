import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Sigma Chi chapters across major universities
const sigmaChiChapters = [
  // Big Ten Schools
  {
    university: "Penn State University",
    chapter_name: "Alpha Epsilon Chapter",
    charter_date: "1912-04-28",
    member_count: 145,
    address: "420 E. Prospect Ave, State College, PA 16801",
    city: "State College",
    state: "PA",
    zip_code: "16801",
    instagram_handle: "@psusigmachi",
    engagement_score: 92,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Ohio State University",
    chapter_name: "Theta Theta Chapter",
    charter_date: "1896-05-01",
    member_count: 160,
    address: "1854 Neil Ave, Columbus, OH 43210",
    city: "Columbus",
    state: "OH",
    zip_code: "43210",
    instagram_handle: "@osusigmachi",
    engagement_score: 95,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Michigan",
    chapter_name: "Alpha Delta Chapter",
    charter_date: "1877-10-30",
    member_count: 155,
    address: "1000 Hill St, Ann Arbor, MI 48104",
    city: "Ann Arbor",
    state: "MI",
    zip_code: "48104",
    instagram_handle: "@umsigmachi",
    engagement_score: 94,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Purdue University",
    chapter_name: "Delta Delta Chapter",
    charter_date: "1893-05-22",
    member_count: 140,
    address: "202 Littleton St, West Lafayette, IN 47906",
    city: "West Lafayette",
    state: "IN",
    zip_code: "47906",
    instagram_handle: "@purduesigmachi",
    engagement_score: 89,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Illinois Urbana-Champaign",
    chapter_name: "Alpha Beta Chapter",
    charter_date: "1883-05-12",
    member_count: 135,
    address: "211 E. Armory Ave, Champaign, IL 61820",
    city: "Champaign",
    state: "IL",
    zip_code: "61820",
    instagram_handle: "@uiucsigmachi",
    engagement_score: 90,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Wisconsin-Madison",
    chapter_name: "Alpha Chi Chapter",
    charter_date: "1882-03-31",
    member_count: 142,
    address: "222 Langdon St, Madison, WI 53703",
    city: "Madison",
    state: "WI",
    zip_code: "53703",
    instagram_handle: "@uwsigmachi",
    engagement_score: 91,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Indiana University",
    chapter_name: "Rho Rho Chapter",
    charter_date: "1920-02-14",
    member_count: 138,
    address: "1000 N. Jordan Ave, Bloomington, IN 47406",
    city: "Bloomington",
    state: "IN",
    zip_code: "47406",
    instagram_handle: "@iusigmachi",
    engagement_score: 88,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "University of Minnesota",
    chapter_name: "Alpha Phi Chapter",
    charter_date: "1888-02-18",
    member_count: 130,
    address: "1617 University Ave SE, Minneapolis, MN 55414",
    city: "Minneapolis",
    state: "MN",
    zip_code: "55414",
    instagram_handle: "@umnsigmachi",
    engagement_score: 87,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "University of Iowa",
    chapter_name: "Alpha Kappa Chapter",
    charter_date: "1884-05-03",
    member_count: 125,
    address: "724 N. Dubuque St, Iowa City, IA 52245",
    city: "Iowa City",
    state: "IA",
    zip_code: "52245",
    instagram_handle: "@uiowasigmachi",
    engagement_score: 86,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "Michigan State University",
    chapter_name: "Omicron Omicron Chapter",
    charter_date: "1925-04-18",
    member_count: 128,
    address: "522 M.A.C. Ave, East Lansing, MI 48823",
    city: "East Lansing",
    state: "MI",
    zip_code: "48823",
    instagram_handle: "@msusigmachi",
    engagement_score: 85,
    partnership_openness: 1,
    event_frequency: 2
  },

  // SEC Schools
  {
    university: "University of Alabama",
    chapter_name: "Zeta Zeta Chapter",
    charter_date: "1911-04-15",
    member_count: 175,
    address: "911 Colonial Dr, Tuscaloosa, AL 35401",
    city: "Tuscaloosa",
    state: "AL",
    zip_code: "35401",
    instagram_handle: "@bamasigmachi",
    engagement_score: 96,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Georgia",
    chapter_name: "Zeta Chapter",
    charter_date: "1882-02-18",
    member_count: 165,
    address: "530 S. Milledge Ave, Athens, GA 30605",
    city: "Athens",
    state: "GA",
    zip_code: "30605",
    instagram_handle: "@ugasigmachi",
    engagement_score: 93,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Florida",
    chapter_name: "Sigma Phi Chapter",
    charter_date: "1927-05-14",
    member_count: 158,
    address: "1315 W. University Ave, Gainesville, FL 32603",
    city: "Gainesville",
    state: "FL",
    zip_code: "32603",
    instagram_handle: "@ufsigmachi",
    engagement_score: 92,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Louisiana State University",
    chapter_name: "Alpha Omega Chapter",
    charter_date: "1891-05-09",
    member_count: 152,
    address: "143 Greek Row, Baton Rouge, LA 70803",
    city: "Baton Rouge",
    state: "LA",
    zip_code: "70803",
    instagram_handle: "@lsusigmachi",
    engagement_score: 90,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Tennessee",
    chapter_name: "Kappa Kappa Chapter",
    charter_date: "1900-10-20",
    member_count: 148,
    address: "1817 Fraternity Park Dr, Knoxville, TN 37916",
    city: "Knoxville",
    state: "TN",
    zip_code: "37916",
    instagram_handle: "@utksigmachi",
    engagement_score: 89,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Auburn University",
    chapter_name: "Iota Iota Chapter",
    charter_date: "1913-05-17",
    member_count: 145,
    address: "217 S. Gay St, Auburn, AL 36832",
    city: "Auburn",
    state: "AL",
    zip_code: "36832",
    instagram_handle: "@auburnsigmachi",
    engagement_score: 88,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Kentucky",
    chapter_name: "Beta Chi Chapter",
    charter_date: "1903-06-11",
    member_count: 140,
    address: "345 N. Limestone, Lexington, KY 40508",
    city: "Lexington",
    state: "KY",
    zip_code: "40508",
    instagram_handle: "@uksigmachi",
    engagement_score: 87,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "University of South Carolina",
    chapter_name: "Gamma Chapter",
    charter_date: "1879-01-11",
    member_count: 142,
    address: "1200 Whaley St, Columbia, SC 29201",
    city: "Columbia",
    state: "SC",
    zip_code: "29201",
    instagram_handle: "@uscsigmachi",
    engagement_score: 88,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Mississippi",
    chapter_name: "Epsilon Epsilon Chapter",
    charter_date: "1908-05-02",
    member_count: 155,
    address: "100 Fraternity Row, Oxford, MS 38655",
    city: "Oxford",
    state: "MS",
    zip_code: "38655",
    instagram_handle: "@olemisssigmachi",
    engagement_score: 91,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Arkansas",
    chapter_name: "Pi Pi Chapter",
    charter_date: "1920-04-24",
    member_count: 135,
    address: "700 N. Razorback Rd, Fayetteville, AR 72701",
    city: "Fayetteville",
    state: "AR",
    zip_code: "72701",
    instagram_handle: "@uarksigmachi",
    engagement_score: 85,
    partnership_openness: 1,
    event_frequency: 2
  },

  // ACC Schools
  {
    university: "University of North Carolina at Chapel Hill",
    chapter_name: "Xi Xi Chapter",
    charter_date: "1914-05-30",
    member_count: 150,
    address: "104 Fraternity Ct, Chapel Hill, NC 27514",
    city: "Chapel Hill",
    state: "NC",
    zip_code: "27514",
    instagram_handle: "@uncsigmachi",
    engagement_score: 91,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Duke University",
    chapter_name: "Theta Zeta Chapter",
    charter_date: "1930-05-17",
    member_count: 130,
    address: "1111 Campus Dr, Durham, NC 27708",
    city: "Durham",
    state: "NC",
    zip_code: "27708",
    instagram_handle: "@dukesigmachi",
    engagement_score: 89,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Virginia",
    chapter_name: "Eta Eta Chapter",
    charter_date: "1911-06-06",
    member_count: 145,
    address: "100 Chancellors Way, Charlottesville, VA 22903",
    city: "Charlottesville",
    state: "VA",
    zip_code: "22903",
    instagram_handle: "@uvasigmachi",
    engagement_score: 90,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Miami",
    chapter_name: "Tau Tau Chapter",
    charter_date: "1933-04-22",
    member_count: 138,
    address: "1400 Campo Sano Ave, Coral Gables, FL 33146",
    city: "Coral Gables",
    state: "FL",
    zip_code: "33146",
    instagram_handle: "@umiamisigmachi",
    engagement_score: 88,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Florida State University",
    chapter_name: "Delta Theta Chapter",
    charter_date: "1953-05-09",
    member_count: 152,
    address: "1215 W. Jefferson St, Tallahassee, FL 32304",
    city: "Tallahassee",
    state: "FL",
    zip_code: "32304",
    instagram_handle: "@fsusigmachi",
    engagement_score: 89,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Clemson University",
    chapter_name: "Zeta Psi Chapter",
    charter_date: "1933-05-06",
    member_count: 140,
    address: "101 Old Greenville Hwy, Clemson, SC 29631",
    city: "Clemson",
    state: "SC",
    zip_code: "29631",
    instagram_handle: "@clemsonsigmachi",
    engagement_score: 87,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Virginia Tech",
    chapter_name: "Kappa Sigma Chapter",
    charter_date: "1923-04-21",
    member_count: 135,
    address: "404 Turner St NW, Blacksburg, VA 24060",
    city: "Blacksburg",
    state: "VA",
    zip_code: "24060",
    instagram_handle: "@vtechsigmachi",
    engagement_score: 86,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "North Carolina State University",
    chapter_name: "Beta Omega Chapter",
    charter_date: "1923-05-12",
    member_count: 128,
    address: "2512 Clark Ave, Raleigh, NC 27607",
    city: "Raleigh",
    state: "NC",
    zip_code: "27607",
    instagram_handle: "@ncsusigmachi",
    engagement_score: 85,
    partnership_openness: 1,
    event_frequency: 2
  },

  // Pac-12 Schools
  {
    university: "University of Southern California",
    chapter_name: "Beta Xi Chapter",
    charter_date: "1902-05-17",
    member_count: 150,
    address: "649 W. 28th St, Los Angeles, CA 90007",
    city: "Los Angeles",
    state: "CA",
    zip_code: "90007",
    instagram_handle: "@uscsigmachi",
    engagement_score: 92,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of California, Los Angeles",
    chapter_name: "Beta Upsilon Chapter",
    charter_date: "1925-05-09",
    member_count: 145,
    address: "626 Landfair Ave, Los Angeles, CA 90024",
    city: "Los Angeles",
    state: "CA",
    zip_code: "90024",
    instagram_handle: "@uclasigmachi",
    engagement_score: 90,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Washington",
    chapter_name: "Beta Beta Chapter",
    charter_date: "1897-05-08",
    member_count: 140,
    address: "2111 NE 47th St, Seattle, WA 98105",
    city: "Seattle",
    state: "WA",
    zip_code: "98105",
    instagram_handle: "@uwsigmachi",
    engagement_score: 88,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Colorado Boulder",
    chapter_name: "Zeta Xi Chapter",
    charter_date: "1916-05-13",
    member_count: 135,
    address: "1111 University Ave, Boulder, CO 80302",
    city: "Boulder",
    state: "CO",
    zip_code: "80302",
    instagram_handle: "@cubuffssigmachi",
    engagement_score: 87,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "University of Arizona",
    chapter_name: "Phi Phi Chapter",
    charter_date: "1921-05-14",
    member_count: 132,
    address: "1525 E. Drachman St, Tucson, AZ 85719",
    city: "Tucson",
    state: "AZ",
    zip_code: "85719",
    instagram_handle: "@uarizonasigmachi",
    engagement_score: 86,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "Arizona State University",
    chapter_name: "Delta Xi Chapter",
    charter_date: "1948-04-24",
    member_count: 138,
    address: "1001 S. McAllister Ave, Tempe, AZ 85281",
    city: "Tempe",
    state: "AZ",
    zip_code: "85281",
    instagram_handle: "@asusigmachi",
    engagement_score: 87,
    partnership_openness: 1,
    event_frequency: 4
  },

  // Additional Major Universities
  {
    university: "Texas A&M University",
    chapter_name: "Epsilon Zeta Chapter",
    charter_date: "1929-04-20",
    member_count: 155,
    address: "201 Fraternity Row, College Station, TX 77840",
    city: "College Station",
    state: "TX",
    zip_code: "77840",
    instagram_handle: "@tamusicmachi",
    engagement_score: 90,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Texas at Austin",
    chapter_name: "Theta Nu Chapter",
    charter_date: "1927-05-07",
    member_count: 148,
    address: "2700 San Jacinto Blvd, Austin, TX 78705",
    city: "Austin",
    state: "TX",
    zip_code: "78705",
    instagram_handle: "@utsigmachi",
    engagement_score: 91,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Oklahoma",
    chapter_name: "Rho Chapter",
    charter_date: "1904-12-03",
    member_count: 142,
    address: "1000 College Ave, Norman, OK 73069",
    city: "Norman",
    state: "OK",
    zip_code: "73069",
    instagram_handle: "@ousigmachi",
    engagement_score: 88,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "University of Kansas",
    chapter_name: "Beta Alpha Chapter",
    charter_date: "1903-05-16",
    member_count: 130,
    address: "1206 W. Campus Rd, Lawrence, KS 66045",
    city: "Lawrence",
    state: "KS",
    zip_code: "66045",
    instagram_handle: "@kusigmachi",
    engagement_score: 86,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "University of Nebraska-Lincoln",
    chapter_name: "Zeta Chapter",
    charter_date: "1887-06-04",
    member_count: 125,
    address: "1510 Vine St, Lincoln, NE 68588",
    city: "Lincoln",
    state: "NE",
    zip_code: "68588",
    instagram_handle: "@unlsigmachi",
    engagement_score: 84,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "Miami University",
    chapter_name: "Alpha Alpha Chapter",
    charter_date: "1855-06-28",
    member_count: 142,
    address: "214 Spring St, Oxford, OH 45056",
    city: "Oxford",
    state: "OH",
    zip_code: "45056",
    instagram_handle: "@miamiu sigmachi",
    engagement_score: 93,
    partnership_openness: 1,
    event_frequency: 4,
    notes: "Founding chapter of Sigma Chi"
  },
  {
    university: "Case Western Reserve University",
    chapter_name: "Nu Chapter",
    charter_date: "1867-10-19",
    member_count: 85,
    address: "2239 Murray Hill Rd, Cleveland, OH 44106",
    city: "Cleveland",
    state: "OH",
    zip_code: "44106",
    instagram_handle: "@cwrusigmachi",
    engagement_score: 82,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "Washington University in St. Louis",
    chapter_name: "Alpha Nu Chapter",
    charter_date: "1890-05-31",
    member_count: 95,
    address: "6510 Forsyth Blvd, St. Louis, MO 63105",
    city: "St. Louis",
    state: "MO",
    zip_code: "63105",
    instagram_handle: "@wustlsigmachi",
    engagement_score: 85,
    partnership_openness: 1,
    event_frequency: 2
  },
  {
    university: "Northwestern University",
    chapter_name: "Rho Rho Chapter",
    charter_date: "1883-05-15",
    member_count: 110,
    address: "2349 Sheridan Rd, Evanston, IL 60208",
    city: "Evanston",
    state: "IL",
    zip_code: "60208",
    instagram_handle: "@nusigmachi",
    engagement_score: 88,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Vanderbilt University",
    chapter_name: "Alpha Theta Chapter",
    charter_date: "1886-06-05",
    member_count: 105,
    address: "2411 Kensington Pl, Nashville, TN 37212",
    city: "Nashville",
    state: "TN",
    zip_code: "37212",
    instagram_handle: "@vandysigmachi",
    engagement_score: 89,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Syracuse University",
    chapter_name: "Theta Chapter",
    charter_date: "1871-02-18",
    member_count: 118,
    address: "201 Walnut Pl, Syracuse, NY 13210",
    city: "Syracuse",
    state: "NY",
    zip_code: "13210",
    instagram_handle: "@susigmachi",
    engagement_score: 86,
    partnership_openness: 1,
    event_frequency: 4
  },
  {
    university: "Boston University",
    chapter_name: "Theta Mu Chapter",
    charter_date: "1931-05-30",
    member_count: 92,
    address: "19 Bay State Rd, Boston, MA 02215",
    city: "Boston",
    state: "MA",
    zip_code: "02215",
    instagram_handle: "@busigmachi",
    engagement_score: 84,
    partnership_openness: 1,
    event_frequency: 2
  }
];

async function populateSigmaChiChapters() {
  console.log('🏛️  Starting Sigma Chi chapter population...\n');

  // 1. Check if Sigma Chi exists in greek_organizations
  console.log('1️⃣  Checking for Sigma Chi in greek_organizations...');
  let { data: sigmaChiOrg, error: fetchError } = await supabase
    .from('greek_organizations')
    .select('id')
    .eq('name', 'Sigma Chi')
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking for Sigma Chi:', fetchError);
    return;
  }

  let sigmaChiId: string;

  if (!sigmaChiOrg) {
    console.log('   Sigma Chi not found, creating...');
    const { data: newOrg, error: insertError } = await supabase
      .from('greek_organizations')
      .insert({
        name: 'Sigma Chi',
        greek_letters: 'ΣΧ',
        organization_type: 'fraternity',
        founded_date: '1855-06-28',
        headquarters_location: 'Indianapolis, IN',
        national_website: 'https://sigmachi.org',
        description: 'Sigma Chi is a leadership and scholarship organization with over 330 chapters and colonies. Founded on June 28, 1855, at Miami University in Oxford, Ohio, Sigma Chi promotes Friendship, Justice, and Learning.',
        member_count: 360000,
        logo_url: 'https://sigmachi.org/wp-content/uploads/2021/01/SC-Logo-Gold-White.png'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating Sigma Chi:', insertError);
      return;
    }

    sigmaChiId = newOrg.id;
    console.log(`   ✅ Created Sigma Chi organization (ID: ${sigmaChiId})\n`);
  } else {
    sigmaChiId = sigmaChiOrg.id;
    console.log(`   ✅ Found existing Sigma Chi (ID: ${sigmaChiId})\n`);
  }

  // 2. Process each university and chapter
  console.log(`2️⃣  Processing ${sigmaChiChapters.length} Sigma Chi chapters...\n`);
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const chapterData of sigmaChiChapters) {
    try {
      // Find or create university
      let { data: university, error: uniError } = await supabase
        .from('universities')
        .select('id')
        .eq('name', chapterData.university)
        .single();

      if (uniError && uniError.code !== 'PGRST116') {
        console.error(`   ❌ Error checking university ${chapterData.university}:`, uniError);
        errorCount++;
        continue;
      }

      let universityId: string;

      if (!university) {
        console.log(`   📚 Creating university: ${chapterData.university}`);
        const { data: newUni, error: createUniError } = await supabase
          .from('universities')
          .insert({
            name: chapterData.university,
            location: `${chapterData.city}, ${chapterData.state}`,
            state: chapterData.state,
            student_count: 0  // Placeholder
          })
          .select()
          .single();

        if (createUniError) {
          console.error(`   ❌ Error creating university ${chapterData.university}:`, createUniError);
          errorCount++;
          continue;
        }

        universityId = newUni.id;
      } else {
        universityId = university.id;
      }

      // Check if chapter already exists
      const { data: existingChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('greek_organization_id', sigmaChiId)
        .eq('university_id', universityId)
        .single();

      if (existingChapter) {
        console.log(`   ⏭️  Chapter already exists at ${chapterData.university}`);
        skipCount++;
        continue;
      }

      // Create chapter
      const { error: chapterError } = await supabase
        .from('chapters')
        .insert({
          greek_organization_id: sigmaChiId,
          university_id: universityId,
          chapter_name: chapterData.chapter_name,
          charter_date: chapterData.charter_date,
          member_count: chapterData.member_count,
          house_address: chapterData.address,
          instagram_handle: chapterData.instagram_handle,
          engagement_score: chapterData.engagement_score,
          event_frequency: chapterData.event_frequency,
          status: 'active'
        });

      if (chapterError) {
        console.error(`   ❌ Error creating chapter at ${chapterData.university}:`, chapterError);
        errorCount++;
        continue;
      }

      console.log(`   ✅ Created ${chapterData.chapter_name} at ${chapterData.university}`);
      successCount++;

    } catch (error) {
      console.error(`   ❌ Unexpected error for ${chapterData.university}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Successfully created: ${successCount}`);
  console.log(`   ⏭️  Skipped (already exist): ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`\n🎉 Sigma Chi chapter population complete!`);
}

// Run the script
populateSigmaChiChapters()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
