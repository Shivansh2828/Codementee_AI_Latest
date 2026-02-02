#!/bin/bash
# Run this on the VPS to fix the frontend

set -e

echo "🔧 Fixing Frontend API URL on VPS..."

# Navigate to project directory
cd /var/www/codementee

# Update frontend .env
echo "📝 Updating frontend .env..."
cat > frontend/.env << 'ENVEOF'
REACT_APP_BACKEND_URL=http://62.72.13.129:8001
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
ENVEOF

# Stop frontend container
echo "🛑 Stopping frontend container..."
docker-compose -f docker-compose.prod.yml stop codementee-frontend

# Rebuild frontend with new environment
echo "🏗️  Rebuilding frontend..."
cd frontend
rm -rf build node_modules package-lock.json yarn.lock || true
npm install --legacy-peer-deps
npm run build
cd ..

# Restart frontend container
echo "🚀 Restarting frontend container..."
docker-compose -f docker-compose.prod.yml up -d --build codementee-frontend

# Wait for container to start
echo "⏳ Waiting for frontend to start..."
sleep 15

# Test frontend
echo "🧪 Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is working!"
else
    echo "❌ Frontend test failed"
fi

echo "🎉 Frontend fix completed!"
echo "🌐 Test your website: http://62.72.13.129:3000"
