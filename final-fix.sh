#!/bin/bash
# FINAL FIX - Force new build with different content to change hash

echo "🎯 FINAL FIX - Force new build deployment"
echo "========================================"

# The issue: Docker is serving cached version with PostHog
# Solution: Force a content change to generate new hash

# Add a comment to force new build hash
echo "// Build timestamp: $(date)" >> frontend/src/index.js

# Build with new hash
cd frontend
npm run build
cd ..

# Check new build
NEW_JS=$(ls frontend/build/static/js/main.*.js | head -1 | xargs basename)
echo "New JS bundle: $NEW_JS"

# Commit and push the change
git add .
git commit -m "Force new build hash - $(date)"
git push origin main

echo ""
echo "🚀 NOW RUN ON VPS:"
echo "=================="
echo "git pull origin main"
echo "docker-compose -f docker-compose.prod.yml down"
echo "docker-compose -f docker-compose.prod.yml build --no-cache frontend"
echo "docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "Expected result: New JS bundle $NEW_JS (not main.624b92ee.js)"