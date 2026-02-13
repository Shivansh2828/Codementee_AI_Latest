#!/bin/bash

# ============================================
# RELIABLE DEPLOYMENT SCRIPT
# This script ALWAYS works - no more chaos
# ============================================

set -e  # Exit on any error

echo "🚀 Starting Reliable Deployment..."

# Step 1: Clean everything
echo "1️⃣ Cleaning up old deployments..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
pkill -f uvicorn 2>/dev/null || true
pkill -f "python3 -m http.server" 2>/dev/null || true

# Step 2: Pull latest code
echo "2️⃣ Pulling latest code from GitHub..."
git pull origin main

# Step 3: Build frontend locally (guaranteed to work)
echo "3️⃣ Building frontend locally..."
cd frontend
rm -rf build node_modules/.cache
npm install --legacy-peer-deps
GENERATE_SOURCEMAP=false npm run build

# Verify build succeeded
if [ ! -f "build/index.html" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
echo "✅ Frontend built successfully"

cd ..

# Step 4: Start MongoDB
echo "4️⃣ Starting MongoDB..."
docker run -d --name mongo -p 27017:27017 mongo:latest 2>/dev/null || docker start mongo

# Step 5: Start Frontend (simple nginx with volume mount)
echo "5️⃣ Starting Frontend..."
docker rm -f codementee-frontend 2>/dev/null || true
docker run -d --name codementee-frontend \
  -p 3000:80 \
  -v $(pwd)/frontend/build:/usr/share/nginx/html:ro \
  nginx:alpine

# Step 6: Start Backend
echo "6️⃣ Starting Backend..."
docker-compose -f docker-compose.prod.yml up -d backend

# Step 7: Wait for services to start
echo "7️⃣ Waiting for services to start..."
sleep 10

# Step 8: Verify deployment
echo "8️⃣ Verifying deployment..."

# Check frontend
if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
    echo "✅ Frontend is working"
else
    echo "❌ Frontend failed"
    exit 1
fi

# Check backend
if curl -s http://localhost:8001/api/companies | grep -q "Amazon"; then
    echo "✅ Backend is working"
else
    echo "❌ Backend failed"
    exit 1
fi

# Step 9: Show status
echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo ""
echo "📊 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "🌐 Your website is live at:"
echo "   Frontend: http://your-vps-ip:3000"
echo "   Backend:  http://your-vps-ip:8001"
echo ""
echo "✅ Deployment completed successfully!"
