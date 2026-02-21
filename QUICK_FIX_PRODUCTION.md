# Quick Fix for Production Pricing Updates

## Problem
Pricing changes in admin dashboard not showing on main website in production.

## Solution (2 Steps)

### Step 1: Push Code to VPS
On your local machine:
```bash
git add .
git commit -m "Fix pricing updates"
git push origin main
```

### Step 2: Run Fix on VPS
SSH into your VPS and run:
```bash
ssh root@62.72.13.129
cd /var/www/codementee
./fix_production_pricing.sh
```

That's it! ✅

## What the Script Does
1. Pulls latest code
2. Rebuilds frontend (clears all caches)
3. Restarts all services
4. Verifies everything works

## After Running the Fix

When you update prices in admin:
- Changes save to database immediately ✅
- Users refresh page (F5) to see updates ✅
- No more cache issues ✅

## Test It

1. Go to https://codementee.io/admin/pricing
2. Change a price
3. Save
4. Open https://codementee.io in incognito window
5. You'll see the new price ✅

---

**Need help?** Read `PRODUCTION_FIX.md` for detailed instructions.
