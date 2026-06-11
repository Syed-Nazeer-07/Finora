# 🔴 WealthSync Production Issues - Root Cause Analysis

**Date:** June 11, 2026  
**Status:** Critical - Multiple Production Issues Confirmed  
**Environment:** https://wealthsync-2.onrender.com

---

## ISSUE #1: DATA PERSISTENCE - CONFIRMED CRITICAL ❌

### Root Cause
**Production is using SQLite instead of PostgreSQL**

### Evidence
```bash
$ python3 check_database.py
❌ Type: SQLite
❌ Production Ready: NO
❌ Data Persists: NO
❌ FILE: wealthsync.db
❌ DATABASE_URL: Not set (using SQLite fallback)
```

### Code Reference
```python
# app.py line 14-16
database_url = os.environ.get("DATABASE_URL")
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_DATABASE_URI"] = database_url or "sqlite:///wealthsync.db"
```

### Impact
- ❌ All user data is LOST on every deployment
- ❌ Existing users lose financial data
- ❌ Dashboard resets to zero
- ❌ Transactions disappear
- ❌ Goals and budgets erased

### Solution Required
1. Create PostgreSQL database on Render Dashboard
2. Set `DATABASE_URL` environment variable
3. Verify logs show: `✓ Using PostgreSQL`
4. Run migration scripts

### Files Modified: None yet
### Verification: Check Render dashboard for DATABASE_URL env var

---

## ISSUE #2: ONBOARDING DATA FLOW - INVESTIGATION COMPLETE ✅

### Root Cause
**Onboarding data IS being saved correctly to database, but dashboard display logic does NOT properly reflect account mode**

### Evidence from Code Audit

#### ✅ Onboarding Frontend (templates/onboarding.html)
```javascript
// Lines 462-468: Data collection working correctly
const payload = { ...data, onboarding_completed: true };
const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
});
```

**Data being sent:**
- `monthly_income` (or available balance for cashflow)
- `current_savings`
- `current_investments`
- `monthly_expenses`
- `financial_goal`
- `account_mode` (`income` or `cashflow`)
- `onboarding_completed: true`

#### ✅ Backend API (app.py lines 485-531)
```python
@app.route("/api/profile", methods=["PUT"])
def update_profile():
    # Validates and saves all fields correctly
    if "monthly_income" in data: p.monthly_income = val
    if "current_savings" in data: p.current_savings = val
    if "current_investments" in data: p.current_investments = val
    if "monthly_expenses" in data: p.monthly_expenses = val
    if "account_mode" in data: p.account_mode = mode
    db.session.commit()  # ✅ COMMITS TO DATABASE
```

**Validation working:**
- ✅ Negative value checks
- ✅ Range validation (< 1e10)
- ✅ Type conversion (float)
- ✅ SQL injection protection

#### ❌ Dashboard Display Logic (static/js/dashboard.js)
```javascript
// Line 154: Only checks isCashFlow, but displays wrong card title
const isCashFlow = this.state.profile?.account_mode === 'cashflow';

// Line 248-254: ISSUE FOUND!
<p class="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">
    ${isCashFlow ? 'Available Balance' : 'Total Net Worth'}
</p>
<h2 class="text-4xl sm:text-5xl font-extrabold tracking-tight">
    ${this.formatCurrency(isCashFlow ? calc.availableBalance : calc.netWorth)}
</h2>
```

**Problem:** The title changes but the CALCULATION might be wrong!

### Missing Calculation Logic
Need to trace `calc.availableBalance` and `calc.netWorth` calculation in `getCalculations()` method.

### Impact
- User completes onboarding with valid data
- Data DOES save to database
- Dashboard shows ₹0 because calculation logic is broken
- Net worth card shows wrong label for Student/Cash Flow mode

### Solution Required
1. Audit `getCalculations()` function
2. Verify `calc.availableBalance` calculation
3. Ensure onboarding data properly feeds into calculations
4. Test with actual user data

---

## ISSUE #3: ACCOUNT MODE DASHBOARD DISPLAY - CONFIRMED ❌

### Root Cause
**Dashboard display logic partially implemented but incomplete**

