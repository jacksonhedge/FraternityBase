# 📊 FraternityBase Chapter Unlock System Overview

## 🎯 How Chapter Unlocks Work

### Unlock Types & Pricing

**1. Standard Chapter Unlock**
- **Cost:** 10 credits ($2.99 value)
- **Applies to:** Chapters with greek_rank > 5 or null
- **What's unlocked:** Full chapter contact information and data

**2. Five-Star Chapter Unlock**
- **Cost:** 30 credits ($9.99 value)
- **Applies to:** Top-tier chapters with greek_rank 1-5
- **What's unlocked:** Full chapter contact information and data for elite chapters

### Database Schema

**`chapter_unlocks` Table:**
```sql
- id (UUID)
- company_id (UUID) - Which company unlocked it
- chapter_id (UUID) - Which chapter was unlocked
- unlock_type (TEXT) - 'full' (only type currently)
- credits_spent (INTEGER) - Credits deducted
- amount_paid (DECIMAL) - Dollar value for analytics
- unlocked_at (TIMESTAMP)
- expires_at (TIMESTAMP) - Optional expiration
```

## 🔓 How Unlocking Works

### For Client A to Unlock a Chapter:

1. **User browses chapters** → Sees lock icon on chapters they don't own
2. **Clicks "Unlock Chapter"** button
3. **Backend checks:**
   - Is chapter already unlocked for this company? → Reject
   - Does chapter have greek_rank 1-5? → 30 credits, otherwise 10 credits
   - Does company have enough credits? → Check balance
4. **Deduct credits:**
   - Calls `deduct_credits()` PostgreSQL function
   - Deducts 10 or 30 credits from balance
   - Tracks dollar value for analytics
   - Creates transaction record
5. **Create unlock record:**
   - Insert into `chapter_unlocks` table
   - Records company_id, chapter_id, credits spent
6. **User gets access:**
   - Chapter now appears in "Unlocked Chapters"
   - Full contact info visible

### For Client B (Separate Company):

- **Client B's unlocks are completely separate**
- If Client A unlocks a chapter, Client B still sees it as locked
- Each company has their own unlock records in `chapter_unlocks`
- Same pricing applies: 10 credits for standard, 30 for 5-star

### Data Isolation:
```sql
-- Client A unlocks are filtered by their company_id
SELECT * FROM chapter_unlocks
WHERE company_id = 'client-a-uuid';

-- Client B sees only their own unlocks
SELECT * FROM chapter_unlocks
WHERE company_id = 'client-b-uuid';
```

## 📱 Sign-Up Flow & Free Unlock

### Current Sign-Up Process:

**What happens when someone signs up:**

1. **Creates user account** in Supabase Auth
2. **Creates company** record
3. **Creates user profile** linked to company
4. **Initializes account balance:**
   ```javascript
   balance_credits: 0  // Starts with 0 credits
   subscription_tier: 'trial'
   ```

### ⚠️ ISSUE: Free 5-Star Unlock Not Implemented

**What the signup page SAYS:**
- "Get started with 10 free chapter unlocks" (frontend message)

**What ACTUALLY happens:**
- Users start with **0 credits**
- No automatic free unlock is granted
- No automatic 5-star chapter is unlocked

**What SHOULD happen (not implemented yet):**
1. Grant initial credits on signup (e.g., 30 credits for one 5-star unlock)
2. OR automatically unlock one pre-selected 5-star chapter
3. OR let user choose their free 5-star chapter

## 📋 Admin Panel - Viewing Unlocks

### Companies Tab

**Unlock Information Displayed:**

1. **Companies Table View:**
   - Shows unlock count: `{company.unlocks?.length || 0}`
   - Click the number to see unlock details

2. **Unlock Details Popup:**
   ```javascript
   alert(`Unlocked Chapters:

   • University Name - Org Name (Chapter Name)
     unlock_type - X credits`)
   ```

3. **Company Detail View:**
   - Stats card showing: `Unlocks: {count}`
   - Full transaction history with unlock records

