#!/usr/bin/env python3
"""
Update pricing plans with new one-time pricing structure
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from dotenv import load_dotenv
import certifi

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
db = client[os.environ['DB_NAME']]

async def update_pricing_plans():
    """Update pricing plans with new one-time structure"""
    
    # Delete existing pricing plans
    result = await db.pricing_plans.delete_many({})
    print(f"🗑️  Deleted {result.deleted_count} existing pricing plans")
    
    # New one-time pricing plans
    pricing_plans = [
        {
            "plan_id": "starter",
            "name": "Starter",
            "description": "Perfect for testing the waters",
            "duration": "One-time purchase",
            "price": 249900,  # ₹2,499 in paise
            "price_usd": 30,
            "original_price": None,
            "per_session": 249900,
            "popular": False,
            "features": [
                "1 Live Mock Interview (45-60 min)",
                "Detailed written feedback report", 
                "Email resume review",
                "Interview recording access",
                "Email support"
            ],
            "cta": "Book Your Mock",
            "justification": "Direct access to experienced engineers. No subscriptions, no commitments.",
            "active": True,
            "limits": {
                "mock_interviews": 1,
                "resume_reviews": 1,
                "ai_tools": 0
            }
        },
        {
            "plan_id": "professional", 
            "name": "Professional",
            "description": "Most comprehensive interview preparation",
            "duration": "One-time purchase",
            "price": 699900,  # ₹6,999 in paise
            "price_usd": 85,
            "original_price": 749700,  # ₹7,497 in paise
            "per_session": 233300,  # ₹2,333 per session
            "popular": True,
            "savings": "Save ₹498",
            "features": [
                "3 Live Mock Interviews (45-60 min each)",
                "Detailed feedback after each session",
                "Live resume review session (30 min)",
                "Interview recordings access", 
                "Priority scheduling",
                "WhatsApp support"
            ],
            "cta": "Get Professional Prep",
            "justification": "Complete interview preparation with multiple practice rounds and live resume optimization.",
            "active": True,
            "limits": {
                "mock_interviews": 3,
                "resume_reviews": 1,
                "ai_tools": 999
            }
        },
        {
            "plan_id": "intensive",
            "name": "Intensive", 
            "description": "Premium preparation for serious candidates",
            "duration": "One-time purchase",
            "price": 1299900,  # ₹12,999 in paise
            "price_usd": 155,
            "original_price": 1499400,  # ₹14,994 in paise
            "per_session": 216650,  # ₹2,166 per session
            "popular": False,
            "savings": "Save ₹1,995",
            "limited_seats": 10,
            "features": [
                "6 Live Mock Interviews (45-60 min each)",
                "Comprehensive feedback reports",
                "2 Live resume review sessions",
                "Company-specific interview prep",
                "Priority mentor matching",
                "Interview recordings access",
                "Direct mentor WhatsApp access",
                "Post-interview strategy calls"
            ],
            "cta": "Secure Premium Spot",
            "justification": "Intensive preparation with dedicated mentor support. Limited to 10 candidates for personalized attention.",
            "active": True,
            "limits": {
                "mock_interviews": 6,
                "resume_reviews": 2,
                "ai_tools": 999
            }
        }
    ]
    
    # Insert new pricing plans
    for plan_data in pricing_plans:
        plan_doc = {
            "id": plan_data["plan_id"],
            "plan_id": plan_data["plan_id"],
            "name": plan_data["name"],
            "description": plan_data["description"],
            "duration": plan_data["duration"],
            "price": plan_data["price"],
            "priceUSD": plan_data["price_usd"],
            "originalPrice": plan_data.get("original_price"),
            "perSession": plan_data["per_session"],
            "popular": plan_data["popular"],
            "savings": plan_data.get("savings"),
            "limitedSeats": plan_data.get("limited_seats"),
            "features": plan_data["features"],
            "cta": plan_data["cta"],
            "justification": plan_data["justification"],
            "active": plan_data["active"],
            "limits": plan_data["limits"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.pricing_plans.insert_one(plan_doc)
        print(f"✅ Created pricing plan: {plan_data['name']} - ₹{plan_data['price']/100}")
    
    print(f"\n🎉 Successfully updated {len(pricing_plans)} pricing plans!")

if __name__ == "__main__":
    asyncio.run(update_pricing_plans())