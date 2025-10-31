# FraternityBase Sponsorship Marketplace

## Overview

The **Sponsorship Marketplace** is a new feature that allows fraternities to post sponsorship opportunities and enables companies to receive daily or weekly email notifications about opportunities that match their preferences.

### Key Features

✅ **Sponsorship Opportunity Listings** - Fraternities can create detailed sponsorship opportunities
✅ **Smart Matching** - Companies receive notifications only for opportunities that match their preferences
✅ **Daily & Weekly Digests** - Automated email notifications sent at preferred times
✅ **Application System** - Companies can apply directly to opportunities
✅ **Saved Opportunities** - Companies can save opportunities for later review
✅ **Tracking & Analytics** - Email open/click tracking for engagement metrics

---

## Database Schema

### Tables Created

#### **1. sponsorship_opportunities**
Tracks sponsorship opportunities posted by fraternities.

**Key Fields:**
- `chapter_id` - Foreign key to chapters table
- `title` - Opportunity title
- `description` - Detailed description
- `opportunity_type` - Type (event_sponsor, merchandise_partner, etc.)
- `budget_needed` - Sponsorship budget amount
- `expected_reach` - Estimated audience reach
- `is_featured` - Highlighted in email digests
- `is_urgent` - Triggers immediate notifications
- `status` - active, filled, expired, cancelled

#### **2. sponsorship_applications**
Tracks company applications to opportunities.

**Key Fields:**
- `opportunity_id` - Foreign key to sponsorship_opportunities
- `company_id` - Foreign key to companies
- `message` - Application message
- `proposed_budget` - Company's proposed budget
- `status` - pending, reviewing, accepted, rejected, withdrawn

#### **3. sponsorship_notifications**
Tracks all email notifications sent to companies.

**Key Fields:**
- `company_id` - Foreign key to companies
- `notification_type` - daily_digest, weekly_digest, immediate_alert, featured_opportunity
- `opportunities_included` - Array of opportunity IDs included in email
- `opened_at` - Timestamp when email was opened
- `clicked_at` - Timestamp when link was clicked
- `open_count` - Number of times email was opened
- `click_count` - Number of times links were clicked

#### **4. sponsorship_notification_preferences**
Stores company preferences for email notifications.

**Key Fields:**
- `company_id` - Foreign key to companies (UNIQUE)
- `email_frequency` - immediate, daily, weekly, never
- `send_time_utc` - Preferred hour (0-23) to receive digest
- `target_states` - Array of preferred states (e.g., ['CA', 'NY'])
- `target_organizations` - Array of preferred orgs (e.g., ['Sigma Chi'])
- `interested_opportunity_types` - Types of opportunities interested in
- `min_budget_range` / `max_budget_range` - Budget preferences
- `receive_featured_opportunities` - Boolean
- `receive_urgent_alerts` - Boolean

#### **5. sponsorship_saved_opportunities**
Allows companies to save/favorite opportunities.

**Key Fields:**
- `company_id` - Foreign key to companies
- `opportunity_id` - Foreign key to sponsorship_opportunities
- `notes` - Optional notes about the opportunity

---

## Backend Architecture

### Service Layer

#### **SponsorshipNotificationService.ts**
Located: `/backend/src/services/SponsorshipNotificationService.ts`

**Key Methods:**
- `sendDailyDigests()` - Sends daily email digests to all companies with 'daily' preference
- `sendWeeklyDigests()` - Sends weekly email digests to all companies with 'weekly' preference
- `sendImmediateNotification(opportunityId)` - Sends urgent alerts for featured opportunities
- `getMatchingOpportunities(preferences, since)` - Filters opportunities based on company preferences
- `doesOpportunityMatchPreferences(opportunity, preferences)` - Matching algorithm
- `trackEmailOpen(notificationId)` - Tracks email open events
- `trackEmailClick(notificationId)` - Tracks email click events

**Email Templates:**
- Professional HTML emails with inline CSS
- Responsive design for mobile/desktop
- Clear CTAs: "View Details & Apply", "Browse All Opportunities"
- Unsubscribe links included in footer

### API Routes

