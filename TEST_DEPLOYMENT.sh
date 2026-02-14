#!/bin/bash

echo "=========================================="
echo "TESTING DEPLOYMENT"
echo "=========================================="
echo ""

echo "1. Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "2. Testing Frontend:"
FRONTEND_STATUS=$(curl -s -I http://localhost:3000 | head -1)
if echo "$FRONTEND_STATUS" | grep -q "200 OK"; then
    echo "✅ Frontend: WORKING ($FRONTEND_STATUS)"
else
    echo "❌ Frontend: FAILED ($FRONTEND_STATUS)"
fi
echo ""

echo "3. Testing Backend:"
BACKEND_RESPONSE=$(curl -s http://localhost:8001/api/companies 2>&1)
if echo "$BACKEND_RESPONSE" | grep -q "Amazon"; then
    COMPANY_COUNT=$(echo "$BACKEND_RESPONSE" | grep -o '"name"' | wc -l)
    echo "✅ Backend: WORKING (Found $COMPANY_COUNT companies)"
else
    echo "❌ Backend: FAILED"
    echo "Response: $BACKEND_RESPONSE"
fi
echo ""

echo "4. Backend Logs (last 15 lines):"
docker logs codementee-backend --tail 15
echo ""

echo "5. Network Configuration:"
docker inspect codementee-backend | grep -A 5 "Networks"
echo ""

echo "6. MongoDB Connection Test:"
docker exec codementee-backend python -c "
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os

async def test():
    try:
        client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
        await client.admin.command('ping')
        print('✅ MongoDB connection: SUCCESS')
    except Exception as e:
        print(f'❌ MongoDB connection: FAILED - {e}')

asyncio.run(test())
" 2>&1
echo ""

echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo ""
echo "🌐 Website URL: http://62.72.13.129:3000"
echo ""
echo "If everything shows ✅, your website is working!"
echo "If you see ❌, check the logs above for errors."
