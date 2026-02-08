#!/bin/bash
# VPS Diagnostic Script - JavaScript Loading Issue
# Run this on VPS to diagnose why JS files aren't loading

echo "🔍 DIAGNOSING JAVASCRIPT LOADING ISSUE"
echo "======================================"
echo ""

# Check if container is running
echo "1️⃣ Checking if frontend container is running..."
if docker ps | grep -q codementee-frontend; then
    echo "✅ Frontend container is running"
else
    echo "❌ Frontend container is NOT running!"
    echo "Run: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
fi

echo ""
echo "2️⃣ Checking files inside container..."
echo "Files in /usr/share/nginx/html:"
docker exec codementee-frontend ls -la /usr/share/nginx/html/

echo ""
echo "Files in /usr/share/nginx/html/static:"
docker exec codementee-frontend ls -la /usr/share/nginx/html/static/ 2>/dev/null || echo "❌ static folder not found!"

echo ""
echo "Files in /usr/share/nginx/html/static/js:"
docker exec codementee-frontend ls -la /usr/share/nginx/html/static/js/ 2>/dev/null || echo "❌ static/js folder not found!"

echo ""
echo "3️⃣ Checking main.js file specifically..."
MAIN_JS=$(docker exec codementee-frontend find /usr/share/nginx/html -name "main.*.js" 2>/dev/null | head -1)
if [ ! -z "$MAIN_JS" ]; then
    echo "✅ Found: $MAIN_JS"
    echo "File size:"
    docker exec codementee-frontend ls -lh "$MAIN_JS"
    echo ""
    echo "First 100 characters of file:"
    docker exec codementee-frontend head -c 100 "$MAIN_JS"
    echo ""
else
    echo "❌ No main.*.js file found!"
    echo "This means the build didn't create the JS file."
fi

echo ""
echo "4️⃣ Checking nginx configuration..."
docker exec codementee-frontend cat /etc/nginx/conf.d/default.conf | head -20

echo ""
echo "5️⃣ Testing nginx configuration..."
docker exec codementee-frontend nginx -t

echo ""
echo "6️⃣ Checking nginx error logs..."
docker exec codementee-frontend cat /var/log/nginx/error.log 2>/dev/null || echo "No error log yet"

echo ""
echo "7️⃣ Checking nginx access logs..."
docker exec codementee-frontend tail -20 /var/log/nginx/access.log 2>/dev/null || echo "No access log yet"

echo ""
echo "8️⃣ Testing file access from inside container..."
if [ ! -z "$MAIN_JS" ]; then
    docker exec codementee-frontend wget -O /dev/null "http://localhost/static/js/$(basename $MAIN_JS)" 2>&1 | grep -E "(HTTP|saved)"
fi

echo ""
echo "9️⃣ Testing file access from host..."
curl -I http://localhost:3000/static/js/main.7cd765db.js 2>&1 | head -10

echo ""
echo "🔟 Checking Docker container logs..."
docker logs codementee-frontend --tail 30

echo ""
echo "═══════════════════════════════════════"
echo "📊 DIAGNOSIS COMPLETE"
echo "═══════════════════════════════════════"
echo ""
echo "Key things to check:"
echo "1. Does main.*.js file exist in container? (Step 3)"
echo "2. What's the nginx error log saying? (Step 6)"
echo "3. Can nginx access the file internally? (Step 8)"
echo "4. What HTTP status from outside? (Step 9)"
echo ""
echo "Share this output for further debugging."
