# 🎯 FraternityBase Subscription Tier Structure

## Final Configuration (Updated: October 2025)

### 💳 Monthly Tier - $29/month
**Unlock Allowances (per month):**
- ⭐⭐⭐⭐⭐ **5× 5.0-star chapters** (Premium chapters)
- ⭐⭐⭐⭐ **5× 4.0-4.9-star chapters** (High-quality chapters)
- ⭐⭐⭐ **0× 3.0-3.9-star chapters** (Must use credits)
- 🤝 **1× Warm Introduction** (first 3 months only)

**Target Market:** Individual recruiters, small companies
**Value Proposition:** Access to top-tier chapters without per-unlock fees

---

### 🏆 Annual/Premium Tier - $299/year
**Unlock Allowances (per month):**
- ⭐⭐⭐⭐⭐ **12× 5.0-star chapters** (2.4× more than monthly)
- ⭐⭐⭐⭐ **12× 4.0-4.9-star chapters** (2.4× more than monthly)
- ⭐⭐⭐ **50× 3.0-3.9-star chapters** (exclusive to this tier)
- 🤝 **3× Warm Introductions** (all year)

**Target Market:** Growing companies, high-volume recruiters
**Value Proposition:** Massive volume at scale + access to good 3-star chapters

**Annual Totals:**
- 144× 5-star unlocks/year
- 144× 4-star unlocks/year
- 600× 3-star unlocks/year
- 36 warm intros/year

---

### 🚀 Enterprise Tier - Custom Pricing
**Unlock Allowances:**
- ⭐⭐⭐⭐⭐ **Unlimited 5.0-star chapters**
- ⭐⭐⭐⭐ **Unlimited 4.0-4.9-star chapters**
- ⭐⭐⭐ **Unlimited 3.0-3.9-star chapters**
- 🤝 **Unlimited Warm Introductions**

**Target Market:** Large enterprises, staffing firms
**Value Proposition:** No limits, full access to entire network

---

## 💰 Pricing Structure by Chapter Rating

### For Users WITHOUT Subscription (Pay-per-unlock):
| Rating Range | Cost | Dollar Value | Market Tier |
|--------------|------|--------------|-------------|
| 5.0⭐ | 10 credits | $9.90 | Premium |
| 4.0-4.9⭐ | 5 credits | $4.95 | Mid-tier |
| 3.0-3.9⭐ | 3 credits | $2.97 | Budget |
| Below 3.0⭐ | 1 credit | $0.99 | Impulse |

### For Subscription Users:
- Use subscription unlocks FIRST (free)
- When exhausted, fall back to credits (pay-per-unlock)
- Clear visual distinction in UI (purple badge vs gray badge)

---

## 🎁 Subscription Unlock Priority (Backend Logic)

When a user unlocks a chapter, the system checks in this order:

1. **Check chapter rating** (from `chapters.grade` field)
2. **Determine tier**: 5.0 vs 4.0-4.9 vs 3.0-3.9 vs <3.0
3. **Check subscription allowance** for that tier
4. **If allowance available** → Use subscription unlock (amount_paid: 0)
5. **If exhausted** → Deduct credits (amount_paid: actual cost)

### Code Reference
**File:** `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/src/server.ts`
**Lines:** 1187-1220

```typescript
if (rank >= 5.0) {
  // Use unlocks_5_star_remaining
} else if (rank >= 4.0 && rank < 5.0) {
  // Use unlocks_4_star_remaining
} else if (rank >= 3.0 && rank < 4.0) {
  // Use unlocks_3_star_remaining
} else {
  // Must use credits (no subscription unlocks for <3.0)
}
```

---

## 📊 Database Configuration

### Trigger Function
**Location:** Supabase FraternityBase project
**Function:** `set_subscription_unlocks()`
**Trigger:** Runs on INSERT or UPDATE of `subscription_tier` in `account_balance` table

### Automatic Allocation
When a company's subscription tier is set or changed, the trigger automatically sets:

```sql
-- Monthly tier
unlocks_5_star_remaining = 5
unlocks_4_star_remaining = 5
unlocks_3_star_remaining = 0
warm_intros_remaining = 1

-- Annual tier
unlocks_5_star_remaining = 12
unlocks_4_star_remaining = 12
unlocks_3_star_remaining = 50
warm_intros_remaining = 3

-- Enterprise tier
unlocks_5_star_remaining = -1  (unlimited)
unlocks_4_star_remaining = -1  (unlimited)
unlocks_3_star_remaining = -1  (unlimited)
warm_intros_remaining = -1     (unlimited)
```

---

## 🔄 Monthly Renewal Logic

**Current Implementation:** Manual reset via SQL or admin panel
**Future Enhancement:** Automatic monthly renewal via cron job

### Manual Reset Query
```sql
-- Reset monthly tier unlocks
UPDATE account_balance
SET
  unlocks_5_star_remaining = 5,
  unlocks_4_star_remaining = 5,
  unlocks_3_star_remaining = 0,
  warm_intros_remaining = 1
WHERE subscription_tier = 'monthly'
  AND subscription_period_end < NOW();

-- Reset annual tier unlocks
UPDATE account_balance
SET
  unlocks_5_star_remaining = 12,
  unlocks_4_star_remaining = 12,
  unlocks_3_star_remaining = 50,
  warm_intros_remaining = 3
WHERE subscription_tier = 'annual'
  AND subscription_period_end < NOW();
```

---

## 🎨 UI/UX Display

