#!/bin/bash
# Quick fix for deployment permission issues

echo "🔧 Quick fix for deployment permission issues..."

# Stop containers
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.prod.yml down

# Fix permissions
echo "🔐 Fixing permissions..."
sudo chown -R $(whoami):$(whoami) .
sudo chmod -R 755 .

# Remove problematic build files
echo "🗑️ Cleaning build files..."
rm -rf frontend/build
rm -rf frontend/node_modules

# Set production environment
echo "⚙️ Setting production environment..."
cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=http://62.72.13.129:8001
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
GENERATE_SOURCEMAP=false
EOF

# Clean Docker
echo "🧹 Cleaning Docker..."
docker system prune -af

# Build and start (let Docker handle everything)
echo "🐳 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up --build -d

echo "⏳ Waiting 60 seconds for services to start..."
sleep 60

echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

echo "🌐 Testing frontend..."
curl -I http://localhost:3000 || echo "Frontend not ready yet"

echo "🔧 Testing backend..."
curl -I http://localhost:8001/api/companies || echo "Backend not ready yet"

echo "✅ Deployment attempt completed!"
echo "🌐 Frontend: http://62.72.13.129:3000"
echo "🔧 Backend: http://62.72.13.129:8001"