#!/usr/bin/env python3
"""Verify database connection and report configuration."""

import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("DATABASE CONNECTION VERIFICATION")
print("=" * 60)

database_url = os.environ.get("DATABASE_URL")
flask_env = os.environ.get("FLASK_ENV", "development")

print(f"\nEnvironment: {flask_env}")
print(f"DATABASE_URL set: {'Yes' if database_url else 'No'}")

if not database_url:
    print("\n❌ DATABASE_URL is NOT set")
    if flask_env == "production":
        print("❌ CRITICAL: Production requires DATABASE_URL")
        print("\nAction required:")
        print("1. Create PostgreSQL database on Render")
        print("2. Set DATABASE_URL environment variable")
        print("3. Redeploy")
    else:
        print("ℹ️  Development: Will use SQLite fallback")
    print("\n" + "=" * 60)
    exit(1)

# Mask password
if "@" in database_url:
    protocol, rest = database_url.split("://")
    if "@" in rest:
        creds, host_db = rest.split("@")
        user = creds.split(":")[0]
        masked_url = f"{protocol}://{user}:***@{host_db}"
    else:
        masked_url = database_url
else:
    masked_url = database_url

print(f"\n✓ DATABASE_URL is set")
print(f"Connection string: {masked_url}")

if database_url.startswith("postgresql://") or database_url.startswith("postgres://"):
    print("\n✓ Database type: PostgreSQL")
    
    # Extract host
    if "@" in database_url:
        host_db = database_url.split("@")[1].split("/")[0]
        host = host_db.split(":")[0]
        port = host_db.split(":")[1] if ":" in host_db else "5432"
        db_name = database_url.split("/")[-1].split("?")[0]
        
        print(f"✓ Host: {host}")
        print(f"✓ Port: {port}")
        print(f"✓ Database: {db_name}")
        
        # Test connection
        print("\nTesting connection...")
        try:
            from app import app, db
            with app.app_context():
                # Try to execute a simple query
                db.session.execute(db.text("SELECT 1"))
                print("✓ Connection successful!")
                
                # Check if tables exist
                from sqlalchemy import inspect
                inspector = inspect(db.engine)
                tables = inspector.get_table_names()
                print(f"✓ Tables found: {len(tables)}")
                if tables:
                    print(f"  Tables: {', '.join(tables)}")
                else:
                    print("  ℹ️  No tables yet (will be created on first use)")
        except Exception as e:
            print(f"❌ Connection failed: {str(e)}")
            exit(1)
            
elif database_url.startswith("sqlite:"):
    print("\n⚠️  Database type: SQLite")
    print(f"File: {database_url.replace('sqlite:///', '')}")
    if flask_env == "production":
        print("\n❌ CRITICAL: SQLite is not allowed in production!")
        print("Action required: Configure PostgreSQL DATABASE_URL")
        exit(1)
else:
    print(f"\n❓ Unknown database type: {database_url.split(':')[0]}")

print("\n" + "=" * 60)
