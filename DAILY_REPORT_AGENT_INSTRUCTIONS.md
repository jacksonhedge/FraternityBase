# How to Use the Daily Report Agent

## Quick Start

When you need help with daily reports, use this agent invocation:

```
Ask Claude to use the Task tool with subagent_type: "general-purpose"

Prompt: "You are the FraternityBase Daily Report Agent. Your expertise includes:
- Database schema and relationships
- Backend API and services
- Client onboarding and subscription management
- Report generation and distribution
- Chapter grading system (critical: 4.5+ = introducable)

Read the complete knowledge base:
/Users/jacksonfitzgerald/CollegeOrgNetwork/DAILY_REPORT_AGENT_KNOWLEDGE_BASE.md

Then [your specific task here]"
```

---

## Common Tasks

### 1. Generate Today's Daily Report

**Agent Task**:
```
Generate today's daily report by:
1. Reading DAILY_REPORT_AGENT_KNOWLEDGE_BASE.md
2. Querying database for:
   - New chapters (last 24h)
   - New officers (last 24h)
   - High-grade chapters (4.5+)
3. Running: npm run daily-report
4. Checking results and troubleshooting any issues
5. Reporting summary to user
```

### 2. Analyze Database Changes

**Agent Task**:
```
Analyze database changes over the last [X] days:
1. Read knowledge base
2. Query chapters, officers, unlocks tables
3. Identify trends and notable additions
4. Generate insights report
5. Suggest improvements
```

### 3. Generate Custom Report for Specific Client

**Agent Task**:
```
Create a custom report for [Company Name] showing:
1. Read knowledge base
2. Query data based on their interests
3. Generate personalized HTML email
4. Save to file or send directly
```

### 4. Check Data Quality

**Agent Task**:
```
Audit database data quality:
1. Read knowledge base
2. Run data quality queries
3. Identify missing grades, empty fields
4. Suggest chapters to update
5. Report findings
```

---

## Agent Capabilities

The Daily Report Agent can:

✅ **Query Database**
- Use Supabase MCP tools
- Execute complex SQL queries
- Analyze relationships between tables

✅ **Generate Reports**
- HTML email format
- Plain text format
- Custom formats on request

✅ **Monitor Changes**
- Track new chapters
- Track new roster members
- Identify grade changes

✅ **Provide Insights**
- Trend analysis
- Regional patterns
- Data quality metrics

✅ **Troubleshoot**
- Debug email delivery issues
- Fix query problems
- Resolve data inconsistencies

---

## Important Context Files

The agent should read these before any task:

1. **`DAILY_REPORT_AGENT_KNOWLEDGE_BASE.md`** (Required)
   - Complete database schema
   - Backend architecture
   - Business logic
   - Grading system

2. **`DAILY_REPORTS_SETUP.md`** (For setup tasks)
   - Technical implementation
   - Deployment instructions
   - Troubleshooting

3. **`CHAPTER_GRADING_SYSTEM.md`** (For grade-related tasks)
   - Business logic details
   - Partnership network info

4. **`BUSINESS_LOGIC_NOTES.md`** (Quick reference)
   - Key business rules

---

## Example Agent Conversations

### Example 1: Daily Report

**User**: "Generate and send today's daily report"

**Agent**:
1. Reads DAILY_REPORT_AGENT_KNOWLEDGE_BASE.md
2. Queries database for last 24h changes
3. Runs `npm run daily-report`
4. Reports: "Daily report generated. Found 3 new chapters, 12 new officers, 42 introducable chapters. Sent to 2 companies (1 success, 1 failed due to domain verification)."

### Example 2: Weekly Summary

**User**: "Give me a summary of this week's database activity"

**Agent**:
1. Reads knowledge base
2. Queries chapters/officers from last 7 days
3. Generates summary:
   - "This week: 12 new chapters across 8 states
   - 45 new roster members added
   - 3 chapters upgraded to 5.0 grade
   - Most active region: Southeast (ACC schools)
   - Notable: Sigma Chi at UVA achieved 5.0 with 87 members"

### Example 3: Custom Report

**User**: "Create a special report about all SEC conference chapters"

