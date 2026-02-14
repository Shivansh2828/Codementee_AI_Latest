#!/bin/bash

# This script runs DIRECTLY on the VPS
# Usage: Run this on your VPS after DNS is configured

echo "=========================================="
echo "Codementee Domain Setup (VPS Script)"
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

# Step 1: Install Nginx
echo -e "${GREEN}Step 1: Installing Nginx...${NC}"
apt update
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# Step 2: Create Nginx configuration
echo -e "${GREEN}Step 2: Creating Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/codementee << 'EOF'
# HTTP Configuration
server {
    listen 80;
    server_name codementee.io www.codementee.io;

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
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/codementee /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Step 1 Complete: Nginx Configured"
echo "==========================================${NC}"
echo ""
echo "Your site should now be accessible at:"
echo "  http://codementee.io"
echo "  http://www.codementee.io"
echo ""
echo -e "${YELLOW}Next: Install SSL Certificate${NC}"
echo "Wait 10-30 minutes for DNS to fully propagate, then run:"
echo "  ./vps-setup-ssl.sh"
echo ""
