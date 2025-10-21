const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Missing required environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const organizations = [
  { name: 'Alpha Phi Delta', greek_letters: 'ΑΦΔ', founded_year: 1914 },
  { name: 'Chi Psi', greek_letters: 'ΧΨ', founded_year: 1841 },
  { name: 'La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc.', greek_letters: 'ΛΥΛ', founded_year: 1982 },
  { name: 'Phi Mu Delta', greek_letters: 'ΦΜΔ', founded_year: 1918 },
  { name: 'Sigma Beta Rho', greek_letters: 'ΣΒΡ', founded_year: 1996 },
  { name: 'Sigma Phi Delta', greek_letters: 'ΣΦΔ', founded_year: 1924 }
];

async function addOrganizations() {
  console.log('📝 Adding missing Greek organizations...\n');

  for (const org of organizations) {
    try {
      console.log(`Adding ${org.name}...`);

      const { data, error } = await supabaseAdmin
        .from('greek_organizations')
        .insert({
          name: org.name,
          greek_letters: org.greek_letters,
          organization_type: 'fraternity',
          founded_year: org.founded_year
        })
        .select();

      if (error) {
        console.error(`❌ Error:`, error.message);
      } else {
        console.log(`✅ Added: ${data[0].id}`);
      }
    } catch (error) {
      console.error(`❌ Fatal error:`, error.message);
    }
  }

  console.log('\n✨ Done adding organizations!');
}

addOrganizations();
