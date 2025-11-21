# LinkedIn Outreach Automation

Launch the **LinkedIn Outreach Agent** to automate personalized connection requests and messages.

## ⚠️ IMPORTANT WARNING:
This agent will log into YOUR LinkedIn account and send connection requests. LinkedIn may restrict accounts that send too many requests too quickly. Use with caution!

**Recommended limits:**
- Max 20 connection requests per day
- 2-3 minute delays between requests
- Only use for HIGH PRIORITY opportunities

## What this does:
1. Fetches pending outreach opportunities
2. Uses browser automation to log into LinkedIn
3. Finds President/Philanthropy Chair profiles
4. Sends personalized connection requests with notes
5. Tracks all actions for follow-up

## Agent Details:
- **Agent Name:** `linkedin-outreach-automation`
- **Uses:** Puppeteer/Playwright browser automation
- **Project:** FraternityBase (Supabase: `vvsawtexgpopqxgaqyxg`)

## Run the agent:
Launch the Task tool with subagent_type "general-purpose" to:

1. Query `outreach_opportunities` WHERE status = 'pending' AND priority = 'high'
2. For each opportunity (limit 10 per run):
   - Get chapter details and philanthropy info
   - Find primary_contact_linkedin (President or Philanthropy Chair)
   - Launch browser automation:
     - Navigate to LinkedIn profile
     - Click "Connect"
     - Add personalized note:
       ```
       Hey [Name], saw [Chapter] is hosting [Event] for [Charity].
       We'd love to sponsor - can we chat about how Bankroll/FanDuel
       can support your fundraising goals?
       ```
   - Wait 2-3 minutes (rate limiting)
   - Log action in `outreach_actions` table
3. Update opportunity status to 'contacted'
4. Report results

## Output:
- Connection requests sent
- Actions logged in `outreach_actions` table
- Summary email of outreach completed

## Safety Features:
- Rate limiting (max 10 per run, 2-3 min delays)
- Manual review mode available
- Dry-run option to preview messages without sending
