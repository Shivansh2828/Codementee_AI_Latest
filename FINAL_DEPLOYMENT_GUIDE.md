# 🚀 Final Deployment Guide - Codementee Production

## Current Status Analysis

### ✅ What's Working
- VPS: Hostinger (62.72.13.129)
- Domain: codementee.io (DNS configured)
- SSL: Let's Encrypt certificate installed
- Backend: Running on port 8001 with MongoDB
- Frontend: Running on port 3000 (Python HTTP server)
- Nginx: Configured as reverse proxy

### ❌ What's Broken
1. **API URL Configuration**: Frontend built with wrong API URL
   - Current: `REACT_APP_BACKEND_URL=https://codementee.io/api`
   - Issue: `api.js` adds `/api` → becomes `/api/api` ❌
   - Fix: Set to empty string → becomes `/api` ✅

2. **Slow Loading**: Using Python HTTP server instead of Nginx direct serving

3. **Login Not Working**: API calls going to wrong endpoints

---

## 🔧 Root Cause Analysis

### API URL Configuration Issue

**The Problem:**
```javascript
// frontend/src/utils/api.js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;  // ← Adds /api here!
```

**Current (Wrong):**
- `.env`: `REACT_APP_BACKEND_URL=https://codementee.io/api`
- Result: `https://codementee.io/api/api` ❌

**Fixed:**
- `.env`: `REACT_APP_BACKEND_URL=` (empty)
- Result: `/api` ✅ (relative URL, works with Nginx proxy)

---

## 🎯 Complete Fix Solution

### Step 1: Run on VPS

SSH into your VPS and run:

```bash
cd /var/www/codementee
git pull
chmod +x COMPLETE_PRODUCTION_FIX.sh
./COMPLETE_PRODUCTION_FIX.sh
```

This script will:
1. ✅ Pull latest code
2. ✅ Create correct `.env.production` with empty `REACT_APP_BACKEND_URL`
3. ✅ Rebuild frontend with correct API configuration
4. ✅ Update Nginx to serve static files directly (faster)
5. ✅ Stop Python HTTP server (no longer needed)
6. ✅ Restart all services

### Step 2: Verify

After the script completes:

```bash
# Check services
systemctl status nginx codementee-backend --no-pager

# Test API
curl https://codementee.io/api/companies

# Test frontend
curl -I https://codementee.io
```

### Step 3: Test in Browser

1. Clear browser cache: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Visit: https://codementee.io
3. Try logging in with: `admin@codementee.com` / `Admin@123`

---

## 📊 Architecture Overview

### Current Production Setup

```
Internet
   │
   ▼
codementee.io (DNS → 62.72.13.129)
   │
   ▼
Nginx (Port 80/443)
   │
   ├─► Static Files (Nginx serves directly from /var/www/codementee/frontend/build)
   │   └─► React App (index.html, JS, CSS)
   │
   └─► /api/* → Backend (localhost:8001)
          │
          └─► FastAPI + MongoDB
```

### API Request Flow

```
Browser: POST https://codementee.io/api/auth/login
   │
   ▼
Nginx: Receives request on port 443 (HTTPS)
   │
   ▼
Nginx: Matches location /api/
   │
   ▼
Nginx: Proxies to http://localhost:8001/api/auth/login
   │
   ▼
Backend: FastAPI processes request
   │
   ▼
MongoDB: Database query
   │
   ▼
Response flows back through Nginx to browser
```

---

## 🔍 Configuration Details

### Frontend Environment (`.env.production`)
```bash
REACT_APP_BACKEND_URL=
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
GENERATE_SOURCEMAP=false
```

**Why empty `REACT_APP_BACKEND_URL`?**
- `api.js` adds `/api` to whatever is in `REACT_APP_BACKEND_URL`
- Empty string + `/api` = `/api` (relative URL)
- Relative URLs work with Nginx proxy on same domain

### Backend Environment (`backend/.env`)
```bash
MONGO_URL=mongodb://localhost:27017/?tls=false
DB_NAME=codementee
JWT_SECRET=codementee-secret-key-2025
CORS_ORIGINS=https://codementee.io,https://www.codementee.io
RAZORPAY_KEY_ID=rzp_live_S8Pnnj923wxaob
RAZORPAY_KEY_SECRET=your_secret
```

