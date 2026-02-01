#!/bin/bash
# Fix Mobile Performance and Payment Issues

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

log "🚀 Starting Mobile Performance and Payment Issue Fixes..."

# Check if we're in the right directory
if [[ ! -f "docker-compose.prod.yml" ]]; then
    error "Please run this script from the project root directory"
fi

# Stop containers
log "🛑 Stopping containers..."
docker-compose -f docker-compose.prod.yml down || warn "No containers to stop"

# Clean up Docker system
log "🧹 Cleaning up Docker system..."
docker system prune -f || warn "Docker cleanup failed"

# Rebuild containers with new optimizations
log "🏗️  Rebuilding containers with mobile optimizations..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start containers
log "🚀 Starting optimized containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
log "⏳ Waiting for services to start..."
sleep 30

# Check container status
log "📊 Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Test backend health
log "🏥 Testing backend health..."
for i in {1..10}; do
    if curl -f http://localhost:8001/api/health > /dev/null 2>&1; then
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

# Show recent logs
log "📝 Recent backend logs:"
docker logs codementee-backend --tail 20

log "📝 Recent frontend logs:"
docker logs codementee-frontend --tail 20

log "🎉 Fixes deployed successfully!"
log ""
log "📋 What was fixed:"
log "   🔧 Payment Issue: Free users can now upgrade without 'email exists' error"
log "   📱 Mobile Performance: Optimized Nginx config for faster mobile loading"
log "   🚀 Loading Speed: Added preconnect, DNS prefetch, and critical CSS"
log "   📊 Caching: Improved caching strategy for mobile devices"
log ""
log "🔧 Test the fixes:"
log "   1. Register as free user: http://62.72.13.129:3000/register"
log "   2. Try booking + payment flow"
log "   3. Test on iPhone/mobile devices"
log ""
log "📱 Mobile optimizations applied:"
log "   ✅ Better gzip compression"
log "   ✅ Mobile-specific meta tags"
log "   ✅ Preconnect to external resources"
log "   ✅ Critical CSS inlining"
log "   ✅ Loading spinner for better UX"
log "   ✅ Optimized caching headers"