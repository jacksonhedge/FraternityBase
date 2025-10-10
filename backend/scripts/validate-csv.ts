#!/usr/bin/env tsx
/**
 * CSV Validation Script
 *
 * Validates CSV files before uploading to ensure they meet FraternityBase requirements.
 * Catches common errors and provides helpful feedback.
 *
 * Usage:
 *   npx tsx scripts/validate-csv.ts <file.csv> <type>
 *
 * Types:
 *   roster    - Chapter roster (officers/members)
 *   chapters  - Chapters
 *   universities - Universities
 *   greek-orgs   - Greek organizations
 *
 * Example:
 *   npx tsx scripts/validate-csv.ts roster.csv roster
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

// Field definitions for each upload type
const SCHEMAS = {
  roster: {
    required: ['name'],
    optional: ['position', 'email', 'phone', 'linkedin', 'graduation_year', 'major', 'member_type', 'is_primary_contact'],
    enums: {
      member_type: ['member', 'officer', 'alumni', 'advisor']
    },
    booleans: ['is_primary_contact']
  },
  chapters: {
    required: ['chapter_name', 'university_id', 'greek_organization_id'],
    optional: ['grade', 'member_count', 'officer_count', 'status', 'instagram_handle', 'facebook_page', 'website', 'contact_email', 'phone', 'house_address'],
    enums: {
      status: ['active', 'inactive', 'suspended', 'colony']
    },
    numeric: {
      grade: { min: 0.0, max: 5.0 }
    }
  },
  universities: {
    required: ['name'],
    optional: ['location', 'state', 'student_count', 'greek_percentage', 'website', 'logo_url', 'bars_nearby', 'conference'],
    numeric: {
      greek_percentage: { min: 0.0, max: 1.0 }
    }
  },
  'greek-orgs': {
    required: ['name', 'greek_letters'],
    optional: ['organization_type', 'founded_year', 'national_website', 'total_chapters', 'total_members', 'colors', 'symbols', 'philanthropy'],
    enums: {
      organization_type: ['fraternity', 'sorority', 'honor_society']
    }
  }
};

function validateCSV(filePath: string, type: keyof typeof SCHEMAS): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: []
  };

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    result.valid = false;
    result.errors.push(`File not found: ${filePath}`);
    return result;
  }

  // Read file
  const content = fs.readFileSync(filePath, 'utf-8');

  if (!content.trim()) {
    result.valid = false;
    result.errors.push('File is empty');
    return result;
  }

  // Parse CSV
  let records: any[];
  try {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch (error: any) {
    result.valid = false;
    result.errors.push(`CSV parse error: ${error.message}`);
    return result;
  }

  if (records.length === 0) {
    result.valid = false;
    result.errors.push('No data rows found (only header?)');
    return result;
  }

  result.info.push(`${records.length} records found`);

  // Get schema for this type
  const schema = SCHEMAS[type];
  const columns = Object.keys(records[0]);

  // Check required fields
  const missingRequired = schema.required.filter(field =>
    !columns.some(col => col.toLowerCase() === field.toLowerCase())
  );

  if (missingRequired.length > 0) {
    result.valid = false;
    result.errors.push(`Missing required columns: ${missingRequired.join(', ')}`);
  }

  // Check for unknown columns
  const allExpected = [...schema.required, ...(schema.optional || [])];
  const unknownColumns = columns.filter(col =>
    !allExpected.some(field => field.toLowerCase() === col.toLowerCase())
  );

  if (unknownColumns.length > 0) {
    result.warnings.push(`Unknown columns (will be ignored): ${unknownColumns.join(', ')}`);
  }

  // Validate each record
  let emptyRequired = 0;
  let invalidEnums = 0;
  let invalidNumeric = 0;
  let invalidBooleans = 0;
  let missingEmails = 0;

  records.forEach((record, index) => {
    const rowNum = index + 2; // +2 for header and 0-index

    // Check required fields are not empty
    schema.required.forEach(field => {
      const value = record[field] || record[field.toLowerCase()] || record[field.toUpperCase()];
      if (!value || value.trim() === '') {
        emptyRequired++;
        result.errors.push(`Row ${rowNum}: Required field '${field}' is empty`);
      }
    });

    // Check enum values
    if (schema.enums) {
      Object.entries(schema.enums).forEach(([field, allowedValues]) => {
        const value = record[field] || record[field.toLowerCase()] || record[field.toUpperCase()];
        if (value && !allowedValues.includes(value)) {
          invalidEnums++;
          result.warnings.push(`Row ${rowNum}: '${field}' value '${value}' not in allowed: ${allowedValues.join(', ')}`);
        }
      });
    }

    // Check numeric ranges
    if (schema.numeric) {
      Object.entries(schema.numeric).forEach(([field, range]) => {
        const value = record[field] || record[field.toLowerCase()] || record[field.toUpperCase()];
        if (value) {
          const num = parseFloat(value);
          if (isNaN(num)) {
            invalidNumeric++;
            result.errors.push(`Row ${rowNum}: '${field}' value '${value}' is not a number`);
          } else if (num < range.min || num > range.max) {
            invalidNumeric++;
            result.errors.push(`Row ${rowNum}: '${field}' value ${num} outside range ${range.min}-${range.max}`);
          }
        }
      });
    }

    // Check booleans
    if (schema.booleans) {
      schema.booleans.forEach(field => {
        const value = record[field] || record[field.toLowerCase()] || record[field.toUpperCase()];
        if (value && value !== 'true' && value !== 'false') {
          invalidBooleans++;
          result.warnings.push(`Row ${rowNum}: '${field}' should be 'true' or 'false', got '${value}'`);
        }
      });
    }

    // Type-specific warnings
    if (type === 'roster') {
      const email = record.email || record.Email || record.EMAIL;
      if (!email || email.trim() === '') {
        missingEmails++;
      }
    }
  });

  // Summary warnings
  if (missingEmails > 0 && type === 'roster') {
    result.warnings.push(`${missingEmails} records missing email (will not be deduplicated on update)`);
  }

  if (emptyRequired > 0) {
    result.valid = false;
    result.info.push(`${emptyRequired} rows have empty required fields`);
  }

  if (invalidEnums > 0) {
    result.info.push(`${invalidEnums} rows have non-standard enum values`);
  }

  if (invalidNumeric > 0) {
    result.valid = false;
    result.info.push(`${invalidNumeric} rows have invalid numeric values`);
  }

  if (invalidBooleans > 0) {
    result.info.push(`${invalidBooleans} rows have non-standard boolean values`);
  }

  // File encoding check
  if (content.includes('�') || content.includes('\ufffd')) {
    result.warnings.push('File may have encoding issues. Save as UTF-8.');
  }

  return result;
}

function printResult(result: ValidationResult, filePath: string, type: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}CSV Validation Report${colors.reset}`);
  console.log('='.repeat(70));
  console.log(`File: ${filePath}`);
  console.log(`Type: ${type}`);
  console.log('='.repeat(70));

  // Info
  if (result.info.length > 0) {
    console.log(`\n${colors.blue}ℹ  Info:${colors.reset}`);
    result.info.forEach(msg => console.log(`   ${msg}`));
  }

  // Warnings
  if (result.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠  Warnings:${colors.reset}`);
    result.warnings.forEach(msg => console.log(`   ${msg}`));
  }

  // Errors
  if (result.errors.length > 0) {
    console.log(`\n${colors.red}✗ Errors:${colors.reset}`);
    result.errors.forEach(msg => console.log(`   ${msg}`));
  }

  // Final verdict
  console.log('\n' + '='.repeat(70));
  if (result.valid) {
    console.log(`${colors.green}✓ CSV is valid and ready to upload!${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ CSV has errors. Please fix before uploading.${colors.reset}`);
  }
  console.log('='.repeat(70) + '\n');
}

// Main
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
${colors.cyan}CSV Validation Tool${colors.reset}

Usage: npx tsx scripts/validate-csv.ts <file.csv> <type>

Types:
  roster       - Chapter roster (officers/members)
  chapters     - Chapters
  universities - Universities
  greek-orgs   - Greek organizations

Examples:
  npx tsx scripts/validate-csv.ts roster.csv roster
  npx tsx scripts/validate-csv.ts universities.csv universities
  npx tsx scripts/validate-csv.ts chapters.csv chapters

This will check:
  ✓ Required columns present
  ✓ No empty required fields
  ✓ Enum values valid
  ✓ Numeric ranges correct
  ✓ File encoding (UTF-8)
  ✓ Common mistakes
`);
    process.exit(1);
  }

  const filePath = args[0];
  const type = args[1] as keyof typeof SCHEMAS;

  if (!SCHEMAS[type]) {
    console.error(`${colors.red}Error: Invalid type '${type}'${colors.reset}`);
    console.error(`Valid types: ${Object.keys(SCHEMAS).join(', ')}`);
    process.exit(1);
  }

  const result = validateCSV(filePath, type);
  printResult(result, filePath, type);

  process.exit(result.valid ? 0 : 1);
}

main();
