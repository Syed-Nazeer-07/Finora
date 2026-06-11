#!/usr/bin/env python3
"""Test data persistence by checking database counts."""

import os
from dotenv import load_dotenv

load_dotenv()

if not os.environ.get("DATABASE_URL"):
    print("❌ DATABASE_URL not set. Run this script with production DATABASE_URL.")
    exit(1)

from app import app, db, User, Profile, Transaction, Budget, Goal

print("=" * 60)
print("DATA PERSISTENCE TEST")
print("=" * 60)

with app.app_context():
    try:
        # Get counts
        user_count = User.query.count()
        profile_count = Profile.query.count()
        transaction_count = Transaction.query.count()
        budget_count = Budget.query.count()
        goal_count = Goal.query.count()
        
        print(f"\n📊 Current Database State:")
        print(f"   Users:        {user_count}")
        print(f"   Profiles:     {profile_count}")
        print(f"   Transactions: {transaction_count}")
        print(f"   Budgets:      {budget_count}")
        print(f"   Goals:        {goal_count}")
        
        # Check for test user
        test_user = User.query.filter(User.email.like('test-%@test.com')).first()
        if test_user:
            print(f"\n✓ Test user found: {test_user.email}")
            
            # Get profile data
            profile = Profile.query.filter_by(user_id=test_user.id).first()
            if profile:
                print(f"   Monthly Income:    ₹{profile.monthly_income:,.2f}")
                print(f"   Current Savings:   ₹{profile.current_savings:,.2f}")
                print(f"   Current Investments: ₹{profile.current_investments:,.2f}")
                print(f"   Account Mode:      {profile.account_mode}")
            
            # Get transactions
            transactions = Transaction.query.filter_by(user_id=test_user.id).all()
            if transactions:
                print(f"\n   Recent Transactions:")
                for tx in transactions[:3]:
                    print(f"   - {tx.description}: {'₹' if tx.type == 'income' else '-₹'}{tx.amount:,.2f}")
            
            # Get goals
            goals = Goal.query.filter_by(user_id=test_user.id).all()
            if goals:
                print(f"\n   Goals:")
                for goal in goals:
                    print(f"   - {goal.title}: ₹{goal.current_amount:,.2f} / ₹{goal.target_amount:,.2f}")
            
            # Get budgets
            budgets = Budget.query.filter_by(user_id=test_user.id).all()
            if budgets:
                print(f"\n   Budgets:")
                for budget in budgets:
                    print(f"   - {budget.category}: ₹{budget.limit_amount:,.2f}")
        else:
            print("\nℹ️  No test user found (expected on first run)")
            print("\nNext steps:")
            print("1. Create test user via signup")
            print("2. Complete onboarding")
            print("3. Add transaction, budget, goal")
            print("4. Run this script to record baseline")
            print("5. Trigger redeploy")
            print("6. Run this script again to verify data persists")
        
        print("\n" + "=" * 60)
        
        # Save counts to file for comparison
        with open('.persistence_test_baseline.txt', 'w') as f:
            f.write(f"users={user_count}\n")
            f.write(f"profiles={profile_count}\n")
            f.write(f"transactions={transaction_count}\n")
            f.write(f"budgets={budget_count}\n")
            f.write(f"goals={goal_count}\n")
        
        print("✓ Baseline saved to .persistence_test_baseline.txt")
        
        # Check if we have a previous baseline
        if os.path.exists('.persistence_test_previous.txt'):
            print("\n📋 Comparing with previous run:")
            with open('.persistence_test_previous.txt', 'r') as f:
                previous = dict(line.strip().split('=') for line in f)
            
            prev_users = int(previous.get('users', 0))
            prev_profiles = int(previous.get('profiles', 0))
            prev_transactions = int(previous.get('transactions', 0))
            prev_budgets = int(previous.get('budgets', 0))
            prev_goals = int(previous.get('goals', 0))
            
            if user_count >= prev_users:
                print(f"   ✓ Users:        {prev_users} → {user_count} (preserved)")
            else:
                print(f"   ❌ Users:       {prev_users} → {user_count} (DATA LOSS!)")
            
            if profile_count >= prev_profiles:
                print(f"   ✓ Profiles:     {prev_profiles} → {profile_count} (preserved)")
            else:
                print(f"   ❌ Profiles:    {prev_profiles} → {profile_count} (DATA LOSS!)")
            
            if transaction_count >= prev_transactions:
                print(f"   ✓ Transactions: {prev_transactions} → {transaction_count} (preserved)")
            else:
                print(f"   ❌ Transactions: {prev_transactions} → {transaction_count} (DATA LOSS!)")
            
            if budget_count >= prev_budgets:
                print(f"   ✓ Budgets:      {prev_budgets} → {budget_count} (preserved)")
            else:
                print(f"   ❌ Budgets:     {prev_budgets} → {budget_count} (DATA LOSS!)")
            
            if goal_count >= prev_goals:
                print(f"   ✓ Goals:        {prev_goals} → {goal_count} (preserved)")
            else:
                print(f"   ❌ Goals:       {prev_goals} → {goal_count} (DATA LOSS!)")
        
        # Save current as previous for next run
        import shutil
        shutil.copy('.persistence_test_baseline.txt', '.persistence_test_previous.txt')
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        exit(1)
