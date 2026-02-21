#!/bin/bash

# Codementee Production Deployment Script
# Run this on VPS after pushing code changes

set -e  # Exit on error

echo "=========================================="
echo "Codementee Production Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running on VPS
if [ ! -d "/var/www/codementee" ]; then
    echo "Error: This script must run on the VPS"
    exit 1
fi

cd /var/www/codementee

# Step 1: Pull latest code
echo -e "${YELLOW}Step 1: Pulling latest code...${NC}"
git pull origin main

# Step 2: Check what changed
FRONTEND_CHANGED=$(git diff HEAD@{1} --name-only | grep -c "^frontend/" || true)
BACKEND_CHANGED=$(git diff HEAD@{1} --name-only | grep -c "^backend/" || true)

echo ""
echo "Changes detected:"
echo "  Frontend: $FRONTEND_CHANGED files"
echo "  Backend: $BACKEND_CHANGED files"
echo ""

# Step 3: Deploy frontend if changed
if [ "$FRONTEND_CHANGED" -gt 0 ]; then
    echo -e "${YELLOW}Step 2: Deploying frontend...${NC}"
    cd frontend
    
    # Install dependencies if package.json changed
    if git diff HEAD@{1} --name-only | grep -q "package.json"; then
        echo "Installing dependencies..."
        yarn install
    fi
    
    # Clear cache and old build
    echo "Clearing cache and old build..."
    rm -rf build
    rm -rf node_modules/.cache
    
    # Build
    echo "Building frontend..."
    yarn build
    
    # Restart frontend service
    echo "Restarting frontend service..."
    systemctl restart codementee-frontend
    
    cd ..
    echo -e "${GREEN}✓ Frontend deployed${NC}"
else
    echo "Skipping frontend (no changes)"
fi

# Step 4: Deploy backend if changed
if [ "$BACKEND_CHANGED" -gt 0 ]; then
    echo -e "${YELLOW}Step 3: Deploying backend...${NC}"
    
    # Install dependencies if requirements.txt changed
    if git diff HEAD@{1} --name-only | grep -q "requirements.txt"; then
        echo "Installing dependencies..."
        cd backend
        pip install -r requirements.txt
        cd ..
    fi
    
    # Restart backend service
    echo "Restarting backend..."
    systemctl restart codementee-backend
    
    echo -e "${GREEN}✓ Backend deployed${NC}"
else
    echo "Skipping backend (no changes)"
fi

# Step 5: Reload Nginx
echo -e "${YELLOW}Step 4: Reloading Nginx...${NC}"
nginx -t && systemctl reload nginx

# Step 6: Verify deployment
echo ""
echo -e "${YELLOW}Step 5: Verifying deployment...${NC}"
sleep 2

# Check services
NGINX_STATUS=$(systemctl is-active nginx)
BACKEND_STATUS=$(systemctl is-active codementee-backend)

echo "Service Status:"
echo "  Nginx: $NGINX_STATUS"
echo "  Backend: $BACKEND_STATUS"

# Test API
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://codementee.io/api/companies)
echo "  API Test: HTTP $API_TEST"

# Test Frontend
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://codementee.io)
echo "  Frontend Test: HTTP $FRONTEND_TEST"

echo ""
if [ "$NGINX_STATUS" = "active" ] && [ "$BACKEND_STATUS" = "active" ] && [ "$API_TEST" = "200" ] && [ "$FRONTEND_TEST" = "200" ]; then
    echo -e "${GREEN}=========================================="
    echo "✅ Deployment Successful!"
    echo "==========================================${NC}"
    echo ""
    echo "Your site is live at: https://codementee.io"
else
    echo "⚠️  Warning: Some checks failed"
    echo "Check logs:"
    echo "  journalctl -u codementee-backend -n 50"
    echo "  tail -f /var/log/nginx/error.log"
fi

echo ""
