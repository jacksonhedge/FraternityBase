/**
 * Import Instagram Handles from CSV to Supabase
 *
 * Reads the Instagram CSV and updates chapters in Supabase with Instagram handles
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface InstagramRow {
  College: string;
  Fraternity: string;
  'Instagram Handle': string;
  State: string;
  'Instagram URL': string;
  Followers: string;
}

function normalizeInstagramHandle(handle: string): string {
  if (!handle) return '';

  // Remove https://www.instagram.com/ prefix
  handle = handle.replace(/https?:\/\/(www\.)?instagram\.com\//gi, '');

  // Remove trailing slash
  handle = handle.replace(/\/+$/, '');

  // Add @ if not present
  if (handle && !handle.startsWith('@')) {
    handle = '@' + handle;
  }

  return handle.toLowerCase().trim();
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, ''); // Remove special chars except spaces and hyphens
}

async function importInstagramHandles() {
  console.log('📸 Instagram Handle Importer\n');

  // Read CSV
  const csvPath = '/Users/jacksonfitzgerald/Downloads/Instagram FRATS - Instagram_FRATS_Master_GoogleSheets (1).csv';
  console.log(`📂 Reading CSV: ${csvPath}`);

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const rows: InstagramRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`✅ Loaded ${rows.length} rows\n`);

  // Filter rows with Instagram handles
  const rowsWithInstagram = rows.filter(r => r['Instagram Handle'] && r['Instagram Handle'].trim() !== '');
  console.log(`📊 Rows with Instagram: ${rowsWithInstagram.length}\n`);

  // Get all chapters, universities, and organizations from database
  console.log('📥 Fetching data from Supabase...');

  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select(`
      id,
      chapter_name,
      instagram_handle,
      universities!inner(id, name),
      greek_organizations!inner(id, name)
    `);

  if (chaptersError) {
    console.error('❌ Error fetching chapters:', chaptersError);
    return;
  }

  console.log(`✅ Fetched ${chapters?.length || 0} chapters from database\n`);

  // Create lookup maps
  const chapterLookup = new Map();
  chapters?.forEach(chapter => {
    const key = `${normalizeName(chapter.universities.name)}_${normalizeName(chapter.greek_organizations.name)}`;
    chapterLookup.set(key, chapter);
  });

  // Process each row
  let matched = 0;
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  console.log('🔄 Processing Instagram handles...\n');

  for (const row of rowsWithInstagram) {
    const college = normalizeName(row.College);
    const fraternity = normalizeName(row.Fraternity);
    const instagramHandle = normalizeInstagramHandle(row['Instagram Handle']);

    const key = `${college}_${fraternity}`;
    const chapter = chapterLookup.get(key);

    if (chapter) {
      matched++;

      // Skip if already has Instagram handle
      if (chapter.instagram_handle) {
        console.log(`⏭️  ${row.College} - ${row.Fraternity} (already has: ${chapter.instagram_handle})`);
        skipped++;
        continue;
      }

      // Update chapter with Instagram handle
      const { error: updateError } = await supabase
        .from('chapters')
        .update({ instagram_handle: instagramHandle })
        .eq('id', chapter.id);

      if (updateError) {
        console.error(`❌ Error updating ${row.College} - ${row.Fraternity}:`, updateError.message);
      } else {
        console.log(`✅ ${row.College} - ${row.Fraternity} → ${instagramHandle}`);
        updated++;
      }
    } else {
      console.log(`⚠️  Not found: ${row.College} - ${row.Fraternity}`);
      notFound++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Import Summary');
  console.log('='.repeat(80));
  console.log(`Total rows in CSV: ${rows.length}`);
  console.log(`Rows with Instagram: ${rowsWithInstagram.length}`);
  console.log(`✅ Matched in database: ${matched}`);
  console.log(`📝 Updated: ${updated}`);
  console.log(`⏭️  Skipped (already had Instagram): ${skipped}`);
  console.log(`⚠️  Not found in database: ${notFound}`);
  console.log('='.repeat(80));
}

if (require.main === module) {
  importInstagramHandles().catch(console.error);
}

export { importInstagramHandles };
