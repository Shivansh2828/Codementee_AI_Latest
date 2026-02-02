#!/bin/bash
# Fix Frontend API URL and Redeploy

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

log "🔧 Fixing Frontend API URL Configuration..."

# Create the corrected frontend .env file
log "📝 Creating corrected frontend .env file..."
cat > frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=http://62.72.13.129:8001
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
EOF

log "✅ Frontend .env updated with correct API URL"

# Create deployment commands for VPS
log "📋 Creating VPS deployment commands..."
cat > vps-frontend-fix.sh << 'EOF'
#!/bin/bash
# Run this on the VPS to fix the frontend

set -e

echo "🔧 Fixing Frontend API URL on VPS..."

# Navigate to project directory
cd /var/www/codementee

# Update frontend .env
echo "📝 Updating frontend .env..."
cat > frontend/.env << 'ENVEOF'
REACT_APP_BACKEND_URL=http://62.72.13.129:8001
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
ENVEOF

# Stop frontend container
echo "🛑 Stopping frontend container..."
docker-compose -f docker-compose.prod.yml stop codementee-frontend

# Rebuild frontend with new environment
echo "🏗️  Rebuilding frontend..."
cd frontend
rm -rf build node_modules package-lock.json yarn.lock || true
npm install --legacy-peer-deps
npm run build
cd ..

# Restart frontend container
echo "🚀 Restarting frontend container..."
docker-compose -f docker-compose.prod.yml up -d --build codementee-frontend

# Wait for container to start
echo "⏳ Waiting for frontend to start..."
sleep 15

# Test frontend
echo "🧪 Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is working!"
else
    echo "❌ Frontend test failed"
fi

echo "🎉 Frontend fix completed!"
echo "🌐 Test your website: http://62.72.13.129:3000"
EOF

chmod +x vps-frontend-fix.sh

log "🎯 Frontend API URL fix prepared!"
log ""
log "📋 Next Steps:"
log "   1. Copy the vps-frontend-fix.sh script to your VPS"
log "   2. SSH to your VPS: ssh root@62.72.13.129"
log "   3. Switch to codementee user: su - codementee"
log "   4. Navigate to project: cd /var/www/codementee"
log "   5. Run the fix script: ./vps-frontend-fix.sh"
log ""
log "🔧 Or run these commands directly on VPS:"
log "   scp vps-frontend-fix.sh root@62.72.13.129:/var/www/codementee/"
log "   ssh root@62.72.13.129"
log "   su - codementee"
log "   cd /var/www/codementee"
log "   chmod +x vps-frontend-fix.sh"
log "   ./vps-frontend-fix.sh"
log ""
warn "⚠️  The issue is that frontend is trying to connect to https://api.codementee.io"
warn "   but the backend is actually running on http://62.72.13.129:8001"
warn "   This fix updates the frontend to use the correct API URL."