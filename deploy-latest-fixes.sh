#!/bin/bash

echo "🚀 Deploying latest fixes to production..."

# Step 1: Push changes to GitHub
echo "📤 Pushing fixes to GitHub..."
git add .
git commit -m "Fix deployment issues: resolve date-fns conflict and update Dockerfile"
git push origin main

echo "✅ Changes pushed to GitHub!"
echo ""
echo "🔧 Now run these commands on your VPS:"
echo ""
echo "# SSH into your VPS:"
echo "ssh root@62.72.13.129"
echo ""
echo "# Switch to codementee user and navigate to project:"
echo "su - codementee"
echo "cd /var/www/codementee"
echo ""
echo "# Pull latest changes:"
echo "git pull origin main"
echo ""
echo "# Run the deployment fix script:"
echo "./fix-deployment.sh"
echo ""
echo "📋 Or copy and paste this single command block:"
echo "git pull origin main && ./fix-deployment.sh"