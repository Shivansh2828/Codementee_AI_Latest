# Design Document: Production Deployment Specification

## Overview

This design document outlines the comprehensive production deployment architecture for the Codementee platform on Hostinger VPS infrastructure. The solution provides a scalable, secure, and cost-effective deployment capable of handling thousands of concurrent users while maintaining high availability and performance.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "External Services"
        CDN[CloudFlare CDN]
        DNS[DNS Management]
        SSL[SSL Certificate Authority]
    end
    
    subgraph "Hostinger VPS Infrastructure"
        LB[Nginx Load Balancer]
        
        subgraph "Application Tier"
            APP1[App Server 1<br/>React + FastAPI]
            APP2[App Server 2<br/>React + FastAPI]
            APP3[App Server N<br/>React + FastAPI]
        end
        
        subgraph "Cache Tier"
            REDIS[Redis Cache Cluster]
        end
        
        subgraph "Monitoring"
            MON[Monitoring Stack<br/>Prometheus + Grafana]
            LOG[Log Aggregation<br/>ELK Stack]
        end
    end
    
    subgraph "External Data Services"
        MONGO[MongoDB Atlas]
        RAZORPAY[Razorpay API]
        RESEND[Resend Email API]
    end
    
    subgraph "Backup & Storage"
        BACKUP[Backup Storage]
        STATIC[Static File Storage]
    end
    
    CDN --> LB
    DNS --> CDN
    LB --> APP1
    LB --> APP2
    LB --> APP3
    APP1 --> REDIS
    APP2 --> REDIS
    APP3 --> REDIS
    APP1 --> MONGO
    APP2 --> MONGO
    APP3 --> MONGO
    APP1 --> RAZORPAY
    APP1 --> RESEND
    MON --> APP1
    MON --> APP2
    MON --> APP3
    LOG --> APP1
    LOG --> APP2
    LOG --> APP3
    BACKUP --> MONGO
    BACKUP --> STATIC
```

### Infrastructure Tiers

#### 1. Edge Tier (CDN + DNS)
- **CloudFlare CDN**: Global content delivery network for static assets
- **DNS Management**: Domain routing and subdomain configuration
- **SSL Termination**: HTTPS certificate management and renewal

#### 2. Load Balancing Tier
- **Nginx Load Balancer**: Request distribution and SSL termination
- **Health Checks**: Automatic failover for unhealthy instances
- **Rate Limiting**: DDoS protection and API rate limiting

#### 3. Application Tier
- **Multiple App Servers**: Horizontal scaling with identical instances
- **React Frontend**: Optimized production builds served by Nginx
- **FastAPI Backend**: Python application servers with Gunicorn/Uvicorn
- **Auto-scaling**: Dynamic instance provisioning based on load

#### 4. Cache Tier
- **Redis Cluster**: Distributed caching for session data and frequently accessed content
- **Cache Strategies**: Write-through, read-through, and cache-aside patterns

#### 5. Data Tier
- **MongoDB Atlas**: Managed database service with built-in scaling and backups
- **Connection Pooling**: Efficient database connection management
- **Read Replicas**: Distributed read operations for better performance

## Components and Interfaces

### 1. Hostinger VPS Configuration

#### Recommended VPS Specifications

**Starter Configuration (Up to 1,000 concurrent users):**
- **VPS Plan**: Business VPS
- **CPU**: 6 vCPU cores
- **RAM**: 16 GB
- **Storage**: 400 GB NVMe SSD
- **Bandwidth**: Unlimited
- **Estimated Cost**: $29.99/month

**Scaling Configuration (Up to 5,000 concurrent users):**
- **VPS Plan**: Enterprise VPS
- **CPU**: 8 vCPU cores
- **RAM**: 32 GB
- **Storage**: 800 GB NVMe SSD
- **Bandwidth**: Unlimited
- **Estimated Cost**: $59.99/month

**High-Scale Configuration (Up to 10,000+ concurrent users):**
- **Multiple VPS Instances**: 3-5 Business VPS instances behind load balancer
- **Total Resources**: 18-30 vCPU, 48-80 GB RAM
- **Estimated Cost**: $89.97-149.95/month

#### VPS Setup and Configuration

```bash
# Initial server setup script
#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y nginx redis-server supervisor htop curl wget git

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Python 3.11
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Create application user
useradd -m -s /bin/bash codementee
usermod -aG docker codementee

