# 🌐 Domain Setup Guide for codementee.io

## Current Status
✅ Your website is working on: http://62.72.13.129:3000  
🎯 **Goal**: Make it work on https://codementee.io

## Step 1: Configure DNS Records (IMPORTANT - Do This First!)

Go to your domain registrar (where you bought codementee.io) and add these DNS records:

### DNS Records to Add:
```
Type: A
Name: @
Value: 62.72.13.129
TTL: 300 (or Auto)

Type: A
Name: www
Value: 62.72.13.129
TTL: 300 (or Auto)

Type: A
Name: api
Value: 62.72.13.129
TTL: 300 (or Auto)
```

### How to Add DNS Records:
1. **Login to your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)
2. **Find DNS Management** (usually called "DNS", "DNS Records", or "Nameservers")
3. **Add the 3 A records** shown above
4. **Save changes**

⏰ **DNS propagation takes 5 minutes to 24 hours**

## Step 2: Test DNS Propagation

You can test if DNS is working by visiting:
- http://codementee.io (should show your website)
- http://www.codementee.io (should show your website)

Or use online tools like: https://dnschecker.org

## Step 3: Run Domain Setup Script

Once DNS is working, SSH to your VPS and run:

```bash
# SSH to your VPS
ssh root@62.72.13.129
# Password: Z8v3L&J.07t.CYQq1@xU

# Navigate to project
cd /var/www/codementee

# Make script executable
chmod +x setup-domain.sh

# Run domain setup (this will set up SSL certificates)
./setup-domain.sh
```

## What the Script Will Do:

1. ✅ **Check DNS propagation**
2. 🔄 **Update configuration** to use your domain
3. 🔒 **Install SSL certificates** (Let's Encrypt)
4. 🌐 **Configure Nginx** for domain routing
5. 🔄 **Set up automatic certificate renewal**
6. 🚀 **Restart all services**

## After Setup Complete:

Your website will be available at:
- ✅ **https://codementee.io** (main website)
- ✅ **https://www.codementee.io** (redirects to main)
- ✅ **https://api.codementee.io** (API endpoint)

## If DNS is Not Ready Yet:

You can still update the configuration and run without SSL:

```bash
# SSH to VPS
ssh root@62.72.13.129

# Navigate to project
cd /var/www/codementee

# Rebuild with domain configuration (without SSL)
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

# Test
curl http://codementee.io
```

## Troubleshooting:

### If DNS is not working:
1. **Double-check DNS records** in your registrar
2. **Wait longer** (can take up to 24 hours)
3. **Try different DNS checker tools**
4. **Contact your registrar** if records aren't saving

### If SSL setup fails:
1. **Make sure DNS is fully propagated**
2. **Check if ports 80/443 are open**
3. **Try running the script again** after DNS propagation

### If website doesn't load:
1. **Check container status**: `docker ps`
2. **Check logs**: `docker logs codementee-nginx`
3. **Test backend**: `curl https://api.codementee.io/api/companies`

## Quick Commands:

```bash
# Check container status
docker ps

# View nginx logs
docker logs codementee-nginx

# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Test API
curl https://api.codementee.io/api/companies

# Check SSL certificate
openssl s_client -connect codementee.io:443 -servername codementee.io
```

## Final Result:

After successful setup:
- 🌐 **Main Website**: https://codementee.io
- 🔧 **API**: https://api.codementee.io
- 🔒 **SSL Secured** with automatic renewal
- 🔄 **HTTP automatically redirects to HTTPS**
- 📱 **Mobile and desktop optimized**

---

**Need Help?** If you encounter any issues, check the logs and let me know what error messages you see!