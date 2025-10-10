# Daily Report Agent - Complete Setup

## 🎯 What is the Daily Report Agent?

A specialized AI agent with deep knowledge of:
- **FraternityBase database** (1,106 universities, 89 chapters, 160 officers)
- **Backend architecture** (Express API, Supabase, Resend email)
- **Client management** (onboarding, subscriptions, reporting)
- **Chapter grading system** (5.0 = Premium, 4.5 = Introducable)
- **Daily reporting workflows** (automated email or manual PDF)

This agent can autonomously generate daily reports tracking new chapters, new roster members, and high-value partnership opportunities for your subscribed clients.

---

## 📂 Files Created

### Knowledge Base (Agent Brain)
1. **`DAILY_REPORT_AGENT_KNOWLEDGE_BASE.md`** - Complete knowledge (26,000+ words)
   - Database schema with all tables
   - Backend architecture
   - Client onboarding process
   - Chapter grading business logic
   - Query examples and troubleshooting

2. **`DAILY_REPORT_AGENT_INSTRUCTIONS.md`** - How to use the agent
   - Quick start commands
   - Common tasks
   - Example conversations
   - Workflow templates

3. **`DAILY_REPORT_AGENT_README.md`** - This file (overview)

### Implementation Files
4. **`backend/src/services/DailyReportService.ts`** - Core report generation service
5. **`backend/scripts/send-daily-reports.ts`** - Email-based reports
6. **`backend/scripts/generate-daily-report-pdf.ts`** - PDF-based reports (manual email)
7. **`backend/vercel.json`** - Cron schedule (daily at 8 AM EST)
8. **`DAILY_REPORTS_SETUP.md`** - Technical documentation

### Database Export
9. **`database/UNIVERSITIES_DATABASE.json`** - All 1,106 universities (for agent context)
10. **`database/UNIVERSITIES_DATABASE.csv`** - CSV format
11. **`database/UNIVERSITIES_DATABASE.txt`** - Human-readable format

---

## 🚀 How to Invoke the Daily Report Agent

### Option 1: Using Claude Code Task Tool

```bash
# In Claude Code, ask:
"Launch a general-purpose agent to handle the daily report.
The agent should:
1. Read DAILY_REPORT_AGENT_KNOWLEDGE_BASE.md
2. Generate today's daily report
3. Send via email OR generate PDFs for manual sending
4. Report back with results"
```

### Option 2: Direct Task Invocation

When working with the Task tool programmatically:

```typescript
Task({
  subagent_type: "general-purpose",
  description: "Generate daily reports",
  prompt: `You are the FraternityBase Daily Report Agent.

Your expertise:
- FraternityBase database (chapters, officers, companies)
- Backend API and services
- Client onboarding and management
- Report generation and distribution
- Chapter grading system (4.5+ = introducable)

CRITICAL: Read this knowledge base first:
/Users/jacksonfitzgerald/CollegeOrgNetwork/DAILY_REPORT_AGENT_KNOWLEDGE_BASE.md

Task: Generate and send today's daily report.

Steps:
1. Read the knowledge base thoroughly
2. Query database for last 24h changes
3. Run: npm run daily-report
4. Troubleshoot any issues
5. Report results

Use Supabase MCP tools for database queries.
Use Bash tool for running scripts.
Provide a comprehensive summary when done.`
})
```

---

## 🎨 Two Delivery Modes

### Mode 1: Automated Email (Recommended for Production)

**Status**: Implemented, requires domain verification

**How it Works**:
1. Vercel Cron triggers daily at 8 AM EST
2. Calls `/api/cron/send-daily-reports`
3. Generates personalized emails for each company
4. Sends via Resend email service
5. Logs delivery status

**Setup Required**:
- Verify domain at resend.com/domains (fraternitybase.com)
- Update `FROM_EMAIL` in .env
- Add `CRON_SECRET` to Vercel env vars
- Deploy with `vercel --prod`

**Command**:
```bash
npm run daily-report
```

**Current Limitation**:
Free Resend tier only sends to `jacksonfitzgerald25@gmail.com`. Domain verification removes this limit.

---

### Mode 2: PDF Generation (Works Now, Manual Email)

**Status**: Ready to use immediately

**How it Works**:
1. Run script manually or via agent
2. Generates HTML reports for each company
3. Converts to PDF (if puppeteer installed)
4. Saves to `backend/reports/[date]/` folder
5. You manually email PDFs to clients

