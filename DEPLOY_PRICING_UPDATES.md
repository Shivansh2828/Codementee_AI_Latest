# Deploy Pricing Updates to Production

## What We're Deploying

1. ✅ "Sync to Website" button in admin dashboard
2. ✅ Auto-sync after price updates
3. ✅ Last sync time indicator
4. ✅ Cache-busting for fresh data
5. ✅ Improved frontend pricing fetch

## Deployment Steps

### Step 1: Commit and Push Code

On your local machine:

```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with clear message
git commit -m "Add admin pricing sync feature and fix cache issues"

# Push to GitHub
git push origin main
```

### Step 2: Deploy to VPS

SSH into your VPS and deploy:

```bash
# SSH to VPS
ssh root@62.72.13.129

# Go to project directory
cd /var/www/codementee

# Pull latest code
git pull origin main

# Run the deployment script
./deploy.sh
```

The deploy script will:
- Pull latest code
- Rebuild frontend (clears cache)
- Restart backend service
- Restart frontend service
- Reload nginx
- Verify deployment

### Step 3: Verify Deployment

After deployment completes, verify:

```bash
# Check services are running
systemctl status codementee-frontend
systemctl status codementee-backend

# Test API
curl http://localhost:8001/api/pricing-plans

# Check frontend
curl http://localhost:3000
```

### Step 4: Test in Browser

1. **Open admin dashboard**: https://codementee.io/admin/pricing
2. **Check for "Sync to Website" button** - Should be visible
3. **Edit a price** and save
4. **Watch auto-sync** - Should see toast notification
5. **Check main website** - Open https://codementee.io in incognito
6. **Refresh** - Should see updated price

## Quick Deploy Commands

Copy and paste these:

```bash
# On local machine
git add . && git commit -m "Add pricing sync feature" && git push origin main

# On VPS
ssh root@62.72.13.129 "cd /var/www/codementee && git pull origin main && ./deploy.sh"
```

## If Something Goes Wrong

### Frontend not building:
```bash
cd /var/www/codementee/frontend
rm -rf build node_modules/.cache
yarn install
yarn build
systemctl restart codementee-frontend
```

### Backend not starting:
```bash
journalctl -u codementee-backend -n 50
systemctl restart codementee-backend
```

### Nginx issues:
```bash
nginx -t
systemctl reload nginx
```

## Post-Deployment Checklist

- [ ] Admin dashboard loads
- [ ] "Sync to Website" button visible
- [ ] Can edit pricing plans
- [ ] Auto-sync works after save
- [ ] Last sync time shows
- [ ] Main website shows correct prices
- [ ] Pricing updates reflect after refresh

## Rollback (If Needed)

If something breaks:

```bash
# On VPS
cd /var/www/codementee
git log --oneline -5  # See recent commits
git reset --hard <previous-commit-hash>
./deploy.sh
```

## Expected Downtime

- Frontend rebuild: ~2-3 minutes
- Backend restart: ~10 seconds
- Total: ~3 minutes

Users might see a brief loading screen during deployment.

## After Deployment

1. Test the sync feature
2. Update a price to verify it works
3. Monitor logs for any errors:
   ```bash
   journalctl -u codementee-backend -f
   journalctl -u codementee-frontend -f
   ```

## Success Indicators

✅ No errors in logs
✅ Services running (systemctl status)
✅ Website loads correctly
✅ Admin dashboard works
✅ Pricing updates sync properly

That's it! Your pricing sync feature will be live in production.
