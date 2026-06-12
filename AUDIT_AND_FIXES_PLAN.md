# WealthSync - Comprehensive Audit & Implementation Plan
**Date:** June 12, 2026  
**Phase:** Critical Fixes & Feature Implementation  

---

## CURRENT STATE ASSESSMENT

### ✅ Already Implemented (Verified)
1. **Core Models** - User, Profile, Transaction, Budget, Goal, Investment, Category, UserSettings, RoadmapItem
2. **Authentication** - Email signup, verification, login, password reset, Google OAuth
3. **Account Modes** - Income Mode and Cash Flow Mode with different calculation logic
4. **Dashboard** - Shows net worth/available balance based on account mode
5. **Portfolio Basics** - Add/edit investments with stock selling feature
6. **Category System** - Create/edit/delete with colors and emojis
7. **Button Styling** - All buttons correctly styled (blue save, black add buttons)
8. **Text Selection** - Proper selection styling
9. **Inline Category Creation** - Add categories on-the-fly in transaction/budget modals

### ⚠️ Issues & Gaps

#### CRITICAL ISSUES
1. **Stock Selling Modal** 
   - Current: Uses `prompt()` for sell price only
   - Required: Proper modal with quantity, price, date inputs
   - Status: NEEDS FIXING

2. **Multi-Asset Portfolio**
   - Current: Only stocks, basic asset_type field
   - Required: Different forms for Stocks, Gold, Silver, Mutual Funds, Crypto, FD, Real Estate
   - Status: NEEDS IMPLEMENTATION

3. **No Page Reloads**
   - Current: Unknown if all forms use fetch
   - Required: Verify all forms (Add Transaction, Budget, Goal, Portfolio, Category) use async fetch
   - Status: NEEDS AUDIT

4. **Profile Avatar**
   - Current: Only initials shown
   - Required: Support user avatar/profile image upload
   - Status: NOT IMPLEMENTED

#### MEDIUM PRIORITY
5. **Database Persistence**
   - Issue: SQLite in production loses all data
   - Status: Requires Render PostgreSQL configuration (not code fix)

6. **Category Management in Settings**
   - Current: May have visibility issues with "Add Category" button
   - Status: NEEDS VERIFICATION

7. **Account Mode Audit**
   - Issue: Verify both modes work correctly
   - Status: NEEDS TESTING

---

## IMPLEMENTATION ROADMAP

### PHASE 1: Portfolio Rework (Critical)
**Time: 45-60 minutes**

#### 1A. Replace Sell Stock Prompt with Modal
- Remove: `prompt()` based sell flow
- Add: Proper modal with form inputs
- Fields: Quantity sold, Sell price, Sell date
- Store in database or calculate on-the-fly
- Result: Shows (Realized Return: +₹X) or (-₹X) after sale
- File: `static/js/app.js` - `sellInvestment()` and modal rendering

#### 1B. Multi-Asset Portfolio Support
- Modify Investment model fields OR use asset_type better
- Add different form fields based on asset_type
- Asset Types:
  - **Stock**: Symbol, Quantity, Buy Price, Buy Date
  - **Gold/Silver**: Weight (grams), Buy Price Per Gram
  - **Mutual Fund**: ISIN/Name, Units, Buy Price Per Unit
  - **Crypto**: Symbol, Quantity, Buy Price
  - **FD (Fixed Deposit)**: Principal, Interest Rate (%), Maturity Date
  - **Real Estate**: Property Name, Purchase Cost, Area (sqft)
- File: `static/js/app.js` - Investment modal form generation

#### 1C. Sell Stock Modal - Complete Implementation
- Modal Title: "Sell {Asset Type}" (not just "Sell Stock")
- Form Fields Based on Asset Type:
  - Stock: Sell Quantity, Sell Price, Sell Date
  - Gold/Silver: Sell Weight, Sell Price Per Gram
  - Mutual Fund: Sell Units, Sell Price Per Unit
  - Crypto: Sell Quantity, Sell Price
  - FD: Principal (read-only), Maturity Date, Final Amount
  - Real Estate: Selling Price
- Calculate: Realized Return = (Sell Amount) - (Cost Amount)
- Create Income Transaction with profit/loss amount
- Delete investment after confirmation

### PHASE 2: Form Async Operations (High Priority)
**Time: 30-45 minutes**

Audit and ensure all forms use fetch (no page reloads):
1. **Add Transaction** - ✓ Likely working
2. **Edit Transaction** - Verify
3. **Add Budget** - ✓ Likely working
4. **Edit Budget** - Verify
5. **Add Goal** - ✓ Likely working
6. **Edit Goal** - Verify
7. **Add Portfolio Asset** - ✓ Likely working
8. **Edit Portfolio Asset** - ✓ Likely working
9. **Add/Edit/Delete Category** - Verify
10. **Delete Transaction/Budget/Goal/Investment** - Verify
11. **Available Balance Edit** - ✓ Likely working
12. **Financial Profile Changes** - ✓ Likely working

### PHASE 3: Settings & Profile (Medium Priority)
**Time: 30-45 minutes**

#### 3A. Category Management in Settings
- Verify "Add New Category" button is visible and functional
- Ensure edit and delete work without page reload
- Test: Add → Edit → Delete cycle

