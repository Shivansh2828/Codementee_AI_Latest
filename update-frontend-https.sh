#!/bin/bash

echo "🔒 Updating frontend to use HTTPS..."

# Update the frontend .env file to use HTTPS
cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=https://codementee.io
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
EOF

echo "✅ Updated frontend/.env with HTTPS URL"

# Rebuild the frontend container with HTTPS configuration
echo "🏗️ Rebuilding frontend container..."
docker-compose -f docker-compose.prod.yml stop frontend
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up -d frontend

echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

echo "✅ Frontend updated for HTTPS!"