#!/bin/bash

echo "🔧 Fixing backend permissions issue..."

# Stop the backend container
docker-compose -f docker-compose.prod.yml stop backend

# Create logs directory with proper permissions
mkdir -p logs
chmod 777 logs
chown -R 1000:1000 logs

# Also create the log files directly
touch logs/error.log
touch logs/access.log
chmod 666 logs/*.log

echo "📁 Logs directory setup:"
ls -la logs/

# Restart the backend
echo "🔄 Restarting backend container..."
docker-compose -f docker-compose.prod.yml up -d backend

# Wait a moment for startup
sleep 5

# Check container status
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Test backend health
echo "🏥 Testing backend health:"
curl -f http://localhost:8001/health || echo "Backend not responding yet"

echo "✅ Backend permissions fix complete!"