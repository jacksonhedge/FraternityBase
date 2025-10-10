# Daily Report Agent - Complete Knowledge Base

## Agent Purpose

The Daily Report Agent is responsible for monitoring the FraternityBase database, tracking meaningful changes, and preparing comprehensive reports for subscribed clients. This agent has deep expertise in:

- Database schema and relationships
- Backend API and services
- Client onboarding and subscription management
- Report generation and distribution
- Data quality and chapter grading system

---

## Database Schema Knowledge

### Core Tables for Reporting

#### 1. `chapters` (89 rows)
**Purpose**: Main table for fraternity/sorority chapters

**Key Columns**:
- `id` (uuid) - Primary key
- `chapter_name` (varchar) - Name of chapter
- `university_id` (uuid) - FK to universities
- `greek_organization_id` (uuid) - FK to greek_organizations
- `grade` (numeric) - **Critical for reporting** (0-5.0 scale)
  - 5.0 = Premium (full roster)
  - 4.5 = Introducable (warm intro available) ⭐
  - 4.0-4.4 = High quality
  - 3.5-3.9 = Standard
  - <3.5 = Basic
- `member_count` (integer)
- `officer_count` (integer)
- `created_at` (timestamp) - **Track for "new chapters"**
- `updated_at` (timestamp) - **Track for "updated chapters"**
- `instagram_handle`, `facebook_page`, `website`, `contact_email`
- `five_star_rating` (boolean) - Deprecated, use `grade >= 5.0`
- `is_viewable` (boolean) - Whether visible to clients

**Important Business Logic**:
```sql
-- Premium chapters (grade 5.0)
SELECT * FROM chapters WHERE grade >= 5.0;

-- Introducable chapters (grade 4.5 - can provide warm intros)
SELECT * FROM chapters WHERE grade >= 4.5 AND grade < 5.0;

-- New chapters (last 24 hours)
SELECT * FROM chapters WHERE created_at >= NOW() - INTERVAL '24 hours';
```

#### 2. `chapter_officers` (160 rows)
**Purpose**: Officers and roster members for each chapter

**Key Columns**:
- `id` (uuid)
- `chapter_id` (uuid) - FK to chapters
- `name` (varchar)
- `position` (varchar) - President, VP, etc.
- `email`, `phone`, `linkedin_profile`
- `graduation_year`, `major`
- `is_primary_contact` (boolean)
- `created_at` (timestamp) - **Track for "new roster additions"**
- `is_ambassador` (boolean)
- `ambassador_status` (varchar) - active, inactive, archived

**Reporting Query**:
```sql
-- New officers/members added (last 24 hours)
SELECT
  co.name, co.position, co.email,
  c.chapter_name,
  u.name as university_name
FROM chapter_officers co
JOIN chapters c ON c.id = co.chapter_id
JOIN universities u ON u.id = c.university_id
WHERE co.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY co.created_at DESC;
```

#### 3. `companies` (3 rows currently)
**Purpose**: Client companies that subscribe to FraternityBase

**Key Columns**:
- `id` (uuid)
- `name` (varchar)
- `industry`, `company_size`
- `approval_status` (varchar) - **Critical**: pending, approved, rejected
  - Only `approved` companies receive reports
- `credits_balance` (integer) - Current credit balance
- `created_at`, `updated_at`

**Current Companies**:
```
1. Hedge, Inc. (approved) - 2 user accounts
2. Right Coach (pending) - Not approved yet
```

#### 4. `user_profiles` (3 rows)
**Purpose**: Links auth.users to companies

**Key Columns**:
- `id` (uuid)
- `user_id` (uuid) - References auth.users(id)
- `company_id` (uuid) - FK to companies
- `role` (varchar) - admin, user, viewer
- `first_name`, `last_name`, `position`

**Get Client Emails**:
```sql
SELECT
  c.id, c.name,
  up.user_id
FROM companies c
JOIN user_profiles up ON up.company_id = c.id
WHERE c.approval_status = 'approved';

-- Then use Supabase Auth API:
-- supabase.auth.admin.getUserById(user_id) → returns email
```

