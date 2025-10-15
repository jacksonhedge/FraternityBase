#!/usr/bin/env tsx
/**
 * Mass Import Chapter Data Script
 *
 * Import chapter roster data from CSV files with flexible column formats.
 * Supports importing by chapter ID OR by university + greek org names.
 *
 * Usage:
 *   npm run mass-import -- --file roster.csv --chapter-id UUID
 *   npm run mass-import -- --file roster.csv --university "Penn State" --org "Sigma Chi"
 *   npm run mass-import -- --file roster.csv --chapter-id UUID --dry-run
 *
 * Features:
 *   - Flexible column name matching (name/first_name, position/title/role, etc.)
 *   - Auto-lookup chapters by university + greek org names
 *   - Data normalization (phone, LinkedIn, Instagram)
 *   - Dry-run mode to preview changes
 *   - Update existing officers (by email) or insert new
 *   - Comprehensive error handling and feedback
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY === 'ADD_YOUR_SERVICE_ROLE_KEY_HERE'
  ? process.env.SUPABASE_ANON_KEY!
  : process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== TYPE DEFINITIONS ====================

interface ImportOptions {
  filePath: string;
  chapterId?: string;
  universityName?: string;
  greekOrgName?: string;
  dryRun: boolean;
}

interface OfficerData {
  name?: string;
  first_name?: string;
  last_name?: string;
  position: string;
  email?: string;
  phone?: string;
  linkedin_profile?: string;
  instagram?: string;
  graduation_year?: number;
  major?: string;
  member_type?: 'officer' | 'member' | 'alumni' | 'advisor';
  is_primary_contact?: boolean;
}

interface ProcessedOfficer {
  chapter_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  position: string;
  email?: string;
  phone?: string;
  linkedin_profile?: string;
  graduation_year?: number;
  major?: string;
  member_type: 'officer' | 'member' | 'alumni' | 'advisor';
  is_primary_contact: boolean;
}

interface ImportStats {
  totalRows: number;
  inserted: number;
  updated: number;
  errors: number;
  errorDetails: Array<{ row: number; error: string }>;
}

// ==================== DATA NORMALIZATION FUNCTIONS ====================

/**
 * Normalize phone number to (XXX) XXX-XXXX format
 */
function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle different formats
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    // Remove leading 1 for US numbers
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // Return original if can't parse
  return phone;
}

/**
 * Normalize LinkedIn URL to full URL format
 */
function normalizeLinkedIn(linkedin: string | undefined): string | undefined {
  if (!linkedin) return undefined;

  const trimmed = linkedin.trim();
  if (!trimmed) return undefined;

  // If already a full URL, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If starts with linkedin.com or www.linkedin.com
  if (trimmed.startsWith('linkedin.com') || trimmed.startsWith('www.linkedin.com')) {
    return `https://${trimmed}`;
  }

  // If just a username or path
  if (trimmed.startsWith('/in/')) {
    return `https://www.linkedin.com${trimmed}`;
  }

  // Assume it's a username
  return `https://www.linkedin.com/in/${trimmed.replace(/^\/+/, '')}`;
}

/**
 * Normalize Instagram handle to @handle format
 */
function normalizeInstagram(instagram: string | undefined): string | undefined {
  if (!instagram) return undefined;

  const trimmed = instagram.trim();
  if (!trimmed) return undefined;

  // Remove URL parts if present
  let handle = trimmed
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/$/, '');

  // Remove @ if present, we'll add it back
  handle = handle.replace(/^@/, '');

  // Add @ prefix
  return `@${handle}`;
}

/**
 * Parse full name into first and last name
 */
function parseName(fullName: string): { first_name?: string; last_name?: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { first_name: parts[0] };

  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' ')
  };
}

// ==================== COLUMN MAPPING ====================

/**
 * Map flexible column names to standardized field names
 */
function mapColumnName(columnName: string): string {
  const normalized = columnName.toLowerCase().trim().replace(/[_\s-]+/g, '_');

  const mappings: Record<string, string> = {
    // Name variations
    'name': 'name',
    'full_name': 'name',
    'fullname': 'name',
    'first_name': 'first_name',
    'firstname': 'first_name',
    'last_name': 'last_name',
    'lastname': 'last_name',

    // Position variations
    'position': 'position',
    'title': 'position',
    'role': 'position',
    'officer_position': 'position',

    // Contact variations
    'email': 'email',
    'email_address': 'email',
    'phone': 'phone',
    'phone_number': 'phone',
    'cell': 'phone',
    'mobile': 'phone',

    // LinkedIn variations
    'linkedin': 'linkedin_profile',
    'linkedin_profile': 'linkedin_profile',
    'linkedin_url': 'linkedin_profile',

    // Instagram variations
    'instagram': 'instagram',
    'instagram_handle': 'instagram',
    'ig': 'instagram',

    // Graduation year variations
    'graduation_year': 'graduation_year',
    'grad_year': 'graduation_year',
    'year': 'graduation_year',
    'class_year': 'graduation_year',

    // Major variations
    'major': 'major',
    'field_of_study': 'major',
    'degree': 'major',

    // Member type variations
    'member_type': 'member_type',
    'type': 'member_type',
    'status': 'member_type',

    // Primary contact variations
    'is_primary_contact': 'is_primary_contact',
    'is_primary': 'is_primary_contact',
    'primary': 'is_primary_contact',
    'primary_contact': 'is_primary_contact',
  };

  return mappings[normalized] || normalized;
}

