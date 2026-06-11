#!/usr/bin/env python3
"""
Check database configuration and data persistence
"""
from app import app, db, User
import os

def check_database():
    with app.app_context():
        db_uri = app.config["SQLALCHEMY_DATABASE_URI"]
        
        print("=" * 60)
        print("DATABASE CONFIGURATION CHECK")
        print("=" * 60)
        print()
        
        # Check database type
        if db_uri.startswith("postgresql://"):
            print("✅ Type: PostgreSQL")
            print("✅ Production Ready: YES")
            print("✅ Data Persists: YES")
            host = db_uri.split('@')[1].split('/')[0] if '@' in db_uri else 'configured'
            print(f"✅ Host: {host}")
        elif db_uri.startswith("sqlite:///"):
            print("❌ Type: SQLite")
            print("❌ Production Ready: NO")
            print("❌ Data Persists: NO")
            print(f"❌ File: {db_uri.replace('sqlite:///', '')}")
            print()
            print("⚠️  WARNING: All data will be LOST on deployment!")
            print("⚠️  See POSTGRESQL_MIGRATION.md for migration guide")
        
        print()
        
        # Check environment variable
        if os.environ.get("DATABASE_URL"):
            print("✅ DATABASE_URL: Set")
        else:
            print("❌ DATABASE_URL: Not set (using SQLite fallback)")
        
        print()
        
        # Check tables
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        print(f"Tables: {len(tables)} found")
        if tables:
            for table in sorted(tables):
                print(f"  • {table}")
        else:
            print("  (no tables - run db.create_all())")
        
        print()
        
        # Check users
        try:
            user_count = User.query.count()
            print(f"Users: {user_count}")
        except:
            print("Users: Unable to query (table may not exist)")
        
        print()
        print("=" * 60)

if __name__ == "__main__":
    check_database()
