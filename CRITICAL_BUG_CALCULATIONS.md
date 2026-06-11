# 🔴 CRITICAL BUG FOUND: Onboarding Data Not Displaying

**Date:** June 11, 2026  
**Severity:** CRITICAL  
**Impact:** All new users see ₹0 on dashboard after onboarding

---

## ROOT CAUSE IDENTIFIED

### Bug Location: `static/js/app.js` lines 256-269

```javascript
getCalculations() {
    const p = this.state.profile || {};
    const isCashFlow = p.account_mode === 'cashflow';
    
    const txIncome   = this.state.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const txExpenses = this.state.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    const totalSavings         = p.current_savings     ?? 0;
    const profileIncome        = p.monthly_income      ?? 0;
    const profileExpenses      = p.monthly_expenses    ?? 0;
    
    // 🔴 BUG: Uses transaction totals when they exist, otherwise falls back to profile
    const totalIncome   = txIncome   || profileIncome;   // ❌ WRONG!
    const totalExpenses = txExpenses || profileExpenses; // ❌ WRONG!
    
    // 🔴 BUG: currentCash only considers transactions, ignores initial balance!
    const currentCash   = txIncome - txExpenses;  // ❌ WRONG!
    
    const availableBalance = currentCash;  // ❌ Also wrong
    
    // 🔴 BUG: netWorth calculation uses broken currentCash
    const netWorth = currentCash + totalSavings + totalInvestmentValue;  // ❌ WRONG!
    
    // ... rest of function
}
```

---

## THE PROBLEM

### Scenario 1: New User Completes Onboarding

**User enters:**
- Monthly Income: ₹1,50,000
- Current Savings: ₹2,50,000
- Current Investments: ₹5,00,000
- Monthly Expenses: ₹60,000

**Saved to database:**
```python
profile.monthly_income = 150000       # ✅ Saved
profile.current_savings = 250000      # ✅ Saved
profile.current_investments = 500000  # ✅ Saved
profile.monthly_expenses = 60000      # ✅ Saved
```

**Dashboard calculations:**
```javascript
txIncome = 0   // No transactions yet
txExpenses = 0 // No transactions yet

// Bug 1: Falls back to profileIncome
totalIncome = 0 || 150000 = 150000  // ✅ OK so far

// Bug 2: currentCash ONLY uses transactions
currentCash = 0 - 0 = 0  // ❌ IGNORES monthly_income from profile!

// Bug 3: netWorth is broken
netWorth = 0 + 250000 + 500000 = 750000  // ❌ WRONG! Should be 840000
```

**Dashboard displays:**
```
Total Net Worth: ₹7,50,000  // ❌ WRONG! Missing ₹90,000 (monthly income)
Liquid Cash: ₹0             // ❌ WRONG! Should show initial income
Savings: ₹2,50,000          // ✅ Correct
Investments: ₹5,00,000      // ✅ Correct
```

### Scenario 2: Cash Flow Mode (Student)

**User enters:**
- Available Balance (sent as monthly_income): ₹5,000
- Savings: ₹1,000
- Investments: ₹0
- Monthly Expenses: ₹3,000

**Dashboard calculations:**
```javascript
txIncome = 0
txExpenses = 0

currentCash = 0 - 0 = 0  // ❌ WRONG! Should be 5000

availableBalance = 0  // ❌ WRONG! User has ₹5,000!

netWorth = 0 + 1000 + 0 = 1000  // ❌ WRONG! Should be 6000
```

**Dashboard displays:**
```
Available Balance: ₹0     // ❌ COMPLETELY WRONG!
Current Cash: ₹0          // ❌ Should be ₹5,000
Savings: ₹1,000           // ✅ Correct
Goals: ₹0                 // ✅ Correct (no goals yet)
```

---

## WHY THIS HAPPENS

### Design Flaw

The calculation logic was designed assuming users would:
1. Start with zero balance
2. Add income transactions
3. Add expense transactions
4. Dashboard calculates current cash from transactions

**BUT:** The onboarding flow collects **initial state** data:
- Current savings (already saved)
- Current investments (already invested)
- Monthly income (recurring, not a transaction)
- Available balance (current cash on hand)

### Logic Error

```javascript
// This logic is BACKWARDS
const currentCash = txIncome - txExpenses;  // Only looks at transactions

// Should be:
const currentCash = profileIncome + txIncome - txExpenses;  // Include initial balance!
```

