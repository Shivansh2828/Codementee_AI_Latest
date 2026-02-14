# 🚀 Simple Domain Setup - Run on VPS

## Current Status
✅ Your app is running at: http://62.72.13.129:3000  
🎯 Goal: Make it accessible at: https://codementee.io

---

## Step-by-Step Instructions

### Step 1: Configure DNS (Already Done! ✓)
You've already configured:
- A record: @ → 62.72.13.129
- CNAME: www → codementee.io

Wait 10-30 minutes for DNS to propagate.

---

### Step 2: Pull Latest Code on VPS

SSH into your VPS and pull the latest code:

```bash
ssh root@62.72.13.129
cd /var/www/codementee
git pull
```

---

### Step 3: Run Domain Setup Script

Still on the VPS, run:

```bash
cd /var/www/codementee
chmod +x vps-setup-domain.sh
./vps-setup-domain.sh
```

This will:
- Install Nginx
- Configure reverse proxy
- Make your site accessible at http://codementee.io

---

### Step 4: Verify HTTP Access

Wait 5-10 minutes, then check:

```bash
# From your VPS
curl -I http://codementee.io

# Or from your browser
http://codementee.io
```

---

### Step 5: Install SSL Certificate

Once HTTP is working, run:

```bash
cd /var/www/codementee
chmod +x vps-setup-ssl.sh
./vps-setup-ssl.sh
```

This will:
- Install Let's Encrypt SSL certificate
- Configure HTTPS
- Set up auto-renewal
- Update backend CORS

---

## Final Result

After all steps:
- ✅ https://codementee.io (secure)
- ✅ https://www.codementee.io (secure)
- ✅ Auto-renewing SSL certificate
- ✅ Professional domain

---

## Quick Commands Summary

```bash
# On VPS
ssh root@62.72.13.129
cd /var/www/codementee
git pull
./vps-setup-domain.sh
# Wait 10 minutes, verify HTTP works
./vps-setup-ssl.sh
# Done!
```

---

## Troubleshooting

### DNS not working?
```bash
# Check DNS from VPS
dig codementee.io
ping codementee.io
```

### Nginx errors?
```bash
# Check Nginx status
systemctl status nginx

# Check logs
tail -f /var/log/nginx/error.log
```

### SSL fails?
```bash
# Make sure DNS is propagated first
# Check if port 80 is accessible
curl -I http://codementee.io
```

---

## Timeline

- DNS propagation: 10-30 minutes (wait time)
- Domain setup script: 2 minutes
- SSL setup script: 3 minutes

**Total: ~35 minutes**
