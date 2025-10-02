# CSV Roster Import Guide for FraternityBase

## Purpose
This guide helps you reformat any CSV file to work with the FraternityBase roster import feature.

## Required CSV Format

### Column Names (case-insensitive, flexible)
The import system accepts multiple variations of column names:

| Field | Accepted Column Names | Required? | Default Value |
|-------|---------------------|-----------|---------------|
| Name | `name`, `Name` | ✅ YES | - |
| Position | `position`, `Position`, `title`, `Title` | ❌ No | "Member" |
| Email | `email`, `Email` | ❌ No | empty |
| Phone | `phone`, `Phone` | ❌ No | empty |
| LinkedIn | `linkedin`, `LinkedIn`, `linkedin_profile` | ❌ No | empty |
| Graduation Year | `graduation_year`, `graduation year`, `grad_year`, `Graduation Year` | ❌ No | empty |
| Major | `major`, `Major` | ❌ No | empty |
| Member Type | `member_type`, `member type`, `type`, `Member Type` | ❌ No | "member" |
| Primary Contact | `is_primary_contact`, `is_primary`, `is primary` | ❌ No | false |

### Member Type Values
- `member` - Active member (default)
- `alumni` - Alumni/graduated member
- `advisor` - Chapter advisor
- `user` - General user

### Example CSV Structure

**Perfect CSV (all fields):**
```csv
name,position,email,phone,linkedin,graduation_year,major,member_type,is_primary
John Smith,President,john@example.com,555-1234,linkedin.com/in/johnsmith,2025,Business,member,true
Jane Doe,Vice President,jane@example.com,555-5678,linkedin.com/in/janedoe,2026,Marketing,member,false
Bob Jones,Member,bob@example.com,,,2027,Engineering,member,false
```

**Minimal CSV (only required field):**
```csv
name
John Smith
Jane Doe
Bob Jones
```

**CSV with Missing/Null Fields:**
```csv
name,position,email,phone,linkedin,graduation_year,major
John Smith,President,john@example.com,555-1234,,2025,Business
Jane Doe,Vice President,jane@example.com,,,,
Bob Jones,,,,,2027,
```

## Instructions for Claude to Reformat CSVs

### Prompt Template

```
Please reformat this CSV file for the FraternityBase roster import system.

REQUIRED OUTPUT FORMAT:
- Column headers: name,position,email,phone,linkedin,graduation_year,major,member_type,is_primary_contact
- Keep ALL rows of data
- Map existing columns to the correct names (case-insensitive matching)
- For missing/null values: leave the cell empty (don't write "null", "N/A", or "empty")
- Ensure 'name' column has valid data (required field)
- Set default values:
  - position: "Member" if empty
  - member_type: "member" if empty
  - is_primary_contact: "false" if empty

CURRENT CSV:
[paste your CSV here]

Please output ONLY the reformatted CSV, no explanations.
```

### Example Reformatting Task

**Input CSV:**
```csv
Full Name,Role,Email Address,Cell Phone,LinkedIn Profile,Expected Graduation,Field of Study
John Smith,Pres,john@psu.edu,(555) 123-4567,https://linkedin.com/in/johnsmith,2025,Business Administration
Jane Doe,,jane@psu.edu,,,2026,
Bob Jones,Treasurer,bob@psu.edu,555-9999,,2025,Finance
```

**Reformatted Output:**
```csv
name,position,email,phone,linkedin,graduation_year,major,member_type,is_primary_contact
John Smith,President,john@psu.edu,(555) 123-4567,https://linkedin.com/in/johnsmith,2025,Business Administration,member,false
Jane Doe,Member,jane@psu.edu,,,2026,,member,false
Bob Jones,Treasurer,bob@psu.edu,555-9999,,2025,Finance,member,false
```

## Common Data Cleaning Tasks

### 1. Handle Multiple Column Name Formats
```
"Full Name" → "name"
"Role" or "Title" → "position"
"Email Address" → "email"
"Cell Phone" or "Mobile" → "phone"
"LinkedIn Profile" or "LinkedIn URL" → "linkedin"
"Expected Graduation" or "Grad Year" → "graduation_year"
"Field of Study" or "Degree" → "major"
```

### 2. Handle Empty/Null Values
- ❌ DON'T: `null`, `N/A`, `none`, `empty`, `-`
- ✅ DO: Leave cell completely empty (nothing between commas)

### 3. Clean Phone Numbers
- Keep formatting as-is: `(555) 123-4567`, `555-123-4567`, `5551234567` all work

### 4. Clean LinkedIn URLs
- Keep full URL: `https://linkedin.com/in/username`
- Or just handle: `linkedin.com/in/username`

### 5. Position Standardization (Optional but Recommended)
Common positions:
- President
- Vice President
- Treasurer
- Secretary
- Social Chair
- Philanthropy Chair
- Risk Management
- Member (default)

### 6. Remove Extra Columns
Only include columns from the accepted list. Remove:
- Chapter name (automatically set during import)
- University name (automatically set during import)
- ID numbers
- Addresses
- Any other custom fields

## Quick Reference: Column Mapping

| Your Column | Maps To | Example |
|-------------|---------|---------|
| Full Name, Student Name | name | John Smith |
| Role, Title, Office | position | President |
| Email Address, Student Email | email | john@example.com |
| Cell, Mobile, Phone Number | phone | 555-1234 |
| LinkedIn, LinkedIn URL, Profile | linkedin | linkedin.com/in/john |
| Grad Year, Class Year | graduation_year | 2025 |
| Field, Degree, Program | major | Business |
| Type, Status | member_type | member |
| Primary, Main Contact | is_primary_contact | true |

## Validation Checklist

Before uploading your CSV, verify:
- [ ] File is saved as `.csv` format (not .xlsx, .xls, .txt)
- [ ] First row contains column headers
- [ ] `name` column exists and has data in every row
- [ ] No extra quotation marks around empty fields
- [ ] No "null" or "N/A" text - just leave cells empty
- [ ] File encoding is UTF-8 (handles special characters)
- [ ] No extra blank rows at the end

## Troubleshooting

### Issue: "Failed to import some members"
**Solutions:**
- Check that every row has a name (required field)
- Remove special characters from column names
- Ensure no rows are completely blank
- Check for proper CSV formatting (commas not inside quotes)

### Issue: "All members imported with position 'Member'"
**Solution:**
- Check your position column is named correctly: `position`, `Position`, `title`, or `Title`
- Make sure positions aren't blank

### Issue: "Graduation year showing as 0"
**Solution:**
- Ensure graduation_year column contains only numbers (2025, 2026, etc.)
- Remove text like "Class of 2025" - use just "2025"

### Issue: "LinkedIn URLs not importing"
**Solution:**
- Column must be named: `linkedin`, `LinkedIn`, or `linkedin_profile`
- URLs can be full (https://linkedin.com/in/user) or partial (linkedin.com/in/user)

## Advanced: Batch Processing Multiple Chapters

If you have rosters for multiple chapters in one CSV:

**Option 1: Split by Chapter**
```
Please split this CSV into separate files, one for each chapter listed in the 'chapter' column.
Remove the 'chapter' and 'university' columns from each file.
Name each file: [fraternity]_[university]_roster.csv
```

**Option 2: Filter Specific Chapter**
```
Please filter this CSV to only include rows where chapter = "Sigma Chi" and university = "Penn State University".
Remove the chapter and university columns.
Output as: sigma_chi_penn_state_roster.csv
```

## Contact & Support

For issues with CSV import:
1. Check this guide for formatting requirements
2. Test with a small sample (3-5 rows) first
3. Contact admin if errors persist after formatting correctly
