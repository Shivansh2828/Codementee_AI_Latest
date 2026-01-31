#!/usr/bin/env python3
"""
Clean up duplicate pricing plans from the database.
Keep only the clean 3-tier structure: Foundation, Growth, Accelerator
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import certifi

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
db = client[os.environ['DB_NAME']]

async def cleanup_duplicate_pricing():
    """Remove duplicate pricing plans, keep only the clean 3-tier structure"""
    
    print("🧹 Cleaning up duplicate pricing plans...")
    
    # Plans to keep (clean 3-tier structure)
    plans_to_keep = ["foundation", "growth", "accelerator"]
    
    # Get all current plans
    all_plans = await db.pricing_plans.find().to_list(1000)
    print(f"📊 Found {len(all_plans)} pricing plans in database")
    
    # Show current plans
    for plan in all_plans:
        print(f"   - {plan['plan_id']}: {plan['name']} (₹{plan['price']/100})")
    
    # Delete duplicate/legacy plans
    plans_to_delete = []
    for plan in all_plans:
        if plan['plan_id'] not in plans_to_keep:
            plans_to_delete.append(plan['plan_id'])
    
    if plans_to_delete:
        print(f"\n🗑️  Removing {len(plans_to_delete)} duplicate plans:")
        for plan_id in plans_to_delete:
            print(f"   - Deleting: {plan_id}")
            result = await db.pricing_plans.delete_one({"plan_id": plan_id})
            if result.deleted_count > 0:
                print(f"     ✅ Deleted {plan_id}")
            else:
                print(f"     ❌ Failed to delete {plan_id}")
    
    # Verify final state
    remaining_plans = await db.pricing_plans.find().to_list(1000)
    print(f"\n✅ Final state: {len(remaining_plans)} pricing plans remaining")
    for plan in remaining_plans:
        print(f"   - {plan['plan_id']}: {plan['name']} (₹{plan['price']/100})")
    
    print("\n🎉 Pricing cleanup completed!")

if __name__ == "__main__":
    asyncio.run(cleanup_duplicate_pricing())