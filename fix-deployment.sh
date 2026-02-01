#!/bin/bash

# Fix Codementee Deployment Issues
echo "🚀 Fixing Codementee deployment issues..."

# Stop any running containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Clean up Docker system
echo "🧹 Cleaning up Docker system..."
docker system prune -f
docker volume prune -f

# Remove node_modules and package-lock to fix dependency issues
echo "🔧 Cleaning frontend dependencies..."
rm -rf frontend/node_modules
rm -f frontend/package-lock.json
rm -f frontend/yarn.lock

# Install frontend dependencies with legacy peer deps to resolve conflicts
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
cd ..

# Build and start containers
echo "🏗️ Building and starting containers..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 30

# Check container status
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Copy Nginx configuration to the correct location
echo "🌐 Setting up Nginx configuration..."
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Check if services are running
echo "🏥 Health checks:"
echo "Backend health check:"
curl -f http://localhost:8001/health || echo "Backend not responding"

echo "Frontend check:"
curl -f http://localhost:3000 || echo "Frontend not responding"

echo "✅ Deployment fix complete!"
echo "🌍 Your site should now be available at: http://codementee.io"
echo "📊 Check logs with: docker-compose -f docker-compose.prod.yml logs -f"