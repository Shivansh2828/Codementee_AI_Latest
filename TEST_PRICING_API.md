# Testing Dynamic Pricing API

## Backend API Test
✅ API is working correctly and returning updated prices:

```bash
curl "http://localhost:8001/api/pricing-plans?service_type=course"
```

Response:
- DevOps Course: `price: 59900` (₹599) ✅
- AWS Course: `price: 49900` (₹499) ✅

## Frontend Fix Applied
✅ Fixed the API calls in:
- `DevOpsIndex.jsx` - Now fetches `/api/pricing-plans?service_type=course` and finds `devops_course` plan
- `AWSIndex.jsx` - Now fetches `/api/pricing-plans?service_type=course` and finds `aws_course` plan
- `CoursesLandingPage.jsx` - Fetches all course plans and maps them by plan_id

## Local Testing Steps

### 1. Restart Frontend Dev Server
The frontend dev server needs to be restarted to pick up the code changes:

```bash
# Kill the current dev server (Ctrl+C in the terminal)
# Then restart it:
npm start
```

### 2. Clear Browser Cache
- Open DevTools (F12)
- Go to Application → Cache Storage
- Delete all caches
- Or do a hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### 3. Test the Pricing
- Go to http://localhost:3000/learn/devops
- You should see ₹599 (not ₹499)
- Go to http://localhost:3000/learn/aws
- You should see ₹499
- Go to http://localhost:3000/learn
- Course cards should show dynamic prices

### 4. Verify in Browser Console
Open DevTools Console and check:
- No errors in console
- Network tab shows `/api/pricing-plans?service_type=course` request
- Response contains the correct prices

## If Still Showing 499

### Check 1: Is the dev server restarted?
```bash
ps aux | grep "npm start"
```
If not running, restart it.

### Check 2: Is the browser cache cleared?
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or open DevTools → Network → Disable cache

### Check 3: Is the API responding?
```bash
curl "http://localhost:8001/api/pricing-plans?service_type=course" | jq '.[] | {plan_id, price}'
```
Should show:
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

### Check 4: Check Network Tab
- Open DevTools → Network tab
- Go to /learn/devops
- Look for request to `/api/pricing-plans?service_type=course`
- Check the response - should have `price: 59900`

## Next Steps After Local Testing
1. Verify prices show correctly locally
2. Create PR with these changes
3. Deploy to production

## Files Changed
- `frontend/src/pages/learn/DevOpsIndex.jsx`
- `frontend/src/pages/learn/AWSIndex.jsx`
- `frontend/src/pages/learn/CoursesLandingPage.jsx`
