#!/bin/bash

echo "🧪 Testing backend locally to diagnose issues..."

# Navigate to backend directory
cd backend

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in backend directory"
    exit 1
fi

echo "✅ .env file found"

# Check if requirements are installed
echo "📦 Installing requirements..."
pip install -r requirements.txt

# Try to run the server directly
echo "🚀 Starting server directly..."
python -c "
import sys
sys.path.append('.')
try:
    from server import app
    print('✅ Server imports successfully')
    print('✅ FastAPI app created')
except Exception as e:
    print(f'❌ Import error: {e}')
    import traceback
    traceback.print_exc()
"

# Try to start with uvicorn
echo "🔄 Testing with uvicorn..."
uvicorn server:app --host 0.0.0.0 --port 8001 --timeout-keep-alive 120 &
SERVER_PID=$!

# Wait a moment
sleep 5

# Test health endpoint
echo "🏥 Testing health endpoint..."
curl -f http://localhost:8001/health || echo "Health endpoint failed"

# Kill the server
kill $SERVER_PID 2>/dev/null

echo "✅ Local test complete"