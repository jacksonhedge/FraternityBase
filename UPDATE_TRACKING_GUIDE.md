# FraternityBase Update Tracking System

## Overview

The Update Tracking System automatically monitors database changes and sends periodic email digests to partner companies, keeping them informed about:

- 🎓 New colleges added to the platform
- 🏛️ New chapters joining
- 📧 Contact information updates
- 👥 Officer changes
- 🤝 Warm introduction opportunities

## Architecture

### Database Tables

1. **`partner_subscriptions`** - Stores partner preferences and notification settings
2. **`database_updates`** - Logs all significant database changes
3. **`notification_queue`** - Queues email digests for sending
4. **`warm_intro_opportunities`** - Tracks potential warm introductions
5. **`notification_analytics`** - Tracks email engagement metrics

### Services

1. **`UpdateTrackingService`** - Core service for managing updates and subscriptions
2. **`EmailNotificationService`** - Handles email sending via Resend
3. **Cron Jobs** - Automated processing of notifications (daily, weekly, biweekly, monthly)

### API Routes

All routes are prefixed with `/api/update-tracking`

## Setup Instructions

### 1. Database Setup

Run the migration to create required tables:

```bash
# Apply the update tracking schema
psql $DATABASE_URL -f database/update_tracking_schema.sql
```

Or if using Supabase directly:

```sql
-- Copy and run the contents of database/update_tracking_schema.sql
-- in your Supabase SQL editor
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Resend (for email notifications)
RESEND_API_KEY=re_your_api_key

# Email configuration
FROM_EMAIL=updates@fraternitybase.com
```

### 3. Install Dependencies

```bash
cd backend
npm install resend node-cron
npm install --save-dev @types/node-cron
```

### 4. Update Server Configuration

Add to your `backend/src/server.ts`:

```typescript
import updateTrackingRoutes from './routes/updateTracking';
import { startNotificationCrons } from './cron/notificationProcessor';

// Add routes
app.use('/api/update-tracking', updateTrackingRoutes);

// Start cron jobs (if in production)
if (process.env.NODE_ENV === 'production') {
  startNotificationCrons();
}
```

## Usage

### Subscribing a Partner

#### Method 1: API Endpoint

```bash
curl -X POST http://localhost:3001/api/update-tracking/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "uuid-here",
    "email": "jackson@hedgepayments.com",
    "notification_frequency": "weekly",
    "notify_new_colleges": true,
    "notify_new_chapters": true,
    "notify_chapter_updates": true,
    "notify_contact_info_updates": true,
    "notify_officer_changes": true,
    "notify_event_opportunities": true,
    "interested_states": ["PA", "NY", "NJ"]
  }'
```

#### Method 2: CLI Tool

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork
ts-node scripts/subscribe-partner.ts
```

Follow the interactive prompts to subscribe a partner.

### Notification Frequencies

- **Daily** - Every day at 9 AM EST
- **Weekly** - Every Monday at 9 AM EST
- **Biweekly** - Every other Monday at 9 AM EST
- **Monthly** - 1st of each month at 9 AM EST

### Manual Testing

Test the entire system:

```bash
ts-node scripts/test-notifications.ts
```

### Manually Trigger Notifications

Trigger processing for a specific frequency:

```bash
# Daily
curl -X POST http://localhost:3001/api/update-tracking/process/daily

# Weekly
curl -X POST http://localhost:3001/api/update-tracking/process/weekly
```

## Automatic Update Tracking

The system automatically logs updates via database triggers:

### What Gets Tracked Automatically

1. **New Universities** - Any INSERT into `universities` table
2. **New Chapters** - Any INSERT into `chapters` table
3. **Contact Info Changes** - Updates to email, phone, Instagram, website, etc.
4. **New Officers** - Any INSERT into `chapter_officers` table
5. **Warm Intros** - Any INSERT into `warm_intro_opportunities` table

### Manual Update Logging

For updates not covered by triggers:

```typescript
import UpdateTrackingService from './services/UpdateTrackingService';

const updateService = new UpdateTrackingService(SUPABASE_URL, SUPABASE_KEY);

