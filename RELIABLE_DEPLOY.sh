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
docker rm -f codementee-frontend codementee-backend codementee-redis 2>/dev/null || true
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
if ! docker ps | grep -q mongo; then
    docker run -d --name mongo -p 27017:27017 mongo:latest 2>/dev/null || docker start mongo
    sleep 5
fi

# Step 5: Create proper backend .env file
echo "5️⃣ Creating backend .env file..."
cat > backend/.env << 'EOF'
# Production Configuration with Local MongoDB
MONGO_URL=mongodb://172.17.0.1:27017
DB_NAME=codementee

# CORS Configuration for production
CORS_ORIGINS=*

# JWT Configuration
JWT_SECRET=codementee-secret-key-2025-production

# Razorpay Configuration (Live Keys)
RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
RAZORPAY_KEY_SECRET=JtU5TqVhIYhoaSvgVufzYmbx

# Resend Email Configuration
RESEND_API_KEY=re_NAsKT9R3_HCM8K6SgVDHHPWVaPPK2vKo2
SENDER_EMAIL=support@codementee.com
BCC_EMAIL=shivanshbiz28@gmail.com

# Production Configuration
DEBUG=false
LOG_LEVEL=INFO
ENVIRONMENT=production
EOF

# Step 6: Start Frontend (simple nginx with volume mount)
echo "6️⃣ Starting Frontend..."
docker run -d --name codementee-frontend \
  --restart unless-stopped \
  -p 3000:80 \
  -v $(pwd)/frontend/build:/usr/share/nginx/html:ro \
  nginx:alpine

# Step 7: Build and start Backend
echo "7️⃣ Building backend image..."
cd backend
docker build --no-cache -t codementee-backend -f Dockerfile.prod .
cd ..

echo "8️⃣ Starting Backend..."
docker run -d \
  --name codementee-backend \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file backend/.env \
  -v $(pwd)/logs:/app/logs \
  codementee-backend

# Step 8: Start Redis
echo "9️⃣ Starting Redis..."
docker run -d \
  --name codementee-redis \
  --restart unless-stopped \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru

# Step 9: Wait for services to start
echo "🔟 Waiting for services to start..."
sleep 15

# Step 10: Initialize database
echo "1️⃣1️⃣ Initializing database..."
docker exec codementee-backend python setup_initial_data.py 2>/dev/null || echo "Database already initialized"

# Step 11: Verify deployment
echo "1️⃣2️⃣ Verifying deployment..."

# Check frontend
if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
    echo "✅ Frontend is working"
else
    echo "❌ Frontend failed"
    docker logs codementee-frontend --tail 20
    exit 1
fi

# Check backend
if curl -s http://localhost:8001/api/companies | grep -q "Amazon"; then
    echo "✅ Backend is working"
else
    echo "❌ Backend failed"
    docker logs codementee-backend --tail 30
    exit 1
fi

# Step 12: Show status
echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo ""
echo "📊 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "🌐 Your website is live at:"
echo "   Frontend: http://62.72.13.129:3000"
echo "   Backend:  http://62.72.13.129:8001"
echo ""
echo "🔍 Quick Health Check:"
echo "   Frontend: curl -I http://localhost:3000"
echo "   Backend:  curl http://localhost:8001/api/companies"
echo ""
echo "✅ Deployment completed successfully!"