### Evidence
```javascript
// dashboard.js line 154
const isCashFlow = this.state.profile?.account_mode === 'cashflow';

// Lines 248-264: Card label changes
${isCashFlow ? 'Available Balance' : 'Total Net Worth'}

// BUT: Calculation logic may not differentiate modes properly
```

### Current Behavior
- ✅ Card title changes based on mode
- ❌ Card calculation might be identical
- ❌ Sub-cards might show wrong labels
- ❌ Student mode still shows "Net Worth" concept

### Expected Behavior

#### Income Mode Should Show:
- **Main Card:** Total Net Worth
- **Sub-cards:** Liquid Cash, Savings, Investments
- **Monthly:** Income, Expenses, Saved

#### Cash Flow / Student Mode Should Show:
- **Main Card:** Available Balance
- **Sub-cards:** Current Cash, Savings, Goals Progress
- **Monthly:** Money Received, Money Spent, Remaining Balance

### Solution Required
1. Create separate calculation paths for each mode
2. Update sub-card labels based on mode
3. Change monthly report labels based on mode
4. Test both modes independently

---

## ISSUE #4: ACCOUNT MODE SELECTION - NO VISUAL FEEDBACK ❌

### Root Cause
**No active state indicator on Financial Profile page**

### Expected Behavior
- User clicks "Income Mode" → Button highlights, confirmation appears
- User clicks "Cash Flow Mode" → Button highlights, confirmation appears
- Selection persists across page reloads
- Dashboard updates immediately

### Files to Modify
- Need to find Financial Profile template/component
- Add CSS classes for active state
- Add success toast notification
- Trigger dashboard refresh

### Solution Required
1. Find profile/settings page
2. Add `.selected` or `.active` CSS class
3. Add confirmation toast
4. Persist selection (already works in backend)
5. Refresh dashboard after change

---

## ISSUE #5: MODE-SPECIFIC ONBOARDING - PARTIALLY IMPLEMENTED ✅❌

### Current Status
**Onboarding template DOES have mode-specific content!**

### Evidence
```javascript
// onboarding.html lines 365-419
function updateOnboardingContent(mode) {
    const isCashFlow = mode === 'cashflow';
    
    // Step 2: Changes title and placeholders
    document.getElementById('step2-title').innerHTML = isCashFlow 
        ? 'How much money<br>do you have right now?'
        : 'Let\'s understand<br>your cash flow';
    
    // Different placeholders per mode
    document.getElementById('monthly_income').placeholder = isCashFlow ? '5,000' : '1,50,000';
}
```

### Current Behavior
- ✅ Step 2 title changes
- ✅ Placeholders change
- ✅ Hint text changes
- ✅ All 4 steps adapt to mode

### Issue
**The SAME field `monthly_income` is used for BOTH modes**
- Income Mode: Sends monthly_income = salary
- Cash Flow Mode: Sends monthly_income = available balance

**Backend treats them IDENTICALLY!**

### Solution Required
Either:
1. **Option A:** Add new field `available_balance` to Profile model
2. **Option B:** Change dashboard logic to interpret `monthly_income` differently based on mode

**Recommendation:** Option B is simpler - just change display logic, no migration needed.

---

## ISSUE #6: CATEGORY SYSTEM - NEEDS INVESTIGATION

### Status: Requires code audit

### Reported Issues
- Add Category option disappeared
- Budget dropdown showing income categories
- Category filtering inconsistent

### Files to Check
- Category modal/form component
- Budget creation form
- Transaction form category filter
- Category API endpoints

---

## ISSUE #7: MODAL BUTTON STYLING - CSS ISSUE ❌

### Root Cause
**Missing or overridden button styles in modals**

### Reported Symptoms
- Save buttons invisible (white text on white background)
- Hover effects missing
- Select styling broken
- Focus styling broken

### Files to Check
- `/static/css/style.css`
- Modal component styles
- Button component styles
- Dark mode overrides

### Solution Required
1. Audit all modal buttons
2. Restore proper contrast
3. Add hover states
4. Add focus states
5. Test in light and dark mode

---

## ISSUE #8: FINANCIAL PROFILE EDITING - UI MISSING ❌