await updateService.logUpdate({
  update_type: 'chapter_update',
  entity_type: 'chapter',
  entity_id: chapterId,
  entity_name: 'Sigma Chi - Penn State',
  change_summary: 'Chapter increased membership to 100 members',
  change_details: {
    old_member_count: 85,
    new_member_count: 100
  },
  university_id: universityId,
  university_name: 'Penn State University',
  university_state: 'PA',
  chapter_id: chapterId,
  chapter_name: 'Sigma Chi - Penn State',
  created_by: 'admin',
  is_major_update: false
});
```

## Example: Hedge Payments Integration

### Subscribe Hedge Payments Team

```typescript
// Subscribe jackson@hedgepayments.com to weekly updates
const subscription = await updateService.subscribePartner({
  company_id: hedgePaymentsCompanyId,
  email: 'jackson@hedgepayments.com',
  notification_frequency: 'weekly',
  is_active: true,
  notify_new_colleges: true,
  notify_new_chapters: true,
  notify_chapter_updates: true,
  notify_contact_info_updates: true,
  notify_officer_changes: true,
  notify_event_opportunities: true,
  interested_states: ['PA', 'NY', 'NJ', 'CA'] // States of interest
});
```

### What They'll Receive

Every Monday at 9 AM EST, they'll get an email like:

```
Subject: FraternityBase Updates: 23 New Updates This Week

📧 Contact Info Updated
• Updated email for Sigma Chi at Penn State
• Added Instagram handle for Kappa Alpha at Temple

🏛️ New Chapters Added
• Delta Tau Delta now at Drexel University
• Pi Kappa Alpha now at Villanova

👥 Officer Changes
• New President: John Smith at Penn State Sigma Chi
```

## Email Notification Features

### Digest Format

- **HTML Version** - Beautifully formatted with sections by update type
- **Plain Text Version** - Accessible fallback
- **CTA Button** - Links directly to FraternityBase dashboard
- **Preferences Link** - Easy access to update settings

### Analytics (Future Enhancement)

Track email engagement:
- Opens
- Clicks
- Which updates generated interest
- Conversions (partnerships created)

## API Reference

### Subscribe Partner

```
POST /api/update-tracking/subscribe
```

### Update Subscription

```
PATCH /api/update-tracking/subscriptions/:id
```

### Get Recent Updates

```
GET /api/update-tracking/updates/recent?limit=50&offset=0
```

### Get Update Statistics

```
GET /api/update-tracking/updates/stats?days=30
```

### Manual Update Logging

```
POST /api/update-tracking/updates/manual
```

### Process Notifications (Cron)

```
POST /api/update-tracking/process/:frequency
```

### Get Pending Notifications

```
GET /api/update-tracking/notifications/pending
```

## Monitoring

### Check Recent Updates

```bash
# Via API
curl http://localhost:3001/api/update-tracking/updates/recent?limit=10

# Via database
SELECT * FROM database_updates ORDER BY created_at DESC LIMIT 10;
```

### Check Pending Notifications

```bash
curl http://localhost:3001/api/update-tracking/notifications/pending
```

### View Subscriptions

```sql
SELECT
  ps.email,
  ps.notification_frequency,
  ps.is_active,
  c.name as company_name
FROM partner_subscriptions ps
JOIN companies c ON c.id = ps.company_id
WHERE ps.is_active = true;
```

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is valid
2. Verify `FROM_EMAIL` is verified in Resend
3. Check notification queue: `SELECT * FROM notification_queue WHERE status = 'failed'`
4. Review error logs

### Updates Not Being Logged

1. Verify triggers are installed: `\df` in psql
2. Check for trigger errors in PostgreSQL logs
3. Manually test logging with `test-notifications.ts`

### Cron Jobs Not Running

1. Verify cron jobs started: Check server logs for "Starting notification cron jobs"
2. Ensure server is running continuously (not serverless functions)
3. Test manual processing: `POST /api/update-tracking/process/weekly`

## Scaling Considerations

### For High Volume

1. **Rate Limiting** - Current implementation has 100ms delay between emails
2. **Batch Processing** - Process notifications in batches of 100
3. **Queue System** - Consider Bull/Redis for large-scale processing
4. **Email Service** - Resend has generous limits, upgrade plan if needed

### Database Optimization

Indexes are already created for:
- `database_updates.created_at`
- `database_updates.update_type`
- `partner_subscriptions.notification_frequency`

## Future Enhancements

### Planned Features

- 📊 Analytics dashboard for partners
- 🎯 AI-powered relevance scoring
- 🔍 Advanced filtering (chapter size, engagement score)
- 📱 SMS notifications for urgent updates
- 🤖 Slack/Discord integration
- 📈 Weekly summary reports with insights

### Warm Introduction System

The foundation is in place with the `warm_intro_opportunities` table. Future work:

1. Build matcher algorithm to find connections
2. Scrape LinkedIn for mutual connections
3. Track alumni overlaps
4. Notify partners of high-confidence intros

## Questions?

Contact: jackson@hedgepayments.com
