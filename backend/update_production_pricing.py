#!/usr/bin/env python3
"""
Update production database with new pricing plans
Run this on the production server after deployment
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid

# Load environment variables
load_dotenv()

async def update_pricing():
    # Connect to MongoDB
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME", "codementee")
    
    if not mongo_url:
        print("❌ MONGO_URL not found in environment variables")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🔄 Updating production pricing plans...")
    
    # Step 1: Delete ALL old plans
    print("\n📋 Step 1: Removing all old pricing plans...")
    result = await db.pricing_plans.delete_many({})
    print(f"✅ Deleted {result.deleted_count} old plans")
    
    # Step 2: Create new pricing plans
    print("\n📋 Step 2: Creating new pricing plans...")
    
    new_plans = [
        {
            "id": str(uuid.uuid4()),
            "plan_id": "starter",
            "name": "Mock Starter",
            "price": 299900,  # ₹2,999 in paise
            "duration_months": 1,
            "features": [
                "1 MAANG-Level Mock Interview",
                "Detailed Feedback Report",
                "Resume Review (Email-based)",
                "Proven Resume Templates",
                "Free AI ATS Resume Checker Access"
            ],
            "limits": {
                "mock_interviews": 1,
                "resume_reviews": 1,
                "ai_tools": True,
                "whatsapp_support": False,
                "referral_support": False
            },
            "is_active": True,
            "display_order": 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "plan_id": "pro",
            "name": "Interview Pro",
            "price": 699900,  # ₹6,999 in paise
            "duration_months": 3,
            "features": [
                "3 MAANG-Level Mock Interviews",
                "Improvement Tracking Between Mocks",
                "Resume Review by MAANG Engineer",
                "1 Strategy Call",
                "Proven Resume Templates",
                "Free AI ATS Resume Checker Access"
            ],
            "limits": {
                "mock_interviews": 3,
                "resume_reviews": 1,
                "strategy_calls": 1,
                "ai_tools": True,
                "whatsapp_support": False,
                "referral_support": False
            },
            "is_active": True,
            "display_order": 2,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "plan_id": "elite",
            "name": "Interview Elite",
            "price": 1499900,  # ₹14,999 in paise
            "duration_months": 6,
            "features": [
                "6 MAANG-Level Mock Interviews",
                "Live Resume Review Session",
                "Referral Guidance (Best Effort)",
                "Priority WhatsApp Support",
                "Proven Resume Templates",
                "Free AI ATS Resume Checker Access"
            ],
            "limits": {
                "mock_interviews": 6,
                "live_resume_review": 1,
                "ai_tools": True,
                "whatsapp_support": True,
                "referral_support": True
            },
            "is_active": True,
            "display_order": 3,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for plan in new_plans:
        await db.pricing_plans.insert_one(plan)
        print(f"✅ Created: {plan['name']} - ₹{plan['price']/100}")
    
    # Step 3: Verify
    print("\n📋 Step 3: Verifying pricing plans...")
    all_plans = await db.pricing_plans.find().sort("display_order", 1).to_list(100)
    
    print(f"\n✅ Total plans in database: {len(all_plans)}")
    for plan in all_plans:
        print(f"  - {plan['name']} ({plan['plan_id']}): ₹{plan['price']/100} - Order: {plan['display_order']}")
    
    if len(all_plans) == 3:
        print("\n✅ SUCCESS! Pricing plans updated correctly")
    else:
        print(f"\n⚠️  WARNING: Expected 3 plans, found {len(all_plans)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_pricing())
