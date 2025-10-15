# Mass Import Chapter Data - Quick Start Guide

## Overview

The mass import script allows you to bulk import chapter officer and member data from CSV files with **flexible column formats**. It automatically normalizes data (phone numbers, LinkedIn URLs, Instagram handles) and intelligently updates existing records based on email addresses.

## Quick Start (3 Steps)

### 1. Prepare Your CSV File

You can use **any column names** - the script will intelligently map them:

```csv
Full Name,Title,Email Address,Cell,LinkedIn,Grad Year,Major
Tyler Alesse,President,tyler@example.edu,8145551234,tyleralesse,2026,Business
John Smith,VP Finance,john@example.edu,(814) 555-5678,linkedin.com/in/john,2026,Accounting
```

**Supported column name variations:**
- **Name**: `name`, `full_name`, `first_name`, `last_name`
- **Position**: `position`, `title`, `role`, `officer_position`
- **Email**: `email`, `email_address`
- **Phone**: `phone`, `phone_number`, `cell`, `mobile`
- **LinkedIn**: `linkedin`, `linkedin_profile`, `linkedin_url`
- **Instagram**: `instagram`, `instagram_handle`, `ig`
- **Graduation Year**: `graduation_year`, `grad_year`, `year`
- **Major**: `major`, `field_of_study`, `degree`
- **Member Type**: `member_type`, `type` (officer/member/alumni/advisor)
- **Primary Contact**: `is_primary_contact`, `is_primary`, `primary`

### 2. Run a Dry Run (Preview Changes)

```bash
cd backend
npm run mass-import -- --file path/to/roster.csv --chapter-id YOUR_CHAPTER_UUID --dry-run
```

This will show you exactly what will be imported **without making any changes**.

### 3. Import the Data

If the dry run looks good, remove `--dry-run`:

```bash
npm run mass-import -- --file path/to/roster.csv --chapter-id YOUR_CHAPTER_UUID
```

---

## Usage Examples

### Example 1: Import by Chapter ID (Recommended)

```bash
npm run mass-import -- \
  --file rosters/sigma-chi-psu.csv \
  --chapter-id "9d47d8da-15c3-4cda-bb6c-61d20174776d"
```

### Example 2: Import by University + Organization Name

```bash
npm run mass-import -- \
  --file rosters/sigma-chi-psu.csv \
  --university "Pennsylvania State University" \
  --org "Sigma Chi"
```

**Note**: University and org names use partial matching, so you can use:
- "Penn State" instead of "Pennsylvania State University"
- "Sigma Chi" (will find exact match)

### Example 3: Dry Run First (Always Recommended)

```bash
# Preview what will be imported
npm run mass-import -- \
  --file roster.csv \
  --chapter-id "abc-123-def" \
  --dry-run

# If it looks good, import for real
npm run mass-import -- \
  --file roster.csv \
  --chapter-id "abc-123-def"
```

---

## Command Options

### Required Options

**Must provide ONE of:**
- `--file, -f <path>` - Path to CSV file (required)

**AND ONE of:**
- `--chapter-id, -c <uuid>` - Direct chapter UUID
- `--university, -u <name>` + `--org, -o <name>` - Lookup by names

### Optional Options

- `--dry-run, -d` - Preview changes without importing
- `--help, -h` - Show help message

---

## Data Normalization (Automatic)

The script automatically cleans and formats data:

### Phone Numbers
**Input formats accepted:**
```
8145551234
814-555-1234
(814)555-1234
814.555.1234
1-814-555-1234
```

**Standardized output:**
```
(814) 555-1234
```

### LinkedIn URLs
**Input formats accepted:**
```
tyleralesse
linkedin.com/in/tyleralesse
/in/tyleralesse
https://linkedin.com/in/tyleralesse
https://www.linkedin.com/in/tyleralesse
```

**Standardized output:**
```
https://www.linkedin.com/in/tyleralesse
```

### Instagram Handles
**Input formats accepted:**
```
psusigmachi
@psusigmachi
instagram.com/psusigmachi
https://www.instagram.com/psusigmachi
```

**Standardized output:**
```
@psusigmachi
```

---

## Smart Deduplication

The script uses **email addresses** to prevent duplicates:

- **If email exists**: Updates the existing officer record
- **If email is new**: Inserts a new officer record
- **If no email provided**: Always inserts (may create duplicates)

**Recommendation**: Always include email addresses to enable smart updates!

---

## Finding Chapter IDs

### Method 1: Admin Panel
Visit your admin panel and navigate to the chapter details page. The UUID is in the URL.

