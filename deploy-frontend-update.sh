#!/bin/bash

echo "=========================================="
echo "Deploying Frontend Update to VPS"
echo "=========================================="
echo ""

# Build frontend locally with production config
echo "Building frontend with production configuration..."
cd frontend
yarn build
cd ..

echo ""
echo "Uploading build to VPS..."

# Upload the build folder to VPS
scp -r frontend/build/* root@62.72.13.129:/var/www/codementee/frontend/build/

echo ""
echo "Restarting frontend service..."
ssh root@62.72.13.129 "systemctl restart codementee-frontend"

echo ""
echo "=========================================="
echo "✓ Frontend deployed successfully!"
echo "=========================================="
echo ""
echo "Visit: https://codementee.io"
echo ""
