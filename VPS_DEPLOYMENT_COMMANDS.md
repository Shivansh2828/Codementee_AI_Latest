# VPS Deployment Commands

## Step 1: SSH into VPS

```bash
ssh root@62.72.13.129
```

## Step 2: Navigate to Project

```bash
cd /var/www/codementee
```

## Step 3: Pull Latest Code

```bash
git pull origin main
```

## Step 4: Run Deployment Script

```bash
./deploy.sh
```

This will:
- Detect changes in frontend
- Rebuild frontend (clears cache)
- Restart services
- Reload nginx
- Verify deployment

## Step 5: Verify Deployment

```bash
# Check services
systemctl status codementee-frontend
systemctl status codementee-backend

# Test API
curl http://localhost:8001/api/pricing-plans | python3 -m json.tool | head -20

# Check if frontend is serving
curl -I http://localhost:3000
```

## Step 6: Test in Browser

1. Open: https://codementee.io/admin/pricing
2. Look for "Sync to Website" button (top right)
3. Edit a price and save
4. Watch auto-sync happen
5. Open main website in incognito: https://codementee.io
6. Refresh and verify price updated

## If Something Goes Wrong

### Frontend not building:
```bash
cd /var/www/codementee/frontend
rm -rf build node_modules/.cache
yarn build
systemctl restart codementee-frontend
```

### Check logs:
```bash
journalctl -u codementee-backend -n 50
journalctl -u codementee-frontend -n 50
tail -f /var/log/nginx/error.log
```

### Restart everything:
```bash
systemctl restart codementee-backend
systemctl restart codementee-frontend
systemctl reload nginx
```

## Expected Output

You should see:
```
Step 1: Pulling latest code...
Already up to date.

Changes detected:
  Frontend: X files
  Backend: 0 files

Step 2: Deploying frontend...
Building frontend...
✓ Frontend deployed

Step 3: Deploying backend...
Skipping backend (no changes)

Step 4: Reloading Nginx...
✓ Nginx reloaded

Step 5: Verifying deployment...
Service Status:
  Nginx: active
  Backend: active
  API Test: HTTP 200
  Frontend Test: HTTP 200

==========================================
✅ Deployment Successful!
==========================================
```

## Success!

Once you see "Deployment Successful", your pricing sync feature is live!

Test it:
1. Go to https://codementee.io/admin/pricing
2. You'll see the "Sync to Website" button
3. Edit a price
4. Watch it auto-sync
5. Check main website - updated!