# Create application directories
mkdir -p /var/www/codementee
mkdir -p /var/log/codementee
mkdir -p /var/backups/codementee
chown -R codementee:codementee /var/www/codementee
chown -R codementee:codementee /var/log/codementee
```

### 2. Application Deployment Architecture

#### Frontend Deployment (React)

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Deployment (FastAPI)

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

# Expose port
EXPOSE 8001

# Start application
CMD ["gunicorn", "server:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8001"]
```

#### Docker Compose Configuration

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:80"
    restart: unless-stopped
    environment:
      - REACT_APP_BACKEND_URL=https://api.codementee.io
    networks:
      - codementee-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8001:8001"
    restart: unless-stopped
    environment:
      - MONGO_URL=${MONGO_URL}
      - JWT_SECRET=${JWT_SECRET}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
      - RESEND_API_KEY=${RESEND_API_KEY}
    depends_on:
      - redis
    networks:
      - codementee-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - codementee-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - codementee-network

volumes:
  redis-data:

networks:
  codementee-network:
    driver: bridge
```

### 3. Load Balancing and Reverse Proxy

#### Nginx Configuration

```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream backend servers
    upstream backend {
        least_conn;
        server backend1:8001 max_fails=3 fail_timeout=30s;
        server backend2:8001 max_fails=3 fail_timeout=30s;
        server backend3:8001 max_fails=3 fail_timeout=30s;
    }

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name codementee.io www.codementee.io;
        return 301 https://$server_name$request_uri;
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name codementee.io www.codementee.io;

        ssl_certificate /etc/nginx/ssl/codementee.io.crt;
        ssl_certificate_key /etc/nginx/ssl/codementee.io.key;

        # Frontend (React SPA)
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;

            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
                add_header Vary Accept-Encoding;
            }
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Login endpoint with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 4. Database Optimization

#### MongoDB Atlas Configuration

```javascript
// Database indexes for performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "status": 1 })
db.users.createIndex({ "plan_id": 1 })

db.booking_requests.createIndex({ "mentee_id": 1 })
db.booking_requests.createIndex({ "mentor_id": 1 })
db.booking_requests.createIndex({ "status": 1 })
db.booking_requests.createIndex({ "created_at": -1 })

db.mocks.createIndex({ "mentee_id": 1 })
db.mocks.createIndex({ "mentor_id": 1 })
db.mocks.createIndex({ "scheduled_at": 1 })

db.orders.createIndex({ "email": 1 })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "created_at": -1 })

db.time_slots.createIndex({ "date": 1, "status": 1 })
db.time_slots.createIndex({ "interview_type": 1 })

// Compound indexes for complex queries
db.booking_requests.createIndex({ "status": 1, "created_at": -1 })
db.mocks.createIndex({ "mentee_id": 1, "status": 1 })
db.users.createIndex({ "role": 1, "status": 1 })
```

#### Connection Pool Configuration

```python
# Enhanced database configuration in server.py
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Connection pool settings
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "codementee")

# Configure connection pool
client = AsyncIOMotorClient(
    MONGO_URL,
    maxPoolSize=50,  # Maximum connections in pool
    minPoolSize=10,  # Minimum connections to maintain
    maxIdleTimeMS=30000,  # Close connections after 30s idle
    waitQueueTimeoutMS=5000,  # Wait 5s for connection from pool
    serverSelectionTimeoutMS=5000,  # 5s timeout for server selection
    connectTimeoutMS=10000,  # 10s connection timeout
    socketTimeoutMS=20000,  # 20s socket timeout
)

db = client[DB_NAME]

# Health check for database
async def check_database_health():
    try:
        await client.admin.command('ping')
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False
```

### 5. Caching Strategy

#### Redis Configuration

```python
# Redis caching implementation
import redis.asyncio as redis
import json
from typing import Optional, Any
import os

# Redis connection
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True,
    max_connections=20,
    retry_on_timeout=True,
    socket_connect_timeout=5,
    socket_timeout=5,
)

class CacheManager:
    def __init__(self):
        self.default_ttl = 300  # 5 minutes
        
    async def get(self, key: str) -> Optional[Any]:
        try:
            value = await redis_client.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = None) -> bool:
        try:
            ttl = ttl or self.default_ttl
            await redis_client.setex(key, ttl, json.dumps(value))
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        try:
            await redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False

cache = CacheManager()

# Cache decorators for common operations
def cache_result(key_prefix: str, ttl: int = 300):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = await cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator

# Usage examples
@cache_result("companies", ttl=3600)  # Cache for 1 hour
async def get_companies():
    companies = await db.companies.find().to_list(1000)
    return [serialize_doc(dict(c)) for c in companies]

@cache_result("pricing_plans", ttl=1800)  # Cache for 30 minutes
async def get_pricing_plans():
    plans = await db.pricing_plans.find().to_list(100)
    return [serialize_doc(dict(p)) for p in plans]
```

