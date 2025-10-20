# 🎯 FraternityBase Subscription Tier Structure

## Final Configuration (Updated: October 2025)

### 💳 Monthly/Team Tier - $29/month
**Unlock Allowances (per month):**
- ⭐⭐⭐⭐⭐ **2× 5.0-star chapters** (Premium chapters)
- ⭐⭐⭐⭐ **8× 4.0-4.9-star chapters** (Quality chapters)
- ⭐⭐⭐ **10× 3.0-3.9-star chapters** (Standard chapters)
- 🤝 **1× Warm Introduction** (first 3 months only)
- 👥 **3 Team seats**

**Target Market:** Individual recruiters, small companies
**Value Proposition:** Balanced access with focus on quality chapters

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

### 🚀 Enterprise Tier - $299.99/month
**Unlock Allowances:**
- ⭐⭐⭐⭐⭐ **12× 5.0-star chapters per month** (Premium chapters)
- ⭐⭐⭐⭐ **Unlimited 4.0-4.9-star chapters** (Quality chapters)
- ⭐⭐⭐ **Unlimited 3.0-3.9-star chapters** (Standard chapters)
- 🤝 **3× Warm Introductions per month**
- 💰 **1000 monthly credits included**
- 👥 **10 Team seats**

**Target Market:** Large enterprises, staffing firms, high-volume recruiters
**Value Proposition:** Unlimited quality and standard unlocks + substantial premium allowance

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
-- Monthly/Team tier
unlocks_5_star_remaining = 2
unlocks_4_star_remaining = 8
unlocks_3_star_remaining = 10
warm_intros_remaining = 1
max_team_seats = 3

-- Enterprise tier
unlocks_5_star_remaining = 12
unlocks_4_star_remaining = -1  (unlimited)
unlocks_3_star_remaining = -1  (unlimited)
warm_intros_remaining = 3
max_team_seats = 10
```

---

## 🔄 Monthly Renewal Logic

**Current Implementation:** Manual reset via SQL or admin panel
**Future Enhancement:** Automatic monthly renewal via cron job

### Manual Reset Query
```sql
-- Reset monthly/team tier unlocks
UPDATE account_balance
SET
  unlocks_5_star_remaining = 2,
  unlocks_4_star_remaining = 8,
  unlocks_3_star_remaining = 10,
  warm_intros_remaining = 1
WHERE subscription_tier = 'monthly'
  AND subscription_period_end < NOW();

-- Reset enterprise tier unlocks
UPDATE account_balance
SET
  unlocks_5_star_remaining = 12,
  unlocks_4_star_remaining = -1,
  unlocks_3_star_remaining = -1,
  warm_intros_remaining = 3
WHERE subscription_tier = 'enterprise'
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

### Scenario 1: Team User Unlocks 5-star Chapter
1. User clicks unlock on 5.0⭐ chapter
2. Backend checks: `unlocks_5_star_remaining = 2`
3. Uses subscription unlock (free)
4. Decrements: `unlocks_5_star_remaining = 1`
5. Credits unchanged
6. Database stores: `amount_paid: 0`
7. Admin sees: Purple "✨ Subscription Unlock" badge

### Scenario 2: Team User Exhausts 5-star Unlocks
1. User unlocks 2 different 5.0⭐ chapters (uses all 2 unlocks)
2. `unlocks_5_star_remaining = 0`
3. User tries to unlock 3rd 5.0⭐ chapter
4. Backend checks: `unlocks_5_star_remaining = 0` (exhausted)
5. Falls back to credits: deducts 10 credits
6. Database stores: `amount_paid: 10`
7. Admin sees: Gray "💳 Credits" badge with "10 credits ($9.90)"

### Scenario 3: Team User Uses 3-star Chapter
1. User clicks unlock on 3.5⭐ chapter
2. Backend checks: `unlocks_3_star_remaining = 10`
3. Uses subscription unlock (free)
4. Decrements: `unlocks_3_star_remaining = 9`
5. Credits unchanged
6. Database stores: `amount_paid: 0`
7. Admin sees: Purple "✨ Subscription Unlock" badge

### Scenario 4: Enterprise User Unlocks Premium Chapter
1. Enterprise user unlocks 5.0⭐ chapter
2. Backend checks: `unlocks_5_star_remaining = 12`
3. Uses subscription unlock (free)
4. Decrements: `unlocks_5_star_remaining = 11`
5. Credits unchanged
6. Database stores: `amount_paid: 0`
7. Admin sees: Purple "✨ Subscription Unlock" badge

### Scenario 5: Enterprise User Unlocks Quality/Standard Chapters
1. Enterprise user unlocks 4.5⭐ chapter
2. Backend checks: `unlocks_4_star_remaining = -1` (unlimited)
3. Uses subscription unlock (free)
4. Remaining stays at -1 (unlimited)
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

**Team Tier Strategy:**
- Balanced approach with 20 total monthly unlocks (2+8+10)
- Emphasis on quality chapters (8 Quality unlocks)
- Includes standard chapters for volume recruiting
- Lower barrier to entry ($29/month)
- 3 team seats for collaboration

**Enterprise Strategy:**
- 12 premium unlocks per month for top-tier chapters
- Unlimited quality and standard chapters
- 1000 monthly credits included for flexibility
- 10 team seats for large teams
- 3 warm introductions per month
- Premium support and early access features
- Fixed pricing at $299.99/month

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

**Last Updated:** October 17, 2025
**Status:** ✅ Production Ready
**Version:** 3.0 - Updated unlock allocations (Team: 2/8/10, Enterprise: 12/unlimited/unlimited)
