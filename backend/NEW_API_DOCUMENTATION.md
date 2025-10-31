# FraternityBase New API Documentation

## Business Model Overview

The platform has transitioned from a **credits-based** system to a **subscription + partnership request** model.

### New Pricing Tiers

| Tier | Monthly Price | Partnership Requests | Features |
|------|--------------|---------------------|----------|
| **Starter** | $29.99 | 5/month | Basic marketplace listing, Email support |
| **Growth** | $99.99 | 20/month | Enhanced visibility, Priority listing, Advanced analytics |
| **Enterprise** | $999.00 | Unlimited | Contracts, Analytics, Dedicated support, Custom integrations |

### Payment Flow

1. **Business pays subscription** → Gets monthly partnership request quota
2. **Business requests partnership** → Proposes compensation to chapter
3. **Chapter accepts** → Payment processed
4. **Platform fee** → 20% added on top (e.g., $1000 to chapter = $1200 total charged to business)
5. **Chapter receives** → 100% of proposed amount via Stripe Connect

---

## API Endpoints

### Subscriptions

#### GET `/api/subscriptions/tiers`
Get all available subscription tiers with pricing and features.

**Response:**
```json
{
  "success": true,
  "tiers": [
    {
      "id": "starter",
      "name": "Starter",
      "monthlyPrice": 29.99,
      "annualPrice": 359.88,
      "partnershipRequests": 5,
      "features": [...]
    },
    ...
  ]
}
```

---

#### GET `/api/subscriptions/status?companyId=<uuid>`
Get current subscription status and quota for a company.

**Query Parameters:**
- `companyId` (required): Company UUID

**Response:**
```json
{
  "success": true,
  "subscription": {
    "tier": "growth",
    "status": "active",
    "stripeSubscriptionId": "sub_xxxxx",
    "currentPeriodEnd": "2025-11-30T00:00:00.000Z",
    "monthlyPrice": 99.99,
    "partnershipRequests": 20
  },
  "quota": {
    "total": 20,
    "used": 5,
    "remaining": 15,
    "resetAt": "2025-11-01T00:00:00.000Z"
  }
}
```

---

#### POST `/api/subscriptions/subscribe`
Create a Stripe checkout session for a new subscription.

**Body:**
```json
{
  "tier": "growth",
  "period": "monthly",
  "companyId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/..."
}
```

---

#### POST `/api/subscriptions/change`
Change subscription tier (with proration).

**Body:**
```json
{
  "companyId": "uuid",
  "newTier": "enterprise"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "newTier": "enterprise",
  "quota": "unlimited"
}
```

---

#### POST `/api/subscriptions/cancel`
Cancel a subscription (remains active until period end).

**Body:**
```json
{
  "companyId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled. You can continue using your current tier until the end of the billing period."
}
```

---

#### POST `/api/subscriptions/webhook`
Stripe webhook handler for subscription events.

**Events Handled:**
- `checkout.session.completed` - New subscription created
- `customer.subscription.updated` - Subscription tier/status changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Monthly renewal (resets partnership requests)
- `invoice.payment_failed` - Payment failed (mark past_due)

---

### Partnership Requests

#### POST `/api/partnerships/request`
Submit a partnership request to a chapter.

**Body:**
```json
{
  "companyId": "uuid",
  "chapterId": "uuid",
  "message": "We'd love to partner with your chapter for...",
  "proposedCompensation": 1000.00
}
```

**Response:**
```json
{
  "success": true,
  "request": {
    "id": "uuid",
    "status": "pending",
    "compensation": 1000.00,
    "platformFee": 200.00,
    "total": 1200.00,
    "chapter": {
      "name": "Alpha Beta at State University",
      "university": "State University"
    }
  },
  "message": "Partnership request submitted successfully. The chapter will be notified."
}
```

**Errors:**
- `403`: Quota exceeded (need to upgrade or wait until next month)
- `400`: Minimum compensation is $100.00

---

#### GET `/api/partnerships/requests?companyId=<uuid>`
Get all partnership requests for a company.

**Query Parameters:**
- `companyId` (required): Company UUID

