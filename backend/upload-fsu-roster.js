/**
 * Upload Florida State Sigma Chi Roster
 *
 * This script uploads the roster for Florida State University Sigma Chi (Epsilon Zeta chapter).
 *
 * Requirements:
 * 1. Either set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file
 * 2. OR use the deployed API with ADMIN_TOKEN
 *
 * Usage:
 *   node upload-fsu-roster.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, 'Florida State Sigma Chi.csv');

async function uploadViaSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    console.log('💡 Please create a .env file with these variables, or use the API method');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Searching for Florida State Sigma Chi chapter...\n');

    // Get Sigma Chi organization ID
    const { data: org, error: orgError } = await supabase
      .from('greek_organizations')
      .select('id, name')
      .eq('name', 'Sigma Chi')
      .single();

    if (orgError || !org) {
      console.error('❌ Error finding Sigma Chi:', orgError?.message || 'Not found');
      return false;
    }

    console.log(`✅ Found organization: ${org.name}`);

    // Find Florida State Sigma Chi (Epsilon Zeta chapter)
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select(`
        id,
        chapter_name,
        greek_letter_name,
        universities(name, state_province)
      `)
      .eq('greek_letter_name', 'Epsilon Zeta')
      .eq('greek_organization_id', org.id)
      .single();

    if (chapterError || !chapter) {
      console.error('❌ Error finding FSU chapter:', chapterError?.message || 'Not found');

      // Try alternate search by university name
      console.log('🔍 Trying alternate search by university name...\n');

      const { data: fsuUniv } = await supabase
        .from('universities')
        .select('id, name')
        .or('name.ilike.%Florida State%,name.ilike.%FSU%')
        .limit(5);

      if (fsuUniv && fsuUniv.length > 0) {
        console.log('Found universities matching Florida State:');
        fsuUniv.forEach(u => console.log(`  - ${u.name} (${u.id})`));

        const { data: chapters } = await supabase
          .from('chapters')
          .select(`
            id,
            chapter_name,
            greek_letter_name,
            universities(name, state_province)
          `)
          .eq('greek_organization_id', org.id)
          .in('university_id', fsuUniv.map(u => u.id));

        if (chapters && chapters.length > 0) {
          console.log('\nFound Sigma Chi chapters at Florida State:');
          chapters.forEach(c => console.log(`  - ${c.chapter_name} (${c.greek_letter_name})`));
          console.log('\n❌ Please update the script with the correct chapter identifier\n');
        }
      }

      return false;
    }

    console.log(`✅ Found chapter: ${chapter.chapter_name} (${chapter.greek_letter_name})`);
    console.log(`   University: ${chapter.universities.name}, ${chapter.universities.state_province}`);
    console.log(`   Chapter ID: ${chapter.id}\n`);

    // Now upload using the bulk_roster_upload script
    console.log('📤 Now run the bulk upload script with:');
    console.log(`   node bulk_roster_upload.js .`);
    console.log('\n   (The script will find "Florida State Sigma Chi.csv" in the current directory)\n');

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function uploadViaAPI() {
  const API_URL = process.env.API_URL || 'https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api';
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  console.log('🌐 Using API method...');
  console.log(`   API URL: ${API_URL}`);

  if (!ADMIN_TOKEN) {
    console.log('⚠️  No ADMIN_TOKEN found, but admin auth is currently disabled on the server');
    console.log('   This might work anyway!\n');
  }

  try {
    // First, get all chapters to find Florida State Sigma Chi
    console.log('🔍 Fetching chapters from API...\n');

    const headers = {
      'Content-Type': 'application/json'
    };

    if (ADMIN_TOKEN) {
      headers['x-admin-token'] = ADMIN_TOKEN;
    }

    const chaptersRes = await fetch(`${API_URL}/admin/chapters`, { headers });

    if (!chaptersRes.ok) {
      console.error(`❌ Error fetching chapters: ${chaptersRes.status} ${chaptersRes.statusText}`);
      return false;
    }

    const chaptersData = await chaptersRes.json();

    // Find Florida State Sigma Chi
    const fsuChapter = chaptersData.data?.find(ch =>
      (ch.chapter_name.includes('Florida State') || ch.chapter_name.includes('FSU') ||
       ch.universities?.name?.includes('Florida State') || ch.universities?.name?.includes('FSU')) &&
      ch.greek_organizations?.name === 'Sigma Chi'
    );

    if (!fsuChapter) {
      console.error('❌ Could not find Florida State Sigma Chi in chapters list');
      console.log('   Available chapters:', chaptersData.data?.length || 0);

      // Show Sigma Chi chapters for debugging
      const sigmaChiChapters = chaptersData.data?.filter(ch =>
        ch.greek_organizations?.name === 'Sigma Chi'
      );
      if (sigmaChiChapters && sigmaChiChapters.length > 0) {
        console.log('\n   Found Sigma Chi chapters:');
        sigmaChiChapters.slice(0, 10).forEach(ch => {
          console.log(`   - ${ch.chapter_name} (${ch.greek_letter_name || 'N/A'})`);
        });
      }

      return false;
    }

    console.log(`✅ Found chapter: ${fsuChapter.chapter_name}`);
    console.log(`   Chapter ID: ${fsuChapter.id}\n`);

    // Read the CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');

    console.log('📤 Uploading roster via API...\n');

    // Use the paste-roster endpoint
    const uploadRes = await fetch(`${API_URL}/admin/chapters/${fsuChapter.id}/paste-roster`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ csvText: csvContent })
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      console.error(`❌ Error uploading roster: ${uploadRes.status} ${uploadRes.statusText}`);
      console.error('   Error:', errorData.error || 'Unknown error');
      return false;
    }

    const uploadData = await uploadRes.json();

    console.log('✅ Successfully uploaded roster!');
    console.log(`   Members added: ${uploadData.data?.added || 'N/A'}`);
    console.log(`   Members updated: ${uploadData.data?.updated || 'N/A'}`);
    console.log(`   Skipped: ${uploadData.data?.skipped || 'N/A'}\n`);

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Florida State Sigma Chi Roster Upload');
  console.log('='.repeat(60));
  console.log('\n');

  // Check if CSV file exists
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }

  console.log(`✅ CSV file found: ${csvFilePath}\n`);

  // Try API method first (since it's simpler)
  console.log('Attempting upload via API...\n');
  const apiSuccess = await uploadViaAPI();

  if (apiSuccess) {
    console.log('\n✅ Upload complete!\n');
    process.exit(0);
  }

  console.log('\n⚠️  API method failed. Trying Supabase method...\n');
  const supabaseSuccess = await uploadViaSupabase();

  if (supabaseSuccess) {
    console.log('\n✅ Setup complete! Now run bulk_roster_upload.js\n');
    process.exit(0);
  }

  console.log('\n❌ Both methods failed. Please check your configuration.\n');
  console.log('Required environment variables:');
  console.log('  - For API method: ADMIN_TOKEN (optional if auth is disabled)');
  console.log('  - For Supabase method: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY\n');

  process.exit(1);
}

main();