**Agent**:
1. Reads knowledge base
2. Queries: `SELECT * FROM chapters JOIN universities ON ... WHERE conference = 'SEC'`
3. Generates custom report highlighting SEC chapters
4. Saves as HTML file for manual review

---

## Key Things Agent Must Know

### Critical Business Logic

**4.5+ Grade = Introducable** 🤝
- Warm introduction available ($59.99)
- Partnership network access
- Competitive advantage
- KEEP CONFIDENTIAL: College Casino Tour relationship

**Grade Tiers**:
- 5.0 = Premium (40 credits)
- 4.5 = Introducable (25 credits)
- 4.0-4.4 = High Quality (25 credits)
- 3.5-3.9 = Standard (20 credits)
- <3.5 = Basic (20 credits)

### Database Relationships

```
companies (approved clients)
  ↓ (user_profiles)
auth.users (emails)

chapters (89)
  ← universities (1,106)
  ← greek_organizations (30)
  → chapter_officers (160)
  → chapter_unlocks (tracks purchases)
```

### RLS Important

Use `supabaseAdmin` (service role) for reporting, not regular `supabase` client. RLS blocks regular queries on:
- chapter_unlocks
- balance_transactions
- credit_transactions

---

## PDF Generation Option

If automated email doesn't work (domain verification issue), agent can generate PDF instead:

### Steps to Add PDF Generation

1. **Install puppeteer**:
```bash
cd backend
npm install puppeteer
```

2. **Create PDF generation script**:
```typescript
import puppeteer from 'puppeteer';

async function generatePDF(html: string, filename: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({
    path: filename,
    format: 'A4',
    printBackground: true
  });
  await browser.close();
}
```

3. **Generate PDFs for each company**:
```bash
# Agent would run modified script
npm run daily-report-pdf
# Outputs: daily-report-2025-10-08-hedge-inc.pdf
```

4. **User manually sends PDFs via email**

---

## Agent Workflow Template

```
DAILY REPORT AGENT WORKFLOW
===========================

1. PREPARATION
   ☐ Read DAILY_REPORT_AGENT_KNOWLEDGE_BASE.md
   ☐ Verify database access (Supabase MCP)
   ☐ Check environment variables available

2. DATA COLLECTION
   ☐ Query new chapters (last 24h)
   ☐ Query new officers (last 24h)
   ☐ Query high-grade chapters (4.5+)
   ☐ Query approved companies with emails

3. ANALYSIS
   ☐ Count totals
   ☐ Identify notable additions
   ☐ Check for anomalies
   ☐ Generate insights

4. GENERATION
   ☐ Create HTML email for each company
   ☐ Create plain text version
   ☐ Personalize with company name
   ☐ Include all sections

5. DELIVERY
   ☐ Send via Resend OR
   ☐ Generate PDF for manual send
   ☐ Log results

6. REPORTING
   ☐ Summarize to user
   ☐ Report any issues
   ☐ Suggest improvements
```

---

## Testing Commands

```bash
# Run daily report manually
npm run daily-report

# Test database connection
mcp__supabase__list_tables {
  "project_id": "vvsawtexgpopqxgaqyxg"
}

# Check recent chapters
mcp__supabase__execute_sql {
  "project_id": "vvsawtexgpopqxgaqyxg",
  "query": "SELECT COUNT(*) FROM chapters WHERE created_at >= NOW() - INTERVAL '24 hours'"
}

# Test email endpoint
curl -X POST http://localhost:3001/api/cron/send-daily-reports \
  -H "x-cron-secret: cron_secret_fra7ernity_b4se_2025"
```

---

## Success Checklist

After running daily report, agent should verify:

✅ All approved companies identified
✅ Emails/PDFs generated successfully
✅ Data accurate (no missing fields)
✅ No errors in console
✅ Delivery confirmed (or PDFs saved)
✅ Summary provided to user

---

## When to Escalate

Agent should ask user if:

❌ No approved companies found (unusual)
❌ Major database schema changes detected
❌ Email deliverability issues persist
❌ Data quality concerns (many missing grades)
❌ Unusual patterns (sudden spike/drop in data)

---

**Created**: October 8, 2025
**For**: FraternityBase Daily Reporting
**Agent Type**: general-purpose with specialized knowledge
