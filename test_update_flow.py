#!/usr/bin/env python3
"""
Test the complete update flow:
1. Check current price in DB
2. Update via API
3. Check updated price in DB
4. Check public API returns updated price
"""
import asyncio
import requests
import json
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']
backend_url = 'http://localhost:8001'

# Admin credentials
ADMIN_EMAIL = 'admin@codementee.com'
ADMIN_PASSWORD = 'Admin@123'

async def check_db_price(plan_id):
    """Check price directly in database"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    plan = await db.pricing_plans.find_one({'plan_id': plan_id})
    client.close()
    if plan:
        return plan['price'] / 100
    return None

def get_admin_token():
    """Login as admin and get token"""
    response = requests.post(
        f'{backend_url}/api/auth/login',
        json={'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()['access_token']
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def update_price_via_api(token, plan_id, new_price):
    """Update price via admin API"""
    headers = {'Authorization': f'Bearer {token}'}
    data = {
        'price': int(new_price * 100)  # Convert to paise
    }
    response = requests.put(
        f'{backend_url}/api/admin/pricing-plans/{plan_id}',
        json=data,
        headers=headers
    )
    return response.status_code == 200

def get_public_pricing():
    """Get pricing from public API"""
    response = requests.get(f'{backend_url}/api/pricing-plans')
    if response.status_code == 200:
        return response.json()
    return None

async def main():
    print("🔍 Testing Complete Update Flow")
    print("=" * 50)
    
    # Test with starter plan
    plan_id = 'starter'
    test_price = 3499  # New test price
    
    # Step 1: Check current price in DB
    print(f"\n1️⃣ Checking current price in database...")
    current_price = await check_db_price(plan_id)
    print(f"   Current price: ₹{current_price:,.0f}")
    
    # Step 2: Login as admin
    print(f"\n2️⃣ Logging in as admin...")
    token = get_admin_token()
    if not token:
        print("   ❌ Failed to get admin token")
        return
    print(f"   ✅ Got admin token")
    
    # Step 3: Update price via API
    print(f"\n3️⃣ Updating price to ₹{test_price:,.0f} via API...")
    success = update_price_via_api(token, plan_id, test_price)
    if not success:
        print("   ❌ Failed to update price")
        return
    print(f"   ✅ API update successful")
    
    # Step 4: Check updated price in DB
    print(f"\n4️⃣ Checking updated price in database...")
    await asyncio.sleep(0.5)  # Small delay to ensure DB write completes
    updated_price = await check_db_price(plan_id)
    print(f"   Updated price: ₹{updated_price:,.0f}")
    
    if updated_price == test_price:
        print(f"   ✅ Database updated correctly!")
    else:
        print(f"   ❌ Database NOT updated! Expected ₹{test_price:,.0f}, got ₹{updated_price:,.0f}")
        return
    
    # Step 5: Check public API
    print(f"\n5️⃣ Checking public API response...")
    public_data = get_public_pricing()
    if public_data:
        starter_plan = next((p for p in public_data if p['plan_id'] == plan_id), None)
        if starter_plan:
            api_price = starter_plan['price'] / 100
            print(f"   Public API price: ₹{api_price:,.0f}")
            if api_price == test_price:
                print(f"   ✅ Public API returns correct price!")
            else:
                print(f"   ❌ Public API returns wrong price! Expected ₹{test_price:,.0f}, got ₹{api_price:,.0f}")
        else:
            print(f"   ❌ Plan not found in public API response")
    else:
        print(f"   ❌ Failed to get public API response")
    
    # Step 6: Restore original price
    print(f"\n6️⃣ Restoring original price...")
    restore_success = update_price_via_api(token, plan_id, current_price)
    if restore_success:
        print(f"   ✅ Restored to ₹{current_price:,.0f}")
    else:
        print(f"   ⚠️  Failed to restore original price")
    
    print("\n" + "=" * 50)
    print("✅ Test Complete!")
    print("\nConclusion:")
    print("If all steps passed, the backend is working correctly.")
    print("If frontend still shows old prices, it's a frontend issue.")

if __name__ == "__main__":
    asyncio.run(main())
