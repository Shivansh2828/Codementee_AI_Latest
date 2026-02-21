#!/bin/bash

# Fix Pricing Updates in Production
# Run this on your Hostinger VPS

set -e

echo "🔧 Fixing Pricing Updates in Production"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running on VPS
if [ ! -d "/var/www/codementee" ]; then
    echo -e "${RED}Error: This script must run on the VPS at /var/www/codementee${NC}"
    exit 1
fi

cd /var/www/codementee

echo -e "${YELLOW}Step 1: Pulling latest code...${NC}"
git pull origin main
echo ""

echo -e "${YELLOW}Step 2: Rebuilding frontend (this clears all caches)...${NC}"
cd frontend

# Remove old build and cache
echo "Removing old build and cache..."
rm -rf build
rm -rf node_modules/.cache

# Rebuild
echo "Building fresh frontend..."
yarn build

cd ..
echo -e "${GREEN}✓ Frontend rebuilt${NC}"
echo ""

echo -e "${YELLOW}Step 3: Restarting services...${NC}"

# Restart frontend service
echo "Restarting frontend service..."
systemctl restart codementee-frontend

# Restart backend service (to pick up any changes)
echo "Restarting backend service..."
systemctl restart codementee-backend

# Reload nginx
echo "Reloading nginx..."
nginx -t && systemctl reload nginx

echo -e "${GREEN}✓ Services restarted${NC}"
echo ""

echo -e "${YELLOW}Step 4: Verifying...${NC}"
sleep 3

# Check services
FRONTEND_STATUS=$(systemctl is-active codementee-frontend)
BACKEND_STATUS=$(systemctl is-active codementee-backend)
NGINX_STATUS=$(systemctl is-active nginx)

echo "Service Status:"
echo "  Frontend: $FRONTEND_STATUS"
echo "  Backend: $BACKEND_STATUS"
echo "  Nginx: $NGINX_STATUS"
echo ""

# Test API
echo "Testing API..."
API_RESPONSE=$(curl -s http://localhost:8001/api/pricing-plans)
PLAN_COUNT=$(echo "$API_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
echo "  Found $PLAN_COUNT pricing plans"
echo ""

if [ "$PLAN_COUNT" -gt 0 ]; then
    echo -e "${GREEN}========================================"
    echo "✅ Fix Applied Successfully!"
    echo "========================================${NC}"
    echo ""
    echo "What was fixed:"
    echo "  1. Frontend rebuilt from scratch (no cache)"
    echo "  2. All services restarted"
    echo "  3. Nginx reloaded"
    echo ""
    echo "Now when you:"
    echo "  1. Update prices in admin dashboard"
    echo "  2. Users just need to refresh the page (F5)"
    echo "  3. Changes will be visible immediately"
    echo ""
    echo "Your site: https://codementee.io"
    echo "Admin: https://codementee.io/admin/pricing"
else
    echo -e "${RED}⚠️  Warning: Could not verify pricing API${NC}"
    echo "Check backend logs:"
    echo "  journalctl -u codementee-backend -n 50"
fi

echo ""
