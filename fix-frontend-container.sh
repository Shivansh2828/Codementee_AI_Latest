#!/bin/bash

echo "🔧 Fixing Frontend Container..."

# Stop the frontend container
echo "Stopping frontend container..."
docker-compose -f docker-compose.prod.yml stop frontend

# Rebuild the frontend container with the fixed Nginx config
echo "Rebuilding frontend container..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Start the frontend container
echo "Starting frontend container..."
docker-compose -f docker-compose.prod.yml up -d frontend

# Wait for container to be ready
echo "Waiting for frontend to be ready..."
sleep 10

# Test the frontend
echo "Testing frontend..."
curl -I http://62.72.13.129:3000

echo "✅ Frontend container fixed!"
echo "🌐 Site should now load properly at: http://62.72.13.129:3000"