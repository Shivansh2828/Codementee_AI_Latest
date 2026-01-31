#!/usr/bin/env python3
"""
Pricing Integrity Validator
Ensures only clean 3-tier pricing structure exists in the database.
Run this script regularly to prevent duplicate pricing plans.
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

# Expected clean pricing structure
EXPECTED_PLANS = {
    "foundation": {
        "name": "Foundation",
        "price": 199900,  # ₹1,999 in paise
        "duration_months": 1,
        "features": ["1 Mock Interview", "Basic Resume Review (AI-powered)", "1 AI Interview Prep Tool", "Community access", "Email support"]
    },
    "growth": {
        "name": "Growth", 
        "price": 499900,  # ₹4,999 in paise
        "duration_months": 3,
        "features": ["3 Mock Interviews (total)", "Expert Resume Review + Templates", "All AI Interview Prep Tools", "Priority community access", "Video recordings of sessions", "Chat support"]
    },
    "accelerator": {
        "name": "Accelerator",
        "price": 899900,  # ₹8,999 in paise
        "duration_months": 6,
        "features": ["6 Mock Interviews (total)", "Everything in Growth", "1 Career Coaching session", "Company insider insights", "Priority mentor booking", "Custom interview preparation plan", "WhatsApp support", "Job referral assistance"]
    }
}

async def validate_pricing_integrity():
    """Validate and fix pricing plan integrity"""
    
    print("🔍 Validating pricing plan integrity...")
    
    # Get all current plans
    all_plans = await db.pricing_plans.find().to_list(1000)
    current_plan_ids = [plan['plan_id'] for plan in all_plans]
    
    print(f"📊 Found {len(all_plans)} pricing plans in database")
    
    issues_found = []
    
    # Check for unexpected plans
    unexpected_plans = [pid for pid in current_plan_ids if pid not in EXPECTED_PLANS.keys()]
    if unexpected_plans:
        issues_found.append(f"Unexpected plans found: {unexpected_plans}")
        print(f"⚠️  Unexpected plans: {unexpected_plans}")
        
        # Remove unexpected plans
        for plan_id in unexpected_plans:
            await db.pricing_plans.delete_one({"plan_id": plan_id})
            print(f"🗑️  Removed unexpected plan: {plan_id}")
    
    # Check for missing plans
    missing_plans = [pid for pid in EXPECTED_PLANS.keys() if pid not in current_plan_ids]
    if missing_plans:
        issues_found.append(f"Missing plans: {missing_plans}")
        print(f"⚠️  Missing plans: {missing_plans}")
        
        # Add missing plans
        for plan_id in missing_plans:
            plan_data = EXPECTED_PLANS[plan_id]
            plan_doc = {
                "id": f"auto-{plan_id}",
                "plan_id": plan_id,
                "name": plan_data["name"],
                "price": plan_data["price"],
                "duration_months": plan_data["duration_months"],
                "features": plan_data["features"],
                "limits": {"mock_interviews": plan_data["duration_months"]},
                "is_active": True,
                "display_order": list(EXPECTED_PLANS.keys()).index(plan_id) + 1,
                "created_at": "2026-01-30T20:25:00.000000+00:00",
                "updated_at": "2026-01-30T20:25:00.000000+00:00"
            }
            await db.pricing_plans.insert_one(plan_doc)
            print(f"➕ Added missing plan: {plan_id}")
    
    # Validate existing plans
    for plan in all_plans:
        if plan['plan_id'] in EXPECTED_PLANS:
            expected = EXPECTED_PLANS[plan['plan_id']]
            
            # Check price
            if plan['price'] != expected['price']:
                issues_found.append(f"Price mismatch for {plan['plan_id']}: expected ₹{expected['price']/100}, got ₹{plan['price']/100}")
                await db.pricing_plans.update_one(
                    {"plan_id": plan['plan_id']},
                    {"$set": {"price": expected['price']}}
                )
                print(f"💰 Fixed price for {plan['plan_id']}: ₹{expected['price']/100}")
            
            # Check duration
            if plan['duration_months'] != expected['duration_months']:
                issues_found.append(f"Duration mismatch for {plan['plan_id']}")
                await db.pricing_plans.update_one(
                    {"plan_id": plan['plan_id']},
                    {"$set": {"duration_months": expected['duration_months']}}
                )
                print(f"📅 Fixed duration for {plan['plan_id']}: {expected['duration_months']} months")
    
    # Final validation
    final_plans = await db.pricing_plans.find().to_list(1000)
    print(f"\n✅ Final state: {len(final_plans)} pricing plans")
    for plan in final_plans:
        print(f"   - {plan['plan_id']}: {plan['name']} (₹{plan['price']/100:,.0f} for {plan['duration_months']} months)")
    
    if issues_found:
        print(f"\n🔧 Fixed {len(issues_found)} issues:")
        for issue in issues_found:
            print(f"   - {issue}")
    else:
        print("\n🎉 No issues found - pricing integrity is perfect!")
    
    return len(issues_found) == 0

if __name__ == "__main__":
    asyncio.run(validate_pricing_integrity())