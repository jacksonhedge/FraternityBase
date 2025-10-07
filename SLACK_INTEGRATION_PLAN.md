# FraternityBase Slack Integration Plan

## 🎯 Objective
Real-time Slack notifications for all major platform events so you can monitor activity at the switch.

---

## 📊 Events to Track

### 🆕 User Onboarding & Authentication
- **New User Signup**
  - User name, email, company name
  - Subscription tier
  - Timestamp
  - Assigned favorite chapter (if any)

### 💰 Financial Events
- **Credit Purchase**
  - User name, company
  - Package purchased (100, 500, 1000 credits)
  - Amount paid
  - New balance

- **Subscription Upgrade**
  - User name, company
  - Old tier → New tier
  - Monthly/Annual

- **Subscription Renewal**
  - User name, company
  - Renewal amount
  - Credits granted

### 🔓 Unlock Events
- **Chapter Unlock**
  - User name, company
  - Chapter name (fraternity + university)
  - Credits spent
  - Chapter grade/rating

- **Ambassador Unlock**
  - User name, company
  - Ambassador name, university
  - Credits spent

### 🤝 Engagement Events
- **Warm Introduction Request**
  - User name, company
  - Ambassador/Chapter requested
  - Credits spent
  - Status (pending/completed)

- **Ambassador Referral Request**
  - User name, company
  - Details of request
  - Credits spent

- **Venue Connection Request**
  - User name, company
  - Venue details
  - Credits spent

### ⭐ Admin Actions
- **5-Star Chapter Added**
  - Admin who added it
  - Chapter name (fraternity + university)
  - Grade/rating
  - Total 5-star chapters count

- **High-Value Data Import**
  - Type (universities, chapters, officers)
  - Number of records added
  - Admin who performed import

### 🚨 Critical Alerts
- **Low Credit Warning**
  - User about to run out of credits
  - Current balance < 50 credits

- **API Errors**
  - Critical endpoint failures
  - Error type and count

- **Subscription Expiration**
  - User subscription expiring in 3 days

---

## 🏗️ Technical Architecture

### Approach: Incoming Webhooks
Using Slack's Incoming Webhook API for simplicity and reliability.

**Why Webhooks:**
- ✅ Simple to implement
- ✅ No OAuth needed
- ✅ Fast and reliable
- ✅ Rich message formatting
- ✅ No rate limits for reasonable usage

### File Structure
```
backend/
├── src/
│   ├── utils/
│   │   └── slackNotifier.ts       # Main Slack utility
│   ├── config/
│   │   └── slackChannels.ts       # Channel configuration
│   └── server.ts                   # Add notifications to endpoints
└── .env                            # SLACK_WEBHOOK_URL
```

---

## 📝 Implementation Steps

### Step 1: Setup Slack Webhook
1. Go to https://api.slack.com/apps
2. Create new app "FraternityBase Monitor"
3. Enable "Incoming Webhooks"
4. Create webhook for your channel
5. Copy webhook URL to `.env` file

### Step 2: Create Slack Utility Module
```typescript
// backend/src/utils/slackNotifier.ts

interface SlackMessage {
  text: string;
  blocks?: any[];
  attachments?: any[];
}

export enum SlackEventType {
  USER_SIGNUP = 'user_signup',
  CREDIT_PURCHASE = 'credit_purchase',
  CHAPTER_UNLOCK = 'chapter_unlock',
  INTRO_REQUEST = 'intro_request',
  SUBSCRIPTION_UPGRADE = 'subscription_upgrade',
  FIVE_STAR_ADDED = 'five_star_added',
  ERROR_ALERT = 'error_alert',
}

class SlackNotifier {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  }

  async send(message: SlackMessage): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('Slack webhook URL not configured');
      return;
    }

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  // Formatted notification methods
  async notifySignup(user: any) { ... }
  async notifyCreditPurchase(user: any, amount: number, credits: number) { ... }
  async notifyChapterUnlock(user: any, chapter: any, credits: number) { ... }
  async notifyIntroRequest(user: any, target: any, credits: number) { ... }
  async notify5StarChapter(admin: any, chapter: any) { ... }
}

export const slack = new SlackNotifier();
```

