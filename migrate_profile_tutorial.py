#!/usr/bin/env python3
"""
Migration: Add tutorial_completed field to Profile model
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'wealthsync.db')

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if column already exists
    cursor.execute("PRAGMA table_info(profile)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'tutorial_completed' not in columns:
        print("Adding 'tutorial_completed' column to profile table...")
        cursor.execute("ALTER TABLE profile ADD COLUMN tutorial_completed BOOLEAN DEFAULT 0")
        conn.commit()
        print("✓ Migration completed successfully")
    else:
        print("✓ tutorial_completed column already exists, skipping migration")
    
    conn.close()

if __name__ == "__main__":
    migrate()
