#!/bin/bash
# DEBUG WHY DEPLOYMENT ISN'T WORKING

echo "🔍 DEBUGGING DEPLOYMENT ISSUE"
echo "============================="
echo ""

echo "1. CHECKING CURRENT DEPLOYED VERSION"
echo "------------------------------------"
echo "Current JS bundle on website:"
curl -s https://codementee.io | grep -o "main\.[^\"]*\.js" | head -1
echo ""

echo "Expected new JS bundle: main.b73ac925.js"
echo ""

echo "2. CHECKING IF POSTHOG IS STILL THERE"
echo "-------------------------------------"
if curl -s https://codementee.io | grep -q "posthog"; then
    echo "❌ PostHog is STILL in the deployed version"
else
    echo "✅ PostHog removed from deployed version"
fi
echo ""

echo "3. CHECKING HTML SIZE"
echo "--------------------"
SIZE=$(curl -s https://codementee.io | wc -c)
echo "Current HTML size: $SIZE bytes"
echo "Expected: Should be different if new version deployed"
echo ""

echo "4. CHECKING DOCKER CONTAINERS STATUS"
echo "------------------------------------"
echo "Testing if containers are running..."
curl -I -m 5 http://62.72.13.129:3000 2>&1 | head -3
echo ""

echo "5. CHECKING BACKEND API"
echo "----------------------"
echo "Testing backend API..."
curl -I -m 5 http://62.72.13.129:8001/api/companies 2>&1 | head -3
echo ""

echo "6. POSSIBLE ISSUES:"
echo "------------------"
echo "❌ Docker containers not rebuilt properly"
echo "❌ Git pull didn't work on VPS"
echo "❌ Nginx caching old version"
echo "❌ Docker using cached layers"
echo "❌ Wrong Docker Compose file"
echo ""

echo "7. NUCLEAR OPTION - COMPLETE RESET"
echo "-----------------------------------"
echo "If nothing else works, try this on VPS:"
echo ""
echo "# Stop everything"
echo "docker-compose -f docker-compose.prod.yml down"
echo "docker system prune -af"
echo "docker volume prune -f"
echo ""
echo "# Remove all images"
echo "docker rmi \$(docker images -q) -f"
echo ""
echo "# Pull latest code"
echo "git fetch --all"
echo "git reset --hard origin/main"
echo ""
echo "# Rebuild everything from scratch"
echo "docker-compose -f docker-compose.prod.yml build --no-cache --pull"
echo "docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "# Wait and test"
echo "sleep 120"
echo "curl -s https://codementee.io | grep -o \"main\.[^\\\"]*\\.js\""