### Step 3: Rich Message Templates
Use Slack Block Kit for beautiful notifications:

```typescript
// Example: User Signup
{
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "🆕 New User Signup!" }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Name:*\nJohn Doe" },
        { "type": "mrkdwn", "text": "*Email:*\njohn@company.com" },
        { "type": "mrkdwn", "text": "*Company:*\nAcme Brand" },
        { "type": "mrkdwn", "text": "*Tier:*\nFree Trial" }
      ]
    },
    {
      "type": "context",
      "elements": [
        { "type": "mrkdwn", "text": "⏰ Jan 7, 2025 10:45 AM" }
      ]
    }
  ]
}
```

### Step 4: Add to Endpoints

**Signup (server.ts ~line 300)**
```typescript
app.post('/api/register', async (req, res) => {
  // ... existing signup logic ...

  // Send Slack notification
  await slack.notifySignup({
    name: `${firstName} ${lastName}`,
    email,
    company: companyName,
    tier: 'Free Trial'
  });

  res.json({ success: true });
});
```

**Credit Purchase (server.ts ~line 1400)**
```typescript
app.post('/api/credits/purchase', requireAuth, async (req, res) => {
  // ... existing purchase logic ...

  // Send Slack notification
  await slack.notifyCreditPurchase(
    req.user,
    amount,
    creditsToAdd
  );

  res.json({ success: true });
});
```

**Chapter Unlock (server.ts ~line 600)**
```typescript
app.post('/api/chapters/:chapterId/unlock', requireAuth, async (req, res) => {
  // ... existing unlock logic ...

  // Send Slack notification
  await slack.notifyChapterUnlock(
    req.user,
    chapterData,
    credits
  );

  res.json({ success: true });
});
```

**Warm Intro Request (server.ts ~line 800)**
```typescript
app.post('/api/introductions/request', requireAuth, async (req, res) => {
  // ... existing intro logic ...

  // Send Slack notification
  await slack.notifyIntroRequest(
    req.user,
    targetAmbassador,
    PRICING.WARM_INTRO
  );

  res.json({ success: true });
});
```

**Admin 5-Star Chapter (server.ts ~line 1200)**
```typescript
app.patch('/api/admin/chapters/:chapterId', requireAdmin, async (req, res) => {
  // ... existing update logic ...

  // If grade is 5.0, notify
  if (updateData.grade === 5.0) {
    await slack.notify5StarChapter(
      req.user,
      data
    );
  }

  res.json({ success: true });
});
```

---

## 🎨 Message Examples

### 1. New User Signup
```
🆕 New User Signup!
━━━━━━━━━━━━━━━━━━━━
Name:        Jackson Fitzgerald
Email:       jackson@brand.com
Company:     Premium Brands Inc
Tier:        Free Trial
Assigned:    ΣΧ at Penn State
━━━━━━━━━━━━━━━━━━━━
⏰ Jan 7, 2025 10:45 AM
```

### 2. Credit Purchase
```
💰 Credit Purchase!
━━━━━━━━━━━━━━━━━━━━
User:        John Smith @ Acme Co
Package:     Pro Pack (1000 credits)
Amount:      $249.99
New Balance: 1,050 credits
━━━━━━━━━━━━━━━━━━━━
⏰ Jan 7, 2025 11:20 AM
```

### 3. Chapter Unlock
```
🔓 Chapter Unlocked!
━━━━━━━━━━━━━━━━━━━━
User:        Sarah Johnson @ Marketing Co
Chapter:     ΔΤΔ at University of Michigan
Grade:       ⭐⭐⭐⭐⭐ 5.0
Credits:     40 credits spent
Balance:     210 credits remaining
━━━━━━━━━━━━━━━━━━━━
⏰ Jan 7, 2025 2:15 PM
```

