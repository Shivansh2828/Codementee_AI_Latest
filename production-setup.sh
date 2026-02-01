#!/bin/bash
# Codementee Production Server Setup Script
# Run this on your Hostinger VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

log "🚀 Starting Codementee Production Server Setup..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

# Update system
log "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log "🔧 Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    htop \
    nginx \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    unzip

# Install Docker
log "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
log "🐙 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js 18 LTS
log "📦 Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Create application user and directories
log "👤 Creating application user and directories..."
useradd -m -s /bin/bash codementee || true
usermod -aG docker codementee

# Create application directories
mkdir -p /var/www/codementee
mkdir -p /var/log/codementee
mkdir -p /var/backups/codementee
mkdir -p /etc/codementee

# Set permissions
chown -R codementee:codementee /var/www/codementee
chown -R codementee:codementee /var/log/codementee
chown -R codementee:codementee /var/backups/codementee

# Configure firewall
log "🔒 Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
log "🛡️  Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create basic nginx configuration
log "🌐 Setting up Nginx..."
cat > /etc/nginx/sites-available/codementee << 'EOF'
server {
    listen 80;
    server_name codementee.io www.codementee.io api.codementee.io;
    
    # Temporary redirect to show setup page
    location / {
        return 200 'Codementee is being set up. Please wait...';
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/codementee /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Verify installations
log "✅ Verifying installations..."
docker --version || error "Docker installation failed"
docker-compose --version || error "Docker Compose installation failed"
node --version || error "Node.js installation failed"
nginx -v || error "Nginx installation failed"

log "🎉 Server setup completed successfully!"
log "📋 Next steps:"
log "   1. Upload your application code"
log "   2. Configure environment variables"
log "   3. Deploy with Docker"
log "   4. Set up SSL certificates"

info "Server is ready for Codementee deployment!"