### Nginx Configuration
```nginx
# Frontend - Nginx serves static files directly
location / {
    root /var/www/codementee/frontend/build;
    try_files $uri $uri/ /index.html;
}

# Backend API - Nginx proxies to FastAPI
location /api/ {
    proxy_pass http://localhost:8001;
    # ... proxy headers
}
```

---

## 🐛 Troubleshooting

### Issue: Login still not working

**Check API URL in browser console:**
```javascript
// Should see in console:
🚀 API.JS: Backend URL: 
🚀 API.JS: API URL: /api
🚀 API.JS: Request without token to: /auth/login
```

**If you see wrong URL:**
```bash
# Rebuild frontend
cd /var/www/codementee/frontend
rm -rf build node_modules/.cache
yarn build
systemctl restart codementee-frontend
```

### Issue: 502 Bad Gateway

**Check backend status:**
```bash
systemctl status codementee-backend
journalctl -u codementee-backend -n 50
```

**Restart backend:**
```bash
systemctl restart codementee-backend
```

### Issue: 404 Not Found

**Check Nginx logs:**
```bash
tail -f /var/log/nginx/error.log
```

**Check if frontend service is running:**
```bash
systemctl status codementee-frontend
```

### Issue: Slow loading

**Switch to Nginx direct serving:**
```bash
cd /var/www/codementee
./vps-optimize-frontend.sh
```

---

## 📝 Manual Verification Checklist

After deployment, verify:

- [ ] Homepage loads: https://codementee.io
- [ ] Login works: admin@codementee.com / Admin@123
- [ ] Dashboard loads after login
- [ ] API calls work (check Network tab)
- [ ] No console errors
- [ ] SSL certificate valid (green padlock)
- [ ] Fast loading (< 2 seconds)

---

## 🔐 Security Checklist

- [ ] Change VPS root password (URGENT!)
- [ ] Update backend CORS to domain only
- [ ] Verify SSL certificate auto-renewal
- [ ] Check firewall rules
- [ ] Review Nginx security headers
- [ ] Rotate JWT secret
- [ ] Update Razorpay keys if needed

---

## 📈 Performance Optimization

### Current Performance
- Python HTTP server: Slow (5-10 seconds first load)
- No compression
- No caching

### After Optimization
- Nginx direct serving: Fast (< 1 second)
- Gzip compression enabled
- Aggressive caching for static assets
- HTTP/2 enabled

---

## 🎓 Key Learnings

### Why the API URL was wrong

1. **Development**: `REACT_APP_BACKEND_URL=http://localhost:8001`
   - `api.js` adds `/api` → `http://localhost:8001/api` ✅

2. **Production (Wrong)**: `REACT_APP_BACKEND_URL=https://codementee.io/api`
   - `api.js` adds `/api` → `https://codementee.io/api/api` ❌

3. **Production (Correct)**: `REACT_APP_BACKEND_URL=`
   - `api.js` adds `/api` → `/api` ✅
   - Nginx proxies `/api/*` to backend

### Why relative URLs work better

- Relative URL `/api` works on any domain
- No need to change config for different environments
- Nginx handles the routing internally
- Simpler and more maintainable

---

## 🚀 Next Steps

### Immediate (Required)
1. Run `COMPLETE_PRODUCTION_FIX.sh` on VPS
2. Test login and basic functionality
3. Change VPS root password

### Short-term (Recommended)
1. Run `vps-optimize-frontend.sh` for better performance
2. Set up monitoring and alerts
3. Configure automated backups
4. Test payment flow end-to-end

### Long-term (Optional)
1. Set up CI/CD pipeline
2. Implement Redis caching
3. Add CDN for static assets
4. Set up staging environment

---

## 📞 Support Commands

### Quick Status Check
```bash
./CHECK_STATUS.sh
```

### View Logs
```bash
# Backend logs
journalctl -u codementee-backend -f

# Frontend logs
journalctl -u codementee-frontend -f

# Nginx logs
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
systemctl restart codementee-backend
systemctl restart codementee-frontend
systemctl reload nginx
```

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Site loads at https://codementee.io
2. ✅ Login works with test credentials
3. ✅ Dashboard displays correctly
4. ✅ API calls succeed (check Network tab)
5. ✅ No 404 or 502 errors
6. ✅ SSL certificate valid
7. ✅ Fast loading (< 2 seconds)
8. ✅ All services auto-start on reboot

---

*Last Updated: February 14, 2026*
*Deployment Status: Ready for final fix*
