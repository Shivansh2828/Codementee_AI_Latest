#!/bin/bash

echo "🔧 Fixing frontend build issues..."

# Stop containers first
docker-compose -f docker-compose.prod.yml down

# Add missing ajv dependency to package.json
echo "📦 Adding missing ajv dependency..."
cd frontend
npm install ajv@^8.12.0 --save-dev
cd ..

# Clean up and rebuild
echo "🧹 Cleaning up Docker..."
docker system prune -f

# Rebuild only frontend with better error handling
echo "🏗️ Rebuilding frontend..."
docker-compose -f docker-compose.prod.yml build frontend

# If frontend build succeeds, start all services
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful! Starting all services..."
    docker-compose -f docker-compose.prod.yml up -d
else
    echo "❌ Frontend build failed. Let's try a different approach..."
    
    # Try building locally first
    echo "🔄 Trying local build..."
    cd frontend
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Local build successful! Now building Docker image..."
        cd ..
        docker-compose -f docker-compose.prod.yml up -d
    else
        echo "❌ Build still failing. Need to investigate further."
    fi
fi

echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 To configure Nginx, run these commands as ROOT user:"
echo "su -"
echo "cp /var/www/codementee/nginx/nginx.conf /etc/nginx/nginx.conf"
echo "nginx -t"
echo "systemctl reload nginx"