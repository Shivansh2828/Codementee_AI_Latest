#!/bin/bash

echo "=========================================="
echo "CHECKING DEPLOYMENT STATUS"
echo "=========================================="
echo ""

echo "1. DOCKER CONTAINERS:"
docker ps -a
echo ""

echo "2. FRONTEND LOGS (last 20 lines):"
docker logs codementee-frontend --tail 20 2>&1 || echo "Frontend container not found"
echo ""

echo "3. BACKEND LOGS (last 30 lines):"
docker logs codementee-backend --tail 30 2>&1 || echo "Backend container not found"
echo ""

echo "4. MONGODB STATUS:"
docker ps | grep mongo || echo "MongoDB not running"
echo ""

echo "5. FRONTEND TEST:"
curl -I http://localhost:3000 2>&1 | head -5
echo ""

echo "6. BACKEND TEST:"
curl http://localhost:8001/api/companies 2>&1 | head -10
echo ""

echo "7. PORTS IN USE:"
netstat -tlnp | grep -E "3000|8001|27017" || ss -tlnp | grep -E "3000|8001|27017"
echo ""

echo "8. DISK SPACE:"
df -h /var/www/codementee
echo ""

echo "9. FRONTEND BUILD EXISTS:"
ls -la /var/www/codementee/frontend/build/ 2>&1 | head -10
echo ""

echo "=========================================="
