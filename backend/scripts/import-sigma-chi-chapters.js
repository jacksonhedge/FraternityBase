import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// CSV data for all 234 Sigma Chi chapters
const csvData = `Chapter_Type,Greek_Letter_Name,College_University,City,State_Province,Country,Fraternity_Province
Undergraduate,Alpha,Miami University,Oxford,OH,United States,Southern Ohio
Undergraduate,Alpha Alpha,Hobart College,Geneva,NY,United States,Northwestern New York
Undergraduate,Alpha Beta,University of California-Berkeley,Berkeley,CA,United States,California Bay Area
Undergraduate,Alpha Chi,Trinity College,Hartford,CT,United States,Connecticut/Rhode Island
Undergraduate,Alpha Delta,California Institute of Technology,Pasadena,CA,United States,California Bay Area
Undergraduate,Alpha Epsilon,University of Southern California,Los Angeles,CA,United States,Southern California
Undergraduate,Alpha Eta,Missouri University of Science & Technology,Rolla,MO,United States,Missouri
Undergraduate,Alpha Gamma,Ohio State University,Columbus,OH,United States,Ohio
Undergraduate,Alpha Iota,Illinois Institute of Technology,Chicago,IL,United States,Chicagoland
Undergraduate,Alpha Omicron,Tulane University,New Orleans,LA,United States,Southern
Undergraduate,Alpha Phi,Cornell University,Ithaca,NY,United States,Northwestern New York
Undergraduate,Alpha Pi,University of Wisconsin-Madison,Madison,WI,United States,Wisconsin
Undergraduate,Alpha Psi,Vanderbilt University,Nashville,TN,United States,Middle Tennessee
Undergraduate,Alpha Rho,Lehigh University,Bethlehem,PA,United States,Central Pennsylvania
Undergraduate,Alpha Sigma,University of Minnesota-Twin Cities,Minneapolis,MN,United States,North Central
Undergraduate,Alpha Tau,University of Utah,Salt Lake City,UT,United States,Utah/Nevada
Undergraduate,Alpha Theta,Massachusetts Institute of Technology,Cambridge,MA,United States,Boston Harbor
Undergraduate,Alpha Upsilon,New York University,New York,NY,United States,Eastern
Undergraduate,Alpha Xi,University of Nebraska-Lincoln,Lincoln,NE,United States,Kansas/Nebraska
Undergraduate,Alpha Zeta,Beloit College,Beloit,WI,United States,Wisconsin
Undergraduate,Beta,University of Wooster,Wooster,OH,United States,Northern Ohio
Undergraduate,Beta Beta,DePaul University,Chicago,IL,United States,Chicagoland
Undergraduate,Beta Chi,Oregon State University,Corvallis,OR,United States,Northwestern
Undergraduate,Beta Delta,Purdue University,West Lafayette,IN,United States,Northern Indiana
Undergraduate,Beta Epsilon,University of Oklahoma,Norman,OK,United States,Oklahoma/Arkansas
Undergraduate,Beta Eta,University of Alabama,Tuscaloosa,AL,United States,Alabama/Gulf Coast
Undergraduate,Beta Gamma,Colorado State University,Fort Collins,CO,United States,Colorado/Wyoming
Undergraduate,Beta Iota,Gonzaga University,Spokane,WA,United States,Northwestern
Undergraduate,Beta Kappa,Missouri Valley College,Marshall,MO,United States,Missouri
Undergraduate,Beta Lambda,San Diego State University,San Diego,CA,United States,Southern California
Undergraduate,Beta Mu,University of Iowa,Iowa City,IA,United States,Mid-Central
Undergraduate,Beta Nu,Ohio University,Athens,OH,United States,Southern Ohio
Undergraduate,Beta Omega,North Carolina State University,Raleigh,NC,United States,Eastern North Carolina
Undergraduate,Beta Phi,University of Pittsburgh,Pittsburgh,PA,United States,West Virginia/West Pennsylvania
Undergraduate,Beta Pi,University of Pennsylvania,Philadelphia,PA,United States,Mid Atlantic
Undergraduate,Beta Psi,Wabash College,Crawfordsville,IN,United States,Central Indiana
Undergraduate,Beta Rho,Louisiana State University,Baton Rouge,LA,United States,Southern
Undergraduate,Beta Sigma,Washington University,Saint Louis,MO,United States,Missouri
Undergraduate,Beta Tau,North Carolina State University,Raleigh,NC,United States,Eastern North Carolina
Undergraduate,Beta Theta,University of Alabama,Tuscaloosa,AL,United States,Alabama/Gulf Coast
Undergraduate,Beta Upsilon,Bowling Green State University,Bowling Green,OH,United States,Northern Ohio
Undergraduate,Beta Xi,Case Western Reserve University,Cleveland,OH,United States,Northern Ohio
Undergraduate,Beta Zeta,University of North Dakota,Grand Forks,ND,United States,Dakotas
Undergraduate,Chi,Mississippi State University,Mississippi State,MS,United States,Mississippi
Undergraduate,Chi Chi,Colorado State University,Fort Collins,CO,United States,Colorado/Wyoming
Undergraduate,Chi Phi,James Madison University,Harrisonburg,VA,United States,Eastern Virginia
Undergraduate,Chi Psi,University of California-Los Angeles,Los Angeles,CA,United States,Southern California
Undergraduate,Delta,University of Georgia,Athens,GA,United States,North Georgia
Undergraduate,Delta Beta,Dartmouth College,Hanover,NH,United States,North Atlantic
Undergraduate,Delta Chi,Oklahoma State University,Stillwater,OK,United States,Oklahoma/Arkansas
Undergraduate,Delta Delta,Purdue University,West Lafayette,IN,United States,Northern Indiana
Undergraduate,Delta Epsilon,University of Kentucky,Lexington,KY,United States,Central Kentucky
Undergraduate,Delta Eta,University of Nebraska-Omaha,Omaha,NE,United States,Kansas/Nebraska
Undergraduate,Delta Gamma,University of South Dakota,Vermillion,SD,United States,Dakotas
Undergraduate,Delta Iota,James Madison University,Harrisonburg,VA,United States,Eastern Virginia
Undergraduate,Delta Kappa,Duke University,Durham,NC,United States,Eastern North Carolina
Undergraduate,Delta Lambda,California State University-Fullerton,Fullerton,CA,United States,Southern California
Undergraduate,Delta Mu,University of Texas-Austin,Austin,TX,United States,Central Texas
Undergraduate,Delta Nu,Wayne State University,Detroit,MI,United States,East Michigan
Undergraduate,Delta Omega,High Point University,High Point,NC,United States,Western North Carolina
Undergraduate,Delta Omicron,Ferris State University,Big Rapids,MI,United States,West Michigan
Undergraduate,Delta Phi,Florida State University,Tallahassee,FL,United States,North Florida
Undergraduate,Delta Pi,Wittenberg University,Springfield,OH,United States,Ohio
Undergraduate,Delta Psi,University of Maryland,College Park,MD,United States,Eastern
Undergraduate,Delta Sigma,Carnegie Mellon University,Pittsburgh,PA,United States,West Virginia/West Pennsylvania
Undergraduate,Delta Tau,Arizona State University,Tempe,AZ,United States,Grand Canyon
Undergraduate,Delta Theta,Ashland University,Ashland,OH,United States,Northern Ohio
Undergraduate,Delta Upsilon,Texas Tech University,Lubbock,TX,United States,Northern Texas
Undergraduate,Delta Xi,North Carolina State University,Raleigh,NC,United States,Eastern North Carolina
Undergraduate,Delta Zeta,Rockhurst University,Kansas City,MO,United States,Kansas/Nebraska
Undergraduate,Epsilon,George Washington University,Washington,DC,United States,Eastern
Undergraduate,Epsilon Epsilon,University of Arizona,Tucson,AZ,United States,Grand Canyon
Undergraduate,Epsilon Eta,University of Louisville,Louisville,KY,United States,Central Kentucky
Undergraduate,Epsilon Gamma,Michigan State University,East Lansing,MI,United States,West Michigan
Undergraduate,Epsilon Iota,Quinnipiac University,Hamden,CT,United States,Connecticut/Rhode Island
Undergraduate,Epsilon Kappa,University of Nevada-Reno,Reno,NV,United States,Utah/Nevada
Undergraduate,Epsilon Lambda,Illinois State University,Normal,IL,United States,Central Illinois
Undergraduate,Epsilon Mu,University of Central Florida,Orlando,FL,United States,Central Florida
Undergraduate,Epsilon Nu,Middle Tennessee State University,Murfreesboro,TN,United States,Middle Tennessee
Undergraduate,Epsilon Omega,Stetson University,DeLand,FL,United States,Central Florida
Undergraduate,Epsilon Omicron,Western Illinois University,Macomb,IL,United States,Mid-Central
Undergraduate,Epsilon Phi,Eastern Kentucky University,Richmond,KY,United States,Central Kentucky
Undergraduate,Epsilon Pi,Loyola Marymount University,Los Angeles,CA,United States,Southern California
Undergraduate,Epsilon Psi,University of Richmond,Richmond,VA,United States,Eastern Virginia
Undergraduate,Epsilon Rho,Liberty University,Lynchburg,VA,United States,Western Virginia
Undergraduate,Epsilon Sigma,Oregon State University,Corvallis,OR,United States,Northwestern
Undergraduate,Epsilon Tau,University of Central Oklahoma,Edmond,OK,United States,Oklahoma/Arkansas
Undergraduate,Epsilon Theta,Wofford College,Spartanburg,SC,United States,South Carolina
Undergraduate,Epsilon Upsilon,Baylor University,Waco,TX,United States,Central Texas
Undergraduate,Epsilon Xi,University of North Dakota,Grand Forks,ND,United States,Dakotas
Undergraduate,Epsilon Zeta,Truman State University,Kirksville,MO,United States,Missouri
Undergraduate,Eta,University of Mississippi,Oxford,MS,United States,Mississippi
Undergraduate,Eta Beta,Northern Illinois University,DeKalb,IL,United States,Chicagoland
Undergraduate,Eta Chi,University of Texas-Dallas,Richardson,TX,United States,Northern Texas
Undergraduate,Eta Delta,University of Virginia,Charlottesville,VA,United States,Eastern Virginia
Undergraduate,Eta Epsilon,Appalachian State University,Boone,NC,United States,Western North Carolina
Undergraduate,Eta Eta,Lipscomb University,Nashville,TN,United States,Middle Tennessee
Undergraduate,Eta Gamma,University of Tennessee-Knoxville,Knoxville,TN,United States,East Tennessee
Undergraduate,Eta Iota,Angelo State University,San Angelo,TX,United States,Northern Texas
Undergraduate,Eta Kappa,Lincoln Memorial University,Harrogate,TN,United States,East Tennessee
Undergraduate,Eta Lambda,Tennessee Technological University,Cookeville,TN,United States,Middle Tennessee
Undergraduate,Eta Mu,Sam Houston State University,Huntsville,TX,United States,Northern Texas
Undergraduate,Eta Nu,Stephen F. Austin State University,Nacogdoches,TX,United States,Northern Texas
Undergraduate,Eta Omega,Clemson University,Clemson,SC,United States,South Carolina
Undergraduate,Eta Omicron,University of South Carolina,Columbia,SC,United States,South Carolina
Undergraduate,Eta Phi,Western Carolina University,Cullowhee,NC,United States,Western North Carolina
Undergraduate,Eta Psi,University of Arkansas-Fayetteville,Fayetteville,AR,United States,Oklahoma/Arkansas
Undergraduate,Eta Rho,University of Mississippi,Oxford,MS,United States,Mississippi
Undergraduate,Eta Sigma,Longwood University,Farmville,VA,United States,Eastern Virginia
Undergraduate,Eta Tau,Old Dominion University,Norfolk,VA,United States,Eastern Virginia
Undergraduate,Eta Theta,Georgia Institute of Technology,Atlanta,GA,United States,North Georgia
Undergraduate,Eta Zeta,Austin Peay State University,Clarksville,TN,United States,Middle Tennessee
Undergraduate,Gamma,Pennsylvania State University,University Park,PA,United States,Central Pennsylvania
Undergraduate,Gamma Alpha,Oklahoma State University,Stillwater,OK,United States,Oklahoma/Arkansas
Undergraduate,Gamma Beta,Northwestern University,Evanston,IL,United States,Chicagoland
Undergraduate,Gamma Chi,Kansas State University,Manhattan,KS,United States,Kansas/Nebraska
Undergraduate,Gamma Delta,University of Colorado-Boulder,Boulder,CO,United States,Colorado/Wyoming
Undergraduate,Gamma Epsilon,Utah State University,Logan,UT,United States,Utah/Nevada
Undergraduate,Gamma Eta,Colorado School of Mines,Golden,CO,United States,Colorado/Wyoming
Undergraduate,Gamma Gamma,Denison University,Granville,OH,United States,Southern Ohio
Undergraduate,Iota Upsilon,Boston University,Boston,MA,United States,Boston Harbor
Undergraduate,Iota Xi,George Mason University,Fairfax,VA,United States,Eastern
Undergraduate,Iota Zeta,Clarkson University,Potsdam,NY,United States,Saint Lawrence
Undergraduate,Kappa,Bucknell University,Lewisburg,PA,United States,Central Pennsylvania
Undergraduate,Kappa Beta,University of North Florida,Jacksonville,FL,United States,North Florida
Undergraduate,Kappa Chi,Villanova University,Villanova,PA,United States,Mid Atlantic
Undergraduate,Kappa Epsilon,University of Delaware,Newark,DE,United States,Mid Atlantic
Undergraduate,Kappa Eta,Harvard University,Cambridge,MA,United States,Boston Harbor
Undergraduate,Kappa Gamma,Western Carolina University,Cullowhee,NC,United States,Western North Carolina
Undergraduate,Kappa Iota,Southern Utah University,Cedar City,UT,United States,Utah/Nevada
Undergraduate,Kappa Kappa,University of Illinois,Champaign,IL,United States,Central Illinois
Undergraduate,Kappa Lambda,The College of Idaho,Caldwell,ID,United States,The Big Sky
Undergraduate,Kappa Mu,University of Windsor,Windsor,ON,Canada,East Michigan
Undergraduate,Kappa Omicron,Pepperdine University,Malibu,CA,United States,Los Angeles Coastal
Undergraduate,Kappa Phi,Embry-Riddle Aeronautical University-Prescott,Prescott,AZ,United States,Grand Canyon
Undergraduate,Kappa Pi,Towson University,Towson,MD,United States,Eastern
Undergraduate,Kappa Psi,University of Tennessee-Martin,Martin,TN,United States,Mississippi River
Undergraduate,Kappa Rho,American University,Washington,DC,United States,Eastern
Undergraduate,Kappa Sigma,University of the Pacific,Stockton,CA,United States,California Central Valley
Undergraduate,Kappa Tau,Minnesota State University-Mankato,Mankato,MN,United States,North Central
Undergraduate,Kappa Theta,California State University-Chico,Chico,CA,United States,California Central Valley
Undergraduate,Kappa Xi,Tarleton State University,Stephenville,TX,United States,Central Texas
Undergraduate,Kappa Zeta,Radford University,Radford,VA,United States,Western Virginia
Undergraduate,Lambda,Indiana University,Bloomington,IN,United States,Central Indiana
Undergraduate,Lambda Alpha,Knox College,Galesburg,IL,United States,Mid-Central
Undergraduate,Lambda Chi,University of Wisconsin-Milwaukee,Milwaukee,WI,United States,Wisconsin
Undergraduate,Lambda Delta,University of California-Merced,Merced,CA,United States,California Central Valley
Undergraduate,Lambda Epsilon,University of New Haven,West Haven,CT,United States,Connecticut/Rhode Island
Undergraduate,Lambda Eta,Bryant University,Smithfield,RI,United States,Connecticut/Rhode Island
Undergraduate,Lambda Gamma,Santa Clara University,Santa Clara,CA,United States,California Bay Area
Undergraduate,Lambda Iota,Florida International University,Miami,FL,United States,South Florida/Everglades
Undergraduate,Lambda Kappa,Rochester Institute of Technology,Rochester,NY,United States,Northwestern New York
Undergraduate,Lambda Lambda,University of Kentucky,Lexington,KY,United States,Central Kentucky
Undergraduate,Lambda Mu,Valdosta State University,Valdosta,GA,United States,North Florida
Undergraduate,Lambda Nu,Loyola University-Chicago,Chicago,IL,United States,Chicagoland
Undergraduate,Lambda Omega,DePaul University,Chicago,IL,United States,Chicagoland
Undergraduate,Lambda Omicron,Southern Illinois University-Carbondale,Carbondale,IL,United States,Mississippi River
Undergraduate,Lambda Phi,University of West Georgia,Carrollton,GA,United States,North Georgia
Undergraduate,Lambda Pi,Carnegie Mellon University,Pittsburgh,PA,United States,West Virginia/West Pennsylvania
Undergraduate,Lambda Psi,University of Louisiana-Lafayette,Lafayette,LA,United States,Southern
Undergraduate,Lambda Sigma,University of New Hampshire,Durham,NH,United States,North Atlantic
Undergraduate,Lambda Tau,Florida Atlantic University,Wilton Manors,FL,United States,South Florida/Everglades
Undergraduate,Lambda Theta,University of Ottawa,Ottawa,ON,Canada,Saint Lawrence
Undergraduate,Lambda Upsilon,Bentley University,Waltham,MA,United States,Boston Harbor
Undergraduate,Lambda Xi,Boise State University,Boise,ID,United States,The Big Sky
Undergraduate,Lambda Zeta,Florida Gulf Coast University,Fort Myers,FL,United States,South Florida/Everglades
Undergraduate,Mu,Denison University,Granville,OH,United States,Southern Ohio
Undergraduate,Mu Alpha,University of North Carolina-Charlotte,Charlotte,NC,United States,Western North Carolina
Undergraduate,Mu Beta,California State University-San Marcos,San Marcos,CA,United States,Southern California
Undergraduate,Mu Epsilon,University of Massachusetts-Amherst,Amherst,MA,United States,North Atlantic
Undergraduate,Mu Eta,West Chester University of Pennsylvania,West Chester,PA,United States,Mid Atlantic
Undergraduate,Mu Gamma,Binghamton University,Binghamton,NY,United States,Northwestern New York
Undergraduate,Mu Iota,University of Texas-San Antonio,San Antonio,TX,United States,Central Texas
Undergraduate,Mu Kappa,University of North Carolina-Wilmington,Wilmington,NC,United States,Eastern North Carolina
Undergraduate,Mu Lambda,Sacred Heart University,Fairfield,CT,United States,Connecticut/Rhode Island
Undergraduate,Mu Mu,West Virginia University,Morgantown,WV,United States,West Virginia/West Pennsylvania
Undergraduate,Mu Nu,California State University-Sacramento,Sacramento,CA,United States,California Central Valley
Undergraduate,Mu Omicron,University of Central Arkansas,Conway,AR,United States,Oklahoma/Arkansas
Undergraduate,Mu Phi,Penn State Erie,Erie,PA,United States,West Virginia/West Pennsylvania
Undergraduate,Mu Pi,Samford University,Birmingham,AL,United States,Alabama/Gulf Coast
Undergraduate,Mu Psi,Hillsdale College,Hillsdale,MI,United States,East Michigan
Undergraduate,Mu Rho,University of Tennessee-Chattanooga,Chattanooga,TN,United States,East Tennessee
Undergraduate,Mu Sigma,Virginia Tech,Blacksburg,VA,United States,Western Virginia
Undergraduate,Mu Tau,California State University-Long Beach,Long Beach,CA,United States,Southern California
Undergraduate,Mu Upsilon,East Carolina University,Greenville,NC,United States,Eastern North Carolina
Undergraduate,Nu,Columbia University,New York,NY,United States,Eastern
Undergraduate,Rho,Butler University,Indianapolis,IN,United States,Central Indiana
Undergraduate,Rho Rho,University of Maine,Orono,ME,United States,North Atlantic
Undergraduate,Sigma,Princeton University,Princeton,NJ,United States,Central Pennsylvania
Undergraduate,Sigma Sigma,Hampden-Sydney College,Hampden Sydney,VA,United States,Eastern Virginia
Undergraduate,Tau,Roanoke College,Salem,VA,United States,Western Virginia
Undergraduate,Theta,Gettysburg College,Gettysburg,PA,United States,Central Pennsylvania
Undergraduate,Theta Beta,University of South Florida,Tampa,FL,United States,Central Florida
Undergraduate,Theta Chi,Arkansas State University,State University,AR,United States,Oklahoma/Arkansas
Undergraduate,Theta Epsilon,University of North Georgia,Dahlonega,GA,United States,North Georgia
Undergraduate,Theta Eta,Missouri University of Science & Technology,Rolla,MO,United States,Missouri
Undergraduate,Theta Gamma,Drake University,Des Moines,IA,United States,Mid-Central
Undergraduate,Theta Iota,Saint Louis University,Saint Louis,MO,United States,Missouri
Undergraduate,Theta Mu,Spring Hill College,Mobile,AL,United States,Alabama/Gulf Coast
Undergraduate,Theta Nu,Alma College,Alma,MI,United States,East Michigan
Undergraduate,Theta Omega,Elon University,Elon,NC,United States,Eastern North Carolina
Undergraduate,Theta Omicron,University of California-Davis,Davis,CA,United States,California Central Valley
Undergraduate,Theta Psi,University of Waterloo,Waterloo,ON,Canada,Ontario
Undergraduate,Theta Rho,Illinois State University,Normal,IL,United States,Central Illinois
Undergraduate,Theta Sigma,California State Polytechnic University-Pomona,Pomona,CA,United States,Southern California
Undergraduate,Theta Tau,Texas State University-San Marcos,San Marcos,TX,United States,Central Texas
Undergraduate,Theta Theta,University of Michigan,Ann Arbor,MI,United States,East Michigan
Undergraduate,Theta Upsilon,Yale University,New Haven,CT,United States,Connecticut/Rhode Island
Undergraduate,Theta Zeta,Bridgewater State University,Bridgewater,MA,United States,Boston Harbor
Undergraduate,Upsilon Upsilon,University of Washington,Seattle,WA,United States,Northwestern
Undergraduate,Xi,DePauw University,Greencastle,IN,United States,Central Indiana
Undergraduate,Zeta,Washington & Lee University,Lexington,VA,United States,Western Virginia
Undergraduate,Zeta Eta,Texas A&M University-Commerce,Commerce,TX,United States,Northern Texas
Undergraduate,Zeta Iota,Pittsburg State University,Pittsburg,KS,United States,Kansas/Nebraska
Undergraduate,Zeta Kappa,University of California-Santa Barbara,Goleta,CA,United States,Los Angeles Coastal
Undergraduate,Zeta Lambda,Kent State University,Kent,OH,United States,Northern Ohio
Undergraduate,Zeta Mu,Western Kentucky University,Bowling Green,KY,United States,Mid-South
Undergraduate,Zeta Nu,Western Michigan University,Kalamazoo,MI,United States,West Michigan
Undergraduate,Zeta Omega,East Tennessee State University,Johnson City,TN,United States,East Tennessee
Undergraduate,Zeta Omicron,Northern Arizona University,Flagstaff,AZ,United States,Grand Canyon
Undergraduate,Zeta Phi,New Mexico State University,Las Cruces,NM,United States,Southwestern
Undergraduate,Zeta Pi,Texas A&M University-Kingsville,Kingsville,TX,United States,Central Texas
Undergraduate,Zeta Psi,University of Cincinnati,Cincinnati,OH,United States,Southern Ohio
Undergraduate,Zeta Tau,Fort Hays State University,Hays,KS,United States,Kansas/Nebraska
Undergraduate,Zeta Theta A,Kettering University,Flushing,MI,United States,East Michigan
Undergraduate,Zeta Theta B,Kettering University,Flushing,MI,United States,East Michigan
Undergraduate,Zeta Upsilon,Arizona State University,Tempe,AZ,United States,Grand Canyon
Undergraduate,Zeta Zeta,Grand Valley State University,Allendale,MI,United States,West Michigan
Associate,Alpha Chi Sigma,University of Mount Union,Alliance,OH,United States,Northern Ohio
Associate,Alpha Delta Sigma,Michigan State University,East Lansing,MI,United States,West Michigan
Associate,Alpha Iota Sigma,University of Connecticut,Storrs,CT,United States,Connecticut/Rhode Island
Associate,Alpha Sigma Sigma,Oklahoma State University,Stillwater,OK,United States,Oklahoma/Arkansas
Associate,Beta Lambda Sigma,University of Arkansas,Fayetteville,AR,United States,Oklahoma/Arkansas
Associate,Gamma Sigma Sigma,Central Michigan University,Mount Pleasant,MI,United States,West Michigan
Associate,Delta Mu Sigma,Monmouth College,Monmouth,IL,United States,Mid-Central
Associate,Epsilon Theta Sigma,University of Tennessee-Chattanooga,Chattanooga,TN,United States,East Tennessee
Associate,Iota Sigma,Texas A&M University-Commerce,Commerce,TX,United States,Northern Texas
Associate,Kappa Mu Sigma,University of Toledo,Toledo,OH,United States,Northern Ohio
Associate,Sigma Chi Epsilon,Michigan State University,Westphalia,MI,United States,West Michigan`;

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  const chapters = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const chapter = {
      chapter_type: values[0],
      greek_letter_name: values[1],
      university_name: values[2],
      city: values[3],
      state_province: values[4],
      country: values[5],
      fraternity_province: values[6]
    };
    chapters.push(chapter);
  }

  return chapters;
}