#### 3B. Profile Avatar
- Add profile picture upload field in Settings
- Store as Base64 or file reference
- Display in user card
- Display on dashboard/navbar
- File: Modify `UserSettings` or create new `ProfileImage` model

### PHASE 4: Verification & Testing (High Priority)
**Time: 60-90 minutes**

1. **Account Mode Testing**
   - Income Mode: Shows "Total Net Worth" label
   - Cash Flow Mode: Shows "Available Balance" label
   - Mode-specific onboarding questions
   - Dashboard calculations differ by mode

2. **Database Persistence**
   - Create new user → Add transaction → Restart app → Data persists
   - Verify all entities (users, transactions, budgets, goals, investments, categories) persist

3. **Login/Auth Audit**
   - Email signup: Works
   - Email verification: Works  
   - Login: Works
   - Logout: Works
   - Password reset: Works
   - Google OAuth: Works
   - No JSON parse errors
   - No HTML returned to fetch requests

4. **UI Regression Check**
   - Modal buttons: Visible and clickable
   - Form inputs: Properly styled and focused
   - Dropdowns: Open and function correctly
   - Hover states: Working on buttons/rows
   - Mobile responsiveness: OK on small screens
   - Dark mode: Colors correct

5. **Portfolio Feature Testing**
   - Add Stock: Works
   - Edit Stock: Works
   - Sell Stock (new modal): Works with all fields
   - Multi-asset: Add each type and verify form changes
   - Profit/Loss calculation: Correct
   - Realized return transaction created: Yes

---

## FILES TO MODIFY

### Core Changes
1. **static/js/app.js**
   - `sellInvestment()` - Replace with new modal
   - `renderModal('investment')` - Add asset-type-specific fields
   - Modal rendering - Sell modal with multi-asset support
   - Form save handlers - Ensure fetch used

2. **app.py (Backend)**
   - Add investment sell endpoint (if needed)
   - Ensure transaction creation from investment sales works
   - Verify all endpoints return JSON (no HTML)

3. **static/js/transactions.js**
   - Portfolio page - Update instructions if needed
   - Investment table - Verify sell button calls new modal

4. **static/js/dashboard.js**
   - Verify calculations show correct values
   - Verify mode-specific labels

### Optional (If needed)
5. **Model changes** - May need to extend Investment model if storing sell data
6. **Database migration** - If model changes required

---

## TESTING CHECKLIST

### Pre-Implementation
- [ ] All previous code committed
- [ ] Database backup (SQLite copy)
- [ ] Note deployment URL

### Post-Implementation
- [ ] Code compiles (Python syntax check)
- [ ] No console errors in browser
- [ ] Forms submit without page reload
- [ ] Modals open and close properly
- [ ] Buttons change state on hover
- [ ] All fields have proper validation

### Feature Testing
- [ ] Create investment with each asset type
- [ ] Sell investment with new modal
- [ ] Verify profit/loss calculation
- [ ] Check transaction created
- [ ] Verify both account modes work
- [ ] Test category add/edit/delete
- [ ] Test all form submissions
- [ ] Test on mobile browser

### Final Verification
- [ ] No broken links
- [ ] All pages load
- [ ] Dashboard shows correct values
- [ ] Portfolio shows all assets
- [ ] Settings accessible
- [ ] Dark mode working
- [ ] Auth flows complete

---

## DEPLOYMENT NOTES

### Pre-Deployment
1. Ensure DATABASE_URL set in Render
2. All local testing passed
3. No console errors
4. Mobile responsive verified

### Post-Deployment
1. Test signup flow
2. Add transaction and verify persistence
3. Sell investment and verify transaction created
4. Test account mode switch
5. Monitor logs for errors

---

## SUCCESS CRITERIA

✅ **Phase 1 Complete When:**
- Sell stock modal with date input works
- Multi-asset forms render correctly
- Profit/loss calculation accurate
- No console errors

✅ **Phase 2 Complete When:**
- All forms use fetch (no page reloads)
- Confirmation messages show after save
- Dashboard/list updates automatically
- Delete operations work without reload

✅ **Phase 3 Complete When:**
- Category management fully functional
- Profile avatar upload works
- Settings changes persist

✅ **Phase 4 Complete When:**
- All tests pass
- No broken functionality
- Database persists across restarts
- Mobile responsive
- Ready for production

---

## ESTIMATED TIMELINE

| Phase | Time | Start | End |
|-------|------|-------|-----|
| Phase 1 | 45-60 min | Now | In ~1 hour |
| Phase 2 | 30-45 min | After P1 | In ~1.5-2 hours |
| Phase 3 | 30-45 min | After P2 | In ~2.5-3 hours |
| Phase 4 | 60-90 min | After P3 | In ~4-4.5 hours |
| **TOTAL** | **~3-4 hours** | **Now** | **By ~14:00 UTC** |

---

## NOTES

- Focus on critical issues first (Phase 1 & 2)
- Phases 3 & 4 can extend if needed
- Profile avatar can be deferred if time is tight
- Database persistence is infrastructure (no code changes needed)
- All implementation should maintain dark mode compatibility
- Ensure backward compatibility with existing data