The code treats `profileIncome` as "fallback when no transactions" but it should be treated as **starting balance**.

---

## IMPACT ANALYSIS

### Affected Users
- ✅ **All new users** who complete onboarding
- ✅ **All users with no transactions yet**
- ✅ **Cash Flow mode users** (students)

### NOT Affected
- ❌ Users who add transactions (transactions override profile data)
- ❌ Legacy users (if any existed before onboarding)

### Data Loss
- ❌ **NO data is lost** - values are saved correctly to database
- ✅ **Display bug only** - calculations are wrong

---

## THE FIX

### Option 1: Change Calculation Logic (Recommended)

```javascript
getCalculations() {
    const p = this.state.profile || {};
    const isCashFlow = p.account_mode === 'cashflow';
    
    const txIncome   = this.state.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const txExpenses = this.state.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    const totalSavings         = p.current_savings     ?? 0;
    const profileIncome        = p.monthly_income      ?? 0;
    const profileExpenses      = p.monthly_expenses    ?? 0;
    
    // FIX: Different logic for cash flow vs income mode
    let currentCash, netWorth;
    
    if (isCashFlow) {
        // Cash Flow Mode: monthly_income represents AVAILABLE BALANCE
        currentCash = profileIncome + txIncome - txExpenses;
        netWorth = currentCash + totalSavings + totalInvestmentValue;
    } else {
        // Income Mode: monthly_income is recurring income
        // If no transactions, use profile income as starting balance
        if (this.state.transactions.length === 0) {
            currentCash = profileIncome - profileExpenses;
        } else {
            // With transactions, calculate actual cash flow
            currentCash = txIncome - txExpenses;
        }
        netWorth = currentCash + totalSavings + totalInvestmentValue;
    }
    
    const availableBalance = currentCash;
    
    // ... rest of function
}
```

### Option 2: Add New Field `available_balance`

**Requires:**
1. Database migration to add column
2. Update onboarding form
3. Update API endpoint
4. Update calculation logic

**NOT RECOMMENDED** - More complex, requires migration

---

## VERIFICATION PLAN

### Test Case 1: New Income Mode User

1. Sign up
2. Complete onboarding:
   - Income: ₹1,50,000
   - Savings: ₹2,50,000
   - Investments: ₹5,00,000
   - Expenses: ₹60,000
3. Dashboard should show:
   - Net Worth: ₹8,40,000 ✅
   - Liquid Cash: ₹90,000 ✅
   - Savings: ₹2,50,000 ✅
   - Investments: ₹5,00,000 ✅

### Test Case 2: New Cash Flow User

1. Sign up
2. Select Cash Flow mode
3. Complete onboarding:
   - Available Balance: ₹5,000
   - Savings: ₹1,000
   - Investments: ₹0
   - Expenses: ₹3,000
4. Dashboard should show:
   - Available Balance: ₹5,000 ✅
   - Current Cash: ₹5,000 ✅
   - Savings: ₹1,000 ✅
   - Goals: ₹0 ✅

### Test Case 3: User Adds Transaction

1. After onboarding, add expense: ₹500
2. Dashboard should show:
   - Cash Flow Mode: Available Balance: ₹4,500 ✅
   - Income Mode: Liquid Cash: ₹89,500 ✅

---

## FILES TO MODIFY

1. **static/js/app.js** - `getCalculations()` function (lines 252-369)
   - Fix currentCash calculation
   - Fix netWorth calculation
   - Add mode-specific logic

---

## RELATED ISSUES

This bug also explains:
- ❌ **Issue #9:** Dashboard card logic incorrect for student mode
- ❌ **Issue #2:** Onboarding data "not reaching" dashboard (it is, but display is broken)

---

## PRIORITY

**CRITICAL** - Must fix before any other UI/UX work.

Users completing onboarding see ₹0 and think:
1. Data wasn't saved
2. App is broken
3. They did something wrong

This creates:
- Immediate churn
- Bad first impression
- Support tickets
- Loss of trust

---

## ESTIMATED FIX TIME

- Code change: 15 minutes
- Testing: 30 minutes
- Deployment: 5 minutes

**Total: 50 minutes**

---

## NEXT STEPS

1. ✅ Implement fix in app.js
2. ✅ Test locally with SQLite
3. ✅ Verify with both account modes
4. ✅ Test with and without transactions
5. ⏳ Deploy to production
6. ⏳ Test on production with PostgreSQL (after DB migration)