#### **Sponsorships Router** (`/api/sponsorships`)
Located: `/backend/src/routes/sponsorships.ts`

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sponsorships` | Browse/search all active opportunities |
| GET | `/api/sponsorships/:id` | Get details of a specific opportunity |
| POST | `/api/sponsorships` | Create a new opportunity (admin/chapter) |
| PATCH | `/api/sponsorships/:id` | Update an opportunity |
| DELETE | `/api/sponsorships/:id` | Cancel an opportunity |
| POST | `/api/sponsorships/:id/apply` | Apply to an opportunity |
| GET | `/api/sponsorships/applications/my` | Get company's applications |
| PATCH | `/api/sponsorships/applications/:id` | Update an application |
| POST | `/api/sponsorships/:id/save` | Save/favorite an opportunity |
| DELETE | `/api/sponsorships/:id/save` | Unsave an opportunity |
| GET | `/api/sponsorships/saved/my` | Get company's saved opportunities |

**Query Parameters (GET /api/sponsorships):**
- `opportunity_type` - Filter by type
- `state` - Filter by university state
- `organization` - Filter by Greek organization
- `min_budget` / `max_budget` - Budget range filter
- `scope` - Geographic scope (local, regional, national)
- `limit` - Pagination limit (default: 50)
- `offset` - Pagination offset (default: 0)

#### **Sponsorship Notifications Router** (`/api/sponsorship-notifications`)
Located: `/backend/src/routes/sponsorshipNotifications.ts`

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sponsorship-notifications/preferences` | Get company's notification preferences |
| PATCH | `/api/sponsorship-notifications/preferences` | Update notification preferences |
| POST | `/api/sponsorship-notifications/unsubscribe` | Unsubscribe from notifications |
| POST | `/api/sponsorship-notifications/resubscribe` | Resubscribe to notifications |
| GET | `/api/sponsorship-notifications/history` | Get notification history |
| POST | `/api/sponsorship-notifications/:id/track-open` | Track email open event |
| POST | `/api/sponsorship-notifications/:id/track-click` | Track email click event |

---

## Cron Jobs & Automation

### Daily Digest Job
**Script:** `/backend/src/scripts/sendDailySponsorshipDigest.ts`
**Command:** `npm run sponsorship-daily-digest`
**Recommended Schedule:** Daily at 9:00 AM UTC (adjust based on preferences)

**Cron Expression:** `0 9 * * *`

### Weekly Digest Job
**Script:** `/backend/src/scripts/sendWeeklySponsorshipDigest.ts`
**Command:** `npm run sponsorship-weekly-digest`
**Recommended Schedule:** Every Monday at 9:00 AM UTC

**Cron Expression:** `0 9 * * 1`

### Setting Up Cron Jobs

**Option 1: Vercel Cron Jobs**
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sponsorship-daily-digest",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/sponsorship-weekly-digest",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

**Option 2: Server Cron (Linux)**
```bash
# Edit crontab
crontab -e

# Add daily digest (9 AM UTC)
0 9 * * * cd /path/to/backend && npm run sponsorship-daily-digest

# Add weekly digest (Monday 9 AM UTC)
0 9 * * 1 cd /path/to/backend && npm run sponsorship-weekly-digest
```

**Option 3: GitHub Actions**
Create `.github/workflows/sponsorship-digests.yml`:
```yaml
name: Sponsorship Email Digests

on:
  schedule:
    - cron: '0 9 * * *'      # Daily at 9 AM UTC
    - cron: '0 9 * * 1'      # Weekly on Monday at 9 AM UTC

jobs:
  send-daily-digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm install
      - run: npm run sponsorship-daily-digest
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

---

## Email Notification Flow

### 1. Daily Digest Flow

```
09:00 UTC (Daily)
      ↓
SponsorshipNotificationService.sendDailyDigests()
      ↓
Fetch companies with email_frequency='daily' (not unsubscribed)
      ↓
For each company:
  1. Get opportunities posted in last 24 hours
  2. Filter by company preferences (state, org, budget, type)
  3. Sort by is_featured (featured first)
  4. Generate HTML email with top 5-10 opportunities
  5. Send via Resend API
  6. Log notification to sponsorship_notifications table
      ↓
Rate limit: 100ms between emails (max ~600 emails/minute)
```

### 2. Weekly Digest Flow

```
09:00 UTC (Every Monday)
      ↓
SponsorshipNotificationService.sendWeeklyDigests()
      ↓
Fetch companies with email_frequency='weekly' (not unsubscribed)
      ↓
For each company:
  1. Get opportunities posted in last 7 days
  2. Filter by company preferences
  3. Sort by is_featured, then by applications_count (hot deals)
  4. Generate HTML email with top 10-15 opportunities
  5. Send via Resend API
  6. Log notification to sponsorship_notifications table
```

### 3. Immediate Alert Flow

```
Fraternity creates opportunity with is_urgent=true
      ↓
POST /api/sponsorships (backend API)
      ↓
Opportunity saved to database
      ↓
