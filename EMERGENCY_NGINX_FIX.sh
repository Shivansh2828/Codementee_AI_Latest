#!/bin/bash

# Emergency fix for Nginx configuration conflict
# Run this ON THE VPS

echo "=========================================="
echo "Emergency Nginx Configuration Fix"
echo "=========================================="
echo ""

# Backup current nginx.conf
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Remove the conflicting server block from nginx.conf
# The server block in sites-available/codementee should be the only one
echo "Removing conflicting configuration from nginx.conf..."

# Create a clean nginx.conf without the server block
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/modules-enabled/*.conf;

events {
    worker_connections 768;
}

http {
    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    gzip on;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Test configuration
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Configuration is valid"
    
    # Restart Nginx
    echo "Restarting Nginx..."
    systemctl restart nginx
    
    echo ""
    echo "=========================================="
    echo "✅ Nginx Fixed!"
    echo "=========================================="
    echo ""
    echo "Testing site..."
    sleep 2
    curl -I https://codementee.io
    
else
    echo "✗ Configuration has errors"
    echo "Restoring backup..."
    cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
    exit 1
fi
EOF

chmod +x EMERGENCY_NGINX_FIX.sh
./EMERGENCY_NGINX_FIX.sh