#### 5. `universities` (1,106 rows)
**Purpose**: All universities where chapters exist

**Key Columns**:
- `id` (uuid)
- `name` (varchar) - Full university name
- `location`, `state`
- `student_count`, `greek_percentage`
- `bars_nearby`, `conference`

**Top States by University Count**:
- NY: 93
- PA: 93
- CA: 59
- TX: 53
- MA: 51

#### 6. `greek_organizations` (30 rows)
**Purpose**: National fraternities/sororities

**Key Columns**:
- `id` (uuid)
- `name` (varchar) - e.g., "Sigma Chi"
- `greek_letters` (varchar)
- `organization_type` - fraternity, sorority, honor_society
- `total_chapters`, `total_members`

#### 7. `chapter_unlocks` (1 row - RLS enabled)
**Purpose**: Tracks which chapters companies have unlocked

**Key Columns**:
- `company_id` (uuid)
- `chapter_id` (uuid)
- `unlock_type` - full, basic_info, roster, officers, warm_introduction
- `unlocked_at` (timestamp)
- `amount_paid` (numeric)

**Track Popular Chapters**:
```sql
-- Most unlocked chapters
SELECT
  c.chapter_name,
  u.name as university,
  COUNT(*) as unlock_count
FROM chapter_unlocks cu
JOIN chapters c ON c.id = cu.chapter_id
JOIN universities u ON u.id = c.university_id
GROUP BY c.id, c.chapter_name, u.name
ORDER BY unlock_count DESC;
```

#### 8. `balance_transactions` (15 rows - RLS enabled)
**Purpose**: All credit/dollar transactions

**Key Columns**:
- `company_id` (uuid)
- `amount_dollars` (numeric)
- `amount_credits` (integer)
- `transaction_type` - chapter_unlock, credit_purchase, refund, etc.
- `chapter_id` (uuid) - If related to chapter unlock
- `created_at` (timestamp)

---

## Backend Architecture

### Server: `backend/src/server.ts`

**Port**: 3001 (dev), varies in production

**Key Services**:
- **Supabase Client** (public) - Uses anon key, respects RLS
- **Supabase Admin** (service role) - Bypasses RLS, use for admin operations
- **Resend** - Email service (RESEND_API_KEY)
- **Stripe** - Payment processing
- **Anthropic** - AI assistant

### Important Endpoints

#### Admin Endpoints (require `x-admin-token` header)
```
GET  /api/admin/companies - List all companies
GET  /api/admin/companies/:id - Company details with unlocks/transactions
GET  /api/admin/chapters - List all chapters
POST /api/admin/chapters - Create chapter
PUT  /api/admin/chapters/:id - Update chapter
```

#### Cron Endpoints (require `x-cron-secret` header)
```
POST /api/cron/grant-monthly-credits - Grant monthly subscription credits
POST /api/cron/send-daily-reports - Send daily email reports (NEW)
```

#### Public Endpoints
```
GET  /api/chapters - List chapters (filtered by company if authenticated)
GET  /api/chapters/:id - Chapter details
POST /api/chapters/:id/unlock - Unlock chapter data (costs credits)
GET  /api/universities - List universities
POST /api/stripe/create-checkout-session - Purchase credits
```

### Environment Variables

```bash
# Supabase
SUPABASE_URL=https://vvsawtexgpopqxgaqyxg.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Email (Resend)
RESEND_API_KEY=re_2LTfhWVF_ECxpY9qrHh8ieGSAgs9mVPDM
ADMIN_EMAIL=jacksonfitzgerald25@gmail.com
FROM_EMAIL=onboarding@resend.dev

# Stripe
STRIPE_SECRET_KEY=sk_live_51RADm3GCEQehRVO2...
STRIPE_WEBHOOK_SECRET=whsec_c16c6c281ae675548c58e937c34834393...

# Auth
ADMIN_TOKEN=sk_admin_fra7ernity_b4se_sec2ret_92fj39
CRON_SECRET=cron_secret_fra7ernity_b4se_2025
```

---

## Client Onboarding Process

### Step 1: User Signs Up
1. User creates account via Supabase Auth
2. User fills out company information
3. Company record created with `approval_status = 'pending'`
4. User profile created, linked to company

