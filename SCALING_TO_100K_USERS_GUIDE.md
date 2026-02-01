# 📈 Scaling Codementee to 100,000 Users - Complete Guide

## 📋 Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [Scaling Strategy Overview](#scaling-strategy-overview)
3. [Phase 1: Vertical Scaling (0-10k users)](#phase-1-vertical-scaling-0-10k-users)
4. [Phase 2: Horizontal Scaling (10k-50k users)](#phase-2-horizontal-scaling-10k-50k-users)
5. [Phase 3: Microservices Architecture (50k-100k users)](#phase-3-microservices-architecture-50k-100k-users)
6. [Infrastructure Cost Analysis](#infrastructure-cost-analysis)
7. [Performance Monitoring](#performance-monitoring)
8. [Implementation Timeline](#implementation-timeline)

---

## 🎯 Current State Analysis

### What We Have Now
- **Server**: Hostinger VPS (2GB RAM, 2 CPU cores, 40GB SSD)
- **Architecture**: Monolithic with Docker containers
- **Database**: MongoDB Atlas M10 (2GB RAM)
- **Current Capacity**: ~1,000-2,000 concurrent users
- **Target**: 100,000 total users (5,000-10,000 concurrent)

### Performance Baseline
```
Current Metrics:
├── Response Time: ~200-500ms (API endpoints)
├── Database Queries: ~50-100ms average
├── Memory Usage: ~1.2GB (70% of available)
├── CPU Usage: ~40-60% under normal load
└── Storage: ~15GB used (37% of available)
```

### Bottlenecks Identified
1. **Single Server**: All services on one machine
2. **Database**: Limited connection pool and memory
3. **No Caching**: Direct database queries for everything
4. **No CDN**: Static assets served from origin
5. **No Load Balancing**: Single point of failure

---

## 🚀 Scaling Strategy Overview

### Three-Phase Approach
```
Phase 1: Vertical Scaling (0-10k users)
├── Upgrade server resources
├── Implement caching layer
├── Database optimization
└── Basic monitoring

Phase 2: Horizontal Scaling (10k-50k users)
├── Load balancer setup
├── Multiple app servers
├── Database clustering
└── CDN implementation

Phase 3: Microservices (50k-100k users)
├── Service decomposition
├── Kubernetes deployment
├── Advanced monitoring
└── Auto-scaling
```

### Key Principles
- **Incremental Changes**: No major rewrites
- **Backward Compatibility**: Maintain existing functionality
- **Cost Optimization**: Scale efficiently without waste
- **Monitoring First**: Measure before and after changes

---

## 📊 Phase 1: Vertical Scaling (0-10k users)

### Timeline: 0-6 months
### Target: Handle 10,000 total users, 1,000 concurrent

### 1. Server Upgrade
```bash
# Current: 2GB RAM, 2 CPU cores
# Upgrade to: 8GB RAM, 4 CPU cores, 80GB SSD
# Cost: $40/month → $80/month
```

#### Implementation Steps:
```bash
# 1. Create server snapshot
sudo apt install rsync
rsync -av /var/www/codementee/ /backup/codementee/

# 2. Upgrade server plan (via Hostinger panel)
# 3. Restore application
# 4. Update Docker resource limits
```

### 2. Database Optimization

#### MongoDB Atlas Upgrade
```bash
# Current: M10 (2GB RAM, 10GB storage)
# Upgrade to: M20 (4GB RAM, 20GB storage)
# Cost: $57/month → $75/month
```

#### Critical Indexes Implementation
```javascript
// Performance-critical indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1, "status": 1 })
db.users.createIndex({ "created_at": -1 })

db.booking_requests.createIndex({ "mentee_id": 1, "status": 1 })
db.booking_requests.createIndex({ "mentor_id": 1, "status": 1 })
db.booking_requests.createIndex({ "status": 1, "created_at": -1 })
db.booking_requests.createIndex({ "company_id": 1, "interview_type": 1 })

db.mocks.createIndex({ "mentee_id": 1, "date": -1 })
db.mocks.createIndex({ "mentor_id": 1, "date": -1 })
db.mocks.createIndex({ "date": 1, "status": 1 })

db.orders.createIndex({ "email": 1, "status": 1 })
db.orders.createIndex({ "created_at": -1, "status": 1 })

db.time_slots.createIndex({ "date": 1, "status": 1 })
db.time_slots.createIndex({ "interview_types": 1, "status": 1 })
```

#### Query Optimization
```python
# Before: Load all data
async def get_booking_requests():
    return await db.booking_requests.find().to_list(None)

# After: Implement pagination
async def get_booking_requests(skip: int = 0, limit: int = 50):
    return await db.booking_requests.find(
        {},
        {"_id": 0}  # Exclude MongoDB ObjectId
    ).skip(skip).limit(limit).to_list(limit)

# Before: Multiple queries
async def get_booking_with_details(booking_id: str):
    booking = await db.booking_requests.find_one({"id": booking_id})
    company = await db.companies.find_one({"id": booking["company_id"]})
    return {"booking": booking, "company": company}

# After: Aggregation pipeline
async def get_booking_with_details(booking_id: str):
    pipeline = [
        {"$match": {"id": booking_id}},
        {"$lookup": {
            "from": "companies",
            "localField": "company_id",
            "foreignField": "id",
            "as": "company"
        }},
        {"$unwind": "$company"}
    ]
    result = await db.booking_requests.aggregate(pipeline).to_list(1)
    return result[0] if result else None
```

### 3. Redis Caching Implementation

#### Redis Setup
```yaml
# docker-compose.prod.yml - Enhanced Redis
redis:
  image: redis:7-alpine
  container_name: codementee-redis
  restart: unless-stopped
  command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

#### Caching Strategy
```python
import redis
import json
from functools import wraps

redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

def cache_result(expiration=300):  # 5 minutes default
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expiration, json.dumps(result, default=str))
            return result
        return wrapper
    return decorator

# Usage examples
@cache_result(expiration=600)  # 10 minutes
async def get_companies():
    companies = await db.companies.find().to_list(1000)
    return [serialize_doc(dict(c)) for c in companies]

@cache_result(expiration=300)  # 5 minutes
async def get_pricing_plans():
    plans = await db.pricing_plans.find().to_list(100)
    return [serialize_doc(dict(p)) for p in plans]

@cache_result(expiration=60)  # 1 minute
async def get_available_slots(date: str):
    slots = await db.time_slots.find({
        "date": date,
        "status": "available"
    }).to_list(100)
    return [serialize_doc(dict(s)) for s in slots]
```

### 4. Application Performance Optimization

#### Backend Optimizations
```python
# Connection pooling optimization
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(
    MONGO_URL,
    maxPoolSize=50,  # Increased from default 10
    minPoolSize=10,
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=5000
)

# Async email processing
import asyncio
from concurrent.futures import ThreadPoolExecutor

email_executor = ThreadPoolExecutor(max_workers=5)

async def send_email_async(email_data):
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(email_executor, send_email_sync, email_data)

# Response compression
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request/Response logging middleware
import time
import logging

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

#### Frontend Optimizations
```javascript
// Code splitting implementation
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const MenteeDashboard = lazy(() => import('./pages/mentee/MenteeDashboard'));

// Usage with loading fallback
<Suspense fallback={<div>Loading...</div>}>
  <AdminDashboard />
</Suspense>

// API response caching
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  timeout: 10000,
});

// Add response caching
const cache = new Map();

api.interceptors.response.use(
  (response) => {
    // Cache GET requests for 5 minutes
    if (response.config.method === 'get') {
      const cacheKey = response.config.url;
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      // Clean old cache entries
      setTimeout(() => cache.delete(cacheKey), 300000); // 5 minutes
    }
    return response;
  }
);

// Bundle optimization
// package.json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
  }
}
```

### 5. Monitoring Implementation

#### Application Metrics
```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import time

# Metrics collection
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')
ACTIVE_USERS = Gauge('active_users_total', 'Number of active users')
DATABASE_QUERIES = Counter('database_queries_total', 'Total database queries', ['collection', 'operation'])

@app.middleware("http")
async def add_metrics(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    REQUEST_LATENCY.observe(time.time() - start_time)
    return response

@app.get("/metrics")
async def get_metrics():
    return Response(generate_latest(), media_type="text/plain")
```

#### Health Checks Enhancement
```python
@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "services": {}
    }
    
    try:
        # Database health
        start_time = time.time()
        await db.users.count_documents({})
        db_latency = time.time() - start_time
        health_status["services"]["database"] = {
            "status": "connected",
            "latency_ms": round(db_latency * 1000, 2)
        }
    except Exception as e:
        health_status["services"]["database"] = {
            "status": "error",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    try:
        # Redis health
        start_time = time.time()
        redis_client.ping()
        redis_latency = time.time() - start_time
        health_status["services"]["redis"] = {
            "status": "connected",
            "latency_ms": round(redis_latency * 1000, 2)
        }
    except Exception as e:
        health_status["services"]["redis"] = {
            "status": "error",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # System metrics
    import psutil
    health_status["system"] = {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent
    }
    
    status_code = 200 if health_status["status"] == "healthy" else 503
    return JSONResponse(content=health_status, status_code=status_code)
```

### Phase 1 Expected Results
- **Capacity**: 10,000 total users, 1,000 concurrent
- **Response Time**: <300ms for 95% of requests
- **Database Performance**: 50% faster queries with caching
- **Cost**: ~$155/month total infrastructure
- **Uptime**: 99.5% availability

---

## ⚖️ Phase 2: Horizontal Scaling (10k-50k users)

### Timeline: 6-18 months
### Target: Handle 50,000 total users, 3,000 concurrent

### 1. Load Balancer Setup

#### Nginx Load Balancer Configuration
```nginx
# /etc/nginx/nginx.conf
upstream backend_servers {
    least_conn;  # Load balancing method
    server backend-1:8001 weight=3;
    server backend-2:8001 weight=3;
    server backend-3:8001 weight=2;
    
    # Health checks
    keepalive 32;
}

upstream frontend_servers {
    server frontend-1:80;
    server frontend-2:80;
    
    keepalive 16;
}

server {
    listen 443 ssl http2;
    server_name codementee.io www.codementee.io;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/codementee.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codementee.io/privkey.pem;
    
    # Performance optimizations
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Frontend load balancing
    location / {
        proxy_pass http://frontend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Connection pooling
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}

server {
    listen 443 ssl http2;
    server_name api.codementee.io;
    
    # API load balancing
    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Connection pooling
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
}
```

### 2. Multi-Server Docker Compose

#### Scaled Docker Compose Configuration
```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: codementee-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - backend-1
      - backend-2
      - backend-3
      - frontend-1
      - frontend-2
    networks:
      - codementee-network

  backend-1:
    build: ./backend
    container_name: codementee-backend-1
    restart: unless-stopped
    env_file:
      - ./backend/.env
    environment:
      - INSTANCE_ID=backend-1
    depends_on:
      - redis
    networks:
      - codementee-network
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'

  backend-2:
    build: ./backend
    container_name: codementee-backend-2
    restart: unless-stopped
    env_file:
      - ./backend/.env
    environment:
      - INSTANCE_ID=backend-2
    depends_on:
      - redis
    networks:
      - codementee-network
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'

  backend-3:
    build: ./backend
    container_name: codementee-backend-3
    restart: unless-stopped
    env_file:
      - ./backend/.env
    environment:
      - INSTANCE_ID=backend-3
    depends_on:
      - redis
    networks:
      - codementee-network
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'

  frontend-1:
    build: ./frontend
    container_name: codementee-frontend-1
    restart: unless-stopped
    networks:
      - codementee-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'

  frontend-2:
    build: ./frontend
    container_name: codementee-frontend-2
    restart: unless-stopped
    networks:
      - codementee-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'

  redis:
    image: redis:7-alpine
    container_name: codementee-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 2gb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - codementee-network
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '0.5'

volumes:
  redis_data:
    driver: local

networks:
  codementee-network:
    driver: bridge
```

### 3. Database Scaling

#### MongoDB Atlas Cluster Upgrade
```bash
# Current: M20 (4GB RAM, 20GB storage)
# Upgrade to: M30 (8GB RAM, 40GB storage)
# Cost: $75/month → $200/month
# Add read replicas for read scaling
```

#### Read/Write Separation
```python
from motor.motor_asyncio import AsyncIOMotorClient

# Separate connections for read and write operations
write_client = AsyncIOMotorClient(
    MONGO_WRITE_URL,
    maxPoolSize=30,
    w="majority"  # Write concern
)

read_client = AsyncIOMotorClient(
    MONGO_READ_URL,  # Read replica connection
    maxPoolSize=50,
    readPreference="secondaryPreferred"
)

write_db = write_client[DB_NAME]
read_db = read_client[DB_NAME]

# Usage patterns
async def create_user(user_data):
    # Write operations use write database
    result = await write_db.users.insert_one(user_data)
    return result

async def get_users(skip=0, limit=50):
    # Read operations use read database
    users = await read_db.users.find().skip(skip).limit(limit).to_list(limit)
    return users

async def get_companies():
    # Frequently read data from read replica
    companies = await read_db.companies.find().to_list(1000)
    return companies
```

### 4. CDN Implementation

#### CloudFlare CDN Setup
```javascript
// Frontend build optimization for CDN
// webpack.config.js (via CRACO)
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Optimize for CDN delivery
      webpackConfig.output.publicPath = 'https://cdn.codementee.io/';
      
      // Split chunks for better caching
      webpackConfig.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
      
      return webpackConfig;
    },
  },
};

// Static asset optimization
// public/index.html
<link rel="preconnect" href="https://cdn.codementee.io">
<link rel="dns-prefetch" href="https://api.codementee.io">
```

#### Nginx CDN Configuration
```nginx
# Static asset caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Served-By "nginx";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

### 5. Advanced Caching Strategy

#### Multi-Layer Caching
```python
import asyncio
from typing import Optional, Any
import pickle

class CacheManager:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.local_cache = {}  # In-memory cache
        self.local_cache_ttl = {}
    
    async def get(self, key: str) -> Optional[Any]:
        # Level 1: Local memory cache
        if key in self.local_cache:
            if time.time() < self.local_cache_ttl.get(key, 0):
                return self.local_cache[key]
            else:
                del self.local_cache[key]
                del self.local_cache_ttl[key]
        
        # Level 2: Redis cache
        try:
            cached_data = self.redis.get(key)
            if cached_data:
                data = pickle.loads(cached_data)
                # Store in local cache for 60 seconds
                self.local_cache[key] = data
                self.local_cache_ttl[key] = time.time() + 60
                return data
        except Exception as e:
            logger.error(f"Redis cache error: {e}")
        
        return None
    
    async def set(self, key: str, value: Any, ttl: int = 300):
        try:
            # Store in Redis
            self.redis.setex(key, ttl, pickle.dumps(value))
            
            # Store in local cache
            self.local_cache[key] = value
            self.local_cache_ttl[key] = time.time() + min(ttl, 60)
        except Exception as e:
            logger.error(f"Cache set error: {e}")

cache_manager = CacheManager(redis_client)

# Usage with automatic cache warming
@app.on_event("startup")
async def warm_cache():
    """Warm up frequently accessed data"""
    try:
        # Warm up companies cache
        companies = await read_db.companies.find().to_list(1000)
        await cache_manager.set("companies", companies, ttl=3600)
        
        # Warm up pricing plans
        pricing = await read_db.pricing_plans.find().to_list(100)
        await cache_manager.set("pricing_plans", pricing, ttl=3600)
        
        logger.info("Cache warmed successfully")
    except Exception as e:
        logger.error(f"Cache warming failed: {e}")
```

### 6. Session Management

#### Distributed Session Storage
```python
import uuid
from datetime import datetime, timedelta

class SessionManager:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.session_ttl = 86400  # 24 hours
    
    async def create_session(self, user_id: str, user_data: dict) -> str:
        session_id = str(uuid.uuid4())
        session_data = {
            "user_id": user_id,
            "user_data": user_data,
            "created_at": datetime.now().isoformat(),
            "last_accessed": datetime.now().isoformat()
        }
        
        await self.redis.setex(
            f"session:{session_id}",
            self.session_ttl,
            json.dumps(session_data)
        )
        
        return session_id
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        try:
            session_data = await self.redis.get(f"session:{session_id}")
            if session_data:
                data = json.loads(session_data)
                # Update last accessed time
                data["last_accessed"] = datetime.now().isoformat()
                await self.redis.setex(
                    f"session:{session_id}",
                    self.session_ttl,
                    json.dumps(data)
                )
                return data
        except Exception as e:
            logger.error(f"Session retrieval error: {e}")
        
        return None
    
    async def delete_session(self, session_id: str):
        await self.redis.delete(f"session:{session_id}")

session_manager = SessionManager(redis_client)
```

### Phase 2 Expected Results
- **Capacity**: 50,000 total users, 3,000 concurrent
- **Response Time**: <200ms for 95% of requests
- **Availability**: 99.9% uptime with load balancing
- **Cost**: ~$400/month total infrastructure
- **Performance**: 3x improvement in throughput

---

## 🏗️ Phase 3: Microservices Architecture (50k-100k users)

### Timeline: 18-36 months
### Target: Handle 100,000 total users, 5,000-10,000 concurrent

### 1. Service Decomposition

#### Microservices Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Service  │    │ Booking Service │    │ Payment Service │
│   (Auth, Users) │    │ (Interviews)    │    │ (Razorpay)      │
│   Port: 8001    │    │   Port: 8002    │    │   Port: 8003    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  API Gateway    │
                    │   (Kong/Nginx)  │
                    │   Port: 80/443  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Frontend      │
                    │   (React SPA)   │
                    │   Port: 3000    │
                    └─────────────────┘
```

#### Service Definitions

##### User Service
```python
# user_service/main.py
from fastapi import FastAPI, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI(title="User Service", version="1.0.0")

# Database connection
client = AsyncIOMotorClient(MONGO_URL)
db = client.users_db

@app.post("/auth/register-free")
async def register_free_user(data: FreeUserCreate):
    # Handle free user registration
    pass

@app.post("/auth/login")
async def login(credentials: UserLogin):
    # Handle user authentication
    pass

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    # Get user details
    pass

@app.put("/users/{user_id}")
async def update_user(user_id: str, data: UserUpdate):
    # Update user information
    pass
```

##### Booking Service
```python
# booking_service/main.py
from fastapi import FastAPI, Depends, HTTPException
import httpx

app = FastAPI(title="Booking Service", version="1.0.0")

# Service communication
user_service_url = "http://user-service:8001"
payment_service_url = "http://payment-service:8003"

@app.post("/booking-requests")
async def create_booking_request(data: BookingRequestCreate, user=Depends(get_current_user)):
    # Verify user with User Service
    async with httpx.AsyncClient() as client:
        user_response = await client.get(f"{user_service_url}/users/{user['user_id']}")
        if user_response.status_code != 200:
            raise HTTPException(status_code=404, detail="User not found")
    
    # Create booking request
    pass

@app.post("/admin/confirm-booking")
async def admin_confirm_booking(data: AdminConfirmBookingRequest):
    # Admin mentor assignment
    pass

@app.get("/booking-requests/{user_id}")
async def get_user_bookings(user_id: str):
    # Get user's booking requests
    pass
```

##### Payment Service
```python
# payment_service/main.py
from fastapi import FastAPI, Depends, HTTPException
import razorpay

app = FastAPI(title="Payment Service", version="1.0.0")

# Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@app.post("/create-order")
async def create_payment_order(data: PaymentOrderCreate):
    # Create Razorpay order
    pass

@app.post("/verify-payment")
async def verify_payment(data: PaymentVerification):
    # Verify payment signature
    pass

@app.post("/webhook")
async def payment_webhook(request: Request):
    # Handle Razorpay webhooks
    pass
```

### 2. Kubernetes Deployment

#### Kubernetes Manifests

##### User Service Deployment
```yaml
# k8s/user-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: codementee/user-service:latest
        ports:
        - containerPort: 8001
        env:
        - name: MONGO_URL
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - protocol: TCP
      port: 8001
      targetPort: 8001
  type: ClusterIP
```

##### API Gateway Configuration
```yaml
# k8s/api-gateway.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-gateway
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.codementee.io
    secretName: codementee-tls
  rules:
  - host: api.codementee.io
    http:
      paths:
      - path: /auth(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 8001
      - path: /booking(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: booking-service
            port:
              number: 8002
      - path: /payment(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: payment-service
            port:
              number: 8003
```

### 3. Auto-Scaling Configuration

#### Horizontal Pod Autoscaler
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: booking-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: booking-service
  minReplicas: 2
  maxReplicas: 8
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 4. Message Queue Implementation

#### Redis Pub/Sub for Service Communication
```python
# shared/message_queue.py
import redis
import json
import asyncio
from typing import Callable, Dict

class MessageQueue:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
        self.pubsub = self.redis.pubsub()
        self.handlers: Dict[str, Callable] = {}
    
    async def publish(self, channel: str, message: dict):
        """Publish message to channel"""
        self.redis.publish(channel, json.dumps(message))
    
    def subscribe(self, channel: str, handler: Callable):
        """Subscribe to channel with handler"""
        self.handlers[channel] = handler
        self.pubsub.subscribe(channel)
    
    async def listen(self):
        """Listen for messages"""
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                channel = message['channel'].decode('utf-8')
                data = json.loads(message['data'].decode('utf-8'))
                
                if channel in self.handlers:
                    await self.handlers[channel](data)

# Usage in services
mq = MessageQueue(REDIS_URL)

# In booking service
@mq.subscribe("user.updated")
async def handle_user_updated(data):
    user_id = data['user_id']
    # Update local user cache
    await update_user_cache(user_id, data['user_data'])

# In user service
async def update_user(user_id: str, data: UserUpdate):
    # Update user in database
    await db.users.update_one({"id": user_id}, {"$set": data.dict()})
    
    # Notify other services
    await mq.publish("user.updated", {
        "user_id": user_id,
        "user_data": data.dict()
    })
```

### 5. Advanced Monitoring & Observability

#### Prometheus + Grafana Setup
```yaml
# k8s/monitoring.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: prometheus-config
          mountPath: /etc/prometheus
        - name: prometheus-storage
          mountPath: /prometheus
      volumes:
      - name: prometheus-config
        configMap:
          name: prometheus-config
      - name: prometheus-storage
        persistentVolumeClaim:
          claimName: prometheus-pvc

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'user-service'
      static_configs:
      - targets: ['user-service:8001']
      metrics_path: /metrics
    - job_name: 'booking-service'
      static_configs:
      - targets: ['booking-service:8002']
      metrics_path: /metrics
    - job_name: 'payment-service'
      static_configs:
      - targets: ['payment-service:8003']
      metrics_path: /metrics
```

#### Distributed Tracing with Jaeger
```python
# shared/tracing.py
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

def setup_tracing(service_name: str, app):
    trace.set_tracer_provider(TracerProvider())
    tracer = trace.get_tracer(__name__)
    
    jaeger_exporter = JaegerExporter(
        agent_host_name="jaeger",
        agent_port=6831,
    )
    
    span_processor = BatchSpanProcessor(jaeger_exporter)
    trace.get_tracer_provider().add_span_processor(span_processor)
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app, tracer_provider=trace.get_tracer_provider())
    
    # Instrument HTTP client
    HTTPXClientInstrumentor().instrument()
    
    return tracer

# Usage in services
tracer = setup_tracing("user-service", app)

@app.post("/auth/login")
async def login(credentials: UserLogin):
    with tracer.start_as_current_span("user_login") as span:
        span.set_attribute("user.email", credentials.email)
        # Login logic
        pass
```

### Phase 3 Expected Results
- **Capacity**: 100,000 total users, 5,000-10,000 concurrent
- **Response Time**: <150ms for 95% of requests
- **Availability**: 99.99% uptime with microservices
- **Scalability**: Auto-scaling based on demand
- **Cost**: ~$1,200/month total infrastructure
- **Observability**: Full distributed tracing and monitoring

---

## 💰 Infrastructure Cost Analysis

### Phase 1: Vertical Scaling (0-10k users)
```
Server Upgrade:
├── VPS: 8GB RAM, 4 CPU cores → $80/month
├── MongoDB Atlas M20 → $75/month
├── CDN (CloudFlare Free) → $0/month
├── SSL Certificates (Let's Encrypt) → $0/month
└── Total: ~$155/month

Cost per user: $15.50 (at 10k users)
```

### Phase 2: Horizontal Scaling (10k-50k users)
```
Multi-Server Setup:
├── Load Balancer VPS: 4GB RAM → $40/month
├── App Servers: 2x 8GB VPS → $160/month
├── MongoDB Atlas M30 + Replicas → $200/month
├── Redis Cluster → $30/month
├── CDN (CloudFlare Pro) → $20/month
├── Monitoring Tools → $50/month
└── Total: ~$500/month

Cost per user: $10.00 (at 50k users)
```

### Phase 3: Microservices (50k-100k users)
```
Kubernetes Cluster:
├── Kubernetes Nodes: 5x 8GB → $400/month
├── MongoDB Atlas M60 + Sharding → $600/month
├── Redis Cluster (High Availability) → $100/month
├── CDN (CloudFlare Business) → $200/month
├── Monitoring & Logging → $150/month
├── Message Queue → $50/month
└── Total: ~$1,500/month

Cost per user: $15.00 (at 100k users)
```

### Cost Optimization Strategies
1. **Reserved Instances**: 30-50% savings on long-term commitments
2. **Spot Instances**: Use for non-critical workloads
3. **Auto-scaling**: Scale down during low traffic periods
4. **Data Archiving**: Move old data to cheaper storage
5. **CDN Optimization**: Reduce bandwidth costs by 60-70%

---

## 📊 Performance Monitoring

### Key Metrics to Track

#### Application Metrics
```python
# Metrics collection
from prometheus_client import Counter, Histogram, Gauge

# Request metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'Request latency')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active database connections')

# Business metrics
USER_REGISTRATIONS = Counter('user_registrations_total', 'Total user registrations', ['tier'])
BOOKING_REQUESTS = Counter('booking_requests_total', 'Total booking requests', ['status'])
PAYMENT_TRANSACTIONS = Counter('payment_transactions_total', 'Payment transactions', ['status'])

# System metrics
MEMORY_USAGE = Gauge('memory_usage_bytes', 'Memory usage in bytes')
CPU_USAGE = Gauge('cpu_usage_percent', 'CPU usage percentage')
```

#### Database Performance
```javascript
// MongoDB monitoring queries
db.runCommand({serverStatus: 1})  // Server statistics
db.runCommand({dbStats: 1})       // Database statistics
db.runCommand({collStats: "users"}) // Collection statistics

// Index usage analysis
db.users.aggregate([
  {$indexStats: {}}
])

// Slow query analysis
db.setProfilingLevel(2, {slowms: 100})  // Profile queries > 100ms
db.system.profile.find().sort({ts: -1}).limit(5)
```

#### Alert Thresholds
```yaml
# Grafana alerts configuration
alerts:
  - name: High Response Time
    condition: avg(http_request_duration_seconds) > 0.5
    for: 5m
    
  - name: High Error Rate
    condition: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 2m
    
  - name: Database Connection Pool Full
    condition: active_connections > 45
    for: 1m
    
  - name: Memory Usage High
    condition: memory_usage_percent > 85
    for: 5m
    
  - name: CPU Usage High
    condition: cpu_usage_percent > 80
    for: 10m
```

---

## 📅 Implementation Timeline

### Phase 1: Vertical Scaling (Months 1-6)
```
Month 1-2: Infrastructure Upgrade
├── Week 1-2: Server upgrade and migration
├── Week 3-4: Database optimization and indexing
├── Week 5-6: Redis caching implementation
├── Week 7-8: Performance testing and optimization

Month 3-4: Application Optimization
├── Week 9-10: Backend performance improvements
├── Week 11-12: Frontend optimization and code splitting
├── Week 13-14: Monitoring and alerting setup
├── Week 15-16: Load testing and capacity planning

Month 5-6: Stabilization
├── Week 17-18: Bug fixes and performance tuning
├── Week 19-20: Documentation and team training
├── Week 21-22: Backup and disaster recovery setup
├── Week 23-24: Phase 1 completion and Phase 2 planning
```

### Phase 2: Horizontal Scaling (Months 7-18)
```
Month 7-9: Load Balancing Setup
├── Multi-server deployment configuration
├── Nginx load balancer implementation
├── Database read replica setup
├── CDN integration and optimization

Month 10-12: Scaling Implementation
├── Container orchestration improvements
├── Session management and state handling
├── Advanced caching strategies
├── Performance monitoring enhancement

Month 13-18: Optimization & Growth
├── Capacity planning and auto-scaling
├── Cost optimization initiatives
├── Security hardening and compliance
├── Feature development and user growth
```

### Phase 3: Microservices (Months 19-36)
```
Month 19-24: Service Decomposition
├── Service boundary identification
├── API design and service contracts
├── Database separation and migration
├── Inter-service communication setup

Month 25-30: Kubernetes Migration
├── Kubernetes cluster setup
├── Service deployment and orchestration
├── Auto-scaling and load balancing
├── Monitoring and observability

Month 31-36: Advanced Features
├── Distributed tracing implementation
├── Advanced analytics and insights
├── Machine learning integration
├── International expansion preparation
```

---

## 🎯 Success Metrics & KPIs

### Technical KPIs
- **Response Time**: <150ms for 95% of requests
- **Uptime**: 99.99% availability
- **Throughput**: 10,000+ requests per minute
- **Error Rate**: <0.1% for all endpoints
- **Database Performance**: <50ms query response time

### Business KPIs
- **User Growth**: 100,000 total users
- **Concurrent Users**: 5,000-10,000 peak concurrent
- **Conversion Rate**: 15%+ free to paid conversion
- **Revenue**: $500,000+ monthly recurring revenue
- **Customer Satisfaction**: 4.5+ star rating

### Operational KPIs
- **Deployment Frequency**: Daily deployments
- **Mean Time to Recovery**: <30 minutes
- **Infrastructure Cost**: <$15 per user per month
- **Team Productivity**: 50+ features per quarter
- **Security**: Zero security incidents

This comprehensive scaling guide provides a clear roadmap for growing Codementee from its current state to supporting 100,000 users efficiently and cost-effectively. Each phase builds upon the previous one, ensuring smooth scaling without major architectural rewrites.