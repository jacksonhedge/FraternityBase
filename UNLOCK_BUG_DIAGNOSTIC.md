# 🔍 UNLOCK BUG DIAGNOSTIC GUIDE

**Date:** October 16, 2025  
**Issue:** Subscription unlock logic not working, balance showing as 0

---

## 🎯 What I Added

I've added **comprehensive console logging** to help diagnose the issue. The logs will show:

1. ✅ What the API returns when fetching balance/unlocks
2. ✅ What values are being set in state
3. ✅ What grade the chapter has
4. ✅ What unlock tier is being checked
5. ✅ What props are being passed to the modal

---

## 📋 Steps to Diagnose

### 1. **Refresh the Page**
- Go to `/app/chapters`
- **Open browser console** (F12 or Cmd+Option+I)
- Clear the console (Cmd+K or Ctrl+L)

### 2. **Look for Balance Fetch Logs**

You should see logs like this when the page loads:

```
💰 Fetching balance from: http://localhost:3001/api/credits/balance
💰 Raw API response: { ... }
💰 Balance fields: { data.balance: ..., data.balanceCredits: ..., data.credits: ... }
💰 Unlocks data: { data.unlocks: ..., data.subscriptionUnlocks: ..., ... }
💰 Setting balance to: 700
💰 Setting unlocks to: { fiveStar: {...}, fourStar: {...}, threeStar: {...} }
✅ Balance fetch complete: { balance: 700, unlocks: {...} }
```

**⚠️ Key Questions:**
- Does the `Raw API response` contain the balance and unlocks?
- What fields contain the data? (`balance`, `balanceCredits`, `credits`?)
- What does the `unlocks` object look like?

### 3. **Click "Unlock" on a 5.0⭐ Chapter**

Find a chapter with **exactly 5.0⭐ rating** and click the "Click to unlock" button.

You should see logs like:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 MODAL RENDER - Chapter Selected: Rutgers University–Camden Chapter
🎯 Grade: 5 (type: number)
🎯 Current balance state: 700
🎯 Current unlocks state: { fiveStar: {...}, fourStar: {...}, threeStar: {...} }
🎯 Modal open: true
✅ Unlocks object exists, checking tier...
⭐ This is a 5.0 star chapter
⭐ unlocks.fiveStar: { remaining: 9, monthly: 10, isUnlimited: false }
⭐ Extracted values: { subscriptionUnlocksRemaining: 9, isUnlimitedUnlocks: false }
🔍 Calculation: isUnlimitedUnlocks = false || subscriptionUnlocksRemaining = 9 > 0
✅ willUseSubscriptionUnlock: true
📤 Props being passed to UnlockConfirmationModal: {
  balance: 700,
  subscriptionUnlocksRemaining: 9,
  isUnlimitedUnlocks: false,
  willUseSubscriptionUnlock: true,
  ...
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**⚠️ Key Checks:**

#### A. **Balance State**
- ✅ `Current balance state:` should be **700**, NOT 0
- ❌ If it's 0, the API fetch failed to set state correctly

#### B. **Unlocks State**
- ✅ `Current unlocks state:` should be an **object** with `fiveStar`, `fourStar`, `threeStar`
- ❌ If it's `null` or `undefined`, the API didn't return unlocks data

#### C. **Grade Type**
- ✅ `Grade:` should be a **number** (either `5` or `5.0`)
- ⚠️ If it's `5 (type: number)`, the tier check `grade >= 5.0` should work

#### D. **Tier Detection**
- ✅ For a 5.0⭐ chapter, you should see: `⭐ This is a 5.0 star chapter`
- ✅ Should show: `unlocks.fiveStar: { remaining: 9, ... }`
- ❌ If you see different tier (💎 or 🟢), grade detection is wrong

#### E. **Subscription Unlock Calculation**
- ✅ `willUseSubscriptionUnlock:` should be **true** (if you have 9 unlocks)
- ❌ If it's **false**, something is wrong with the calculation

#### F. **Props to Modal**
- ✅ `balance:` should be **700**
- ✅ `subscriptionUnlocksRemaining:` should be **9**
- ✅ `willUseSubscriptionUnlock:` should be **true**

---

## 🚨 Common Issues & Fixes

### Issue 1: Balance = 0 in modal
**Symptom:** `Current balance state: 0`  
**Cause:** API response has balance in different field name  
**Fix:** Check the `💰 Raw API response:` log, tell me what field contains the balance

### Issue 2: Unlocks = null
**Symptom:** `Current unlocks state: null`  
**Cause:** API response has unlocks in different field name  
**Fix:** Check the `💰 Raw API response:` log, tell me what field contains unlocks

### Issue 3: willUseSubscriptionUnlock = false
**Symptom:** `✅ willUseSubscriptionUnlock: false` (even though you have unlocks)  
**Cause:** `unlocks.fiveStar.remaining` is 0 or unlocks object structure is wrong  
**Fix:** Check what `⭐ unlocks.fiveStar:` shows

### Issue 4: Wrong Tier Detected
**Symptom:** See `💎 This is a 4.0 star chapter` when grade is 5.0  
**Cause:** Grade value is wrong in database  
**Fix:** Check `🎯 Grade:` value and type

---

## 📤 What to Send Me

After clicking unlock on a 5.0⭐ chapter, copy and paste these specific logs:

1. **Balance Fetch Log:**
```
💰 Raw API response: { ... paste here ... }
💰 Setting balance to: ???
💰 Setting unlocks to: { ... paste here ... }
```

2. **Modal Render Log:**
```
🎯 Grade: ???
🎯 Current balance state: ???
🎯 Current unlocks state: { ... paste here ... }
⭐ unlocks.fiveStar: { ... paste here ... }
✅ willUseSubscriptionUnlock: ???
```

3. **Props to Modal:**
```
📤 Props being passed to UnlockConfirmationModal: { ... paste here ... }
```

This will tell me exactly what's wrong!

---

## 🔧 Possible API Response Formats

The backend might be returning data in different formats. Here are possibilities:

### Format 1: Nested unlocks
```json
{
  "balance": 700,
  "unlocks": {
    "fiveStar": { "remaining": 9, "monthly": 10, "isUnlimited": false },
    "fourStar": { "remaining": 0, "monthly": 0, "isUnlimited": false },
    "threeStar": { "remaining": 0, "monthly": 0, "isUnlimited": false }
  }
}
```

### Format 2: Flat unlocks
```json
{
  "balanceCredits": 700,
  "subscriptionUnlocks": {
    "fiveStar": 9,
    "fourStar": 0,
    "threeStar": 0
  }
}
```

### Format 3: Different naming
```json
{
  "credits": 700,
  "remainingSubscriptionUnlocks": {
    "fiveStar": { "remaining": 9 },
    "fourStar": { "remaining": 0 },
    "threeStar": { "remaining": 0 }
  }
}
```

The logging will show me which format is being used, and I can adjust the code accordingly.

---

**Next Steps:**
1. Refresh `/app/chapters`
2. Open console (F12)
3. Click unlock on 5.0⭐ chapter
4. Copy/paste the logs above
5. Send them to me

Then I can fix the exact issue! 🎯
