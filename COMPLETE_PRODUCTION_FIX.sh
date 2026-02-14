#!/bin/bash

# Complete production fix - Run on VPS
# This fixes slow loading and optimizes the entire setup

echo "=========================================="
echo "Complete Production Fix"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (or use sudo)"
    exit 1
fi

cd /var/www/codementee

# Step 1: Pull latest code
echo "Step 1: Pulling latest code..."
git pull

# Step 2: Rebuild frontend with production config
echo ""
echo "Step 2: Rebuilding frontend..."
cd frontend

# Create production environment file
cat > .env.production << 'EOF'
REACT_APP_BACKEND_URL=/api
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
GENERATE_SOURCEMAP=false
EOF

# Build frontend
yarn build

if [ $? -ne 0 ]; then
    echo "✗ Frontend build failed"
    exit 1
fi

cd ..

# Step 3: Optimize Nginx configuration
echo ""
echo "Step 3: Optimizing Nginx configuration..."
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
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Root directory for static files
    root /var/www/codementee/frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript image/svg+xml;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files with aggressive caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Images and media
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # CSS and JavaScript
    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Fonts
    location ~* \.(woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Frontend - serve index.html for all routes (React Router)
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Favicon and manifest
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }

    location = /manifest.json {
        expires 1d;
        add_header Cache-Control "public";
    }

    location = /robots.txt {
        access_log off;
        log_not_found off;
    }
}
EOF

# Test nginx configuration
nginx -t

if [ $? -ne 0 ]; then
    echo "✗ Nginx configuration has errors"
    exit 1
fi

# Step 4: Stop Python HTTP server (no longer needed)
echo ""
echo "Step 4: Stopping Python HTTP server..."
systemctl stop codementee-frontend 2>/dev/null
systemctl disable codementee-frontend 2>/dev/null

# Step 5: Reload Nginx
echo ""
echo "Step 5: Reloading Nginx..."
systemctl reload nginx

# Step 6: Restart backend
echo ""
echo "Step 6: Restarting backend..."
systemctl restart codementee-backend

# Step 7: Verify services
echo ""
echo "Step 7: Verifying services..."
sleep 2

NGINX_STATUS=$(systemctl is-active nginx)
BACKEND_STATUS=$(systemctl is-active codementee-backend)

echo "Nginx: $NGINX_STATUS"
echo "Backend: $BACKEND_STATUS"

if [ "$NGINX_STATUS" = "active" ] && [ "$BACKEND_STATUS" = "active" ]; then
    echo ""
    echo "=========================================="
    echo "✓ Production Fix Complete!"
    echo "=========================================="
    echo ""
    echo "Improvements made:"
    echo "  ✓ Frontend rebuilt with production config"
    echo "  ✓ Nginx serves static files directly (much faster)"
    echo "  ✓ Gzip compression enabled"
    echo "  ✓ Aggressive caching for static assets"
    echo "  ✓ Python HTTP server removed"
    echo "  ✓ All services running"
    echo ""
    echo "Your site should now:"
    echo "  - Load much faster (no more slow loading)"
    echo "  - Work on first try (no need to refresh)"
    echo "  - Have proper caching"
    echo ""
    echo "Visit: https://codementee.io"
    echo ""
    echo "Clear your browser cache (Ctrl+Shift+R) for best results!"
    echo ""
else
    echo ""
    echo "⚠ Warning: Some services may not be running properly"
    echo "Check logs:"
    echo "  journalctl -u nginx -n 50"
    echo "  journalctl -u codementee-backend -n 50"
fi
