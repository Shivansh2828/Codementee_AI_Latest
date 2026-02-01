#!/bin/bash

echo "🌐 Configuring Nginx as root user..."

# Copy our custom nginx configuration
cp /var/www/codementee/nginx/nginx.conf /etc/nginx/nginx.conf

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
else
    echo "❌ Nginx configuration has errors. Please check the config file."
fi