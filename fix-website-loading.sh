#!/bin/bash

echo "🔧 Fixing website loading issues..."

# Step 1: Fix frontend environment for production
echo "📝 Updating frontend environment..."
cat > frontend/.env.production << EOF
REACT_APP_BACKEND_URL=http://62.72.13.129:8001
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
EOF

# Step 2: Rebuild frontend with correct API URL
echo "🏗️ Rebuilding frontend..."
cd frontend
yarn build
cd ..

# Step 3: Create optimized nginx config
echo "⚙️ Creating optimized nginx config..."
cat > nginx-optimized.conf << 'EOF'
server {
    listen 80;
    server_name 62.72.13.129;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Frontend static files
    location / {
        root /var/www/codementee/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets aggressively
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }
        
        # Cache HTML files for short time
        location ~* \.html$ {
            expires 5m;
            add_header Cache-Control "public, must-revalidate";
        }
    }
    
    # Backend API with timeout optimization
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
        
        # Buffer settings for better performance
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

echo "✅ Website loading fixes applied!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy the updated frontend build to your VPS"
echo "2. Update nginx configuration with the optimized config"
echo "3. Ensure backend is running on port 8001"
echo "4. Test the website loading speed"
echo ""
echo "🚀 To deploy to VPS, run:"
echo "   scp -r frontend/build/* user@62.72.13.129:/var/www/codementee/frontend/build/"
echo "   scp nginx-optimized.conf user@62.72.13.129:/etc/nginx/sites-available/codementee"
echo "   ssh user@62.72.13.129 'sudo nginx -t && sudo systemctl reload nginx'"