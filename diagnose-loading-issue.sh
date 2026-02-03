#!/bin/bash
# COMPREHENSIVE DIAGNOSIS OF LOADING ISSUE
# This will identify the EXACT problem

echo "🔍 COMPREHENSIVE LOADING ISSUE DIAGNOSIS"
echo "========================================"

# Test 1: Check what's actually running
echo "1. CHECKING WHAT'S RUNNING:"
echo "Frontend port 3000:"
curl -I -m 5 http://62.72.13.129:3000 2>&1 || echo "❌ FRONTEND NOT RESPONDING"

echo "Backend port 8001:"
curl -I -m 5 http://62.72.13.129:8001/api/companies 2>&1 || echo "❌ BACKEND NOT RESPONDING"

# Test 2: Check Docker containers
echo ""
echo "2. DOCKER CONTAINER STATUS:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "❌ Docker not accessible"

# Test 3: Check what's listening on ports
echo ""
echo "3. PORTS IN USE:"
netstat -tlnp | grep -E ":3000|:8001" 2>/dev/null || ss -tlnp | grep -E ":3000|:8001" 2>/dev/null || echo "❌ Cannot check ports"

# Test 4: Check frontend build
echo ""
echo "4. FRONTEND BUILD STATUS:"
if [ -d "frontend/build" ]; then
    echo "✅ Build directory exists"
    ls -la frontend/build/ | head -5
else
    echo "❌ NO BUILD DIRECTORY"
fi

# Test 5: Check environment
echo ""
echo "5. FRONTEND ENVIRONMENT:"
if [ -f "frontend/.env" ]; then
    echo "✅ .env file exists:"
    cat frontend/.env
else
    echo "❌ NO .env FILE"
fi

# Test 6: Check backend logs
echo ""
echo "6. BACKEND LOGS (last 10 lines):"
docker logs codementee-backend --tail 10 2>/dev/null || echo "❌ Cannot get backend logs"

# Test 7: Check frontend logs
echo ""
echo "7. FRONTEND LOGS (last 10 lines):"
docker logs codementee-frontend --tail 10 2>/dev/null || echo "❌ Cannot get frontend logs"

# Test 8: Test actual loading time
echo ""
echo "8. ACTUAL LOADING TIME TEST:"
echo "Testing frontend loading speed..."
time curl -s http://62.72.13.129:3000 > /dev/null 2>&1 && echo "✅ Frontend responds" || echo "❌ Frontend timeout"

echo ""
echo "9. NETWORK CONNECTIVITY:"
ping -c 2 62.72.13.129 2>/dev/null || echo "❌ Cannot ping server"

echo ""
echo "10. PROCESS CHECK:"
ps aux | grep -E "(nginx|node|python)" | grep -v grep || echo "❌ No relevant processes found"

echo ""
echo "========================================"
echo "🎯 DIAGNOSIS COMPLETE"
echo "========================================"