### Method 2: Database Query
```sql
-- Find chapter by university and organization
SELECT
  c.id,
  c.chapter_name,
  u.name as university,
  g.name as organization
FROM chapters c
JOIN universities u ON u.id = c.university_id
JOIN greek_organizations g ON g.id = c.greek_organization_id
WHERE u.name ILIKE '%Penn State%'
  AND g.name ILIKE '%Sigma Chi%';
```

### Method 3: List All Chapters
```sql
SELECT c.id, c.chapter_name, u.name as university, g.name as org
FROM chapters c
JOIN universities u ON u.id = c.university_id
JOIN greek_organizations g ON g.id = c.greek_organization_id
ORDER BY u.name, g.name;
```

---

## Sample CSV Templates

### Minimal Template (Name + Position Only)
```csv
name,position
Tyler Alesse,President
John Smith,Vice President
Sarah Johnson,Treasurer
```

### Standard Template (Recommended)
```csv
name,position,email,phone,graduation_year,member_type
Tyler Alesse,President,tyler@psu.edu,8145551234,2026,officer
John Smith,VP Finance,john@psu.edu,8145555678,2026,officer
Sarah Johnson,Social Chair,sarah@psu.edu,8145559012,2025,officer
Michael Chen,Member,michael@psu.edu,,2027,member
```

### Complete Template (All Fields)
```csv
name,position,email,phone,linkedin,instagram,graduation_year,major,member_type,is_primary_contact
Tyler Alesse,President,tyler@psu.edu,8145551234,tyleralesse,@tyleralesse,2026,Business,officer,true
John Smith,VP Finance,john@psu.edu,8145555678,johnsmith,,2026,Accounting,officer,false
```

### Flexible Format Example (Different Column Names)
```csv
Full Name,Title,Email Address,Cell Phone,LinkedIn Profile,Grad Year,Field of Study,Type
Tyler Alesse,President,tyler@psu.edu,(814) 555-1234,linkedin.com/in/tyler,2026,Business Administration,officer
John Smith,VP Finance,john@psu.edu,814-555-5678,https://linkedin.com/in/john,2026,Accounting,officer
```

**All of these formats work!** The script intelligently maps column names.

---

## Output Example

```
======================================================================
📊 MASS IMPORT CHAPTER DATA
======================================================================

📄 File: rosters/sigma-chi-psu.csv
🎯 Chapter ID: 9d47d8da-15c3-4cda-bb6c-61d20174776d

📖 Reading CSV file...
✓ Found 50 rows

📋 Detected columns:
  - Full Name → name
  - Title → position
  - Email Address → email
  - Cell → phone
  - LinkedIn → linkedin_profile

⚙️  Processing 50 rows...
✓ Successfully processed 50/50 rows

======================================================================
💾 IMPORTING TO DATABASE
======================================================================

  + Inserted: Tyler Alesse
  + Inserted: John Smith
  ↻ Updated: Sarah Johnson (sarah@psu.edu)
  + Inserted: Michael Chen
  ...

======================================================================
📊 IMPORT SUMMARY
======================================================================
Total rows:        50
✓ Inserted:        42
↻ Updated:         8
✗ Errors:          0
======================================================================

✅ Import complete!
```

---

## Error Handling

### Common Errors and Solutions

#### Error: "Chapter with ID ... not found"
**Solution**: Verify the chapter ID is correct or use university + org name instead.

#### Error: "University matching ... not found"
**Solution**:
1. Use more specific name: "Pennsylvania State University" instead of "PSU"
2. Or get exact name from database:
   ```sql
   SELECT id, name FROM universities WHERE name ILIKE '%Penn%';
   ```

#### Error: "Missing required fields (name or position)"
**Solution**: Ensure your CSV has at minimum:
- A name column (any variation: name, full_name, etc.)
- A position column (any variation: position, title, role, etc.)

#### Warning: "Row X: Missing email (will not be deduplicated)"
**Not an error** - just means if you re-import, this person might be duplicated.
**Solution**: Add email addresses to enable smart updates.

---

## Best Practices

### 1. Always Dry Run First
```bash
# Preview first
npm run mass-import -- --file roster.csv --chapter-id abc-123 --dry-run

# Then import
npm run mass-import -- --file roster.csv --chapter-id abc-123
```

### 2. Include Email Addresses
Enables smart updates and prevents duplicates on re-import.

### 3. Use UTF-8 Encoding
Save CSVs as "CSV UTF-8" in Excel to preserve special characters.

### 4. Test with Small Batch
Import 5-10 rows first to verify, then import the full roster.

### 5. Keep Backups
Save original CSVs before importing in case you need to rollback.

### 6. Verify After Import
```sql
SELECT COUNT(*) FROM chapter_officers WHERE chapter_id = 'YOUR_CHAPTER_ID';
```

---

## Workflow Example

