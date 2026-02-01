#!/bin/bash
# Codementee Production Deployment Script
# Run this script on your VPS to deploy the application

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as codementee user
if [[ $(whoami) != "codementee" ]]; then
   error "This script must be run as codementee user. Run: su - codementee"
fi

log "🚀 Starting Codementee Production Deployment..."

# Navigate to application directory
cd /var/www/codementee || error "Cannot access /var/www/codementee directory"

# Stop existing containers if running
log "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || warn "No existing containers to stop"

# Clean up Docker system
log "🧹 Cleaning up Docker system..."
docker system prune -f || warn "Docker cleanup failed"

# Remove old images
log "🗑️  Removing old images..."
docker image prune -f || warn "Image cleanup failed"

# Create logs directory
log "📁 Creating logs directory..."
mkdir -p logs

# Fix frontend dependencies
log "🔧 Fixing frontend dependencies..."
cd frontend

# Remove node_modules and package-lock.json if they exist
rm -rf node_modules package-lock.json yarn.lock || true

# Install dependencies with legacy peer deps
log "📦 Installing frontend dependencies..."
npm install --legacy-peer-deps || error "Frontend dependency installation failed"

# Build frontend locally first to test
log "🏗️  Building frontend locally..."
npm run build || error "Frontend build failed"

cd ..

# Build and start containers
log "🐳 Building and starting Docker containers..."
docker-compose -f docker-compose.prod.yml up --build -d || error "Docker deployment failed"

# Wait for services to start
log "⏳ Waiting for services to start..."
sleep 30

# Check container status
log "📊 Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Test backend health
log "🏥 Testing backend health..."
for i in {1..10}; do
    if curl -f http://localhost:8001/api/companies > /dev/null 2>&1; then
        log "✅ Backend is healthy!"
        break
    else
        warn "Backend not ready yet, attempt $i/10..."
        sleep 10
    fi
    
    if [ $i -eq 10 ]; then
        error "Backend failed to start properly"
    fi
done

# Test frontend
log "🌐 Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Frontend is healthy!"
else
    warn "Frontend may not be ready yet"
fi

# Show running containers
log "📋 Running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Show logs for debugging
log "📝 Recent backend logs:"
docker logs codementee-backend --tail 20

log "📝 Recent frontend logs:"
docker logs codementee-frontend --tail 20

log "🎉 Deployment completed successfully!"
log ""
log "📋 Access Information:"
log "   🌐 Frontend: http://62.72.13.129:3000"
log "   🔧 Backend API: http://62.72.13.129:8001"
log "   📊 API Test: http://62.72.13.129:8001/api/companies"
log ""
log "🔧 Useful Commands:"
log "   📊 Check status: docker-compose -f docker-compose.prod.yml ps"
log "   📝 View logs: docker logs codementee-backend"
log "   🔄 Restart: docker-compose -f docker-compose.prod.yml restart"
log "   🛑 Stop: docker-compose -f docker-compose.prod.yml down"
log ""
warn "⚠️  Next Steps:"
warn "   1. Test the application: http://62.72.13.129:3000"
warn "   2. Configure DNS for codementee.io to point to 62.72.13.129"
warn "   3. Set up SSL certificates after DNS propagation"
warn "   4. Configure Nginx reverse proxy for production"