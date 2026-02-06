#!/bin/bash
# Simple Deployment Script - Shows all output
# Run this on your VPS

set -e  # Exit on error

echo "🚀 SIMPLE DEPLOYMENT"
echo "==================="
echo ""

cd /var/www/codementee

echo "Step 1: Pulling latest code..."
git pull origin main
echo "✅ Code pulled"
echo ""

echo "Step 2: Stopping containers..."
docker-compose -f docker-compose.prod.yml down
echo "✅ Containers stopped"
echo ""

echo "Step 3: Removing old images..."
docker rmi codementee-frontend 2>/dev/null || echo "Frontend image not found (ok)"
docker rmi codementee-backend 2>/dev/null || echo "Backend image not found (ok)"
echo "✅ Old images removed"
echo ""

echo "Step 4: Building frontend..."
echo "⚠️  This will take 2-3 minutes. Watch for errors!"
echo ""
docker-compose -f docker-compose.prod.yml build --no-cache frontend
echo ""
echo "✅ Frontend built"
echo ""

echo "Step 5: Building backend..."
docker-compose -f docker-compose.prod.yml build backend
echo "✅ Backend built"
echo ""

echo "Step 6: Starting containers..."
docker-compose -f docker-compose.prod.yml up -d
echo "✅ Containers started"
echo ""

echo "Step 7: Waiting for startup..."
sleep 15
echo ""

echo "Step 8: Checking container status..."
docker ps
echo ""

echo "Step 9: Checking if JS file exists in container..."
docker exec codementee-frontend ls -la /usr/share/nginx/html/static/js/ 2>/dev/null || echo "❌ Could not access files in container"
echo ""

echo "Step 10: Testing frontend..."
curl -I http://localhost:3000 2>&1 | head -5
echo ""

echo "Step 11: Testing backend..."
curl -I http://localhost:8001/api/companies 2>&1 | head -5
echo ""

echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "Now test in browser: https://codementee.io"
