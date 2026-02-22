#!/bin/bash

# Fix Production Frontend to Use Correct Backend URL

echo "🔧 Fixing Production Frontend"
echo "=============================="
echo ""

# Step 1: Update .env.production
echo "1️⃣ Updating .env.production..."
cat > frontend/.env.production << 'EOF'
REACT_APP_BACKEND_URL=https://codementee.io
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
GENERATE_SOURCEMAP=false
EOF

echo "✅ Updated .env.production to use https://codementee.io"
echo ""

# Step 2: Commit and push
echo "2️⃣ Committing changes..."
git add frontend/.env.production frontend/src/components/landing/PricingSection.jsx
git commit -m "Fix production pricing: use HTTPS backend URL and add auto-refresh"
git push origin main

echo "✅ Changes pushed to GitHub"
echo ""

echo "3️⃣ Now SSH to VPS and run:"
echo ""
echo "ssh root@62.72.13.129 << 'ENDSSH'"
echo "cd /var/www/codementee"
echo "git pull origin main"
echo "cd frontend"
echo "rm -rf build node_modules/.cache"
echo "yarn build"
echo "systemctl restart codementee-frontend"
echo "echo '✅ Frontend rebuilt and restarted'"
echo "ENDSSH"
echo ""
