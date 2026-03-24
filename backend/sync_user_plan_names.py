#!/usr/bin/env python3
"""
Script to sync user plan_name with current pricing_plans collection
Fixes inconsistency where users have old plan names
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def sync_plan_names():
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME")
    
    print(f"🔄 Syncing user plan names with pricing plans...")
    print(f"   Database: {db_name}\n")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Get all pricing plans
    plans = await db.pricing_plans.find().to_list(100)
    plan_map = {p["plan_id"]: p["name"] for p in plans}
    
    print("📋 Current pricing plans:")
    for plan_id, name in plan_map.items():
        print(f"   {plan_id}: {name}")
    print()
    
    # Find users with plan_id but mismatched plan_name
    users = await db.users.find({"plan_id": {"$ne": None}}).to_list(1000)
    
    updated_count = 0
    for user in users:
        plan_id = user.get("plan_id")
        current_plan_name = user.get("plan_name")
        correct_plan_name = plan_map.get(plan_id)
        
        if correct_plan_name and current_plan_name != correct_plan_name:
            print(f"🔧 Updating {user['name']} ({user['email']})")
            print(f"   Plan ID: {plan_id}")
            print(f"   Old name: {current_plan_name}")
            print(f"   New name: {correct_plan_name}")
            
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"plan_name": correct_plan_name}}
            )
            updated_count += 1
            print("   ✅ Updated\n")
    
    if updated_count == 0:
        print("✅ All user plan names are already in sync!")
    else:
        print(f"\n✅ Updated {updated_count} users")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(sync_plan_names())
