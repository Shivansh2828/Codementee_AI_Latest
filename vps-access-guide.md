# VPS Access and Deployment Guide

## VPS Details
- **IP Address**: 62.72.13.129
- **Root Password**: Z8v3L&J.07t.CYQq1@xU
- **User**: codementee (created during setup)
- **User Password**: codementee123 (set during setup)

## Step-by-Step Deployment

### 1. Access Your VPS
```bash
ssh root@62.72.13.129
# Password: Z8v3L&J.07t.CYQq1@xU
```

### 2. Switch to codementee user
```bash
su - codementee
# Password: codementee123
```

### 3. Navigate to project directory
```bash
cd /var/www/codementee
```

### 4. Run the deployment script
```bash
chmod +x deploy-codementee.sh
./deploy-codementee.sh
```

## If You Need Sudo Access
The codementee user should have sudo privileges. If you need to run commands as root:

```bash
sudo command-here
# Password: codementee123
```

## Alternative: Direct Root Access
If the codementee user doesn't work, you can run everything as root:

```bash
# Stay as root user
cd /var/www/codementee

# Make script executable
chmod +x deploy-codementee.sh

# Edit the script to remove the user check
sed -i 's/if \[\[ $(whoami) != "codementee" \]\]; then/if false; then/' deploy-codementee.sh

# Run the deployment
./deploy-codementee.sh
```

## Quick Commands to Test After Deployment

```bash
# Check if containers are running
docker ps

# Test backend API
curl http://localhost:8001/api/companies

# Test frontend
curl http://localhost:3000

# Check logs if something fails
docker logs codementee-backend
docker logs codementee-frontend
```

## Access Your Website
After successful deployment:
- **Frontend**: http://62.72.13.129:3000
- **Backend API**: http://62.72.13.129:8001
- **API Test**: http://62.72.13.129:8001/api/companies

## Troubleshooting

### If deployment fails:
1. Check Docker is running: `docker --version`
2. Check disk space: `df -h`
3. Check logs: `docker logs container-name`
4. Restart Docker: `sudo systemctl restart docker`

### If you can't access the VPS:
1. Make sure you're using the correct IP: 62.72.13.129
2. Use the root password: Z8v3L&J.07t.CYQq1@xU
3. Try from a different network if blocked

### If containers won't start:
1. Stop all containers: `docker-compose -f docker-compose.prod.yml down`
2. Clean Docker: `docker system prune -f`
3. Rebuild: `docker-compose -f docker-compose.prod.yml up --build -d`