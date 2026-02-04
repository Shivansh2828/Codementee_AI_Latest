#!/bin/bash
# COMPLETE END-TO-END DIAGNOSIS
# This will check EVERY component and log EVERYTHING

echo "🔍 COMPLETE END-TO-END DIAGNOSIS OF LOADING ISSUE"
echo "================================================="
echo "Testing from: $(date)"
echo "Testing URL: https://codementee.io"
echo ""

# Test 1: Basic connectivity
echo "1. BASIC CONNECTIVITY TEST"
echo "-------------------------"
echo "Testing ping to server..."
ping -c 3 62.72.13.129 2>&1 | head -10
echo ""

# Test 2: DNS resolution
echo "2. DNS RESOLUTION TEST"
echo "---------------------"
echo "Testing DNS for codementee.io..."
nslookup codementee.io
echo ""
echo "Testing DNS for api.codementee.io..."
nslookup api.codementee.io 2>&1 || echo "❌ api.codementee.io DNS failed"
echo ""

# Test 3: HTTP vs HTTPS
echo "3. HTTP vs HTTPS TEST"
echo "--------------------"
echo "Testing HTTP (should redirect)..."
curl -I -m 10 http://codementee.io 2>&1
echo ""
echo "Testing HTTPS..."
curl -I -m 10 https://codementee.io 2>&1
echo ""

# Test 4: Detailed timing breakdown
echo "4. DETAILED TIMING BREAKDOWN"
echo "----------------------------"
echo "Full timing analysis..."
curl -w "
DNS Lookup:     %{time_namelookup}s
TCP Connect:    %{time_connect}s
TLS Handshake:  %{time_appconnect}s
Server Process: %{time_starttransfer}s
Total Time:     %{time_total}s
HTTP Code:      %{http_code}
Size:           %{size_download} bytes
" -s -o /dev/null https://codementee.io
echo ""

# Test 5: Check what's actually served
echo "5. CONTENT ANALYSIS"
echo "------------------"
echo "First 500 characters of response..."
curl -s https://codementee.io | head -c 500
echo ""
echo ""

# Test 6: Check for JavaScript errors in HTML
echo "6. JAVASCRIPT ANALYSIS"
echo "---------------------"
echo "Looking for script tags..."
curl -s https://codementee.io | grep -E "(script|src=)" | head -5
echo ""

# Test 7: API endpoint tests
echo "7. API ENDPOINT TESTS"
echo "--------------------"
echo "Testing /api/companies..."
curl -w "API Response Time: %{time_total}s\n" -s -o /dev/null https://codementee.io/api/companies
echo ""
echo "Testing /api/auth/me..."
curl -w "Auth Response Time: %{time_total}s\n" -s -o /dev/null https://codementee.io/api/auth/me
echo ""

# Test 8: Check for external resources
echo "8. EXTERNAL RESOURCES CHECK"
echo "---------------------------"
echo "Testing external resources that might be slow..."
echo "Razorpay checkout script..."
curl -w "Razorpay Time: %{time_total}s\n" -s -o /dev/null https://checkout.razorpay.com/v1/checkout.js
echo ""
echo "Google Fonts..."
curl -w "Google Fonts Time: %{time_total}s\n" -s -o /dev/null https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap
echo ""

# Test 9: Check static assets
echo "9. STATIC ASSETS CHECK"
echo "---------------------"
echo "Testing main JavaScript bundle..."
JS_FILE=$(curl -s https://codementee.io | grep -o '/static/js/main\.[^"]*\.js' | head -1)
if [ ! -z "$JS_FILE" ]; then
    echo "Found JS file: $JS_FILE"
    curl -w "JS Bundle Time: %{time_total}s, Size: %{size_download} bytes\n" -s -o /dev/null "https://codementee.io$JS_FILE"
else
    echo "❌ No JS bundle found"
fi
echo ""

echo "Testing main CSS bundle..."
CSS_FILE=$(curl -s https://codementee.io | grep -o '/static/css/main\.[^"]*\.css' | head -1)
if [ ! -z "$CSS_FILE" ]; then
    echo "Found CSS file: $CSS_FILE"
    curl -w "CSS Bundle Time: %{time_total}s, Size: %{size_download} bytes\n" -s -o /dev/null "https://codementee.io$CSS_FILE"
else
    echo "❌ No CSS bundle found"
fi
echo ""

# Test 10: Browser simulation
echo "10. BROWSER SIMULATION TEST"
echo "--------------------------"
echo "Simulating browser request with all headers..."
curl -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
     -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
     -H "Accept-Language: en-US,en;q=0.5" \
     -H "Accept-Encoding: gzip, deflate" \
     -H "Connection: keep-alive" \
     -w "Browser Simulation Time: %{time_total}s\n" \
     -s -o /dev/null https://codementee.io
echo ""

# Test 11: Check for redirects or errors
echo "11. REDIRECT CHAIN ANALYSIS"
echo "--------------------------"
echo "Following redirect chain..."
curl -L -w "
Step 1: %{url_effective}
Final URL: %{url_effective}
Redirects: %{num_redirects}
Total Time: %{time_total}s
" -s -o /dev/null https://codementee.io
echo ""

# Test 12: Network quality test
echo "12. NETWORK QUALITY TEST"
echo "------------------------"
echo "Testing multiple requests to check consistency..."
for i in {1..3}; do
    TIME=$(curl -w "%{time_total}" -s -o /dev/null https://codementee.io)
    echo "Request $i: ${TIME}s"
done
echo ""

echo "================================================="
echo "🎯 DIAGNOSIS COMPLETE"
echo "================================================="
echo ""
echo "📋 SUMMARY:"
echo "- Check the timing breakdown above"
echo "- Look for any timeouts or errors"
echo "- Identify which component is slow"
echo "- Check if external resources are causing delays"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Review the timing data above"
echo "2. Identify the slowest component"
echo "3. Apply targeted fix based on findings"