#!/bin/bash
# Fix VPS branch and force clean deployment

echo "🔧 Fixing VPS branch and deploying latest code..."
echo ""

ssh root@62.72.13.129 << 'ENDSSH'
cd /var/www/codementee

echo "1. Checking current branch..."
git branch

echo ""
echo "2. Switching to main branch..."
git checkout main
git pull origin main

echo ""
echo "3. Verifying we're on main..."
git branch
git log --oneline -3

echo ""
echo "4. Force clean frontend rebuild..."
cd frontend
rm -rf node_modules/.cache build .cache
NODE_ENV=production yarn build

echo ""
echo "5. Restarting services..."
systemctl restart codementee-frontend
systemctl restart codementee-backend

echo ""
echo "6. Reloading nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "✅ Deployment complete!"
echo ""
echo "7. Verifying services..."
systemctl status codementee-frontend --no-pager -l | head -10
systemctl status codementee-backend --no-pager -l | head -10

ENDSSH

echo ""
echo "🎉 Done! Your VPS is now on main branch with latest code."
echo "   Clear your browser cache and refresh: https://codementee.io"