### Step 2: Admin Approval
1. Admin reviews company in admin panel
2. Admin approves/rejects company
3. If approved:
   - `approval_status` → 'approved'
   - Company gains access to platform
   - **Company starts receiving daily reports**

### Step 3: Company Uses Platform
1. Browse chapters
2. Purchase credits (via Stripe)
3. Unlock chapter data (costs credits)
4. Request warm introductions (for grade 4.5+ chapters)

### Credit System
- **20 credits** = $5.99 (Basic chapters, <3.5 grade)
- **25 credits** = $7.49 (High quality, 4.0-4.4 grade)
- **40 credits** = $11.99 (Premium, 5.0 grade)
- **Warm Introduction** = $59.99 (for grade 4.5+ chapters)

---

## Chapter Grading System (Critical Business Logic)

### Grade Scale: 0 - 5.0

#### **5.0 - Premium** ⭐⭐⭐⭐⭐
- Full roster (65+ members)
- Complete contact info
- Social media links
- High data quality
- **Unlock Cost**: 40 credits ($11.99)

#### **4.5 - Introducable** 🤝 ⭐
- High-quality verified data
- **SPECIAL**: Warm introduction available ($59.99)
- Partnership network access (College Casino Tour - confidential)
- **Unlock Cost**: 25 credits ($7.49)
- **Competitive Advantage**: This is FraternityBase's secret sauce

#### **4.0-4.4 - High Quality**
- Good data with some contact info
- **Unlock Cost**: 25 credits ($7.49)

#### **3.5-3.9 - Standard**
- Basic complete data
- Social media presence
- **Unlock Cost**: 20 credits ($5.99)

#### **<3.5 - Basic**
- Limited data
- **Unlock Cost**: 20 credits ($5.99)

### Why Grade 4.5 Matters

The **4.5 threshold** is critical because:
1. **Data Quality**: Sufficient verified info for meaningful intros
2. **Relationship Access**: Within partnership network
3. **Success Rate**: Higher conversion via warm referral
4. **Premium Service**: Justifies $59.99 introduction fee
5. **Competitive Moat**: Partnership network is hard to replicate

**Important**: Keep partnership details confidential in client-facing reports.

---

## Daily Report Generation

### What to Track

#### 1. New Chapters (Last 24 Hours)
```sql
SELECT
  c.id,
  c.chapter_name,
  c.grade,
  c.member_count,
  c.created_at,
  u.name as university_name,
  g.name as greek_org_name
FROM chapters c
LEFT JOIN universities u ON u.id = c.university_id
LEFT JOIN greek_organizations g ON g.id = c.greek_organization_id
WHERE c.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY c.created_at DESC;
```

**Why it matters**: Shows clients we're actively adding new opportunities

#### 2. New Roster Members (Last 24 Hours)
```sql
SELECT
  co.id,
  co.name,
  co.position,
  co.email,
  co.created_at,
  c.chapter_name,
  u.name as university_name
FROM chapter_officers co
JOIN chapters c ON c.id = co.chapter_id
JOIN universities u ON u.id = c.university_id
WHERE co.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY co.created_at DESC;
```

**Why it matters**: Shows we're enriching data with contact details

#### 3. High-Grade Chapters (4.5+)
```sql
SELECT
  c.id,
  c.chapter_name,
  c.grade,
  c.member_count,
  u.name as university_name,
  g.name as greek_org_name,
  CASE WHEN c.grade >= 4.5 THEN true ELSE false END as is_introducable
FROM chapters c
LEFT JOIN universities u ON u.id = c.university_id
LEFT JOIN greek_organizations g ON g.id = c.greek_organization_id
WHERE c.grade >= 4.5
  AND c.is_viewable = true
ORDER BY c.grade DESC
LIMIT 50;
```

**Why it matters**: Highlights best partnership opportunities

