# Find Outreach Opportunities

Launch the **Opportunity Detection Agent** to identify high-value outreach opportunities from classified posts.

## What this does:
1. Analyzes classified posts to find actionable opportunities
2. Auto-creates outreach tasks for philanthropies (HIGH PRIORITY)
3. Flags exec board changes to update contact info
4. Extracts rush chair contacts for future outreach
5. Prioritizes based on relationship status and event timing

## Agent Details:
- **Agent Name:** `opportunity-flagging-agent`
- **Project:** FraternityBase (Supabase: `vvsawtexgpopqxgaqyxg`)

## Run the agent:
Launch the Task tool with subagent_type "general-purpose" to:

1. Query classified posts for opportunities:
   - **Philanthropy posts** → Create HIGH PRIORITY outreach opportunities
   - **Exec board posts** → Flag for contact data update
   - **Rush events** → Extract contact info (future opportunities)

2. For each philanthropy opportunity:
   - Create record in `outreach_opportunities` table
   - Set priority based on:
     - Chapter relationship_score (partner chapters = higher priority)
     - Event timing (happening soon = urgent)
     - Charity type (national charities = higher value)
   - Set outreach_deadline (event_date - 3 days)
   - Generate AI-suggested outreach message

3. For exec board changes:
   - Extract officer names and positions
   - Flag for `linkedin-contact-finder` agent to get LinkedIn profiles

4. Report summary:
   - X new philanthropy opportunities created
   - Y chapters need contact updates
   - Z high-priority outreach tasks pending

## Output:
- New records in `outreach_opportunities` table
- Prioritized action queue
- Email notification of high-value opportunities
