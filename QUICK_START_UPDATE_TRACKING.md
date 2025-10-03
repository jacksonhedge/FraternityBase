# Quick Start: Update Tracking System

## 🚀 5-Minute Setup for Hedge Payments Team

This guide gets jackson@hedgepayments.com receiving weekly updates ASAP.

### Step 1: Apply Database Migration (2 min)

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork

# Option A: If using Supabase CLI
supabase db push database/update_tracking_schema.sql

# Option B: Copy/paste into Supabase SQL editor
# Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
# Paste contents of database/update_tracking_schema.sql
# Click "Run"
```

### Step 2: Get Resend API Key (1 min)

1. Go to https://resend.com
2. Sign up or log in
3. Create API key
4. Add to `.env`:

```env
RESEND_API_KEY=re_your_key_here
FROM_EMAIL=updates@fraternitybase.com
```

**Note**: Verify `updates@fraternitybase.com` domain in Resend dashboard

### Step 3: Subscribe Hedge Payments (1 min)

Run the CLI tool:

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork
ts-node scripts/subscribe-partner.ts
```

Enter when prompted:
- **Email**: jackson@hedgepayments.com
- **Company ID**: (get from companies table)
- **Frequency**: 2 (Weekly)
- **New colleges**: y
- **New chapters**: y
- **Chapter updates**: y
- **Contact info updates**: y
- **Officer changes**: y
- **Event opportunities**: y
- **States**: PA,NY,NJ,CA

### Step 4: Test It (1 min)

```bash
# Run test suite
ts-node scripts/test-notifications.ts

# Manually trigger weekly digest
curl -X POST http://localhost:3001/api/update-tracking/process/weekly
```

## 📧 What Happens Next?

- Every **Monday at 9 AM EST**, the system:
  1. Collects all updates from the past week
  2. Filters by preferences (PA, NY, NJ, CA states)
  3. Generates a digest email
  4. Sends to jackson@hedgepayments.com

## 🎯 Example Email Preview

```
Subject: FraternityBase Updates: 15 New Updates This Week

🎓 NEW COLLEGES ADDED
• Temple University added in PA
• Villanova University added in PA

🏛️ NEW CHAPTERS ADDED
• Sigma Chi now at Penn State
• Kappa Alpha now at Temple

📧 CONTACT INFO UPDATED
• Updated email for Sigma Chi at Penn State
• Added Instagram: @sigmachipennstate

👥 OFFICER CHANGES
• New President: John Smith at Penn State Sigma Chi

[View Full Details on FraternityBase]
```

## ⚡ Adding More Partners

Repeat Step 3 for each email address:
- team@hedgepayments.com
- partner@othercompany.com
- etc.

Or use the API:

```bash
curl -X POST http://localhost:3001/api/update-tracking/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "uuid-here",
    "email": "new@partner.com",
    "notification_frequency": "weekly",
    "notify_new_colleges": true,
    "notify_new_chapters": true,
    "interested_states": ["PA", "NY"]
  }'
```

## 🔧 Troubleshooting

### "Resend API error"
- Verify domain in Resend dashboard
- Check API key is correct
- Ensure FROM_EMAIL matches verified domain

### "No updates in digest"
- Database might be empty
- Add test data or wait for real updates
- Check filters (states, preferences)

### "Email not received"
- Check spam folder
- Verify email in subscriptions: `SELECT * FROM partner_subscriptions;`
- Check notification queue: `SELECT * FROM notification_queue WHERE status = 'failed';`

## 📊 Monitoring

View recent activity:

```bash
# Recent updates
curl http://localhost:3001/api/update-tracking/updates/recent?limit=10

# Statistics
curl http://localhost:3001/api/update-tracking/updates/stats?days=7

# Pending notifications
curl http://localhost:3001/api/update-tracking/notifications/pending
```

## 🎉 You're Done!

jackson@hedgepayments.com will now receive weekly updates about:
- New colleges in PA, NY, NJ, CA
- New chapters at those colleges
- Contact info updates
- Officer changes
- Partnership opportunities

No manual work required! 🎊
