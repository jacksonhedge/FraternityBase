# FraternityBase Database Schema Documentation

**Last Updated:** 2025-10-14

This document provides a comprehensive overview of the FraternityBase database structure for use when scraping and importing data legally and ethically.

---

## Table of Contents
1. [Overview](#overview)
2. [Database Tables](#database-tables)
3. [Entity Relationships](#entity-relationships)
4. [Data Import Guidelines](#data-import-guidelines)
5. [Field Formatting Standards](#field-formatting-standards)

---

## Overview

The FraternityBase database uses **Supabase (PostgreSQL)** and is structured around four main entities:

1. **Universities** - Educational institutions
2. **Greek Organizations** - National fraternities and sororities
3. **Chapters** - Local chapters of Greek organizations at specific universities
4. **Chapter Officers** - Leadership and member contacts for each chapter

---

## Database Tables

### 1. `universities`

Stores information about colleges and universities.

#### Schema:
```typescript
{
  id: UUID (PRIMARY KEY, auto-generated)
  name: STRING (REQUIRED) - Full official university name
  location: STRING (REQUIRED) - "City, State" format
  state: STRING (REQUIRED) - Two-letter state code (e.g., "PA", "CA", "TX")
  student_count: INTEGER - Total enrolled students
  greek_percentage: DECIMAL - Percentage of students in Greek life (0-100)
  website: STRING (URL) - Official university website
  logo_url: STRING (URL) - URL to university logo image
  bars_nearby: INTEGER - Number of bars/nightlife venues near campus
  unlock_count: INTEGER - Track how many times data has been unlocked (future use)
  created_at: TIMESTAMP (auto-generated)
  updated_at: TIMESTAMP (auto-generated)
}
```

#### Example Data:
```json
{
  "name": "Pennsylvania State University",
  "location": "State College, PA",
  "state": "PA",
  "student_count": 46800,
  "greek_percentage": 17.5,
  "website": "https://www.psu.edu",
  "logo_url": "https://example.com/psu-logo.png",
  "bars_nearby": 25
}
```

#### Validation Rules:
- **name**: Must be unique, full official name
- **state**: Must be valid 2-letter US state code
- **location**: Format as "City, State"
- **greek_percentage**: Value between 0 and 100
- **website/logo_url**: Must be valid URLs with https:// prefix

---

### 2. `greek_organizations`

Stores national fraternity and sorority organizations.

#### Schema:
```typescript
{
  id: UUID (PRIMARY KEY, auto-generated)
  name: STRING (REQUIRED) - Full official organization name
  greek_letters: STRING - Greek letter representation (e.g., "ΣΧ")
  organization_type: ENUM (REQUIRED) - 'fraternity' | 'sorority'
  founded_year: INTEGER - Year the organization was founded
  national_website: STRING (URL) - Official national website
  total_chapters: INTEGER - Total number of chapters nationwide
  colors: STRING - Official organization colors
  symbols: STRING - Official symbols/mascots
  philanthropy: STRING - Primary philanthropic causes
  created_at: TIMESTAMP (auto-generated)
  updated_at: TIMESTAMP (auto-generated)
}
```

#### Example Data:
```json
{
  "name": "Sigma Chi",
  "greek_letters": "ΣΧ",
  "organization_type": "fraternity",
  "founded_year": 1855,
  "national_website": "https://www.sigmachi.org",
  "total_chapters": 244,
  "colors": "Blue and Gold",
  "symbols": "White Cross",
  "philanthropy": "Huntsman Cancer Institute"
}
```

#### Validation Rules:
- **name**: Must be unique
- **organization_type**: Must be exactly "fraternity" or "sorority"
- **greek_letters**: Use actual Greek Unicode characters (Α, Β, Γ, Δ, etc.)
- **national_website**: Must be valid URL with https:// prefix

---

### 3. `chapters`

Stores individual chapter information (a chapter is an instance of a Greek organization at a specific university).

#### Schema:
```typescript
{
  id: UUID (PRIMARY KEY, auto-generated)
  greek_organization_id: UUID (FOREIGN KEY → greek_organizations.id, REQUIRED)
  university_id: UUID (FOREIGN KEY → universities.id, REQUIRED)
  chapter_name: STRING (REQUIRED) - Chapter designation (e.g., "Beta Psi", "Alpha Chapter")
  member_count: INTEGER - Current number of active members
  status: ENUM (REQUIRED) - 'active' | 'inactive' | 'probation' | 'suspended'
  charter_date: DATE - Date chapter was chartered (YYYY-MM-DD)
  house_address: STRING - Physical address of chapter house
  instagram_handle: STRING - Instagram handle (with or without @)
  website: STRING (URL) - Chapter-specific website
  contact_email: STRING (EMAIL) - Primary contact email
  phone: STRING (PHONE) - Primary contact phone
  avg_gpa: DECIMAL - Average GPA of chapter members (0.0-4.0)
  engagement_score: INTEGER - Engagement/activity score (0-100)
  partnership_openness: ENUM - 'very_open' | 'open' | 'selective' | 'not_interested'
  notes: TEXT - Internal notes (not shown to users)
  created_at: TIMESTAMP (auto-generated)
  updated_at: TIMESTAMP (auto-generated)
}
```

#### Example Data:
```json
{
  "greek_organization_id": "550e8400-e29b-41d4-a716-446655440000",
  "university_id": "660e8400-e29b-41d4-a716-446655440000",
  "chapter_name": "Beta Psi",
  "member_count": 85,
  "status": "active",
  "charter_date": "1912-05-15",
  "house_address": "123 Greek Row, State College, PA 16801",
  "instagram_handle": "@psusigmachi",
  "website": "https://psusigmachi.com",
  "contact_email": "president@psusigmachi.com",
  "phone": "(814) 555-1234",
  "avg_gpa": 3.45,
  "engagement_score": 87,
  "partnership_openness": "open"
}
```

#### Validation Rules:
- **greek_organization_id**: Must reference valid organization
- **university_id**: Must reference valid university
- **chapter_name**: Common formats: "Beta Psi", "Alpha Chapter", "Pennsylvania Alpha"
- **status**: Must be 'active', 'inactive', 'probation', or 'suspended'
- **charter_date**: Format as YYYY-MM-DD
- **instagram_handle**: Format as "@username" (@ is optional, will be normalized)
- **contact_email**: Must be valid email format
- **phone**: Normalize to (XXX) XXX-XXXX format
- **avg_gpa**: Value between 0.0 and 4.0
- **engagement_score**: Value between 0 and 100
- **partnership_openness**: Must match enum values exactly

#### Uniqueness Constraint:
**A chapter MUST be unique by the combination of:**
```
(greek_organization_id, university_id)
```
This means you cannot have duplicate "Sigma Chi at Penn State" entries.

---

### 4. `chapter_officers`

Stores officer and member contact information for chapters.

#### Schema:
```typescript
{
  id: UUID (PRIMARY KEY, auto-generated)
  chapter_id: UUID (FOREIGN KEY → chapters.id, REQUIRED)
  name: STRING (REQUIRED) - Full name of officer/member
  first_name: STRING - First name (auto-parsed if only name provided)
  last_name: STRING - Last name (auto-parsed if only name provided)
  position: STRING (REQUIRED) - Officer title (e.g., "President", "VP Finance")
  member_type: ENUM - 'officer' | 'member' | 'alumni' | 'advisor'
  email: STRING (EMAIL) - Personal or officer email
  phone: STRING (PHONE) - Contact phone number
  linkedin_profile: STRING (URL) - LinkedIn profile URL
  graduation_year: INTEGER - Expected graduation year (YYYY format)
  major: STRING - Academic major/field of study
  is_primary_contact: BOOLEAN - True if this is the main chapter contact
  year_in_chapter: STRING - e.g., "Sophomore", "Junior", "Senior"
  created_at: TIMESTAMP (auto-generated)
  updated_at: TIMESTAMP (auto-generated)
}
```

#### Example Data:
```json
{
  "chapter_id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "Tyler Alesse",
  "first_name": "Tyler",
  "last_name": "Alesse",
  "position": "President",
  "member_type": "officer",
  "email": "tyleralesse@psu.edu",
  "phone": "(814) 555-4567",
  "linkedin_profile": "https://www.linkedin.com/in/tyleralesse",
  "graduation_year": 2026,
  "major": "Business Administration",
  "is_primary_contact": true,
  "year_in_chapter": "Senior"
}
```

#### Common Officer Positions:
- President / Chapter President
- Vice President
- Treasurer / VP Finance
- Secretary
- Recruitment Chair / Rush Chair
- Social Chair
- Philanthropy Chair
- Risk Management Chair
- New Member Educator / Pledge Educator
- Alumni Relations Chair
- Communications Chair / Marketing Chair
- House Manager
- Standards Board Chair

#### Validation Rules:
- **chapter_id**: Must reference valid chapter
- **name**: Full name required if first_name/last_name not provided
- **position**: Free-form text, common titles above
- **member_type**: Must be 'officer', 'member', 'alumni', or 'advisor'
- **email**: Must be valid email format
- **phone**: Normalize to (XXX) XXX-XXXX format
- **linkedin_profile**: Must be valid LinkedIn URL
- **graduation_year**: Four-digit year (e.g., 2026)
- **is_primary_contact**: Only ONE officer per chapter should be primary

---

## Entity Relationships

```
┌─────────────────────┐
│   universities      │
│  (1000+ records)    │
│                     │
│  - id (PK)          │
│  - name             │
│  - state            │
│  - student_count    │
└──────────┬──────────┘
           │
           │ One-to-Many
           │
           ▼
┌─────────────────────┐         ┌─────────────────────┐
│ greek_organizations │         │      chapters       │
│    (100+ records)   │◄────────│   (5000+ records)   │
│                     │         │                     │
│  - id (PK)          │         │  - id (PK)          │
│  - name             │         │  - greek_org_id (FK)│
│  - greek_letters    │         │  - university_id(FK)│
│  - org_type         │         │  - chapter_name     │
└─────────────────────┘         │  - member_count     │
                                │  - instagram_handle │
                                │  - contact_email    │
                                └──────────┬──────────┘
                                           │
                                           │ One-to-Many
                                           │
                                           ▼
                                ┌─────────────────────┐
                                │  chapter_officers   │
                                │  (20,000+ records)  │
                                │                     │
                                │  - id (PK)          │
                                │  - chapter_id (FK)  │
                                │  - name             │
                                │  - position         │
                                │  - email            │
                                │  - phone            │
                                └─────────────────────┘
```

### Key Relationships:

1. **University → Chapters** (One-to-Many)
   - One university can have many chapters
   - Each chapter belongs to exactly one university

2. **Greek Organization → Chapters** (One-to-Many)
   - One Greek organization can have many chapters across different universities
   - Each chapter belongs to exactly one Greek organization

3. **Chapter → Chapter Officers** (One-to-Many)
   - One chapter can have many officers/members
   - Each officer/member belongs to exactly one chapter

### Unique Constraints:

1. **University**: `name` must be unique
2. **Greek Organization**: `name` must be unique
3. **Chapter**: Combination of `(greek_organization_id, university_id)` must be unique
   - **Example**: You can only have ONE "Sigma Chi at Penn State"

---

## Data Import Guidelines

### Pre-Import Validation Checklist

Before importing any scraped data, verify:

#### ✅ For Universities:
- [ ] University name is official and complete
- [ ] State code is valid 2-letter abbreviation
- [ ] No duplicate university names in your import file
- [ ] Check if university already exists in database

#### ✅ For Greek Organizations:
- [ ] Organization name is official and complete
- [ ] Organization type is exactly "fraternity" or "sorority"
- [ ] No duplicate organization names in your import file
- [ ] Check if organization already exists in database

#### ✅ For Chapters:
- [ ] Both greek_organization_id and university_id exist in database
- [ ] No duplicate (greek_org + university) combinations
- [ ] Status is one of: active, inactive, probation, suspended
- [ ] Instagram handles are formatted consistently

#### ✅ For Chapter Officers:
- [ ] chapter_id exists in database
- [ ] Email addresses are valid format
- [ ] Phone numbers are properly formatted
- [ ] Only ONE primary contact per chapter
- [ ] Names are properly split into first/last if available

---

## Field Formatting Standards

### Phone Numbers
**Input formats you might scrape:**
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

**Formatting rule:** `(XXX) XXX-XXXX`

---

### Instagram Handles
**Input formats you might scrape:**
```
psusigmachi
@psusigmachi
instagram.com/psusigmachi
https://www.instagram.com/psusigmachi
https://instagram.com/psusigmachi/
```

**Standardized output:**
```
@psusigmachi
```

**Formatting rule:** Always prefix with `@`, remove domain/URLs

---

### URLs
**Input formats you might scrape:**
```
www.example.com
example.com
http://example.com
```

**Standardized output:**
```
https://www.example.com
https://example.com
https://example.com
```

**Formatting rule:** Always include `https://` prefix

---

### State Codes
**Input formats you might scrape:**
```
Pennsylvania
Penn
PA
penn state
```

**Standardized output:**
```
PA
```

**Formatting rule:** Use 2-letter uppercase abbreviation

**State abbreviation mapping:**
```typescript
{
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN',
  'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE',
  'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
  'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR',
  'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
  'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
}
```

---

### Greek Letters
**Input formats you might scrape:**
```
Sigma Chi
Alpha Phi
Theta
ΣΧ (already correct)
```

**Standardized output:**
```
ΣΧ
ΑΦ
Θ
```

**Greek alphabet mapping:**
```typescript
{
  'Alpha': 'Α', 'Beta': 'Β', 'Gamma': 'Γ', 'Delta': 'Δ',
  'Epsilon': 'Ε', 'Zeta': 'Ζ', 'Eta': 'Η', 'Theta': 'Θ',
  'Iota': 'Ι', 'Kappa': 'Κ', 'Lambda': 'Λ', 'Mu': 'Μ',
  'Nu': 'Ν', 'Xi': 'Ξ', 'Omicron': 'Ο', 'Pi': 'Π',
  'Rho': 'Ρ', 'Sigma': 'Σ', 'Tau': 'Τ', 'Upsilon': 'Υ',
  'Phi': 'Φ', 'Chi': 'Χ', 'Psi': 'Ψ', 'Omega': 'Ω'
}
```

---

### Email Addresses
**Validation:**
- Must contain `@` symbol
- Must have domain extension (e.g., `.com`, `.edu`, `.org`)
- Convert to lowercase for consistency

**Examples:**
```
Valid:   tyleralesse@psu.edu
Valid:   president@sigmachi.org
Invalid: tyleralessepsu.edu (missing @)
Invalid: tyler@psu (missing domain extension)
```

---

### Dates
**Input formats you might scrape:**
```
May 15, 1912
5/15/1912
05-15-1912
1912-05-15 (already correct)
```

**Standardized output:**
```
1912-05-15
```

**Formatting rule:** `YYYY-MM-DD` (ISO 8601 format)

---

## Recommended Import Workflow

### Step 1: Prepare Your Data

```typescript
// Example scraped data (raw)
const rawData = {
  universityName: "Penn State",
  greekOrgName: "Sigma Chi",
  chapterName: "Beta Psi Chapter",
  presidentName: "Tyler Alesse",
  presidentEmail: "TYLERALESSE@PSU.EDU",
  presidentPhone: "8145551234",
  instagram: "instagram.com/psusigmachi",
  chapterWebsite: "www.psusigmachi.com",
  status: "Active"
};
```

### Step 2: Normalize & Format

```typescript
// Apply formatting standards
const formattedData = {
  universityName: "Pennsylvania State University",
  universityState: "PA",
  greekOrgName: "Sigma Chi",
  greekLetters: "ΣΧ",
  chapterName: "Beta Psi",
  presidentName: "Tyler Alesse",
  presidentEmail: "tyleralesse@psu.edu",
  presidentPhone: "(814) 555-1234",
  instagram: "@psusigmachi",
  chapterWebsite: "https://www.psusigmachi.com",
  status: "active"
};
```

### Step 3: Validate References

```typescript
// Before inserting chapter, check if university and greek_org exist
const university = await findOrCreateUniversity({
  name: formattedData.universityName,
  state: formattedData.universityState
});

const greekOrg = await findOrCreateGreekOrganization({
  name: formattedData.greekOrgName,
  greek_letters: formattedData.greekLetters,
  organization_type: "fraternity"
});
```

### Step 4: Check for Duplicates

```typescript
// Check if chapter already exists
const existingChapter = await checkChapterExists({
  greek_organization_id: greekOrg.id,
  university_id: university.id
});

if (existingChapter) {
  // UPDATE existing chapter
  await updateChapter(existingChapter.id, formattedData);
} else {
  // INSERT new chapter
  await createChapter({
    greek_organization_id: greekOrg.id,
    university_id: university.id,
    ...formattedData
  });
}
```

### Step 5: Add Officer Data

```typescript
// Add officer information
await createOrUpdateOfficer({
  chapter_id: chapter.id,
  name: formattedData.presidentName,
  position: "President",
  email: formattedData.presidentEmail,
  phone: formattedData.presidentPhone,
  member_type: "officer",
  is_primary_contact: true
});
```

---

## AI-Assisted Data Formatting

FraternityBase includes AI-powered data formatting utilities that can automatically:
- Parse unstructured data
- Normalize field formats
- Map scraped data to database schema
- Flag uncertain/ambiguous data

**See:** `/frontend/src/utils/aiDataFormatter.ts` for implementation details.

The AI formatter uses Claude to intelligently understand context and apply formatting rules automatically.

---

## Important Notes

### 🔒 Privacy & Ethics
- Only scrape publicly available data
- Respect robots.txt and website terms of service
- Do not scrape personal data without consent
- Obtain data from official university Greek life pages when possible

### 🚫 Prevent Duplicates
Always check for existing records before inserting:
1. Check university by name
2. Check Greek organization by name
3. Check chapter by (greek_org_id, university_id) combination
4. Check officers by (chapter_id, name) if updating rosters

### 📊 Data Quality
- Prefer official sources (university Greek life pages, national org websites)
- Verify chapter status (active/inactive) before importing
- Cross-reference officer rosters with LinkedIn when possible
- Mark data confidence level in notes field

### 🔄 Updating Existing Data
When updating existing chapters:
- Preserve IDs (never change UUIDs)
- Only update fields that have changed
- Keep audit trail of changes if possible
- Be careful not to overwrite manually-verified data

---

## Example: Complete Import Flow

```typescript
// 1. Find or create university
const university = await supabase
  .from('universities')
  .select('id')
  .eq('name', 'Pennsylvania State University')
  .single();

// If not found, create it
if (!university.data) {
  const { data: newUniversity } = await supabase
    .from('universities')
    .insert({
      name: 'Pennsylvania State University',
      location: 'State College, PA',
      state: 'PA',
      student_count: 46800,
      greek_percentage: 17.5,
      website: 'https://www.psu.edu'
    })
    .select()
    .single();
}

// 2. Find or create Greek organization
const greekOrg = await supabase
  .from('greek_organizations')
  .select('id')
  .eq('name', 'Sigma Chi')
  .single();

if (!greekOrg.data) {
  const { data: newGreekOrg } = await supabase
    .from('greek_organizations')
    .insert({
      name: 'Sigma Chi',
      greek_letters: 'ΣΧ',
      organization_type: 'fraternity',
      founded_year: 1855,
      national_website: 'https://www.sigmachi.org'
    })
    .select()
    .single();
}

// 3. Check if chapter exists
const { data: existingChapter } = await supabase
  .from('chapters')
  .select('id')
  .eq('greek_organization_id', greekOrg.data.id)
  .eq('university_id', university.data.id)
  .single();

// 4. Insert or update chapter
if (!existingChapter) {
  const { data: newChapter } = await supabase
    .from('chapters')
    .insert({
      greek_organization_id: greekOrg.data.id,
      university_id: university.data.id,
      chapter_name: 'Beta Psi',
      member_count: 85,
      status: 'active',
      instagram_handle: '@psusigmachi',
      contact_email: 'president@psusigmachi.com',
      phone: '(814) 555-1234',
      partnership_openness: 'open'
    })
    .select()
    .single();
}

// 5. Add officers
const { data: officer } = await supabase
  .from('chapter_officers')
  .insert({
    chapter_id: existingChapter?.id || newChapter.data.id,
    name: 'Tyler Alesse',
    first_name: 'Tyler',
    last_name: 'Alesse',
    position: 'President',
    member_type: 'officer',
    email: 'tyleralesse@psu.edu',
    phone: '(814) 555-4567',
    graduation_year: 2026,
    is_primary_contact: true
  });
```

---

## Contact & Support

For questions about the database schema or data import process:
- **Email**: admin@fraternitybase.com
- **Admin Panel**: https://fraternitybase.com/admin

---

**End of Documentation**
