# Stripe Setup Guide for FraternityBase Credits System

## 🎯 Overview
You need to create 2 recurring subscription products in Stripe for the credits system to work.

## 📋 Step-by-Step Setup

### Step 1: Go to Stripe Dashboard
1. Login to https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top-right)
3. Navigate to **Products** in the left menu

### Step 2: Create Monthly Subscription Product

1. Click **"+ Add product"**
2. Fill in the details:
   - **Name:** `FraternityBase Monthly`
   - **Description:** `Monthly subscription with 100 free credits per month`
   - **Pricing model:** `Standard pricing`
   - **Price:** `$29.99`
   - **Billing period:** `Monthly`
   - **Currency:** `USD`
3. Click **"Save product"**
4. **Copy the Price ID** (starts with `price_...`) from the pricing section
5. Paste it in your `.env` file:
   ```
   STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
   ```

### Step 3: Create Enterprise Subscription Product

1. Click **"+ Add product"** again
2. Fill in the details:
   - **Name:** `FraternityBase Enterprise`
   - **Description:** `Enterprise subscription with 500 free credits per month`
   - **Pricing model:** `Standard pricing`
   - **Price:** `$99.99`
   - **Billing period:** `Monthly`
   - **Currency:** `USD`
3. Click **"Save product"**
4. **Copy the Price ID** (starts with `price_...`) from the pricing section
5. Paste it in your `.env` file:
   ```
   STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
   ```

### Step 4: Configure Webhook (IMPORTANT!)

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - For local testing: Use **Stripe CLI** (see below)
   - For production: `https://yourdomain.com/api/credits/webhook`
4. Click **"Select events"** and choose:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
5. Click **"Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_...`)
7. Update your `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Step 5: Test with Stripe CLI (Local Development)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3001/api/credits/webhook
   ```
4. Copy the webhook signing secret from the CLI output
5. Update your `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

## ✅ Verification Checklist

After setup, your `.env` should have:
```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
```

## 🧪 Test the Setup

Run the test suite:
```bash
node test-credits-system.js
```

All 6 tests should pass! ✅

## 🚀 Going Live

When ready for production:
1. Switch Stripe to **Live Mode**
2. Create the same products in Live Mode
3. Get the **Live** Price IDs and Webhook Secret
4. Update production environment variables
5. Update webhook endpoint to production URL

## 📚 Supported Features

### One-Time Credit Purchases
Users can buy credit packages at any time:
- 100 credits - $29.99
- 500 credits - $139.99
- 1000 credits - $249.99

### Recurring Subscriptions
- **Monthly** - $29.99/month + 100 free credits/month
- **Enterprise** - $99.99/month + 500 free credits/month

### Automatic Monthly Credits
- Subscribers get free credits every 30 days automatically
- Handled by cron job calling `/api/cron/grant-monthly-credits`

## 🛠️ Troubleshooting

**Problem:** Webhook not receiving events
- **Solution:** Make sure Stripe CLI is running with `stripe listen --forward-to...`

**Problem:** "No such price" error
- **Solution:** Verify Price IDs are correct in `.env` file

**Problem:** Monthly credits not granted
- **Solution:** Run the SQL migration `verify_grant_monthly_credits.sql` in Supabase

**Problem:** Credits not added after purchase
- **Solution:** Check webhook endpoint is receiving events and logging properly
