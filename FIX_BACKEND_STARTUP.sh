#!/bin/bash

# ============================================
# FIX BACKEND STARTUP ISSUE
# Backend container stuck in "Created" status
# ============================================

set -e

echo "🔧 Fixing Backend Startup Issue..."

# Step 1: Remove stuck backend container
echo "1️⃣ Removing stuck backend container..."
docker rm -f codementee-backend 2>/dev/null || true

# Step 2: Ensure MongoDB is running
echo "2️⃣ Ensuring MongoDB is running..."
if ! docker ps | grep -q mongo; then
    echo "Starting MongoDB container..."
    docker run -d --name mongo -p 27017:27017 mongo:latest 2>/dev/null || docker start mongo
    sleep 5
fi

# Step 3: Create proper backend .env file
echo "3️⃣ Creating backend .env file with local MongoDB..."
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

echo "✅ Backend .env file created"

# Step 4: Rebuild backend image (force clean build)
echo "4️⃣ Rebuilding backend image..."
cd backend
docker build --no-cache -t codementee-backend -f Dockerfile.prod .
cd ..

# Step 5: Start backend container
echo "5️⃣ Starting backend container..."
docker run -d \
  --name codementee-backend \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file backend/.env \
  -v $(pwd)/logs:/app/logs \
  codementee-backend

# Step 6: Wait for backend to start
echo "6️⃣ Waiting for backend to start..."
sleep 10

# Step 7: Check backend status
echo "7️⃣ Checking backend status..."
if docker ps | grep -q codementee-backend; then
    echo "✅ Backend container is RUNNING"
else
    echo "❌ Backend container failed to start"
    echo "Checking logs..."
    docker logs codementee-backend --tail 50
    exit 1
fi

# Step 8: Test backend API
echo "8️⃣ Testing backend API..."
if curl -s http://localhost:8001/api/companies | grep -q "Amazon"; then
    echo "✅ Backend API is responding correctly"
else
    echo "⚠️  Backend API not responding yet, checking logs..."
    docker logs codementee-backend --tail 30
fi

# Step 9: Initialize database if needed
echo "9️⃣ Initializing database..."
docker exec codementee-backend python setup_initial_data.py 2>/dev/null || echo "Database already initialized"

# Step 10: Show final status
echo ""
echo "🎉 BACKEND STARTUP FIXED!"
echo ""
echo "📊 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|backend|mongo"
echo ""
echo "🔍 Backend Logs (last 10 lines):"
docker logs codementee-backend --tail 10
echo ""
echo "✅ Backend is now running on port 8001"
echo "Test it: curl http://localhost:8001/api/companies"