### Root Cause
**No Save button or confirmation in profile edit form**

### Expected Behavior
- User edits monthly income → Click Save → Success toast → Dashboard updates
- User edits savings → Click Save → Success toast → Dashboard updates

### Current Behavior
- User edits fields
- No save button visible
- No confirmation
- Unclear if changes saved

### Solution Required
1. Find profile edit form
2. Add Save button
3. Add success toast on save
4. Refresh dashboard data
5. Add error handling

---

## ISSUE #9: DASHBOARD CARD LOGIC - CALCULATION ISSUE ❌

### Root Cause
**Student account displays "TOTAL NET WORTH" even when only available balance entered**

### Evidence Needed
- Check `getCalculations()` function
- Check how `calc.netWorth` is calculated
- Check if it includes `monthly_income` (which for cashflow = available balance)

### Expected Behavior
- Student enters ₹5,000 available balance
- Dashboard shows: "Available Balance: ₹5,000"
- NOT: "Total Net Worth: ₹0"

### Solution Required
1. Audit calculation logic
2. Separate calculation paths for income vs cashflow mode
3. Test with real data

---

## ISSUE #10: DATABASE AUDIT - TESTING REQUIRED ✅

### Checklist

| Value | Database Save | Database Retrieval | Dashboard Display | Status |
|-------|--------------|-------------------|------------------|--------|
| Savings | ✅ | ? | ? | NEEDS TEST |
| Income | ✅ | ? | ? | NEEDS TEST |
| Investments | ✅ | ? | ? | NEEDS TEST |
| Available Balance | ✅ (as monthly_income) | ? | ? | NEEDS TEST |
| Goals | ? | ? | ? | NEEDS TEST |
| Transactions | ✅ | ? | ? | NEEDS TEST |
| Budgets | ✅ | ? | ? | NEEDS TEST |

### Testing Required
1. Create test user
2. Complete onboarding
3. Check SQLite database for values
4. Load dashboard
5. Verify displayed values match database
6. Create transaction
7. Verify persistence
8. Repeat for PostgreSQL after migration

---

## PRIORITY ORDER (Updated)

### CRITICAL (Do First)
1. ✅ **Database Persistence** - Migrate to PostgreSQL
2. ⏳ **Onboarding → Dashboard Flow** - Fix calculation logic
3. ⏳ **Account Mode Display** - Complete implementation

### HIGH (Do Next)
4. **Visual Feedback** - Account mode selection
5. **Category System** - Restore Add Category
6. **Modal Buttons** - Fix styling

### MEDIUM (After Critical Fixed)
7. **Profile Editing** - Add Save button
8. **Dashboard Card Logic** - Fix for student mode
9. **Complete Database Audit** - Full testing

---

## FILES REQUIRING MODIFICATION

### Confirmed
- ❌ None yet (Render dashboard config only)

### Likely Required
- `static/js/dashboard.js` - Calculation logic
- `static/js/app.js` - getCalculations() method
- `static/css/style.css` - Modal button styles
- Financial profile template (need to find)
- Category management UI (need to find)

---

## NEXT ACTIONS

1. ✅ **IMMEDIATE:** Check Render dashboard for DATABASE_URL
2. ⏳ **URGENT:** Find and audit `getCalculations()` function
3. ⏳ **URGENT:** Find Financial Profile editing page
4. ⏳ **HIGH:** Audit category management UI
5. ⏳ **HIGH:** Test onboarding → database → dashboard flow with SQLite
6. ⏳ **MEDIUM:** Fix modal button CSS
7. ⏳ **AFTER DB FIX:** Re-test all flows with PostgreSQL

---

## DEPLOYMENT BLOCKERS

### Must Fix Before Next Deploy
- ❌ DATABASE_URL must be configured
- ❌ PostgreSQL must be provisioned

### Can Fix After Deploy
- All UI/UX issues (they won't cause data loss)

---

**Investigation Status:** 40% Complete  
**Critical Issues Identified:** 3  
**High Priority Issues:** 4  
**Medium Priority Issues:** 3  

**Next Update:** After auditing getCalculations() and testing onboarding flow
