#!/usr/bin/env python3
"""
Script to check database data and identify inconsistencies
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def check_database():
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME")
    
    print(f"🔍 Connecting to database...")
    print(f"   MongoDB URL: {mongo_url}")
    print(f"   Database: {db_name}")
    print()
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check pricing plans
    print("=" * 60)
    print("PRICING PLANS")
    print("=" * 60)
    plans = await db.pricing_plans.find().to_list(100)
    print(f"Total pricing plans: {len(plans)}")
    for plan in plans:
        print(f"\n  Plan ID: {plan.get('plan_id')}")
        print(f"  Name: {plan.get('name')}")
        print(f"  Price: ₹{plan.get('price', 0) / 100}")
        print(f"  Active: {plan.get('is_active', True)}")
        print(f"  Features: {len(plan.get('features', []))} features")
        if plan.get('features'):
            for feat in plan.get('features', [])[:3]:
                print(f"    - {feat}")
    
    # Check Jane's user data
    print("\n" + "=" * 60)
    print("JANE'S USER DATA")
    print("=" * 60)
    jane = await db.users.find_one({"email": "mentee@codementee.com"})
    if jane:
        print(f"  Name: {jane.get('name')}")
        print(f"  Email: {jane.get('email')}")
        print(f"  Role: {jane.get('role')}")
        print(f"  Status: {jane.get('status')}")
        print(f"  Plan ID: {jane.get('plan_id')}")
        print(f"  Plan Name: {jane.get('plan_name')}")
        print(f"  Interview Quota: {jane.get('interview_quota_remaining')}")
    else:
        print("  ❌ Jane not found in database!")
    
    # Check total users
    print("\n" + "=" * 60)
    print("USER STATISTICS")
    print("=" * 60)
    total_users = await db.users.count_documents({})
    free_users = await db.users.count_documents({"status": "Free"})
    paid_users = await db.users.count_documents({"status": "Active"})
    print(f"  Total users: {total_users}")
    print(f"  Free users: {free_users}")
    print(f"  Paid users: {paid_users}")
    
    # Check recent users
    print("\n  Recent users:")
    recent = await db.users.find().sort("created_at", -1).limit(5).to_list(5)
    for user in recent:
        print(f"    - {user.get('name')} ({user.get('email')}) - {user.get('status')} - {user.get('plan_id', 'No plan')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_database())
