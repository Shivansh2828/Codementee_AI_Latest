#!/bin/bash

# 🔧 Fix VPS Deployment Permissions Issue
# This script fixes the EACCES permission denied errors during deployment

echo "🔧 Fixing VPS deployment permissions..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    echo -e "${GREEN}✅ Running with root privileges${NC}"
else
    echo -e "${YELLOW}⚠️  This script needs to be run with sudo${NC}"
    echo "Please run: sudo ./fix-deployment-permissions.sh"
    exit 1
fi

# Set proper ownership and permissions
echo -e "${YELLOW}📁 Setting proper ownership for /var/www/codementee...${NC}"
chown -R codementee:codementee /var/www/codementee

echo -e "${YELLOW}🔐 Setting proper permissions...${NC}"
chmod -R 755 /var/www/codementee
chmod -R 775 /var/www/codementee/frontend
chmod -R 775 /var/www/codementee/backend

# Clean up problematic node_modules if it exists
if [ -d "/var/www/codementee/frontend/node_modules" ]; then
    echo -e "${YELLOW}🧹 Cleaning up existing node_modules...${NC}"
    rm -rf /var/www/codementee/frontend/node_modules
    rm -f /var/www/codementee/frontend/package-lock.json
fi

# Create necessary directories with proper permissions
echo -e "${YELLOW}📂 Creating necessary directories...${NC}"
mkdir -p /var/www/codementee/frontend/build
mkdir -p /var/www/codementee/logs
chown -R codementee:codementee /var/www/codementee
chmod -R 775 /var/www/codementee

# Fix npm cache permissions
echo -e "${YELLOW}🗂️  Fixing npm cache permissions...${NC}"
if [ -d "/home/codementee/.npm" ]; then
    chown -R codementee:codementee /home/codementee/.npm
    chmod -R 755 /home/codementee/.npm
fi

# Create npm cache directory if it doesn't exist
sudo -u codementee mkdir -p /home/codementee/.npm
chown -R codementee:codementee /home/codementee/.npm

echo -e "${GREEN}✅ Permissions fixed successfully!${NC}"
echo -e "${YELLOW}📋 Now you can run the deployment script as the codementee user:${NC}"
echo "sudo -u codementee ./deploy-codementee.sh"