#!/bin/bash

echo "🧪 Testing Frontend Changes"
echo "=========================="

# Kill any existing processes on port 3000
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Navigate to frontend directory
cd frontend

# Clear any cache
echo "Clearing cache..."
rm -rf node_modules/.cache 2>/dev/null || true

# Start the development server
echo "Starting development server..."
echo "This may take a moment..."

# Set environment variables and start
FAST_REFRESH=false GENERATE_SOURCEMAP=false yarn start &

# Get the process ID
FRONTEND_PID=$!

echo "Frontend server starting with PID: $FRONTEND_PID"
echo "Please wait for compilation to complete..."
echo "Once ready, visit: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for the process
wait $FRONTEND_PID