// University name variations to match against database
const universityNameMap = {
  'Miami University': ['Miami University (OH)', 'Miami University'],
  'Ohio State University': ['The Ohio State University (OH)', 'Ohio State University'],
  'Pennsylvania State University': ['The Pennsylvania State University (PA)', 'Pennsylvania State University', 'Penn State'],
  'University of California-Berkeley': ['University of California-Berkeley (CA)'],
  'University of Southern California': ['University of Southern California (CA)'],
  'University of Michigan': ['University of Michigan-Ann Arbor (MI)', 'University of Michigan'],
  'University of Alabama': ['The University of Alabama (AL)', 'University of Alabama'],
  // Add more as needed...
};

async function findUniversity(universityName) {
  // Try exact match first
  let { data, error } = await supabase
    .from('universities')
    .select('id, name')
    .ilike('name', `%${universityName}%`)
    .limit(1);

  if (data && data.length > 0) {
    return data[0];
  }

  // Try variations
  const variations = universityNameMap[universityName] || [];
  for (const variant of variations) {
    const { data, error } = await supabase
      .from('universities')
      .select('id, name')
      .ilike('name', `%${variant}%`)
      .limit(1);

    if (data && data.length > 0) {
      return data[0];
    }
  }

  return null;
}

async function importChapters() {
  console.log('🚀 Starting Sigma Chi chapter import...\n');

  const chapters = parseCSV(csvData);
  console.log(`📊 Parsed ${chapters.length} chapters from CSV\n`);

  // Get Sigma Chi organization ID
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('name', 'Sigma Chi')
    .single();

  if (orgError || !orgData) {
    console.error('❌ Could not find Sigma Chi organization in database');
    console.error('   Please ensure Sigma Chi exists in the organizations table');
    return;
  }

  const sigmaChiId = orgData.id;
  console.log(`✅ Found Sigma Chi organization: ${sigmaChiId}\n`);

  let successCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  const notFound = [];

  for (const chapter of chapters) {
    console.log(`Processing: ${chapter.greek_letter_name} at ${chapter.university_name}...`);

    // Find university
    const university = await findUniversity(chapter.university_name);

    if (!university) {
      console.log(`  ⚠️  University not found: ${chapter.university_name}`);
      notFound.push(chapter.university_name);
      notFoundCount++;
      continue;
    }

    console.log(`  ✓ Matched to: ${university.name}`);

    // Create or update chapter
    const { data, error } = await supabase
      .from('chapters')
      .upsert({
        organization_id: sigmaChiId,
        universities_id: university.id,
        greek_letter_name: chapter.greek_letter_name,
        chapter_type: chapter.chapter_type,
        fraternity_province: chapter.fraternity_province,
        city: chapter.city,
        state_province: chapter.state_province,
        country: chapter.country,
      }, {
        onConflict: 'organization_id,universities_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      errorCount++;
    } else {
      console.log(`  ✅ Imported successfully`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Successfully imported: ${successCount}`);
  console.log(`   ⚠️  Universities not found: ${notFoundCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  if (notFound.length > 0) {
    console.log(`\n📋 Universities not found in database:`);
    const unique = [...new Set(notFound)];
    unique.forEach(name => console.log(`   - ${name}`));
  }

  console.log('\n');
}

importChapters();
