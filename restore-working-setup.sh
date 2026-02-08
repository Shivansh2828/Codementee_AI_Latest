#!/bin/bash
# Restore Working Docker Setup and Fix Loading Issues

echo "🔧 Restoring Working Docker Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Stopping any existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down

echo ""
echo -e "${BLUE}2. Cleaning up Docker system...${NC}"
docker system prune -f

echo ""
echo -e "${BLUE}3. Building and starting all containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d --build

echo ""
echo -e "${BLUE}4. Waiting for containers to start...${NC}"
sleep 10

echo ""
echo -e "${BLUE}5. Checking container status...${NC}"
docker ps

echo ""
echo -e "${BLUE}6. Checking container logs...${NC}"
echo -e "${YELLOW}Frontend logs:${NC}"
docker logs codementee-frontend --tail 10

echo ""
echo -e "${YELLOW}Backend logs:${NC}"
docker logs codementee-backend --tail 10

echo ""
echo -e "${BLUE}7. Testing backend API...${NC}"
echo "Testing backend health:"
curl -s http://localhost:8001/api/companies | head -c 100 && echo "..."

echo ""
echo -e "${BLUE}8. Testing frontend container...${NC}"
echo "Testing frontend container response:"
curl -I http://localhost:3000 2>/dev/null | head -3

echo ""
echo -e "${BLUE}9. Checking if main.js file is accessible...${NC}"
# Get the current main.js filename from the built files
MAIN_JS=$(docker exec codementee-frontend find /usr/share/nginx/html/static/js -name "main.*.js" | head -1)
if [ ! -z "$MAIN_JS" ]; then
    echo "Found main.js file: $MAIN_JS"
    echo "Testing file accessibility:"
    docker exec codementee-frontend ls -la "$MAIN_JS"
else
    echo -e "${RED}❌ No main.js file found in container${NC}"
fi

echo ""
echo -e "${BLUE}10. Testing complete website flow...${NC}"
echo "Testing main page:"
curl -s http://localhost:3000 | grep -o '<title>[^<]*</title>' || echo "No title found"

echo ""
echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo -e "${YELLOW}🌐 Test your website now:${NC}"
echo "   - Local: http://localhost:3000"
echo "   - Production: http://62.72.13.129:3000"
echo "   - Domain: https://codementee.io"
echo ""
echo -e "${YELLOW}📊 Debug Information:${NC}"
echo "   - Check browser console for detailed logs"
echo "   - Look for 🚀 prefixed messages in console"
echo "   - Watch for any network errors or timeouts"
echo ""
echo -e "${YELLOW}🔍 If still having issues:${NC}"
echo "   1. Open browser dev tools (F12)"
echo "   2. Go to Console tab"
echo "   3. Refresh the page"
echo "   4. Look for any red errors or failed network requests"
echo "   5. Check if main.js file loads successfully"