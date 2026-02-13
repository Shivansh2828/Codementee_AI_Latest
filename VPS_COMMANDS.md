# VPS Deployment Commands

## Run These Commands on Your VPS

### Step 1: Navigate to Project Directory
```bash
cd /var/www/codementee
```

### Step 2: Pull Latest Code
```bash
git pull origin main
```

### Step 3: Run the Reliable Deployment Script
```bash
chmod +x RELIABLE_DEPLOY.sh
./RELIABLE_DEPLOY.sh
```

That's it! The script will:
- Clean up old containers
- Build frontend locally
- Start MongoDB
- Create proper backend .env file
- Build and start all containers
- Initialize database
- Verify everything is working

## Expected Output

You should see:
```
🚀 Starting Reliable Deployment...
1️⃣ Cleaning up old deployments...
2️⃣ Pulling latest code from GitHub...
3️⃣ Building frontend locally...
✅ Frontend built successfully
4️⃣ Starting MongoDB...
5️⃣ Creating backend .env file...
6️⃣ Starting Frontend...
7️⃣ Building backend image...
8️⃣ Starting Backend...
9️⃣ Starting Redis...
🔟 Waiting for services to start...
1️⃣1️⃣ Initializing database...
1️⃣2️⃣ Verifying deployment...
✅ Frontend is working
✅ Backend is working

🎉 DEPLOYMENT SUCCESSFUL!

📊 Container Status:
NAMES                    STATUS              PORTS
codementee-frontend      Up X seconds        0.0.0.0:3000->80/tcp
codementee-backend       Up X seconds        0.0.0.0:8001->8001/tcp
codementee-redis         Up X seconds        0.0.0.0:6379->6379/tcp
mongo                    Up X minutes        0.0.0.0:27017->27017/tcp

🌐 Your website is live at:
   Frontend: http://62.72.13.129:3000
   Backend:  http://62.72.13.129:8001

✅ Deployment completed successfully!
```

## If Backend Still Has Issues

If the backend container is still stuck, run:
```bash
chmod +x FIX_BACKEND_STARTUP.sh
./FIX_BACKEND_STARTUP.sh
```

## Quick Verification Commands

### Check Container Status
```bash
docker ps
```
All containers should show "Up" status.

### Test Frontend
```bash
curl -I http://localhost:3000
```
Should return: `HTTP/1.1 200 OK`

### Test Backend
```bash
curl http://localhost:8001/api/companies
```
Should return JSON with company data.

### Check Backend Logs
```bash
docker logs codementee-backend --tail 20
```

### Check Frontend Logs
```bash
docker logs codementee-frontend --tail 20
```

## Troubleshooting

### If Backend Container Shows "Created" Status
```bash
docker rm -f codementee-backend
./FIX_BACKEND_STARTUP.sh
```

### If Website Still Loads Indefinitely
```bash
# Check if backend is actually running
docker ps | grep backend

# If not running, check logs
docker logs codementee-backend --tail 50

# Restart backend
docker restart codementee-backend
```

### If You See "Connection Refused" Errors
```bash
# Backend might not be started yet, wait 15 seconds
sleep 15

# Then test again
curl http://localhost:8001/api/companies
```

## Success Indicators

✅ `docker ps` shows all containers with "Up" status
✅ `curl -I http://localhost:3000` returns 200 OK
✅ `curl http://localhost:8001/api/companies` returns JSON data
✅ Website loads at http://62.72.13.129:3000 without infinite loading
✅ No errors in `docker logs codementee-backend`

## What Changed

The main fix:
- Backend .env now uses local MongoDB: `mongodb://172.17.0.1:27017`
- Previously used MongoDB Atlas which had DNS resolution issues
- Backend container now properly starts instead of staying in "Created" status
- Frontend build is done locally and mounted to nginx container
- All containers start reliably every time

## Need Help?

If deployment still fails:
1. Share the output of: `docker ps -a`
2. Share the output of: `docker logs codementee-backend --tail 50`
3. Share the output of: `docker logs codementee-frontend --tail 20`
