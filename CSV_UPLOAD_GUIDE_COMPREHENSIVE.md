# FraternityBase CSV Upload Guide - Comprehensive Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Upload Methods](#upload-methods)
3. [CSV Format Requirements](#csv-format-requirements)
4. [Table-Specific Guides](#table-specific-guides)
   - [Chapter Roster Members](#1-chapter-roster-members-chapter_officers--chapter_members)
   - [Chapters](#2-chapters)
   - [Universities](#3-universities)
   - [Greek Organizations](#4-greek-organizations-fraternities--sororities)
5. [Advanced Features](#advanced-features)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Best Practices](#best-practices)
8. [Example Files](#example-files)

---

## Overview

FraternityBase supports CSV file uploads for bulk data import. This guide provides the exact format, required fields, and best practices for uploading data to each table.

### What Can Be Uploaded via CSV?

✅ **Chapter Roster Members** (officers, members, alumni)
✅ **Chapters** (fraternity/sorority chapters at universities)
✅ **Universities** (colleges and universities)
✅ **Greek Organizations** (national fraternities/sororities)

### Two Upload Modes

1. **Direct Upload** - Standard CSV with exact column names
2. **AI-Assisted Upload** - Flexible CSV format, Claude AI processes and maps fields

---

## Upload Methods

### Method 1: Admin Panel Upload (Recommended)

**Endpoint**: `POST /api/admin/chapters/:chapterId/upload-roster`

**How to Use**:
1. Navigate to admin panel
2. Select chapter
3. Click "Upload Roster"
4. Choose CSV file
5. Submit

**Requirements**:
- Admin authentication (x-admin-token header)
- Chapter must already exist in database
- CSV must follow format guidelines below

---

### Method 2: AI-Assisted Upload (Flexible Format)

**Endpoint**: `POST /api/admin/process-csv-with-claude`

**How to Use**:
1. Upload any CSV format (doesn't need exact column names)
2. Optionally add prompt with special instructions
3. Claude AI processes, identifies chapter, and maps fields
4. Review processed data before saving

**Advantages**:
- Flexible column names ("Name" vs "Full Name" vs "Student Name")
- Automatically identifies chapter from context
- Cleans and formats data
- Provides data quality warnings
- Works with messy or incomplete CSVs

**Example Prompt**:
```
"This is the executive board roster for Sigma Chi at University of Virginia.
The 'Role' column should map to 'position'.
Anyone with Role = 'E-Board' should be marked as member_type = 'officer'."
```

---

## CSV Format Requirements

### General Rules

1. **File Encoding**: UTF-8 (avoid Excel's default encoding issues)
2. **Line Endings**: Unix (LF) or Windows (CRLF) - both work
3. **Delimiter**: Comma (`,`)
4. **Header Row**: REQUIRED - First row must contain column names
5. **Quote Style**: Use double quotes for fields containing commas
6. **Empty Fields**: Leave blank or use empty quotes `""`
7. **Boolean Fields**: Use `true` or `false` (lowercase)
8. **Dates**: ISO 8601 format `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`

### Column Name Matching

**Exact match required** (case-insensitive):
- `name` = valid
- `Name` = valid
- `NAME` = valid
- `full_name` = INVALID (must be `name`)

**Exception**: AI-Assisted upload mode handles variations

### Character Limits

Most text fields: 255 characters
- `name`: 255 chars
- `email`: 255 chars
- `position`: 255 chars
- `phone`: 50 chars
- `text/description` fields: Unlimited

---

## Table-Specific Guides

## 1. Chapter Roster Members (chapter_officers & chapter_members)

### Overview

Use this to upload fraternity/sorority rosters including:
- Executive officers (President, VP, etc.)
- General members
- Alumni
- Advisors

### API Endpoint

```
POST /api/admin/chapters/:chapterId/upload-roster
```

Replace `:chapterId` with the chapter's UUID from database.

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **YES** | Full name of member |

### Optional Fields

| Field | Type | Format | Description | Example |
|-------|------|--------|-------------|---------|
| `position` | string | Text | Officer position or "Member" | "President", "Treasurer", "Member" |
| `email` | string | Email | Email address | "john.doe@virginia.edu" |
| `phone` | string | Phone | Phone number | "(434) 555-1234" |
| `linkedin` | string | URL | Full LinkedIn URL | "https://linkedin.com/in/johndoe" |
| `graduation_year` | integer | YYYY | Year as 4-digit integer | 2025 |
| `major` | string | Text | Academic major | "Business Administration" |
| `member_type` | enum | See below | Type of member | "officer" |
| `is_primary_contact` | boolean | true/false | Primary chapter contact | true |

### member_type Values

- `member` (default) - General member
- `officer` - Executive board officer
- `alumni` - Graduated member
- `advisor` - Faculty/alumni advisor

### Phone Number Formats (All Valid)

```
(434) 555-1234
434-555-1234
434.555.1234
4345551234
+1 (434) 555-1234
```

System accepts any format, stores as-is.

### LinkedIn URL Formats

```
✅ https://linkedin.com/in/johndoe
✅ https://www.linkedin.com/in/johndoe
✅ linkedin.com/in/johndoe
✅ www.linkedin.com/in/johndoe
```

### Validation Rules

1. **Duplicate Detection**:
   - If email provided, system checks for existing member with same email in same chapter
   - If found: Updates existing record
   - If not found: Inserts new record
   - If no email: Always inserts (can create duplicates)

2. **Name Validation**:
   - Must not be empty or whitespace-only
   - Trimmed automatically

3. **graduation_year Validation**:
   - Must be valid 4-digit integer
   - Invalid values: Ignored, field set to NULL

4. **is_primary_contact Validation**:
   - Only recognizes exact strings: `true` or `false`
   - Case-sensitive
   - Invalid values default to `false`

### CSV Template: Chapter Roster

```csv
name,position,email,phone,linkedin,graduation_year,major,member_type,is_primary_contact
John Smith,President,john.smith@virginia.edu,(434) 555-1234,https://linkedin.com/in/jsmith,2025,Business Administration,officer,true
Sarah Johnson,Vice President,sarah.j@virginia.edu,(434) 555-1235,linkedin.com/in/sjohnson,2025,Economics,officer,false
Michael Chen,Treasurer,mchen@virginia.edu,434-555-1236,,2026,Accounting,officer,false
David Lee,Member,dlee@virginia.edu,,,2026,Computer Science,member,false
Emily White,Member,ewhite@virginia.edu,(434) 555-1238,,2027,Biology,member,false
```

### Example: Minimal Valid CSV

```csv
name
John Smith
Sarah Johnson
Michael Chen
David Lee
Emily White
```

This is valid! System will:
- Insert all 5 members
- Set all optional fields to NULL
- Set `member_type` to "member"
- Set `is_primary_contact` to false

### Example: Officers Only CSV

```csv
name,position,email,member_type,is_primary_contact
John Smith,President,john.smith@virginia.edu,officer,true
Sarah Johnson,Vice President,sarah.j@virginia.edu,officer,false
Michael Chen,Treasurer,mchen@virginia.edu,officer,false
Alex Rodriguez,Secretary,arodriguez@virginia.edu,officer,false
```

### Common Pitfalls

❌ **Missing name column**
```csv
full_name,position
John Smith,President
```
**Error**: "missing name" - Field must be called `name`, not `full_name`

❌ **Empty name**
```csv
name,position
,President
```
**Error**: Row skipped - name is required

❌ **Misspelled member_type**
```csv
name,member_type
John,oficer
```
**Result**: Inserts with member_type="oficer" (no validation, stored as-is)

✅ **Solution**: Use exact values: `member`, `officer`, `alumni`, `advisor`

---

## 2. Chapters

### Overview

Upload fraternity/sorority chapters at specific universities.

### Important Notes

⚠️ **Prerequisites**:
1. University must already exist in database
2. Greek organization must already exist in database
3. You'll need their UUIDs

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chapter_name` | string | **YES** | Chapter designation |
| `university_id` | UUID | **YES** | UUID of university |
| `greek_organization_id` | UUID | **YES** | UUID of fraternity/sorority |

### Important Optional Fields

| Field | Type | Format | Default | Description |
|-------|------|--------|---------|-------------|
| `grade` | decimal | 0.0-5.0 | NULL | Chapter quality grade |
| `member_count` | integer | Number | NULL | Total members |
| `officer_count` | integer | Number | 0 | Number of officers |
| `status` | enum | See below | 'active' | Chapter status |
| `instagram_handle` | string | @handle | NULL | Instagram username |
| `facebook_page` | string | URL | NULL | Facebook page URL |
| `website` | string | URL | NULL | Chapter website |
| `contact_email` | string | Email | NULL | Main contact email |
| `phone` | string | Phone | NULL | Main contact phone |
| `house_address` | string | Address | NULL | Chapter house address |

### status Values

- `active` (default) - Active chapter
- `inactive` - Inactive/dormant
- `suspended` - Temporarily suspended
- `colony` - New/probationary chapter

### grade Field (CRITICAL FOR BUSINESS LOGIC)

**Range**: 0.0 to 5.0 (decimal allowed: 4.5, 3.7, etc.)

**Grade Tiers**:
- `5.0` - Premium (full roster, all data complete)
- `4.5` - **Introducable** (warm intro available) ⭐
- `4.0-4.4` - High Quality
- `3.5-3.9` - Standard
- `<3.5` - Basic

**Why 4.5 Matters**:
- Chapters with grade ≥4.5 qualify for warm introductions
- Shows in client reports with special badge
- Higher pricing ($7.49 unlock + $59.99 intro)

### CSV Template: Chapters

```csv
chapter_name,university_id,greek_organization_id,grade,member_count,officer_count,status,instagram_handle,facebook_page,website,contact_email,phone,house_address
"Alpha Chapter",e7f8a9b0-1234-5678-90ab-cdef12345678,b2c3d4e5-6789-0abc-def1-234567890abc,5.0,87,12,active,@sigmachialpha,https://facebook.com/sigmachialpha,https://sigmachi-alpha.com,president@sigmachialpha.com,(434) 555-1000,"123 Fraternity Row, Charlottesville, VA 22904"
"Beta Chapter",f8e9d0c1-2345-6789-01bc-def234567890,b2c3d4e5-6789-0abc-def1-234567890abc,4.5,65,10,active,@sigmachibeta,,,contact@sigmachibeta.org,,,
```

### How to Get UUIDs

**Method 1: Query Database**
```sql
-- Get university ID
SELECT id, name FROM universities WHERE name LIKE '%Virginia%';

-- Get greek organization ID
SELECT id, name FROM greek_organizations WHERE name = 'Sigma Chi';
```

**Method 2: AI-Assisted Upload**
```
Just provide university name and fraternity name in CSV, Claude will match automatically:

name,university,fraternity
"Alpha Chapter","University of Virginia","Sigma Chi"
```

### Validation Rules

1. **university_id**:
   - Must be valid UUID
   - Must exist in universities table
   - Foreign key constraint enforced

2. **greek_organization_id**:
   - Must be valid UUID
   - Must exist in greek_organizations table
   - Foreign key constraint enforced

3. **grade**:
   - Must be between 0.0 and 5.0 (inclusive)
   - Database constraint enforced
   - Invalid value = Error, row skipped

4. **status**:
   - Must be one of: active, inactive, suspended, colony
   - Invalid value = Error, row skipped

---

## 3. Universities

### Overview

Upload colleges and universities where chapters exist.

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **YES** | Full university name |

### Optional Fields

| Field | Type | Format | Description | Example |
|-------|------|--------|-------------|---------|
| `location` | string | Text | City/region | "Charlottesville" |
| `state` | string | 2-letter | State abbreviation | "VA" |
| `student_count` | integer | Number | Total enrollment | 25000 |
| `greek_percentage` | decimal | 0.00-1.00 | % in Greek life | 0.15 (15%) |
| `website` | string | URL | University website | "https://virginia.edu" |
| `logo_url` | string | URL | Logo image URL | "https://..." |
| `bars_nearby` | integer | Number | # of bars near campus | 12 |
| `conference` | string | Text | Athletic conference | "ACC" |

### CSV Template: Universities

```csv
name,location,state,student_count,greek_percentage,website,logo_url,bars_nearby,conference
"University of Virginia","Charlottesville","VA",25000,0.30,https://virginia.edu,https://virginia.edu/logo.png,15,ACC
"Virginia Tech","Blacksburg","VA",34000,0.18,https://vt.edu,https://vt.edu/logo.png,8,ACC
"James Madison University","Harrisonburg","VA",22000,0.12,https://jmu.edu,https://jmu.edu/logo.png,6,"CAA"
```

### Validation Rules

1. **name**:
   - Must be unique
   - Duplicate detection: Case-insensitive match
   - Duplicates: Skipped or updated (depending on upsert mode)

2. **state**:
   - No validation (stores as-is)
   - Recommendation: Use 2-letter abbreviations (VA, CA, TX)

3. **greek_percentage**:
   - Decimal between 0.00 and 1.00
   - Example: 0.15 = 15%, not 15
   - Invalid value: Row skipped

4. **student_count & bars_nearby**:
   - Must be valid integers
   - Negative values: Accepted (no validation)

### Common Formats

**State abbreviations**:
```
✅ VA, CA, TX, NY, MA
✅ Virginia, California (also accepted, but not recommended)
❌ va, ca (lowercase - works but not standard)
```

**greek_percentage**:
```
✅ 0.30 (30%)
✅ 0.15 (15%)
❌ 30 (will be interpreted as 3000%!)
❌ 15% (invalid, must be decimal)
```

---

## 4. Greek Organizations (Fraternities & Sororities)

### Overview

Upload national fraternity/sorority organizations.

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **YES** | Full organization name |
| `greek_letters` | string | **YES** | Greek letter designation |

### Optional Fields

| Field | Type | Format | Description | Example |
|-------|------|--------|-------------|---------|
| `organization_type` | enum | See below | Type of organization | "fraternity" |
| `founded_year` | integer | YYYY | Year founded | 1855 |
| `national_website` | string | URL | Official website | "https://sigmachi.org" |
| `total_chapters` | integer | Number | # of chapters nationwide | 244 |
| `total_members` | integer | Number | # of members nationwide | 300000 |
| `colors` | string | Text | Official colors | "Blue and Gold" |
| `symbols` | string | Text | Official symbols | "White Cross" |
| `philanthropy` | string | Text | Charitable cause | "Huntsman Cancer Institute" |

### organization_type Values

- `fraternity` - Male fraternity
- `sorority` - Female sorority
- `honor_society` - Academic honor society

### CSV Template: Greek Organizations

```csv
name,greek_letters,organization_type,founded_year,national_website,total_chapters,total_members,colors,symbols,philanthropy
"Sigma Chi","ΣΧ",fraternity,1855,https://sigmachi.org,244,300000,"Blue and Gold","White Cross","Huntsman Cancer Institute"
"Kappa Alpha Order","ΚΑ",fraternity,1865,https://ka-order.org,143,200000,"Crimson and Gold","Knight's Shield","Muscular Dystrophy Association"
"Kappa Kappa Gamma","ΚΚΓ",sorority,1870,https://kappakappagamma.org,145,250000,"Light Blue and Dark Blue","Key","Reading is Fundamental"
```

### Validation Rules

1. **name**:
   - Must be unique
   - Duplicate detection enforced
   - Duplicates: Error, row skipped

2. **organization_type**:
   - Must be one of: fraternity, sorority, honor_society
   - Case-sensitive
   - Invalid value: Error, row skipped

3. **founded_year**:
   - Must be valid 4-digit integer
   - Typically 1700-2024
   - No validation on range

### Greek Letters

**Supported formats**:
```
✅ ΣΧ (actual Greek letters - preferred)
✅ Sigma Chi (spelled out - also accepted)
✅ SX (English abbreviation - accepted)
```

**How to type Greek letters**:
- Copy from https://www.greeksymbols.net/
- Use character map/emoji picker
- Type spelled-out name (system accepts both)

---

## Advanced Features

### 1. Upsert Behavior (Update or Insert)

**Chapter Roster Uploads**:
- If `email` provided: Checks for existing member with same email in same chapter
  - Found: **Updates** existing record
  - Not found: **Inserts** new record
- If no `email`: **Always inserts** (cannot detect duplicates)

**Best Practice**: Always include email to avoid duplicates

### 2. Data Cleaning

System automatically:
- Trims whitespace from all fields
- Converts empty strings to NULL
- Parses integers from string numbers ("2025" → 2025)
- Preserves original formatting for phone, URLs

### 3. Batch Processing

- Processes rows sequentially (not parallel)
- Continues on errors (doesn't stop entire upload)
- Returns summary: inserted, updated, skipped, errors
- Error limit: Returns first 10 errors only

### 4. Activity Logging

All uploads logged to `admin_activity_log`:
- Event type: "admin_upload"
- Metadata: counts, chapter name, timestamp
- Viewable in admin panel

---

## Common Issues & Solutions

### Issue 1: "Missing required field: name"

**Cause**: Column not named exactly `name`

**Solution**: Rename column to exact match (case-insensitive)
```csv
❌ full_name,position
✅ name,position
```

---

### Issue 2: "Foreign key constraint violation"

**Cause**: university_id or greek_organization_id doesn't exist

**Solution**:
1. Query database to get correct UUIDs
2. Or use AI-assisted upload with names instead of IDs

---

### Issue 3: "Invalid value for grade"

**Cause**: Grade outside 0.0-5.0 range

**Examples**:
```csv
❌ grade: 6.0 (too high)
❌ grade: -1.0 (negative)
✅ grade: 4.5
✅ grade: 5.0
```

---

### Issue 4: Duplicate members inserted

**Cause**: No email provided, system cannot detect duplicates

**Solution**: Always include email field
```csv
❌ name,position
   John Smith,President
   John Smith,President  ← Will insert duplicate!

✅ name,position,email
   John Smith,President,john@virginia.edu
   John Smith,President,john@virginia.edu  ← Will update existing!
```

---

### Issue 5: Empty CSV or no records imported

**Causes**:
1. Missing header row
2. All names empty/whitespace
3. Encoding issues (file not UTF-8)

**Solution**:
1. Ensure first row has column names
2. Validate data in Excel/Google Sheets before export
3. Save as "CSV UTF-8" not "CSV"

---

### Issue 6: Special characters display incorrectly

**Cause**: Wrong file encoding

**Solution**:
- Export as "CSV UTF-8" (not just "CSV")
- In Excel: File → Save As → CSV UTF-8
- In Google Sheets: File → Download → CSV

---

### Issue 7: Quotes breaking CSV

**Cause**: Unescaped quotes inside fields

**Examples**:
```csv
❌ name,position
   John "Johnny" Smith,President  ← Breaks parsing

✅ name,position
   "John ""Johnny"" Smith",President  ← Escaped quotes (double them)

✅ name,position
   John Johnny Smith,President  ← Remove quotes
```

---

## Best Practices

### 1. Always Include Identifiers

```csv
✅ name,email,position
   John Smith,john@example.com,President

❌ name,position
   John Smith,President  ← No email = potential duplicates
```

### 2. Validate Before Upload

**Pre-upload checklist**:
- [ ] Header row present
- [ ] Required fields populated
- [ ] No empty required fields
- [ ] UUIDs valid (if applicable)
- [ ] Enums match exactly (status, organization_type, member_type)
- [ ] grades between 0.0-5.0
- [ ] greek_percentage as decimal (0.15 not 15)

### 3. Use Templates

Download and fill out templates rather than creating from scratch:
- Ensures correct column names
- Pre-validates format
- Includes examples

### 4. Test with Small Batch First

Upload 5-10 records first:
- Verify format works
- Check results in database
- Then upload full dataset

### 5. Keep Backups

Before bulk upload:
1. Export current data
2. Upload new data
3. Verify in admin panel
4. Keep original CSV for re-upload if needed

### 6. Use AI-Assisted for Messy Data

If your CSV:
- Has non-standard column names
- Missing university/chapter IDs
- Needs data cleaning
- Has inconsistent formatting

→ Use `/api/admin/process-csv-with-claude` instead of direct upload

---

## Example Files

### Example 1: Complete Chapter Roster

**File**: `sigma-chi-alpha-roster.csv`

```csv
name,position,email,phone,linkedin,graduation_year,major,member_type,is_primary_contact
"John Michael Smith",President,john.smith@virginia.edu,(434) 555-1234,https://linkedin.com/in/johnmsmith,2025,Commerce,officer,true
"Sarah Elizabeth Johnson",Vice President,sarah.johnson@virginia.edu,434-555-1235,linkedin.com/in/sarahjohnson,2025,Economics,officer,false
"Michael David Chen",Treasurer,michael.chen@virginia.edu,(434) 555-1236,https://linkedin.com/in/michaelchen,2026,Accounting,officer,false
"Alexander James Rodriguez",Secretary,alex.rodriguez@virginia.edu,434.555.1237,,2026,Political Science,officer,false
"David Thomas Lee",Social Chair,david.lee@virginia.edu,4345551238,https://linkedin.com/in/davidlee,2025,History,officer,false
"Emily Grace White",Member,emily.white@virginia.edu,(434) 555-1239,,2027,Biology,member,false
"Christopher Ryan Brown",Member,chris.brown@virginia.edu,,,2027,Computer Science,member,false
"Jessica Ann Martinez",Member,jessica.martinez@virginia.edu,4345551241,https://linkedin.com/in/jessicamartinez,2026,Psychology,member,false
"Matthew Paul Garcia",Member,matt.garcia@virginia.edu,(434) 555-1242,,2028,Engineering,member,false
"Dr. William Thompson",Advisor,wthompson@virginia.edu,(434) 555-9999,https://linkedin.com/in/drwilliamthompson,,Religious Studies,advisor,false
```

**Expected Result**:
- 10 members inserted
- 5 officers, 4 members, 1 advisor
- John Smith marked as primary contact
- All have emails (good for future updates)

---

### Example 2: Minimal Roster

**File**: `basic-roster.csv`

```csv
name,email
John Smith,john@example.com
Sarah Johnson,sarah@example.com
Michael Chen,michael@example.com
David Lee,david@example.com
Emily White,emily@example.com
```

**Expected Result**:
- 5 members inserted
- All set to member_type="member"
- No positions, phone, LinkedIn (all NULL)
- Future uploads with same emails will update these records

---

### Example 3: Officers Only with Positions

**File**: `executive-board.csv`

```csv
name,position,email,member_type,graduation_year
John Smith,President,president@chapter.org,officer,2025
Sarah Johnson,Vice President,vp@chapter.org,officer,2025
Michael Chen,Treasurer,treasurer@chapter.org,officer,2026
Alex Rodriguez,Secretary,secretary@chapter.org,officer,2026
David Lee,Social Chair,social@chapter.org,officer,2025
```

**Expected Result**:
- 5 officers inserted
- All have official positions
- All marked as member_type="officer"
- Graduation years tracked

---

### Example 4: Universities Bulk Upload

**File**: `virginia-universities.csv`

```csv
name,location,state,student_count,greek_percentage,conference
"University of Virginia","Charlottesville","VA",25000,0.30,ACC
"Virginia Tech","Blacksburg","VA",34000,0.18,ACC
"James Madison University","Harrisonburg","VA",22000,0.12,CAA
"Virginia Commonwealth University","Richmond","VA",31000,0.08,A-10
"Old Dominion University","Norfolk","VA",24000,0.10,"Sun Belt"
"George Mason University","Fairfax","VA",38000,0.05,A-10
"College of William & Mary","Williamsburg","VA",9000,0.25,CAA
"Washington and Lee University","Lexington","VA",2000,0.75,ODAC
```

**Expected Result**:
- 8 universities inserted
- All with enrollment, Greek %, conference
- Ready for chapter assignments

---

### Example 5: Greek Organizations

**File**: `fraternities.csv`

```csv
name,greek_letters,organization_type,founded_year,national_website,colors,philanthropy
"Sigma Chi","ΣΧ",fraternity,1855,https://sigmachi.org,"Blue and Gold","Huntsman Cancer Institute"
"Kappa Alpha Order","ΚΑ",fraternity,1865,https://ka-order.org,"Crimson and Gold","Muscular Dystrophy Association"
"Pi Kappa Alpha","ΠΚΑ",fraternity,1868,https://pikes.org,"Garnet and Gold","Taylor'd Hearts Foundation"
"Sigma Alpha Epsilon","ΣΑΕ",fraternity,1856,https://sae.net,"Purple and Gold","Children's Miracle Network"
```

**Expected Result**:
- 4 fraternities inserted
- All with founding years, websites, philanthropies
- Ready for chapter creation

---

## Quick Reference Card

### Chapter Roster Upload

**Required**: `name`
**Recommended**: `name`, `email`, `position`, `graduation_year`
**Deduplication**: Based on `email` (if provided)

### Chapters Upload

**Required**: `chapter_name`, `university_id`, `greek_organization_id`
**Important**: `grade` (0.0-5.0, use 4.5+ for introducable)
**Recommendation**: Get IDs from database first, or use AI-assisted

### Universities Upload

**Required**: `name`
**Recommended**: `name`, `state`, `student_count`, `greek_percentage`
**Note**: `greek_percentage` as decimal (0.15 = 15%)

### Greek Organizations Upload

**Required**: `name`, `greek_letters`
**Recommended**: All fields for completeness
**Note**: `organization_type` must be exact: fraternity, sorority, or honor_society

---

## Getting Help

### Debug Upload Issues

1. **Check server logs**: `npm run dev` (backend console)
2. **Review error messages**: Upload returns first 10 errors
3. **Validate CSV**: Use online CSV validator
4. **Test with minimal example**: Upload just 2-3 rows first

### Database Queries

```sql
-- Get university IDs
SELECT id, name FROM universities ORDER BY name;

-- Get greek org IDs
SELECT id, name FROM greek_organizations ORDER BY name;

-- Get chapter IDs
SELECT id, chapter_name, universities.name
FROM chapters
LEFT JOIN universities ON chapters.university_id = universities.id;

-- Check recent uploads
SELECT * FROM admin_activity_log
WHERE event_type = 'admin_upload'
ORDER BY created_at DESC
LIMIT 10;
```

---

**Last Updated**: October 8, 2025
**Version**: 2.0
**Maintained By**: FraternityBase Team

For questions or issues, check backend logs or contact system administrator.
