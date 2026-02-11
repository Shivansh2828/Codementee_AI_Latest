#!/bin/bash
echo "🧪 VERIFYING LOADING FIX..."
echo "=========================="

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend not responding"
fi

# Check if backend is running
if curl -s http://localhost:8001/api/health > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend not responding"
fi

# Check for PostHog in built files
if grep -r "posthog" frontend/build/ > /dev/null 2>&1; then
    echo "❌ PostHog still found in build"
else
    echo "✅ PostHog removed from build"
fi

# Check for missing file references
if grep -r "logo192.png\|manifest.json" frontend/build/ > /dev/null 2>&1; then
    echo "❌ Missing file references still present"
else
    echo "✅ Missing file references removed"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Deploy to VPS: docker-compose -f docker-compose.prod.yml up --build -d"
echo "2. Test in incognito mode"
echo "3. Check console for 🔥 logs"
