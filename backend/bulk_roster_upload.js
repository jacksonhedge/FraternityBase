/**
 * Bulk Roster Upload Script
 *
 * This script allows you to upload multiple rosters at once by:
 * 1. Reading CSV files from a directory
 * 2. Matching chapters by name
 * 3. Uploading roster data to the database
 *
 * Usage:
 *   node bulk_roster_upload.js <directory_path>
 *
 * CSV Format Expected:
 *   First Name, Last Name, Email, Phone Number, Role/Position
 *   OR any columns - script will attempt to map them intelligently
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fuzzy match chapter name
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;

  // Levenshtein distance
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  const distance = matrix[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - (distance / maxLen);
}

async function findChapterByName(chapterName) {
  const { data: chapters, error } = await supabase
    .from('chapters')
    .select('id, chapter_name, universities(name, state), greek_organizations(name)');

  if (error) {
    console.error('Error fetching chapters:', error);
    return null;
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const chapter of chapters) {
    const score = calculateSimilarity(chapterName, chapter.chapter_name);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = chapter;
    }
  }

  if (bestScore < 0.6) {
    console.warn(`⚠️  Low confidence match for "${chapterName}": ${bestMatch?.chapter_name} (${(bestScore * 100).toFixed(1)}%)`);
  }

  return bestMatch;
}

function mapCSVColumns(row) {
  // Map CSV columns to chapter_members schema
  const mapped = {
    name: '',
    position: '',
    email: '',
    phone: '',
    linkedin_url: '',
    graduation_year: null,
    major: '',
    member_type: 'Active',
    is_primary_contact: false
  };

  // Common column name variations
  const columnMappings = {
    name: ['name', 'full_name', 'fullname', 'member_name'],
    first_name: ['first_name', 'firstname', 'first', 'fname', 'given_name'],
    last_name: ['last_name', 'lastname', 'last', 'lname', 'surname', 'family_name'],
    position: ['position', 'role', 'title', 'office', 'rank'],
    email: ['email', 'email_address', 'e-mail', 'mail'],
    phone: ['phone', 'phone_number', 'mobile', 'cell', 'telephone', 'contact'],
    linkedin_url: ['linkedin', 'linkedin_url', 'linkedin_profile'],
    graduation_year: ['graduation_year', 'grad_year', 'year', 'class_year'],
    major: ['major', 'field_of_study', 'concentration'],
    member_type: ['member_type', 'status', 'membership_status'],
    is_primary_contact: ['is_primary_contact', 'primary_contact']
  };

  const keys = Object.keys(row);
  let firstName = '';
  let lastName = '';

  for (const [field, variations] of Object.entries(columnMappings)) {
    for (const key of keys) {
      const normalizedKey = key.toLowerCase().trim();
      if (variations.includes(normalizedKey)) {
        const value = row[key]?.trim() || '';

        if (field === 'first_name') {
          firstName = value;
        } else if (field === 'last_name') {
          lastName = value;
        } else if (field === 'graduation_year') {
          const year = parseInt(value);
          mapped.graduation_year = isNaN(year) ? null : year;
        } else if (field === 'is_primary_contact') {
          mapped.is_primary_contact = value.toLowerCase() === 'true' || value === '1';
        } else {
          mapped[field] = value;
        }
        break;
      }
    }
  }

  // Construct full name from first/last if name wasn't found directly
  if (!mapped.name && (firstName || lastName)) {
    mapped.name = `${firstName} ${lastName}`.trim();
  }

  return mapped;
}

async function uploadRoster(chapterId, members) {
  console.log(`📤 Uploading ${members.length} members to chapter ${chapterId}...`);

  const { data, error } = await supabase
    .from('chapter_members')
    .insert(
      members.map(m => ({
        chapter_id: chapterId,
        name: m.name,
        position: m.position || null,
        email: m.email || null,
        phone: m.phone || null,
        linkedin_url: m.linkedin_url || null,
        graduation_year: m.graduation_year,
        major: m.major || null,
        member_type: m.member_type || 'Active',
        is_primary_contact: m.is_primary_contact
      }))
    );

  if (error) {
    console.error('❌ Error uploading roster:', error);
    return false;
  }

  console.log(`✅ Successfully uploaded ${members.length} members`);
  return true;
}

async function processCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const members = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const mapped = mapCSVColumns(row);

        // Only add if we have a name
        if (mapped.name) {
          members.push(mapped);
        }
      })
      .on('end', () => {
        resolve(members);
      })
      .on('error', reject);
  });
}

async function bulkUploadRosters(directoryPath) {
  console.log(`📁 Scanning directory: ${directoryPath}\n`);

  const files = fs.readdirSync(directoryPath)
    .filter(f => f.endsWith('.csv'))
    .map(f => path.join(directoryPath, f));

  if (files.length === 0) {
    console.log('❌ No CSV files found in directory');
    return;
  }

  console.log(`Found ${files.length} CSV file(s):\n`);

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const fileName = path.basename(file);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${fileName}`);
    console.log('='.repeat(60));

    try {
      // Extract chapter name from filename (e.g., "Sigma Chi - USC.csv")
      const chapterNameGuess = fileName
        .replace('.csv', '')
        .replace(/_/g, ' ')
        .trim();

      console.log(`🔍 Searching for chapter: "${chapterNameGuess}"`);

      const chapter = await findChapterByName(chapterNameGuess);

      if (!chapter) {
        console.log(`❌ Could not find matching chapter for "${chapterNameGuess}"`);
        console.log(`   Please manually specify chapter or improve filename\n`);
        failCount++;
        continue;
      }

      console.log(`✅ Matched to: ${chapter.chapter_name}`);
      console.log(`   University: ${chapter.universities.name}, ${chapter.universities.state}`);
      console.log(`   Organization: ${chapter.greek_organizations.name}\n`);

      const members = await processCSVFile(file);

      if (members.length === 0) {
        console.log(`⚠️  No valid members found in CSV (check column names)\n`);
        failCount++;
        continue;
      }

      console.log(`Found ${members.length} members in CSV`);

      const success = await uploadRoster(chapter.id, members);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error);
      failCount++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('BULK UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${files.length}`);
  console.log('='.repeat(60));
}

// Main execution
const directoryPath = process.argv[2];

if (!directoryPath) {
  console.log('Usage: node bulk_roster_upload.js <directory_path>');
  console.log('\nExample:');
  console.log('  node bulk_roster_upload.js ./rosters');
  console.log('\nExpected CSV Format:');
  console.log('  - Files should be named after the chapter (e.g., "Sigma Chi - USC.csv")');
  console.log('  - Columns: First Name, Last Name, Email, Phone Number, Role');
  console.log('  - Script will attempt to intelligently map column names');
  process.exit(1);
}

if (!fs.existsSync(directoryPath)) {
  console.error(`❌ Directory not found: ${directoryPath}`);
  process.exit(1);
}

bulkUploadRosters(directoryPath)
  .then(() => {
    console.log('\n✅ Bulk upload complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