/**
 * Map CSV row to OfficerData object
 */
function mapRowToOfficer(row: Record<string, any>): OfficerData {
  const mapped: OfficerData = {
    position: '', // Required field
  };

  for (const [key, value] of Object.entries(row)) {
    const mappedKey = mapColumnName(key);
    const stringValue = value?.toString().trim();

    if (!stringValue) continue;

    switch (mappedKey) {
      case 'name':
      case 'first_name':
      case 'last_name':
      case 'position':
      case 'email':
      case 'major':
        mapped[mappedKey] = stringValue;
        break;

      case 'phone':
        mapped.phone = normalizePhone(stringValue);
        break;

      case 'linkedin_profile':
        mapped.linkedin_profile = normalizeLinkedIn(stringValue);
        break;

      case 'instagram':
        mapped.instagram = normalizeInstagram(stringValue);
        break;

      case 'graduation_year':
        const year = parseInt(stringValue);
        if (!isNaN(year) && year >= 2000 && year <= 2050) {
          mapped.graduation_year = year;
        }
        break;

      case 'member_type':
        const lowerType = stringValue.toLowerCase();
        if (['officer', 'member', 'alumni', 'advisor'].includes(lowerType)) {
          mapped.member_type = lowerType as any;
        }
        break;

      case 'is_primary_contact':
        const lowerValue = stringValue.toLowerCase();
        mapped.is_primary_contact = lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
        break;
    }
  }

  return mapped;
}

/**
 * Process and validate officer data
 */
function processOfficer(data: OfficerData, chapterId: string): ProcessedOfficer | null {
  // Determine full name
  let fullName = data.name || '';
  if (!fullName && data.first_name) {
    fullName = data.last_name
      ? `${data.first_name} ${data.last_name}`
      : data.first_name;
  }

  if (!fullName || !data.position) {
    return null; // Name and position are required
  }

  // Parse name if only full name provided
  let firstName = data.first_name;
  let lastName = data.last_name;
  if (!firstName && !lastName && fullName) {
    const parsed = parseName(fullName);
    firstName = parsed.first_name;
    lastName = parsed.last_name;
  }

  return {
    chapter_id: chapterId,
    name: fullName,
    first_name: firstName,
    last_name: lastName,
    position: data.position,
    email: data.email?.toLowerCase(),
    phone: data.phone,
    linkedin_profile: data.linkedin_profile,
    graduation_year: data.graduation_year,
    major: data.major,
    member_type: data.member_type || 'member',
    is_primary_contact: data.is_primary_contact || false,
  };
}

// ==================== CHAPTER LOOKUP ====================

/**
 * Find chapter by ID or by university + greek org name
 */
async function findChapter(options: ImportOptions): Promise<string | null> {
  if (options.chapterId) {
    // Validate chapter exists
    const { data, error } = await supabase
      .from('chapters')
      .select('id')
      .eq('id', options.chapterId)
      .single();

    if (error || !data) {
      console.error(`❌ Chapter with ID ${options.chapterId} not found`);
      return null;
    }

    return options.chapterId;
  }

  if (options.universityName && options.greekOrgName) {
    // Find university
    const { data: university, error: uniError } = await supabase
      .from('universities')
      .select('id, name')
      .ilike('name', `%${options.universityName}%`)
      .single();

    if (uniError || !university) {
      console.error(`❌ University matching "${options.universityName}" not found`);
      console.log('\n💡 Try running this query to find universities:');
      console.log(`   SELECT id, name FROM universities WHERE name ILIKE '%${options.universityName}%';`);
      return null;
    }

    // Find greek organization
    const { data: greekOrg, error: orgError } = await supabase
      .from('greek_organizations')
      .select('id, name')
      .ilike('name', `%${options.greekOrgName}%`)
      .single();

    if (orgError || !greekOrg) {
      console.error(`❌ Greek organization matching "${options.greekOrgName}" not found`);
      console.log('\n💡 Try running this query to find organizations:');
      console.log(`   SELECT id, name FROM greek_organizations WHERE name ILIKE '%${options.greekOrgName}%';`);
      return null;
    }

    // Find chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, chapter_name')
      .eq('university_id', university.id)
      .eq('greek_organization_id', greekOrg.id)
      .single();

    if (chapterError || !chapter) {
      console.error(`❌ Chapter not found for ${greekOrg.name} at ${university.name}`);
      console.log('\n💡 This chapter may need to be created first.');
      return null;
    }

    console.log(`✓ Found chapter: ${greekOrg.name} at ${university.name} (${chapter.chapter_name})`);
    return chapter.id;
  }

  console.error('❌ Must provide either --chapter-id or both --university and --org');
  return null;
}

