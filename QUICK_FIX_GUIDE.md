# 🚀 Quick Fix Guide - No Containers Started

## What Happened?

The build likely failed due to a syntax error in the Dockerfile CMD line. I've fixed it.

## ✅ Fixed Issues:

1. **Dockerfile CMD syntax** - Removed invalid `-e` flag
2. **Added error checking** - New deployment scripts show exactly where failures occur
3. **Better error messages** - You'll see clear success/failure at each step

## 🚀 Deploy Now (On VPS)

### Option 1: Use the Error-Checking Script (RECOMMENDED)

```bash
cd /var/www/codementee
git pull origin main
bash DEPLOY_WITH_ERROR_CHECK.sh
```

This script will:
- ✅ Show clear success/failure at each step
- ✅ Stop if any step fails
- ✅ Show helpful error messages
- ✅ Verify containers are running
- ✅ Check if files exist in container

### Option 2: Manual Step-by-Step

```bash
cd /var/www/codementee
git pull origin main

# Stop containers
docker-compose -f docker-compose.prod.yml down

# Remove old images
docker rmi codementee-frontend codementee-backend || true

# Build frontend (watch for errors!)
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# If frontend build succeeds, build backend
docker-compose -f docker-compose.prod.yml build backend

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# Wait
sleep 15

# Check status
docker ps
```

## 🔍 What to Look For

### During Build:
You should see:
```
✅ Frontend built successfully
✅ Backend built successfully
✅ Containers started
✅ Frontend container is running
✅ Backend container is running
```

### If Build Fails:
The script will show:
```
❌ Frontend build FAILED!
```
And display the error message.

Common causes:
- **Out of disk space**: Run `df -h` to check
- **Out of memory**: Run `free -h` to check
- **Syntax error**: Already fixed in latest code

## 📊 After Deployment

### Check Containers:
```bash
docker ps
```
You should see:
- `codementee-frontend` - Up
- `codementee-backend` - Up
- `codementee-redis` - Up

### Check Files:
```bash
docker exec codementee-frontend ls -la /usr/share/nginx/html/static/js/
```
You should see `main.7cd765db.js` listed.

### Test Website:
```bash
curl -I http://localhost:3000
curl -I http://localhost:8001/api/companies
```
Both should return `200 OK`.

## 🚨 If Still Having Issues

### Check Disk Space:
```bash
df -h
```
If `/` or `/var` is > 90% full, clean up:
```bash
docker system prune -a
```

### Check Memory:
```bash
free -h
```
If memory is low, restart Docker:
```bash
systemctl restart docker
```

### Check Logs:
```bash
docker logs codementee-frontend --tail 50
docker logs codementee-backend --tail 50
```

### Check Build Log:
If you saved the build output:
```bash
cat build.log | grep -i error
```

## 📝 Summary

**What I Fixed:**
- ✅ Dockerfile CMD syntax error
- ✅ Added comprehensive error checking
- ✅ Added deployment scripts with clear output

**What You Need to Do:**
1. SSH into VPS
2. Run: `cd /var/www/codementee && git pull origin main`
3. Run: `bash DEPLOY_WITH_ERROR_CHECK.sh`
4. Watch for ✅ or ❌ at each step
5. If all ✅, test website in browser

**The script will tell you exactly what failed if something goes wrong!**
