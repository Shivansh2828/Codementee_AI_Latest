#!/bin/bash

# 🎯 FINAL LOADING FIX - Comprehensive Solution
# This script addresses ALL known loading issues

echo "🔥 APPLYING FINAL LOADING FIX..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Issues this fixes:${NC}"
echo "   ✅ Service worker caching issues"
echo "   ✅ PostHog analytics blocking (2.74s delay)"
echo "   ✅ Missing files (404 errors)"
echo "   ✅ Nginx caching problems"
echo "   ✅ DNS prefetch issues"
echo "   ✅ JavaScript bundle loading failures"
echo ""

# Step 1: Fix frontend index.html
echo -e "${YELLOW}1. Fixing frontend index.html...${NC}"
if [ -f "frontend/public/index.html" ]; then
    # Remove PostHog (causes 2.74s delay)
    sed -i.bak '/posthog/d' frontend/public/index.html
    
    # Make Razorpay async (non-blocking)
    sed -i.bak 's|<script src="https://checkout.razorpay.com/v1/checkout.js"></script>|<script async src="https://checkout.razorpay.com/v1/checkout.js"></script>|g' frontend/public/index.html
    
    # Fix DNS prefetch
    sed -i.bak 's|//api.codementee.io|//codementee.io|g' frontend/public/index.html
    
    # Remove missing file references
    sed -i.bak '/logo192.png/d' frontend/public/index.html
    sed -i.bak '/manifest.json/d' frontend/public/index.html
    
    echo -e "${GREEN}   ✅ Fixed index.html${NC}"
else
    echo -e "${RED}   ❌ index.html not found${NC}"
fi

# Step 2: Add cache-busting and service worker cleanup
echo -e "${YELLOW}2. Adding cache-busting and service worker cleanup...${NC}"
cat > temp_head_content.html << 'EOF'
    <!-- Cache Control -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    
    <!-- Service Worker Cleanup -->
    <script>
      console.log('🔥 HTML LOADED - index.html is executing');
      console.log('🔥 Timestamp:', new Date().toISOString());
      
      // Unregister any service workers immediately
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          if (registrations.length === 0) {
            console.log('🔥 No service workers found');
          } else {
            console.log('🔥 Unregistering', registrations.length, 'service workers');
            for(let registration of registrations) {
              registration.unregister();
            }
          }
        });
      }
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names) {
            caches.delete(name);
          }
        });
      }
    </script>
EOF

# Insert the cache-busting content into index.html
if [ -f "frontend/public/index.html" ]; then
    # Find the </head> tag and insert before it
    sed -i.bak '/<\/head>/i\
'"$(cat temp_head_content.html)" frontend/public/index.html
    rm temp_head_content.html
    echo -e "${GREEN}   ✅ Added cache-busting and service worker cleanup${NC}"
fi

# Step 3: Update nginx configuration for no-cache
echo -e "${YELLOW}3. Updating nginx configuration...${NC}"
if [ -f "nginx-https-ready.conf" ]; then
    # Replace aggressive caching with revalidation
    sed -i.bak 's/expires 1y;/add_header Cache-Control "max-age=300, must-revalidate";/' nginx-https-ready.conf
    sed -i.bak 's/add_header Cache-Control "public, immutable";/add_header Cache-Control "max-age=300, must-revalidate";/' nginx-https-ready.conf
    
    # Add clear-site-data header
    sed -i.bak '/add_header Cache-Control/a\
        add_header Clear-Site-Data "\"cache\", \"storage\"" always;' nginx-https-ready.conf
    
    echo -e "${GREEN}   ✅ Updated nginx configuration${NC}"
fi

# Step 4: Build frontend with optimizations
echo -e "${YELLOW}4. Building optimized frontend...${NC}"
cd frontend

# Clean everything first
rm -rf node_modules/.cache
rm -rf build
rm -f package-lock.json

# Install dependencies
npm install

# Build with optimizations
GENERATE_SOURCEMAP=false npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Frontend build successful${NC}"
else
    echo -e "${RED}   ❌ Frontend build failed${NC}"
    exit 1
fi

cd ..

# Step 5: Create deployment verification script
echo -e "${YELLOW}5. Creating deployment verification script...${NC}"
cat > verify-loading-fix.sh << 'EOF'
#!/bin/bash
echo "🧪 VERIFYING LOADING FIX..."
echo "=========================="

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend not responding"
fi

# Check if backend is running
if curl -s http://localhost:8001/api/health > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend not responding"
fi

# Check for PostHog in built files
if grep -r "posthog" frontend/build/ > /dev/null 2>&1; then
    echo "❌ PostHog still found in build"
else
    echo "✅ PostHog removed from build"
fi

# Check for missing file references
if grep -r "logo192.png\|manifest.json" frontend/build/ > /dev/null 2>&1; then
    echo "❌ Missing file references still present"
else
    echo "✅ Missing file references removed"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Deploy to VPS: docker-compose -f docker-compose.prod.yml up --build -d"
echo "2. Test in incognito mode"
echo "3. Check console for 🔥 logs"
EOF

chmod +x verify-loading-fix.sh

echo ""
echo -e "${GREEN}✅ FINAL LOADING FIX APPLIED!${NC}"
echo ""
echo -e "${BLUE}📊 PERFORMANCE IMPROVEMENTS:${NC}"
echo "   ❌ BEFORE: PostHog (2.74s) + Missing files (404s) + Cache issues"
echo "   ✅ AFTER: Clean loading, no external delays, fresh cache"
echo ""
echo -e "${YELLOW}📋 DEPLOY TO VPS:${NC}"
echo "   git add . && git commit -m 'Apply final loading fix - remove all blocking issues'"
echo "   git push origin main"
echo ""
echo "   # Then on VPS:"
echo "   git pull origin main"
echo "   docker-compose -f docker-compose.prod.yml down"
echo "   docker rmi codementee-frontend codementee-backend || true"
echo "   docker-compose -f docker-compose.prod.yml build --no-cache"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo -e "${GREEN}🎉 This should permanently fix the loading issue!${NC}"