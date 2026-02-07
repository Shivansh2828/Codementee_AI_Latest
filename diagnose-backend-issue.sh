#!/bin/bash
# Diagnose Backend Issue

echo "🔍 DIAGNOSING BACKEND ISSUE"
echo "==========================="
echo ""

echo "1️⃣ Checking if backend container is running..."
if docker ps | grep -q codementee-backend; then
    echo "✅ Backend container is running"
    BACKEND_RUNNING=true
else
    echo "❌ Backend container is NOT running!"
    BACKEND_RUNNING=false
fi
echo ""

echo "2️⃣ Checking all containers..."
docker ps -a | grep codementee
echo ""

if [ "$BACKEND_RUNNING" = false ]; then
    echo "3️⃣ Checking why backend stopped..."
    echo "Backend container logs (last 50 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker logs codementee-backend --tail 50 2>&1
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    echo "4️⃣ Checking backend container status..."
    docker inspect codementee-backend --format='{{.State.Status}}: {{.State.Error}}' 2>/dev/null || echo "Container not found"
    echo ""
else
    echo "3️⃣ Backend is running, checking logs for errors..."
    echo "Recent backend logs:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker logs codementee-backend --tail 30 2>&1
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    echo "4️⃣ Testing backend endpoints..."
    echo "Health check:"
    curl -s http://localhost:8001/api/health 2>&1 | head -5 || echo "❌ Health check failed"
    echo ""
    
    echo "Companies endpoint:"
    curl -s http://localhost:8001/api/companies 2>&1 | head -5 || echo "❌ Companies endpoint failed"
    echo ""
    
    echo "Pricing endpoint:"
    curl -s http://localhost:8001/api/pricing-plans 2>&1 | head -5 || echo "❌ Pricing endpoint failed"
    echo ""
fi

echo "5️⃣ Checking backend environment variables..."
docker exec codementee-backend env | grep -E "(MONGO|DB_NAME|JWT)" 2>/dev/null || echo "❌ Cannot access backend container"
echo ""

echo "6️⃣ Checking MongoDB connection..."
docker exec codementee-backend python -c "
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os

async def test_mongo():
    try:
        mongo_url = os.getenv('MONGO_URL')
        if not mongo_url:
            print('❌ MONGO_URL not set')
            return
        print(f'Testing connection to: {mongo_url[:20]}...')
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        print('✅ MongoDB connection successful')
    except Exception as e:
        print(f'❌ MongoDB connection failed: {str(e)}')

asyncio.run(test_mongo())
" 2>&1 || echo "❌ Cannot test MongoDB connection"
echo ""

echo "7️⃣ Checking if backend port is accessible..."
nc -zv localhost 8001 2>&1 || echo "❌ Port 8001 not accessible"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 DIAGNOSIS SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$BACKEND_RUNNING" = false ]; then
    echo "❌ BACKEND IS NOT RUNNING"
    echo ""
    echo "Common causes:"
    echo "1. MongoDB connection failed"
    echo "2. Missing environment variables"
    echo "3. Python dependency error"
    echo "4. Port already in use"
    echo ""
    echo "To fix:"
    echo "1. Check the logs above for specific error"
    echo "2. Verify .env file exists: ls -la backend/.env"
    echo "3. Check MongoDB URL is correct"
    echo "4. Try rebuilding: docker-compose -f docker-compose.prod.yml build backend"
    echo "5. Try restarting: docker-compose -f docker-compose.prod.yml up -d backend"
else
    echo "✅ Backend container is running"
    echo ""
    echo "If endpoints are failing, check:"
    echo "1. MongoDB connection (see test above)"
    echo "2. Backend logs for errors"
    echo "3. Network connectivity"
fi
