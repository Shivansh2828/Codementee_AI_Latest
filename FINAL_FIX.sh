#!/bin/bash

echo "🔧 FINAL FIX - Using Docker Network..."

# Step 1: Clean everything
echo "1️⃣ Cleaning up..."
docker rm -f codementee-backend codementee-frontend codementee-redis mongo 2>/dev/null || true
pkill -9 python3 2>/dev/null || true

# Step 2: Create Docker network
echo "2️⃣ Creating Docker network..."
docker network create codementee-network 2>/dev/null || echo "Network already exists"

# Step 3: Start MongoDB on the network
echo "3️⃣ Starting MongoDB..."
docker run -d \
  --name mongo \
  --network codementee-network \
  -p 27017:27017 \
  mongo:latest

sleep 5

# Step 4: Create backend .env with correct MongoDB URL
echo "4️⃣ Creating backend .env..."
cat > /var/www/codementee/backend/.env << 'EOF'
MONGO_URL=mongodb://mongo:27017
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

# Step 5: Start frontend
echo "5️⃣ Starting frontend..."
docker run -d \
  --name codementee-frontend \
  --network codementee-network \
  --restart unless-stopped \
  -p 3000:80 \
  -v /var/www/codementee/frontend/build:/usr/share/nginx/html:ro \
  nginx:alpine

# Step 6: Start backend on the network
echo "6️⃣ Starting backend..."
docker run -d \
  --name codementee-backend \
  --network codementee-network \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file /var/www/codementee/backend/.env \
  codementee-backend

# Step 7: Start Redis
echo "7️⃣ Starting Redis..."
docker run -d \
  --name codementee-redis \
  --network codementee-network \
  --restart unless-stopped \
  -p 6379:6379 \
  redis:7-alpine

# Step 8: Wait for backend
echo "8️⃣ Waiting for backend to start..."
sleep 15

# Step 9: Check backend status
echo "9️⃣ Checking backend status..."
if docker ps | grep -q "codementee-backend.*Up"; then
    echo "✅ Backend container is running"
else
    echo "❌ Backend container not running properly"
    docker logs codementee-backend --tail 30
    exit 1
fi

# Step 10: Initialize database
echo "🔟 Initializing database..."
docker exec codementee-backend python setup_initial_data.py 2>&1 | tail -5

# Step 11: Test everything
echo ""
echo "1️⃣1️⃣ Testing deployment..."
echo ""

# Test frontend
if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
    echo "✅ Frontend: WORKING"
else
    echo "❌ Frontend: FAILED"
fi

# Test backend
sleep 3
BACKEND_TEST=$(curl -s http://localhost:8001/api/companies)
if echo "$BACKEND_TEST" | grep -q "Amazon"; then
    echo "✅ Backend: WORKING"
    echo "   Companies loaded: $(echo "$BACKEND_TEST" | grep -o "name" | wc -l)"
else
    echo "⚠️  Backend: Not responding correctly"
    echo "   Response: $BACKEND_TEST"
    echo ""
    echo "Backend logs:"
    docker logs codementee-backend --tail 30
fi

# Show status
echo ""
echo "📦 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Website: http://62.72.13.129:3000"
echo ""
echo "If backend is still not working, check logs:"
echo "   docker logs codementee-backend --tail 50"
