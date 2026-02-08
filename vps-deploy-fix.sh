#!/bin/bash
# VPS Deployment Script - Run this on your VPS server
# Usage: Copy this script to VPS and run: bash vps-deploy-fix.sh

set -e

echo "🚀 Deploying Loading Fix to Production"
echo "======================================"

cd /var/www/codementee

echo "📥 Pulling latest changes..."
git pull origin main

echo "🛑 Stopping containers..."
docker-compose -f docker-compose.prod.yml down

echo "🗑️  Removing old images..."
docker rmi codementee-frontend codementee-backend 2>/dev/null || true

echo "🏗️  Building fresh containers (no cache)..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for containers to start..."
sleep 15

echo ""
echo "📊 Container Status:"
docker ps

echo ""
echo "📋 Frontend Logs:"
docker logs codementee-frontend --tail 20

echo ""
echo "📋 Backend Logs:"
docker logs codementee-backend --tail 20

echo ""
echo "🧪 Testing Services:"
echo "Frontend:"
curl -I http://localhost:3000 2>&1 | head -3

echo ""
echo "Backend:"
curl -I http://localhost:8001/api/companies 2>&1 | head -3

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Test your website:"
echo "   - https://codementee.io"
echo ""
echo "🔍 Debug in browser:"
echo "   1. Open DevTools (F12)"
echo "   2. Check Console for 🚀 logs"
echo "   3. Check Network tab - no 404 errors"
echo "   4. Refresh multiple times - should load consistently"
