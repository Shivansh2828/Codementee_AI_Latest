# Reliable Deployment Process

## Problem Summary
The backend container was stuck in "Created" status and never actually started, causing the website to load indefinitely. This happened because:
1. MongoDB Atlas DNS resolution was failing on the VPS
2. The backend .env file had the wrong MongoDB connection string
3. The container was created but never transitioned to "Running" status

## Solution
Use local MongoDB container and proper .env configuration.

## Deployment Scripts

### Option 1: Full Deployment (RELIABLE_DEPLOY.sh)
Use this when deploying new code or doing a fresh deployment.

```bash
cd /var/www/codementee
chmod +x RELIABLE_DEPLOY.sh
./RELIABLE_DEPLOY.sh
```

This script:
- Cleans up old containers
- Pulls latest code from GitHub
- Builds frontend locally (guaranteed to work)
- Starts MongoDB container
- Creates proper backend .env file
- Builds and starts backend container
- Starts Redis container
- Initializes database
- Verifies everything is working

### Option 2: Fix Backend Only (FIX_BACKEND_STARTUP.sh)
Use this when only the backend is having issues.

```bash
cd /var/www/codementee
chmod +x FIX_BACKEND_STARTUP.sh
./FIX_BACKEND_STARTUP.sh
```

This script:
- Removes stuck backend container
- Ensures MongoDB is running
- Creates proper backend .env file
- Rebuilds backend image
- Starts backend container
- Tests backend API
- Initializes database

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. Clean Up
```bash
docker rm -f codementee-frontend codementee-backend codementee-redis
```

### 2. Start MongoDB
```bash
docker run -d --name mongo -p 27017:27017 mongo:latest
```

### 3. Create Backend .env File
```bash
cat > backend/.env << 'EOF'
MONGO_URL=mongodb://172.17.0.1:27017
DB_NAME=codementee
CORS_ORIGINS=*
JWT_SECRET=codementee-secret-key-2025-production
RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
RAZORPAY_KEY_SECRET=JtU5TqVhIYhoaSvgVufzYmbx
RESEND_API_KEY=re_NAsKT9R3_HCM8K6SgVDHHPWVaPPK2vKo2
SENDER_EMAIL=support@codementee.com
BCC_EMAIL=shivanshbiz28@gmail.com
DEBUG=false
LOG_LEVEL=INFO
ENVIRONMENT=production
EOF
```

### 4. Build Frontend
```bash
cd frontend
npm install --legacy-peer-deps
GENERATE_SOURCEMAP=false npm run build
cd ..
```

### 5. Start Frontend
```bash
docker run -d --name codementee-frontend \
  --restart unless-stopped \
  -p 3000:80 \
  -v $(pwd)/frontend/build:/usr/share/nginx/html:ro \
  nginx:alpine
```

### 6. Build and Start Backend
```bash
cd backend
docker build --no-cache -t codementee-backend -f Dockerfile.prod .
cd ..

docker run -d \
  --name codementee-backend \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file backend/.env \
  -v $(pwd)/logs:/app/logs \
  codementee-backend
```

### 7. Start Redis
```bash
docker run -d \
  --name codementee-redis \
  --restart unless-stopped \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### 8. Initialize Database
```bash
sleep 10
docker exec codementee-backend python setup_initial_data.py
```

### 9. Verify Deployment
```bash
# Check containers
docker ps

# Test frontend
curl -I http://localhost:3000

# Test backend
curl http://localhost:8001/api/companies
```

## Troubleshooting

### Backend Container Not Starting
```bash
# Check if container exists
docker ps -a | grep backend

# Remove stuck container
docker rm -f codementee-backend

# Check backend logs
docker logs codementee-backend --tail 50

# Rebuild backend image
cd backend
docker build --no-cache -t codementee-backend -f Dockerfile.prod .
cd ..
```

### Frontend Not Loading
```bash
# Check if build exists
ls -la frontend/build/

# Check frontend logs
docker logs codementee-frontend --tail 50

# Verify nginx is serving files
docker exec codementee-frontend ls -la /usr/share/nginx/html/
```

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Start MongoDB if not running
docker run -d --name mongo -p 27017:27017 mongo:latest

# Test MongoDB connection
docker exec mongo mongosh --eval "db.adminCommand('ping')"
```

### API Not Responding
```bash
# Check backend logs
docker logs codementee-backend --tail 50

# Check if backend is listening on port 8001
docker exec codementee-backend netstat -tlnp | grep 8001

# Test backend directly
curl http://localhost:8001/api/health
```

## Quick Health Checks

### Check All Containers
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Test Frontend
```bash
curl -I http://localhost:3000
# Should return: HTTP/1.1 200 OK
```

### Test Backend
```bash
curl http://localhost:8001/api/companies
# Should return: JSON array with companies
```

### Check Logs
```bash
# Frontend logs
docker logs codementee-frontend --tail 20

# Backend logs
docker logs codementee-backend --tail 20

# MongoDB logs
docker logs mongo --tail 20
```

## Important Notes

1. **Always use local MongoDB**: The MongoDB Atlas connection fails due to DNS issues on the VPS. Use the local MongoDB container instead.

2. **Backend .env file is critical**: Make sure the backend/.env file has `MONGO_URL=mongodb://172.17.0.1:27017` (not the Atlas URL).

3. **Build frontend locally**: Building frontend inside Docker can fail. Always build locally and mount the build folder.

4. **Wait for services**: After starting containers, wait 10-15 seconds before testing to allow services to fully start.

5. **Check container status**: Use `docker ps` to verify all containers are in "Up" status, not "Created" or "Exited".

6. **Use --no-cache for backend**: When rebuilding backend, use `--no-cache` to ensure fresh build without cached layers.

## Success Indicators

✅ All containers show "Up" status in `docker ps`
✅ Frontend returns 200 OK on curl
✅ Backend returns company data on curl
✅ Website loads without infinite loading spinner
✅ No errors in container logs

## Deployment Checklist

Before deploying:
- [ ] Pull latest code: `git pull origin main`
- [ ] Check disk space: `df -h`
- [ ] Stop old containers: `docker rm -f codementee-frontend codementee-backend codementee-redis`

After deploying:
- [ ] Verify containers are running: `docker ps`
- [ ] Test frontend: `curl -I http://localhost:3000`
- [ ] Test backend: `curl http://localhost:8001/api/companies`
- [ ] Check logs for errors: `docker logs codementee-backend --tail 20`
- [ ] Test website in browser: `http://62.72.13.129:3000`

## When Things Go Wrong

If deployment fails:
1. Check container status: `docker ps -a`
2. Check logs: `docker logs <container-name> --tail 50`
3. Remove stuck containers: `docker rm -f <container-name>`
4. Run FIX_BACKEND_STARTUP.sh if backend is the issue
5. Run RELIABLE_DEPLOY.sh for full redeployment

## Contact

If you encounter issues not covered here, check:
- Container logs: `docker logs <container-name>`
- System resources: `htop` or `top`
- Disk space: `df -h`
- Network connectivity: `ping 8.8.8.8`