### 4. Warm Introduction Request
```
🤝 Warm Introduction Requested!
━━━━━━━━━━━━━━━━━━━━
User:        Mike Davis @ Brand X
Target:      Tyler Smith (ΣΑΕ at Ohio State)
Credits:     200 credits spent
Status:      📧 Email sent to admin
━━━━━━━━━━━━━━━━━━━━
⏰ Jan 7, 2025 3:45 PM
```

### 5. 5-Star Chapter Added
```
⭐ NEW 5-Star Chapter!
━━━━━━━━━━━━━━━━━━━━
Chapter:     ΦΔΘ at USC
Grade:       ⭐⭐⭐⭐⭐ 5.0
Added by:    Admin Jackson
Total 5★:    47 chapters
━━━━━━━━━━━━━━━━━━━━
⏰ Jan 7, 2025 4:30 PM
```

### 6. Subscription Upgrade
```
📈 Subscription Upgrade!
━━━━━━━━━━━━━━━━━━━━
User:        Alex Brown @ Startup Inc
Upgrade:     Free Trial → Monthly ($29.99)
Credits:     +100 credits granted
New Balance: 100 credits
━━━━━━━━━━━━━━━━━━━━
⏰ Jan 7, 2025 5:00 PM
```

---

## 🔧 Environment Variables

Add to `.env` file:
```bash
# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
SLACK_ENABLED=true
SLACK_ERROR_CHANNEL_URL=https://hooks.slack.com/services/... # Optional separate error channel
```

Add to Vercel:
```bash
vercel env add SLACK_WEBHOOK_URL
vercel env add SLACK_ENABLED
```

---

## 📊 Optional: Daily Summary Report

Scheduled function that runs at 9 AM daily:

```typescript
// POST /api/admin/slack-summary (called via cron job)

📊 Daily FraternityBase Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆕 New Signups:           12 users
💰 Revenue:               $1,249.97
🔓 Chapter Unlocks:       45 unlocks
🤝 Intro Requests:        8 requests
⭐ 5-Star Chapters:       2 added
📈 Total Active Users:    347 users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Top Chapters Unlocked:
1. ΣΧ at Penn State (8x)
2. ΦΔΘ at USC (6x)
3. ΚΣ at Alabama (5x)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Jan 7, 2025 9:00 AM
```

---

## 🚀 Deployment Checklist

- [ ] Create Slack app and get webhook URL
- [ ] Add `SLACK_WEBHOOK_URL` to backend `.env`
- [ ] Create `slackNotifier.ts` utility module
- [ ] Add notifications to signup endpoint
- [ ] Add notifications to credit purchase endpoint
- [ ] Add notifications to chapter unlock endpoint
- [ ] Add notifications to intro request endpoint
- [ ] Add notifications to admin chapter update endpoint
- [ ] Add notifications to subscription upgrade endpoint
- [ ] Test all notifications locally
- [ ] Add environment variable to Vercel
- [ ] Deploy backend to production
- [ ] Verify notifications work in production
- [ ] (Optional) Set up daily summary cron job
- [ ] (Optional) Set up error alerts channel

---

## 🎯 Success Metrics

After implementation, you'll be able to:
- ✅ See every signup in real-time
- ✅ Track all revenue events instantly
- ✅ Monitor which chapters are being unlocked
- ✅ See intro request activity
- ✅ Get notified when 5-star data is added
- ✅ Stay informed on platform health
- ✅ Respond quickly to user activity

---

## 📚 Resources

- Slack Incoming Webhooks: https://api.slack.com/messaging/webhooks
- Slack Block Kit Builder: https://api.slack.com/block-kit
- Message Formatting: https://api.slack.com/reference/surfaces/formatting

---

## 🔮 Future Enhancements

- **Slash Commands**: `/fraternitybase stats`, `/fraternitybase revenue`
- **Interactive Buttons**: Approve/reject intro requests from Slack
- **User Lookup**: `/fraternitybase user email@example.com`
- **Chapter Search**: `/fraternitybase chapter Penn State`
- **Analytics Dashboard**: Grafana integration with Slack alerts

---

**Estimated Implementation Time:** 2-3 hours
**Priority:** High - Real-time monitoring is crucial for growth

Ready to implement when you return! 🚀
