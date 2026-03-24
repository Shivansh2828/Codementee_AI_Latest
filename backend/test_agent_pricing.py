#!/usr/bin/env python3
"""
Test script to verify AI Agent pricing plans are accessible via API
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'codementee')

async def test_agent_pricing():
    """Test that AI Agent plans are in database and accessible"""
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🧪 Testing AI Agent Pricing Plans...\n")
    
    # Test 1: Check all pricing plans
    all_plans = await db.pricing_plans.find({"is_active": True}).to_list(length=100)
    print(f"✅ Total active pricing plans: {len(all_plans)}")
    
    # Test 2: Check AI Agent plans specifically
    agent_plans = ["agent_trial", "agent_monthly", "agent_quarterly"]
    print("\n📊 AI Agent Plans:")
    
    for plan_id in agent_plans:
        plan = await db.pricing_plans.find_one({"plan_id": plan_id, "is_active": True})
        if plan:
            print(f"   ✅ {plan_id}:")
            print(f"      Name: {plan['name']}")
            print(f"      INR: ₹{plan.get('price_inr', plan.get('price', 0)) / 100}")
            print(f"      USD: ${plan.get('price_usd', 0) / 100}")
            print(f"      Duration: {plan['duration_months']} month(s)")
            print(f"      Features: {len(plan.get('features', []))} features")
        else:
            print(f"   ❌ {plan_id}: NOT FOUND")
    
    # Test 3: Check mentorship plans
    print("\n📊 Mentorship Plans:")
    mentorship_plans = ["starter", "pro", "elite"]
    
    for plan_id in mentorship_plans:
        plan = await db.pricing_plans.find_one({"plan_id": plan_id, "is_active": True})
        if plan:
            print(f"   ✅ {plan_id}:")
            print(f"      Name: {plan['name']}")
            print(f"      INR: ₹{plan.get('price_inr', plan.get('price', 0)) / 100}")
            print(f"      USD: ${plan.get('price_usd', 0) / 100}")
        else:
            print(f"   ❌ {plan_id}: NOT FOUND")
    
    # Test 4: Verify display order
    print("\n📊 Display Order:")
    sorted_plans = sorted(all_plans, key=lambda x: x.get('display_order', 999))
    for i, plan in enumerate(sorted_plans, 1):
        print(f"   {i}. {plan['plan_id']} (order: {plan.get('display_order', 'N/A')})")
    
    print("\n✅ All tests completed!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_agent_pricing())
