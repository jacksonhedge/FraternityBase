# Prompt for Claude to Format Chapter CSV Data

## Copy and paste this entire prompt to Claude.ai (or Claude Desktop):

---

I need you to format fraternity/sorority chapter data into a CSV file for bulk import into my FraternityBase database.

**What I'll provide you:**
- Raw data with fraternity names, universities, and chapter designations (in any format)

**What I need from you:**
- A clean CSV file with these EXACT columns: `organization`, `university`, `chapter_name`, `grade`

**Requirements:**

1. **organization** column:
   - Full fraternity/sorority name (e.g., "Sigma Chi", "Kappa Alpha Order")
   - Use proper capitalization
   - No abbreviations - use full names

2. **university** column:
   - Full university name (e.g., "University of Virginia", "Virginia Tech")
   - Use proper capitalization
   - Spell out "University of" not "U of"

3. **chapter_name** column:
   - The chapter designation (e.g., "Alpha Chapter", "Beta Gamma Chapter")
   - If not provided, use format: "[Fraternity Name] at [University Name]"
   - Examples: "Sigma Chi Alpha", "Kappa Alpha Order Beta"

4. **grade** column:
   - Set ALL chapters to exactly: `3.0`
   - This is a numeric value, no quotes needed

**CSV Format Rules:**
- First row MUST be the header: `organization,university,chapter_name,grade`
- Use commas as delimiters
- Put university names in quotes if they contain commas
- No extra columns
- Each row is one chapter

**Example Output:**
```csv
organization,university,chapter_name,grade
Sigma Chi,University of Virginia,Alpha Chapter,3.0
Kappa Alpha Order,University of Virginia,Beta Chapter,3.0
Pi Kappa Alpha,"Virginia Polytechnic Institute and State University",Gamma Delta,3.0
Sigma Alpha Epsilon,James Madison University,Epsilon Chapter,3.0
```

**Important:**
- Clean up any inconsistent naming (e.g., "UVA" → "University of Virginia")
- Remove any duplicate entries
- Sort alphabetically by university, then by organization
- If a chapter name is missing, create one using: "[Greek letters] Chapter at [University short name]"

**My Data:**

[PASTE YOUR RAW DATA HERE]

---

Please format this into a clean CSV following the exact requirements above. Return ONLY the CSV content, no explanations.

---

## How to Use This Prompt:

1. **Copy everything above** (from "I need you to format..." to the end)
2. **Go to Claude.ai** or open Claude Desktop
3. **Paste the prompt**
4. **Add your raw data** at the bottom (replace [PASTE YOUR RAW DATA HERE])
5. **Send to Claude**
6. **Claude will return** a perfectly formatted CSV
7. **Copy the CSV output** and save as `chapters-bulk-import.csv`

## Then Upload:

### Option A: AI-Assisted Upload (Recommended)
Upload via: `POST /api/admin/process-csv-with-claude`
- Claude will automatically match organization/university names to database IDs
- More forgiving of slight name variations

### Option B: Direct Upload (After Getting IDs)
You'll need to:
1. Match org names to get `greek_organization_id` from database
2. Match university names to get `university_id` from database
3. Replace names with UUIDs in CSV
4. Upload via chapter creation endpoint

**Recommendation**: Use Option A (AI-assisted) - it's much easier!

---

## Example Raw Data Formats Claude Can Handle:

**Format 1: Table/Spreadsheet**
```
Sigma Chi - University of Virginia - Alpha
KA - UVA - Beta
Pike - Virginia Tech - Gamma
```

**Format 2: List**
```
- Sigma Chi at University of Virginia (Alpha Chapter)
- Kappa Alpha Order at UVA (Beta)
- Pi Kappa Alpha at Virginia Tech
```

**Format 3: Narrative**
```
We have Sigma Chi's Alpha chapter at the University of Virginia,
Kappa Alpha Order's Beta chapter also at UVA, and Pi Kappa Alpha
at Virginia Tech.
```

Claude can parse ANY format and convert it to the structured CSV you need!