**Setup Required**:
```bash
cd backend
npm install puppeteer  # Optional but recommended
```

**Command**:
```bash
npm run daily-report-pdf
```

**Output**:
```
backend/reports/2025-10-08/
  ├── daily-report-2025-10-08-hedge-inc.pdf
  ├── daily-report-2025-10-08-hedge-inc.html
  └── [more companies...]
```

**Pros**:
- Works immediately (no domain verification)
- Can review before sending
- Professional PDF format
- Full control

**Cons**:
- Manual work required
- Not automated
- No delivery tracking

---

## 🤖 Agent Capabilities

The Daily Report Agent can:

### ✅ Database Operations
- Query all tables via Supabase MCP
- Execute complex SQL queries
- Analyze relationships and trends
- Track changes over time

### ✅ Report Generation
- Generate HTML email reports
- Generate PDF reports
- Personalize for each company
- Include insights and trends

### ✅ Data Analysis
- Count new chapters (last 24h, week, month)
- Track new roster members
- Identify high-grade chapters (4.5+)
- Detect data quality issues

### ✅ Client Management
- Identify approved companies
- Get client email addresses
- Track client engagement
- Monitor unlock patterns

### ✅ Troubleshooting
- Debug email delivery issues
- Fix database query errors
- Resolve data inconsistencies
- Suggest improvements

---

## 📋 Common Agent Tasks

### Task 1: Daily Report (Automated)
```
Agent Prompt: "Generate today's daily report and send to all approved clients"

Agent Will:
1. Read knowledge base
2. Query database (new chapters, officers, high-grade)
3. Run: npm run daily-report
4. Report: "Sent to 2 companies (1 success, 1 failed - domain verification needed)"
```

### Task 2: Weekly Summary
```
Agent Prompt: "Generate a weekly summary report for the last 7 days"

Agent Will:
1. Read knowledge base
2. Query last 7 days of data
3. Analyze trends
4. Report: "12 new chapters, 45 new officers, 3 chapters upgraded to 5.0"
```

### Task 3: Custom Report for Client
```
Agent Prompt: "Create a custom report for Hedge, Inc. showing only SEC conference chapters"

Agent Will:
1. Read knowledge base
2. Query: WHERE conference = 'SEC'
3. Generate personalized report
4. Save as PDF or send email
```

### Task 4: Data Quality Audit
```
Agent Prompt: "Audit the database and report data quality issues"

Agent Will:
1. Read knowledge base
2. Run data quality queries
3. Report: "23 chapters missing grades, 12 missing member counts"
4. Suggest: "Prioritize updating these high-visibility chapters"
```

---

## 📊 Report Content

Each daily report includes:

### Section 1: New Chapters Added (Last 24h)
- Chapter name and university
- Greek organization
- Grade (with badges: ⭐ Premium, 🤝 Introducable)
- Member count

### Section 2: New Roster Members (Last 24h)
- Name and position
- Chapter and university
- Shows first 10, "+X more" if >10

### Section 3: Premium & Introducable Chapters
- Top chapters with grade 4.5+
- Why it matters (warm intro capability)
- Member counts and contact info availability
- Special badge for 4.5+ (warm intro available)

### Plus:
- Professional HTML design
- Mobile-responsive
- CTA button to platform
- Plain text fallback

---

## 🔑 Critical Business Logic

### Chapter Grade System

**5.0 - Premium** ⭐⭐⭐⭐⭐
- Full roster (65+ members)
- Complete contact info
- All data fields populated
- **Cost**: 40 credits ($11.99)

**4.5 - Introducable** 🤝 ⭐ **← MOST IMPORTANT**
- High-quality verified data
- **SPECIAL**: Warm introduction available
- Partnership network access (College Casino Tour)
- **Cost**: 25 credits ($7.49) + $59.99 for intro
- **This is your competitive advantage**

**4.0-4.4 - High Quality**
- Good data, some contacts
- **Cost**: 25 credits ($7.49)

**3.5-3.9 - Standard**
- Basic complete data
- **Cost**: 20 credits ($5.99)

**<3.5 - Basic**
- Limited data
- **Cost**: 20 credits ($5.99)

### Why 4.5 Matters

