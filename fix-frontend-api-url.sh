#!/bin/bash

echo "🔧 Fixing frontend API URL configuration..."

# Update the frontend .env file to use the correct backend URL
cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=http://codementee.io
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
EOF

echo "✅ Updated frontend/.env with correct API URL"

# Rebuild the frontend container with the new configuration
echo "🏗️ Rebuilding frontend container..."
docker-compose -f docker-compose.prod.yml stop frontend
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up -d frontend

echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

echo "🧪 Testing API connectivity:"
echo "Backend health: $(curl -s http://localhost:8001/health | head -c 50)..."
echo "API via domain: $(curl -s http://codementee.io/api/health | head -c 50)..."

echo "✅ Frontend API URL fix complete!"
echo "🌍 Test your site: http://codementee.io"