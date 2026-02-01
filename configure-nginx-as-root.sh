#!/bin/bash

echo "🌐 Configuring Nginx as root user..."

# First, stop the nginx container if it's running (we'll use system nginx instead)
docker stop codementee-nginx 2>/dev/null || true
docker rm codementee-nginx 2>/dev/null || true

# Copy our simple nginx configuration that uses localhost ports
cp /var/www/codementee/nginx-simple.conf /etc/nginx/nginx.conf

# Test nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid!"
    
    # Reload nginx
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    
    # Check nginx status
    echo "📊 Nginx status:"
    systemctl status nginx --no-pager -l
    
    echo ""
    echo "✅ Nginx configuration complete!"
    echo "🌍 Your site should now be available at: http://codementee.io"
    echo ""
    echo "🔍 Testing connections:"
    echo "Frontend (port 3000): $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || echo 'Not responding')"
    echo "Backend (port 8001): $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8001/health || echo 'Not responding')"
else
    echo "❌ Nginx configuration has errors. Please check the config file."
fi