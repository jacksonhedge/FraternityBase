# Import Chapter Data

Launch the **Chapter Data Importer Agent** to import chapter information from CSV.

## What this does:
1. Accepts CSV file with columns: chapter_name, college/university, instagram_handle
2. Validates and cleans data
3. Matches to existing chapters OR creates new ones
4. Updates Instagram handles for tracking
5. Reports any issues or duplicates

## Agent Details:
- **Agent Name:** `chapter-data-importer`
- **Project:** FraternityBase (Supabase: `vvsawtexgpopqxgaqyxg`)

## CSV Format Expected:
```csv
chapter_name,university,instagram_handle
Sigma Chi,University of Michigan,@sigmachiumich
Pi Kappa Alpha,Penn State University,@pikepennstate
Zeta Beta Tau,Penn State University,@zbtpsu
```

## Run the agent:
Launch the Task tool with subagent_type "general-purpose" to:

1. Read CSV file from provided path
2. For each row:
   - Clean and validate data
   - Use fuzzy matching to find existing chapter in database
   - If found: Update `instagram_handle` field
   - If not found: Create new chapter record using `/api/admin/chapters/quick-add`
3. Track results:
   - X chapters updated
   - Y new chapters created
   - Z errors/duplicates
4. Generate summary report

## Output:
- Updated/created chapters in database
- All chapters now have Instagram handles for monitoring
- Error report for any failed imports

## Next Steps After Import:
1. Run `/scrape-instagram` to start collecting post data
2. Run `/classify-posts` to analyze the content
3. Run `/find-opportunities` to identify outreach targets
