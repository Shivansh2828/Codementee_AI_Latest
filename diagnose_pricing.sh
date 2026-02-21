#!/bin/bash

echo "🔍 COMPREHENSIVE PRICING DIAGNOSTIC"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if backend is running
echo "1️⃣ Checking if backend is running..."
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is NOT running!${NC}"
    echo "   Start it with: cd backend && uvicorn server:app --reload"
    exit 1
fi
echo ""

# Step 2: Check database
echo "2️⃣ Checking database..."
python3 backend/check_pricing_db.py
echo ""

# Step 3: Check backend API
echo "3️⃣ Checking backend API..."
echo "Response from http://localhost:8001/api/pricing-plans:"
curl -s http://localhost:8001/api/pricing-plans | python3 -c "
import sys, json
data = json.load(sys.stdin)
for plan in data:
    print(f\"  - {plan['plan_id']}: {plan['name']} = ₹{plan['price']/100:,.0f}\")
"
echo ""

# Step 4: Test update flow
echo "4️⃣ Testing complete update flow..."
python3 test_update_flow.py
echo ""

# Step 5: Check frontend environment
echo "5️⃣ Checking frontend environment..."
echo "Files found:"
ls -la frontend/.env* 2>/dev/null | awk '{print "  " $9}'
echo ""
echo "REACT_APP_BACKEND_URL values:"
for file in frontend/.env frontend/.env.local frontend/.env.production; do
    if [ -f "$file" ]; then
        echo "  $file:"
        grep REACT_APP_BACKEND_URL "$file" | sed 's/^/    /'
    fi
done
echo ""

# Step 6: Check if frontend is running
echo "6️⃣ Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend is NOT running${NC}"
    echo "   Start it with: cd frontend && yarn start"
fi
echo ""

# Step 7: Instructions
echo "===================================="
echo "📋 DIAGNOSTIC SUMMARY"
echo "===================================="
echo ""
echo "If all checks passed above, the backend is working correctly."
echo ""
echo "To test the frontend:"
echo "1. Open: test_frontend_api.html in your browser"
echo "2. Click 'Fetch with Cache Bust' button"
echo "3. Check if prices match the database"
echo ""
echo "If test_frontend_api.html shows correct prices but your React app doesn't:"
echo "1. Stop the React dev server (Ctrl+C)"
echo "2. Clear node_modules/.cache: rm -rf frontend/node_modules/.cache"
echo "3. Restart: cd frontend && yarn start"
echo "4. Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo ""
echo "To update a price and see it immediately:"
echo "1. Go to http://localhost:3000/admin/pricing"
echo "2. Edit a plan and change the price"
echo "3. Save"
echo "4. Open test_frontend_api.html and click 'Fetch with Cache Bust'"
echo "5. You should see the new price immediately"
echo ""
