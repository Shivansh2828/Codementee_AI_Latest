#!/bin/bash
# Fix First Load Issue - JavaScript Not Loading on First Try

set -e

echo "🔥 FIXING FIRST LOAD ISSUE"
echo "=========================="
echo ""
echo "Issue: First load shows blank page with no console logs"
echo "Cause: JavaScript bundle not loading on first try"
echo "Fix: Remove caching, add service worker cleanup, improve file serving"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Changes Made:${NC}"
echo "1. ✅ Added cache-control meta tags to index.html"
echo "2. ✅ Added service worker unregistration script"
echo "3. ✅ Added immediate HTML load logging (🔥 prefix)"
echo "4. ✅ Updated nginx to prevent aggressive caching"
echo "5. ✅ Improved nginx file transfer settings"
echo "6. ✅ Added Clear-Site-Data header"
echo ""

echo -e "${BLUE}Step 1: Committing changes...${NC}"
git add frontend/public/index.html frontend/nginx.conf
git commit -m "fix: Resolve first load issue - JS not loading on initial page load

- Add cache-control meta tags to prevent stale cache
- Add service worker unregistration to clear old caches
- Add immediate HTML load logging for debugging
- Update nginx to prevent aggressive JS/CSS caching
- Improve nginx buffer sizes for large JS files
- Add Clear-Site-Data header to force cache clear" || echo "No changes to commit"

echo ""
echo -e "${BLUE}Step 2: Pushing to repository...${NC}"
git push origin main

echo ""
echo -e "${GREEN}✅ Code changes pushed!${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}  NOW RUN THESE COMMANDS ON YOUR VPS:${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}# 1. Navigate to project${NC}"
echo "cd /var/www/codementee"
echo ""
echo -e "${GREEN}# 2. Pull latest changes${NC}"
echo "git pull origin main"
echo ""
echo -e "${GREEN}# 3. Stop containers${NC}"
echo "docker-compose -f docker-compose.prod.yml down"
echo ""
echo -e "${GREEN}# 4. Remove old images (IMPORTANT!)${NC}"
echo "docker rmi codementee-frontend codementee-backend || true"
echo ""
echo -e "${GREEN}# 5. Clear Docker build cache${NC}"
echo "docker builder prune -f"
echo ""
echo -e "${GREEN}# 6. Rebuild with no cache${NC}"
echo "docker-compose -f docker-compose.prod.yml build --no-cache frontend"
echo "docker-compose -f docker-compose.prod.yml build backend"
echo ""
echo -e "${GREEN}# 7. Start containers${NC}"
echo "docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo -e "${GREEN}# 8. Wait for startup${NC}"
echo "sleep 15"
echo ""
echo -e "${GREEN}# 9. Verify containers${NC}"
echo "docker ps"
echo ""
echo -e "${GREEN}# 10. Check logs${NC}"
echo "docker logs codementee-frontend --tail 30"
echo ""
echo -e "${GREEN}# 11. Test the site${NC}"
echo "curl -I http://localhost:3000"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 After Deployment - Testing Steps:${NC}"
echo ""
echo "1. ${YELLOW}Clear your browser cache completely${NC}"
echo "   - Chrome: Ctrl+Shift+Delete → Clear all"
echo "   - Firefox: Ctrl+Shift+Delete → Clear all"
echo ""
echo "2. ${YELLOW}Open browser in Incognito/Private mode${NC}"
echo "   - This ensures no cached files"
echo ""
echo "3. ${YELLOW}Open DevTools BEFORE loading page${NC}"
echo "   - Press F12 first"
echo "   - Go to Console tab"
echo ""
echo "4. ${YELLOW}Load https://codementee.io${NC}"
echo "   - You should see: 🔥 HTML LOADED immediately"
echo "   - Then see: 🚀 INDEX.JS messages"
echo "   - Page should load on FIRST try"
echo ""
echo "5. ${YELLOW}Check Network tab${NC}"
echo "   - main.*.js should show Status: 200"
echo "   - Size should be ~716KB"
echo "   - No partial transfer errors"
echo ""
echo "6. ${YELLOW}Test multiple times${NC}"
echo "   - Close browser completely"
echo "   - Reopen and test again"
echo "   - Should work every time"
echo ""
echo -e "${RED}IMPORTANT:${NC} If you still see issues:"
echo "1. Check if you see '🔥 HTML LOADED' in console"
echo "   - YES: HTML loads, JS doesn't → Docker/nginx issue"
echo "   - NO: HTML doesn't load → DNS/proxy issue"
echo ""
echo "2. Check Network tab for main.*.js file"
echo "   - Status 200: File loads successfully"
echo "   - Status 304: Cached (clear cache)"
echo "   - Failed/Pending: File not loading"
echo ""
echo -e "${GREEN}✅ Ready to deploy!${NC}"