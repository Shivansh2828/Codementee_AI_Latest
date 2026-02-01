#!/bin/bash
# Domain Setup Script for codementee.io
# Run this after DNS records are configured

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

log "🌐 Setting up codementee.io domain configuration..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root for SSL setup"
fi

# Navigate to application directory
cd /var/www/codementee

# Check DNS propagation
log "🔍 Checking DNS propagation..."
for domain in "codementee.io" "www.codementee.io" "api.codementee.io"; do
    info "Checking $domain..."
    if nslookup $domain | grep -q "62.72.13.129"; then
        log "✅ $domain is pointing to your server"
    else
        warn "⚠️  $domain may not be fully propagated yet"
        warn "    Please wait for DNS propagation (can take up to 24 hours)"
        warn "    You can continue, but SSL setup might fail"
    fi
done

# Create nginx logs directory
log "📁 Creating nginx logs directory..."
mkdir -p logs/nginx

# Stop current containers
log "🛑 Stopping current containers..."
docker-compose -f docker-compose.prod.yml down

# Rebuild with new configuration
log "🔄 Rebuilding containers with domain configuration..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to start
log "⏳ Waiting for services to start..."
sleep 30

# Test if nginx is working
log "🧪 Testing nginx configuration..."
if curl -f http://localhost > /dev/null 2>&1; then
    log "✅ Nginx is working"
else
    error "❌ Nginx is not responding"
fi

# Install certbot for SSL
log "🔐 Installing certbot for SSL certificates..."
apt update
apt install -y certbot python3-certbot-nginx

# Get SSL certificates
log "🔒 Setting up SSL certificates..."
info "This will request SSL certificates for:"
info "  - codementee.io"
info "  - www.codementee.io" 
info "  - api.codementee.io"

# Stop nginx temporarily for certbot
docker stop codementee-nginx

# Get certificates using standalone mode
certbot certonly --standalone --agree-tos --no-eff-email \
    --email support@codementee.com \
    -d codementee.io \
    -d www.codementee.io \
    -d api.codementee.io

if [ $? -eq 0 ]; then
    log "✅ SSL certificates obtained successfully!"
    
    # Update nginx configuration with SSL
    log "🔧 Updating nginx configuration with SSL..."
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    upstream frontend {
        server frontend:80;
    }
    
    upstream backend {
        server backend:8001;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name codementee.io www.codementee.io api.codementee.io;
        return 301 https://$server_name$request_uri;
    }

    # Main website HTTPS (codementee.io and www.codementee.io)
    server {
        listen 443 ssl http2;
        server_name codementee.io www.codementee.io;

        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/codementee.io/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/codementee.io/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
        }
    }

    # API subdomain HTTPS (api.codementee.io)
    server {
        listen 443 ssl http2;
        server_name api.codementee.io;

        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/codementee.io/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/codementee.io/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Rate limiting for API
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Fallback for direct IP access (redirect to domain)
    server {
        listen 80 default_server;
        listen 443 ssl default_server;
        server_name _;
        
        # Dummy SSL certificate for default server
        ssl_certificate /etc/letsencrypt/live/codementee.io/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/codementee.io/privkey.pem;
        
        return 301 https://codementee.io$request_uri;
    }
}
EOF

    # Update docker-compose to mount SSL certificates
    log "🐳 Updating docker-compose with SSL certificates..."
    cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: codementee-frontend
    restart: unless-stopped
    networks:
      - codementee-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: codementee-backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    depends_on:
      - redis
    networks:
      - codementee-network
    volumes:
      - ./logs:/app/logs

  redis:
    image: redis:7-alpine
    container_name: codementee-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - codementee-network

  nginx:
    image: nginx:alpine
    container_name: codementee-nginx
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - codementee-network

volumes:
  redis_data:
    driver: local

networks:
  codementee-network:
    driver: bridge
EOF

    # Restart containers with SSL
    log "🔄 Restarting containers with SSL configuration..."
    docker-compose -f docker-compose.prod.yml up -d --force-recreate

    # Set up automatic certificate renewal
    log "🔄 Setting up automatic certificate renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'docker restart codementee-nginx'") | crontab -

    log "🎉 Domain setup completed successfully!"
    log ""
    log "🌐 Your website is now available at:"
    log "   ✅ https://codementee.io"
    log "   ✅ https://www.codementee.io"
    log "   ✅ https://api.codementee.io"
    log ""
    log "🔒 SSL certificates are installed and will auto-renew"
    log "🔄 HTTP traffic is automatically redirected to HTTPS"
    
else
    warn "❌ SSL certificate setup failed"
    warn "This might be because:"
    warn "  1. DNS records are not fully propagated yet"
    warn "  2. Domain is not pointing to this server"
    warn "  3. Port 80/443 is blocked"
    warn ""
    warn "You can:"
    warn "  1. Wait for DNS propagation and try again"
    warn "  2. Use the website without SSL for now"
    
    # Start nginx without SSL
    docker start codementee-nginx
fi

# Test final setup
log "🧪 Testing final setup..."
sleep 10

if curl -f https://codementee.io > /dev/null 2>&1; then
    log "✅ HTTPS website is working!"
elif curl -f http://codementee.io > /dev/null 2>&1; then
    log "✅ HTTP website is working (SSL setup may have failed)"
else
    warn "⚠️  Website may not be fully ready yet"
fi

log "🎯 Setup complete! Your website should be accessible at https://codementee.io"