The **4.5 threshold** is FraternityBase's secret sauce:
1. Sufficient verified info for warm intros
2. Within partnership network (College Casino Tour)
3. Higher conversion rate (warm referral vs cold)
4. Justifies premium $59.99 intro fee
5. Competitors can't replicate partnership network

**Keep confidential**: Don't expose partnership details in client reports.

---

## 🗄️ Database Quick Reference

### Key Tables for Reporting

| Table | Rows | Purpose | Key for Reporting |
|-------|------|---------|-------------------|
| `chapters` | 89 | Fraternity chapters | `created_at`, `grade` |
| `chapter_officers` | 160 | Roster members | `created_at`, `position` |
| `companies` | 3 | Client companies | `approval_status` |
| `universities` | 1,106 | All universities | `name`, `state` |
| `greek_organizations` | 30 | National orgs | `name` |
| `chapter_unlocks` | 1 | Purchase tracking | `unlocked_at` |

### Important Queries

**New chapters (24h)**:
```sql
SELECT * FROM chapters
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

**Introducable chapters**:
```sql
SELECT * FROM chapters
WHERE grade >= 4.5
ORDER BY grade DESC;
```

**Approved companies with emails**:
```sql
SELECT c.id, c.name, up.user_id
FROM companies c
JOIN user_profiles up ON up.company_id = c.id
WHERE c.approval_status = 'approved';
-- Then: supabase.auth.admin.getUserById(user_id) for email
```

---

## 🧪 Testing the Agent

### Test 1: Manual Daily Report
```bash
cd backend
npm run daily-report
```

**Expected Output**:
```
📊 FraternityBase Daily Report Generator
============================================================
Started at: 10/8/2025, 9:00:00 AM
============================================================

Starting daily report generation...
Found 2 approved companies
Generating report for Hedge, Inc....
✓ Report sent to Hedge, Inc. (jacksonfitzgerald25@gmail.com)
Generating report for Hedge, Inc....
✗ Failed (domain verification needed)

============================================================
✨ Daily Report Summary
============================================================
✓ Sent: 1
✗ Failed: 1
Total: 2
Completed at: 10/8/2025, 9:00:05 AM
============================================================
```

### Test 2: PDF Generation
```bash
cd backend
npm run daily-report-pdf
```

**Expected Output**:
```
📊 FraternityBase Daily Report PDF Generator
============================================================
Found 2 approved companies

✓ New chapters: 0
✓ New officers: 0
✓ High-grade chapters: 42

Generating report for Hedge, Inc...
✓ HTML saved to: reports/2025-10-08/daily-report-2025-10-08-hedge-inc.html
✓ PDF saved to: reports/2025-10-08/daily-report-2025-10-08-hedge-inc.pdf

============================================================
✨ Report Generation Summary
============================================================
✓ Successful: 2
✗ Failed: 0
Output Directory: reports/2025-10-08/
============================================================
```

### Test 3: Database Query (via Agent)
```
Ask agent: "How many chapters have grade 4.5 or higher?"

Agent uses:
mcp__supabase__execute_sql({
  project_id: "vvsawtexgpopqxgaqyxg",
  query: "SELECT COUNT(*) FROM chapters WHERE grade >= 4.5"
})

Agent reports: "42 chapters have grade 4.5+ (introducable)"
```

---

## 🚨 Troubleshooting

### Issue: No approved companies

**Symptom**: Report says "Found 0 approved companies"

**Fix**:
```sql
-- Check companies
SELECT name, approval_status FROM companies;

-- Approve a company
UPDATE companies
SET approval_status = 'approved',
    approved_at = NOW(),
    approved_by = 'admin@fraternitybase.com'
