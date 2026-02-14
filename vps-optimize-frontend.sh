#!/bin/bash

# Run this script ON THE VPS to optimize frontend serving

echo "=========================================="
echo "Optimizing Frontend Performance"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (or use sudo)"
    exit 1
fi

# Update Nginx to serve static files directly
echo "Updating Nginx configuration to serve static files directly..."
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

    # Root directory for static files
    root /var/www/codementee/frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

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

    # Static files with aggressive caching
    location /static/ {
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
}
EOF

# Test nginx configuration
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration is valid"
    
    # Stop the Python HTTP server (no longer needed)
    echo "Stopping Python HTTP server..."
    systemctl stop codementee-frontend
    systemctl disable codementee-frontend
    
    # Reload nginx
    echo "Reloading Nginx..."
    systemctl reload nginx
    
    echo ""
    echo "=========================================="
    echo "✓ Frontend optimized successfully!"
    echo "=========================================="
    echo ""
    echo "Changes made:"
    echo "  - Nginx now serves static files directly (much faster)"
    echo "  - Gzip compression enabled"
    echo "  - Aggressive caching for static assets"
    echo "  - Python HTTP server stopped (no longer needed)"
    echo ""
    echo "Your site should now load much faster!"
    echo "Visit: https://codementee.io"
    echo ""
else
    echo "✗ Nginx configuration has errors"
    exit 1
fi
