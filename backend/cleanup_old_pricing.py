#!/usr/bin/env python3
"""
Cleanup old pricing plans and keep only the new ones
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def cleanup_pricing():
    # Connect to MongoDB
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017/?tls=false")
    db_name = os.getenv("DB_NAME", "codementee")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🧹 Cleaning up old pricing plans...")
    
    # Delete old plans
    old_plan_ids = ["monthly", "quarterly", "biannual", "starter", "professional", "intensive"]
    
    for plan_id in old_plan_ids:
        result = await db.pricing_plans.delete_one({"plan_id": plan_id})
        if result.deleted_count > 0:
            print(f"✅ Deleted old plan: {plan_id}")
        else:
            print(f"ℹ️  Plan not found: {plan_id}")
    
    # Verify only new plans exist
    print("\n📊 Current pricing plans:")
    plans = await db.pricing_plans.find().to_list(100)
    for plan in plans:
        print(f"  - {plan['name']} ({plan['plan_id']}): ₹{plan['price']/100}")
    
    print(f"\n✅ Total plans: {len(plans)}")
    
    if len(plans) != 3:
        print("⚠️  Warning: Expected 3 plans, found", len(plans))
    
    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_pricing())
