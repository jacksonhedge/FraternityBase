/**
 * Upload Sigma Chi Rosters - Specific Script
 * Uploads three specific Sigma Chi chapter rosters with exact chapter IDs
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CHAPTER_MAPPING = {
  'Penn State Sigma Chi.csv': {
    id: '01394a98-22e2-4729-94b4-ca432e005608',
    name: 'Penn State Sigma Chi (Alpha Chi)'
  },
  'University of Michigan Sigma Chi.csv': {
    id: 'e502e257-6dd3-4797-95f9-bb204636a26e',
    name: 'University of Michigan Sigma Chi (Theta Theta)'
  },
  'TCU Sigma Chi.csv': {
    id: '3b3d2feb-3ae7-4c62-a4b1-df1b60078ecd',
    name: 'TCU Sigma Chi (Epsilon Mu)'
  },
  'Florida State Sigma Chi.csv': {
    id: '88140069-13c0-43d8-9003-074b14e938ef',
    name: 'Florida State Sigma Chi (Epsilon Zeta)'
  }
};

function mapCSVRow(row) {
  // Normalize column names
  const normalized = {};
  Object.keys(row).forEach(key => {
    normalized[key.toLowerCase().trim()] = row[key];
  });

  return {
    name: normalized['first name'] && normalized['last name']
      ? `${normalized['first name']} ${normalized['last name']}`
      : (normalized['name'] || ''),
    position: normalized['role/position'] || normalized['position'] || normalized['role'] || 'Member',
    email: normalized['email'] || null,
    phone: normalized['phone number'] || normalized['phone'] || null,
    member_type: 'member'
  };
}

async function uploadRoster(csvFile, chapterId, chapterName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 Processing: ${chapterName}`);
  console.log(`📁 File: ${csvFile}`);
  console.log(`🆔 Chapter ID: ${chapterId}`);
  console.log(`${'='.repeat(60)}\n`);

  const members = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        const member = mapCSVRow(row);
        if (member.name && member.name.trim()) {
          members.push({
            ...member,
            chapter_id: chapterId
          });
        }
      })
      .on('end', async () => {
        console.log(`📊 Found ${members.length} members in CSV`);

        if (members.length === 0) {
          console.log('⚠️  No members to upload');
          resolve({ success: true, count: 0 });
          return;
        }

        console.log(`📤 Uploading to database...`);

        const { data, error } = await supabase
          .from('chapter_officers')
          .insert(members)
          .select();

        if (error) {
          console.error(`❌ Upload failed:`, error.message);
          reject(error);
        } else {
          console.log(`✅ Successfully uploaded ${data.length} members`);
          resolve({ success: true, count: data.length });
        }
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('\n🎓 Sigma Chi Roster Upload Script\n');

  const results = [];

  for (const [filename, chapter] of Object.entries(CHAPTER_MAPPING)) {
    try {
      const result = await uploadRoster(filename, chapter.id, chapter.name);
      results.push({ ...result, chapter: chapter.name });
    } catch (error) {
      console.error(`❌ Failed to upload ${chapter.name}:`, error.message);
      results.push({ success: false, chapter: chapter.name, error: error.message });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 UPLOAD SUMMARY');
  console.log(`${'='.repeat(60)}`);

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalMembers = successful.reduce((sum, r) => sum + (r.count || 0), 0);

  console.log(`✅ Successful uploads: ${successful.length}`);
  console.log(`❌ Failed uploads: ${failed.length}`);
  console.log(`👥 Total members uploaded: ${totalMembers}`);

  successful.forEach(r => {
    console.log(`  ✓ ${r.chapter}: ${r.count} members`);
  });

  if (failed.length > 0) {
    console.log('\n❌ Failed:');
    failed.forEach(r => {
      console.log(`  ✗ ${r.chapter}: ${r.error}`);
    });
  }

  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);
