#!/bin/bash
# VPS Deployment - Fix First Load Issue
# Run this on your VPS server

set -e

echo "🔥 Deploying First Load Fix"
echo "============================"

cd /var/www/codementee

echo "📥 Pulling latest changes..."
git pull origin main

echo "🛑 Stopping containers..."
docker-compose -f docker-compose.prod.yml down

echo "🗑️  Removing old images..."
docker rmi codementee-frontend codementee-backend 2>/dev/null || true

echo "🧹 Clearing Docker build cache..."
docker builder prune -f

echo "🏗️  Building frontend (no cache)..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

echo "🏗️  Building backend..."
docker-compose -f docker-compose.prod.yml build backend

echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for startup..."
sleep 15

echo ""
echo "📊 Container Status:"
docker ps

echo ""
echo "📋 Frontend Logs:"
docker logs codementee-frontend --tail 30

echo ""
echo "🧪 Testing Services:"
echo "Frontend:"
curl -I http://localhost:3000 2>&1 | head -5

echo ""
echo "Backend:"
curl -I http://localhost:8001/api/companies 2>&1 | head -5

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🧪 NOW TEST IN BROWSER:"
echo "1. Clear browser cache OR use Incognito mode"
echo "2. Open DevTools (F12) BEFORE loading page"
echo "3. Go to Console tab"
echo "4. Load https://codementee.io"
echo "5. Look for: 🔥 HTML LOADED (should appear immediately)"
echo "6. Then look for: 🚀 INDEX.JS messages"
echo "7. Page should load on FIRST try!"
echo ""
echo "If you see 🔥 but no 🚀, run:"
echo "  docker logs codementee-frontend"
echo ""
echo "If you see neither 🔥 nor 🚀, check:"
echo "  curl -I https://codementee.io"
