const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oqptnptlshlhbmmnjamb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcHRucHRsc2hsaGJtbW5qYW1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzI5OTA3NywiZXhwIjoyMDQyODc1MDc3fQ.0B5hMmVtcCexKH7Oq14iPYSc90Uh8qjHCEbpzPVX7Jk';

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
