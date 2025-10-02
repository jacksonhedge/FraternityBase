# Chapter Member Import Process

## Overview
This document outlines the standardized process for importing chapter rosters into the FraternityBase database.

## Database Schema

### Tables Created:
1. **members** - Individual fraternity/sorority members
2. **leadership_positions** - Leadership role definitions
3. **member_leadership** - Junction table linking members to their leadership positions

## Data Pattern Recognition

### Roster Format
When you receive a roster, it will typically follow this pattern:

```
Full Name | Member Type | Status | Email | Phone
```

Example:
```
Ryan Craig Aber | Undergrad | Active | ryaber8@gmail.com | 724-393-5491
Andrew James Acker | Undergrad | Active | andrewacker4@gmail.com | (215) 530-0499
```

### Chapter Naming Convention
- **Organization**: Sigma Chi, Alpha Phi, etc.
- **Chapter Designation**: Greek letters (Alpha, Beta, Alpha Chi, etc.)
  - Example: Sigma Chi at Penn State = "Alpha Chi"
  - Example: Sigma Chi at Miami University (Ohio) = "Alpha" (the mother chapter)

## Import Process

### Step 1: Receive Roster Data
When you receive a roster list, it will contain:
- Full names (First Middle Last)
- Member type (Undergrad, Grad, Alumni)
- Status (Active, Inactive, Suspended)
- Email addresses
- Phone numbers

### Step 2: Identify Chapter Information
Extract:
- Organization name (e.g., "Sigma Chi")
- University name (e.g., "Pennsylvania State University" or "Penn State")
- Chapter designation (e.g., "Alpha Chi")
- Total member count

### Step 3: Parse the Data
Use the Node.js parsing script pattern:

```javascript
function parseName(fullName) {
  const parts = fullName.trim().split(' ');
  return {
    firstName: parts[0],
    lastName: parts[parts.length - 1],
    middleName: parts.slice(1, -1).join(' ') || null,
    fullName: fullName.trim()
  };
}

function parseRoster(rosterText) {
  const lines = rosterText.trim().split('\n');
  const members = [];

  for (const line of lines) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length !== 5) continue;

    const [fullName, memberType, status, email, phone] = parts;
    members.push({
      ...parseName(fullName),
      email,
      phone,
      member_type: memberType,
      status,
      chapter_name: '{CHAPTER_DESIGNATION}' // e.g., "Alpha Chi"
    });
  }

  return members;
}
```

### Step 4: Get Database IDs
Before importing, retrieve:
```sql
-- Get organization ID
SELECT id FROM organizations WHERE name = 'Sigma Chi';

-- Get university ID
SELECT id FROM universities WHERE name = 'Pennsylvania State University';

-- Get or create chapter ID
SELECT id FROM chapters
WHERE organization_id = '{org_id}'
AND universities_id = '{university_id}';
```

### Step 5: Import Members
Use bulk insert:

```javascript
const { data, error } = await supabase
  .from('members')
  .insert(members.map(m => ({
    first_name: m.firstName,
    middle_name: m.middleName,
    last_name: m.lastName,
    full_name: m.fullName,
    email: m.email,
    phone: m.phone,
    member_type: m.member_type,
    status: m.status,
    chapter_name: m.chapter_name,
    chapter_id: chapterId,
    organization_id: orgId,
    university_id: universityId
  })));
```

## Leadership Data Pattern

### When Leadership Data is Provided
Leadership will typically come as:
- Member name
- Position title (President, Vice President, Treasurer, etc.)
- Term dates (optional)

### Leadership Categories:
- **Executive**: President, Vice President, Secretary
- **Financial**: Treasurer, Finance Chair
- **Social**: Social Chair, Brotherhood Chair
- **Philanthropy**: Philanthropy Chair, Community Service Chair
- **Recruitment**: Recruitment Chair, Rush Chair
- **Operations**: House Manager, Risk Management Chair
- **Other**: Various committee chairs

### Import Leadership Positions:
```javascript
// 1. Create position if it doesn't exist
const { data: position } = await supabase
  .from('leadership_positions')
  .insert({
    title: 'President',
    category: 'Executive',
    level: 0,
    chapter_id: chapterId,
    organization_id: orgId,
    is_active: true
  })
  .select()
  .single();

// 2. Assign member to position
await supabase
  .from('member_leadership')
  .insert({
    member_id: memberId,
    position_id: position.id,
    start_date: '2024-01-01',
    is_current: true
  });
```

## Example: Sigma Chi Alpha Chi (Penn State)

### What We Received:
- **Organization**: Sigma Chi
- **University**: Pennsylvania State University
- **Chapter**: Alpha Chi
- **Total Members**: 142
- **Format**: Name | Type | Status | Email | Phone

### What We Did:
1. Created members table schema
2. Parsed 142 member records
3. Stored chapter designation as "Alpha Chi"
4. Ready to add leadership positions when provided

## Future Imports

### When You Receive New Roster Data:

1. **Identify the pattern**:
   ```
   Is it: Name | Type | Status | Email | Phone?
   Or a different format?
   ```

2. **Extract chapter info**:
   - What organization?
   - What university?
   - What's the chapter designation?

3. **Run the parser**:
   ```bash
   node scripts/parse-roster.js [roster-file]
   ```

4. **Get database IDs**:
   - Look up organization_id
   - Look up university_id
   - Get or create chapter_id

5. **Import members**:
   ```bash
   node scripts/import-members.js [parsed-data] [chapter-id]
   ```

6. **If leadership data included**:
   ```bash
   node scripts/import-leadership.js [leadership-data] [chapter-id]
   ```

## Data Quality Checks

After import, verify:
```sql
-- Check total member count
SELECT COUNT(*) FROM members WHERE chapter_id = '{chapter_id}';

-- Check member types distribution
SELECT member_type, COUNT(*)
FROM members
WHERE chapter_id = '{chapter_id}'
GROUP BY member_type;

-- Check status distribution
SELECT status, COUNT(*)
FROM members
WHERE chapter_id = '{chapter_id}'
GROUP BY status;

-- Check for duplicates
SELECT email, COUNT(*)
FROM members
WHERE chapter_id = '{chapter_id}'
GROUP BY email
HAVING COUNT(*) > 1;
```

## Notes for Future Reference

- **Email uniqueness**: The schema enforces UNIQUE(email, chapter_id) - same email can exist across different chapters
- **Chapter names**: Store the Greek letter designation (Alpha, Beta, Alpha Chi) in the chapter_name field
- **Phone formats**: Accept any format - we store as TEXT
- **Member types**: Only 'Undergrad', 'Grad', or 'Alumni' allowed
- **Status types**: Only 'Active', 'Inactive', 'Suspended', or 'Alumni' allowed

## File Locations

- Schema SQL: `/tmp/create_members_schema.sql`
- Parser template: `/backend/scripts/parse-roster-template.js`
- Import script: `/backend/scripts/import-members.js`
- This doc: `/backend/scripts/CHAPTER_IMPORT_PROCESS.md`
