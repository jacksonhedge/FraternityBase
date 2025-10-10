# CSV Upload Quick Reference

## 🚀 Quick Start

### Upload Chapter Roster (Most Common)

1. **Get Chapter ID**:
```sql
SELECT id, chapter_name FROM chapters WHERE chapter_name LIKE '%Sigma Chi%';
```

2. **Prepare CSV** with these columns:
```
name,email,position,graduation_year,member_type
```

3. **Upload via API**:
```bash
POST /api/admin/chapters/:chapterId/upload-roster
Header: x-admin-token: YOUR_ADMIN_TOKEN
Body: multipart/form-data with 'csv' file
```

4. **Or use AI-assisted**:
```bash
POST /api/admin/process-csv-with-claude
Header: x-admin-token: YOUR_ADMIN_TOKEN
Body: multipart/form-data with 'csv' file
Optional: 'prompt' field with instructions
```

---

## 📋 Required Fields Cheat Sheet

| Upload Type | Required Fields | Key Optional Fields |
|-------------|----------------|---------------------|
| **Chapter Roster** | `name` | `email`, `position`, `graduation_year` |
| **Chapters** | `chapter_name`, `university_id`, `greek_organization_id` | `grade`, `member_count` |
| **Universities** | `name` | `state`, `student_count`, `greek_percentage` |
| **Greek Orgs** | `name`, `greek_letters` | `organization_type`, `founded_year` |

---

## ⚡ Common Patterns

### Pattern 1: Simple Roster with Emails
```csv
name,email,position
John Smith,john@university.edu,President
Sarah Johnson,sarah@university.edu,Vice President
```

### Pattern 2: Full Roster with All Details
```csv
name,position,email,phone,graduation_year,major,member_type
John Smith,President,john@university.edu,(555) 123-4567,2025,Business,officer
```

### Pattern 3: Universities Batch
```csv
name,state,student_count,greek_percentage
"University of Virginia",VA,25000,0.30
"Virginia Tech",VA,34000,0.18
```

---

## 🎯 Grade System (CRITICAL)

For chapters, use these grade values:

| Grade | Meaning | Pricing | Special Feature |
|-------|---------|---------|-----------------|
| 5.0 | Premium | $11.99 (40 credits) | Full roster |
| 4.5 | **Introducable** 🤝 | $7.49 (25 credits) + $59.99 intro | **Warm intro available** |
| 4.0-4.4 | High Quality | $7.49 (25 credits) | - |
| 3.5-3.9 | Standard | $5.99 (20 credits) | - |
| <3.5 | Basic | $5.99 (20 credits) | - |

**Always use 4.5+ for chapters that qualify for warm introductions!**

---

## 🔧 Enum Values (Must Match Exactly)

### member_type
- `member` (default)
- `officer`
- `alumni`
- `advisor`

### organization_type
- `fraternity`
- `sorority`
- `honor_society`

### status (chapters)
- `active` (default)
- `inactive`
- `suspended`
- `colony`

---

## ⚠️ Common Mistakes

### ❌ Wrong Column Name
```csv
full_name,email  ← WRONG
```
```csv
name,email  ← CORRECT
```

### ❌ greek_percentage as Whole Number
```csv
greek_percentage
30  ← WRONG (interpreted as 3000%!)
```
```csv
greek_percentage
0.30  ← CORRECT (30%)
```

### ❌ grade Out of Range
```csv
grade
6.0  ← WRONG (max is 5.0)
```
```csv
grade
5.0  ← CORRECT
```

### ❌ Missing Email = Duplicates
```csv
name,position
John Smith,President
John Smith,President  ← Will insert duplicate!
```
```csv
name,position,email
John Smith,President,john@example.com
John Smith,President,john@example.com  ← Will update existing!
```

---

## 🛠️ Validation Checklist

Before uploading, verify:

- [ ] **File encoding**: UTF-8 (not Excel default)
- [ ] **Header row**: Present with exact column names
- [ ] **Required fields**: All populated
- [ ] **Enums**: Match exactly (case-sensitive)
- [ ] **Decimals**: greek_percentage as 0.0-1.0, grade as 0.0-5.0
- [ ] **UUIDs**: Valid format if required
- [ ] **Emails**: Include for deduplication
- [ ] **No empty names**: All name fields populated

---

## 📞 Quick Queries

### Get University IDs
```sql
SELECT id, name, state FROM universities
WHERE name LIKE '%Virginia%'
ORDER BY name;
```

