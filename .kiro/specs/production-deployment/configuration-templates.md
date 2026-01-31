# Configuration Templates and Files

## Docker Configuration Templates

### 1. Production Dockerfile for Frontend

```dockerfile
# frontend/Dockerfile.prod
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Production Dockerfile for Backend

```dockerfile
# backend/Dockerfile.prod
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libc6-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Copy application code
COPY --chown=app:app . .

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Expose port
EXPOSE 8001

# Start application with Gunicorn
CMD ["gunicorn", "server:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8001", "--access-logfile", "-", "--error-logfile", "-"]
```

### 3. Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: codementee-frontend
    ports:
      - "3000:80"
    restart: unless-stopped
    environment:
      - REACT_APP_BACKEND_URL=https://api.codementee.io
      - REACT_APP_ENVIRONMENT=production
    networks:
      - codementee-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`codementee.io`, `www.codementee.io`)"
      - "traefik.http.routers.frontend.tls=true"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: codementee-backend
    ports:
      - "8001:8001"
    restart: unless-stopped
    environment:
      - MONGO_URL=${MONGO_URL}
      - DB_NAME=${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - SENDER_EMAIL=${SENDER_EMAIL}
      - BCC_EMAIL=${BCC_EMAIL}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - CORS_ORIGINS=${CORS_ORIGINS}
      - DEBUG=false
      - LOG_LEVEL=INFO
      - ENVIRONMENT=production
    depends_on:
      - redis
    networks:
      - codementee-network
    volumes:
      - ./logs:/app/logs
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.codementee.io`)"
      - "traefik.http.routers.backend.tls=true"

  redis:
    image: redis:7-alpine
    container_name: codementee-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - codementee-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: codementee-nginx
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - codementee-network

volumes:
  redis_data:
    driver: local

networks:
  codementee-network:
    driver: bridge
```

## Nginx Configuration Templates

### 1. Production Nginx Configuration

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# Optimize worker connections
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/xml
        image/svg+xml;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=register:10m rate=5r/m;

    # Connection limiting
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.codementee.io https://api.razorpay.com;" always;

    # Hide nginx version
    server_tokens off;

    # Upstream backend servers
    upstream backend {
        least_conn;
        server backend:8001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name codementee.io www.codementee.io api.codementee.io;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # Main HTTPS server (Frontend)
    server {
        listen 443 ssl http2;
        server_name codementee.io www.codementee.io;

        ssl_certificate /etc/nginx/ssl/codementee.io/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/codementee.io/privkey.pem;

        # OCSP stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        ssl_trusted_certificate /etc/nginx/ssl/codementee.io/chain.pem;

        # Connection limiting
        limit_conn conn_limit_per_ip 20;

        # Frontend (React SPA)
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;

            # Security headers for SPA
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }

        # Static assets with long-term caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            root /usr/share/nginx/html;
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
            
            # Enable compression for static assets
            gzip_static on;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Robots.txt
        location /robots.txt {
            root /usr/share/nginx/html;
            access_log off;
        }

        # Sitemap
        location /sitemap.xml {
            root /usr/share/nginx/html;
            access_log off;
        }
    }

    # API server
    server {
        listen 443 ssl http2;
        server_name api.codementee.io;

        ssl_certificate /etc/nginx/ssl/codementee.io/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/codementee.io/privkey.pem;

        # OCSP stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        ssl_trusted_certificate /etc/nginx/ssl/codementee.io/chain.pem;

        # Connection limiting
        limit_conn conn_limit_per_ip 10;

        # API endpoints with general rate limiting
        location / {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            proxy_http_version 1.1;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            
            # Buffer settings
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }

        # Authentication endpoints with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/auth/register {
            limit_req zone=register burst=3 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            proxy_pass http://backend/health;
            proxy_set_header Host $host;
        }

        # Metrics endpoint (restricted access)
        location /metrics {
            allow 127.0.0.1;
            allow 10.0.0.0/8;
            deny all;
            
            proxy_pass http://backend/metrics;
            proxy_set_header Host $host;
        }
    }
}
```

## Environment Configuration Templates

### 1. Production Environment Variables

