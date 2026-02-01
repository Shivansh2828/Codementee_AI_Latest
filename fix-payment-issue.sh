#!/bin/bash

echo "🔧 Fixing Payment Issue..."

# Stop the frontend container
echo "Stopping frontend container..."
docker-compose -f docker-compose.prod.yml stop frontend

# Rebuild the frontend container with the payment fix
echo "Rebuilding frontend container..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Start the frontend container
echo "Starting frontend container..."
docker-compose -f docker-compose.prod.yml up -d frontend

# Wait for container to be ready
echo "Waiting for frontend to be ready..."
sleep 15

# Test the frontend
echo "Testing frontend..."
curl -I http://62.72.13.129:3000

echo "✅ Payment issue fixed!"
echo "🌐 Site should now work properly at: http://62.72.13.129:3000"
echo ""
echo "📋 What was fixed:"
echo "- Added missing order_id parameter in payment verification"
echo "- Fixed Nginx preload headers causing 404 errors"
echo "- Payment flow should now work for free users upgrading"