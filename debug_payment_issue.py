#!/usr/bin/env python3
"""
Debug script to find the exact cause of the payment issue
"""
import requests
import json

BASE_URL = "http://localhost:8002"

def debug_user_states():
    print("🔍 Debugging Payment Issue - User States")
    print("=" * 60)
    
    # Test 1: Try to register the same email twice (this should fail)
    print("\n1. Testing duplicate free registration...")
    register_data = {
        "name": "Debug User",
        "email": "debug@example.com",
        "password": "Test@123",
        "current_role": "SDE-1",
        "target_role": "SDE-2"
    }
    
    # First registration
    response1 = requests.post(f"{BASE_URL}/api/auth/register-free", json=register_data)
    if response1.status_code == 200:
        print("✅ First registration successful")
        user_data = response1.json()
        token = user_data['access_token']
    else:
        print(f"❌ First registration failed: {response1.text}")
        return
    
    # Second registration with same email
    response2 = requests.post(f"{BASE_URL}/api/auth/register-free", json=register_data)
    if response2.status_code == 400:
        print(f"✅ Second registration correctly rejected: {response2.json()['detail']}")
    else:
        print(f"❌ Second registration should have failed but got: {response2.status_code}")
    
    # Test 2: Check user info
    print("\n2. Checking user information...")
    me_response = requests.get(f"{BASE_URL}/api/auth/me", 
                              headers={"Authorization": f"Bearer {token}"})
    if me_response.status_code == 200:
        user_info = me_response.json()
        print(f"   Email: {user_info.get('email')}")
        print(f"   Status: {user_info.get('status')}")
        print(f"   Plan ID: {user_info.get('plan_id')}")
        print(f"   Plan Name: {user_info.get('plan_name')}")
    else:
        print(f"❌ Could not fetch user info: {me_response.text}")
        return
    
    # Test 3: Try payment order creation
    print("\n3. Testing payment order creation...")
    order_data = {
        "name": "Debug User",
        "email": "debug@example.com",
        "password": "Test@123",
        "plan_id": "growth",
        "current_role": "SDE-1",
        "target_role": "SDE-2",
        "timeline": "3-6 months",
        "struggle": "System design"
    }
    
    response = requests.post(f"{BASE_URL}/api/payment/create-order", json=order_data)
    if response.status_code == 200:
        print("✅ Payment order created successfully")
        order_data = response.json()
        print(f"   Order ID: {order_data['order_id']}")
    else:
        print(f"❌ Payment order failed: {response.text}")
        print(f"   Status Code: {response.status_code}")
    
    # Test 4: Try to create payment order again
    print("\n4. Testing duplicate payment order creation...")
    response = requests.post(f"{BASE_URL}/api/payment/create-order", json=order_data)
    if response.status_code == 200:
        print("✅ Second payment order also created (this is expected for free users)")
    else:
        print(f"❌ Second payment order failed: {response.text}")
    
    # Test 5: Simulate a paid user scenario
    print("\n5. Testing paid user scenario...")
    
    # Let's manually check what happens if we try to use the existing test users
    test_emails = ["admin@codementee.com", "mentor@codementee.com", "mentee@codementee.com"]
    
    for email in test_emails:
        print(f"\n   Testing with {email}...")
        test_order_data = {
            "name": "Test User",
            "email": email,
            "password": "Test@123",
            "plan_id": "growth",
            "current_role": "SDE-1",
            "target_role": "SDE-2",
            "timeline": "3-6 months",
            "struggle": "System design"
        }
        
        response = requests.post(f"{BASE_URL}/api/payment/create-order", json=test_order_data)
        if response.status_code == 200:
            print(f"   ✅ Payment order created for {email}")
        else:
            print(f"   ❌ Payment order failed for {email}: {response.json().get('detail', response.text)}")
    
    print("\n" + "=" * 60)
    print("🎯 Debug completed!")

if __name__ == "__main__":
    debug_user_states()