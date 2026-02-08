#!/bin/bash

echo "🚀 Starting Codementee Local Development Servers"
echo "================================================"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Killing existing process..."
        kill -9 $(lsof -ti:$1) 2>/dev/null || true
        sleep 2
    fi
}

# Check and free ports
check_port 8001
check_port 3000

echo ""
echo "📦 Setting Up Dependencies..."
echo "============================"

# Backend setup
echo "Setting up backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
echo "✅ Backend dependencies ready"

# Frontend setup
echo "Setting up frontend..."
cd ../frontend

# Clean any problematic cache
rm -rf node_modules/.cache .eslintcache 2>/dev/null || true

# Ensure we have the simple craco config
if [ ! -f "craco.config.js" ] || ! grep -q "Simple craco config" craco.config.js; then
    echo "Setting up simplified craco config..."
    cat > craco.config.js << 'EOF'
// Simple craco config without complex plugins
const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};
EOF
fi

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install > /dev/null 2>&1
fi
echo "✅ Frontend dependencies ready"

echo ""
echo "🎯 Starting Servers..."
echo "====================="

# Start backend in background
cd ../backend
source venv/bin/activate
echo "🔧 Starting Backend Server on http://localhost:8001"
uvicorn server:app --reload --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
cd ../frontend
echo "⚛️  Starting Frontend Server on http://localhost:3000"
SKIP_PREFLIGHT_CHECK=true npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Both servers are starting up!"
echo "================================"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8001"
echo "📚 API Docs: http://localhost:8001/docs"
echo ""
echo "⏳ Please wait for both servers to compile..."
echo "   Frontend: Watch for 'Compiled successfully!'"
echo "   Backend:  Watch for 'Uvicorn running on...'"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    # Kill any remaining processes
    pkill -f "uvicorn.*server:app" 2>/dev/null || true
    pkill -f "craco.*start" 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for both processes
wait