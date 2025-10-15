/**
 * Import GreekRank Sorority Data
 *
 * This script imports sorority data from the GreekRank scraping dataset.
 * It creates universities, organizations, and chapters with Greek letters.
 *
 * Usage:
 *   npm run import-sororities -- --dry-run    # Test without writing
 *   npm run import-sororities                 # Actually import
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Import statistics
interface ImportStats {
  totalBatches: number;
  universitiesProcessed: number;
  universitiesCreated: number;
  universitiesMatched: number;
  organizationsProcessed: number;
  organizationsCreated: number;
  organizationsMatched: number;
  chaptersProcessed: number;
  chaptersCreated: number;
  chaptersSkipped: number;
  errors: number;
}

const stats: ImportStats = {
  totalBatches: 0,
  universitiesProcessed: 0,
  universitiesCreated: 0,
  universitiesMatched: 0,
  organizationsProcessed: 0,
  organizationsCreated: 0,
  organizationsMatched: 0,
  chaptersProcessed: 0,
  chaptersCreated: 0,
  chaptersSkipped: 0,
  errors: 0
};

// Cache for database lookups
const universityCache = new Map<string, string>(); // normalized name -> uuid
const organizationCache = new Map<string, string>(); // normalized name -> uuid

/**
 * Normalize university name for matching
 */
function normalizeUniversityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/university|college|the|-|,|\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize organization name for matching
 */
function normalizeOrganizationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find or create university
 */
async function findOrCreateUniversity(
  greekrankName: string,
  dryRun: boolean
): Promise<string | null> {
  const normalized = normalizeUniversityName(greekrankName);

  // Check cache
  if (universityCache.has(normalized)) {
    return universityCache.get(normalized)!;
  }

  // Try to find existing university by matching name
  const { data: existingUniversities } = await supabase
    .from('universities')
    .select('id, name');

  if (existingUniversities) {
    for (const uni of existingUniversities) {
      const existingNormalized = normalizeUniversityName(uni.name);
      if (existingNormalized === normalized ||
          existingNormalized.includes(normalized) ||
          normalized.includes(existingNormalized)) {
        console.log(`  ✓ Matched university: "${greekrankName}" → "${uni.name}"`);
        universityCache.set(normalized, uni.id);
        stats.universitiesMatched++;
        return uni.id;
      }
    }
  }

  // Create new university
  if (dryRun) {
    console.log(`  [DRY RUN] Would create university: ${greekrankName}`);
    stats.universitiesCreated++;
    return 'dry-run-uuid';
  }

  // Extract clean name (remove abbreviations in parentheses)
  const cleanName = greekrankName.replace(/\s*-\s*[A-Z]+\s*-\s*$/, '').trim();

  const { data: newUni, error } = await supabase
    .from('universities')
    .insert({
      name: cleanName,
      state: null,
      website: null
    })
    .select('id')
    .single();

  if (error) {
    console.error(`  ✗ Error creating university "${greekrankName}":`, error.message);
    stats.errors++;
    return null;
  }

  console.log(`  ✓ Created university: ${cleanName} (${newUni.id})`);
  universityCache.set(normalized, newUni.id);
  stats.universitiesCreated++;
  return newUni.id;
}

/**
 * Find or create greek organization
 */
async function findOrCreateOrganization(
  name: string,
  greekLetters: string,
  organizationType: string,
  dryRun: boolean
): Promise<string | null> {
  const normalized = normalizeOrganizationName(name);

  // Check cache
  if (organizationCache.has(normalized)) {
    return organizationCache.get(normalized)!;
  }

  // Try to find existing organization
  const { data: existingOrgs } = await supabase
    .from('greek_organizations')
    .select('id, name');

  if (existingOrgs) {
    for (const org of existingOrgs) {
      const existingNormalized = normalizeOrganizationName(org.name);
      if (existingNormalized === normalized) {
        organizationCache.set(normalized, org.id);
        stats.organizationsMatched++;
        return org.id;
      }
    }
  }

  // Create new organization
  if (dryRun) {
    console.log(`  [DRY RUN] Would create organization: ${name} (${greekLetters})`);
    stats.organizationsCreated++;
    return 'dry-run-uuid';
  }

  const { data: newOrg, error} = await supabase
    .from('greek_organizations')
    .insert({
      name: name,
      greek_letters: greekLetters,
      organization_type: organizationType,
      founded_year: null,
      national_website: null
    })
    .select('id')
    .single();

  if (error) {
    console.error(`  ✗ Error creating organization "${name}":`, error.message);
    stats.errors++;
    return null;
  }

  console.log(`  ✓ Created organization: ${name} (${greekLetters}) - ${newOrg.id}`);
  organizationCache.set(normalized, newOrg.id);
  stats.organizationsCreated++;
  return newOrg.id;
}

