#!/bin/bash

echo "🔍 Diagnosing Backend Issues"
echo "============================"
echo ""

echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""

echo "📋 Backend Container Logs (last 20 lines):"
echo "-------------------------------------------"
docker logs codementee-backend --tail 20
echo ""

echo "🔧 Environment Check:"
echo "---------------------"
echo "Backend .env file exists: $([ -f backend/.env ] && echo 'YES' || echo 'NO')"
echo "MongoDB connection string: $(grep MONGO_URL backend/.env | cut -d'=' -f2 | head -c 50)..."
echo ""

echo "🌐 Network Tests:"
echo "-----------------"
echo "Frontend (port 3000): $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || echo 'FAILED')"
echo "Backend (port 8001): $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8001/health || echo 'FAILED')"
echo "Redis (port 6379): $(redis-cli -p 6379 ping 2>/dev/null || echo 'FAILED')"
echo ""

echo "💾 Database Connection Test:"
echo "----------------------------"
echo "Testing MongoDB connection..."
python3 -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
mongo_url = os.getenv('MONGO_URL')

async def test_connection():
    try:
        client = AsyncIOMotorClient(mongo_url)
        await client.admin.command('ping')
        print('✅ MongoDB connection successful')
        client.close()
    except Exception as e:
        print(f'❌ MongoDB connection failed: {str(e)}')

asyncio.run(test_connection())
" 2>/dev/null || echo "❌ Python/MongoDB test failed"

echo ""
echo "🔄 Suggested Actions:"
echo "--------------------"
echo "1. Check backend logs: docker logs codementee-backend"
echo "2. Restart backend: docker-compose -f docker-compose.prod.yml restart backend"
echo "3. Rebuild backend: docker-compose -f docker-compose.prod.yml up --build -d backend"