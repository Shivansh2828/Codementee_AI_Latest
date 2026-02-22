#!/bin/bash

# Quick deployment script for pricing sync feature

echo "🚀 Deploying Pricing Sync Feature"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Commit and push
echo -e "${YELLOW}Step 1: Committing and pushing code...${NC}"
git add .
git commit -m "Add admin pricing sync feature with cache-busting"
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to push code. Check git status.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Code pushed to GitHub${NC}"
echo ""

# Step 2: Deploy to VPS
echo -e "${YELLOW}Step 2: Deploying to VPS...${NC}"
echo "This will:"
echo "  - Pull latest code"
echo "  - Rebuild frontend"
echo "  - Restart services"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# SSH and deploy
ssh root@62.72.13.129 << 'ENDSSH'
cd /var/www/codementee
echo "Pulling latest code..."
git pull origin main
echo ""
echo "Running deployment script..."
./deploy.sh
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=================================="
    echo "✅ Deployment Successful!"
    echo "==================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open https://codementee.io/admin/pricing"
    echo "2. Look for 'Sync to Website' button"
    echo "3. Edit a price and save"
    echo "4. Watch the auto-sync happen"
    echo "5. Check main website in incognito window"
    echo ""
else
    echo -e "${RED}Deployment failed. Check VPS logs.${NC}"
    exit 1
fi
