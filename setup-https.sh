#!/bin/bash

echo "🔒 Setting up HTTPS with Let's Encrypt for codementee.io"
echo "======================================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run as root. Use: sudo ./setup-https.sh"
    exit 1
fi

echo "📦 Installing Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

echo "🔍 Testing current Nginx configuration..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration has errors. Please fix before continuing."
    exit 1
fi

echo "🌐 Obtaining SSL certificate for codementee.io and www.codementee.io..."
certbot --nginx -d codementee.io -d www.codementee.io --non-interactive --agree-tos --email support@codementee.io

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained successfully!"
    
    echo "🔄 Reloading Nginx with SSL configuration..."
    systemctl reload nginx
    
    echo "🧪 Testing HTTPS..."
    curl -I https://codementee.io | head -1
    
    echo ""
    echo "✅ HTTPS setup complete!"
    echo "🌍 Your site is now available at:"
    echo "   https://codementee.io"
    echo "   https://www.codementee.io"
    echo ""
    echo "🔒 SSL certificate will auto-renew via cron job"
    echo "📅 Certificate expires in 90 days and will auto-renew"
    
else
    echo "❌ SSL certificate setup failed!"
    echo "🔍 Common issues:"
    echo "   - Domain not pointing to this server"
    echo "   - Port 80/443 not accessible"
    echo "   - Nginx not running"
    echo ""
    echo "🛠️ Troubleshooting:"
    echo "   - Check DNS: dig codementee.io"
    echo "   - Check ports: netstat -tlnp | grep :80"
    echo "   - Check Nginx: systemctl status nginx"
fi