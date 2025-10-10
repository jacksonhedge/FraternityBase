# Daily Report System Setup

## Overview

The Daily Report System automatically sends email reports to all approved clients every day with:

- **New Chapters Added** (last 24 hours)
- **New Roster Members Added** (last 24 hours)
- **Premium & Introducable Chapters** (grades 5.0 and 4.5)

Reports are sent via Resend email service to all companies with `approval_status = 'approved'`.

---

## Files Created

### Service Layer
- **`src/services/DailyReportService.ts`** - Core service for generating and sending daily reports
  - Fetches new chapters, officers, and high-grade chapters from database
  - Generates HTML and plain text email templates
  - Sends emails to all approved companies
  - Handles rate limiting (1 second between emails)

### Scripts
- **`scripts/send-daily-reports.ts`** - Standalone script for manual execution
  - Can be run directly: `npm run daily-report`
  - Validates environment variables
  - Provides detailed console output

### API Endpoints
- **`POST /api/cron/send-daily-reports`** - Cron-triggered endpoint (server.ts:2469)
  - Protected by `x-cron-secret` header
  - Returns JSON with sent/failed counts
  - Logs all activities

---

## Environment Variables Required

All already configured in `.env`:

```bash
# Supabase (for database queries)
SUPABASE_URL=https://vvsawtexgpopqxgaqyxg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Resend (for sending emails)
RESEND_API_KEY=re_2LTfhWVF_ECxpY9qrHh8ieGSAgs9mVPDM
FROM_EMAIL=onboarding@resend.dev

# Cron authentication
CRON_SECRET=cron_secret_fra7ernity_b4se_2025
```

---

## Usage

### Option 1: Manual Execution (Testing)

Run the daily report script manually:

```bash
cd backend
npm run daily-report
```

Output:
```
📊 FraternityBase Daily Report Generator
============================================================
Started at: 10/8/2025, 9:00:00 AM
============================================================

Generating report for Hedge, Inc...
✓ Report sent to Hedge, Inc. (email@example.com)

============================================================
✨ Daily Report Summary
============================================================
✓ Sent: 3
✗ Failed: 0
Total: 3
Completed at: 10/8/2025, 9:00:45 AM
============================================================
```

### Option 2: API Endpoint (Cron Services)

Call the API endpoint with the cron secret:

```bash
curl -X POST https://your-backend.vercel.app/api/cron/send-daily-reports \
  -H "x-cron-secret: cron_secret_fra7ernity_b4se_2025"
```

Response:
```json
{
  "success": true,
  "message": "Daily reports sent to 3 companies",
  "sent": 3,
  "failed": 0,
  "total": 3
}
```

### Option 3: Vercel Cron (Automated Daily)

#### Step 1: Create `vercel.json` in backend root

```json
{
  "crons": [
    {
      "path": "/api/cron/send-daily-reports",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Schedule format**: `0 9 * * *` = Every day at 9:00 AM UTC

Common schedules:
- `0 9 * * *` - 9 AM UTC (4 AM EST, 1 AM PST)
- `0 13 * * *` - 1 PM UTC (8 AM EST, 5 AM PST)
- `0 17 * * *` - 5 PM UTC (12 PM EST, 9 AM PST)

#### Step 2: Add Cron Secret to Vercel Environment Variables

1. Go to Vercel Dashboard → Your Backend Project
2. Settings → Environment Variables
3. Add variable:
   - **Name**: `CRON_SECRET`
   - **Value**: `cron_secret_fra7ernity_b4se_2025`
   - **Environments**: Production

#### Step 3: Deploy

```bash
cd backend
vercel --prod
```

Vercel Cron will automatically call the endpoint at the scheduled time with the secret header.

---

## Email Template Features

### HTML Email Includes:
- **Professional Header** - Gradient blue design with FraternityBase branding
- **Personalized Greeting** - Uses company name
- **Three Main Sections**:
  1. New Chapters Added (with grade badges)
  2. New Roster Members Added (limited to 10, shows "+X more" if needed)
  3. Premium & Introducable Chapters (top 15, sorted by grade)
- **Grade Badges**:
  - ⭐ **PREMIUM** (grade 5.0) - Yellow badge
  - 🤝 **INTRODUCABLE** (grade 4.5) - Blue badge
- **Call-to-Action Button** - "View All Chapters" → fraternitybase.com/chapters
- **Professional Footer** - Links to website and email preferences

### Plain Text Version:
- Identical content in clean, readable plain text format
- Fallback for email clients that don't support HTML

---

## Database Queries

### New Chapters (Last 24 Hours)
```sql
SELECT
  id, chapter_name, grade, member_count, created_at,
  universities.name, greek_organizations.name
FROM chapters
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### New Officers (Last 24 Hours)
```sql
SELECT
  id, name, position, created_at,
  chapters.chapter_name, chapters.universities.name
FROM chapter_officers
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### High-Grade Chapters
```sql
SELECT
  id, chapter_name, grade, member_count,
  universities.name, greek_organizations.name
