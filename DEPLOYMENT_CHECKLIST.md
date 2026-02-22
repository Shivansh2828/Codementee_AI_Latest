# Deployment Checklist - Pricing Sync Feature

## Pre-Deployment

- [ ] Tested locally and everything works
- [ ] Admin dashboard shows "Sync to Website" button
- [ ] Price updates work and auto-sync
- [ ] Main website shows updated prices after refresh
- [ ] No console errors in browser

## Deployment Options

### Option 1: Automated Script (EASIEST)

```bash
./deploy_pricing_feature.sh
```

This script will:
1. Commit and push your code
2. SSH to VPS
3. Pull latest code
4. Run deployment
5. Verify everything

### Option 2: Manual Steps

#### On Local Machine:
```bash
git add .
git commit -m "Add pricing sync feature"
git push origin main
```

#### On VPS:
```bash
ssh root@62.72.13.129
cd /var/www/codementee
git pull origin main
./deploy.sh
```

## Post-Deployment Verification

### 1. Check Services
```bash
ssh root@62.72.13.129
systemctl status codementee-frontend
systemctl status codementee-backend
systemctl status nginx
```

All should show "active (running)"

### 2. Test Admin Dashboard
- [ ] Go to https://codementee.io/admin/pricing
- [ ] Login as admin
- [ ] See "Sync to Website" button (top right)
- [ ] See pricing plans displayed correctly

### 3. Test Price Update
- [ ] Click "Edit" on any plan
- [ ] Change the price
- [ ] Click "Update Plan"
- [ ] See success toast notification
- [ ] See "Last synced" time update
- [ ] See auto-sync toast message

### 4. Test Main Website
- [ ] Open https://codementee.io in incognito/private window
- [ ] Scroll to pricing section
- [ ] Verify prices match what you set in admin
- [ ] Refresh page (F5)
- [ ] Prices should still be correct

### 5. Test Sync Button
- [ ] Go back to admin dashboard
- [ ] Click "Sync to Website" button manually
- [ ] See spinning icon
- [ ] See success message
- [ ] See "Last synced" time update

## Troubleshooting

### If frontend doesn't show button:
```bash
# On VPS
cd /var/www/codementee/frontend
rm -rf build node_modules/.cache
yarn build
systemctl restart codementee-frontend
```

### If prices don't update:
```bash
# Check backend logs
journalctl -u codementee-backend -n 50

# Restart backend
systemctl restart codementee-backend

# Test API directly
curl http://localhost:8001/api/pricing-plans
```

### If website is down:
```bash
# Check nginx
nginx -t
systemctl status nginx

# Check frontend
systemctl status codementee-frontend

# View logs
journalctl -u codementee-frontend -n 50
```

## Success Criteria

✅ All services running
✅ Admin dashboard loads
✅ "Sync to Website" button visible
✅ Can edit prices
✅ Auto-sync works
✅ Last sync time shows
✅ Main website shows correct prices
✅ No errors in browser console
✅ No errors in server logs

## Rollback Plan

If something breaks:

```bash
ssh root@62.72.13.129
cd /var/www/codementee
git log --oneline -5
git reset --hard <previous-commit-hash>
./deploy.sh
```

## Expected Timeline

- Code push: 30 seconds
- VPS pull: 10 seconds
- Frontend rebuild: 2-3 minutes
- Backend restart: 10 seconds
- Verification: 2 minutes

**Total: ~5-6 minutes**

## After Successful Deployment

1. ✅ Feature is live
2. ✅ You can update prices anytime via admin
3. ✅ Users see updates after refreshing
4. ✅ No more cache issues

## Notes

- Users need to refresh to see price changes (normal behavior)
- Sync button is instant (no deployment needed)
- Database is the source of truth
- Fallback prices only show if backend is down

---

**Ready to deploy? Run: `./deploy_pricing_feature.sh`**
