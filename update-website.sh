#!/bin/bash
# Quick Update Script for Codementee
# Run this script whenever you push changes to GitHub

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

log "🔄 Updating Codementee website..."

# Check if running as codementee user
if [[ $(whoami) != "codementee" ]]; then
   error "This script must be run as codementee user. Run: su - codementee"
fi

# Navigate to application directory
cd /var/www/codementee || error "Cannot access /var/www/codementee directory"

# Pull latest changes from GitHub
log "📥 Pulling latest changes from GitHub..."
git pull origin main || error "Failed to pull changes from GitHub"

# Stop current containers
log "🛑 Stopping current containers..."
docker-compose -f docker-compose.prod.yml down

# Rebuild and start containers
log "🔄 Rebuilding and starting containers..."
docker-compose -f docker-compose.prod.yml up --build -d || error "Failed to rebuild containers"

# Wait for services to start
log "⏳ Waiting for services to start..."
sleep 30

# Test if website is working
log "🧪 Testing website..."
if curl -f http://localhost > /dev/null 2>&1; then
    log "✅ Website is working!"
else
    warn "⚠️  Website may not be ready yet, check logs"
fi

# Show container status
log "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

log "🎉 Update completed!"
log "🌐 Your website: https://codementee.io"
log "🔧 API endpoint: https://api.codementee.io"

log "📝 Useful commands:"
log "   View logs: docker logs codementee-backend"
log "   Restart: docker-compose -f docker-compose.prod.yml restart"