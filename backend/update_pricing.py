#!/usr/bin/env python3
"""
Update pricing plans with proper features and consistent pricing
"""
import asyncio
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

async def update_pricing_plans():
    # Connect to MongoDB
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME", "codementee")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🚀 Updating pricing plans with consistent pricing...")
    
    # Delete existing pricing plans
    result = await db.pricing_plans.delete_many({})
    print(f"🗑️  Deleted {result.deleted_count} existing pricing plans")
    
    # Create new minimal launch pricing plans with sustainable limits (all in paise)
    # Foundation: ₹1,999/month - 1 mock (₹800 mentor payout = 60% profit margin)
    # Growth: ₹4,999/3 months - 3 mocks total (₹2,400 mentor payout = 52% profit margin)  
    # Accelerator: ₹8,999/6 months - 6 mocks total (₹4,800 mentor payout = 47% profit margin)
    pricing_plans = [
        {
            "plan_id": "foundation",
            "name": "Foundation",
            "price": 199900,  # ₹1,999 in paise
            "duration_months": 1,
            "features": [
                "1 Mock Interview",
                "Basic Resume Review (AI-powered)",
                "1 AI Interview Prep Tool",
                "Community access",
                "Email support"
            ],
            "limits": {
                "mock_interviews": 1,
                "resume_reviews": 1,
                "ai_tools": 1,
                "community_access": True
            },
            "is_active": True,
            "display_order": 1
        },
        {
            "plan_id": "growth",
            "name": "Growth",
            "price": 499900,  # ₹4,999 in paise
            "duration_months": 3,
            "features": [
                "3 Mock Interviews (total)",
                "Expert Resume Review + Templates",
                "All AI Interview Prep Tools",
                "Priority community access",
                "Mentor selection",
                "Video recordings of sessions",
                "Chat support"
            ],
            "limits": {
                "mock_interviews": 3,
                "resume_reviews": 2,
                "ai_tools": "all",
                "community_access": True,
                "mentor_selection": True,
                "video_recordings": True
            },
            "is_active": True,
            "display_order": 2
        },
        {
            "plan_id": "accelerator",
            "name": "Accelerator",
            "price": 899900,  # ₹8,999 in paise
            "duration_months": 6,
            "features": [
                "6 Mock Interviews (total)",
                "Everything in Growth",
                "1 Career Coaching session",
                "Company insider insights",
                "Priority mentor booking",
                "Custom interview preparation plan",
                "WhatsApp support",
                "Job referral assistance"
            ],
            "limits": {
                "mock_interviews": 6,
                "resume_reviews": 3,
                "ai_tools": "all",
                "community_access": True,
                "mentor_selection": True,
                "video_recordings": True,
                "career_coaching": 1,
                "priority_booking": True,
                "custom_prep_plan": True,
                "job_referrals": True
            },
            "is_active": True,
            "display_order": 3
        }
    ]
    
    for plan_data in pricing_plans:
        plan_doc = {
            "id": str(uuid.uuid4()),
            "plan_id": plan_data["plan_id"],
            "name": plan_data["name"],
            "price": plan_data["price"],
            "duration_months": plan_data["duration_months"],
            "features": plan_data["features"],
            "limits": plan_data["limits"],
            "is_active": plan_data["is_active"],
            "display_order": plan_data["display_order"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.pricing_plans.insert_one(plan_doc)
        print(f"✅ Created pricing plan: {plan_data['name']} - ₹{plan_data['price']/100}")
    
    print("\n🎉 Pricing plans updated successfully with consistent pricing!")
    print("📋 All prices are now stored in paise for consistency")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(update_pricing_plans())