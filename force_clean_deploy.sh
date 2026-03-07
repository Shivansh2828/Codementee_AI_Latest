#!/bin/bash

# Force Clean Deployment Script
# This script ensures a completely fresh deployment by clearing all caches

set -e

echo "🧹 Starting FORCE CLEAN deployment..."

# Pull latest code
echo "📥 Pulling latest code from main..."
git fetch origin
git reset --hard origin/main
git clean -fd

# Backend cleanup and restart
echo "🔧 Cleaning and restarting backend..."
cd backend

# Remove Python cache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true

# Restart backend service
sudo systemctl restart codementee-backend
echo "✅ Backend restarted"

cd ..

# Frontend cleanup and rebuild
echo "🎨 Force rebuilding frontend..."
cd frontend

# Remove ALL caches and build artifacts
rm -rf node_modules/.cache
rm -rf build
rm -rf .cache

# Clear npm cache
npm cache clean --force

# Reinstall dependencies (optional but ensures clean state)
# npm install

# Build with production environment
echo "🏗️  Building frontend with NODE_ENV=production..."
NODE_ENV=production npm run build

# Restart frontend service
sudo systemctl restart codementee-frontend
echo "✅ Frontend rebuilt and restarted"

cd ..

# Reload nginx
echo "🔄 Reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅ FORCE CLEAN DEPLOYMENT COMPLETE!"
echo ""
echo "🔍 Checking service status..."
sudo systemctl status codementee-backend --no-pager -l | head -10
sudo systemctl status codementee-frontend --no-pager -l | head -10

echo ""
echo "🌐 Your application should now be running with the latest code!"
echo "   Frontend: http://62.72.13.129:3000"
echo "   Backend: http://62.72.13.129:8001"
