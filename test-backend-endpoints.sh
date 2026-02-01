#!/bin/bash

echo "🔍 Testing Backend Endpoints"
echo "============================"

echo "1. Testing health endpoint:"
curl -s http://localhost:8001/health || echo "❌ Health endpoint failed"
echo ""

echo "2. Testing root endpoint:"
curl -s http://localhost:8001/ || echo "❌ Root endpoint failed"
echo ""

echo "3. Testing API root:"
curl -s http://localhost:8001/api/ || echo "❌ API root failed"
echo ""

echo "4. Testing login endpoint:"
curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' || echo "❌ Login endpoint failed"
echo ""

echo "5. Testing companies endpoint:"
curl -s http://localhost:8001/api/companies || echo "❌ Companies endpoint failed"
echo ""

echo "6. Testing via domain (health):"
curl -s http://codementee.io/api/health || echo "❌ Domain API health failed"
echo ""

echo "7. Testing via domain (login):"
curl -s -X POST http://codementee.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' || echo "❌ Domain login failed"
echo ""

echo "8. Backend container logs (last 10 lines):"
docker logs codementee-backend --tail 10
echo ""

echo "9. FastAPI docs available at:"
echo "http://localhost:8001/docs"
echo "http://codementee.io/docs"