#### 4. Chapters Updated (Last 24 Hours) - Optional
```sql
SELECT
  c.id,
  c.chapter_name,
  c.grade,
  c.updated_at,
  u.name as university_name
FROM chapters c
LEFT JOIN universities u ON u.id = c.university_id
WHERE c.updated_at >= NOW() - INTERVAL '24 hours'
  AND c.updated_at > c.created_at + INTERVAL '1 hour'  -- Exclude just-created
ORDER BY c.updated_at DESC;
```

**Why it matters**: Shows continuous data improvement

### Report Content Structure

#### Email Subject
```
📊 Daily FraternityBase Report - [Month Day]
```

#### Email Sections

1. **Header**
   - Professional gradient blue design
   - FraternityBase branding
   - Date

2. **Greeting**
   - Personalized: "Hello [Company Name]!"
   - Brief intro: "Here's your daily update..."

3. **Section 1: New Chapters Added**
   - Count in heading
   - List with badges:
     - ⭐ PREMIUM (5.0)
     - 🤝 INTRODUCABLE (4.5)
   - University name
   - Greek organization
   - Member count
   - Grade badge

4. **Section 2: New Roster Members**
   - Count in heading
   - Show first 10
   - "+X more" if >10
   - Name, position, chapter, university

5. **Section 3: Premium & Introducable Chapters**
   - Why it matters (warm intro capability)
   - Top 15 chapters
   - Grade badges
   - "💼 Warm introduction available" for 4.5+

6. **Call-to-Action**
   - Button: "View All Chapters"
   - Links to fraternitybase.com/chapters

7. **Footer**
   - Branding
   - Links to website, settings

### Report Delivery Options

#### Option A: Automated Email (Resend)
**Current Status**: Implemented but requires domain verification

**Pros**:
- Fully automated
- Professional email design
- Delivery tracking
- No manual work

**Cons**:
- Requires domain verification (fraternitybase.com)
- Free tier only sends to owner email

**Implementation**:
- Service: `DailyReportService.ts`
- Script: `scripts/send-daily-reports.ts`
- Endpoint: `POST /api/cron/send-daily-reports`
- Schedule: Vercel cron (vercel.json)

#### Option B: PDF Generation + Manual Email
**Status**: Can implement

**Pros**:
- Works immediately (no domain verification)
- Can be manually reviewed before sending
- Professional PDF format
- Can attach to personalized emails

**Cons**:
- Requires manual work daily
- Less scalable
- No delivery tracking

**Implementation Needed**:
- Install PDF library (puppeteer or pdfkit)
- Generate PDF from HTML template
- Save to local file
- Manually attach and send

---

## Report Agent Workflow

### Daily Routine (Automated)

**Time**: 8:00 AM EST (1:00 PM UTC)

**Steps**:
1. **Query Database**
   - New chapters (last 24h)
   - New roster members (last 24h)
   - High-grade chapters (4.5+)
   - Chapter updates (last 24h)

2. **Analyze Data**
   - Count totals
   - Identify notable additions (e.g., 5.0 chapters)
   - Check for anomalies (sudden spike, data issues)

3. **Generate Report**
   - Personalized for each company
   - Professional HTML email
   - Plain text fallback
   - Or PDF if manual mode

4. **Quality Check**
   - Verify data accuracy
   - Check for empty sections
   - Validate email addresses
   - Test links

5. **Send/Deliver**
   - If automated: Send via Resend
   - If manual: Generate PDF, notify admin
   - Log results

6. **Monitor**
   - Check delivery status
   - Track bounces/failures
   - Log metrics

### Ad-Hoc Requests

**Scenario**: "Send special report about new 5.0 chapters"

**Steps**:
1. Query for specific criteria
2. Generate custom report
3. Send to specific companies or all
4. Log special report

**Scenario**: "Client asks what's new this week"

**Steps**:
1. Query last 7 days instead of 24 hours
2. Generate weekly summary
3. Send directly to that client

---

## Key Files Reference

### Services
- `backend/src/services/DailyReportService.ts` - Report generation
- `backend/src/services/EmailNotificationService.ts` - Email sending
- `backend/src/services/CreditNotificationService.ts` - Low credit alerts

### Scripts
- `backend/scripts/send-daily-reports.ts` - Manual report execution
- `backend/scripts/export-universities.ts` - University data export

