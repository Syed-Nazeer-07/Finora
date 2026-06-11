# PostgreSQL Setup for Render - REQUIRED

## Current Status
❌ **DATABASE_URL is NOT set**  
❌ **Production will FAIL to start without it**

---

## STEP 1: Create PostgreSQL Database (5 minutes)

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   ```
   Name: wealthsync-db
   Database: wealthsync
   Region: Same as web service
   Plan: Free
   ```
4. Click **"Create Database"**
5. Wait for status: **"Available"** (green checkmark)

---

## STEP 2: Get Database URL

1. Click on the created database
2. Find **"Internal Database URL"**
3. Copy the ENTIRE URL (looks like):
   ```
   postgresql://wealthsync_user:LONG_PASSWORD@dpg-xxxxx.oregon-postgres.render.com/wealthsync
   ```

---

## STEP 3: Configure Web Service

1. Go to your **wealthsync** web service
2. Click **"Environment"** (left sidebar)
3. Find or add **DATABASE_URL**:
   ```
   Key:   DATABASE_URL
   Value: [paste the Internal Database URL]
   ```
4. Click **"Save Changes"**
5. Deployment will trigger automatically

---

## STEP 4: Verify Deployment

After deployment completes:

### Check Logs
Look for this line:
```
✓ Using PostgreSQL: dpg-xxxxx.oregon-postgres.render.com
```

### If you see this instead:
```
⚠ CRITICAL: Using SQLite - DATA WILL BE LOST
```
→ DATABASE_URL not set correctly. Go back to Step 3.

### If app fails to start:
```
RuntimeError: DATABASE_URL environment variable is required in production
```
→ This is CORRECT behavior. Set DATABASE_URL as in Step 3.

---

## STEP 5: Verify Connection

Run in Render Shell or locally (pointing to production DB):

```bash
python3 verify_db_connection.py
```

Expected output:
```
✓ DATABASE_URL is set
✓ Database type: PostgreSQL
✓ Host: dpg-xxxxx.oregon-postgres.render.com
✓ Port: 5432
✓ Database: wealthsync
✓ Connection successful!
```

---

## Security Notes

- Use **Internal Database URL** (not External)
- Never commit DATABASE_URL to git
- Connection string contains password
- Render handles SSL automatically

---

## What Changed

**Before:**
```python
# Silent fallback to SQLite
database_url = os.environ.get("DATABASE_URL") or "sqlite:///wealthsync.db"
```

**After:**
```python
# Fail fast in production
if not database_url:
    if os.environ.get("FLASK_ENV") == "production":
        raise RuntimeError("DATABASE_URL required in production")
```

**Result:**
- ✅ Development: Still uses SQLite for testing
- ✅ Production: MUST have PostgreSQL configured
- ✅ No silent data loss
- ✅ Explicit error if misconfigured

---

## DO THIS NOW

1. [ ] Create PostgreSQL database on Render
2. [ ] Set DATABASE_URL in web service
3. [ ] Wait for deployment
4. [ ] Check logs for "✓ Using PostgreSQL"
5. [ ] Run verification script
6. [ ] Test signup and data persistence

**Estimated time:** 10 minutes
