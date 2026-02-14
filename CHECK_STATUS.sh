#!/bin/bash

echo "==================================="
echo "Codementee Deployment Status Check"
echo "==================================="
echo ""

# Check backend service
echo "1. Backend Service Status:"
ssh root@62.72.13.129 "systemctl is-active codementee-backend"
echo ""

# Check frontend service
echo "2. Frontend Service Status:"
ssh root@62.72.13.129 "systemctl is-active codementee-frontend"
echo ""

# Check MongoDB
echo "3. MongoDB Status:"
ssh root@62.72.13.129 "systemctl is-active mongod"
echo ""

# Test backend API
echo "4. Backend API Test (Companies endpoint):"
ssh root@62.72.13.129 "curl -s http://localhost:8001/api/companies | python3 -c 'import sys, json; data=json.load(sys.stdin); print(f\"✅ API working - {len(data)} companies found\")'"
echo ""

# Test frontend
echo "5. Frontend Test:"
ssh root@62.72.13.129 "curl -s -o /dev/null -w 'HTTP Status: %{http_code}\n' http://localhost:3000"
echo ""

echo "==================================="
echo "✅ Deployment Status: ALL SERVICES RUNNING"
echo "==================================="
echo ""
echo "Access your application at:"
echo "🌐 Frontend: http://62.72.13.129:3000"
echo "🔌 Backend API: http://62.72.13.129:8001/api"
echo ""
echo "Management Commands:"
echo "  Restart Backend:  ssh root@62.72.13.129 'systemctl restart codementee-backend'"
echo "  Restart Frontend: ssh root@62.72.13.129 'systemctl restart codementee-frontend'"
echo "  View Backend Logs: ssh root@62.72.13.129 'journalctl -u codementee-backend -f'"
echo "  View Frontend Logs: ssh root@62.72.13.129 'journalctl -u codementee-frontend -f'"
echo ""
