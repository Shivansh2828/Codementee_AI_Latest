#!/bin/bash

# This script runs DIRECTLY on the VPS
# Usage: Run this AFTER DNS is propagated and vps-setup-domain.sh is complete

echo "=========================================="
echo "SSL Certificate Setup (VPS Script)"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (or use sudo)${NC}"
    exit 1
fi

# Check DNS
echo -e "${YELLOW}Checking DNS configuration...${NC}"
DOMAIN_IP=$(dig +short codementee.io | tail -n1)
WWW_IP=$(dig +short www.codementee.io | tail -n1)
SERVER_IP=$(curl -s ifconfig.me)

echo "codementee.io resolves to: $DOMAIN_IP"
echo "www.codementee.io resolves to: $WWW_IP"
echo "This server's IP: $SERVER_IP"
echo ""

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo -e "${RED}✗ DNS not configured correctly!${NC}"
    echo "codementee.io should point to $SERVER_IP"
    echo "Please wait for DNS propagation or check your DNS settings."
    exit 1
fi

echo -e "${GREEN}✓ DNS is configured correctly${NC}"
echo ""

# Install Certbot
echo -e "${GREEN}Installing Certbot...${NC}"
apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily
systemctl stop nginx

# Get certificate
echo -e "${GREEN}Obtaining SSL certificate...${NC}"
certbot certonly --standalone \
    -d codementee.io \
    -d www.codementee.io \
    --non-interactive \
    --agree-tos \
    --email admin@codementee.io

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to obtain SSL certificate${NC}"
    systemctl start nginx
    exit 1
fi

echo -e "${GREEN}✓ SSL certificate obtained${NC}"

# Update Nginx configuration for HTTPS
echo -e "${GREEN}Updating Nginx configuration for HTTPS...${NC}"
cat > /etc/nginx/sites-available/codementee << 'EOF'
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name codementee.io www.codementee.io;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name codementee.io www.codementee.io;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/codementee.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codementee.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Test nginx configuration
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    systemctl start nginx
    echo -e "${GREEN}✓ Nginx started with HTTPS${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors${NC}"
    exit 1
fi

# Set up auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

# Update backend CORS
echo -e "${GREEN}Updating backend CORS settings...${NC}"
cd /var/www/codementee/backend
sed -i 's/CORS_ORIGINS=.*/CORS_ORIGINS=https:\/\/codementee.io,https:\/\/www.codementee.io/' .env
systemctl restart codementee-backend

echo ""
echo -e "${GREEN}=========================================="
echo "SSL Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Your site is now accessible at:"
echo -e "${GREEN}  ✓ https://codementee.io${NC}"
echo -e "${GREEN}  ✓ https://www.codementee.io${NC}"
echo ""
echo "Certificate will auto-renew every 90 days."
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
