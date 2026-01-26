#!/bin/bash
cd backend
source venv/bin/activate
echo "🚀 Starting Codementee Backend Server..."
echo "📍 Backend will be available at: http://localhost:8001"
echo "📚 API Documentation at: http://localhost:8001/docs"
echo ""
uvicorn server:app --reload --host 0.0.0.0 --port 8001