WHERE name = 'Right Coach';
```

### Issue: Email fails with 403 error

**Symptom**: "You can only send testing emails to your own email address"

**Fix**: This is expected on free Resend tier. Options:
1. Verify domain at resend.com/domains
2. Use PDF generation mode instead
3. For testing: Use jacksonfitzgerald25@gmail.com

### Issue: No new data in report

**Symptom**: All sections say "No new chapters/officers"

**Status**: This is normal! Only sends data from last 24 hours.

**Expected**: Empty sections if no data added recently. High-grade section always has data.

### Issue: Duplicate companies

**Known Issue**: Two "Hedge, Inc." companies in database

**Fix**: Agent automatically deduplicates when fetching emails.

---

## 📈 Success Metrics

Track these via agent or manual queries:

### Daily Report Performance
- **Delivery Rate**: >95% (currently: 50% due to domain verification)
- **Companies**: 2 approved (target: 10+)
- **Data Freshness**: New data added daily

### Database Growth
- **New Chapters/Week**: 5-15 target
- **New Officers/Week**: 20-50 target
- **High-Grade Chapters**: 42 current (4.5+)
- **Total Universities**: 1,106

### Client Engagement
- **Unlocks/Week**: Track via `chapter_unlocks`
- **Credit Purchases**: Track via `balance_transactions`
- **Warm Intro Requests**: Track via `warm_intro_requests`

---

## 🎯 Next Steps

### Immediate (You Can Do Now)
1. ✅ Test PDF generation: `npm run daily-report-pdf`
2. ✅ Review generated PDFs in `backend/reports/[date]/`
3. ✅ Manually email PDFs to clients
4. ✅ Ask agent to generate weekly summary

### Short-term (This Week)
1. ⏳ Verify fraternitybase.com domain in Resend
2. ⏳ Update FROM_EMAIL in .env
3. ⏳ Deploy to production with `vercel --prod`
4. ⏳ Test automated daily emails

### Long-term (Future)
1. 📋 Add more companies (approve "Right Coach")
2. 📋 Grow chapter database (add more 4.5+ chapters)
3. 📋 Custom report preferences per company
4. 📋 Weekly digest option
5. 📋 Slack/Discord integration

---

## 📞 How to Use the Agent (Step by Step)

### Example 1: Generate Today's Report

**You**: "Hey Claude, I need you to use the Daily Report Agent to generate today's report"

**Claude**: *Launches general-purpose agent*

**Agent**:
1. Reads DAILY_REPORT_AGENT_KNOWLEDGE_BASE.md
2. Queries database for last 24h changes
3. Runs `npm run daily-report`
4. Reports back: "Daily report complete. Sent to 2 companies. 1 success (jacksonfitzgerald25@gmail.com), 1 failed (domain verification needed)."

### Example 2: Generate PDFs

**You**: "Generate PDFs for manual email distribution"

**Agent**:
1. Reads knowledge base
2. Runs `npm run daily-report-pdf`
3. Reports: "PDFs generated in backend/reports/2025-10-08/. 2 files created. Ready for manual email."

### Example 3: Analyze This Week

**You**: "What's new in the database this week?"

**Agent**:
1. Reads knowledge base
2. Queries last 7 days
3. Reports: "This week: 0 new chapters, 0 new officers (no activity). Database has 89 chapters total, 42 with grade 4.5+."

---

## 📚 Additional Resources

### Documentation Files
- **`DAILY_REPORT_AGENT_KNOWLEDGE_BASE.md`** - Complete agent knowledge (26K+ words)
- **`DAILY_REPORT_AGENT_INSTRUCTIONS.md`** - How to use the agent
- **`DAILY_REPORTS_SETUP.md`** - Technical setup guide
- **`CHAPTER_GRADING_SYSTEM.md`** - Business logic details
- **`BUSINESS_LOGIC_NOTES.md`** - Quick reference

### Implementation Files
- **`backend/src/services/DailyReportService.ts`** - Core service
- **`backend/scripts/send-daily-reports.ts`** - Email script
- **`backend/scripts/generate-daily-report-pdf.ts`** - PDF script
- **`backend/vercel.json`** - Cron config

### Database Access
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Project ID**: vvsawtexgpopqxgaqyxg
- **Tables**: chapters, chapter_officers, companies, universities

---

## ✨ Summary

You now have a **fully-functional Daily Report Agent** that:

✅ **Understands** your entire database schema
✅ **Knows** your business logic (grades, pricing, partnerships)
✅ **Tracks** new chapters, officers, and high-value opportunities
✅ **Generates** professional HTML emails or PDFs
✅ **Can be invoked** via Claude Code Task tool
✅ **Works now** via PDF mode (manual email)
✅ **Will be automated** once domain verified (Resend)

**To invoke the agent**, simply ask Claude:

> "Launch the Daily Report Agent to [your specific task]"

The agent will read its knowledge base and execute autonomously.

**Have a safe trip!** 🚀

---

**Created**: October 8, 2025
**For**: FraternityBase Daily Reporting
**Agent**: general-purpose with specialized knowledge
**Status**: Ready to use
