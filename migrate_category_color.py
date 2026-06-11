#!/usr/bin/env python3
"""
Migration: Add color field to Category model
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'wealthsync.db')

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if column already exists
    cursor.execute("PRAGMA table_info(category)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'color' not in columns:
        print("Adding 'color' column to category table...")
        cursor.execute("ALTER TABLE category ADD COLUMN color VARCHAR(7) DEFAULT '#3b82f6' NOT NULL")
        conn.commit()
        print("✓ Migration completed successfully")
    else:
        print("✓ Color column already exists, skipping migration")
    
    conn.close()

if __name__ == "__main__":
    migrate()
