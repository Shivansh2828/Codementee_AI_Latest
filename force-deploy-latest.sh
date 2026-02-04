#!/bin/bash
# FORCE DEPLOY LATEST VERSION
# The issue: VPS is serving old cached version

echo "🚀 FORCE DEPLOYING LATEST VERSION"
echo "================================="
echo ""

echo "❌ PROBLEM IDENTIFIED:"
echo "   - VPS is serving OLD version of website"
echo "   - HTML is only 2,556 bytes (should be ~4,500)"
echo "   - JavaScript bundle is old version (main.624b92ee.js)"
echo "   - New optimizations not deployed"
echo ""

echo "✅ SOLUTION: Force deploy latest version"
echo ""

# Step 1: Build latest version locally
echo "1. Building latest optimized version..."
cd frontend
npm run build
cd ..

echo "✅ Built latest version"
echo ""

# Step 2: Check what we built
echo "2. Verifying new build..."
if [ -f "frontend/build/index.html" ]; then
    SIZE=$(wc -c < frontend/build/index.html)
    echo "✅ New index.html size: $SIZE bytes"
    
    # Check if PostHog is removed
    if grep -q "posthog" frontend/build/index.html; then
        echo "❌ PostHog still present in build"
    else
        echo "✅ PostHog removed from build"
    fi
    
    # Check if Razorpay is async
    if grep -q "async.*razorpay" frontend/build/index.html; then
        echo "✅ Razorpay is async"
    else
        echo "❌ Razorpay not async"
    fi
else
    echo "❌ Build failed - no index.html found"
    exit 1
fi

echo ""
echo "3. New JavaScript bundle info..."
JS_FILES=$(ls frontend/build/static/js/main.*.js 2>/dev/null)
if [ ! -z "$JS_FILES" ]; then
    for file in $JS_FILES; do
        SIZE=$(wc -c < "$file")
        FILENAME=$(basename "$file")
        echo "✅ JS Bundle: $FILENAME ($SIZE bytes)"
    done
else
    echo "❌ No JS bundle found"
fi

echo ""
echo "🎯 DEPLOYMENT COMMANDS FOR VPS:"
echo "================================"
echo ""
echo "# SSH to your VPS and run these commands:"
echo "ssh codementee@62.72.13.129"
echo ""
echo "# Navigate to project"
echo "cd /var/www/codementee"
echo ""
echo "# Pull latest code"
echo "git pull origin main"
echo ""
echo "# FORCE rebuild containers (no cache)"
echo "docker-compose -f docker-compose.prod.yml down"
echo "docker system prune -af"
echo "docker-compose -f docker-compose.prod.yml build --no-cache"
echo "docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "# Wait 60 seconds then test"
echo "sleep 60"
echo "curl -I https://codementee.io"
echo ""
echo "🎯 EXPECTED RESULTS AFTER DEPLOYMENT:"
echo "- HTML size: ~2,800+ bytes (larger than current 2,556)"
echo "- New JS bundle filename (not main.624b92ee.js)"
echo "- No PostHog analytics blocking"
echo "- Website loads in <1 second"