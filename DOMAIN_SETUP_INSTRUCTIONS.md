# 🌐 Domain Setup Instructions for codementee.io

## Overview
This guide will help you configure codementee.io to point to your VPS and set up HTTPS.

---

## 📋 Prerequisites

- Domain: codementee.io (purchased and owned by you)
- VPS IP: 62.72.13.129
- Access to domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)

---

## 🚀 Setup Process

### Step 1: Configure DNS Records

1. **Log in to your domain registrar** (where you bought codementee.io)

2. **Navigate to DNS Management** section

3. **Add/Update these DNS records:**

   ```
   Type: A
   Name: @
   Value: 62.72.13.129
   TTL: 3600 (or Auto)
   ```

   ```
   Type: A
   Name: www
   Value: 62.72.13.129
   TTL: 3600 (or Auto)
   ```

4. **Save the changes**

5. **Wait for DNS propagation** (5-30 minutes, sometimes up to 48 hours)

---

### Step 2: Install Nginx and Configure Reverse Proxy

Run this script from your local machine:

```bash
chmod +x setup-domain-access.sh
./setup-domain-access.sh
```

This will:
- Install Nginx on your VPS
- Configure reverse proxy for frontend (port 3000) and backend (port 8001)
- Set up basic HTTP access

---

### Step 3: Verify DNS Propagation

Check if DNS is working:

```bash
# Check if domain resolves to your VPS IP
ping codementee.io
ping www.codementee.io

# Should show: 62.72.13.129
```

Or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

---

### Step 4: Install SSL Certificate (HTTPS)

Once DNS is propagated, run:

```bash
chmod +x setup-ssl-certificate.sh
./setup-ssl-certificate.sh
```

This will:
- Install Let's Encrypt SSL certificate
- Configure HTTPS with automatic HTTP→HTTPS redirect
- Set up auto-renewal (certificate renews every 90 days)
- Update backend CORS to allow your domain

---

## 🎯 What Each Script Does

### setup-domain-access.sh
1. Installs Nginx
2. Creates reverse proxy configuration
3. Routes traffic from port 80 to your services
4. Prepares for SSL installation

### setup-ssl-certificate.sh
1. Checks DNS configuration
2. Installs SSL certificate via Let's Encrypt
3. Configures HTTPS with security headers
4. Sets up automatic certificate renewal
5. Updates backend CORS settings

---

## 📊 Architecture After Setup

```
Internet
   │
   ▼
codementee.io (DNS → 62.72.13.129)
   │
   ▼
Nginx (Port 80/443)
   │
   ├─► Frontend (localhost:3000) → React App
   │
   └─► Backend API (localhost:8001/api) → FastAPI
          │
          ▼
       MongoDB (localhost:27017)
```

---

## 🔍 Verification Steps

After completing all steps:

### 1. Check HTTP Access (before SSL)
```bash
curl -I http://codementee.io
# Should return 200 OK
```

### 2. Check HTTPS Access (after SSL)
```bash
curl -I https://codementee.io
# Should return 200 OK with SSL certificate info
```

### 3. Check Backend API
```bash
curl https://codementee.io/api/companies
# Should return JSON with companies data
```

### 4. Visit in Browser
- Open https://codementee.io
- Should see your landing page
- Check for green padlock (secure connection)

---

## 🛠️ Manual Configuration (Alternative)

If you prefer to configure manually:

### DNS Configuration (at your registrar)
```
A Record:
  Host: @
  Points to: 62.72.13.129
  TTL: 3600

A Record:
  Host: www
  Points to: 62.72.13.129
  TTL: 3600
```

### Nginx Configuration (on VPS)
```bash
ssh root@62.72.13.129

# Install Nginx
apt update && apt install -y nginx

# Create configuration
nano /etc/nginx/sites-available/codementee
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name codementee.io www.codementee.io;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
ln -s /etc/nginx/sites-available/codementee /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### SSL Certificate (on VPS)
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d codementee.io -d www.codementee.io
```

---

## 🔐 Security Considerations

### After SSL Setup
1. **Update Backend CORS**
   ```bash
   ssh root@62.72.13.129
   cd /var/www/codementee/backend
   nano .env
   ```
   
   Change:
   ```
   CORS_ORIGINS=https://codementee.io,https://www.codementee.io
   ```
   
   Restart:
   ```bash
   systemctl restart codementee-backend
   ```

2. **Update Frontend API URL** (if needed)
   ```bash
   cd /var/www/codementee/frontend
   nano .env
   ```
   
   Should be:
   ```
   REACT_APP_BACKEND_URL=https://codementee.io/api
   ```
   
   Rebuild if changed:
   ```bash
   yarn build
   systemctl restart codementee-frontend
   ```

---

## 🐛 Troubleshooting

### DNS Not Resolving
```bash
# Check DNS propagation
nslookup codementee.io
dig codementee.io

# If not working:
# - Wait longer (up to 48 hours)
# - Check registrar DNS settings
# - Verify nameservers are correct
```

### Nginx Not Starting
```bash
# Check configuration
nginx -t

# Check logs
journalctl -u nginx -n 50

# Check if port 80 is available
netstat -tlnp | grep :80
```

### SSL Certificate Fails
```bash
# Common issues:
# 1. DNS not propagated yet - wait and retry
# 2. Port 80 blocked - check firewall
# 3. Domain not pointing to server - verify DNS

# Check Certbot logs
journalctl -u certbot -n 50
```

### Site Not Loading
```bash
# Check all services
systemctl status nginx
systemctl status codementee-frontend
systemctl status codementee-backend

# Check Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## 📞 Common Domain Registrars

### GoDaddy
1. Go to My Products → Domains
2. Click DNS next to your domain
3. Add A records as specified above

### Namecheap
1. Go to Domain List → Manage
2. Advanced DNS tab
3. Add A records as specified above

### Cloudflare
1. Go to DNS settings
2. Add A records as specified above
3. Set proxy status to "DNS only" (gray cloud) initially

### Google Domains
1. Go to DNS settings
2. Custom resource records
3. Add A records as specified above

---

## ✅ Final Checklist

Before going live:
- [ ] DNS records configured
- [ ] DNS propagation verified (ping works)
- [ ] Nginx installed and configured
- [ ] HTTP access working (http://codementee.io)
- [ ] SSL certificate installed
- [ ] HTTPS access working (https://codementee.io)
- [ ] Backend CORS updated
- [ ] Frontend API URL updated
- [ ] All services running
- [ ] Test login/registration
- [ ] Test booking flow
- [ ] Test payment integration

---

## 🎉 Success!

Once complete, your site will be accessible at:
- **https://codementee.io** (primary)
- **https://www.codementee.io** (www subdomain)

Both will automatically redirect to HTTPS with a valid SSL certificate.

---

## 📈 Next Steps After Domain Setup

1. **Update all documentation** with new domain
2. **Update Razorpay** webhook URLs
3. **Update email templates** with domain links
4. **Set up monitoring** for uptime
5. **Configure CDN** (optional, for better performance)
6. **Set up analytics** (Google Analytics, etc.)

---

*Last Updated: February 14, 2026*
