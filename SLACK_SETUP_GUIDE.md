# Slack Setup Guide - Quick Start

## Step 1: Create Slack Incoming Webhook (5 minutes)

### 1.1 Go to Slack API
Visit: https://api.slack.com/apps

### 1.2 Create New App
- Click **"Create New App"**
- Select **"From scratch"**
- App Name: `FraternityBase Monitor`
- Workspace: Select your workspace
- Click **"Create App"**

### 1.3 Enable Incoming Webhooks
- In the left sidebar, click **"Incoming Webhooks"**
- Toggle **"Activate Incoming Webhooks"** to **ON**

### 1.4 Add Webhook to Workspace
- Scroll down to **"Webhook URLs for Your Workspace"**
- Click **"Add New Webhook to Workspace"**
- Select the channel where you want notifications (e.g., `#fraternitybase-alerts`)
- Click **"Allow"**

### 1.5 Copy Webhook URL
- You'll see a webhook URL like:
  ```
  https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
  ```
- **Copy this URL** - you'll need it next!

---

## Step 2: Add to Backend Environment Variables

### 2.1 Local Development
Add to `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/.env`:

```bash
# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_ENABLED=true
```

### 2.2 Production (Vercel)
Navigate to backend directory and run:

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend

# Add webhook URL
vercel env add SLACK_WEBHOOK_URL
# Paste your webhook URL when prompted
# Select: Production, Preview, Development (all three)

# Enable Slack
vercel env add SLACK_ENABLED
# Enter: true
# Select: Production, Preview, Development (all three)
```

---

## Step 3: Test the Integration

### 3.1 Restart Backend
If running locally:
```bash
# Kill current backend process
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start backend
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
npm run dev
```

### 3.2 Test with a Quick Script
Create a test file:

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
cat > test-slack.ts << 'EOF'
import { slack } from './src/utils/slackNotifier';

async function test() {
  await slack.notifySignup({
    name: 'Test User',
    email: 'test@example.com',
    company: 'Test Company',
    tier: 'Free Trial'
  });

  console.log('Test notification sent! Check your Slack channel.');
}

test();
EOF

# Run test
npx ts-node test-slack.ts
```

### 3.3 Check Your Slack Channel
You should see a message like:

```
🆕 New User Signup!
━━━━━━━━━━━━━━━━━━━━
Name:        Test User
Email:       test@example.com
Company:     Test Company
Tier:        Free Trial
━━━━━━━━━━━━━━━━━━━━
⏰ Jan 7, 2025 10:45 AM
```

---

## Step 4: Deploy to Production

Once tested locally:

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
vercel --prod
```

---

## Quick Reference: Where to Add Notifications

The utility is already created at:
`/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/src/utils/slackNotifier.ts`

### Import in server.ts:
```typescript
import { slack } from './utils/slackNotifier';
```

### Add to endpoints:

**Signup (line ~300):**
```typescript
await slack.notifySignup({
  name: `${firstName} ${lastName}`,
  email,
  company: companyName,
  tier: 'Free Trial'
});
```

**Credit Purchase (line ~1400):**
```typescript
await slack.notifyCreditPurchase({
  userName: `${user.firstName} ${user.lastName}`,
  company: user.companyName || 'Unknown',
  packageName: 'Pro Pack',
  credits: creditsToAdd,
  amount: amount,
  newBalance: newBalance
});
```

**Chapter Unlock (line ~600):**
```typescript
await slack.notifyChapterUnlock({
  userName: `${user.firstName} ${user.lastName}`,
  company: user.companyName || 'Unknown',
  chapterName: chapterData.greek_organizations?.name || 'Unknown',
  universityName: chapterData.universities?.name || 'Unknown',
  grade: chapterData.grade,
  creditsSpent: credits,
  remainingBalance: newBalance
});
```

---

## Troubleshooting

### "Notifications disabled" in logs
- Check that `SLACK_ENABLED=true` in `.env`
- Check that `SLACK_WEBHOOK_URL` is set correctly
- Restart backend server

### Webhook returns 404
- Webhook URL might have changed
- Regenerate webhook URL in Slack API console
- Update environment variable

### Messages not formatting correctly
- Slack Block Kit has strict JSON schema
- Use Slack's Block Kit Builder to test: https://api.slack.com/block-kit

---

## Next Steps After Setup

1. ✅ Verify test message appears in Slack
2. ✅ Add notifications to key endpoints (see SLACK_INTEGRATION_PLAN.md)
3. ✅ Test each notification type
4. ✅ Deploy to production
5. ✅ Monitor first real notifications
6. 🎉 Enjoy real-time platform monitoring!

---

## Channel Recommendations

Consider creating separate channels for different alert types:

- `#fraternitybase-signups` - New user registrations
- `#fraternitybase-revenue` - Credit purchases, subscriptions
- `#fraternitybase-activity` - Unlocks, intro requests
- `#fraternitybase-admin` - 5-star chapters, admin actions
- `#fraternitybase-errors` - Critical alerts

You can create multiple webhooks (one per channel) and use different webhook URLs for different notification types.

---

**Total Setup Time: ~10 minutes**

Ready to see your platform come alive in real-time! 🚀
