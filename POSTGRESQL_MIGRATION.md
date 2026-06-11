# 🔴 CRITICAL: PostgreSQL Migration for Production

## ⚠️ PROBLEM IDENTIFIED

**Current State:** Production is using **SQLite** (ephemeral storage)
**Impact:** All user data is **LOST on every deployment**

**Root Cause:**
```python
# app.py line 14
app.config["SQLALCHEMY_DATABASE_URI"] = database_url or "sqlite:///wealthsync.db"
```

If `DATABASE_URL` environment variable is not set, app defaults to SQLite.
SQLite files on Render are **wiped on every deployment**.

---

## ✅ SOLUTION: Migrate to PostgreSQL

### Step 1: Create PostgreSQL Database on Render

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com

2. **Create New PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `wealthsync-db`
   - Database: `wealthsync`
   - User: `wealthsync_user` (auto-generated)
   - Region: Same as your web service
   - Plan: **Free** (for testing) or **Starter** (for production)

3. **Wait for Database to Provision**
   - Status will change to "Available"
   - Takes ~2-3 minutes

4. **Copy Connection Details**
   You'll see:
   ```
   Internal Database URL:
   postgresql://user:pass@host:5432/dbname
   
   External Database URL:
   postgresql://user:pass@host:5432/dbname
   ```

### Step 2: Configure Environment Variables

1. **Go to Your Web Service**
   - Dashboard → Your WealthSync service

2. **Navigate to Environment**
   - Click "Environment" tab

3. **Add DATABASE_URL**
   ```
   Key: DATABASE_URL
   Value: [Paste the Internal Database URL from Step 1]
   ```

4. **Verify Other Variables**
   Make sure these are set:
   ```
   SECRET_KEY=your-secret-key-here
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_DEFAULT_SENDER=your-email@gmail.com
   PREFERRED_URL_SCHEME=https
   ```

5. **Save Changes**
   - Click "Save Changes"
   - Service will automatically redeploy

### Step 3: Verify Database Connection

1. **Check Logs**
   After deployment completes, check logs for:
   ```
   ✓ Using PostgreSQL: hostname:5432/dbname
   ```

   If you see:
   ```
   ⚠ Using SQLite: sqlite:///wealthsync.db - DATA WILL BE LOST ON DEPLOYMENT!
   ```
   → DATABASE_URL is not configured correctly!

2. **Check Database Tables**
   - Go to Render PostgreSQL database
   - Click "Connect" → "Psql"
   - Run:
   ```sql
   \dt
   ```
   
   You should see:
   ```
   public | budget
   public | category
   public | goal
   public | investment
   public | profile
   public | roadmap_item
   public | transaction
   public | user
   public | user_settings
   ```

### Step 4: Run Migrations

If tables don't exist, run migrations:

1. **Via Render Shell**
   - Dashboard → Your service → Shell tab
   - Run:
   ```bash
   python migrate_category_unique_fix.py
   ```

2. **Verify Tables Created**
   ```bash
   python -c "from app import app, db; 
   with app.app_context(): 
       from sqlalchemy import inspect;
       print('Tables:', inspect(db.engine).get_table_names())"
   ```

### Step 5: Test Data Persistence

1. **Create Test User**
   - Go to your app: https://your-app.onrender.com
   - Sign up with test account
   - Complete onboarding
   - Create a transaction

2. **Trigger Deployment**
   - Make a small code change
   - Push to GitHub
   - Wait for deployment

3. **Verify Data Persists**
   - Log in with same account
   - **Data should still be there!**

4. **Check User Count**
   ```bash
   python -c "from app import app, db, User;
   with app.app_context():
       print(f'Total users: {User.query.count()}')"
   ```

---

## 📊 Database Comparison

| Feature | SQLite (Current) | PostgreSQL (Required) |
|---------|------------------|----------------------|
| **Data Persistence** | ❌ Lost on deploy | ✅ Persistent |
| **Multi-user** | ⚠️ Lock issues | ✅ Concurrent |
| **Production Ready** | ❌ No | ✅ Yes |
| **Backup** | ❌ Manual | ✅ Automatic |
| **Scalability** | ❌ Limited | ✅ Scalable |
| **Cost** | Free | Free tier available |

---

## 🔍 Troubleshooting

### Issue: "peer authentication failed"
**Solution:** Use Internal Database URL (not External)

### Issue: "connection refused"
**Solution:** 
1. Verify PostgreSQL service is running
2. Check region matches web service
3. Use Internal URL, not External

### Issue: Tables not created
**Solution:**
```bash
# Force table creation
python -c "from app import app, db; 
with app.app_context(): 
    db.create_all(); 
    print('Tables created')"
```

### Issue: Data still disappearing
**Check:**
1. Verify DATABASE_URL is set correctly
2. Check startup logs for "Using PostgreSQL"
3. Ensure no SQLite references in code
4. Verify connection string starts with `postgresql://`

---

## ⚠️ IMPORTANT: PostgreSQL vs SQLite Differences

### 1. Boolean Values
```python
# SQLite uses 0/1
# PostgreSQL uses TRUE/FALSE
# ✅ SQLAlchemy handles this automatically
```

### 2. Date/Time
```python
# Both work the same with SQLAlchemy
# No changes needed
```

### 3. Case Sensitivity
```python
# PostgreSQL is case-sensitive for table names
# Our models use lowercase - no issues
```

### 4. UNIQUE Constraints
```python
# Already fixed in migrate_category_unique_fix.py
# PostgreSQL enforces these strictly
```

---

## 📋 Post-Migration Checklist

- [ ] DATABASE_URL environment variable set
- [ ] Startup logs show "Using PostgreSQL"
- [ ] All tables created (9 total)
- [ ] Can create new user
- [ ] Can create transaction
- [ ] Data persists after deployment
- [ ] Login works after deployment
- [ ] No "data lost" errors in logs

---

## 🚨 CRITICAL: Do This BEFORE Next Deploy

**If you deploy without PostgreSQL configured:**
- All existing user data will be lost
- Users will have to re-register
- All transactions, budgets, goals will be deleted

**Action Required:**
1. Set up PostgreSQL NOW
2. Configure DATABASE_URL
3. Deploy
4. Verify in logs: "Using PostgreSQL"

---

## 📞 Support

If issues persist:
1. Check Render logs
2. Verify DATABASE_URL format
3. Test connection manually
4. Contact Render support if database provisioning fails

---

## ✅ Success Criteria

You'll know migration succeeded when:
1. Logs show: `✓ Using PostgreSQL: hostname:5432/dbname`
2. User can sign up
3. User can log out and log back in
4. Data survives a deployment
5. Multiple users can use app simultaneously

**Current Status:** ❌ Using SQLite (FIX REQUIRED)  
**Target Status:** ✅ Using PostgreSQL (Data Persists)