IF is_urgent === true:
  SponsorshipNotificationService.sendImmediateNotification(opportunityId)
      ↓
  Fetch companies with:
    - email_frequency='immediate' OR
    - receive_urgent_alerts=true
      ↓
  For each matching company:
    1. Check if opportunity matches preferences
    2. Send single-opportunity email
    3. Log notification
```

---

## Email Template Structure

### Daily/Weekly Digest Email

```
+---------------------------------------------+
|        FraternityBase Logo                  |
|     Sponsorship Opportunities               |
+---------------------------------------------+
|                                             |
|  Hi {ContactName}! 👋                       |
|                                             |
|  Here are {count} new sponsorship          |
|  opportunities from fraternities.          |
|                                             |
+---------------------------------------------+
|  ⭐ FEATURED                                |
|  [Opportunity Title]                        |
|  Sigma Chi • University of California (CA)  |
|  Chapter Grade: 5/5 ⭐ • 150 members        |
|                                             |
|  [Description text...]                      |
|                                             |
|  💰 $5,000-$10,000  👥 500 reach  📍 Local  |
|                                             |
|  📅 Event Date: March 15, 2025             |
|  ⏰ Apply by: March 1, 2025                |
|                                             |
|  [View Details & Apply Button]             |
+---------------------------------------------+
|  [Additional opportunities...]              |
+---------------------------------------------+
|                                             |
|  [Browse All Opportunities Button]         |
|  [Manage Email Preferences Link]           |
|                                             |
+---------------------------------------------+
|  Unsubscribe | Update preferences          |
|  © 2025 FraternityBase                     |
+---------------------------------------------+
```

---

## Matching Algorithm

The matching algorithm filters opportunities based on company preferences:

```typescript
function doesOpportunityMatchPreferences(
  opportunity: SponsorshipOpportunity,
  preferences: CompanyNotificationPreferences
): boolean {

  // 1. Exclude blocked types
  if (excluded_opportunity_types.includes(opportunity.opportunity_type)) {
    return false;
  }

  // 2. Check interested types (if specified)
  if (interested_opportunity_types.length > 0) {
    if (!interested_opportunity_types.includes(opportunity.opportunity_type)) {
      return false;
    }
  }

  // 3. Check target states (if specified)
  if (target_states.length > 0) {
    if (!target_states.includes(opportunity.university_state)) {
      return false;
    }
  }

  // 4. Check target organizations (if specified)
  if (target_organizations.length > 0) {
    if (!target_organizations.includes(opportunity.greek_org_name)) {
      return false;
    }
  }

  // 5. Check budget range (if specified)
  if (min_budget_range && opportunity.budget_needed < min_budget_range) {
    return false;
  }

  if (max_budget_range && opportunity.budget_needed > max_budget_range) {
    return false;
  }

  // 6. Check geographic scope (if specified)
  if (preferred_geographic_scope.length > 0) {
    if (!preferred_geographic_scope.includes(opportunity.geographic_scope)) {
      return false;
    }
  }

  // 7. Check expected reach (if specified)
  if (min_expected_reach && opportunity.expected_reach < min_expected_reach) {
    return false;
  }

  return true;
}
```

---

## Environment Variables

Add to `/backend/.env`:

```bash
# Resend API (already exists)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Supabase (already exists)
SUPABASE_URL=https://vvsawtexgpopqxgaqyxg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxx

# Frontend URL
FRONTEND_URL=https://fraternitybase.com

# Email sender addresses
SPONSORSHIPS_FROM_EMAIL=sponsorships@fraternitybase.com
```

---

## Testing the Feature

### 1. Test Database Migration

```bash
# Verify tables were created
psql -h db.vvsawtexgpopqxgaqyxg.supabase.co -U postgres -d postgres

# Check tables
\dt sponsorship*

# Should show:
# - sponsorship_opportunities
# - sponsorship_applications
# - sponsorship_notifications
# - sponsorship_notification_preferences
# - sponsorship_saved_opportunities
```

### 2. Test API Endpoints

**Create a test opportunity:**
```bash
curl -X POST http://localhost:3001/api/sponsorships \
  -H "Content-Type: application/json" \
  -d '{
    "chapter_id": "YOUR_CHAPTER_UUID",
    "title": "Spring Formal Sponsorship Opportunity",
    "description": "Looking for a brand to sponsor our spring formal event with 200+ attendees",
    "opportunity_type": "event_sponsor",
    "geographic_scope": "local",
    "budget_needed": 5000,
    "budget_range": "$5,000-$10,000",
    "expected_reach": 500,
    "is_featured": false,
    "is_urgent": false
  }'
