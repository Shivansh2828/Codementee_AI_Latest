# 🚀 Deployment Checklist — AWS Course + Dynamic Pricing

## Pre-Deployment

- [ ] All code changes committed to `main` branch
- [ ] Tested locally: `./start-local-dev.sh`
- [ ] No console errors in browser DevTools
- [ ] Backend tests passing (if applicable)

## Deployment Steps

### Step 1: Deploy Code to VPS

```bash
git add .
git commit -m "Add: AWS course + dynamic pricing management"
git push origin main

# On VPS
ssh root@62.72.13.129
cd /var/www/codementee
./deploy.sh
```

**Expected Output:**
```
Frontend: X files, Backend: Y files
✅ Deployment Successful!
```

### Step 2: Create Course Plan Templates

```bash
ssh root@62.72.13.129
cd /var/www/codementee/backend
python setup_course_plans.py
```

**Expected Output:**
```
✓ Created: devops_course (set prices in Admin Dashboard)
✓ Created: aws_course (set prices in Admin Dashboard)
✓ Created: devops_aws_bundle (set prices in Admin Dashboard)

✅ Done. Course plans created.
📌 Next step: Go to Admin Dashboard → Pricing to set prices for each currency.
```

### Step 3: Set Prices in Admin Dashboard

1. Go to `https://codementee.io/admin`
2. Login with admin credentials
3. Navigate to **Pricing** section
4. For each course plan, set:
   - `price_inr` (in paise, e.g., 49900 for ₹499)
   - `price_usd` (in cents, e.g., 600 for $6)
5. Click **Save** for each plan

**Recommended Prices:**
- DevOps Course: ₹499 / $6
- AWS Course: ₹499 / $6
- Bundle: ₹799 / $10

### Step 4: Verify Deployment

#### Check Services

```bash
ssh root@62.72.13.129
./CHECK_STATUS.sh
```

**Expected:**
```
Nginx: active
Backend: active
API Test: HTTP 200
Frontend Test: HTTP 200
```

#### Test API Endpoints

```bash
# Get course pricing
curl -s https://codementee.io/api/pricing-plans?service_type=course | jq .

# Should return array with course plans and prices
```

#### Test Frontend

1. Go to `https://codementee.io/learn/aws`
   - Should show AWS course page
   - Should NOT show hardcoded ₹499
   - Should show "One-time payment"

2. Go to `https://codementee.io/learn/devops`
   - Should show DevOps course page
   - Should NOT show hardcoded ₹499
   - Should show "One-time payment"

3. Go to `https://codementee.io/mentee/book?tab=courses`
   - Should show course pricing cards
   - Should display prices from Admin Dashboard
   - Should show correct currency (₹ for India, $ for international)

4. Test payment flow (as test user):
   - Select a course
   - Click "Buy Now"
   - Should redirect to Razorpay (India) or Cashfree (International)

### Step 5: Clear Browser Cache

Users may see old prices due to browser cache. Recommend:

```
Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
Or: Clear browser cache → Reload
```

## Post-Deployment Verification

### Frontend

- [ ] AWS course page loads without errors
- [ ] DevOps course page loads without errors
- [ ] Course pricing page shows dynamic prices
- [ ] No hardcoded ₹499 visible anywhere
- [ ] Payment gateway selection works (Razorpay for India, Cashfree for international)

### Backend

- [ ] Course plans created in MongoDB
- [ ] Prices set for all courses
- [ ] API returns correct prices: `GET /api/pricing-plans?service_type=course`
- [ ] Payment creation works: `POST /api/payment/create-order`

### Admin Dashboard

- [ ] Can view course pricing plans
- [ ] Can update prices
- [ ] Changes reflect immediately on frontend

### User Experience

- [ ] Logged-in user can see course pricing
- [ ] Can purchase course with correct payment gateway
- [ ] Receives confirmation after payment
- [ ] Course access granted after successful payment

## Rollback Plan

If something goes wrong:

```bash
ssh root@62.72.13.129
cd /var/www/codementee

# Find previous commit
git log --oneline | head -5

# Rollback to previous version
git reset --hard <commit-hash>
./deploy.sh
```

## Monitoring

### Check Logs

```bash
# Backend logs
journalctl -u codementee-backend -f

# Nginx logs
tail -f /var/log/nginx/error.log

# Payment errors
journalctl -u codementee-backend | grep -i payment
```

### Monitor Payments

1. Go to Admin Dashboard → Orders
2. Look for new course orders
3. Verify payment status is "success"
4. Verify user has course access

## Documentation

- [ ] Read: `PRICING_MANAGEMENT_GUIDE.md`
- [ ] Read: `PRICING_IMPLEMENTATION_SUMMARY.md`
- [ ] Share with team: Pricing management process
- [ ] Update: Internal wiki/docs with new pricing system

## Communication

- [ ] Notify team: Deployment complete
- [ ] Notify users: New AWS course available
- [ ] Update: Landing page (if needed)
- [ ] Update: Email templates (if needed)

## Success Criteria

✅ Deployment is successful when:

1. ✅ AWS course page loads and shows "One-time payment"
2. ✅ DevOps course page loads and shows "One-time payment"
3. ✅ Course pricing page shows prices from Admin Dashboard
4. ✅ No hardcoded prices visible in UI
5. ✅ Payment flow works (Razorpay for India, Cashfree for international)
6. ✅ Users can purchase courses
7. ✅ Course access granted after payment
8. ✅ Admin can update prices without redeployment
9. ✅ No errors in browser console
10. ✅ No errors in backend logs

## Troubleshooting

### Issue: Course plans not showing

```bash
# Check if setup script was run
ssh root@62.72.13.129
cd /var/www/codementee/backend
python setup_course_plans.py
```

### Issue: Prices not displaying

```bash
# Check if prices are set in Admin Dashboard
curl -s https://codementee.io/api/pricing-plans?service_type=course | jq .

# Should show price_inr and price_usd for each plan
```

### Issue: Wrong payment gateway

```bash
# Check currency detection
curl -s https://codementee.io/api/payment/config | jq .

# Should return razorpay_key_id
```

### Issue: Frontend not updated

```bash
# Force rebuild and deploy
ssh root@62.72.13.129
cd /var/www/codementee
rm -rf frontend/build
./deploy.sh
```

## Sign-Off

- [ ] Deployment completed successfully
- [ ] All tests passed
- [ ] No critical issues
- [ ] Ready for production

**Deployed by:** ________________  
**Date:** ________________  
**Time:** ________________  

---

## Quick Reference

### Commands

```bash
# Deploy
cd /var/www/codementee && ./deploy.sh

# Setup course plans
cd /var/www/codementee/backend && python setup_course_plans.py

# Check status
./CHECK_STATUS.sh

# View logs
journalctl -u codementee-backend -f

# Test API
curl -s https://codementee.io/api/pricing-plans?service_type=course | jq .
```

### URLs

- Frontend: https://codementee.io
- Admin Dashboard: https://codementee.io/admin
- AWS Course: https://codementee.io/learn/aws
- DevOps Course: https://codementee.io/learn/devops
- Course Pricing: https://codementee.io/mentee/book?tab=courses

### Contacts

- Support: support@codementee.com
- Admin: [admin email]
- DevOps: [devops contact]
