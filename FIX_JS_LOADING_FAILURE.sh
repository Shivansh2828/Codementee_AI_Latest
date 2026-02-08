#!/bin/bash
# Fix JavaScript Loading Failure
# Issue: "Loading failed for the <script> with source"

set -e

echo "🔧 FIXING JAVASCRIPT LOADING FAILURE"
echo "====================================="
echo ""
echo "Issue Identified:"
echo "  ✅ HTML loads (🔥 logs appear)"
echo "  ❌ JavaScript fails to load from server"
echo "  Error: 'Loading failed for the <script>'"
echo ""
echo "Root Cause: Docker container not serving JS files properly"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Changes Made:${NC}"
echo "1. ✅ Updated Dockerfile to verify build output"
echo "2. ✅ Added yarn support (fallback to npm)"
echo "3. ✅ Added nginx error logging"
echo "4. ✅ Improved sendfile configuration for large JS files"
echo "5. ✅ Added explicit file existence check (try_files)"
echo "6. ✅ Added explicit content-type for JS files"
echo "7. ✅ Disabled proxy buffering"
echo ""

echo -e "${BLUE}Step 1: Committing changes...${NC}"
git add frontend/Dockerfile.prod frontend/nginx.conf
git commit -m "fix: Resolve JavaScript loading failure in Docker container

- Add build verification in Dockerfile
- Add yarn support with npm fallback
- Enable nginx debug logging
- Improve sendfile configuration for large JS files
- Add explicit file existence check
- Add explicit content-type headers
- Disable proxy buffering for better streaming

Fixes: 'Loading failed for the <script>' error" || echo "No changes to commit"

echo ""
echo -e "${BLUE}Step 2: Pushing to repository...${NC}"
git push origin main

echo ""
echo -e "${GREEN}✅ Code changes pushed!${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  CRITICAL: RUN THESE COMMANDS ON YOUR VPS NOW${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
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
echo -e "${GREEN}# 4. Remove ALL old images and cache${NC}"
echo "docker rmi codementee-frontend codementee-backend || true"
echo "docker system prune -af"
echo ""
echo -e "${GREEN}# 5. Rebuild frontend with verbose output${NC}"
echo "docker-compose -f docker-compose.prod.yml build --no-cache --progress=plain frontend 2>&1 | tee build.log"
echo ""
echo -e "${YELLOW}⚠️  WATCH THE BUILD OUTPUT CAREFULLY!${NC}"
echo "Look for:"
echo "  - 'Build files verified' message"
echo "  - 'Files copied to nginx successfully' message"
echo "  - List of files in /usr/share/nginx/html/static/js"
echo ""
echo -e "${GREEN}# 6. If build succeeds, rebuild backend${NC}"
echo "docker-compose -f docker-compose.prod.yml build backend"
echo ""
echo -e "${GREEN}# 7. Start containers${NC}"
echo "docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo -e "${GREEN}# 8. Wait for startup${NC}"
echo "sleep 10"
echo ""
echo -e "${GREEN}# 9. Check if files exist in container${NC}"
echo "docker exec codementee-frontend ls -la /usr/share/nginx/html/static/js/"
echo ""
echo -e "${GREEN}# 10. Check nginx error logs${NC}"
echo "docker exec codementee-frontend cat /var/log/nginx/error.log"
echo ""
echo -e "${GREEN}# 11. Test file directly${NC}"
echo "docker exec codementee-frontend cat /usr/share/nginx/html/static/js/main.*.js | head -c 100"
echo ""
echo -e "${GREEN}# 12. Test from outside container${NC}"
echo "curl -I http://localhost:3000/static/js/main.7cd765db.js"
echo ""
echo -e "${GREEN}# 13. Check container logs${NC}"
echo "docker logs codementee-frontend --tail 50"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 After Deployment - Browser Test:${NC}"
echo ""
echo "1. Clear browser cache completely"
echo "2. Open DevTools (F12)"
echo "3. Go to Network tab"
echo "4. Load https://codementee.io"
echo "5. Find main.*.js in Network tab"
echo "6. Check:"
echo "   - Status should be 200 (not failed)"
echo "   - Size should be ~716KB"
echo "   - Type should be 'javascript'"
echo ""
echo -e "${RED}If main.js still fails to load:${NC}"
echo ""
echo "Run this diagnostic on VPS:"
echo "  docker exec codementee-frontend sh -c 'ls -la /usr/share/nginx/html/static/js/ && cat /var/log/nginx/error.log'"
echo ""
echo "Then share the output with me."
echo ""
echo -e "${GREEN}✅ Ready to deploy!${NC}"