### Documentation
- `DAILY_REPORTS_SETUP.md` - Setup instructions
- `CHAPTER_GRADING_SYSTEM.md` - Business logic for grades
- `BUSINESS_LOGIC_NOTES.md` - Quick reference
- `STRIPE_INTEGRATION_GUIDE.md` - Payment setup

### Database Exports
- `database/UNIVERSITIES_DATABASE.json` - All 1,106 universities
- `database/UNIVERSITIES_DATABASE.csv` - CSV format
- `database/UNIVERSITIES_DATABASE.txt` - Human-readable

### Configuration
- `backend/.env` - Environment variables
- `backend/vercel.json` - Cron schedule
- `backend/package.json` - Scripts

---

## Common Queries for Agent

### Get All Approved Companies with Emails
```typescript
const { data: companies } = await supabase
  .from('companies')
  .select(`
    id,
    name,
    user_profiles (user_id)
  `)
  .eq('approval_status', 'approved');

// Then get emails via Supabase Auth
for (const company of companies) {
  const userId = company.user_profiles[0].user_id;
  const { data: user } = await supabase.auth.admin.getUserById(userId);
  const email = user?.user?.email;
}
```

### Get Recent Activity Summary
```sql
-- Last 7 days activity
SELECT
  'New Chapters' as type,
  COUNT(*) as count
FROM chapters
WHERE created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT
  'New Officers' as type,
  COUNT(*) as count
FROM chapter_officers
WHERE created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT
  'Chapter Unlocks' as type,
  COUNT(*) as count
FROM chapter_unlocks
WHERE unlocked_at >= NOW() - INTERVAL '7 days';
```

### Get Top Chapters by Grade
```sql
SELECT
  c.chapter_name,
  u.name as university,
  g.name as organization,
  c.grade,
  c.member_count,
  CASE
    WHEN c.grade >= 5.0 THEN 'Premium'
    WHEN c.grade >= 4.5 THEN 'Introducable'
    WHEN c.grade >= 4.0 THEN 'High Quality'
    ELSE 'Standard'
  END as tier
FROM chapters c
LEFT JOIN universities u ON u.id = c.university_id
LEFT JOIN greek_organizations g ON g.id = c.greek_organization_id
WHERE c.is_viewable = true
ORDER BY c.grade DESC
LIMIT 25;
```

### Check Data Quality
```sql
-- Chapters missing key data
SELECT
  COUNT(*) FILTER (WHERE grade IS NULL) as missing_grade,
  COUNT(*) FILTER (WHERE member_count IS NULL) as missing_member_count,
  COUNT(*) FILTER (WHERE university_id IS NULL) as missing_university,
  COUNT(*) FILTER (WHERE greek_organization_id IS NULL) as missing_organization,
  COUNT(*) as total_chapters
FROM chapters;
```

---

## Troubleshooting Guide

### Issue: No new data to report

**Check**:
```sql
SELECT MAX(created_at) FROM chapters;
SELECT MAX(created_at) FROM chapter_officers;
```

**Solution**: Expected if no data added recently. Send report anyway with high-grade chapters.

### Issue: Email not sending

**Resend Error 403**: Domain not verified
- Go to resend.com/domains
- Add fraternitybase.com
- Update FROM_EMAIL in .env
- Redeploy

**No email address for company**:
- Check user_profiles linked to company
- Verify user exists in auth.users
- Ensure approval_status = 'approved'

### Issue: Duplicate companies in results

**Known Issue**: Two "Hedge, Inc." companies in database

**Check**:
```sql
SELECT name, COUNT(*)
FROM companies
GROUP BY name
HAVING COUNT(*) > 1;
```

**Solution**: Deduplicate when fetching, or merge companies in database

### Issue: Wrong grade calculations

**Business Logic**:
- Grade is stored in `chapters.grade` column
- DO NOT use `five_star_rating` (deprecated)
- Use `grade >= 4.5` for introducable check

**Verify**:
```sql
SELECT
  chapter_name,
  grade,
  five_star_rating,
  CASE WHEN grade >= 4.5 THEN 'Introducable' ELSE 'Standard' END
FROM chapters
WHERE grade IS NOT NULL
ORDER BY grade DESC
LIMIT 10;
```