/**
 * Create chapter
 */
async function createChapter(
  universityId: string,
  organizationId: string,
  organizationName: string,
  greekLetters: string,
  greekrankUrl: string,
  organizationType: string,
  dryRun: boolean
): Promise<boolean> {
  if (dryRun) {
    console.log(`    [DRY RUN] Would create chapter: ${organizationName} (${greekLetters})`);
    stats.chaptersCreated++;
    return true;
  }

  // Check if chapter already exists
  const { data: existing } = await supabase
    .from('chapters')
    .select('id')
    .eq('university_id', universityId)
    .eq('greek_organization_id', organizationId)
    .single();

  if (existing) {
    console.log(`    ⊘ Chapter already exists: ${organizationName}`);
    stats.chaptersSkipped++;
    return false;
  }

  // Create chapter
  const { error } = await supabase
    .from('chapters')
    .insert({
      university_id: universityId,
      greek_organization_id: organizationId,
      chapter_name: organizationName,
      greek_letters: greekLetters,
      greekrank_url: greekrankUrl,
      greekrank_verified: true,
      organization_type: organizationType,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(`    ✗ Error creating chapter:`, error.message);
    stats.errors++;
    return false;
  }

  console.log(`    ✓ Created chapter: ${organizationName} (${greekLetters})`);
  stats.chaptersCreated++;
  return true;
}

/**
 * Process a single batch file
 */
async function processBatch(batchPath: string, dryRun: boolean): Promise<void> {
  const jsonData = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));

  console.log(`\n📦 Batch ${jsonData.batch_number}: ${jsonData.universities_scraped} universities`);

  for (const university of jsonData.universities) {
    // Filter for sororities only
    const sororities = university.greek_organizations.filter(
      (org: any) => org.organization_type === 'sorority'
    );

    if (sororities.length === 0) continue;

    stats.universitiesProcessed++;
    console.log(`\n🏫 ${university.name} (${sororities.length} sororities)`);

    // Find or create university
    const universityId = await findOrCreateUniversity(university.name, dryRun);
    if (!universityId) continue;

    // Process each sorority
    for (const sorority of sororities) {
      stats.chaptersProcessed++;

      // Find or create organization
      const orgId = await findOrCreateOrganization(
        sorority.name,
        sorority.greek_letters,
        'sorority',
        dryRun
      );

      if (!orgId) continue;

      // Create chapter
      await createChapter(
        universityId,
        orgId,
        sorority.name,
        sorority.greek_letters,
        sorority.greekrank_url,
        'sorority',
        dryRun
      );
    }
  }
}

/**
 * Main import function
 */
async function importSororities() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         GreekRank Sorority Import Script                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No data will be written to database');
    console.log();
  }

  const basePath = '/Users/jacksonfitzgerald/Downloads/GreekRank_Scraping_Extracted/GreekRank_Scraping';

  // Check if path exists
  if (!fs.existsSync(basePath)) {
    console.error(`❌ Error: GreekRank data not found at ${basePath}`);
    console.error('Please extract the GreekRank_Scraping.zip file first.');
    process.exit(1);
  }

  // Process all batches
  console.log('📂 Scanning for batch files...\n');

  for (let i = 1; i <= 17; i++) {
    const batchPath = path.join(basePath, `batch_${i}`, `greekrank_batch_${i}.json`);

    if (fs.existsSync(batchPath)) {
      stats.totalBatches++;
      await processBatch(batchPath, dryRun);
    }
  }

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Import Summary                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`📦 Batches processed:        ${stats.totalBatches}`);
  console.log();
  console.log(`🏫 Universities:`);
  console.log(`   - Processed:              ${stats.universitiesProcessed}`);
  console.log(`   - Matched existing:       ${stats.universitiesMatched}`);
  console.log(`   - Created new:            ${stats.universitiesCreated}`);
  console.log();
  console.log(`🏛️  Organizations:`);
  console.log(`   - Processed:              ${stats.organizationsProcessed}`);
  console.log(`   - Matched existing:       ${stats.organizationsMatched}`);
  console.log(`   - Created new:            ${stats.organizationsCreated}`);
  console.log();
  console.log(`📍 Chapters:`);
  console.log(`   - Processed:              ${stats.chaptersProcessed}`);
  console.log(`   - Created new:            ${stats.chaptersCreated}`);
  console.log(`   - Skipped (duplicates):   ${stats.chaptersSkipped}`);
  console.log();
  console.log(`❌ Errors:                   ${stats.errors}`);
  console.log();

  if (dryRun) {
    console.log('⚠️  This was a DRY RUN - no data was written');
    console.log('Run without --dry-run flag to actually import data');
  } else {
    console.log('✅ Import complete!');
  }
}

// Run the import
importSororities()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