### Unlock Modal (User-facing)
**When subscription unlocks available:**
- Purple gradient background
- "✨ Using Subscription Unlock" header
- Shows remaining count: "You have X Premium unlocks remaining"
- Cost: $0.00
- Original cost shown with strikethrough

**When subscription exhausted:**
- Gray/blue background
- "💳 Pay with Credits" header
- Shows credit cost and balance
- Dollar value displayed

### Admin Panel (Admin-facing)
**Subscription unlocks in history:**
- Purple badge: "✨ Subscription Unlock"
- Star rating displayed (5.0⭐, 4.5⭐, etc.)
- Cost: $0.00

**Credit unlocks in history:**
- Gray badge: "💳 Credits"
- Credit amount (e.g., "10 credits")
- Dollar value (e.g., "$9.90")

### Company Details Modal
Shows current allowances:
```
Subscription Unlocks:
  5⭐: 4/5 remaining
  4⭐: 5/5 remaining
  3⭐: 0/0 remaining
```

---

## 📝 Testing Scenarios

### Scenario 1: Monthly User Unlocks 5-star Chapter
1. User clicks unlock on 5.0⭐ chapter
2. Backend checks: `unlocks_5_star_remaining = 5`
3. Uses subscription unlock (free)
4. Decrements: `unlocks_5_star_remaining = 4`
5. Credits unchanged
6. Database stores: `amount_paid: 0`
7. Admin sees: Purple "✨ Subscription Unlock" badge

### Scenario 2: Monthly User Exhausts 5-star Unlocks
1. User unlocks 5 different 5.0⭐ chapters (uses all 5 unlocks)
2. `unlocks_5_star_remaining = 0`
3. User tries to unlock 6th 5.0⭐ chapter
4. Backend checks: `unlocks_5_star_remaining = 0` (exhausted)
5. Falls back to credits: deducts 10 credits
6. Database stores: `amount_paid: 10`
7. Admin sees: Gray "💳 Credits" badge with "10 credits ($9.90)"

### Scenario 3: Monthly User Tries 3-star Chapter
1. User clicks unlock on 3.5⭐ chapter
2. Backend checks: `unlocks_3_star_remaining = 0` (monthly tier has none)
3. Immediately falls back to credits: deducts 3 credits
4. Database stores: `amount_paid: 3`
5. Admin sees: Gray "💳 Credits" badge

### Scenario 4: Annual User Has Full Access
1. Annual user unlocks 3.5⭐ chapter
2. Backend checks: `unlocks_3_star_remaining = 50`
3. Uses subscription unlock (free)
4. Decrements: `unlocks_3_star_remaining = 49`
5. Credits unchanged
6. Database stores: `amount_paid: 0`
7. Admin sees: Purple "✨ Subscription Unlock" badge

---

## 🚨 Important Notes

### Critical Bug Fixes (October 2025)
1. **Fixed `amount_paid` bug** - Now correctly stores 0 for subscription unlocks
2. **Fixed chapter rank calculation** - Now uses `chapters.grade` instead of `five_star_rating`
3. **Removed 3-star unlocks from monthly tier** - Changed from 10 to 0
4. **Added admin panel visual distinction** - Purple vs gray badges

### Production Checklist
- [x] Database trigger configured
- [x] Backend unlock logic updated
- [x] Admin panel badges working
- [x] Monthly tier: 5/5/0 allocation
- [x] Annual tier: 12/12/50 allocation
- [ ] Monthly renewal cron job (future)
- [ ] Subscription upgrade/downgrade flow (future)
- [ ] Billing integration (future)

### Files Modified
1. `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/src/server.ts` (lines 1056, 1311-1328, 1187-1220)
2. `/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/src/pages/AdminPageV4.tsx` (lines 2611-2637)
3. Supabase trigger function: `set_subscription_unlocks()`

---

## 💡 Business Logic Summary

**Monthly Tier Strategy:**
- Focus on quality over quantity
- Only top-tier chapters included
- Forces credit purchases for volume recruiting
- Lower barrier to entry ($29)

**Annual Tier Strategy:**
- Volume recruiting enabled
- 50× 3-star unlocks = high-volume recruiting
- Better value per unlock
- Encourages annual commitment

**Enterprise Strategy:**
- No limits
- Custom pricing based on company size
- White-glove service
- API access (future)

---

## 🔧 Admin Tools

### Quick SQL Commands

**Check subscription status:**
```sql
SELECT
  subscription_tier,
  unlocks_5_star_remaining,
  unlocks_4_star_remaining,
  unlocks_3_star_remaining,
  warm_intros_remaining
FROM account_balance
WHERE company_id = 'company-uuid-here';
```

**Manually grant extra unlocks:**
```sql
UPDATE account_balance
SET unlocks_5_star_remaining = unlocks_5_star_remaining + 5
WHERE company_id = 'company-uuid-here';
```

**Upgrade to annual tier:**
```sql
UPDATE account_balance
SET subscription_tier = 'annual'
WHERE company_id = 'company-uuid-here';
-- Trigger will automatically set 12/12/50/3
```

**View unlock history:**
```sql
SELECT
  cu.unlocked_at,
  cu.amount_paid,
  c.chapter_name,
  c.grade,
  bt.transaction_type
FROM chapter_unlocks cu
JOIN chapters c ON cu.chapter_id = c.id
LEFT JOIN balance_transactions bt ON cu.transaction_id = bt.id
WHERE cu.company_id = 'company-uuid-here'
ORDER BY cu.unlocked_at DESC
LIMIT 20;
```

---

**Last Updated:** October 16, 2025
**Status:** ✅ Production Ready
**Version:** 2.0
