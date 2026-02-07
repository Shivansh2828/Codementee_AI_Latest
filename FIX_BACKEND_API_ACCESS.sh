#!/bin/bash
# Fix Backend API Access Issue

echo "🔧 FIXING BACKEND API ACCESS"
echo "============================="
echo ""
echo "Issue: Frontend can't reach backend API"
echo "Fix: Update nginx to proxy /api requests to backend"
echo ""

cd /var/www/codementee || exit 1

echo "Step 1: Pulling latest changes..."
git pull origin main
echo "✅ Code pulled"
echo ""

echo "Step 2: Stopping containers..."
docker-compose -f docker-compose.prod.yml down
echo "✅ Containers stopped"
echo ""

echo "Step 3: Removing old frontend image (needs rebuild with new env)..."
docker rmi codementee-frontend || true
echo "✅ Old image removed"
echo ""

echo "Step 4: Rebuilding frontend with correct backend URL..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend
echo "✅ Frontend rebuilt"
echo ""

echo "Step 5: Starting all containers..."
docker-compose -f docker-compose.prod.yml up -d
echo "✅ Containers started"
echo ""

echo "Step 6: Waiting for startup..."
sleep 15
echo ""

echo "Step 7: Checking containers..."
docker ps | grep codementee
echo ""

echo "Step 8: Testing backend directly..."
echo "Companies endpoint:"
curl -s http://localhost:8001/api/companies | head -c 100
echo "..."
echo ""

echo "Step 9: Testing through nginx proxy..."
echo "Testing: http://localhost/api/companies"
curl -s http://localhost/api/companies | head -c 100
echo "..."
echo ""

echo "Step 10: Testing pricing endpoint..."
echo "Testing: http://localhost/api/pricing-plans"
curl -s http://localhost/api/pricing-plans | head -c 100
echo "..."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Test in browser:"
echo "   1. Open https://codementee.io"
echo "   2. Open DevTools (F12) → Network tab"
echo "   3. Try to login or view pricing"
echo "   4. Check that /api requests return 200 OK"
echo ""
echo "Expected behavior:"
echo "  ✅ Pricing page shows plans"
echo "  ✅ Login works"
echo "  ✅ Register works"
echo "  ✅ No CORS errors in console"
