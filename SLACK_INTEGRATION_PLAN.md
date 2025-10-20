# Slack Integration Plan - CollegeOrgNetwork

## 📋 Overview
Integrate Slack notifications for key business events to provide real-time visibility into platform activity.

## 🎯 Events to Track

### 1. Company Signup
**Trigger:** New company registration
**Data to include:**
- Company name
- User name (founder)
- User email
- Signup timestamp
- Subscription tier

### 2. Waitlist Join
**Trigger:** User joins waitlist
**Data to include:**
- User name
- User email
- College/affiliation
- Waitlist timestamp

### 3. Chapter Unlock
**Trigger:** User unlocks a chapter with credits
**Data to include:**
- Company name
- User name
- Chapter unlocked (university + fraternity)
- Credits spent
- Unlock type (roster, contacts, full access)
- Remaining balance

### 4. Stripe Purchase
**Trigger:** Successful Stripe payment
**Data to include:**
- Company name
- User name
- Purchase amount
- Credits purchased
- Payment method (last 4 digits)
- Invoice ID

---

## 🏗️ Architecture

### Slack Webhook Setup
1. **Create Slack App** at https://api.slack.com/apps
2. **Enable Incoming Webhooks**
3. **Add webhook to desired channel** (e.g., #growth, #revenue)
4. **Copy webhook URL** to environment variables

### Backend Service Structure
```
backend/
├── src/
│   ├── services/
│   │   └── slackNotificationService.ts  # NEW - Centralized Slack service
│   ├── routes/
│   │   ├── auth.ts                      # MODIFY - Add signup notification
│   │   ├── waitlist.ts                  # MODIFY - Add waitlist notification
│   │   ├── chapters.ts                  # MODIFY - Add unlock notification
│   │   └── credits.ts                   # MODIFY - Add purchase notification
│   └── .env                             # ADD - SLACK_WEBHOOK_URL
```

---

## 📝 Implementation Steps

### Step 1: Create Slack Notification Service

**File:** `backend/src/services/slackNotificationService.ts`

**Key Methods:**
- `notifyCompanySignup()` - New company registration
- `notifyWaitlistJoin()` - Waitlist entry
- `notifyChapterUnlock()` - Chapter unlock event  
- `notifyStripePurchase()` - Stripe payment success

### Step 2: Add Environment Variable

**File:** `backend/.env`
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 3: Integrate into Existing Routes

#### A. Company Signup (auth.ts)
**Location:** After successful company registration in signup route
**Import:** `import { slackNotifier } from '../services/slackNotificationService';`

#### B. Waitlist Join (waitlist.ts)
**Location:** After waitlist entry creation
**Import:** `import { slackNotifier } from '../services/slackNotificationService';`

#### C. Chapter Unlock (chapters.ts)
**Location:** After successful unlock in `/chapters/:id/unlock` endpoint
**Import:** `import { slackNotifier } from '../services/slackNotificationService';`

#### D. Stripe Purchase (credits.ts)
**Location:** After successful payment in Stripe webhook handler
**Import:** `import { slackNotifier } from '../services/slackNotificationService';`

---

## 🎨 Slack Message Examples

### Company Signup Message
```
🎉 New Company Signup

Company: Acme Corp
Founder: John Smith
Email: john@acme.com
Tier: trial

Today at 2:45 PM
```

### Chapter Unlock Message
```
🔓 Chapter Unlocked

Company: Acme Corp
User: John Smith
Chapter: Sigma Chi
University: Penn State University
Unlock Type: full
Credits Spent: 5
Remaining: 95 credits

Today at 3:12 PM
```

### Stripe Purchase Message
```
💰 Stripe Purchase

Company: Acme Corp
User: John Smith
Amount: $99.00
Credits: 100
Payment: •••• 4242
Invoice: pi_abc123

Today at 4:30 PM
```

---

## 🧪 Testing Plan

### Manual Testing
1. **Company Signup:** Register a new company and check Slack
2. **Waitlist:** Add entry to waitlist and check Slack
3. **Chapter Unlock:** Unlock a chapter and check Slack
4. **Stripe Purchase:** Make a test purchase and check Slack

### Error Handling
- Service should fail gracefully if Slack is down
- Log errors but don't block main operations
- Use try/catch around all Slack calls

---

## 🚀 Deployment Checklist

- [ ] Create Slack app and get webhook URL
- [ ] Add SLACK_WEBHOOK_URL to `.env` and set SLACK_ENABLED=true
- [ ] Add SLACK_WEBHOOK_URL to Vercel environment variables
- [x] Create SlackNotifier utility (`backend/src/utils/slackNotifier.ts`)
- [x] Add notifyWaitlistJoin method to SlackNotifier
- [x] Update server.ts with signup notification (line 1827)
- [x] Update server.ts with waitlist notification (line 4147)
- [x] Update server.ts with chapter unlock notification (line 1469)
- [x] Update credits.ts with Stripe purchase notification (line 645)
- [ ] Test all notifications in development
- [ ] Deploy to production
- [ ] Test all notifications in production
- [ ] Monitor Slack channel for incoming notifications

## ✅ Implementation Complete

All Slack notification integrations have been added to the codebase:

1. **Company Signup** - Triggers when new company registers (server.ts:1827)
2. **Waitlist Join** - Triggers when user joins waitlist (server.ts:4147)
3. **Chapter Unlock** - Triggers when chapter is unlocked (server.ts:1469)
4. **Stripe Purchase** - Triggers on successful credit purchase (credits.ts:645)

### Next Steps:
1. Set up Slack Incoming Webhook in your Slack workspace
2. Add `SLACK_WEBHOOK_URL` and `SLACK_ENABLED=true` to environment variables
3. Test notifications in development
4. Deploy to production and monitor Slack channel

---

## 📊 Future Enhancements

### Phase 2 Features
- **Daily Digest:** Summary of signups, unlocks, revenue
- **Weekly Reports:** Growth metrics, top customers
- **Error Alerts:** Critical errors sent to #tech-alerts
- **User Milestones:** First unlock, 10th unlock, etc.
- **Churn Alerts:** Inactive users, cancelled subscriptions

### Advanced Features
- **Interactive Messages:** Buttons to view user profile, chapter details
- **Slash Commands:** `/fraternitybase stats` for quick metrics
- **Two-Way Integration:** Update records from Slack
- **Custom Channels:** #signups, #revenue, #unlocks
