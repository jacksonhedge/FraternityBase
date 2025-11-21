/**
 * Import scraped Sigma Chi roster data to Supabase
 *
 * This script imports member data from JSON files created by scrape-sigma-chi.ts
 * into the FraternityBase database.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ScrapedMember {
  firstName: string;
  lastName: string;
  fullName: string;
  chapterGreekLetters: string;
  memberType: string;
  status: string;
  email: string;
  phone: string;
  // Level 2 fields (when available)
  initiationDate?: string;
  graduationYear?: string;
  birthday?: string;
  cellPhone?: string;
  mailingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  schoolWorkAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

interface ImportOptions {
  filePath: string;
  organizationName: string;
  organizationGreekLetters: string;
  universityName: string;
  universityLocation: string;
  universityState: string;
  chapterName: string;
  dryRun?: boolean;
}

async function ensureGreekOrganization(name: string, greekLetters: string) {
  console.log(`📋 Checking for Greek organization: ${name} (${greekLetters})...`);

  // Check if exists
  const { data: existing, error: fetchError } = await supabase
    .from('greek_organizations')
    .select('id, name, greek_letters')
    .eq('greek_letters', greekLetters)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Error fetching organization: ${fetchError.message}`);
  }

  if (existing) {
    console.log(`✅ Organization exists: ${existing.name} (ID: ${existing.id})`);
    return existing.id;
  }

  // Create new
  console.log(`➕ Creating organization: ${name}...`);
  const { data: newOrg, error: insertError } = await supabase
    .from('greek_organizations')
    .insert({
      name,
      greek_letters: greekLetters,
      organization_type: 'fraternity'
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Error creating organization: ${insertError.message}`);
  }

  console.log(`✅ Created organization with ID: ${newOrg!.id}`);
  return newOrg!.id;
}

async function ensureUniversity(name: string, location: string, state: string) {
  console.log(`🎓 Checking for university: ${name}...`);

  // Check if exists
  const { data: existing, error: fetchError } = await supabase
    .from('universities')
    .select('id, name')
    .eq('name', name)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Error fetching university: ${fetchError.message}`);
  }

  if (existing) {
    console.log(`✅ University exists: ${existing.name} (ID: ${existing.id})`);
    return existing.id;
  }

  // Create new
  console.log(`➕ Creating university: ${name}...`);
  const { data: newUni, error: insertError } = await supabase
    .from('universities')
    .insert({
      name,
      location,
      state
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Error creating university: ${insertError.message}`);
  }

  console.log(`✅ Created university with ID: ${newUni!.id}`);
  return newUni!.id;
}

async function ensureChapter(
  organizationId: string,
  universityId: string,
  chapterName: string,
  greekLetters: string
) {
  console.log(`🏛️  Checking for chapter: ${chapterName}...`);

  // Check if exists
  const { data: existing, error: fetchError } = await supabase
    .from('chapters')
    .select('id, chapter_name, greek_letters')
    .eq('greek_organization_id', organizationId)
    .eq('university_id', universityId)
    .eq('greek_letters', greekLetters)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Error fetching chapter: ${fetchError.message}`);
  }

  if (existing) {
    console.log(`✅ Chapter exists: ${existing.chapter_name} (ID: ${existing.id})`);
    return existing.id;
  }

  // Create new
  console.log(`➕ Creating chapter: ${chapterName}...`);
  const { data: newChapter, error: insertError } = await supabase
    .from('chapters')
    .insert({
      greek_organization_id: organizationId,
      university_id: universityId,
      chapter_name: chapterName,
      greek_letters: greekLetters,
      status: 'active'
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Error creating chapter: ${insertError.message}`);
  }

  console.log(`✅ Created chapter with ID: ${newChapter!.id}`);
  return newChapter!.id;
}

async function importMembers(
  members: ScrapedMember[],
  chapterId: string,
  organizationId: string,
  universityId: string,
  dryRun: boolean = false
) {
  console.log(`\n👥 Importing ${members.length} members...`);

  if (dryRun) {
    console.log(`⚠️  DRY RUN MODE - No data will be written`);
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const member of members) {
    try {
      // Check if member already exists by email or full name
      const { data: existing } = await supabase
        .from('members')
        .select('id, full_name, email')
        .eq('chapter_id', chapterId)
        .or(`full_name.eq.${member.fullName},email.eq.${member.email}`)
        .single();

      if (existing) {
        console.log(`⏭️  Skipping ${member.fullName} - already exists`);
        skipped++;
        continue;
      }

      if (dryRun) {
        console.log(`[DRY RUN] Would import: ${member.fullName}`);
        imported++;
        continue;
      }

      // Map member status correctly
      // Database expects: 'Active Undergrad', 'Active Graduate', 'Alumni', 'Inactive', 'Transferred'
      let memberStatus = 'Active Undergrad'; // Default

      if (member.memberType?.toLowerCase() === 'alumni') {
        memberStatus = 'Alumni';
      } else if (member.memberType?.toLowerCase() === 'undergrad') {
        // Check undergrad FIRST before checking for 'grad' substring
        memberStatus = member.status?.toLowerCase() === 'active' ? 'Active Undergrad' : 'Inactive';
      } else if (member.memberType?.toLowerCase() === 'graduate' || member.memberType?.toLowerCase().includes('grad')) {
        memberStatus = member.status?.toLowerCase() === 'active' ? 'Active Graduate' : 'Inactive';
      } else if (member.status?.toLowerCase() === 'inactive') {
        memberStatus = 'Inactive';
      }

      // Import member
      const { error: insertError } = await supabase
        .from('members')
        .insert({
          first_name: member.firstName,
          last_name: member.lastName,
          full_name: member.fullName,
          email: member.email || null,
          phone: member.phone || null,
          member_status: memberStatus,
          chapter_id: chapterId,
          greek_organization_id: organizationId,
          university_id: universityId,
          graduation_year: member.graduationYear ? parseInt(member.graduationYear) : null,
          initiation_date: member.initiationDate || null
        });

      if (insertError) {
        console.error(`❌ Error importing ${member.fullName}: ${insertError.message}`);
        errors++;
      } else {
        console.log(`✅ Imported: ${member.fullName}`);
        imported++;
      }
    } catch (err) {
      console.error(`❌ Unexpected error for ${member.fullName}:`, err);
      errors++;
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped (duplicates): ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 Total: ${members.length}`);

  return { imported, skipped, errors };
}

async function importRoster(options: ImportOptions) {
  console.log(`\n🎯 Sigma Chi Roster Importer\n`);

  // Read scraped data
  console.log(`📂 Reading data from: ${options.filePath}`);
  const fileContents = fs.readFileSync(options.filePath, 'utf-8');
  const scrapedData = JSON.parse(fileContents);

  // Handle different JSON structures
  let members: ScrapedMember[] = [];
  let extractedChapterName = '';
  let extractedUniversityName = '';

  if (Array.isArray(scrapedData)) {
    // Structure: [{ chapterName, university, members: [...] }]
    const chapterData = scrapedData[0];
    members = chapterData.members || [];
    extractedChapterName = chapterData.chapterName || '';
    extractedUniversityName = chapterData.university || '';
    console.log(`📋 Chapter: ${extractedChapterName || 'Unknown'}`);
    console.log(`🎓 University: ${extractedUniversityName || 'Unknown'}`);
  } else if (scrapedData.members) {
    // Structure: { members: [...] }
    members = scrapedData.members;
  } else if (Array.isArray(scrapedData)) {
    // Structure: [member, member, ...]
    members = scrapedData;
  }

  console.log(`✅ Loaded ${members.length} members from file\n`);

  // Override options with extracted data if available
  if (extractedChapterName) {
    options.chapterName = extractedChapterName;
  }
  if (extractedUniversityName) {
    options.universityName = extractedUniversityName;
  }

  // Ensure organization exists
  const organizationId = await ensureGreekOrganization(
    options.organizationName,
    options.organizationGreekLetters
  );

  // Ensure university exists
  const universityId = await ensureUniversity(
    options.universityName,
    options.universityLocation,
    options.universityState
  );

  // Ensure chapter exists
  const chapterId = await ensureChapter(
    organizationId,
    universityId,
    options.chapterName,
    options.organizationGreekLetters.split(' ')[0] || options.chapterName.split(' ')[0]
  );

  // Import members
  const result = await importMembers(
    members,
    chapterId,
    organizationId,
    universityId,
    options.dryRun
  );

  console.log(`\n✨ Import complete!\n`);
  return result;
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const dryRun = args.includes('--dry-run');

  if (!fileArg) {
    console.log(`
Usage: tsx scripts/import-sigma-chi-roster.ts --file=<json-file> [--dry-run]

Example:
  tsx scripts/import-sigma-chi-roster.ts --file=alpha-chi-full.json
  tsx scripts/import-sigma-chi-roster.ts --file=alpha-chi-full.json --dry-run

Options:
  --file=<path>    Path to JSON file with scraped member data
  --dry-run        Preview import without writing to database
    `);
    process.exit(1);
  }

  const fileName = fileArg.split('=')[1];
  const filePath = path.resolve(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    await importRoster({
      filePath,
      organizationName: 'Sigma Chi',
      organizationGreekLetters: 'ΣΧ',
      universityName: 'Penn State University',
      universityLocation: 'University Park, PA',
      universityState: 'Pennsylvania',
      chapterName: 'Alpha Chi',
      dryRun
    });
  } catch (error) {
    console.error(`\n❌ Import failed:`, error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { importRoster, ImportOptions };
