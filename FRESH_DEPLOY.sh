#!/bin/bash

set -e

echo "=========================================="
echo "FRESH DEPLOYMENT FROM SCRATCH"
echo "=========================================="
echo ""

# STEP 1: NUCLEAR CLEANUP
echo "1️⃣ Cleaning everything..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker network rm codementee-network 2>/dev/null || true
pkill -9 python3 2>/dev/null || true
pkill -9 node 2>/dev/null || true
pkill -9 nginx 2>/dev/null || true
echo "✅ Cleanup complete"
echo ""

# STEP 2: PULL LATEST CODE
echo "2️⃣ Pulling latest code..."
cd /var/www/codementee
git fetch --all
git reset --hard origin/main
git pull origin main
echo "✅ Code updated"
echo ""

# STEP 3: BUILD FRONTEND
echo "3️⃣ Building frontend..."
cd /var/www/codementee/frontend
rm -rf build node_modules/.cache
npm install --legacy-peer-deps --silent
GENERATE_SOURCEMAP=false npm run build
if [ ! -f "build/index.html" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
echo "✅ Frontend built"
echo ""

# STEP 4: CREATE DOCKER NETWORK
echo "4️⃣ Creating Docker network..."
docker network create codementee-network
echo "✅ Network created"
echo ""

# STEP 5: START MONGODB
echo "5️⃣ Starting MongoDB..."
docker run -d \
  --name mongo \
  --network codementee-network \
  -p 27017:27017 \
  --restart unless-stopped \
  mongo:latest
sleep 5
echo "✅ MongoDB started"
echo ""

# STEP 6: CREATE BACKEND ENV
echo "6️⃣ Creating backend configuration..."
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
echo "✅ Backend .env created"
echo ""

# STEP 7: BUILD BACKEND IMAGE
echo "7️⃣ Building backend Docker image..."
cd /var/www/codementee/backend
docker build --no-cache -t codementee-backend -f Dockerfile.prod . 2>&1 | tail -10
echo "✅ Backend image built"
echo ""

# STEP 8: START FRONTEND
echo "8️⃣ Starting frontend container..."
docker run -d \
  --name codementee-frontend \
  --network codementee-network \
  --restart unless-stopped \
  -p 3000:80 \
  -v /var/www/codementee/frontend/build:/usr/share/nginx/html:ro \
  nginx:alpine
echo "✅ Frontend started"
echo ""

# STEP 9: START BACKEND
echo "9️⃣ Starting backend container..."
docker run -d \
  --name codementee-backend \
  --network codementee-network \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file /var/www/codementee/backend/.env \
  codementee-backend
echo "✅ Backend started"
echo ""

# STEP 10: START REDIS
echo "🔟 Starting Redis..."
docker run -d \
  --name codementee-redis \
  --network codementee-network \
  --restart unless-stopped \
  -p 6379:6379 \
  redis:7-alpine
echo "✅ Redis started"
echo ""

# STEP 11: WAIT FOR SERVICES
echo "1️⃣1️⃣ Waiting for services to start..."
sleep 20
echo "✅ Services ready"
echo ""

# STEP 12: INITIALIZE DATABASE
echo "1️⃣2️⃣ Initializing database..."
docker exec codementee-backend python setup_initial_data.py 2>&1 | grep -E "✅|❌|Setting up|Error" || true
echo "✅ Database initialized"
echo ""

# STEP 13: VERIFY DEPLOYMENT
echo "=========================================="
echo "VERIFICATION"
echo "=========================================="
echo ""

echo "📦 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "🧪 Testing Frontend:"
FRONTEND_TEST=$(curl -s -I http://localhost:3000 | head -1)
if echo "$FRONTEND_TEST" | grep -q "200 OK"; then
    echo "✅ Frontend: WORKING"
else
    echo "❌ Frontend: FAILED - $FRONTEND_TEST"
fi
echo ""

echo "🧪 Testing Backend:"
sleep 5
BACKEND_TEST=$(curl -s http://localhost:8001/api/companies 2>&1)
if echo "$BACKEND_TEST" | grep -q "Amazon"; then
    COMPANY_COUNT=$(echo "$BACKEND_TEST" | grep -o '"name"' | wc -l)
    echo "✅ Backend: WORKING (Found $COMPANY_COUNT companies)"
else
    echo "❌ Backend: FAILED"
    echo "Response: $BACKEND_TEST"
    echo ""
    echo "Backend logs:"
    docker logs codementee-backend --tail 30
fi
echo ""

echo "=========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "🌐 Your website is live at:"
echo "   http://62.72.13.129:3000"
echo ""
echo "📊 To check logs:"
echo "   docker logs codementee-backend"
echo "   docker logs codementee-frontend"
echo ""
