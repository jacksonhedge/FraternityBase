import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvsawtexgpopqxgaqyxg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Clean Instagram handle
function cleanInstagramHandle(handle) {
  if (!handle || handle === 'N/A' || handle === '///') return null;

  // Remove @ if present
  handle = handle.replace(/^@/, '');

  // If it's a URL, extract the username
  if (handle.includes('instagram.com/')) {
    const match = handle.match(/instagram\.com\/([^/?#]+)/);
    if (match) handle = match[1];
  }

  // Remove trailing slashes and query params
  handle = handle.split('/')[0].split('?')[0];

  // Remove spaces
  handle = handle.trim().replace(/\s+/g, '');

  return handle || null;
}

// Normalize university name for matching
function normalizeUniversityName(name) {
  return name
    .toLowerCase()
    .replace(/university of /gi, '')
    .replace(/ university$/gi, '')
    .replace(/state university/gi, 'state')
    .replace(/[^a-z0-9]/g, '');
}

// Normalize fraternity name for matching
function normalizeFraternityName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log('📸 Starting Instagram handle import...\n');

  // Read CSV file
  const csvPath = '/Users/jacksonfitzgerald/Downloads/Instagram FRATS - Power 5.csv';
  const fileContent = fs.readFileSync(csvPath, 'utf-8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`Found ${records.length} rows in CSV\n`);

  // Get all chapters from database - fetch in batches to avoid limits
  let allChapters = [];
  let offset = 0;
  const batchSize = 1000;

  while (true) {
    const { data: batch, error: batchError } = await supabase
      .from('chapters')
      .select(`
        id,
        chapter_name,
        instagram_handle,
        greek_organization_id,
        university_id,
        greek_organizations(name),
        universities(name)
      `)
      .eq('status', 'active')
      .range(offset, offset + batchSize - 1);

    if (batchError) {
      console.error('❌ Error fetching chapters:', batchError);
      return;
    }

    if (!batch || batch.length === 0) break;

    allChapters = allChapters.concat(batch);
    console.log(`Fetched ${allChapters.length} chapters so far...`);

    if (batch.length < batchSize) break;
    offset += batchSize;
  }

  const chapters = allChapters;

  console.log(`\nFound ${chapters.length} active chapters in database\n`);

  // Create lookup maps
  const chapterMap = new Map();
  chapters.forEach(chapter => {
    const universityName = normalizeUniversityName(chapter.universities?.name || '');
    const fraternityName = normalizeFraternityName(chapter.greek_organizations?.name || '');
    const key = `${universityName}|${fraternityName}`;
    chapterMap.set(key, chapter);
  });

  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  let errors = 0;

  for (const record of records) {
    const universityName = normalizeUniversityName(record.College);
    const fraternityName = normalizeFraternityName(record.Fraternity);
    const instagramHandle = cleanInstagramHandle(record['Instagram Handle']);

    if (!instagramHandle) {
      skipped++;
      continue;
    }

    const key = `${universityName}|${fraternityName}`;
    const chapter = chapterMap.get(key);

    if (!chapter) {
      console.log(`⚠️  Not found: ${record.College} - ${record.Fraternity}`);
      notFound++;
      continue;
    }

    // Skip if already has Instagram handle
    if (chapter.instagram_handle) {
      skipped++;
      continue;
    }

    // Update the chapter
    const { error: updateError } = await supabase
      .from('chapters')
      .update({ instagram_handle: instagramHandle })
      .eq('id', chapter.id);

    if (updateError) {
      console.log(`❌ Error updating ${record.College} - ${record.Fraternity}: ${updateError.message}`);
      errors++;
    } else {
      console.log(`✅ Updated: ${record.College} - ${record.Fraternity} -> @${instagramHandle}`);
      updated++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped (N/A or already has handle): ${skipped}`);
  console.log(`⚠️  Not found in database: ${notFound}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📝 Total rows: ${records.length}`);
}

main().catch(console.error);
