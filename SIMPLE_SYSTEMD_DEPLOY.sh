#!/bin/bash

echo "=========================================="
echo "SIMPLE SYSTEMD DEPLOYMENT"
echo "=========================================="
echo ""

# Stop everything
echo "1. Stopping all services..."
systemctl stop codementee-backend codementee-frontend 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
pkill -9 python3 2>/dev/null || true
pkill -9 uvicorn 2>/dev/null || true
pkill -9 node 2>/dev/null || true
sleep 3

# Install MongoDB
echo "2. Installing MongoDB..."
if ! command -v mongod &> /dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org
fi
systemctl enable mongod
systemctl start mongod

# Create backend .env
echo "3. Creating backend configuration..."
cat > /var/www/codementee/backend/.env << 'EOF'
MONGO_URL=mongodb://localhost:27017
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

# Install Python dependencies
echo "4. Installing Python dependencies..."
cd /var/www/codementee/backend
pip3 install -r requirements.txt

# Build frontend
echo "5. Building frontend..."
cd /var/www/codementee/frontend
npm install --legacy-peer-deps
GENERATE_SOURCEMAP=false npm run build

# Install systemd services
echo "6. Installing systemd services..."
cp /var/www/codementee/systemd/codementee-backend.service /etc/systemd/system/
cp /var/www/codementee/systemd/codementee-frontend.service /etc/systemd/system/
systemctl daemon-reload

# Start services
echo "7. Starting services..."
systemctl enable codementee-backend
systemctl enable codementee-frontend
systemctl start codementee-backend
sleep 5
systemctl start codementee-frontend

# Initialize database
echo "8. Initializing database..."
cd /var/www/codementee/backend
python3 setup_initial_data.py

# Test
echo ""
echo "9. Testing..."
sleep 5
curl -s http://localhost:8001/api/companies | head -20

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Services status:"
systemctl status codementee-backend --no-pager | head -5
systemctl status codementee-frontend --no-pager | head -5
echo ""
echo "🌐 Website: http://62.72.13.129:3000"
echo ""
echo "Manage services:"
echo "  systemctl restart codementee-backend"
echo "  systemctl restart codementee-frontend"
echo "  systemctl status codementee-backend"
echo "  journalctl -u codementee-backend -f"
