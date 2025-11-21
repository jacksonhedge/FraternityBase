# Scrape Instagram Posts

Launch the **Instagram Intelligence Agent** to scrape Instagram posts from all monitored chapters.

## What this does:
1. Connects to Apify MCP Server
2. Uses Instagram scraper actors to pull recent posts
3. Extracts captions, images, engagement data, hashtags
4. Stores everything in the `instagram_posts` table in Supabase
5. Reports back which chapters have new content

## Agent Details:
- **Agent Name:** `instagram-scraper-apify`
- **Uses:** Apify MCP Server + Instagram Scraper actors
- **Project:** FraternityBase (Supabase: `vvsawtexgpopqxgaqyxg`)

## Run the agent:
Launch the Task tool with subagent_type "general-purpose" to:

1. Query the `chapters` table for all chapters with `instagram_handle` populated
2. For each chapter Instagram account:
   - Use Apify Instagram scraper to get last 20-50 posts
   - Extract: post_url, caption, post_date, image_url(s), likes, comments, hashtags
   - Store in `instagram_posts` table with proper `chapter_id` link
3. Report summary:
   - How many chapters scraped
   - How many new posts found
   - Which chapters have recent activity (posts in last 7 days)
   - Any errors or issues

## Output:
- Populated `instagram_posts` table
- Summary report of chapter activity
- List of chapters with recent updates
