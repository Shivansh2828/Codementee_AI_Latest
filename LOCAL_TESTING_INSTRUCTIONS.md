# Local Testing Instructions - Dynamic Pricing Fix

## The Issue
Frontend was using `fetch()` with relative paths instead of the `api` utility, which has the correct base URL configured.

## The Fix
Updated all three files to use the `api` utility from `utils/api.js`:
- `DevOpsIndex.jsx` - Now uses `api.get('/pricing-plans?service_type=course')`
- `AWSIndex.jsx` - Now uses `api.get('/pricing-plans?service_type=course')`
- `CoursesLandingPage.jsx` - Now uses `api.get('/pricing-plans?service_type=course')`

## CRITICAL: Restart Dev Server

The dev server caches the old code. You MUST restart it:

### Step 1: Kill the Current Dev Server
In the terminal where `npm start` is running:
```
Ctrl+C
```

Wait for it to fully stop (you should see the prompt return).

### Step 2: Restart the Dev Server
```bash
npm start
```

Wait for it to fully compile and show:
```
Compiled successfully!
```

### Step 3: Clear Browser Cache
- **Mac**: Cmd+Shift+R (hard refresh)
- **Windows**: Ctrl+Shift+R (hard refresh)
- Or: DevTools → Application → Cache Storage → Delete all

### Step 4: Test the Pricing
Go to http://localhost:3000/learn/devops

You should now see:
- ✅ ₹599 (not ₹499)
- ✅ Console logs showing "✅ DevOps pricing loaded: 59900"

Go to http://localhost:3000/learn/aws
- ✅ ₹499
- ✅ Console logs showing "✅ AWS pricing loaded: 49900"

## Verify Backend API is Working
```bash
curl "http://localhost:8001/api/pricing-plans?service_type=course" | jq '.[] | {plan_id, price}'
```

Should return:
```json
{
  "plan_id": "devops_course",
  "price": 59900
}
{
  "plan_id": "aws_course",
  "price": 49900
}
```

## If Still Showing 499

### Check 1: Is Dev Server Restarted?
```bash
ps aux | grep "npm start"
```
If you see the process, it's running. If not, restart it.

### Check 2: Check Browser Console
Open DevTools (F12) → Console tab
- Look for "✅ DevOps pricing loaded: 59900"
- Or "❌ Failed to fetch pricing:" with error details

### Check 3: Check Network Tab
- Open DevTools → Network tab
- Go to /learn/devops
- Look for request to `/api/pricing-plans?service_type=course`
- Check the response - should have `price: 59900`

### Check 4: Check Backend Logs
```bash
# In another terminal, watch backend logs
journalctl -u codementee-backend -f
# Or if running locally:
# Check the terminal where uvicorn is running
```

## Files Changed
- `frontend/src/pages/learn/DevOpsIndex.jsx` - Added `import api` and changed to `api.get()`
- `frontend/src/pages/learn/AWSIndex.jsx` - Added `import api` and changed to `api.get()`
- `frontend/src/pages/learn/CoursesLandingPage.jsx` - Added `import api` and changed to `api.get()`

## Build Status
✅ Frontend build successful
✅ No TypeScript/ESLint errors
✅ Ready for local testing

## Next Steps After Confirming Locally
1. Confirm prices display correctly
2. Create PR with these changes
3. Deploy to production
