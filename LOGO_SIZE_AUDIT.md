# 🔍 LOGO SIZE INVESTIGATION REPORT

## Current Sizing Analysis

### 1. LOGIN PAGE HERO (templates/login.html - line 97)
```html
<div class="w-28 h-28 rounded-3xl ...">
  <img src="/static/branding/logo.png" class="w-full h-full object-cover">
</div>
```
**Current Size:** w-28 h-28 = 112px × 112px ✅ CORRECT
**Requirement:** 96px-128px
**Status:** ✅ MEETS REQUIREMENT

---

### 2. SIDEBAR LOGO (templates/index.html - line 78)
```html
<div class="shrink-0 w-11 h-11 rounded-xl ...">
  <img src="/static/branding/logo.png" class="w-full h-full object-cover">
</div>
```
**Current Size:** w-11 h-11 = 44px × 44px ✅ CORRECT
**Requirement:** 40px-48px
**Status:** ✅ MEETS REQUIREMENT

---

### 3. SIDEBAR COLLAPSED ICON (templates/index.html - line 84)
```html
<button class="sidebar-logo-icon hidden shrink-0 w-11 h-11 ...">
  <img src="/static/branding/logo.png" class="w-full h-full object-cover">
</button>
```
**Current Size:** w-11 h-11 = 44px × 44px ✅ CORRECT
**Status:** ✅ MEETS REQUIREMENT

---

### 4. MOBILE HEADER (templates/index.html - line 133)
```html
<div class="w-8 h-8 rounded-lg shadow">
  <img src="/static/branding/logo.png" class="w-full h-full object-contain">
</div>
```
**Current Size:** w-8 h-8 = 32px × 32px ❌ TOO SMALL
**Recommendation:** w-10 h-10 = 40px × 40px
**Status:** ⚠️ BELOW REQUIREMENT (should be 40px+)

---

### 5. ONBOARDING MODE SELECTOR (templates/onboarding.html - lines 88, 98)
```html
<img src="/static/branding/logo.png" class="w-12 h-12 object-cover rounded">
```
**Current Size:** w-12 h-12 = 48px × 48px ✅ CORRECT
**Requirement:** 48px-64px
**Status:** ✅ MEETS REQUIREMENT

---

## Issues Found

### ❌ Mobile Header Logo (32px)
- **File:** templates/index.html:133
- **Current:** `w-8 h-8` (32px)
- **Recommended:** `w-10 h-10` (40px)
- **Reason:** Too small for visibility

---

## Tailwind Size Reference
```
w-6 h-6   = 24px   (too small)
w-8 h-8   = 32px   (current mobile - too small)
w-11 h-11 = 44px   (sidebar - correct)
w-12 h-12 = 48px   (onboarding - correct)
w-28 h-28 = 112px  (login - correct)
```

---

## Fix Required

**File:** templates/index.html  
**Line:** 133  
**Change:**
```html
<!-- FROM -->
<div class="w-8 h-8 rounded-lg shadow">

<!-- TO -->
<div class="w-10 h-10 rounded-lg shadow">
```

---

## Verification

✅ Login page logo: 112px (CORRECT)
✅ Sidebar logo: 44px (CORRECT)
✅ Collapsed sidebar: 44px (CORRECT)
⚠️ Mobile header: 32px (TOO SMALL) → needs w-10 h-10
✅ Onboarding: 48px (CORRECT)

**No w-6, w-8, h-6, h-8 restrictions found that need removal.**

---

## Root Cause

The logo appears "extremely small" because:
1. Mobile header uses only 32px (w-8 h-8)
2. This is smaller than recommended minimum
3. On low-res screens, 32px appears as 2-3px visual size

**Solution:** Increase mobile header from 32px to 40px