## Data Models

### Environment Configuration

```bash
# Production environment variables
# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/codementee?retryWrites=true&w=majority
DB_NAME=codementee

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
CORS_ORIGINS=https://codementee.io,https://www.codementee.io

# Payment Gateway (Razorpay Live)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
SENDER_EMAIL=support@codementee.io
BCC_EMAIL=admin@codementee.io

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Application
DEBUG=false
LOG_LEVEL=INFO
ENVIRONMENT=production

# Monitoring
SENTRY_DSN=your_sentry_dsn
PROMETHEUS_PORT=9090

# CDN and Static Assets
CDN_URL=https://cdn.codementee.io
STATIC_URL=https://static.codementee.io

# Auto-scaling thresholds
MAX_CPU_PERCENT=80
MAX_MEMORY_PERCENT=85
MIN_INSTANCES=2
MAX_INSTANCES=10
```

### Deployment Configuration

```yaml
# deployment-config.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: codementee-config
data:
  # Application configuration
  app.yml: |
    server:
      host: "0.0.0.0"
      port: 8001
      workers: 4
      
    database:
      connection_pool:
        min_size: 10
        max_size: 50
        max_idle_time: 30000
        
    cache:
      redis:
        host: "redis"
        port: 6379
        max_connections: 20
        
    monitoring:
      metrics_port: 9090
      health_check_interval: 30
      
    security:
      rate_limits:
        api: "10/second"
        login: "1/second"
        registration: "5/minute"
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Infrastructure Provisioning Reliability
*For any* deployment initiation, the system should successfully provision all required VPS resources with correct specifications and establish proper service connectivity.
**Validates: Requirements 1.1, 1.4**

### Property 2: Application Deployment Integrity
*For any* application deployment, both frontend and backend should be deployed with optimized configurations and respond correctly to health checks.
**Validates: Requirements 1.2, 1.3**

### Property 3: HTTPS Enforcement
*For any* HTTP request to the production system, the request should be automatically redirected to HTTPS with valid SSL certificates.
**Validates: Requirements 1.5, 3.1**

### Property 4: Load Distribution Effectiveness
*For any* traffic load exceeding single server capacity, requests should be distributed across multiple instances with no single point of failure.
**Validates: Requirements 2.1, 2.2**

### Property 5: Caching Performance Improvement
*For any* cacheable request, the cache system should reduce response times and database load by at least 70% compared to non-cached requests.
**Validates: Requirements 2.5, 4.5**

### Property 6: Auto-scaling Responsiveness
*For any* resource threshold breach, the auto-scaling system should provision or deallocate resources within defined time limits based on actual demand.
**Validates: Requirements 2.4, 8.2**

### Property 7: Security Controls Enforcement
*For any* API request, rate limiting should be enforced, security headers should be present, and authentication should be validated according to role-based access rules.
**Validates: Requirements 3.2, 3.3, 3.4**

### Property 8: Performance SLA Compliance
*For any* API endpoint under normal load, 95% of requests should complete within 200ms with proper optimization and compression applied.
**Validates: Requirements 4.3, 4.4**

### Property 9: Monitoring and Alerting Coverage
*For any* system component failure or performance degradation, monitoring should detect the issue and generate alerts within 5 minutes with sufficient diagnostic information.
**Validates: Requirements 5.2, 5.3, 5.5**

### Property 10: Backup and Recovery Reliability
*For any* backup operation, the system should create complete, verifiable backups that can be restored within 4 hours while maintaining proper retention policies.
**Validates: Requirements 6.1, 6.3, 6.4**

### Property 11: CI/CD Pipeline Reliability
*For any* code deployment, the pipeline should execute automated tests, deploy to staging, and handle production deployment with rollback capability if failures occur.
**Validates: Requirements 7.1, 7.2, 7.4**

### Property 12: Cost Optimization Effectiveness
*For any* resource allocation decision, the system should optimize costs while maintaining performance requirements and alert administrators of budget threshold breaches.
**Validates: Requirements 8.1, 8.3, 8.4**

### Property 13: DNS and Domain Configuration
*For any* domain request, DNS should resolve correctly to production servers with proper subdomain support and CDN routing for static assets.
**Validates: Requirements 9.1, 9.2, 9.5**

### Property 14: Configuration Management Security
*For any* environment configuration, sensitive credentials should be securely stored and managed with proper validation and hot-reloading capabilities.
**Validates: Requirements 10.1, 10.2, 10.5**

## Error Handling

### Application-Level Error Handling

```python
# Enhanced error handling and monitoring
import logging
import traceback
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

