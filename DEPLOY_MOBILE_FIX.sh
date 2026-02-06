#!/bin/bash
# Deploy Mobile Loading Fix
# This fixes the 716KB bundle issue by splitting into smaller chunks

echo "📱 DEPLOYING MOBILE LOADING FIX"
echo "==============================="
echo ""
echo "Issue: 716KB JavaScript bundle too large for mobile"
echo "Fix: Code splitting into smaller chunks"
echo ""

cd /var/www/codementee || exit 1

echo "Step 1: Pulling latest code..."
git pull origin main
echo "✅ Code pulled"
echo ""

echo "Step 2: Stopping containers..."
docker-compose -f docker-compose.prod.yml down
echo "✅ Containers stopped"
echo ""

echo "Step 3: Removing old frontend image..."
docker rmi codementee-frontend 2>/dev/null || echo "No old image"
echo "✅ Old image removed"
echo ""

echo "Step 4: Building frontend with code splitting..."
echo "⚠️  This will take 2-3 minutes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.prod.yml build --no-cache frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Frontend built"
echo ""

echo "Step 5: Starting containers..."
docker-compose -f docker-compose.prod.yml up -d
echo "✅ Containers started"
echo ""

echo "Step 6: Waiting for startup..."
sleep 15
echo ""

echo "Step 7: Verifying code splitting worked..."
echo "Checking JS files in container:"
docker exec codementee-frontend ls -lh /usr/share/nginx/html/static/js/ | grep "\.js$"
echo ""

echo "Step 8: Counting JS files..."
FILE_COUNT=$(docker exec codementee-frontend ls /usr/share/nginx/html/static/js/*.js 2>/dev/null | wc -l)
echo "Found $FILE_COUNT JavaScript files"
echo ""

if [ "$FILE_COUNT" -gt 1 ]; then
    echo "✅ Code splitting SUCCESS! Multiple JS files created."
    echo ""
    echo "Expected files:"
    echo "  - vendor.*.js (React, Router)"
    echo "  - ui.*.js (UI components)"
    echo "  - commons.*.js (other libraries)"
    echo "  - main.*.js (your code)"
    echo "  - runtime.*.js (webpack runtime)"
else
    echo "⚠️  WARNING: Only 1 JS file found. Code splitting may not have worked."
    echo "Check build logs for errors."
fi
echo ""

echo "Step 9: Testing services..."
echo "Frontend:"
curl -I http://localhost:3000 2>&1 | head -3
echo ""
echo "Backend:"
curl -I http://localhost:8001/api/companies 2>&1 | head -3
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 TEST ON MOBILE NOW:"
echo "1. Clear browser cache on mobile"
echo "2. Open in Incognito mode"
echo "3. Load https://codementee.io"
echo "4. Should load on FIRST try (no multiple refreshes)"
echo "5. Check DevTools Network tab - multiple small JS files"
echo ""
echo "Expected behavior:"
echo "  - Multiple JS files load (not just one)"
echo "  - Each file < 200KB"
echo "  - Total load time < 5 seconds on 3G"
echo "  - Works on first load (no refresh needed)"
