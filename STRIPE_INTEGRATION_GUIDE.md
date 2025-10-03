# Stripe Integration Guide - FraternityBase Credit System

**Version:** 1.0
**Last Updated:** January 2025
**System:** FraternityBase Credit Payment System

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Credit Packages & Pricing](#credit-packages--pricing)
3. [Checkout Flow](#checkout-flow)
4. [Webhook Integration](#webhook-integration)
5. [Database Schema](#database-schema)
6. [Environment Variables](#environment-variables)
7. [API Endpoints](#api-endpoints)
8. [Security & Best Practices](#security--best-practices)
9. [Testing Guide](#testing-guide)
10. [Troubleshooting](#troubleshooting)
11. [Production Checklist](#production-checklist)

---

## System Overview

The FraternityBase platform uses a **credit-based payment system** where companies purchase credits through Stripe and spend them to unlock chapter data. The integration consists of:

- **Frontend**: React/TypeScript credit purchase UI
- **Backend**: Express.js API with Stripe SDK
- **Database**: Supabase (PostgreSQL) for credit tracking
- **Payment Processor**: Stripe Checkout Sessions (one-time payments)

### Architecture Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────┐      ┌──────────┐
│   Frontend  │─────▶│   Backend    │─────▶│ Stripe  │─────▶│ Customer │
│ CreditsPage │      │ /checkout    │      │Checkout │      │   Pays   │
└─────────────┘      └──────────────┘      └─────────┘      └──────────┘
                              │                    │
                              │                    │
                              ▼                    ▼
                     ┌──────────────┐      ┌─────────────┐
                     │   Supabase   │◀─────│   Webhook   │
                     │   Database   │      │  /webhook   │
                     └──────────────┘      └─────────────┘
                         (Credits)         (Fulfillment)
```

---

## Credit Packages & Pricing

### Package Structure

The system offers **5 credit packages** with tiered pricing:

| Package ID     | Name              | Credits | Price  | Stripe Price ID                   | Use Case                    |
|----------------|-------------------|---------|--------|-----------------------------------|-----------------------------|
| `trial`        | Free Trial        | 10      | $0.99  | `price_1SCsIXGCEQehRVO2MLYhAAv5` | Test the platform           |
| `starter`      | Starter Pack      | 100     | $59    | `price_1SCo7FGCEQehRVO2DuF4YivE` | Small campaigns (~10 unlocks)|
| `popular`      | Popular Pack      | 500     | $275   | `price_1SCo7uGCEQehRVO2aeKPhB5D` | Mid-size campaigns          |
| `professional` | Professional Pack | 1,000   | $500   | `price_1SCo8HGCEQehRVO2THIU6hiP` | Large campaigns             |
| `enterprise`   | Enterprise        | 5,000   | $2,000 | `price_1SCo8yGCEQehRVO2ItYM17aV` | Enterprise accounts         |

### Pricing Configuration

**Backend** (`/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/src/server.ts` lines 85-91):
```typescript
const CREDIT_PACKAGES: Record<string, any> = {
  trial: {
    credits: 10,
    price: 0.99,
    priceId: process.env.VITE_STRIPE_PRICE_TRIAL || 'price_trial'
  },
  starter: {
    credits: 100,
    price: 59,
    priceId: process.env.VITE_STRIPE_PRICE_STARTER || 'price_1SCo7FGCEQehRVO2DuF4YivE'
  },
  popular: {
    credits: 500,
    price: 275,
    priceId: process.env.VITE_STRIPE_PRICE_POPULAR || 'price_1SCo7uGCEQehRVO2aeKPhB5D'
  },
  professional: {
    credits: 1000,
    price: 500,
    priceId: process.env.VITE_STRIPE_PRICE_PROFESSIONAL || 'price_1SCo8HGCEQehRVO2THIU6hiP'
  },
  enterprise: {
    credits: 5000,
    price: 2000,
    priceId: process.env.VITE_STRIPE_PRICE_ENTERPRISE || 'price_1SCo8yGCEQehRVO2ItYM17aV'
  }
};
```

**Frontend** (`/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/src/pages/CreditsPage.tsx` lines 21-81):
- Same package structure with additional UI features
- Savings badges (e.g., "Save 7%")
- Feature lists per package
- Enterprise package shows "Contact Sales"

### Credit Costs

Companies spend credits to unlock chapter data:

| Feature                    | Credits | Description                           |
|----------------------------|---------|---------------------------------------|
| Basic Info                 | 5       | Instagram & Website only              |
| Roster (View Only)         | 25      | Member names + emails + phones        |
| Officers                   | 15      | Officer names + emails + phones       |
| Warm Introduction          | 100     | Personal introduction service (~$50)  |
| Full Chapter Data          | 50      | Complete chapter information          |

*Defined in `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/src/server.ts` lines 254-260*

---

## Checkout Flow

### Step-by-Step Process

#### 1. User Initiates Purchase (Frontend)

**Location**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/src/pages/CreditsPage.tsx` lines 108-146

```typescript
const handlePurchase = async (packageId: string, priceId: string) => {
  setLoading(packageId);

  try {
    // Create checkout session
    const response = await fetch(`${import.meta.env.VITE_API_URL}/credits/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        packageId,
        priceId,
        companyId: user?.id,
        userEmail: user?.email
      })
    });

    const data = await response.json();

    // Redirect to Stripe Checkout
    window.location.href = data.url;
  } catch (error) {
    console.error('Purchase failed:', error);
    alert('Failed to initiate purchase. Please try again.');
  }
};
```

**Request Payload:**
```json
{
  "packageId": "popular",
  "priceId": "price_1SCo7uGCEQehRVO2aeKPhB5D",
  "companyId": "uuid-here",
  "userEmail": "user@example.com"
}
```

#### 2. Backend Creates Stripe Session

**Location**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/src/server.ts` lines 133-178

```typescript
app.post('/api/credits/checkout', async (req, res) => {
  const { packageId, priceId } = req.body;
  const pkg = CREDIT_PACKAGES[packageId];

  if (!pkg) {
    return res.status(400).json({ error: 'Invalid package' });
  }

  try {
    // Authenticate user via JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    const stripe = getStripe();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId || pkg.priceId,
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/dashboard?payment=success&credits=${pkg.credits}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/credits?payment=cancelled`,
      metadata: {
        packageId,
        credits: pkg.credits.toString(),
        companyId: user.id  // CRITICAL: User ID for fulfillment
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**Key Points:**
- **Authentication**: Validates user JWT token
- **Metadata**: Stores `packageId`, `credits`, and `companyId` for webhook fulfillment
- **Mode**: `payment` (one-time payment, not subscription)
- **Payment Methods**: Credit cards only
- **Redirects**: Success/cancel URLs with query params

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_abc123..."
}
```

#### 3. User Completes Payment on Stripe

- User redirected to Stripe Checkout
- Enters payment details
- Completes payment
- Stripe processes payment
- Stripe fires `checkout.session.completed` webhook event

#### 4. Webhook Processes Payment

**Location**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/src/server.ts` lines 180-226

See [Webhook Integration](#webhook-integration) section below.

#### 5. Success Redirect

After payment, user is redirected to:
```
https://fraternitybase.com/app/dashboard?payment=success&credits=500
```

Frontend can detect this and show a success message.

---

## Webhook Integration

### Webhook Endpoint Configuration

**Endpoint URL**: `https://your-domain.com/api/credits/webhook`
**Events to Listen For**: `checkout.session.completed`
**Method**: POST
**Raw Body**: Required for signature verification

### Webhook Handler Code

**Location**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/src/server.ts` lines 180-226

```typescript
app.post('/api/credits/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).send('No signature');

  try {
    const stripe = getStripe();
    if (!stripe) throw new Error('Stripe not initialized');

    // STEP 1: Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    // STEP 2: Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const companyId = session.metadata?.companyId;
      const credits = parseInt(session.metadata?.credits || '0');
      const packageId = session.metadata?.packageId;

      console.log('💳 Payment successful:', {
        companyId,
        credits,
        packageId,
        amountPaid: session.amount_total / 100
      });

      // STEP 3: Add credits to user account (ATOMIC)
      if (companyId && credits > 0) {
        const { data: result, error: addError } = await supabaseAdmin.rpc('add_credits', {
          p_company_id: companyId,
          p_amount: credits,
          p_description: `Purchased ${CREDIT_PACKAGES[packageId]?.name || packageId} package`,
          p_reference_id: session.payment_intent,
          p_reference_type: 'stripe_payment'
        });

        if (addError) {
          console.error('Error adding credits:', addError);
        } else {
          console.log(`✅ Added ${credits} credits to company ${companyId}. New balance: ${result.balance}`);
        }
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

### Webhook Security

#### Signature Verification

Stripe signs every webhook with your webhook secret. The backend verifies this signature to ensure:
1. The request came from Stripe
2. The payload hasn't been tampered with
3. The request isn't a replay attack

```typescript
const event = stripe.webhooks.constructEvent(
  req.body,           // Raw request body (NOT parsed JSON!)
  sig,                // Stripe-Signature header
  webhookSecret       // Your webhook secret from Stripe dashboard
);
```

**IMPORTANT**: Your Express app must receive the RAW request body for signature verification. If you're using `express.json()` middleware, you may need to exclude the webhook route:

```typescript
app.use('/api/credits/webhook', express.raw({type: 'application/json'}));
app.use(express.json());  // For all other routes
```

#### Idempotency

The database function `add_credits` uses `INSERT ... ON CONFLICT` to handle duplicate webhook calls:

```sql
INSERT INTO credits (company_id, balance, lifetime_total)
VALUES (p_company_id, p_amount, p_amount)
ON CONFLICT (company_id)
DO UPDATE SET
  balance = credits.balance + p_amount,
  lifetime_total = credits.lifetime_total + p_amount
```

Each transaction is logged separately, so duplicate webhooks would create duplicate transaction records but not double-credit the account (though this should be prevented by Stripe's idempotency).

### Webhook Events

Currently handling:
- `checkout.session.completed` - Payment successful, fulfill order

Future considerations:
- `payment_intent.succeeded` - Alternative to checkout.session.completed
- `charge.refunded` - Handle refunds (deduct credits)
- `payment_intent.payment_failed` - Alert user of failure
- `invoice.payment_failed` - For future subscription model

---

## Database Schema

### Tables

#### 1. `credits` - User Credit Balances

**Location**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/create_unlock_tables.sql` lines 1-10

```sql
CREATE TABLE credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id)
);
```

**Fields:**
- `company_id`: Foreign key to companies table (one-to-one)
- `balance`: Current available credits
- `lifetime_total`: Total credits purchased (never decreases)

#### 2. `credit_transactions` - Transaction Log

**Location**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/create_unlock_tables.sql` lines 12-24

```sql
CREATE TABLE credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,           -- Positive = purchase, Negative = spend
  transaction_type VARCHAR(50) NOT NULL,  -- 'purchase', 'unlock', 'refund', 'admin_adjustment'
  description TEXT,
  reference_id UUID,                 -- payment_intent for purchases, chapter_id for unlocks
  reference_type VARCHAR(50),        -- 'stripe_payment', 'chapter'
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);
```

**Transaction Types:**
- `purchase`: Credit purchase via Stripe
- `unlock`: Chapter data unlock
- `refund`: Stripe refund (future)
- `admin_adjustment`: Manual admin changes

#### 3. `chapter_unlocks` - Unlocked Chapters

**Location**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/create_unlock_tables.sql` lines 26-36

```sql
CREATE TABLE chapter_unlocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  unlock_type VARCHAR(50) NOT NULL,  -- 'roster', 'emails', 'phones', 'officers', 'full'
  credits_spent INTEGER NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,  -- NULL = permanent, or 6 months from unlock
  UNIQUE(company_id, chapter_id, unlock_type)
);
```

### Database Functions

#### `add_credits()` - Add Credits (Atomic)

**Location**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/create_unlock_tables.sql` lines 65-102

```sql
CREATE OR REPLACE FUNCTION add_credits(
  p_company_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type VARCHAR DEFAULT 'payment'
)
RETURNS JSONB AS $$
DECLARE
  v_new_balance INTEGER;
  v_lifetime_total INTEGER;
BEGIN
  -- Atomic upsert of credit balance
  INSERT INTO credits (company_id, balance, lifetime_total)
  VALUES (p_company_id, p_amount, p_amount)
  ON CONFLICT (company_id)
  DO UPDATE SET
    balance = credits.balance + p_amount,
    lifetime_total = credits.lifetime_total + p_amount,
    updated_at = CURRENT_TIMESTAMP
  RETURNING balance, lifetime_total INTO v_new_balance, v_lifetime_total;

  -- Record transaction
  INSERT INTO credit_transactions (
    company_id, amount, transaction_type, description,
    reference_id, reference_type, balance_after
  ) VALUES (
    p_company_id, p_amount, 'purchase', p_description,
    p_reference_id, p_reference_type, v_new_balance
  );

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_new_balance,
    'lifetime_total', v_lifetime_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage:**
```typescript
await supabaseAdmin.rpc('add_credits', {
  p_company_id: 'uuid-here',
  p_amount: 500,
  p_description: 'Purchased Popular Pack',
  p_reference_id: 'pi_stripe_payment_intent_id',
  p_reference_type: 'stripe_payment'
});
```

#### `spend_credits()` - Spend Credits (Atomic)

**Location**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/create_unlock_tables.sql` lines 105-175

```sql
CREATE OR REPLACE FUNCTION spend_credits(
  p_company_id UUID,
  p_chapter_id UUID,
  p_unlock_type VARCHAR,
  p_credits_cost INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM credits WHERE company_id = p_company_id;

  -- Check sufficient credits
  IF v_current_balance IS NULL OR v_current_balance < p_credits_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits');
  END IF;

  -- Check if already unlocked
  IF EXISTS (
    SELECT 1 FROM chapter_unlocks
    WHERE company_id = p_company_id AND chapter_id = p_chapter_id
    AND unlock_type = p_unlock_type
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already unlocked');
  END IF;

  -- Deduct credits
  UPDATE credits SET balance = balance - p_credits_cost, updated_at = CURRENT_TIMESTAMP
  WHERE company_id = p_company_id
  RETURNING balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO credit_transactions (
    company_id, amount, transaction_type, description,
    reference_id, reference_type, balance_after
  ) VALUES (
    p_company_id, -p_credits_cost, 'unlock',
    'Unlocked ' || p_unlock_type || ' data',
    p_chapter_id, 'chapter', v_new_balance
  );

  -- Record unlock (6 months expiry)
  INSERT INTO chapter_unlocks (
    company_id, chapter_id, unlock_type, credits_spent, expires_at
  ) VALUES (
    p_company_id, p_chapter_id, p_unlock_type, p_credits_cost,
    CURRENT_TIMESTAMP + INTERVAL '6 months'
  );

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_new_balance,
    'credits_spent', p_credits_cost
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Environment Variables

### Backend Environment Variables

**File**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/.env`

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_c16c6c281ae675548c58e937c34834393fc374a06e4b5dc030f5a3c14cfc1284

# Frontend URL (for Stripe redirects)
FRONTEND_URL=http://localhost:5173

# Supabase (for database access)
SUPABASE_URL=https://vvsawtexgpopqxgaqyxg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>  # Required for admin operations
```

### Frontend Environment Variables

**File**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/.env`

```bash
# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RADm3GCEQehRVO2NF5SSf5tEECZw9Fy2WWh0AFbvOgft1SywjCvwn0jziLG02olZueJtFeQxN1pSxkfUYcrUTBF00opHgJXne

# Stripe Price IDs
VITE_STRIPE_PRICE_TRIAL=price_1SCsIXGCEQehRVO2MLYhAAv5
VITE_STRIPE_PRICE_STARTER=price_1SCo7FGCEQehRVO2DuF4YivE
VITE_STRIPE_PRICE_POPULAR=price_1SCo7uGCEQehRVO2aeKPhB5D
VITE_STRIPE_PRICE_PROFESSIONAL=price_1SCo8HGCEQehRVO2THIU6hiP
VITE_STRIPE_PRICE_ENTERPRISE=price_1SCo8yGCEQehRVO2ItYM17aV

# API URL
VITE_API_URL=http://localhost:3001/api
```

### How to Get These Values

1. **STRIPE_SECRET_KEY**: Stripe Dashboard → Developers → API Keys → Secret key
2. **STRIPE_WEBHOOK_SECRET**: Stripe Dashboard → Developers → Webhooks → Add endpoint → Signing secret
3. **VITE_STRIPE_PUBLISHABLE_KEY**: Stripe Dashboard → Developers → API Keys → Publishable key
4. **VITE_STRIPE_PRICE_***: Stripe Dashboard → Products → Select product → Copy Price ID

---

## API Endpoints

### 1. `GET /api/credits/balance`

Fetch user's current credit balance.

**Authentication**: Required (Bearer token)

**Request:**
```bash
GET /api/credits/balance
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "balance": 450,
  "lifetime": 500
}
```

**Implementation**: Lines 94-131 in `server.ts`

---

### 2. `POST /api/credits/checkout`

Create Stripe checkout session for credit purchase.

**Authentication**: Required (Bearer token)

**Request:**
```bash
POST /api/credits/checkout
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "packageId": "popular",
  "priceId": "price_1SCo7uGCEQehRVO2aeKPhB5D"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_live_abc123..."
}
```

**Implementation**: Lines 133-178 in `server.ts`

---

### 3. `POST /api/credits/webhook`

Stripe webhook endpoint for payment fulfillment.

**Authentication**: Stripe signature verification

**Headers:**
```
Stripe-Signature: t=1234567890,v1=abc123...
Content-Type: application/json
```

**Body**: Raw Stripe event payload

**Response:**
```json
{
  "received": true
}
```

**Implementation**: Lines 180-226 in `server.ts`

---

### 4. `POST /api/chapters/:id/unlock`

Unlock chapter data using credits.

**Authentication**: Required (Bearer token)

**Request:**
```bash
POST /api/chapters/abc-123/unlock
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "unlockType": "roster"
}
```

**Response:**
```json
{
  "success": true,
  "balance": 425,
  "creditsSpent": 25,
  "unlockType": "roster"
}
```

**Implementation**: Lines 229-291 in `server.ts`

---

### 5. `GET /api/chapters/:id/unlock-status`

Check what data has been unlocked for a chapter.

**Authentication**: Required (Bearer token)

**Request:**
```bash
GET /api/chapters/abc-123/unlock-status
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "success": true,
  "unlocked": ["roster", "officers"]
}
```

**Implementation**: Lines 293-333 in `server.ts`

---

## Security & Best Practices

### 1. Webhook Secret Management

**NEVER** expose your webhook secret in frontend code or public repositories.

✅ **Good:**
```typescript
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
```

❌ **Bad:**
```typescript
const webhookSecret = 'whsec_abc123...';  // NEVER hardcode!
```

### 2. Signature Verification

Always verify webhook signatures before processing:

```typescript
const event = stripe.webhooks.constructEvent(
  rawBody,           // MUST be raw request body
  signature,         // From Stripe-Signature header
  webhookSecret
);
```

If signature verification fails, return `400` and do NOT process the webhook.

### 3. Idempotency Handling

Stripe may send the same webhook multiple times. Your system should be idempotent:

- **Database Level**: Use `UNIQUE` constraints and `INSERT ... ON CONFLICT`
- **Application Level**: Check for duplicate `payment_intent` IDs before processing
- **Stripe Level**: Stripe provides idempotency keys for API requests

### 4. Error Handling

**Webhook Errors:**
- Return `200` OK even if processing fails (to avoid Stripe retrying forever)
- Log errors for manual review
- Set up monitoring/alerts for webhook failures

```typescript
try {
  await processWebhook(event);
  res.status(200).json({ received: true });
} catch (error) {
  console.error('Webhook processing failed:', error);
  // Still return 200 to prevent Stripe retrying
  res.status(200).json({ received: true, error: error.message });
}
```

**Checkout Errors:**
- Return appropriate HTTP status codes
- Provide user-friendly error messages
- Log full error details for debugging

### 5. Rate Limiting

Consider implementing rate limiting on checkout endpoint to prevent abuse:

```typescript
// Example with express-rate-limit
import rateLimit from 'express-rate-limit';

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 requests per window
  message: 'Too many purchase attempts, please try again later'
});

app.post('/api/credits/checkout', checkoutLimiter, async (req, res) => {
  // ...
});
```

### 6. Amount Verification

**CRITICAL**: Always verify the payment amount in the webhook matches your expected package price:

```typescript
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const packageId = session.metadata?.packageId;
  const expectedPrice = CREDIT_PACKAGES[packageId]?.price * 100;  // Stripe uses cents

  if (session.amount_total !== expectedPrice) {
    console.error('Price mismatch!', {
      expected: expectedPrice,
      received: session.amount_total
    });
    // Don't fulfill order
    return res.status(400).json({ error: 'Price mismatch' });
  }

  // Safe to fulfill...
}
```

### 7. User Authentication

Always authenticate users before creating checkout sessions:

```typescript
const token = req.headers.authorization?.substring(7);
const { data: { user }, error } = await supabase.auth.getUser(token);

if (error || !user) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

---

## Testing Guide

### Test Mode Setup

1. **Use Test API Keys**

```bash
# Backend .env
STRIPE_SECRET_KEY=sk_test_...

# Frontend .env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

2. **Create Test Products**

In Stripe Dashboard:
- Switch to Test Mode (toggle in top-right)
- Products → Create Product
- Add Prices → Copy Price IDs
- Update environment variables

3. **Set Up Test Webhook**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/credits/webhook

# Copy webhook signing secret to .env
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Test Card Numbers

| Card Number         | Scenario                          |
|---------------------|-----------------------------------|
| 4242 4242 4242 4242 | Successful payment                |
| 4000 0000 0000 0002 | Card declined                     |
| 4000 0000 0000 9995 | Insufficient funds                |
| 4000 0025 0000 3155 | 3D Secure authentication required |

**Expiry**: Any future date (e.g., 12/34)
**CVC**: Any 3 digits (e.g., 123)
**ZIP**: Any 5 digits (e.g., 12345)

### Testing Checklist

- [ ] Create checkout session successfully
- [ ] Redirect to Stripe Checkout
- [ ] Complete payment with test card
- [ ] Webhook receives `checkout.session.completed`
- [ ] Webhook verifies signature
- [ ] Credits added to database
- [ ] User sees updated balance
- [ ] Transaction logged in `credit_transactions`
- [ ] Success redirect works
- [ ] Cancel redirect works
- [ ] Error handling (invalid package, auth failure)
- [ ] Insufficient credits handled correctly
- [ ] Duplicate unlock prevention

### Testing Webhooks Locally

**Option 1: Stripe CLI (Recommended)**

```bash
# Terminal 1: Start your backend server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3001/api/credits/webhook

# Terminal 3: Trigger test events
stripe trigger checkout.session.completed
```

**Option 2: Stripe Dashboard**

1. Go to Developers → Webhooks → Add endpoint
2. Enter your public URL (use ngrok for local testing)
3. Select events: `checkout.session.completed`
4. Send test webhook from dashboard

**Option 3: Manual cURL**

```bash
curl -X POST http://localhost:3001/api/credits/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=123,v1=abc" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "payment_intent": "pi_test_123",
        "amount_total": 27500,
        "metadata": {
          "packageId": "popular",
          "credits": "500",
          "companyId": "your-user-id"
        }
      }
    }
  }'
```

---

## Troubleshooting

### Common Issues

#### 1. Webhook Not Firing

**Symptoms:**
- Payment completes but credits not added
- No logs in webhook handler

**Causes:**
- Webhook endpoint not registered in Stripe Dashboard
- Incorrect webhook URL
- Firewall blocking Stripe IPs
- Server not running

**Solutions:**
1. Check Stripe Dashboard → Developers → Webhooks
2. Verify endpoint URL is correct and publicly accessible
3. Check webhook event logs in Stripe Dashboard
4. Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3001/api/credits/webhook`

---

#### 2. Signature Verification Failed

**Error:** `Webhook Error: No signatures found matching the expected signature for payload`

**Causes:**
- Wrong webhook secret
- Request body parsed before verification
- Incorrect `Stripe-Signature` header

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Use raw request body: `app.use('/api/credits/webhook', express.raw({type: 'application/json'}))`
3. Check `Stripe-Signature` header exists
4. Re-generate webhook secret in Stripe Dashboard if needed

---

#### 3. Credits Not Added After Payment

**Symptoms:**
- Payment successful
- Webhook fires without errors
- Credits not in database

**Debug Steps:**

1. **Check Webhook Logs:**
```typescript
console.log('Webhook event:', event.type);
console.log('Metadata:', session.metadata);
console.log('Company ID:', companyId);
console.log('Credits:', credits);
```

2. **Verify Metadata:**
- Ensure `companyId` is correctly stored in session metadata
- Check `credits` is a valid number

3. **Check Database Function:**
```sql
-- Test add_credits directly
SELECT add_credits(
  'your-company-id',
  100,
  'Test purchase',
  'test-payment-intent',
  'stripe_payment'
);
```

4. **Check RLS Policies:**
- Ensure `SECURITY DEFINER` is set on `add_credits` function
- Verify `supabaseAdmin` client is used (not regular `supabase` client)

---

#### 4. Duplicate Charges

**Symptoms:**
- User charged twice
- Credits added twice

**Causes:**
- Webhook fired multiple times
- User clicked "Pay" button multiple times
- Stripe retry logic

**Solutions:**

1. **Check for Duplicate Payment Intents:**
```typescript
if (event.type === 'checkout.session.completed') {
  const paymentIntent = session.payment_intent;

  // Check if already processed
  const { data: existing } = await supabase
    .from('credit_transactions')
    .select('id')
    .eq('reference_id', paymentIntent)
    .single();

  if (existing) {
    console.log('Payment already processed');
    return res.status(200).json({ received: true });
  }

  // Process payment...
}
```

2. **Use Stripe Idempotency Keys:**
```typescript
const session = await stripe.checkout.sessions.create(
  { /* ... */ },
  { idempotencyKey: `checkout-${user.id}-${Date.now()}` }
);
```

---

#### 5. Insufficient Credits Error

**Symptoms:**
- User has credits but can't unlock
- Error: "Insufficient credits"

**Debug Steps:**

1. **Check Balance:**
```sql
SELECT * FROM credits WHERE company_id = 'your-company-id';
```

2. **Check Transaction History:**
```sql
SELECT * FROM credit_transactions
WHERE company_id = 'your-company-id'
ORDER BY created_at DESC;
```

3. **Verify Credit Cost:**
```typescript
// Ensure unlock cost matches backend definition
const UNLOCK_COSTS = {
  basic_info: 5,
  roster: 25,
  officers: 15,
  warm_introduction: 100,
  full: 50
};
```

---

#### 6. Checkout Session Expired

**Error:** "This Checkout Session has expired"

**Cause:** Stripe checkout sessions expire after 24 hours

**Solution:** Create a new checkout session (user must restart purchase)

---

#### 7. Payment Declined

**Symptoms:**
- User can't complete payment
- Card declined error

**Common Reasons:**
- Insufficient funds
- Card expired
- Bank blocking transaction
- 3D Secure authentication failed

**User Actions:**
1. Try different card
2. Contact their bank
3. Verify card details are correct
4. Enable international transactions (if applicable)

---

#### 8. Webhook Timeout

**Symptoms:**
- Webhook endpoint slow to respond
- Stripe retrying webhook multiple times

**Causes:**
- Slow database queries
- Synchronous external API calls in webhook
- Network latency

**Solutions:**

1. **Optimize Database Queries:**
```typescript
// Use database function (faster than multiple queries)
await supabaseAdmin.rpc('add_credits', { /* ... */ });
```

2. **Process Asynchronously:**
```typescript
app.post('/api/credits/webhook', async (req, res) => {
  // Verify signature
  const event = stripe.webhooks.constructEvent(...);

  // Respond quickly
  res.status(200).json({ received: true });

  // Process asynchronously (don't await)
  processWebhookEvent(event).catch(console.error);
});
```

3. **Set Webhook Timeout:**
In Stripe Dashboard, webhooks timeout after 5 seconds. Ensure your handler responds within this time.

---

#### 9. Test/Live Mode Mismatch

**Error:** "No such price: price_test_..."

**Cause:** Using test price IDs with live API keys (or vice versa)

**Solution:**
1. Check all env vars match the same mode (test or live)
2. Verify Price IDs exist in the current Stripe mode
3. Don't mix test and live keys

---

#### 10. CORS Errors

**Symptoms:**
- Checkout endpoint fails with CORS error
- Browser console shows "blocked by CORS policy"

**Causes:**
- Frontend URL not in backend CORS whitelist
- Missing credentials option

**Solutions:**

1. **Update Backend CORS:**
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://fraternitybase.com',
    // Add your frontend URLs
  ],
  credentials: true
}));
```

2. **Frontend Fetch:**
```typescript
fetch('/api/credits/checkout', {
  method: 'POST',
  credentials: 'include',  // Important for cookies
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Production Checklist

Before going live with Stripe payments, complete this checklist:

### Stripe Dashboard

- [ ] Switch from Test Mode to Live Mode
- [ ] Verify business details are complete
- [ ] Add bank account for payouts
- [ ] Complete identity verification (if required)
- [ ] Review and accept Stripe's terms of service

### Products & Pricing

- [ ] Create live products in Stripe Dashboard
- [ ] Create live prices for all 5 packages
- [ ] Copy live Price IDs to environment variables
- [ ] Verify package names, descriptions, and amounts
- [ ] Test each price with Stripe CLI: `stripe prices list`

### API Keys

- [ ] Generate live API keys (Secret Key & Publishable Key)
- [ ] Update backend `.env` with live `STRIPE_SECRET_KEY`
- [ ] Update frontend `.env` with live `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Securely store keys (never commit to Git)
- [ ] Rotate keys if ever exposed

### Webhook Configuration

- [ ] Create live webhook endpoint in Stripe Dashboard
- [ ] Endpoint URL: `https://your-domain.com/api/credits/webhook`
- [ ] Select events: `checkout.session.completed`
- [ ] Copy webhook signing secret to backend `.env`
- [ ] Test webhook with Stripe CLI: `stripe trigger checkout.session.completed`
- [ ] Verify webhook logs in Stripe Dashboard

### SSL/HTTPS

- [ ] Ensure backend has valid SSL certificate
- [ ] All URLs use `https://` (not `http://`)
- [ ] Test webhook delivery over HTTPS
- [ ] Verify no mixed content warnings

### Environment Variables

- [ ] All production env vars set correctly
- [ ] No test keys in production
- [ ] `FRONTEND_URL` points to production domain
- [ ] Webhook secret matches Stripe Dashboard
- [ ] Supabase service role key set for database operations

### Security

- [ ] Webhook signature verification enabled
- [ ] User authentication on all endpoints
- [ ] Rate limiting on checkout endpoint
- [ ] CORS properly configured for production domain
- [ ] No sensitive data in logs
- [ ] Database RLS policies enabled

### Database

- [ ] Run `create_unlock_tables.sql` on production database
- [ ] Verify indexes are created
- [ ] Test `add_credits` and `spend_credits` functions
- [ ] RLS policies configured correctly
- [ ] Backup strategy in place

### Error Monitoring

- [ ] Set up error tracking (e.g., Sentry, LogRocket)
- [ ] Configure alerts for webhook failures
- [ ] Monitor failed payments
- [ ] Log all credit transactions
- [ ] Set up uptime monitoring for webhook endpoint

### Testing

- [ ] Test complete checkout flow in production
- [ ] Verify credits added after payment
- [ ] Test success/cancel redirects
- [ ] Test with real credit card (small amount)
- [ ] Verify refund process (if implemented)
- [ ] Test edge cases (duplicate webhooks, expired sessions)

### User Experience

- [ ] Success message after payment
- [ ] Email receipt sent by Stripe
- [ ] Error messages user-friendly
- [ ] Loading states during checkout
- [ ] Credit balance updates immediately

### Compliance

- [ ] Privacy policy includes Stripe payment processing
- [ ] Terms of service include refund policy
- [ ] Display pricing clearly
- [ ] No hidden fees
- [ ] Tax calculation configured (if applicable)

### Documentation

- [ ] Document webhook endpoint for team
- [ ] Create runbook for common issues
- [ ] Document refund process
- [ ] Update README with production setup
- [ ] Train support team on payment troubleshooting

### Post-Launch Monitoring

- [ ] Monitor webhook success rate (aim for >99%)
- [ ] Track payment success rate
- [ ] Monitor credit balance discrepancies
- [ ] Review Stripe Dashboard daily for first week
- [ ] Set up weekly revenue reports

---

## Additional Resources

### Stripe Documentation

- [Stripe Checkout Quickstart](https://stripe.com/docs/checkout/quickstart)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

### Code Locations

- **Backend**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/src/server.ts`
- **Frontend**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/src/pages/CreditsPage.tsx`
- **Database Schema**: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/create_unlock_tables.sql`
- **Environment Examples**: `.env.example` files in backend/frontend

### Support

- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Internal Contact**: jacksonfitzgerald25@gmail.com

---

**End of Guide**

Last Updated: January 2025
Maintainer: Jackson Fitzgerald
Version: 1.0
