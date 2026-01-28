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
    
    # Create new pricing plans with consistent pricing (all in paise)
    pricing_plans = [
        {
            "plan_id": "monthly",
            "name": "Monthly",
            "price": 199900,  # ₹1,999 in paise
            "duration_months": 1,
            "features": [
                "1 mock interview",
                "Detailed feedback report",
                "Resume review",
                "Private mentor group access",
                "Email support"
            ],
            "is_active": True,
            "display_order": 1
        },
        {
            "plan_id": "quarterly",
            "name": "3 Months",
            "price": 499900,  # ₹4,999 in paise
            "duration_months": 3,
            "features": [
                "3 mock interviews (1/month)",
                "Detailed feedback reports",
                "Resume review + optimization",
                "Private mentor group access",
                "Priority scheduling",
                "1 system design session"
            ],
            "is_active": True,
            "display_order": 2
        },
        {
            "plan_id": "biannual",
            "name": "6 Months",
            "price": 899900,  # ₹8,999 in paise
            "duration_months": 6,
            "features": [
                "6 mock interviews (1/month)",
                "Detailed feedback reports",
                "Complete resume overhaul",
                "Private mentor group access",
                "Priority scheduling",
                "2 system design sessions",
                "Salary negotiation guidance",
                "Direct mentor WhatsApp access"
            ],
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