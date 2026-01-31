# Deployment & Production Guide

## Production Environment Setup

### Server Requirements
- **Backend**: Python 3.11+, 2GB RAM minimum, 4GB recommended
- **Frontend**: Node.js 18+, Nginx for static file serving
- **Database**: MongoDB Atlas (cloud) or self-hosted MongoDB 6.0+
- **SSL**: HTTPS certificate for secure communication
- **Domain**: Custom domain with proper DNS configuration

### Environment Configuration

#### Backend (.env)
```bash
# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/codementee?retryWrites=true&w=majority
DB_NAME=codementee

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Payment Gateway (Razorpay Live)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
SENDER_EMAIL=support@yourdomain.com
BCC_EMAIL=admin@yourdomain.com

# Application
DEBUG=false
LOG_LEVEL=INFO

# Tier System Configuration
FREE_TIER_FEATURES=dashboard,pricing,booking_start
PAID_TIER_FEATURES=mock_interviews,ai_tools,community,feedback
UPGRADE_REDIRECT_URL=https://yourdomain.com/mentee/book
```

#### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

## Deployment Steps

### 1. Backend Deployment (FastAPI)

#### Using Docker (Recommended)
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Direct Deployment
```bash
# Install dependencies
pip install -r requirements.txt

# Run with Gunicorn (production WSGI server)
pip install gunicorn uvicorn[standard]
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

#### Systemd Service (Linux)
```ini
# /etc/systemd/system/codementee-backend.service
[Unit]
Description=Codementee Backend API
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/var/www/codementee/backend
Environment=PATH=/var/www/codementee/backend/venv/bin
ExecStart=/var/www/codementee/backend/venv/bin/gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8001
Restart=always

[Install]
WantedBy=multi-user.target
```

### 2. Frontend Deployment (React)

#### Build Process
```bash
# Install dependencies
yarn install

# Build for production
yarn build

# The build folder contains the production-ready files
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/codementee
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    # Frontend (React build)
    location / {
        root /var/www/codementee/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Database Setup (MongoDB Atlas)

#### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

#### Initial Data Setup
```bash
# Run initial data setup with tier support
cd backend
python setup_initial_data.py

# Update pricing plans (transparent pricing)
python fix_pricing_transparency.py
```

#### Database Indexes (Performance)
```javascript
// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.booking_requests.createIndex({ "mentee_id": 1 })
db.booking_requests.createIndex({ "mentor_id": 1 })
db.booking_requests.createIndex({ "status": 1 })
db.mocks.createIndex({ "mentee_id": 1 })
db.mocks.createIndex({ "mentor_id": 1 })
db.orders.createIndex({ "email": 1 })
db.orders.createIndex({ "status": 1 })
db.time_slots.createIndex({ "date": 1, "status": 1 })
```

## Security Configuration

### SSL/TLS Setup
```bash
# Using Let's Encrypt (Certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Firewall Configuration
```bash
# UFW (Ubuntu Firewall)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Rate Limiting (Nginx)
```nginx
# Add to nginx configuration
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
}

server {
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        # ... other proxy settings
    }
    
    # Login rate limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        # ... other proxy settings
    }
}
```

## Monitoring & Logging

### Application Logging
```python
# Enhanced logging in server.py
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/codementee/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Log important events
@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    logger.info(f"Login attempt for email: {credentials.email}")
    # ... rest of login logic
```

### Health Check Endpoint
```python
# Add to server.py
@api_router.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test database connection
        await db.users.count_documents({})
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")
```

### Monitoring Setup
```bash
# Log rotation
sudo nano /etc/logrotate.d/codementee
```

```
/var/log/codementee/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
        systemctl restart codementee-backend
    endscript
}
```

## Backup Strategy

### Database Backup
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/codementee"
mkdir -p $BACKUP_DIR

# MongoDB Atlas backup (if using Atlas, backups are automatic)
# For self-hosted MongoDB:
mongodump --uri="mongodb://localhost:27017/codementee" --out="$BACKUP_DIR/db_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/db_$DATE.tar.gz" "$BACKUP_DIR/db_$DATE"
rm -rf "$BACKUP_DIR/db_$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*.tar.gz" -mtime +7 -delete
```

### Application Backup
```bash
#!/bin/bash
# backup-app.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/codementee"
APP_DIR="/var/www/codementee"

# Backup application files
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" -C "$APP_DIR" .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete
```

## Performance Optimization

### Backend Optimization
```python
# Add to server.py for caching
from functools import lru_cache

@lru_cache(maxsize=100)
async def get_cached_companies():
    """Cache companies data for 5 minutes"""
    companies = await db.companies.find().to_list(1000)
    return [serialize_doc(dict(c)) for c in companies]

# Use Redis for session caching (optional)
import redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)
```

### Frontend Optimization
```javascript
// Add to package.json build script
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build && npm run compress",
    "compress": "gzip -k build/static/js/*.js && gzip -k build/static/css/*.css"
  }
}
```

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database indexes created
- [ ] Initial data populated
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Security measures in place

### Post-Deployment
- [ ] Health check endpoint responding
- [ ] All API endpoints functional
- [ ] Payment integration working
- [ ] Email notifications working
- [ ] User registration/login working
- [ ] Booking flow complete
- [ ] Admin panel accessible
- [ ] Performance metrics baseline established

### Ongoing Maintenance
- [ ] Daily backup verification
- [ ] Weekly security updates
- [ ] Monthly performance review
- [ ] Quarterly dependency updates
- [ ] Log monitoring and analysis
- [ ] User feedback collection and analysis

## Troubleshooting Guide

### Common Issues

#### Backend Not Starting
```bash
# Check logs
sudo journalctl -u codementee-backend -f

# Check port availability
sudo netstat -tlnp | grep :8001

# Test database connection
python -c "from motor.motor_asyncio import AsyncIOMotorClient; import asyncio; asyncio.run(AsyncIOMotorClient('your_mongo_url').admin.command('ping'))"
```

#### Frontend Not Loading
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check SSL certificate
openssl x509 -in /path/to/certificate.crt -text -noout
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb+srv://your-connection-string"

# Check network connectivity
ping your-cluster.mongodb.net
```

### Performance Issues
```bash
# Monitor system resources
htop
df -h
free -m

# Check application logs
tail -f /var/log/codementee/app.log

# Monitor database performance
# (Use MongoDB Atlas monitoring or self-hosted monitoring tools)
```

This comprehensive deployment guide ensures a smooth production deployment with proper security, monitoring, and maintenance procedures.