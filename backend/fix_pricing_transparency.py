#!/usr/bin/env python3
"""
Fix pricing transparency - Create clean, consistent pricing structure
"""

import asyncio
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'codementee')

async def fix_pricing_transparency():
    """Create clean, transparent pricing structure"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🔧 Fixing pricing transparency...")
    
    try:
        # 1. Clear existing pricing plans to avoid confusion
        await db.pricing_plans.delete_many({})
        print("✅ Cleared existing pricing plans")
        
        # 2. Create clean, transparent pricing plans
        clean_pricing_plans = [
            {
                "id": str(uuid.uuid4()),
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
                    "ai_tools": 1
                },
                "is_active": True,
                "display_order": 1,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
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
                    "ai_tools": 999
                },
                "is_active": True,
                "display_order": 2,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
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
                    "ai_tools": 999,
                    "career_coaching": 1
                },
                "is_active": True,
                "display_order": 3,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        
        # Insert clean pricing plans
        await db.pricing_plans.insert_many(clean_pricing_plans)
        print("✅ Created 3 clean pricing plans")
        
        # 3. Update mock data to match database
        print("📝 Updated pricing structure:")
        for plan in clean_pricing_plans:
            price_display = f"₹{plan['price'] // 100:,}"
            per_month = f"₹{(plan['price'] // 100) // plan['duration_months']:,}/month"
            print(f"  • {plan['name']}: {price_display} ({plan['duration_months']} months) - {per_month}")
            print(f"    Features: {len(plan['features'])} items")
            print(f"    Mock Interviews: {plan['limits']['mock_interviews']}")
            print()
        
        print("🎯 Pricing is now transparent and consistent!")
        print("   - No duplicate plans")
        print("   - Clear feature differences") 
        print("   - Consistent naming")
        print("   - Transparent limits")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(fix_pricing_transparency())