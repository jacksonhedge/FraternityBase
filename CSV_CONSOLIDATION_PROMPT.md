# CSV Consolidation Prompt for Claude

Copy and paste this prompt to Claude along with your 15 CSV files:

---

I have 15 different CSV files containing fraternity/sorority chapter member data. I need you to consolidate them into a single standardized CSV file that matches the FraternityBase database format.

## Required Output Format

Create ONE consolidated CSV with these exact columns (in this order):

```
name,position,email,phone,linkedin,graduation_year,major,member_type,is_primary_contact
```

## Column Definitions:

1. **name** (REQUIRED) - Full name of the member
2. **position** - Their role in the chapter (President, Vice President, Treasurer, Social Chair, Member, etc.)
3. **email** - Email address (leave blank if not available)
4. **phone** - Phone number (leave blank if not available)
5. **linkedin** - LinkedIn profile URL (just the username or full URL)
6. **graduation_year** - Year they graduate (e.g., 2025, 2026)
7. **major** - Their field of study
8. **member_type** - One of: "officer", "member", "alumni", "new_member"
9. **is_primary_contact** - "true" or "false" (set to "true" for President/main contact only)

## Instructions:

1. **Analyze all 15 CSV files** and identify the column headers in each
2. **Map the columns** from each CSV to the required format above
3. **Standardize the data**:
   - Clean up phone numbers (remove special characters, keep digits and +)
   - Normalize position titles (e.g., "Pres" → "President", "VP" → "Vice President")
   - Determine member_type based on position (officers = "officer", others = "member")
   - Mark only the President or primary contact as is_primary_contact = "true"
   - Format graduation years as 4-digit numbers
4. **Remove duplicates** - If the same person appears in multiple CSVs, keep the row with the most complete information
5. **Handle missing data** - Leave cells blank (not "N/A" or "null") if data is missing
6. **Output a single CSV file** with all members from all 15 files combined

## Important Notes:

- Do NOT add chapter information (chapter name, university, etc.) - that's handled separately
- Do NOT add row numbers or IDs
- Keep the header row exactly as shown above
- If a CSV has unconventional column names, use your best judgment to map them
- If you're unsure about a mapping, note it in your response

## Example Output:

```csv
name,position,email,phone,linkedin,graduation_year,major,member_type,is_primary_contact
John Smith,President,john.smith@university.edu,555-123-4567,linkedin.com/in/johnsmith,2025,Business Administration,officer,true
Sarah Johnson,Vice President,sarah.j@university.edu,555-234-5678,linkedin.com/in/sarahjohnson,2025,Marketing,officer,false
Mike Williams,Member,mike.w@university.edu,,,2026,Computer Science,member,false
```

Please consolidate all 15 CSV files and provide the output as a downloadable CSV file.

---

## After Claude Consolidates:

1. Download the consolidated CSV file
2. Upload it to FraternityBase via the standard CSV upload endpoint
3. Or share it with me and I'll help you upload it to the correct chapter in the database

