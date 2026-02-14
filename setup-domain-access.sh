#!/bin/bash

echo "=========================================="
echo "Codementee Domain Setup Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will configure codementee.io to work with your VPS${NC}"
echo ""

# Step 1: Install Nginx
echo -e "${GREEN}Step 1: Installing Nginx...${NC}"
ssh root@62.72.13.129 << 'ENDSSH'
apt update
apt install -y nginx
systemctl enable nginx
systemctl start nginx
ENDSSH

# Step 2: Create Nginx configuration
echo -e "${GREEN}Step 2: Creating Nginx configuration...${NC}"
ssh root@62.72.13.129 << 'ENDSSH'
cat > /etc/nginx/sites-available/codementee << 'EOF'
# HTTP - Redirect to HTTPS (will be enabled after SSL setup)
server {
    listen 80;
    server_name codementee.io www.codementee.io;

    # Temporarily serve the site over HTTP
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
nginx -t

# Reload nginx
systemctl reload nginx
ENDSSH

echo ""
echo -e "${GREEN}Step 3: Nginx configured successfully!${NC}"
echo ""

# Step 3: Install Certbot for SSL
echo -e "${GREEN}Step 4: Installing Certbot for SSL certificates...${NC}"
ssh root@62.72.13.129 << 'ENDSSH'
apt install -y certbot python3-certbot-nginx
ENDSSH

echo ""
echo -e "${YELLOW}=========================================="
echo "DNS Configuration Required"
echo "==========================================${NC}"
echo ""
echo "Before proceeding, you MUST configure your DNS:"
echo ""
echo "1. Go to your domain registrar (where you bought codementee.io)"
echo "2. Add these DNS records:"
echo ""
echo "   Type: A"
echo "   Name: @"
echo "   Value: 62.72.13.129"
echo "   TTL: 3600"
echo ""
echo "   Type: A"
echo "   Name: www"
echo "   Value: 62.72.13.129"
echo "   TTL: 3600"
echo ""
echo "3. Wait 5-30 minutes for DNS propagation"
echo "4. Verify DNS is working:"
echo "   ping codementee.io"
echo "   ping www.codementee.io"
echo ""
echo -e "${RED}IMPORTANT: DNS must be configured before SSL setup!${NC}"
echo ""
echo "Once DNS is configured, run:"
echo -e "${GREEN}./setup-ssl-certificate.sh${NC}"
echo ""
echo "For now, you can access via:"
echo "  http://62.72.13.129:3000 (direct)"
echo "  http://62.72.13.129 (via nginx - once DNS points here)"
echo ""
