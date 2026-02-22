#!/bin/bash

echo "🔍 Checking Production Pricing Setup"
echo "====================================="
echo ""

# Test backend API directly
echo "1️⃣ Testing backend API..."
echo "URL: https://codementee.io/api/pricing-plans"
curl -s https://codementee.io/api/pricing-plans | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'✅ API working! Found {len(data)} plans:')
    for plan in data:
        print(f'  - {plan[\"name\"]}: ₹{plan[\"price\"]/100:,.0f}')
except:
    print('❌ API not working or returned invalid JSON')
" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Backend API is not accessible"
    echo ""
    echo "Trying HTTP..."
    curl -s http://62.72.13.129:8001/api/pricing-plans | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'✅ HTTP API working! Found {len(data)} plans')
except:
    print('❌ HTTP API also not working')
"
fi

echo ""
echo "2️⃣ Checking frontend build..."
echo "Looking for REACT_APP_BACKEND_URL in production build..."

# This needs to be run on VPS
echo ""
echo "⚠️  To check on VPS, run:"
echo "ssh root@62.72.13.129"
echo "cd /var/www/codementee/frontend/build"
echo "grep -r 'REACT_APP_BACKEND_URL' . || echo 'Not found in build'"
echo "grep -r '62.72.13.129' . | head -5"
echo ""

echo "3️⃣ What to check:"
echo "  - Is nginx proxying /api to backend?"
echo "  - Is backend accessible via HTTPS?"
echo "  - Is frontend build using correct backend URL?"
echo ""
