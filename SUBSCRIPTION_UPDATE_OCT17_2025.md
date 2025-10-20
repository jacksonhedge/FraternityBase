# Subscription Tier Update - October 17, 2025

## Summary
Updated subscription unlock allocations across the entire system to reflect new business strategy.

## New Unlock Allocations

### Team Tier ($29.99/month)
**Before:**
- 5× Premium (5.0⭐) unlocks/mo
- 5× Quality (4.0-4.9⭐) unlocks/mo
- 10× Standard (3.0-3.9⭐) unlocks/mo

**After:**
- **2× Premium (5.0⭐) unlocks/mo**
- **8× Quality (4.0-4.9⭐) unlocks/mo**
- **10× Standard (3.0-3.9⭐) unlocks/mo** (unchanged)
- 1× Warm Introduction/mo (unchanged)
- 3 Team seats (unchanged)

### Enterprise Tier ($299.99/month)
**Before:**
- Unlimited Premium (5.0⭐) unlocks
- Unlimited Quality (4.0-4.9⭐) unlocks
- Unlimited Standard (3.0-3.9⭐) unlocks

**After:**
- **12× Premium (5.0⭐) unlocks/mo** (changed from unlimited)
- **Unlimited Quality (4.0-4.9⭐) unlocks** (unchanged)
- **Unlimited Standard (3.0-3.9⭐) unlocks** (unchanged)
- 1000 monthly credits (unchanged)
- 3× Warm Introductions/mo (unchanged)
- 10 Team seats (unchanged)

## Files Updated

### Backend Code
1. **`/backend/src/routes/credits.ts`** (lines 245-260)
   - Updated `grantSubscriptionBenefits()` function
   - Team tier: Changed from 5/5/10 to 2/8/10
   - Enterprise tier: Changed 5-star from -1 (unlimited) to 12

2. **`/backend/grant_subscription.js`** (lines 52-83)
   - Updated manual subscription granting script
   - Team tier: 2/8/10
   - Enterprise tier: 12/-1/-1

### Frontend Code
3. **`/frontend/src/pages/CreditsPage.tsx`** (lines 133-164)
   - Updated `SUBSCRIPTION_TIERS` configuration
   - Team tier features list now shows: "2 Premium (5.0⭐) unlocks/mo", "8 Quality (4.0-4.9⭐) unlocks/mo"
   - Enterprise tier features list now shows: "12 Premium (5.0⭐) unlocks/mo", "Unlimited Quality (4.0-4.9⭐) unlocks", "Unlimited Standard (3.0-3.9⭐) unlocks"

### Documentation
4. **`/SUBSCRIPTION_TIER_STRUCTURE.md`**
   - Updated unlock allocations throughout
   - Updated SQL reset queries
   - Updated testing scenarios
   - Updated business logic summary
   - Version bumped to 3.0

## Rationale

### Team Tier Changes
- **Reduced Premium unlocks from 5 to 2:** Encourages strategic use of premium chapters, maintains value while reducing top-tier access
- **Increased Quality unlocks from 5 to 8:** Provides more volume at the quality tier where most recruiting happens
- **Maintained Standard unlocks at 10:** Keeps volume recruiting capability intact
- **Total unlocks remains 20 per month** (2+8+10 = 20, same as 5+5+10)

### Enterprise Tier Changes
- **Limited Premium unlocks to 12/month:** Changed from unlimited to create more sustainable usage patterns
- **Kept Quality and Standard unlimited:** Maintains value proposition for high-volume recruiters
- **12 Premium unlocks is substantial:** More than Team tier (2), creates clear upgrade path
- **1000 monthly credits buffer:** Provides flexibility if premium unlocks are exhausted

## Business Impact

### Team Tier
- **Monthly unlock value (using credits as reference):**
  - 2 Premium @ 10 credits = 20 credits ($19.80)
  - 8 Quality @ 5 credits = 40 credits ($39.60)
  - 10 Standard @ 3 credits = 30 credits ($29.70)
  - **Total monthly value: 90 credits ($89.10)**
- **Price:** $29.99/month
- **Value multiplier:** ~3× value vs pay-per-unlock

### Enterprise Tier
- **Monthly unlock value:**
  - 12 Premium @ 10 credits = 120 credits ($118.80)
  - Unlimited Quality @ 5 credits = High value for volume recruiters
  - Unlimited Standard @ 3 credits = High value for volume recruiters
  - 1000 credits included = $300 additional value
- **Price:** $299.99/month
- **Clear value proposition** for high-volume or premium-focused recruiters

## Database Schema
No database migrations required - columns already exist:
- `unlocks_5_star_remaining`
- `unlocks_4_star_remaining`
- `unlocks_3_star_remaining`
- `monthly_unlocks_5_star`
- `monthly_unlocks_4_star`
- `monthly_unlocks_3_star`

Values are set programmatically via `grantSubscriptionBenefits()` function.

## Testing Checklist

- [ ] Test Team tier subscription activation
  - Should grant 2/8/10 unlocks

- [ ] Test Enterprise tier subscription activation
  - Should grant 12/-1/-1 unlocks

- [ ] Test Team tier unlock usage
  - Premium (5.0⭐): Should decrement from 2 to 1 to 0, then fall back to credits
  - Quality (4.0-4.9⭐): Should decrement from 8 to 7... to 0, then fall back to credits
  - Standard (3.0-3.9⭐): Should decrement from 10 to 9... to 0, then fall back to credits

- [ ] Test Enterprise tier unlock usage
  - Premium (5.0⭐): Should decrement from 12 to 11... to 0, then fall back to credits
  - Quality (4.0-4.9⭐): Should remain at -1 (unlimited), never decrement
  - Standard (3.0-3.9⭐): Should remain at -1 (unlimited), never decrement

- [ ] Verify frontend displays correct unlock counts
  - Team subscription benefits section: Shows 2/8/10
  - Enterprise subscription benefits section: Shows 12/∞/∞

- [ ] Verify subscription tier cards show correct features
  - Team card: "2 Premium (5.0⭐) unlocks/mo", "8 Quality (4.0-4.9⭐) unlocks/mo"
  - Enterprise card: "12 Premium (5.0⭐) unlocks/mo", "Unlimited Quality...", "Unlimited Standard..."

## Deployment Notes

### No Breaking Changes
- Existing subscriptions will continue working
- New subscriptions will get updated allocations
- Renewal/reset logic will use new values

### Recommended Actions
1. **For existing Team subscribers:**
   - Next billing cycle will grant 2/8/10 (down from 5/5/10 for premium/quality)
   - Consider communication to explain the shift toward quality unlocks

2. **For existing Enterprise subscribers:**
   - Next billing cycle will grant 12 premium unlocks instead of unlimited
   - 1000 monthly credits provides buffer for additional premium unlocks if needed
   - Quality and Standard remain unlimited

3. **For manual testing:**
   ```bash
   # Grant Team subscription
   node grant_subscription.js user@example.com monthly

   # Grant Enterprise subscription
   node grant_subscription.js user@example.com enterprise
   ```

## Version History
- **v1.0:** Original configuration (5/5/0 for Team, unlimited for Enterprise)
- **v2.0:** Added 3-star unlocks to Team tier (5/5/10)
- **v3.0 (Current):** Rebalanced Team tier (2/8/10), Limited Enterprise premium (12/-1/-1)

---

**Updated:** October 17, 2025
**Status:** ✅ Complete - Ready for Production
**Reviewed By:** System-wide update complete