**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "chapter_id": "uuid",
      "message": "...",
      "proposed_compensation": 1000.00,
      "platform_fee": 200.00,
      "total_amount": 1200.00,
      "status": "pending",
      "payment_status": "pending",
      "created_at": "2025-10-31T00:00:00.000Z",
      "chapters": {
        "chapter_name": "Alpha Beta",
        "universities": { "name": "State University" },
        "greek_organizations": { "name": "Alpha Beta Gamma" }
      }
    }
  ]
}
```

---

#### GET `/api/partnerships/requests/:id`
Get a single partnership request by ID.

**Response:**
```json
{
  "success": true,
  "request": {
    "id": "uuid",
    "company_id": "uuid",
    "chapter_id": "uuid",
    "message": "...",
    "proposed_compensation": 1000.00,
    "platform_fee": 200.00,
    "total_amount": 1200.00,
    "status": "pending",
    "payment_status": "pending",
    "created_at": "2025-10-31T00:00:00.000Z",
    "chapters": { ... },
    "companies": { ... }
  }
}
```

---

#### GET `/api/partnerships/quota?companyId=<uuid>`
Get partnership request quota for a company.

**Response:**
```json
{
  "success": true,
  "quota": {
    "total": 20,
    "used": 5,
    "remaining": 15,
    "resetAt": "2025-11-01T00:00:00.000Z",
    "tier": "growth"
  }
}
```

For Enterprise tier:
```json
{
  "success": true,
  "quota": {
    "total": "unlimited",
    "used": 47,
    "remaining": "unlimited",
    "resetAt": "2025-11-01T00:00:00.000Z",
    "tier": "enterprise"
  }
}
```

---

#### PATCH `/api/partnerships/requests/:id/cancel`
Cancel a pending partnership request (refunds quota).

**Body:**
```json
{
  "companyId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "request": { ... },
  "message": "Partnership request cancelled successfully"
}
```

**Errors:**
- `403`: Unauthorized (not your request)
- `400`: Can only cancel pending requests

---

### Admin Endpoints

#### GET `/api/partnerships/admin/all`
Get all partnership requests (admin only).

**Headers:**
- `x-admin-token`: Admin token (from env)

**Response:**
```json
{
  "success": true,
  "requests": [ ... ]
}
```

---

#### PATCH `/api/partnerships/admin/:id/status`
Update partnership request status (admin only).

**Headers:**
- `x-admin-token`: Admin token

**Body:**
```json
{
  "status": "accepted",
  "paymentStatus": "paid"
}
```

**Valid Statuses:**
- `status`: pending, accepted, rejected, completed, cancelled
- `paymentStatus`: pending, processing, paid, failed

---

## Database Schema

### `partnership_requests` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| company_id | UUID | Business making request |
| chapter_id | UUID | Chapter receiving request |
| message | TEXT | Request message |
| proposed_compensation | NUMERIC | Amount chapter receives |
| platform_fee | NUMERIC | 20% fee |
| total_amount | NUMERIC | Total charged to business |
| status | VARCHAR | pending, accepted, rejected, completed, cancelled |
| payment_status | VARCHAR | pending, processing, paid, failed |
| stripe_payment_intent_id | VARCHAR | Stripe payment ID |
| created_at | TIMESTAMP | Request created |
| accepted_at | TIMESTAMP | When accepted |
| completed_at | TIMESTAMP | When completed |
| paid_at | TIMESTAMP | When payment succeeded |
| chapter_response | TEXT | Chapter's response |

### `chapter_payment_methods` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| chapter_id | UUID | Chapter |
| stripe_account_id | VARCHAR | Stripe Connect account |
| stripe_account_status | VARCHAR | pending, verified, restricted |
| payment_method_type | VARCHAR | stripe_connect, bank_transfer |
| last_4_digits | VARCHAR(4) | Bank account last 4 |
| bank_name | VARCHAR | Bank name |
| created_at | TIMESTAMP | Created |
| updated_at | TIMESTAMP | Updated |
| verified_at | TIMESTAMP | Verified |

### `account_balance` Table (New Columns)

| Column | Type | Description |
|--------|------|-------------|
| partnership_requests_quota | INTEGER | Monthly quota |
| partnership_requests_used | INTEGER | Used this month |
| partnership_requests_reset_at | TIMESTAMP | Last reset |
| subscription_tier | VARCHAR | starter, growth, enterprise |

---

## Migration Notes

### What Was Removed:
- ❌ Credits system (`balance_credits`, `lifetime_spent_credits`, etc.)
- ❌ Chapter unlocks (`chapter_unlocks` table, unlock quotas)
- ❌ Credit packages and purchases
- ❌ Tiered unlock system (5-star, 4-star, 3-star, diamond)

### What Was Added:
- ✅ Subscription tiers ($29.99, $99.99, $999)
- ✅ Partnership request quota system
- ✅ Partnership requests table
- ✅ Chapter payment methods (Stripe Connect)
- ✅ 20% platform fee on partnerships

### Database Functions:
- `can_submit_partnership_request(company_id)` - Check if company can submit request
- `increment_partnership_request_usage(company_id)` - Increment usage counter
- `reset_monthly_partnership_requests()` - Reset all quotas (run monthly)
- `calculate_platform_fee(compensation)` - Calculate 20% fee

---

## Testing

### Test Subscription Flow:
```bash
# Get available tiers
curl http://localhost:3001/api/subscriptions/tiers

# Create subscription checkout
curl -X POST http://localhost:3001/api/subscriptions/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "growth",
    "period": "monthly",
    "companyId": "your-uuid"
  }'

# Check subscription status
curl "http://localhost:3001/api/subscriptions/status?companyId=your-uuid"
```

### Test Partnership Request:
```bash
# Submit partnership request
curl -X POST http://localhost:3001/api/partnerships/request \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "your-uuid",
    "chapterId": "chapter-uuid",
    "message": "We would love to partner!",
    "proposedCompensation": 1000.00
  }'

# Check quota
curl "http://localhost:3001/api/partnerships/quota?companyId=your-uuid"

# Get requests
curl "http://localhost:3001/api/partnerships/requests?companyId=your-uuid"
```

---

## Next Steps

1. **Stripe Connect Setup**: Implement chapter onboarding for Stripe Connect accounts
2. **Payment Processing**: Handle partnership payment flows
3. **Frontend Updates**: Update UI to reflect new subscription/partnership model
4. **Email Notifications**: Notify chapters of partnership requests
5. **Admin Panel**: Add partnership request management UI

---

## Environment Variables

Add to `.env`:
```
# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxxxxxxx
STRIPE_PRICE_STARTER_ANNUAL=price_xxxxxxxxxx
STRIPE_PRICE_GROWTH_MONTHLY=price_xxxxxxxxxx
STRIPE_PRICE_GROWTH_ANNUAL=price_xxxxxxxxxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxxxxxxx
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_xxxxxxxxxx

# Existing
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```
