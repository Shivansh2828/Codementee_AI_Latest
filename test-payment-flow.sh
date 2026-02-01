#!/bin/bash

echo "🧪 Testing Payment Flow..."

BASE_URL="http://62.72.13.129:8001/api"

echo ""
echo "1. Testing Backend Health..."
curl -s "$BASE_URL/../health" | jq '.' || echo "❌ Backend health check failed"

echo ""
echo "2. Testing Free User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register-free" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Free User",
    "email": "testfree@example.com",
    "password": "Test123!",
    "current_role": "Student",
    "target_role": "SDE"
  }')

echo "$REGISTER_RESPONSE" | jq '.' || echo "❌ Free registration failed"

echo ""
echo "3. Testing Create Order for Free User Upgrade..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/payment/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Free User",
    "email": "testfree@example.com",
    "password": "Test123!",
    "plan_id": "foundation",
    "current_role": "Student",
    "target_role": "SDE",
    "timeline": "3-6 months",
    "struggle": "Need practice"
  }')

echo "$ORDER_RESPONSE" | jq '.' || echo "❌ Create order failed"

echo ""
echo "4. Testing Create Order for New User..."
NEW_ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/payment/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test New User",
    "email": "testnew@example.com",
    "password": "Test123!",
    "plan_id": "foundation",
    "current_role": "Student",
    "target_role": "SDE",
    "timeline": "3-6 months",
    "struggle": "Need practice"
  }')

echo "$NEW_ORDER_RESPONSE" | jq '.' || echo "❌ Create order for new user failed"

echo ""
echo "5. Testing Frontend Accessibility..."
FRONTEND_STATUS=$(curl -s -I http://62.72.13.129:3000 | head -n 1)
echo "Frontend Status: $FRONTEND_STATUS"

echo ""
echo "6. Testing API Endpoints..."
curl -s "$BASE_URL/companies" | jq '.[:2]' || echo "❌ Companies endpoint failed"

echo ""
echo "✅ Payment flow tests completed!"
echo ""
echo "🔍 Key Points to Verify Manually:"
echo "1. Free user registration works"
echo "2. Free users can start booking process"
echo "3. Payment modal opens with correct details"
echo "4. Payment verification includes order_id"
echo "5. User gets upgraded after successful payment"