#!/bin/bash
# Fix Deployment Permission Issues and Deploy Website Fixes
# Run this script on your VPS to resolve permission issues and deploy optimizations

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

log "🔧 Fixing deployment permission issues and applying website loading fixes..."

# Navigate to application directory
cd /var/www/codementee || error "Cannot access /var/www/codementee directory"

# Stop existing containers first
log "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || warn "No existing containers to stop"

# Fix ownership and permissions
log "🔐 Fixing file ownership and permissions..."
sudo chown -R $(whoami):$(whoami) . || warn "Could not change ownership"
sudo chmod -R 755 . || warn "Could not change permissions"

# Remove problematic build directories
log "🗑️ Cleaning up old build files..."
rm -rf frontend/build || warn "No build directory to remove"
rm -rf frontend/node_modules || warn "No node_modules to remove"
rm -rf frontend/package-lock.json || warn "No package-lock.json to remove"

# Pull latest changes
log "📥 Pulling latest changes from repository..."
git pull origin main || error "Failed to pull latest changes"

# Update frontend environment for production
log "⚙️ Updating frontend environment for production..."
cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=http://62.72.13.129:8001
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
GENERATE_SOURCEMAP=false
EOF

# Clean Docker system
log "🧹 Cleaning up Docker system..."
docker system prune -af || warn "Docker cleanup failed"

# Remove old images
log "🗑️ Removing old images..."
docker image rm $(docker images -q) 2>/dev/null || warn "No images to remove"

# Build containers without local build step (let Docker handle it)
log "🐳 Building containers (Docker will handle the build)..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start containers
log "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
log "⏳ Waiting for services to start..."
sleep 45

# Test backend
log "🔍 Testing backend..."
for i in {1..15}; do
    if curl -f -m 10 http://localhost:8001/api/companies > /dev/null 2>&1; then
        log "✅ Backend is responding!"
        break
    else
        warn "Backend not ready yet, attempt $i/15..."
        sleep 10
    fi
    
    if [ $i -eq 15 ]; then
        warn "Backend may not be ready, but continuing..."
    fi
done

# Test frontend
log "🌐 Testing frontend..."
if curl -f -m 10 http://localhost:3000 > /dev/null 2>&1; then
    LOAD_TIME=$(curl -w "%{time_total}" -s -m 10 http://localhost:3000 -o /dev/null)
    log "✅ Frontend is responding! Load time: ${LOAD_TIME}s"
else
    warn "Frontend may not be ready yet"
fi

# Show container status
log "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Show logs for debugging
log "📝 Recent logs:"
echo "=== Backend Logs ==="
docker logs codementee-backend --tail 20 2>/dev/null || warn "Could not get backend logs"
echo ""
echo "=== Frontend Logs ==="
docker logs codementee-frontend --tail 20 2>/dev/null || warn "Could not get frontend logs"

log "✅ Deployment completed!"
log ""
log "🎯 Test your website:"
log "   🌐 Frontend: http://62.72.13.129:3000"
log "   🔧 Backend: http://62.72.13.129:8001/api/companies"
log ""
log "🔧 If issues persist:"
log "   📊 Check status: docker-compose -f docker-compose.prod.yml ps"
log "   📝 View logs: docker logs codementee-frontend"
log "   🔄 Restart: docker-compose -f docker-compose.prod.yml restart"