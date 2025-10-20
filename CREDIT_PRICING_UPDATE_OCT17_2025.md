# Credit Pricing Restructure - October 17, 2025

## Summary
Completely restructured credit pricing to align with Premium unlock value, creating economic parity between buying credits and upgrading subscription tiers.

## Pricing Strategy

### Core Principle
**Premium unlock value = $27 per unlock (10 credits)**

This pricing is designed around the Team → Enterprise subscription gap:
- Team tier: $29.99/month (2 Premium unlocks)
- Enterprise tier: $299.99/month (12 Premium unlocks)
- **Difference: $270 for 10 additional Premium unlocks**

### Calculation
```
Enterprise ($299.99) - Team ($29.99) = $270
Premium unlocks: 12 - 2 = 10 unlocks
10 Premium × 10 credits/unlock = 100 credits
100 credits = $270 → $2.70 per credit
```

## New Credit Packages

### Before (Old Pricing)
| Package | Credits | Price | Price/Credit |
|---------|---------|-------|--------------|
| Starter Pack | 100 | $29.99 | $0.30 |
| Value Pack | 500 | $139.99 | $0.28 |
| Pro Pack | 1000 | $249.99 | $0.25 |

### After (New Pricing)
| Package | Credits | Price | Price/Credit | Premium Unlocks | Description |
|---------|---------|-------|--------------|-----------------|-------------|
| **Trial** | 10 | $30 | $3.00 | 1 unlock | Perfect for testing |
| **Starter** | 100 | $270 | $2.70 | 10 unlocks | Match Enterprise unlocks, bridge Team→Enterprise gap |
| **Popular** | 200 | $500 | $2.50 | 20 unlocks | Best value package (8% volume discount) |
| **Professional** | 500 | $1150 | $2.30 | 50 unlocks | High-volume recruiting (15% volume discount) |
| **Enterprise** | 1000 | $2100 | $2.10 | 100 unlocks | Maximum flexibility (22% volume discount) |

## Price Change Impact

### Percentage Increase
- **100 credits**: $29.99 → $270 = **801% increase**
- **500 credits**: $139.99 → $1150 = **721% increase**
- **1000 credits**: $249.99 → $2100 = **740% increase**

### Multiplier
- **Old pricing**: ~$0.25-0.30 per credit
- **New pricing**: ~$2.10-3.00 per credit
- **Increase**: ~**8-10× more expensive**

## Business Rationale

### 1. Subscription Value Protection
Previously, buying 100 credits for $30 gave you access to 10 Premium unlocks, making the Team subscription ($29.99) virtually worthless. The new pricing ensures:
- **100 credits now cost $270** (same as the Team→Enterprise upgrade difference)
- Makes upgrading to Enterprise economically equivalent to buying credits
- Protects subscription tier value proposition

### 2. Clear Value Ladder
| Tier | Monthly Cost | Premium Unlocks | Effective Cost per Premium Unlock |
|------|--------------|-----------------|-----------------------------------|
| **Trial** | $0 | 0 | N/A |
| **Team** | $29.99 | 2 | $15.00/unlock |
| **Enterprise** | $299.99 | 12 | $25.00/unlock |
| **Credits (100)** | $270 | 10 | $27.00/unlock |

This creates logical progression:
- **Team**: Best for occasional premium unlocks ($15/unlock effective rate)
- **Credits**: Fill the gap when you need more than Team but less than Enterprise ($27/unlock)
- **Enterprise**: Best value for high-volume premium access ($25/unlock) + unlimited Quality/Standard

### 3. Prevents Arbitrage
Old pricing allowed users to:
- Subscribe to Team ($29.99) to get 2 Premium unlocks
- Buy 100 credits ($30) for 10 more Premium unlocks
- **Total: $60 for 12 Premium unlocks** (vs Enterprise $299.99)

New pricing eliminates this arbitrage opportunity.

## Files Updated

### Frontend
1. **`/frontend/src/pages/CreditsPage.tsx`** (lines 45-120)
   - Updated `CREDIT_PACKAGES` array with new pricing
   - Added volume discount percentages to descriptions
   - Highlighted "Starter" package as matching Team→Enterprise gap

### Backend
2. **`/backend/src/config/pricing.ts`** (lines 29-37)
   - Updated `CREDIT_PACKAGES` array to match frontend
   - Added comments explaining pricing strategy
   - Maintains consistency with Stripe checkout

## Stripe Configuration Required

User must create new Stripe price IDs for all credit packages:
- **Trial**: 10 credits for $30
- **Starter**: 100 credits for $270
- **Popular**: 200 credits for $500
- **Professional**: 500 credits for $1150
- **Enterprise**: 1000 credits for $2100

These price IDs will be used in the checkout flow at `/api/credits/purchase` endpoint.

## Testing Checklist

- [ ] Frontend displays all 5 credit packages correctly
- [ ] Prices match backend configuration
- [ ] Stripe checkout sessions create correctly for each package
- [ ] Webhook properly credits account after purchase
- [ ] Transaction history logs correct dollar amounts
- [ ] Credit balance updates correctly
- [ ] Package descriptions and features display properly

## Migration Notes

### Existing Customers
- No immediate impact on existing credit balances
- New purchases will use new pricing
- Previous purchases honored at old rates (credits already purchased remain valid)

### Communication Strategy
Consider announcing the pricing change:
1. **Grandfathering**: Existing credit balances unaffected
2. **Value Proposition**: Emphasize subscription value (Team tier = $15/Premium unlock effective rate vs $27/credit rate)
3. **Clear Messaging**: Credits are meant as a flexible top-up, not primary purchasing method
4. **Enterprise Push**: Highlight that Enterprise subscription provides better value for volume users

## Economic Model

### Target Behavior
This pricing is designed to encourage:
1. **Trial → Team**: Start with subscription for best per-unlock value
2. **Team → Enterprise**: Upgrade when needing more Premium access
3. **Credits as buffer**: Use credits only when subscription unlocks exhausted or for one-off needs

### Revenue Impact
- **Higher per-credit revenue**: $2.10-3.00 per credit (vs $0.25-0.30)
- **Stronger subscription incentive**: Makes Team and Enterprise subscriptions more attractive
- **Volume discounts**: Encourages larger one-time purchases if users insist on pay-per-use

## Version History
- **v1.0**: Original pricing (~$0.30/credit)
- **v2.0 (Current)**: Premium-unlock-based pricing ($2.10-3.00/credit)

---

**Updated:** October 17, 2025
**Status:** ✅ Complete - Frontend and Backend Updated
**Next Step:** Create Stripe price IDs for new credit packages
**Breaking Changes:** None - only affects new credit purchases
