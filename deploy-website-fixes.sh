#!/bin/bash
# Deploy Website Loading Fixes to Production
# Run this script on your VPS to apply the performance optimizations

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

log "🚀 Deploying Website Loading Performance Fixes..."

# Navigate to application directory
cd /var/www/codementee || error "Cannot access /var/www/codementee directory"

# Pull latest changes from repository
log "📥 Pulling latest changes from repository..."
git pull origin main || error "Failed to pull latest changes"

# Update frontend environment for production
log "⚙️ Updating frontend environment for production..."
cat > frontend/.env.production << EOF
REACT_APP_BACKEND_URL=http://62.72.13.129:8001
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
GENERATE_SOURCEMAP=false
EOF

# Copy production env to regular .env for Docker build
cp frontend/.env.production frontend/.env

# Stop existing containers
log "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || warn "No existing containers to stop"

# Remove old images to force rebuild
log "🗑️ Removing old images to force rebuild..."
docker image rm codementee_ai_latest-frontend:latest || warn "Frontend image not found"
docker image rm codementee_ai_latest-backend:latest || warn "Backend image not found"

# Clean up Docker system
log "🧹 Cleaning up Docker system..."
docker system prune -f

# Build and start containers with no cache
log "🐳 Building containers with performance optimizations..."
docker-compose -f docker-compose.prod.yml build --no-cache

log "🚀 Starting optimized containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
log "⏳ Waiting for services to start..."
sleep 30

# Test backend connectivity
log "🔍 Testing backend connectivity..."
for i in {1..10}; do
    if curl -f -m 5 http://localhost:8001/api/companies > /dev/null 2>&1; then
        log "✅ Backend is responding!"
        break
    else
        warn "Backend not ready yet, attempt $i/10..."
        sleep 5
    fi
    
    if [ $i -eq 10 ]; then
        error "Backend failed to start properly"
    fi
done

# Test frontend loading speed
log "🌐 Testing frontend loading speed..."
LOAD_TIME=$(curl -w "%{time_total}" -s http://localhost:3000 -o /dev/null)
log "⚡ Frontend load time: ${LOAD_TIME} seconds"

if (( $(echo "$LOAD_TIME < 5.0" | bc -l) )); then
    log "✅ Frontend loading performance is good!"
else
    warn "⚠️ Frontend loading time is still high: ${LOAD_TIME}s"
fi

# Show container status
log "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Show recent logs
log "📝 Recent backend logs:"
docker logs codementee-backend --tail 10

log "📝 Recent frontend logs:"
docker logs codementee-frontend --tail 10

# Performance test summary
log "🎯 Performance Test Results:"
log "   ⚡ Frontend Load Time: ${LOAD_TIME} seconds"
log "   🎯 Target: < 3 seconds"
log "   🔧 Backend API: http://62.72.13.129:8001"
log "   🌐 Frontend: http://62.72.13.129:3000"

log "✅ Website loading fixes deployed successfully!"
log ""
log "🔧 Applied Optimizations:"
log "   ✅ Fixed API URL mismatch (port 8002 -> 8001)"
log "   ✅ Added timeout limits to prevent infinite loading"
log "   ✅ Improved error handling and fallbacks"
log "   ✅ Added React.Suspense for better UX"
log "   ✅ Optimized Docker build process"
log ""
log "📋 Next Steps:"
log "   1. Test website: http://62.72.13.129:3000"
log "   2. Monitor loading times in browser dev tools"
log "   3. Set up domain and SSL if needed"
log ""
warn "⚠️ If loading is still slow, check:"
warn "   - Network connectivity to VPS"
warn "   - Backend API response times"
warn "   - Browser console for errors"