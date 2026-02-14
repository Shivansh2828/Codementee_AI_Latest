#!/bin/bash

# Run this script ON THE VPS to rebuild frontend with correct API URL

echo "=========================================="
echo "Rebuilding Frontend for Production"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (or use sudo)"
    exit 1
fi

cd /var/www/codementee/frontend

# Create production environment file
echo "Creating production environment configuration..."
cat > .env.production << 'EOF'
REACT_APP_BACKEND_URL=/api
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
GENERATE_SOURCEMAP=false
EOF

# Build frontend
echo "Building frontend..."
yarn build

if [ $? -eq 0 ]; then
    echo "✓ Frontend built successfully"
    
    # Restart frontend service
    echo "Restarting frontend service..."
    systemctl restart codementee-frontend
    
    echo ""
    echo "=========================================="
    echo "✓ Frontend deployed successfully!"
    echo "=========================================="
    echo ""
    echo "Your site is now live at:"
    echo "  https://codementee.io"
    echo ""
else
    echo "✗ Frontend build failed"
    exit 1
fi
