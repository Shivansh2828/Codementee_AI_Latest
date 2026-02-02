# Frontend API URL Fix

## Issue Diagnosed
Your website (codementee.io) is loading but stuck on a loading spinner because:
- ✅ Backend API is working perfectly at `http://62.72.13.129:8001`
- ✅ Frontend HTML is loading correctly
- ❌ Frontend React app is trying to connect to `https://api.codementee.io` (doesn't exist yet)
- ❌ Should connect to `http://62.72.13.129:8001` instead

## Root Cause
The frontend `.env` file has:
```
REACT_APP_BACKEND_URL=https://api.codementee.io
```

But should have:
```
REACT_APP_BACKEND_URL=http://62.72.13.129:8001
```

## Quick Fix Solutions

### Option 1: One-Line Command (Fastest)
Run this single command from your local machine:
```bash
ssh root@62.72.13.129 'cd /var/www/codementee && echo "REACT_APP_BACKEND_URL=http://62.72.13.129:8001" > frontend/.env && echo "REACT_APP_ENVIRONMENT=production" >> frontend/.env && echo "GENERATE_SOURCEMAP=false" >> frontend/.env && docker-compose -f docker-compose.prod.yml stop codementee-frontend && cd frontend && rm -rf build && npm run build && cd .. && docker-compose -f docker-compose.prod.yml up -d --build codementee-frontend'
```

### Option 2: Step by Step (Recommended)
1. SSH to your VPS:
   ```bash
   ssh root@62.72.13.129
   # Password: Z8v3L&J.07t.CYQq1@xU
   ```

2. Navigate to project:
   ```bash
   cd /var/www/codementee
   ```

3. Fix the environment file:
   ```bash
   echo 'REACT_APP_BACKEND_URL=http://62.72.13.129:8001' > frontend/.env
   echo 'REACT_APP_ENVIRONMENT=production' >> frontend/.env
   echo 'GENERATE_SOURCEMAP=false' >> frontend/.env
   ```

4. Rebuild and restart frontend:
   ```bash
   docker-compose -f docker-compose.prod.yml stop codementee-frontend
   cd frontend && rm -rf build && npm run build && cd ..
   docker-compose -f docker-compose.prod.yml up -d --build codementee-frontend
   ```

5. Test the fix:
   ```bash
   curl http://localhost:3000
   ```

### Option 3: Use the Fix Script
1. Copy the fix script to your VPS:
   ```bash
   scp vps-frontend-fix.sh root@62.72.13.129:/var/www/codementee/
   ```

2. SSH and run the script:
   ```bash
   ssh root@62.72.13.129
   cd /var/www/codementee
   chmod +x vps-frontend-fix.sh
   ./vps-frontend-fix.sh
   ```

## Verification
After running any fix, your website should work at:
- **Frontend**: http://62.72.13.129:3000
- **Backend API**: http://62.72.13.129:8001

## Expected Result
- ✅ Website loads completely (no more loading spinner)
- ✅ You can register, login, and use all features
- ✅ API calls work properly
- ✅ All functionality restored

## Future Domain Setup
Once you configure DNS for codementee.io:
1. Update frontend/.env to use `https://api.codementee.io`
2. Set up SSL certificates
3. Configure Nginx reverse proxy
4. Rebuild frontend with new API URL

## Files Created
- `fix-frontend-api-url.sh` - Main fix preparation script
- `vps-frontend-fix.sh` - VPS deployment script
- `quick-frontend-fix.sh` - One-liner command generator
- `FRONTEND_API_FIX.md` - This documentation

The fix is simple but critical - your React app just needs to know where to find your backend API!