### Get Greek Org IDs
```sql
SELECT id, name, greek_letters FROM greek_organizations
WHERE organization_type = 'fraternity'
ORDER BY name;
```

### Get Chapter IDs
```sql
SELECT
  c.id,
  c.chapter_name,
  u.name as university,
  g.name as organization
FROM chapters c
LEFT JOIN universities u ON c.university_id = u.id
LEFT JOIN greek_organizations g ON c.greek_organization_id = g.id
ORDER BY c.chapter_name;
```

### Check Recent Uploads
```sql
SELECT
  event_title,
  event_description,
  metadata,
  created_at
FROM admin_activity_log
WHERE event_type = 'admin_upload'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎨 Templates Location

Find ready-to-use templates in:
```
csv-templates/
├── chapter-roster-template.csv      ← Full roster with all fields
├── chapter-roster-minimal.csv       ← Minimal (name + email only)
├── universities-template.csv        ← University bulk upload
├── greek-organizations-template.csv ← Greek orgs
└── chapters-template.csv            ← Chapters (need IDs first)
```

---

## 🚀 AI-Assisted Upload (Flexible Format)

**When to use**:
- CSV has non-standard column names
- Don't have UUIDs handy
- Messy or inconsistent data
- Want automatic chapter matching

**Endpoint**: `POST /api/admin/process-csv-with-claude`

**Example Prompt**:
```
"This roster is for Sigma Chi at University of Virginia.
The 'Role' column maps to 'position'.
Anyone with Role='E-Board' should be member_type='officer'."
```

**What Claude Does**:
1. Identifies chapter from context
2. Maps flexible column names
3. Cleans and formats data
4. Validates quality
5. Returns structured JSON

**Response Format**:
```json
{
  "chapterId": "uuid-of-matched-chapter",
  "chapterName": "Sigma Chi",
  "universityName": "University of Virginia",
  "members": [...],
  "explanation": "Matched to Sigma Chi Alpha chapter...",
  "warnings": ["10 members missing emails"],
  "confidence": "high"
}
```

---

## 📊 Upload Results

After upload, you'll receive:

```json
{
  "success": true,
  "chapterId": "uuid",
  "chapterName": "Sigma Chi",
  "totalRecords": 50,
  "insertedCount": 35,
  "updatedCount": 15,
  "skippedCount": 0,
  "errors": []
}
```

**What counts mean**:
- **inserted**: New members added
- **updated**: Existing members updated (matched by email)
- **skipped**: Errors (invalid data, missing required fields)
- **errors**: First 10 error messages

---

## 💡 Pro Tips

### Tip 1: Always Include Email
Enables deduplication and future updates.

### Tip 2: Test with Small Batch
Upload 5 rows first, verify results, then upload full dataset.

### Tip 3: Use AI for Messy Data
Don't waste time reformatting - let Claude handle it.

### Tip 4: Keep Backups
Save original CSV before upload for rollback if needed.

### Tip 5: Check Activity Log
Verify upload success in admin_activity_log table.

### Tip 6: UTF-8 Encoding
Always save as "CSV UTF-8" not just "CSV" to preserve special characters.

### Tip 7: Grade 4.5 is Special
If chapter qualifies for warm intros, always set grade to at least 4.5!

---

## 🔍 Troubleshooting

### Upload returns 0 inserted
- Check: Header row present?
- Check: Column names exact match?
- Check: All 'name' fields populated?

### Foreign key violation error
- Check: UUIDs exist in database
- Fix: Query database for correct IDs first

### Duplicates inserted
- Check: Email field included?
- Fix: Always include email for deduplication

### Special characters broken
- Check: File saved as UTF-8?
- Fix: Re-save as "CSV UTF-8" in Excel/Sheets

### "Invalid enum value" error
- Check: Enums match exactly (case-sensitive)?
- Fix: Use exact values from reference above

---

## 📱 Quick Commands

**Start backend server**:
```bash
cd backend
npm run dev
```

**View upload logs**:
```bash
# Server console will show:
📁 Uploading 50 members for chapter: Sigma Chi
✅ Roster upload complete: 35 inserted, 15 updated, 0 skipped
```

**Curl upload example**:
```bash
curl -X POST http://localhost:3001/api/admin/chapters/CHAPTER_UUID/upload-roster \
  -H "x-admin-token: YOUR_TOKEN" \
  -F "csv=@roster.csv"
```

---

**Need help?** See full guide: `CSV_UPLOAD_GUIDE_COMPREHENSIVE.md`

**Last Updated**: October 8, 2025