# Configure Sentry for error tracking
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment=os.getenv("ENVIRONMENT", "production")
)

# Custom exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}\n{traceback.format_exc()}")
    
    # Don't expose internal errors in production
    if os.getenv("DEBUG", "false").lower() == "true":
        detail = str(exc)
    else:
        detail = "Internal server error"
    
    return JSONResponse(
        status_code=500,
        content={"detail": detail, "type": "internal_error"}
    )

# Database connection error handling
async def handle_database_error(operation: str, error: Exception):
    logger.error(f"Database error in {operation}: {str(error)}")
    
    # Attempt to reconnect
    try:
        await client.admin.command('ping')
        logger.info("Database connection restored")
    except Exception as reconnect_error:
        logger.error(f"Database reconnection failed: {str(reconnect_error)}")
        # Alert monitoring system
        await send_alert("database_connection_failed", {
            "operation": operation,
            "error": str(error),
            "reconnect_error": str(reconnect_error)
        })

# Circuit breaker pattern for external services
class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    async def call(self, func, *args, **kwargs):
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
            else:
                raise HTTPException(status_code=503, detail="Service temporarily unavailable")
        
        try:
            result = await func(*args, **kwargs)
            if self.state == "HALF_OPEN":
                self.state = "CLOSED"
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = "OPEN"
            
            raise e

# Usage for external API calls
razorpay_circuit_breaker = CircuitBreaker()
resend_circuit_breaker = CircuitBreaker()
```

### Infrastructure Error Handling

```bash
#!/bin/bash
# health-check.sh - Comprehensive health monitoring

# Function to check service health
check_service() {
    local service_name=$1
    local health_url=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$health_url" --max-time 10)
    
    if [ "$response" = "200" ]; then
        echo "✓ $service_name is healthy"
        return 0
    else
        echo "✗ $service_name is unhealthy (HTTP $response)"
        return 1
    fi
}

# Function to restart service if unhealthy
restart_service() {
    local service_name=$1
    echo "Restarting $service_name..."
    
    case $service_name in
        "nginx")
            systemctl restart nginx
            ;;
        "backend")
            docker-compose restart backend
            ;;
        "redis")
            systemctl restart redis-server
            ;;
    esac
    
    sleep 10
}

# Function to send alert
send_alert() {
    local service=$1
    local status=$2
    local message="Service $service is $status on $(hostname) at $(date)"
    
    # Send to monitoring system
    curl -X POST "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" \
         -H 'Content-type: application/json' \
         --data "{\"text\":\"$message\"}"
    
    # Log to system
    logger "ALERT: $message"
}

