# Classify Instagram Posts

Launch the **Post Classification Agent** to analyze and categorize Instagram posts using AI.

## What this does:
1. Fetches unclassified posts from `instagram_posts` table
2. For each post:
   - Uses Claude Vision API to extract text from images (OCR)
   - Classifies post type: philanthropy, rush_event, exec_board, pledge_class, etc.
   - Extracts structured data (charity names, contact info, event dates)
3. Stores results in `post_classifications` table
4. Reports findings

## Agent Details:
- **Agent Name:** `post-classifier-vision`
- **Uses:** Claude Vision API + Claude Sonnet 4.5
- **Project:** FraternityBase (Supabase: `vvsawtexgpopqxgaqyxg`)

## Run the agent:
Launch the Task tool with subagent_type "general-purpose" to:

1. Query `instagram_posts` WHERE NOT EXISTS in `post_classifications` (unprocessed posts)
2. For each post:
   - If has images: Send to Claude Vision API to extract text (phone numbers, names, contact info)
   - Send caption + extracted image text to Claude with classification prompt
   - Classification categories:
     - `philanthropy` - Charity/fundraising events (HIGH VALUE!)
     - `rush_event` - Rush/recruitment events (extract rush chair contacts)
     - `exec_board` - New officer announcements (extract names/positions)
     - `pledge_class` - New member announcements
     - `general_event` - Social events, mixers
     - `awards` - Recognition posts
     - `other` - Everything else
   - Extract structured data based on type
3. Store in `post_classifications` with confidence scores
4. Report summary by category

## Output:
- Classified posts in `post_classifications` table
- Summary: X philanthropies, Y rush events, Z exec board changes
- High-confidence philanthropy opportunities flagged
