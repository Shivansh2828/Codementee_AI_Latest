#!/bin/bash
# Fix 502 Bad Gateway Error

echo "🔧 Fixing 502 Bad Gateway Error"
echo "==============================="

echo "1. Checking backend status..."
curl -I http://localhost:8001/api/companies || echo "❌ Backend not responding"

echo ""
echo "2. Checking nginx configuration..."
sudo nginx -t

echo ""
echo "3. Removing broken nginx configs..."
sudo rm -f /etc/nginx/sites-enabled/codementee
sudo rm -f /etc/nginx/sites-available/codementee

echo ""
echo "4. Creating simple working nginx config..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm;

    server_name _;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo ""
echo "5. Enabling default site..."
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

echo ""
echo "6. Testing nginx config..."
sudo nginx -t

echo ""
echo "7. Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "8. Testing website..."
echo "HTTP test:"
curl -I http://62.72.13.129 | head -3

echo ""
echo "Backend API test:"
curl -I http://62.72.13.129/api/companies | head -3

echo ""
echo "✅ Fix completed!"
echo ""
echo "🌐 Test your website now:"
echo "   - HTTP: http://62.72.13.129"
echo "   - Domain: http://codementee.io (might redirect to HTTPS)"
echo ""
echo "If it works, we can add HTTPS back later."