Here's a complete workflow for importing a new chapter roster:

```bash
# 1. Find the chapter ID
psql -d your_db -c "
  SELECT c.id, g.name, u.name
  FROM chapters c
  JOIN greek_organizations g ON g.id = c.greek_organization_id
  JOIN universities u ON u.id = c.university_id
  WHERE u.name ILIKE '%Penn State%' AND g.name ILIKE '%Sigma Chi%';
"
# Result: Chapter ID = 9d47d8da-15c3-4cda-bb6c-61d20174776d

# 2. Prepare CSV file
# Save your roster as rosters/sigma-chi-psu.csv
# Columns: Full Name, Title, Email, Phone, LinkedIn, Grad Year, Major

# 3. Dry run to preview
cd backend
npm run mass-import -- \
  --file ../rosters/sigma-chi-psu.csv \
  --chapter-id "9d47d8da-15c3-4cda-bb6c-61d20174776d" \
  --dry-run

# 4. Review output, verify column mapping looks correct

# 5. Import for real
npm run mass-import -- \
  --file ../rosters/sigma-chi-psu.csv \
  --chapter-id "9d47d8da-15c3-4cda-bb6c-61d20174776d"

# 6. Verify in database
psql -d your_db -c "
  SELECT COUNT(*) FROM chapter_officers
  WHERE chapter_id = '9d47d8da-15c3-4cda-bb6c-61d20174776d';
"

# 7. Check a sample record
psql -d your_db -c "
  SELECT name, position, email, phone
  FROM chapter_officers
  WHERE chapter_id = '9d47d8da-15c3-4cda-bb6c-61d20174776d'
  LIMIT 3;
"
```

---

## Advanced Usage

### Re-importing to Update Data

If you need to update officer information (e.g., new phone numbers, positions changed):

1. Export current roster with email addresses
2. Update the fields you want to change
3. Re-import - **existing officers will be updated** based on email

```bash
# Officers with matching emails will be updated
# New officers will be inserted
npm run mass-import -- --file updated-roster.csv --chapter-id abc-123
```

### Importing Multiple Chapters

Create a script to batch import:

```bash
#!/bin/bash

# Import rosters for multiple chapters
npm run mass-import -- --file rosters/sigma-chi-psu.csv --chapter-id "id-1"
npm run mass-import -- --file rosters/sigma-chi-osu.csv --chapter-id "id-2"
npm run mass-import -- --file rosters/sigma-chi-umich.csv --chapter-id "id-3"

echo "All chapters imported!"
```

### Using Organization + University Names (Batch)

```bash
# No need to lookup chapter IDs - use names!
npm run mass-import -- --file roster.csv --uni "Penn State" --org "Sigma Chi"
npm run mass-import -- --file roster.csv --uni "Ohio State" --org "Sigma Chi"
npm run mass-import -- --file roster.csv --uni "Michigan" --org "Sigma Chi"
```

---

## Troubleshooting

### Script won't run
```bash
# Make sure you're in the backend directory
cd backend

# Check that dependencies are installed
npm install

# Try running with full path
npm run mass-import -- --help
```

### Column names not recognized
The script supports many variations, but if yours isn't recognized:
1. Check the output to see what it mapped to
2. Rename your column to a standard name (name, position, email, etc.)
3. Or submit a feature request to add your column name variation

### Import successful but no data in database
1. Check you used the correct chapter ID
2. Verify CSV has data rows (not just header)
3. Check for errors in the summary output
4. Query database directly to verify:
   ```sql
   SELECT * FROM chapter_officers
   WHERE chapter_id = 'YOUR_ID'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

---

## Support

### Get Help
1. Run with `--help` flag to see all options
2. Use `--dry-run` to preview before importing
3. Check backend logs for detailed error messages
4. Review CSV_UPLOAD_README.md for additional guidance

### Report Issues
If you encounter bugs or need additional column name mappings supported, create an issue with:
- Sample CSV (anonymized)
- Command you ran
- Error message or unexpected behavior

---

## Summary

The mass import script makes bulk data entry easy:

✅ **Flexible CSV formats** - Use any column names
✅ **Automatic normalization** - Phone, LinkedIn, Instagram cleaned up
✅ **Smart deduplication** - Updates existing records by email
✅ **Dry run mode** - Preview before importing
✅ **Multiple lookup methods** - Chapter ID or university + org name
✅ **Comprehensive feedback** - See exactly what was imported

**Start importing your chapter data today!**

```bash
cd backend
npm run mass-import -- --help
```

---

**Last Updated**: October 14, 2025
**Script Location**: `/backend/scripts/mass-import-chapter-data.ts`
**Example CSV**: `/backend/scripts/example-mass-import.csv`