// ==================== IMPORT LOGIC ====================

/**
 * Import officers from CSV file
 */
async function importOfficers(
  officers: ProcessedOfficer[],
  dryRun: boolean
): Promise<ImportStats> {
  const stats: ImportStats = {
    totalRows: officers.length,
    inserted: 0,
    updated: 0,
    errors: 0,
    errorDetails: [],
  };

  for (let i = 0; i < officers.length; i++) {
    const officer = officers[i];

    try {
      if (dryRun) {
        console.log(`\n[DRY RUN] Row ${i + 1}:`);
        console.log(`  Name: ${officer.name}`);
        console.log(`  Position: ${officer.position}`);
        console.log(`  Email: ${officer.email || '(none)'}`);
        console.log(`  Phone: ${officer.phone || '(none)'}`);
        console.log(`  LinkedIn: ${officer.linkedin_profile || '(none)'}`);
        stats.inserted++;
        continue;
      }

      // Check if officer exists (by email if provided)
      if (officer.email) {
        const { data: existing } = await supabase
          .from('chapter_officers')
          .select('id')
          .eq('chapter_id', officer.chapter_id)
          .eq('email', officer.email)
          .single();

        if (existing) {
          // Update existing officer
          const { error } = await supabase
            .from('chapter_officers')
            .update({
              name: officer.name,
              first_name: officer.first_name,
              last_name: officer.last_name,
              position: officer.position,
              phone: officer.phone,
              linkedin_profile: officer.linkedin_profile,
              graduation_year: officer.graduation_year,
              major: officer.major,
              member_type: officer.member_type,
              is_primary_contact: officer.is_primary_contact,
            })
            .eq('id', existing.id);

          if (error) throw error;
          stats.updated++;
          console.log(`  ↻ Updated: ${officer.name} (${officer.email})`);
          continue;
        }
      }

      // Insert new officer
      const { error } = await supabase
        .from('chapter_officers')
        .insert(officer);

      if (error) throw error;
      stats.inserted++;
      console.log(`  + Inserted: ${officer.name}`);

    } catch (error: any) {
      stats.errors++;
      const errorMsg = error.message || String(error);
      stats.errorDetails.push({ row: i + 1, error: errorMsg });
      console.error(`  ✗ Error row ${i + 1}: ${errorMsg}`);
    }
  }

  return stats;
}

/**
 * Main import function
 */
async function runImport(options: ImportOptions) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 MASS IMPORT CHAPTER DATA');
  console.log('='.repeat(70));

  if (options.dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No data will be written to database\n');
  }

  // 1. Validate file exists
  if (!fs.existsSync(options.filePath)) {
    console.error(`❌ File not found: ${options.filePath}`);
    process.exit(1);
  }

  console.log(`📄 File: ${options.filePath}`);

  // 2. Find chapter
  const chapterId = await findChapter(options);
  if (!chapterId) {
    process.exit(1);
  }

  console.log(`🎯 Chapter ID: ${chapterId}`);

  // 3. Read and parse CSV
  console.log('\n📖 Reading CSV file...');
  const fileContent = fs.readFileSync(options.filePath, 'utf-8');

  let rows: Record<string, any>[];
  try {
    rows = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error: any) {
    console.error(`❌ Failed to parse CSV: ${error.message}`);
    process.exit(1);
  }

  console.log(`✓ Found ${rows.length} rows\n`);

  if (rows.length === 0) {
    console.log('⚠️  No data rows found in CSV');
    process.exit(0);
  }

  // 4. Show detected columns
  const columns = Object.keys(rows[0]);
  console.log('📋 Detected columns:');
  columns.forEach(col => {
    const mapped = mapColumnName(col);
    if (mapped !== col.toLowerCase().replace(/[_\s-]+/g, '_')) {
      console.log(`  - ${col} → ${mapped}`);
    } else {
      console.log(`  - ${col}`);
    }
  });

  // 5. Process rows
  console.log(`\n⚙️  Processing ${rows.length} rows...`);
  const processedOfficers: ProcessedOfficer[] = [];

  for (let i = 0; i < rows.length; i++) {
    const mapped = mapRowToOfficer(rows[i]);
    const processed = processOfficer(mapped, chapterId);

    if (processed) {
      processedOfficers.push(processed);
    } else {
      console.warn(`⚠️  Row ${i + 1}: Missing required fields (name or position)`);
    }
  }

  console.log(`✓ Successfully processed ${processedOfficers.length}/${rows.length} rows\n`);

  if (processedOfficers.length === 0) {
    console.log('❌ No valid rows to import');
    process.exit(1);
  }

  // 6. Import to database
  console.log('='.repeat(70));
  console.log(options.dryRun ? '🔍 DRY RUN PREVIEW' : '💾 IMPORTING TO DATABASE');
  console.log('='.repeat(70) + '\n');

  const stats = await importOfficers(processedOfficers, options.dryRun);

  // 7. Show summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total rows:        ${stats.totalRows}`);
  console.log(`✓ Inserted:        ${stats.inserted}`);
  console.log(`↻ Updated:         ${stats.updated}`);
  console.log(`✗ Errors:          ${stats.errors}`);
  console.log('='.repeat(70));

  if (stats.errorDetails.length > 0) {
    console.log('\n❌ ERRORS:\n');
    stats.errorDetails.slice(0, 10).forEach(({ row, error }) => {
      console.log(`  Row ${row}: ${error}`);
    });
    if (stats.errorDetails.length > 10) {
      console.log(`  ... and ${stats.errorDetails.length - 10} more errors`);
    }
  }

  if (options.dryRun) {
    console.log('\n⚠️  This was a dry run. Run without --dry-run to actually import data.\n');
  } else {
    console.log('\n✅ Import complete!\n');
  }
}

