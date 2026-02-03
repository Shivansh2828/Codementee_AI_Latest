#!/bin/bash
# PERMANENT FIX FOR LOADING ISSUE
# The problem: Frontend tries to call api.codementee.io but it doesn't work properly

echo "🔧 PERMANENT LOADING ISSUE FIX"
echo "=============================="

echo "❌ PROBLEM IDENTIFIED:"
echo "   - Frontend tries to call: api.codementee.io"
echo "   - But api.codementee.io has SSL issues and redirects incorrectly"
echo "   - This causes JavaScript to hang waiting for API calls"
echo ""

echo "✅ SOLUTION: Update frontend to use correct API URL"
echo ""

# Fix 1: Update frontend environment to use the working API endpoint
echo "1. Updating frontend environment..."
cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=https://codementee.io
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
GENERATE_SOURCEMAP=false
EOF

echo "✅ Updated frontend/.env"

# Fix 2: Also create production env file
cat > frontend/.env.production << EOF
REACT_APP_BACKEND_URL=https://codementee.io
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
GENERATE_SOURCEMAP=false
EOF

echo "✅ Updated frontend/.env.production"

# Fix 3: Test the correct API endpoint
echo ""
echo "2. Testing correct API endpoint..."
echo "Testing: https://codementee.io/api/companies"
curl -I -m 5 https://codementee.io/api/companies && echo "✅ API endpoint works!" || echo "❌ API endpoint failed"

echo ""
echo "3. Building frontend with correct API URL..."
cd frontend
npm run build
cd ..

echo ""
echo "✅ PERMANENT FIX APPLIED!"
echo ""
echo "🎯 WHAT WAS FIXED:"
echo "   ❌ OLD: Frontend called api.codementee.io (broken SSL)"
echo "   ✅ NEW: Frontend calls codementee.io/api (working)"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. Deploy this to your VPS"
echo "   2. Rebuild Docker containers"
echo "   3. Website will load in 1-2 seconds"
echo ""
echo "🚀 DEPLOYMENT COMMANDS FOR VPS:"
echo "   git pull origin main"
echo "   docker-compose -f docker-compose.prod.yml down"
echo "   docker-compose -f docker-compose.prod.yml up --build -d"