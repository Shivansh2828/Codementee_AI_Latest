#!/bin/bash
# Quick Frontend Fix - Single Command

echo "🔧 Quick Frontend API URL Fix"
echo "Run this command on your VPS to fix the website:"
echo ""
echo "ssh root@62.72.13.129 'cd /var/www/codementee && echo \"REACT_APP_BACKEND_URL=http://62.72.13.129:8001\" > frontend/.env && echo \"REACT_APP_ENVIRONMENT=production\" >> frontend/.env && echo \"GENERATE_SOURCEMAP=false\" >> frontend/.env && docker-compose -f docker-compose.prod.yml stop codementee-frontend && cd frontend && rm -rf build && npm run build && cd .. && docker-compose -f docker-compose.prod.yml up -d --build codementee-frontend'"
echo ""
echo "Or copy and paste these commands one by one:"
echo "1. ssh root@62.72.13.129"
echo "2. cd /var/www/codementee"
echo "3. echo 'REACT_APP_BACKEND_URL=http://62.72.13.129:8001' > frontend/.env"
echo "4. echo 'REACT_APP_ENVIRONMENT=production' >> frontend/.env"
echo "5. echo 'GENERATE_SOURCEMAP=false' >> frontend/.env"
echo "6. docker-compose -f docker-compose.prod.yml stop codementee-frontend"
echo "7. cd frontend && rm -rf build && npm run build && cd .."
echo "8. docker-compose -f docker-compose.prod.yml up -d --build codementee-frontend"