#!/bin/bash

# ============================================
# SIMPLE DEPLOYMENT - JUST RUN THIS
# ============================================

set -e

echo "🚀 Starting Deployment..."

# Step 1: Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Step 2: Start MongoDB
echo "🗄️  Starting MongoDB..."
docker run -d --name mongo -p 27017:27017 mongo:latest 2>/dev/null || docker start mongo || true
sleep 5

# Step 3: Create backend .env
echo "⚙️  Creating backend configuration..."
cat > backend/.env << 'EOF'
MONGO_URL=mongodb://172.17.0.1:27017
DB_NAME=codementee
CORS_ORIGINS=*
JWT_SECRET=codementee-secret-key-2025-production
RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
RAZORPAY_KEY_SECRET=JtU5TqVhIYhoaSvgVufzYmbx
RESEND_API_KEY=re_NAsKT9R3_HCM8K6SgVDHHPWVaPPK2vKo2
SENDER_EMAIL=support@codementee.com
BCC_EMAIL=shivanshbiz28@gmail.com
DEBUG=false
LOG_LEVEL=INFO
ENVIRONMENT=production
EOF

# Step 4: Build frontend
echo "🎨 Building frontend..."
cd frontend
npm install --legacy-peer-deps 2>&1 | grep -v "npm WARN" || true
GENERATE_SOURCEMAP=false npm run build
cd ..

# Step 5: Start frontend
echo "🌐 Starting frontend..."
docker rm -f codementee-frontend 2>/dev/null || true
docker run -d \
  --name codementee-frontend \
  --restart unless-stopped \
  -p 3000:80 \
  -v $(pwd)/frontend/build:/usr/share/nginx/html:ro \
  nginx:alpine

# Step 6: Build backend
echo "🔨 Building backend..."
cd backend
docker build -t codementee-backend -f Dockerfile.prod . 2>&1 | tail -5
cd ..

# Step 7: Start backend
echo "⚡ Starting backend..."
docker rm -f codementee-backend 2>/dev/null || true
docker run -d \
  --name codementee-backend \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file backend/.env \
  codementee-backend

# Step 8: Start Redis
echo "💾 Starting Redis..."
docker rm -f codementee-redis 2>/dev/null || true
docker run -d \
  --name codementee-redis \
  --restart unless-stopped \
  -p 6379:6379 \
  redis:7-alpine

# Step 9: Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Step 10: Initialize database
echo "📊 Initializing database..."
docker exec codementee-backend python setup_initial_data.py 2>/dev/null || echo "Database already initialized"

# Step 11: Test everything
echo ""
echo "🧪 Testing deployment..."
echo ""

# Test frontend
if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
    echo "✅ Frontend: WORKING"
else
    echo "❌ Frontend: FAILED"
fi

# Test backend
if curl -s http://localhost:8001/api/companies | grep -q "Amazon"; then
    echo "✅ Backend: WORKING"
else
    echo "❌ Backend: FAILED"
    echo "Backend logs:"
    docker logs codementee-backend --tail 20
fi

# Show containers
echo ""
echo "📦 Running Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "🌐 Access your website:"
echo "   http://62.72.13.129:3000"
echo ""