### Unlocks Data Structure:
```typescript
interface ChapterUnlock {
  id: string;
  company_id: string;
  chapter_id: string;
  unlock_type: string;
  credits_spent: number;
  amount_paid: number;
  unlocked_at: string;
  expires_at?: string;
  chapters: {
    chapter_name: string;
    greek_organizations: {
      name: string;
    };
    universities: {
      name: string;
    };
  };
}
```

### How Unlocks Are Fetched:

**Admin Companies Endpoint:**
```javascript
GET /api/admin/companies

// Returns each company with:
{
  ...company,
  unlocks: [
    {
      chapters: {
        universities: { name: "..." },
        greek_organizations: { name: "..." },
        chapter_name: "..."
      },
      unlock_type: "full",
      credits_spent: 30,
      unlocked_at: "2024-10-07..."
    }
  ]
}
```

## 🔍 Tracking Unlocks

### Who Unlocked What:

**Query unlock history:**
```sql
-- See all unlocks for a specific company
SELECT
  cu.*,
  c.chapter_name,
  go.name as org_name,
  u.name as university_name
FROM chapter_unlocks cu
JOIN chapters c ON cu.chapter_id = c.id
JOIN greek_organizations go ON c.greek_organization_id = go.id
JOIN universities u ON c.university_id = u.id
WHERE cu.company_id = 'company-uuid'
ORDER BY cu.unlocked_at DESC;
```

**Analytics available:**
- Total unlocks per company
- Most unlocked chapters
- 5-star vs standard unlock ratio
- Revenue from unlocks (tracked in `amount_paid`)

## 🚨 Current Issues to Fix

### 1. Free Signup Unlock Not Working
- **Problem:** Users start with 0 credits, can't unlock anything
- **Fix needed:** Grant 30 credits on signup OR auto-unlock one 5-star chapter
- **Location:** `SignUpPage.tsx` line 145 (account balance creation)

### 2. Misleading Signup Message
- **Problem:** Says "10 free chapter unlocks" but gives 0 credits
- **Fix needed:** Either:
  - Change message to match reality
  - OR implement the promised free unlocks

### 3. Chapter Unlocks Tab Empty
- **Problem:** Admin panel "Chapter Unlocks" tab shows "Coming soon"
- **Fix needed:** Build analytics view showing:
  - Most popular chapters
  - Unlock trends over time
  - Revenue breakdown by unlock type

## 📊 Recommended Fixes

### Fix 1: Implement Free Trial Unlock

**Update SignUpPage.tsx:**
```typescript
// After creating account balance
const { error: balanceError } = await supabase
  .from('account_balance')
  .insert({
    company_id: company.id,
    balance_credits: 30, // Changed from 0 to 30 for one free 5-star unlock
    balance_dollars: 0.00,
    subscription_tier: 'trial'
  });
```

### Fix 2: Auto-unlock One 5-Star Chapter

**Add after account creation:**
```typescript
// Find a popular 5-star chapter to unlock
const { data: freeChapter } = await supabase
  .from('chapters')
  .select('id')
  .lte('greek_rank', 5)
  .limit(1)
  .single();

// Auto-unlock it
if (freeChapter) {
  await supabase.rpc('deduct_credits', {
    p_company_id: company.id,
    p_credits: 30,
    p_dollars: 9.99,
    p_transaction_type: 'free_trial_unlock',
    p_description: 'Free 5-star chapter unlock',
    p_chapter_id: freeChapter.id
  });

  await supabase.from('chapter_unlocks').insert({
    company_id: company.id,
    chapter_id: freeChapter.id,
    unlock_type: 'full',
    credits_spent: 0, // Mark as free
    amount_paid: 0.00
  });
}
```

## 🎯 Summary

**Current State:**
- ✅ Unlock system works for paid unlocks
- ✅ 5-star chapters cost 30 credits, standard cost 10
- ✅ Each company has separate unlock records
- ✅ Admin can view all unlocks per company
- ❌ Free signup unlock not implemented
- ❌ Users start with 0 credits (can't unlock anything)

**To Make It Work:**
1. Grant 30 credits on signup (or auto-unlock one chapter)
2. Fix signup page messaging to match reality
3. Build Chapter Unlocks analytics tab in admin panel
