#!/bin/bash
# Script to check what's actually deployed on VPS

echo "=== Checking VPS Deployment Status ==="
echo ""

# Check current branch and commit
echo "1. Current Git Status:"
ssh root@62.72.13.129 "cd /var/www/codementee && git branch && git log --oneline -3"

echo ""
echo "2. Check if MenteeDashboard has old code:"
ssh root@62.72.13.129 "cd /var/www/codementee && grep -n '3 Months Plan' frontend/src/pages/mentee/MenteeDashboard.jsx || echo 'No old code found in source'"

echo ""
echo "3. Check frontend build directory:"
ssh root@62.72.13.129 "ls -lah /var/www/codementee/frontend/build/ | head -10"

echo ""
echo "4. Check service status:"
ssh root@62.72.13.129 "systemctl status codementee-frontend --no-pager -l | head -15"

echo ""
echo "5. Check last build time:"
ssh root@62.72.13.129 "stat /var/www/codementee/frontend/build/index.html | grep Modify"
