#!/bin/bash
# Quick Backend Fix

echo "🔧 FIXING BACKEND"
echo "================="
echo ""

cd /var/www/codementee || exit 1

echo "Step 1: Checking current status..."
docker ps | grep codementee
echo ""

echo "Step 2: Stopping all containers..."
docker-compose -f docker-compose.prod.yml down
echo "✅ Containers stopped"
echo ""

echo "Step 3: Checking backend .env file..."
if [ -f backend/.env ]; then
    echo "✅ backend/.env exists"
    echo "Checking critical variables:"
    grep -E "^(MONGO_URL|DB_NAME|JWT_SECRET)" backend/.env | sed 's/=.*/=***/' || echo "⚠️  Some variables might be missing"
else
    echo "❌ backend/.env NOT FOUND!"
    echo "Creating from backup..."
    if [ -f backend/.env.backup ]; then
        cp backend/.env.backup backend/.env
        echo "✅ Restored from backup"
    else
        echo "❌ No backup found. You need to create backend/.env"
        exit 1
    fi
fi
echo ""

echo "Step 4: Rebuilding backend..."
docker-compose -f docker-compose.prod.yml build backend
echo "✅ Backend rebuilt"
echo ""

echo "Step 5: Starting all containers..."
docker-compose -f docker-compose.prod.yml up -d
echo "✅ Containers started"
echo ""

echo "Step 6: Waiting for backend to start..."
sleep 10
echo ""

echo "Step 7: Checking container status..."
docker ps | grep codementee
echo ""

echo "Step 8: Checking backend logs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker logs codementee-backend --tail 20
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Step 9: Testing backend..."
echo "Testing companies endpoint:"
curl -s http://localhost:8001/api/companies | head -c 100
echo ""
echo ""

echo "Testing pricing endpoint:"
curl -s http://localhost:8001/api/pricing-plans | head -c 100
echo ""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker ps | grep -q codementee-backend; then
    echo "✅ BACKEND IS RUNNING"
    echo ""
    echo "Test in browser:"
    echo "  - https://codementee.io"
    echo "  - Try login/register"
    echo "  - Check pricing page"
else
    echo "❌ BACKEND FAILED TO START"
    echo ""
    echo "Run diagnostic:"
    echo "  bash diagnose-backend-issue.sh"
fi