FROM chapters
WHERE grade >= 4.5
ORDER BY grade DESC
LIMIT 50;
```

### Approved Companies
```sql
SELECT id, name FROM companies
WHERE approval_status = 'approved';
```

Then fetches user email from `user_profiles` and `auth.users` tables.

---

## Testing

### Test with Current Data

```bash
cd backend
npm run daily-report
```

This will:
1. Query database for new chapters/officers (last 24 hours)
2. Query high-grade chapters (≥4.5)
3. Send reports to all approved companies
4. Show summary of sent/failed emails

### Test Email Template

To preview the email without sending:

1. Temporarily comment out the `resend.emails.send()` call in `DailyReportService.ts`
2. Add console.log of the HTML:
```typescript
const html = this.generateReportHtml(...);
console.log(html);
// await this.resend.emails.send(...); // Commented out
```
3. Run script and copy HTML to a file
4. Open in browser to preview

---

## Rate Limiting

The service includes built-in rate limiting:

- **1 second delay** between each email send
- Prevents hitting Resend API rate limits
- For 10 companies: ~10 seconds total execution time

Resend limits (as of now):
- **Free**: 100 emails/day, 1 email/second
- **Paid**: 50,000 emails/day, 10 emails/second

Current configuration is well within limits.

---

## Monitoring

### Logs to Check

**Backend logs** (localhost):
```bash
cd backend
npm run dev
# Check console output when cron runs
```

**Vercel logs** (production):
```bash
vercel logs [deployment-url] --follow
```

**Resend Dashboard**:
- Go to https://resend.com/emails
- View all sent emails, delivery status, opens, clicks

### Success Indicators

✅ Console shows: `✓ Report sent to [Company Name]`
✅ API returns: `"success": true`
✅ Resend dashboard shows delivered emails
✅ Recipients receive email in inbox

### Failure Indicators

❌ Console shows: `✗ Failed to send notification`
❌ API returns: `"failed": X` where X > 0
❌ Error in Resend dashboard
❌ Recipients report not receiving email

---

## Troubleshooting

### No emails sent
- **Check**: Are there approved companies? Query: `SELECT * FROM companies WHERE approval_status = 'approved'`
- **Check**: Do companies have valid user emails? Query: `SELECT * FROM user_profiles WHERE company_id = ...`
- **Fix**: Approve companies in admin panel or add test company

### Emails not delivered
- **Check**: Resend API key is valid (test with `sendTestEmail()` method)
- **Check**: FROM_EMAIL is verified in Resend dashboard
- **Check**: Email addresses are valid (not bounced/complained)
- **Fix**: Update environment variables and redeploy

### Cron not running
- **Check**: `vercel.json` exists and is valid JSON
- **Check**: CRON_SECRET environment variable is set in Vercel
- **Check**: Backend is deployed to production (not preview)
- **Fix**: Redeploy backend with `vercel --prod`

### Empty reports (no data)
- **Expected**: If no new chapters/officers in last 24 hours, sections will show "No new..." messages
- **Still sends**: Email is sent with empty state messages, showing only high-grade chapters
- **Not a bug**: This is normal behavior

---

## Customization

### Change Email Schedule

Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-daily-reports",
      "schedule": "0 13 * * *"  // Change to 1 PM UTC
    }
  ]
}
```

### Change Email Template

Edit `src/services/DailyReportService.ts`:
- **HTML**: `generateReportHtml()` method (line ~230)
- **Text**: `generateReportText()` method (line ~460)

### Change Recipients

Currently sends to all approved companies. To customize:

1. Modify `getApprovedCompanies()` method
2. Add additional filters (e.g., subscription tier, preferences)
3. Example:
```typescript
.eq('approval_status', 'approved')
.in('subscription_tier', ['pro', 'enterprise']) // Only paid plans
```

### Add More Data Sections

1. Create new query method (e.g., `getNewEvents()`)
2. Add to `sendDailyReport()` Promise.all
3. Add section to HTML and text templates
4. Pass data to template methods

---

## Future Enhancements

### Potential Features
- [ ] **User Preferences** - Allow users to opt-in/out or choose frequency (daily/weekly)
- [ ] **Digest Mode** - Weekly summary instead of daily
- [ ] **Custom Filters** - Let users choose what data they want in reports
- [ ] **Push Notifications** - Also send mobile push for urgent updates
- [ ] **Slack Integration** - Post reports to company Slack channels
- [ ] **Analytics Dashboard** - Track email open rates, click rates, engagement

### Performance Optimizations
- [ ] **Batch Email Sending** - Use Resend's batch API for faster delivery
- [ ] **Caching** - Cache high-grade chapters list (refreshes daily)
- [ ] **Database Indexes** - Add indexes on `created_at` columns
- [ ] **Parallel Processing** - Generate all reports concurrently, then send

---

## Summary

✅ **Daily Report System is Ready to Use**

**Manual Testing**:
```bash
npm run daily-report
```

**Automated (Vercel Cron)**:
1. Add `vercel.json` with cron schedule
2. Set `CRON_SECRET` in Vercel env vars
3. Deploy with `vercel --prod`

**Monitoring**:
- Check backend logs for execution details
- Check Resend dashboard for delivery status
- Clients will receive beautifully formatted daily reports!

---

**Questions or Issues?**

Check this document first, then review:
- Backend logs: `npm run dev` or `vercel logs`
- Resend dashboard: https://resend.com/emails
- Supabase dashboard: https://supabase.com/dashboard

**Created**: October 8, 2025
**Last Updated**: October 8, 2025