# Main health check loop
main() {
    local failed_services=()
    
    # Check all services
    if ! check_service "nginx" "http://localhost/health"; then
        failed_services+=("nginx")
    fi
    
    if ! check_service "backend" "http://localhost:8001/health"; then
        failed_services+=("backend")
    fi
    
    if ! check_service "redis" "http://localhost:6379"; then
        failed_services+=("redis")
    fi
    
    # Restart failed services
    for service in "${failed_services[@]}"; do
        restart_service "$service"
        send_alert "$service" "restarted"
    done
    
    # Overall system status
    if [ ${#failed_services[@]} -eq 0 ]; then
        echo "All services healthy"
        exit 0
    else
        echo "Some services required restart: ${failed_services[*]}"
        exit 1
    fi
}

main "$@"
```

## Testing Strategy

### Infrastructure Testing

```python
# infrastructure_tests.py
import pytest
import asyncio
import aiohttp
import time
from concurrent.futures import ThreadPoolExecutor

class TestProductionDeployment:
    
    @pytest.mark.asyncio
    async def test_load_balancer_distribution(self):
        """Test that load balancer distributes requests across backend instances"""
        async with aiohttp.ClientSession() as session:
            responses = []
            
            # Make 100 requests to check distribution
            for _ in range(100):
                async with session.get("https://api.codementee.io/health") as response:
                    server_id = response.headers.get("X-Server-ID")
                    responses.append(server_id)
            
            # Verify requests are distributed across multiple servers
            unique_servers = set(responses)
            assert len(unique_servers) >= 2, "Load balancer should distribute across multiple servers"
    
    @pytest.mark.asyncio
    async def test_ssl_enforcement(self):
        """Test that HTTP requests are redirected to HTTPS"""
        async with aiohttp.ClientSession() as session:
            async with session.get("http://codementee.io", allow_redirects=False) as response:
                assert response.status == 301
                assert response.headers["Location"].startswith("https://")
    
    @pytest.mark.asyncio
    async def test_rate_limiting(self):
        """Test that rate limiting is properly enforced"""
        async with aiohttp.ClientSession() as session:
            # Make requests rapidly to trigger rate limiting
            tasks = []
            for _ in range(50):
                task = session.get("https://api.codementee.io/api/companies")
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Some requests should be rate limited
            rate_limited = sum(1 for r in responses if hasattr(r, 'status') and r.status == 429)
            assert rate_limited > 0, "Rate limiting should be enforced"
    
    @pytest.mark.asyncio
    async def test_database_connection_pooling(self):
        """Test database connection pool efficiency"""
        start_time = time.time()
        
        # Simulate concurrent database operations
        async def make_db_request():
            async with aiohttp.ClientSession() as session:
                async with session.get("https://api.codementee.io/api/companies") as response:
                    return response.status
        
        # Make 50 concurrent requests
        tasks = [make_db_request() for _ in range(50)]
        results = await asyncio.gather(*tasks)
        
        end_time = time.time()
        duration = end_time - start_time
        
        # All requests should succeed
        assert all(status == 200 for status in results)
        
        # Should complete within reasonable time (connection pooling efficiency)
        assert duration < 10, f"Concurrent requests took too long: {duration}s"
    
    @pytest.mark.asyncio
    async def test_cache_performance(self):
        """Test that caching improves response times"""
        async with aiohttp.ClientSession() as session:
            # First request (cache miss)
            start_time = time.time()
            async with session.get("https://api.codementee.io/api/companies") as response:
                first_response_time = time.time() - start_time
                first_data = await response.json()
            
            # Second request (cache hit)
            start_time = time.time()
            async with session.get("https://api.codementee.io/api/companies") as response:
                second_response_time = time.time() - start_time
                second_data = await response.json()
            
            # Data should be identical
            assert first_data == second_data
            
            # Second request should be faster (cached)
            assert second_response_time < first_response_time * 0.5
    
    def test_backup_integrity(self):
        """Test backup creation and restoration"""
        # This would be implemented as a separate script
        # that creates a backup and verifies its integrity
        pass
    
    @pytest.mark.asyncio
    async def test_auto_scaling_triggers(self):
        """Test that auto-scaling responds to load"""
        # This would require load testing tools
        # to simulate high traffic and verify scaling
        pass

# Performance testing
class TestPerformance:
    
    @pytest.mark.asyncio
    async def test_response_time_under_load(self):
        """Test response times under concurrent load"""
        async def make_request():
            async with aiohttp.ClientSession() as session:
                start_time = time.time()
                async with session.get("https://api.codementee.io/api/companies") as response:
                    response_time = time.time() - start_time
                    return response_time, response.status
        
        # Make 100 concurrent requests
        tasks = [make_request() for _ in range(100)]
        results = await asyncio.gather(*tasks)
        
        response_times = [r[0] for r in results]
        statuses = [r[1] for r in results]
        
        # All requests should succeed
        assert all(status == 200 for status in statuses)
        
        # 95% of requests should be under 500ms
        response_times.sort()
        p95_time = response_times[int(len(response_times) * 0.95)]
        assert p95_time < 0.5, f"95th percentile response time: {p95_time}s"
```

### Monitoring and Alerting Tests

```python
# monitoring_tests.py
import pytest
import requests
import time

class TestMonitoring:
    
    def test_health_endpoints(self):
        """Test all health check endpoints"""
        endpoints = [
            "https://codementee.io/health",
            "https://api.codementee.io/health",
        ]
        
        for endpoint in endpoints:
            response = requests.get(endpoint, timeout=10)
            assert response.status_code == 200
            assert "healthy" in response.text.lower()
    
    def test_metrics_collection(self):
        """Test that metrics are being collected"""
        # This would test Prometheus metrics endpoint
        response = requests.get("https://codementee.io:9090/metrics", timeout=10)
        assert response.status_code == 200
        
        # Check for key metrics
        metrics_text = response.text
        assert "http_requests_total" in metrics_text
        assert "database_connections" in metrics_text
        assert "cache_hits_total" in metrics_text
    
    def test_log_aggregation(self):
        """Test that logs are being properly aggregated"""
        # This would test log aggregation system
        pass
    
    def test_alert_system(self):
        """Test that alerts are triggered appropriately"""
        # This would test alert system by simulating failures
        pass
```

This comprehensive design provides a production-ready deployment architecture for the Codementee platform with scalability, security, and monitoring built-in. The next step would be to create the detailed implementation tasks.