#!/usr/bin/env python3
"""
Test script to reproduce the payment flow issue
"""
import requests
import json

BASE_URL = "http://localhost:8002"

def test_payment_flow():
    print("🧪 Testing Payment Flow Issue")
    print("=" * 50)
    
    # Step 1: Register a free user
    print("\n1. Registering a free user...")
    register_data = {
        "name": "Test Free User",
        "email": "testfree@example.com",
        "password": "Test@123",
        "current_role": "SDE-1",
        "target_role": "SDE-2"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register-free", json=register_data)
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Free user registered: {user_data['user']['email']}")
            print(f"   Status: {user_data['user']['status']}")
            print(f"   Plan: {user_data['user']['plan_name']}")
            token = user_data['access_token']
        else:
            print(f"❌ Registration failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return
    
    # Step 2: Try to create a payment order (this should work for free users)
    print("\n2. Creating payment order for free user...")
    order_data = {
        "name": "Test Free User",
        "email": "testfree@example.com",
        "password": "Test@123",
        "plan_id": "growth",
        "current_role": "SDE-1",
        "target_role": "SDE-2",
        "timeline": "3-6 months",
        "struggle": "System design"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/payment/create-order", json=order_data)
        if response.status_code == 200:
            order_response = response.json()
            print(f"✅ Payment order created successfully")
            print(f"   Order ID: {order_response['order_id']}")
            print(f"   Amount: ₹{order_response['amount']/100}")
        else:
            print(f"❌ Payment order failed: {response.text}")
            print(f"   Status Code: {response.status_code}")
            
            # Let's check the user status in database
            print("\n🔍 Checking user status...")
            try:
                me_response = requests.get(f"{BASE_URL}/api/auth/me", 
                                         headers={"Authorization": f"Bearer {token}"})
                if me_response.status_code == 200:
                    user_info = me_response.json()
                    print(f"   User Status: {user_info.get('status')}")
                    print(f"   Plan ID: {user_info.get('plan_id')}")
                    print(f"   Plan Name: {user_info.get('plan_name')}")
                else:
                    print(f"   Could not fetch user info: {me_response.text}")
            except Exception as e:
                print(f"   Error fetching user info: {e}")
            
            return
    except Exception as e:
        print(f"❌ Payment order error: {e}")
        return
    
    # Step 3: Test with already paid user
    print("\n3. Testing with already paid user scenario...")
    
    # First, let's create another user and simulate them being paid
    paid_user_data = {
        "name": "Test Paid User",
        "email": "testpaid@example.com",
        "password": "Test@123",
        "current_role": "SDE-1",
        "target_role": "SDE-2"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register-free", json=paid_user_data)
        if response.status_code == 200:
            print("✅ Second user registered")
            
            # Now try to create payment order for the same email again
            print("\n4. Trying to create payment order for existing free user...")
            response2 = requests.post(f"{BASE_URL}/api/payment/create-order", json={
                "name": "Test Paid User",
                "email": "testpaid@example.com",
                "password": "Test@123",
                "plan_id": "growth",
                "current_role": "SDE-1",
                "target_role": "SDE-2",
                "timeline": "3-6 months",
                "struggle": "System design"
            })
            
            if response2.status_code == 200:
                print("✅ Second payment order also created successfully")
                print("   This confirms free users can upgrade multiple times")
            else:
                print(f"❌ Second payment order failed: {response2.text}")
                
        else:
            print(f"❌ Second user registration failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Second user test error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Test completed!")

if __name__ == "__main__":
    test_payment_flow()