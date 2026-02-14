# 🚀 Quick Domain Setup Guide

## Current Status
✅ Your app is running at: http://62.72.13.129:3000  
🎯 Goal: Make it accessible at: https://codementee.io

---

## 3-Step Process

### Step 1: Configure DNS (5 minutes)
Go to your domain registrar and add these records:

```
Type: A
Name: @
Value: 62.72.13.129

Type: A  
Name: www
Value: 62.72.13.129
```

**Where to do this:**
- GoDaddy: My Products → Domains → DNS
- Namecheap: Domain List → Manage → Advanced DNS
- Cloudflare: DNS settings
- Google Domains: DNS settings

---

### Step 2: Install Nginx (2 minutes)
Run from your local machine:

```bash
./setup-domain-access.sh
```

This installs Nginx and configures reverse proxy.

---

### Step 3: Install SSL Certificate (5 minutes)
Wait 10-30 minutes for DNS to propagate, then run:

```bash
./setup-ssl-certificate.sh
```

This installs HTTPS certificate and configures secure access.

---

## Verification

Check DNS propagation:
```bash
ping codementee.io
# Should show: 62.72.13.129
```

After SSL setup, visit:
```
https://codementee.io
```

---

## Timeline

- **DNS Configuration**: 5 minutes (your work)
- **DNS Propagation**: 10-30 minutes (automatic)
- **Nginx Setup**: 2 minutes (script)
- **SSL Setup**: 5 minutes (script)

**Total**: ~45 minutes from start to finish

---

## Need Help?

See detailed instructions: `DOMAIN_SETUP_INSTRUCTIONS.md`

Common issues:
- DNS not working? Wait longer (up to 48 hours max)
- SSL failing? Make sure DNS is propagated first
- Site not loading? Check services: `./CHECK_STATUS.sh`

---

## What You'll Get

✅ https://codementee.io (secure, with green padlock)  
✅ https://www.codementee.io (www subdomain)  
✅ Automatic HTTP → HTTPS redirect  
✅ Auto-renewing SSL certificate (90 days)  
✅ Professional domain instead of IP address