```bash
# .env.production
# Database Configuration
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/codementee?retryWrites=true&w=majority
DB_NAME=codementee

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
CORS_ORIGINS=https://codementee.io,https://www.codementee.io

# Payment Gateway (Razorpay Live)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
SENDER_EMAIL=support@codementee.io
BCC_EMAIL=admin@codementee.io

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Application Configuration
DEBUG=false
LOG_LEVEL=INFO
ENVIRONMENT=production
PORT=8001

# Monitoring and Observability
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
PROMETHEUS_PORT=9090

# CDN and Static Assets
CDN_URL=https://cdn.codementee.io
STATIC_URL=https://static.codementee.io

# Auto-scaling Configuration
MAX_CPU_PERCENT=80
MAX_MEMORY_PERCENT=85
MIN_INSTANCES=2
MAX_INSTANCES=10

# Backup Configuration
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 2 * * *

# Rate Limiting
API_RATE_LIMIT=10/second
LOGIN_RATE_LIMIT=1/second
REGISTER_RATE_LIMIT=5/minute

# Session Configuration
SESSION_TIMEOUT=3600
REFRESH_TOKEN_EXPIRY=604800

# File Upload Configuration
MAX_FILE_SIZE=20971520  # 20MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_PAYMENT=true
ENABLE_AI_FEATURES=true
ENABLE_COMMUNITY=true
MAINTENANCE_MODE=false
```

### 2. Staging Environment Variables

```bash
# .env.staging
# Database Configuration
MONGO_URL=mongodb+srv://username:password@staging-cluster.mongodb.net/codementee_staging?retryWrites=true&w=majority
DB_NAME=codementee_staging

# Security Configuration
JWT_SECRET=staging-jwt-secret-key-different-from-production
CORS_ORIGINS=https://staging.codementee.io

# Payment Gateway (Razorpay Test)
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret

# Email Service (Resend Test)
RESEND_API_KEY=re_your_test_resend_api_key
SENDER_EMAIL=staging@codementee.io
BCC_EMAIL=dev@codementee.io

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Application Configuration
DEBUG=true
LOG_LEVEL=DEBUG
ENVIRONMENT=staging
PORT=8001

# Monitoring (Optional for staging)
SENTRY_DSN=https://your-staging-sentry-dsn@sentry.io/staging-project-id

# Feature Flags (More permissive for testing)
ENABLE_REGISTRATION=true
ENABLE_PAYMENT=true
ENABLE_AI_FEATURES=true
ENABLE_COMMUNITY=true
MAINTENANCE_MODE=false
```

## Systemd Service Templates

### 1. Codementee Application Service

```ini
# /etc/systemd/system/codementee.service
[Unit]
Description=Codementee Application
After=network.target docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/codementee/current
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
ExecReload=/usr/local/bin/docker-compose -f docker-compose.prod.yml restart
TimeoutStartSec=0
User=codementee
Group=codementee

[Install]
WantedBy=multi-user.target
```

### 2. Backup Service

```ini
# /etc/systemd/system/codementee-backup.service
[Unit]
Description=Codementee Backup Service
After=network.target

[Service]
Type=oneshot
User=codementee
Group=codementee
ExecStart=/var/www/codementee/scripts/backup.sh
StandardOutput=journal
StandardError=journal
```

### 3. Backup Timer

```ini
# /etc/systemd/system/codementee-backup.timer
[Unit]
Description=Run Codementee backup daily
Requires=codementee-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

## Monitoring Configuration Templates

### 1. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'codementee-monitor'

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
    scrape_interval: 30s

  - job_name: 'codementee-backend'
    static_configs:
      - targets: ['localhost:8001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
    scrape_interval: 30s

  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:9323']
    scrape_interval: 30s
```

### 2. Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "id": null,
    "title": "Codementee Production Dashboard",
    "tags": ["codementee", "production"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "System Overview",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"codementee-backend\"}",
            "legendFormat": "Backend Status"
          },
          {
            "expr": "up{job=\"nginx\"}",
            "legendFormat": "Nginx Status"
          },
          {
            "expr": "up{job=\"redis\"}",
            "legendFormat": "Redis Status"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "green", "value": 1}
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU Usage %"
          }
        ]
      },
      {
        "id": 3,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory Usage %"
          }
        ]
      },
      {
        "id": 4,
        "title": "HTTP Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "id": 5,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

These configuration templates provide a comprehensive foundation for deploying and managing the Codementee platform in production with proper monitoring, security, and performance optimization.