// ==================== CLI ARGUMENT PARSING ====================

function parseArgs(): ImportOptions | null {
  const args = process.argv.slice(2);
  const options: Partial<ImportOptions> = {
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--file':
      case '-f':
        options.filePath = args[++i];
        break;

      case '--chapter-id':
      case '--chapter':
      case '-c':
        options.chapterId = args[++i];
        break;

      case '--university':
      case '--uni':
      case '-u':
        options.universityName = args[++i];
        break;

      case '--org':
      case '--organization':
      case '-o':
        options.greekOrgName = args[++i];
        break;

      case '--dry-run':
      case '--preview':
      case '-d':
        options.dryRun = true;
        break;

      case '--help':
      case '-h':
        printHelp();
        return null;

      default:
        console.error(`❌ Unknown argument: ${arg}`);
        printHelp();
        return null;
    }
  }

  // Validate required options
  if (!options.filePath) {
    console.error('❌ Missing required argument: --file');
    printHelp();
    return null;
  }

  if (!options.chapterId && (!options.universityName || !options.greekOrgName)) {
    console.error('❌ Must provide either --chapter-id or both --university and --org');
    printHelp();
    return null;
  }

  return options as ImportOptions;
}

function printHelp() {
  console.log(`
📊 Mass Import Chapter Data

Import chapter roster data from CSV files with flexible column formats.

USAGE:
  npm run mass-import -- [OPTIONS]

OPTIONS:
  --file, -f <path>           CSV file to import (required)
  --chapter-id, -c <uuid>     Chapter UUID (either this or university + org)
  --university, -u <name>     University name (partial match OK)
  --org, -o <name>            Greek organization name (partial match OK)
  --dry-run, -d               Preview changes without importing
  --help, -h                  Show this help message

EXAMPLES:
  # Import by chapter ID
  npm run mass-import -- --file roster.csv --chapter-id abc-123-def

  # Import by university and organization names
  npm run mass-import -- --file roster.csv --university "Penn State" --org "Sigma Chi"

  # Dry run to preview
  npm run mass-import -- --file roster.csv --chapter-id abc-123-def --dry-run

SUPPORTED CSV COLUMNS:
  Name:           name, full_name, first_name, last_name
  Position:       position, title, role
  Email:          email, email_address
  Phone:          phone, phone_number, cell, mobile
  LinkedIn:       linkedin, linkedin_profile, linkedin_url
  Instagram:      instagram, instagram_handle, ig
  Grad Year:      graduation_year, grad_year, year
  Major:          major, field_of_study
  Member Type:    member_type, type (officer/member/alumni/advisor)
  Primary:        is_primary_contact, is_primary, primary

DATA NORMALIZATION:
  - Phone numbers → (XXX) XXX-XXXX
  - LinkedIn URLs → https://www.linkedin.com/in/...
  - Instagram → @handle
  - Email addresses are used for deduplication (updates existing records)

For more information, see CSV_UPLOAD_README.md
`);
}

// ==================== MAIN EXECUTION ====================

async function main() {
  const options = parseArgs();

  if (!options) {
    process.exit(1);
  }

  try {
    await runImport(options);
    process.exit(0);
  } catch (error: any) {
    console.error('\n💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { runImport, ImportOptions };
