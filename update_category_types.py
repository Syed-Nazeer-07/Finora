#!/usr/bin/env python3
"""
Update existing categories with proper income/expense types
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'wealthsync.db')

INCOME_CATEGORIES = [
    'Salary', 'Pocket Money', 'Freelance', 'Business Income', 'Scholarship',
    'Allowance', 'Internship', 'Gift Received', 'Interest Income',
    'Investment Returns', 'Refund', 'Bonus', 'Side Hustle', 'Freelance Income'
]

def update_categories():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Update income categories
    for cat_name in INCOME_CATEGORIES:
        cursor.execute("UPDATE category SET category_type = 'income' WHERE name = ?", (cat_name,))
    
    # All other categories are expense (already default)
    
    conn.commit()
    updated = cursor.rowcount
    print(f"✓ Updated {updated} categories to income type")
    conn.close()

if __name__ == "__main__":
    update_categories()
