#!/bin/bash
# FINAL FIX FOR LOADING ISSUES
# This script addresses all identified problems:
# 1. Missing logo192.png and manifest.json references
# 2. Docker container file serving issues
# 3. Intermittent loading problems

set -e  # Exit on any error

echo "🔧 FINAL LOADING FIX - Comprehensive Solution"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Issues being fixed:${NC}"
echo "   ✓ Missing logo192.png reference (404 error)"
echo "   ✓ Missing manifest.json reference"
echo "   ✓ Docker container file serving"
echo "   ✓ Intermittent loading problems"
echo ""

echo -e "${BLUE}Step 1: Committing code changes...${NC}"
git add frontend/public/index.html
git commit -m "fix: Remove missing logo192.png and manifest.json references causing 404 errors" || echo "No changes to commit"

echo ""
echo -e "${BLUE}Step 2: Pushing changes to repository...${NC}"
git push origin main

echo ""
echo -e "${YELLOW}⚠️  Now SSH into your VPS and run the following commands:${NC}"
echo ""
echo -e "${GREEN}# 1. Navigate to project directory${NC}"
echo "cd /var/www/codementee"
echo ""
echo -e "${GREEN}# 2. Pull latest changes${NC}"
echo "git pull origin main"
echo ""
echo -e "${GREEN}# 3. Stop existing containers${NC}"
echo "docker-compose -f docker-compose.prod.yml down"
echo ""
echo -e "${GREEN}# 4. Remove old images to force rebuild${NC}"
echo "docker rmi codementee-frontend codementee-backend || true"
echo ""
echo -e "${GREEN}# 5. Build and start containers with no cache${NC}"
echo "docker-compose -f docker-compose.prod.yml build --no-cache"
echo "docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo -e "${GREEN}# 6. Wait for containers to start${NC}"
echo "sleep 15"
echo ""
echo -e "${GREEN}# 7. Check container status${NC}"
echo "docker ps"
echo ""
echo -e "${GREEN}# 8. Check frontend logs${NC}"
echo "docker logs codementee-frontend --tail 20"
echo ""
echo -e "${GREEN}# 9. Check backend logs${NC}"
echo "docker logs codementee-backend --tail 20"
echo ""
echo -e "${GREEN}# 10. Test the website${NC}"
echo "curl -I http://localhost:3000"
echo "curl -I http://localhost:8001/api/companies"
echo ""
echo -e "${GREEN}# 11. Test main.js file${NC}"
echo "curl -I http://localhost:3000/static/js/main.*.js"
echo ""
echo -e "${YELLOW}📊 After deployment, test in browser:${NC}"
echo "   1. Open https://codementee.io"
echo "   2. Open browser DevTools (F12)"
echo "   3. Go to Console tab"
echo "   4. Look for 🚀 prefixed debug messages"
echo "   5. Check Network tab for any failed requests"
echo "   6. Verify no 404 errors for logo192.png"
echo ""
echo -e "${BLUE}✅ Local changes committed and pushed!${NC}"
echo -e "${YELLOW}⚠️  Now run the commands above on your VPS${NC}"