#!/bin/bash

echo "🔧 Fixing Frontend Development Server"
echo "===================================="

# Kill any existing processes
echo "1. Killing existing processes..."
pkill -f "node.*craco\|node.*react-scripts\|yarn.*start" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait for processes to die
sleep 3

# Navigate to frontend
cd frontend

# Clean everything
echo "2. Cleaning cache and build artifacts..."
rm -rf node_modules/.cache
rm -rf .eslintcache
rm -rf build

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "3. Installing dependencies..."
    yarn install
else
    echo "3. Dependencies already installed"
fi

# Set environment variables to prevent issues
export FAST_REFRESH=false
export GENERATE_SOURCEMAP=false
export SKIP_PREFLIGHT_CHECK=true

echo "4. Starting development server..."
echo "   This may take a moment to compile..."
echo "   Watch for 'Compiled successfully!' message"
echo ""

# Start the server
yarn start