```

**Get all opportunities:**
```bash
curl http://localhost:3001/api/sponsorships
```

**Get company notification preferences:**
```bash
curl "http://localhost:3001/api/sponsorship-notifications/preferences?company_id=YOUR_COMPANY_UUID"
```

**Update preferences:**
```bash
curl -X PATCH "http://localhost:3001/api/sponsorship-notifications/preferences?company_id=YOUR_COMPANY_UUID" \
  -H "Content-Type: application/json" \
  -d '{
    "email_frequency": "daily",
    "target_states": ["CA", "NY", "TX"],
    "min_budget_range": 1000,
    "max_budget_range": 10000
  }'
```

### 3. Test Email Digests Manually

```bash
# Run daily digest (will send emails to companies with daily preference)
npm run sponsorship-daily-digest

# Run weekly digest
npm run sponsorship-weekly-digest
```

### 4. Test Immediate Notifications

```bash
# Create an urgent opportunity via API (is_urgent=true)
# This should trigger immediate notifications to matching companies
```

---

## Monitoring & Analytics

### Email Analytics Dashboard

Query to get email open rates:
```sql
SELECT
  notification_type,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as total_opened,
  ROUND(100.0 * COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) / COUNT(*), 2) as open_rate_pct,
  COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as total_clicked,
  ROUND(100.0 * COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) / COUNT(*), 2) as click_rate_pct
FROM sponsorship_notifications
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY notification_type;
```

### Opportunity Performance

Query to get top performing opportunities:
```sql
SELECT
  so.id,
  so.title,
  c.chapter_name,
  u.name as university_name,
  so.applications_count,
  so.views_count,
  ROUND(100.0 * so.applications_count / NULLIF(so.views_count, 0), 2) as conversion_rate_pct
FROM sponsorship_opportunities so
JOIN chapters c ON so.chapter_id = c.id
JOIN universities u ON c.university_id = u.id
WHERE so.posted_at >= NOW() - INTERVAL '30 days'
ORDER BY so.applications_count DESC, so.views_count DESC
LIMIT 20;
```

---

## Next Steps

### Frontend Development (TODO)

1. **Marketplace Page** (`/sponsorships`)
   - Browse/search opportunities
   - Filter by type, location, budget
   - View opportunity details
   - Apply to opportunities
   - Save favorites

2. **Create Opportunity Page** (for chapters/admins)
   - Form to create new opportunities
   - Preview before posting
   - Mark as featured/urgent

3. **My Applications Page** (`/sponsorships/my-applications`)
   - View all submitted applications
   - Track application status
   - Withdraw applications

4. **Notification Preferences Page** (`/settings/sponsorship-notifications`)
   - Email frequency selector (immediate, daily, weekly, never)
   - Preferred send time
   - Target states/organizations
   - Budget range preferences
   - Opportunity type preferences
   - Unsubscribe option

5. **Saved Opportunities Page** (`/sponsorships/saved`)
   - View saved opportunities
   - Add notes
   - Remove from saved

### Future Enhancements

- **AI Matching Score**: Use Claude AI to score opportunity relevance
- **Analytics Dashboard**: Company/admin dashboard with email metrics
- **Push Notifications**: Mobile push notifications for urgent opportunities
- **Chat Feature**: Direct messaging between companies and chapters
- **Payment Integration**: Process sponsorship payments through platform
- **Slack Integration**: Notify admins when new opportunities are posted
- **Calendar Integration**: Sync event dates to Google Calendar

---

## Support & Troubleshooting

### Common Issues

**1. Emails not being sent**
- Check `RESEND_API_KEY` is set in environment variables
- Verify Resend account is active and has sending quota
- Check logs for error messages
- Verify company email addresses are valid

**2. Companies not receiving matched opportunities**
- Check notification preferences are set correctly
- Verify opportunities meet preference criteria
- Check `email_frequency` is not set to 'never'
- Verify company is not unsubscribed

**3. Cron jobs not running**
- Verify cron jobs are set up correctly
- Check server logs for execution
- Test scripts manually first
- Ensure environment variables are available to cron

### Logs

Check logs for email sending:
```bash
# Backend logs
pm2 logs fraternity-base-backend

# Manual test logs
npm run sponsorship-daily-digest
```

---

## Migration File Location

**Database Migration:**
`/backend/migrations/create_sponsorship_marketplace.sql`

This file contains all table definitions, indexes, RLS policies, triggers, and initial data setup.

---

## Contact

For questions or issues with the Sponsorship Marketplace feature:
- **Email**: admin@fraternitybase.com
- **Slack**: #marketplace-feature (if applicable)

---

**Last Updated:** October 29, 2025
**Version:** 1.0.0
**Status:** ✅ Backend Complete - Frontend Pending