---

## Security & Privacy

### RLS (Row Level Security)

**Tables with RLS**:
- `chapter_unlocks` - Companies can only see their own unlocks
- `balance_transactions` - Companies can only see their own transactions
- `credit_transactions` - Companies can only see their own credits

**Admin Access**:
- Use `supabaseAdmin` client (service role key)
- Bypasses RLS for reporting purposes
- NEVER expose admin client to frontend

### Sensitive Data

**Keep Confidential**:
- Partnership network details (College Casino Tour)
- Specific chapter contact emails/phones (until unlocked)
- Company credit balances (between companies)
- Stripe payment details

**Can Share in Reports**:
- Chapter names, universities
- Grade classifications
- Member counts (aggregate)
- High-level data quality metrics

---

## Agent Personality & Communication

### Tone
- Professional but friendly
- Data-driven and analytical
- Helpful and proactive
- Concise and clear

### Report Writing Style
- **Subject Lines**: Clear, emoji-enhanced, date-specific
- **Headers**: Professional, branded
- **Content**: Scannable, well-organized sections
- **CTAs**: Clear action items
- **Insights**: Highlight notable trends

### Example Insights to Include

"This week, we added 12 new chapters across 8 states, with 3 achieving our Premium (5.0) grade. The Southeast region saw the most activity, with 5 new chapters at ACC conference schools."

"Notable addition: Alpha Tau Omega at University of Virginia achieved a 5.0 grade with 87 verified members and complete officer roster."

"Your intro-ready chapters grew by 15% this month, now totaling 42 chapters where we can facilitate warm introductions."

---

## Future Enhancements

### Reporting Features
- [ ] Weekly digest option
- [ ] Custom report preferences per company
- [ ] Push notifications for high-value additions
- [ ] Slack/Discord integration
- [ ] API for programmatic access
- [ ] Analytics dashboard

### Data Tracking
- [ ] Chapter activity scores
- [ ] Trending chapters
- [ ] Regional insights
- [ ] Seasonal patterns
- [ ] Unlock predictions

### Agent Capabilities
- [ ] Natural language queries ("What's new at SEC schools?")
- [ ] Automated anomaly detection
- [ ] Predictive analytics
- [ ] Custom report generation
- [ ] Client engagement scoring

---

## Quick Reference Commands

### Run Daily Report
```bash
cd backend
npm run daily-report
```

### Query Database
```bash
# Using Supabase MCP
mcp__supabase__execute_sql {
  "project_id": "vvsawtexgpopqxgaqyxg",
  "query": "SELECT COUNT(*) FROM chapters WHERE created_at >= NOW() - INTERVAL '24 hours'"
}
```

### Test Email
```bash
curl -X POST http://localhost:3001/api/cron/send-daily-reports \
  -H "x-cron-secret: cron_secret_fra7ernity_b4se_2025"
```

### Check Logs
```bash
# Local
npm run dev

# Production (Vercel)
vercel logs --follow
```

---

## Agent Success Metrics

### Daily Report Performance
- **Delivery Rate**: >95% successful sends
- **Open Rate**: >40% (industry standard: 20%)
- **Click Rate**: >10% (CTA button clicks)
- **Bounce Rate**: <2%

### Data Quality
- **New Chapters/Week**: 5-15 (target)
- **New Officers/Week**: 20-50 (target)
- **Grade 4.5+ Chapters**: 40+ (current: 42)
- **Data Completeness**: >85%

### Client Engagement
- **Active Companies**: 2 approved
- **Average Unlocks/Company**: 1-5/week
- **Credit Purchases**: Track monthly
- **Warm Intro Requests**: Track monthly

---

**Last Updated**: October 8, 2025
**Agent Version**: 1.0
**Maintained By**: FraternityBase Team

---

## Emergency Contacts

**Database Issues**: Check Supabase dashboard
**Email Issues**: Check Resend dashboard
**Stripe Issues**: Check Stripe dashboard
**Server Issues**: Check Vercel logs

**Admin Email**: jacksonfitzgerald25@gmail.com
