#!/bin/bash

# 🎯 PERMANENT DEPLOYMENT FIX - NO MORE DOCKER ISSUES
# This script bypasses Docker completely and deploys directly to nginx

echo "🔥 PERMANENT DEPLOYMENT FIX - BYPASSING DOCKER"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop Docker containers
echo -e "${YELLOW}1. Stopping Docker containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Build frontend locally
echo -e "${YELLOW}2. Building frontend locally...${NC}"
cd frontend
rm -rf build node_modules/.cache
npm install --legacy-peer-deps
GENERATE_SOURCEMAP=false npm run build

if [ ! -f "build/static/js/main."*.js ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully${NC}"
ls -la build/static/js/main.*.js

cd ..

# Install nginx directly (if not installed)
echo -e "${YELLOW}3. Setting up nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt update
    apt install -y nginx
fi

# Stop nginx
systemctl stop nginx

# Create nginx config for Codementee
echo -e "${YELLOW}4. Creating nginx configuration...${NC}"
cat > /etc/nginx/sites-available/codementee << 'EOF'
server {
    listen 3000;
    server_name _;
    
    root /var/www/codementee/frontend/build;
    index index.html;
    
    # Disable caching for HTML
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Error and access logs
    error_log /var/log/nginx/codementee_error.log;
    access_log /var/log/nginx/codementee_access.log;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/codementee /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi

# Start nginx
systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}✅ Nginx configured and started${NC}"

# Setup backend with systemd
echo -e "${YELLOW}5. Setting up backend service...${NC}"
cd backend

# Install Python dependencies
pip3 install -r requirements.txt

# Create systemd service for backend
cat > /etc/systemd/system/codementee-backend.service << EOF
[Unit]
Description=Codementee Backend API
After=network.target

[Service]
Type=exec
User=root
WorkingDirectory=/var/www/codementee/backend
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/local/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start backend
systemctl daemon-reload
systemctl stop codementee-backend || true
systemctl start codementee-backend
systemctl enable codementee-backend

echo -e "${GREEN}✅ Backend service started${NC}"

cd ..

# Verify deployment
echo -e "${YELLOW}6. Verifying deployment...${NC}"

# Check if files exist
if [ -f "frontend/build/index.html" ]; then
    echo -e "${GREEN}✅ Frontend files exist${NC}"
else
    echo -e "${RED}❌ Frontend files missing${NC}"
    exit 1
fi

# Check nginx status
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
    exit 1
fi

# Check backend status
if systemctl is-active --quiet codementee-backend; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    exit 1
fi

# Test frontend
if curl -s http://localhost:3000 | grep -q "Codementee"; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
fi

# Test backend
if curl -s http://localhost:8001/api/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ Backend is accessible${NC}"
else
    echo -e "${RED}❌ Backend is not accessible${NC}"
fi

echo ""
echo -e "${GREEN}🎉 PERMANENT DEPLOYMENT COMPLETE!${NC}"
echo ""
echo -e "${YELLOW}📋 SERVICES STATUS:${NC}"
echo "   Frontend: http://localhost:3000 (nginx)"
echo "   Backend:  http://localhost:8001 (systemd service)"
echo ""
echo -e "${YELLOW}📋 MANAGEMENT COMMANDS:${NC}"
echo "   Restart frontend: systemctl restart nginx"
echo "   Restart backend:  systemctl restart codementee-backend"
echo "   View logs:        journalctl -u codementee-backend -f"
echo "   Nginx logs:       tail -f /var/log/nginx/codementee_error.log"
echo ""
echo -e "${GREEN}✅ NO MORE DOCKER ISSUES - DIRECT DEPLOYMENT COMPLETE!${NC}"