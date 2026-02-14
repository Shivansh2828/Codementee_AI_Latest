#!/bin/bash

echo "=========================================="
echo "SSL Certificate Setup for codementee.io"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking DNS configuration...${NC}"
echo ""

# Check if DNS is configured
if ping -c 1 codementee.io &> /dev/null; then
    echo -e "${GREEN}✓ codementee.io resolves correctly${NC}"
else
    echo -e "${RED}✗ codementee.io does not resolve${NC}"
    echo "Please configure DNS first!"
    exit 1
fi

if ping -c 1 www.codementee.io &> /dev/null; then
    echo -e "${GREEN}✓ www.codementee.io resolves correctly${NC}"
else
    echo -e "${RED}✗ www.codementee.io does not resolve${NC}"
    echo "Please configure DNS first!"
    exit 1
fi

echo ""
echo -e "${GREEN}DNS is configured correctly!${NC}"
echo ""
echo -e "${YELLOW}Installing SSL certificate...${NC}"
echo ""

# Install SSL certificate
ssh root@62.72.13.129 << 'ENDSSH'
# Stop nginx temporarily
systemctl stop nginx

# Get certificate
certbot certonly --standalone -d codementee.io -d www.codementee.io --non-interactive --agree-tos --email admin@codementee.io

# Update Nginx configuration for HTTPS
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

# Start nginx
systemctl start nginx

# Set up auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo "SSL certificate installed successfully!"
ENDSSH

echo ""
echo -e "${GREEN}=========================================="
echo "SSL Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Your site is now accessible at:"
echo -e "${GREEN}  https://codementee.io${NC}"
echo -e "${GREEN}  https://www.codementee.io${NC}"
echo ""
echo "Certificate will auto-renew every 90 days."
echo ""

# Update backend CORS
echo -e "${YELLOW}Updating backend CORS settings...${NC}"
ssh root@62.72.13.129 << 'ENDSSH'
cd /var/www/codementee/backend
sed -i 's/CORS_ORIGINS=.*/CORS_ORIGINS=https:\/\/codementee.io,https:\/\/www.codementee.io/' .env
systemctl restart codementee-backend
ENDSSH

echo -e "${GREEN}Backend CORS updated!${NC}"
echo ""
echo -e "${GREEN}✓ All done! Your site is live at https://codementee.io${NC}"
echo ""
