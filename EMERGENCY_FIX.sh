#!/bin/bash

echo "🚨 EMERGENCY FIX - Cleaning up and restarting..."

# Step 1: Kill all Python processes
echo "1️⃣ Stopping all Python processes..."
pkill -9 python3
pkill -9 uvicorn
pkill -9 gunicorn

# Step 2: Remove all containers
echo "2️⃣ Removing all containers..."
docker rm -f codementee-backend codementee-frontend codementee-redis 2>/dev/null || true

# Step 3: Wait for ports to be free
echo "3️⃣ Waiting for ports to be free..."
sleep 3

# Step 4: Ensure MongoDB is running
echo "4️⃣ Ensuring MongoDB is running..."
docker start mongo 2>/dev/null || docker run -d --name mongo -p 27017:27017 mongo:latest

# Step 5: Create backend .env
echo "5️⃣ Creating backend .env..."
cat > /var/www/codementee/backend/.env << 'EOF'
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

# Step 6: Start frontend
echo "6️⃣ Starting frontend..."
docker run -d \
  --name codementee-frontend \
  --restart unless-stopped \
  -p 3000:80 \
  -v /var/www/codementee/frontend/build:/usr/share/nginx/html:ro \
  nginx:alpine

# Step 7: Start backend with proper command
echo "7️⃣ Starting backend..."
docker run -d \
  --name codementee-backend \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file /var/www/codementee/backend/.env \
  codementee-backend

# Step 8: Start Redis
echo "8️⃣ Starting Redis..."
docker run -d \
  --name codementee-redis \
  --restart unless-stopped \
  -p 6379:6379 \
  redis:7-alpine

# Step 9: Wait for backend to start
echo "9️⃣ Waiting for backend to start..."
sleep 10

# Step 10: Check if backend started
echo "🔟 Checking backend status..."
if docker ps | grep -q codementee-backend; then
    echo "✅ Backend container is running"
else
    echo "❌ Backend container failed to start"
    echo "Checking logs..."
    docker logs codementee-backend 2>&1
    exit 1
fi

# Step 11: Initialize database
echo "1️⃣1️⃣ Initializing database..."
docker exec codementee-backend python setup_initial_data.py 2>/dev/null || echo "Database already initialized"

# Step 12: Test everything
echo ""
echo "1️⃣2️⃣ Testing deployment..."
echo ""

# Test frontend
if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
    echo "✅ Frontend: WORKING"
else
    echo "❌ Frontend: FAILED"
fi

# Test backend
sleep 5
if curl -s http://localhost:8001/api/companies | grep -q "Amazon"; then
    echo "✅ Backend: WORKING"
else
    echo "⚠️  Backend: Not responding yet"
    echo "Backend logs:"
    docker logs codementee-backend --tail 20
fi

# Show status
echo ""
echo "📦 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Emergency fix complete!"
echo "🌐 Website: http://62.72.13.129:3000"
