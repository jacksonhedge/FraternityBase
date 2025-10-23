/**
 * Upload Sigma Chi rosters from converted PDFs
 * CSVs have format: University,Fraternity,First Name,Last Name,Email,Phone,Member Type,Status
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findOrCreateChapter(universityName, fraternityName) {
  // First, find or create the university
  let { data: university, error: univError } = await supabase
    .from('universities')
    .select('id, name')
    .ilike('name', universityName)
    .single();

  if (univError || !university) {
    // Try broader search
    const { data: universities } = await supabase
      .from('universities')
      .select('id, name')
      .ilike('name', `%${universityName}%`)
      .limit(1);

    university = universities && universities.length > 0 ? universities[0] : null;
  }

  if (!university) {
    console.log(`   ⚠️  University not found: ${universityName}`);
    return null;
  }

  // Find or create Sigma Chi organization
  let { data: greekOrg, error: orgError } = await supabase
    .from('greek_organizations')
    .select('id, name')
    .ilike('name', fraternityName)
    .single();

  if (orgError || !greekOrg) {
    console.log(`   📝 Creating Greek organization: ${fraternityName}`);
    const { data: newOrg } = await supabase
      .from('greek_organizations')
      .insert({ name: fraternityName, type: 'Fraternity' })
      .select()
      .single();

    greekOrg = newOrg;
  }

  if (!greekOrg) {
    console.log(`   ❌ Could not create/find organization: ${fraternityName}`);
    return null;
  }

  // Find or create chapter
  let { data: chapter } = await supabase
    .from('chapters')
    .select('id, chapter_name')
    .eq('university_id', university.id)
    .eq('greek_organization_id', greekOrg.id)
    .single();

  if (!chapter) {
    console.log(`   📝 Creating new chapter for ${fraternityName} at ${university.name}`);
    const { data: newChapter } = await supabase
      .from('chapters')
      .insert({
        university_id: university.id,
        greek_organization_id: greekOrg.id,
        chapter_name: `${university.name} - ${fraternityName}`
      })
      .select()
      .single();

    chapter = newChapter;
  }

  if (!chapter) {
    console.log(`   ❌ Could not create/find chapter`);
    return null;
  }

  console.log(`   ✅ Using chapter: ${chapter.chapter_name} (ID: ${chapter.id})`);
  return chapter;
}

async function processCSV(filePath) {
  return new Promise((resolve, reject) => {
    const members = [];
    let universityName = '';
    let fraternityName = '';

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Extract university and fraternity from first row
        if (!universityName) {
          universityName = row['University'] || row['university'];
          fraternityName = row['Fraternity'] || row['fraternity'];
        }

        const firstName = row['First Name'] || row['first_name'] || '';
        const lastName = row['Last Name'] || row['last_name'] || '';
        const name = `${firstName} ${lastName}`.trim();

        if (name) {
          members.push({
            name,
            email: row['Email'] || row['email'] || null,
            phone: row['Phone'] || row['phone'] || null,
            member_type: row['Status'] || row['status'] || 'Active',
            position: row['Member Type'] || row['member_type'] || null,
          });
        }
      })
      .on('end', () => {
        resolve({ universityName, fraternityName, members });
      })
      .on('error', reject);
  });
}

async function uploadRoster(chapterId, members) {
  const { data, error } = await supabase
    .from('chapter_members')
    .insert(
      members.map(m => ({
        chapter_id: chapterId,
        name: m.name,
        email: m.email,
        phone: m.phone,
        member_type: m.member_type,
        position: m.position,
        is_primary_contact: false
      }))
    );

  if (error) {
    console.error('   ❌ Upload error:', error.message);
    return false;
  }

  console.log(`   ✅ Uploaded ${members.length} members`);
  return true;
}

async function processAllCSVs(directoryPath) {
  const files = fs.readdirSync(directoryPath)
    .filter(f => f.endsWith('.csv'))
    .map(f => path.join(directoryPath, f));

  console.log(`\n🎯 Found ${files.length} CSV files\n`);
  console.log('='.repeat(60));

  let successCount = 0;
  let failCount = 0;
  let totalMembers = 0;

  for (const file of files) {
    const filename = path.basename(file);
    console.log(`\n📄 Processing: ${filename}`);

    try {
      const { universityName, fraternityName, members } = await processCSV(file);

      if (!members.length) {
        console.log(`   ⚠️  No members found in CSV`);
        failCount++;
        continue;
      }

      console.log(`   Found ${members.length} members`);
      console.log(`   University: ${universityName}`);
      console.log(`   Fraternity: ${fraternityName}`);

      const chapter = await findOrCreateChapter(universityName, fraternityName);

      if (!chapter) {
        failCount++;
        continue;
      }

      const success = await uploadRoster(chapter.id, members);

      if (success) {
        successCount++;
        totalMembers += members.length;
      } else {
        failCount++;
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`👥 Total Members: ${totalMembers}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total Files: ${files.length}`);
  console.log('='.repeat(60));
}

// Main
const directoryPath = process.argv[2] || '/Users/jacksonfitzgerald/Downloads/sigma_chi_csvs';

if (!fs.existsSync(directoryPath)) {
  console.error(`❌ Directory not found: ${directoryPath}`);
  process.exit(1);
}

processAllCSVs(directoryPath)
  .then(() => {
    console.log('\n✅ Batch upload complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
