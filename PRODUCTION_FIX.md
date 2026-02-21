# Fix Pricing Updates in Production (Hostinger VPS)

## The Issue
When you update prices in admin dashboard on production, users don't see the changes immediately.

## The Solution

### On Your VPS (Hostinger):

1. **SSH into your VPS:**
   ```bash
   ssh root@62.72.13.129
   ```

2. **Go to your project directory:**
   ```bash
   cd /var/www/codementee
   ```

3. **Run the fix script:**
   ```bash
   chmod +x fix_production_pricing.sh
   ./fix_production_pricing.sh
   ```

This script will:
- Pull latest code
- Rebuild frontend (clears all caches)
- Restart all services
- Verify everything is working

### Alternative: Manual Steps

If you prefer to do it manually:

```bash
# SSH into VPS
ssh root@62.72.13.129

# Go to project
cd /var/www/codementee

# Pull latest code
git pull origin main

# Rebuild frontend
cd frontend
rm -rf build node_modules/.cache
yarn build
cd ..

# Restart services
systemctl restart codementee-frontend
systemctl restart codementee-backend
systemctl reload nginx

# Verify
systemctl status codementee-frontend
systemctl status codementee-backend
curl http://localhost:8001/api/pricing-plans
```

## After the Fix

Once you run the fix:

1. **Update prices in admin dashboard** (https://codementee.io/admin/pricing)
2. **Users refresh the page** (F5 or Ctrl+R)
3. **They see updated prices immediately**

## Why This Works

In production:
- Frontend is a static build (no React dev cache)
- We rebuild it fresh (clears any old cached data)
- Backend already works correctly (verified by tests)
- Users just need to refresh their browser

## Testing After Fix

1. **Update a price in admin:**
   - Go to https://codementee.io/admin/pricing
   - Edit a plan
   - Change the price
   - Save

2. **Verify in API:**
   ```bash
   curl https://codementee.io/api/pricing-plans | python3 -m json.tool
   ```

3. **Check on website:**
   - Open https://codementee.io in incognito/private window
   - Scroll to pricing section
   - You should see the updated price

## Troubleshooting

### If services fail to start:
```bash
# Check logs
journalctl -u codementee-frontend -n 50
journalctl -u codementee-backend -n 50
tail -f /var/log/nginx/error.log
```

### If API doesn't return data:
```bash
# Check backend is running
systemctl status codementee-backend

# Check backend logs
journalctl -u codementee-backend -n 100

# Test backend directly
curl http://localhost:8001/health
curl http://localhost:8001/api/pricing-plans
```

### If frontend shows old prices:
```bash
# Rebuild frontend again
cd /var/www/codementee/frontend
rm -rf build
yarn build
systemctl restart codementee-frontend
```

## Quick Commands Reference

```bash
# SSH to VPS
ssh root@62.72.13.129

# Check service status
systemctl status codementee-frontend
systemctl status codementee-backend

# Restart services
systemctl restart codementee-frontend
systemctl restart codementee-backend

# View logs
journalctl -u codementee-backend -f
journalctl -u codementee-frontend -f

# Test API
curl http://localhost:8001/api/pricing-plans

# Rebuild frontend
cd /var/www/codementee/frontend && rm -rf build && yarn build
```

## Summary

Run this ONE command on your VPS:
```bash
cd /var/www/codementee && ./fix_production_pricing.sh
```

That's it! Your pricing updates will work correctly after this.
