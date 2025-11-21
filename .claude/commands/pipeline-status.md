# Check Pipeline Status

Get a comprehensive status report of the entire FraternityBase intelligence pipeline.

## What this does:
- Shows counts and stats for all pipeline stages
- Identifies bottlenecks or issues
- Suggests next actions

## Run the agent:
Launch the Task tool with subagent_type "general-purpose" to query Supabase and report:

## 📊 Status Report:

### Data Collection
- Total chapters being monitored: X
- Chapters with Instagram handles: X
- Total Instagram posts scraped: X
- Posts scraped in last 7 days: X
- Chapters with recent activity: X

### Classification
- Total posts classified: X
- Unclassified posts pending: X
- Breakdown by type:
  - Philanthropies: X
  - Rush events: X
  - Exec board: X
  - Pledge class: X
  - Other: X

### Opportunities
- Total opportunities created: X
- High priority pending: X
- In progress: X
- Completed: X

### Outreach
- LinkedIn connections sent: X (last 24h)
- Responses received: X
- Deals in progress: X

### Recommendations
- "You have X unclassified posts - run /classify-posts"
- "Found X new philanthropy opportunities - run /find-opportunities"
- "X high-priority outreach pending - run /linkedin-outreach"

## Output:
- Comprehensive dashboard-style report
- Action recommendations
- System health check
