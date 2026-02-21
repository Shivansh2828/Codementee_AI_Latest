#!/usr/bin/env python3
"""
Fix pricing plans schema - remove old fields and ensure consistency
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

async def fix_schema():
    client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
    db = client[os.getenv('DB_NAME', 'codementee')]
    
    print("🔧 Fixing pricing plans schema...")
    
    # Get all plans
    plans = await db.pricing_plans.find().to_list(100)
    
    for plan in plans:
        print(f"\n📋 Processing: {plan['name']}")
        
        # Keep only these fields
        clean_plan = {
            'id': plan.get('id') or plan.get('plan_id'),
            'plan_id': plan.get('plan_id') or plan.get('id'),
            'name': plan['name'],
            'price': plan['price'],  # Keep as-is (in paise)
            'duration_months': plan.get('duration_months', 1),
            'features': plan.get('features', []),
            'limits': plan.get('limits', {}),
            'is_active': plan.get('is_active', plan.get('active', True)),
            'display_order': plan.get('display_order', 1),
            'created_at': plan.get('created_at', datetime.now(timezone.utc).isoformat()),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Replace the document
        await db.pricing_plans.replace_one(
            {'_id': plan['_id']},
            clean_plan
        )
        
        print(f"  ✅ Cleaned: {clean_plan['name']} - ₹{clean_plan['price']/100}")
    
    print("\n" + "="*60)
    print("✅ Schema fixed! Verifying...")
    print("="*60)
    
    # Verify
    plans = await db.pricing_plans.find({'is_active': True}).sort('display_order', 1).to_list(100)
    for plan in plans:
        print(f"\n{plan['name']} ({plan['plan_id']}):")
        print(f"  Price: ₹{plan['price']/100}")
        print(f"  Features: {len(plan['features'])} items")
        print(f"  Active: {plan['is_active']}")
        print(f"  Order: {plan['display_order']}")
    
    client.close()
    print("\n✅ Done!")

if __name__ == "__main__":
    asyncio.run(fix_schema())
