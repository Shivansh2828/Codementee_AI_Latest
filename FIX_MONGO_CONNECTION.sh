#!/bin/bash

echo "🔧 Fixing MongoDB Connection..."

# Step 1: Stop backend
echo "1️⃣ Stopping backend..."
docker stop codementee-backend
docker rm codementee-backend

# Step 2: Verify .env file
echo "2️⃣ Creating correct .env file..."
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

echo "✅ .env file created with MONGO_URL=mongodb://mongo:27017"

# Step 3: Verify MongoDB is on the network
echo "3️⃣ Checking MongoDB network..."
docker network connect codementee-network mongo 2>/dev/null || echo "MongoDB already on network"

# Step 4: Start backend on the network
echo "4️⃣ Starting backend..."
docker run -d \
  --name codementee-backend \
  --network codementee-network \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file /var/www/codementee/backend/.env \
  codementee-backend

# Step 5: Wait for backend
echo "5️⃣ Waiting for backend to start..."
sleep 10

# Step 6: Test MongoDB connection from backend
echo "6️⃣ Testing MongoDB connection..."
docker exec codementee-backend python -c "
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os

async def test():
    try:
        mongo_url = os.getenv('MONGO_URL')
        print(f'Connecting to: {mongo_url}')
        client = AsyncIOMotorClient(mongo_url)
        await client.admin.command('ping')
        print('✅ MongoDB connection: SUCCESS')
        dbs = await client.list_database_names()
        print(f'Available databases: {dbs}')
    except Exception as e:
        print(f'❌ MongoDB connection: FAILED')
        print(f'Error: {e}')

asyncio.run(test())
"

# Step 7: Initialize database
echo "7️⃣ Initializing database..."
docker exec codementee-backend python setup_initial_data.py 2>&1 | tail -10

# Step 8: Test API
echo ""
echo "8️⃣ Testing API..."
sleep 3
RESPONSE=$(curl -s http://localhost:8001/api/companies)
if echo "$RESPONSE" | grep -q "Amazon"; then
    echo "✅ Backend API: WORKING"
    echo "   Companies found: $(echo "$RESPONSE" | grep -o '"name"' | wc -l)"
else
    echo "❌ Backend API: FAILED"
    echo "Response: $RESPONSE"
    echo ""
    echo "Backend logs:"
    docker logs codementee-backend --tail 20
fi

echo ""
echo "✅ Fix complete!"
echo "🌐 Test your website: http://62.72.13.129:3000"
