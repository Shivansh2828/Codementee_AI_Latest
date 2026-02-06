#!/bin/bash
# Deployment with Error Checking
# Run this on your VPS

echo "🚀 DEPLOYMENT WITH ERROR CHECKING"
echo "=================================="
echo ""

cd /var/www/codementee || { echo "❌ Failed to cd to /var/www/codementee"; exit 1; }

echo "✅ In directory: $(pwd)"
echo ""

echo "📥 Step 1: Pulling latest code..."
if git pull origin main; then
    echo "✅ Code pulled successfully"
else
    echo "❌ Git pull failed"
    exit 1
fi
echo ""

echo "🛑 Step 2: Stopping containers..."
docker-compose -f docker-compose.prod.yml down
echo "✅ Containers stopped"
echo ""

echo "🗑️  Step 3: Cleaning up..."
docker rmi codementee-frontend 2>/dev/null && echo "✅ Removed frontend image" || echo "ℹ️  No frontend image to remove"
docker rmi codementee-backend 2>/dev/null && echo "✅ Removed backend image" || echo "ℹ️  No backend image to remove"
echo ""

echo "🏗️  Step 4: Building frontend (this takes 2-3 minutes)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker-compose -f docker-compose.prod.yml build --no-cache frontend; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Frontend built successfully"
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ Frontend build FAILED!"
    echo ""
    echo "Check the error messages above."
    echo "Common issues:"
    echo "  - Out of disk space: df -h"
    echo "  - Out of memory: free -h"
    echo "  - Syntax error in Dockerfile"
    exit 1
fi
echo ""

echo "🏗️  Step 5: Building backend..."
if docker-compose -f docker-compose.prod.yml build backend; then
    echo "✅ Backend built successfully"
else
    echo "❌ Backend build FAILED!"
    exit 1
fi
echo ""

echo "🚀 Step 6: Starting containers..."
if docker-compose -f docker-compose.prod.yml up -d; then
    echo "✅ Containers started"
else
    echo "❌ Failed to start containers!"
    exit 1
fi
echo ""

echo "⏳ Step 7: Waiting for containers to initialize..."
sleep 15
echo ""

echo "📊 Step 8: Container status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "🔍 Step 9: Checking if containers are running..."
if docker ps | grep -q codementee-frontend; then
    echo "✅ Frontend container is running"
else
    echo "❌ Frontend container is NOT running!"
    echo "Checking logs..."
    docker logs codementee-frontend 2>&1 | tail -20
    exit 1
fi

if docker ps | grep -q codementee-backend; then
    echo "✅ Backend container is running"
else
    echo "❌ Backend container is NOT running!"
    echo "Checking logs..."
    docker logs codementee-backend 2>&1 | tail -20
    exit 1
fi
echo ""

echo "📁 Step 10: Checking files in frontend container..."
if docker exec codementee-frontend ls -la /usr/share/nginx/html/static/js/ 2>/dev/null; then
    echo "✅ Files accessible in container"
else
    echo "❌ Cannot access files in container"
    echo "Container might not be fully started yet"
fi
echo ""

echo "🧪 Step 11: Testing services..."
echo "Frontend test:"
curl -I http://localhost:3000 2>&1 | head -3
echo ""
echo "Backend test:"
curl -I http://localhost:8001/api/companies 2>&1 | head -3
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Test your website:"
echo "   https://codementee.io"
echo ""
echo "🔍 If issues persist, check logs:"
echo "   docker logs codementee-frontend"
echo "   docker logs codementee-backend"
