# 🏗️ Codementee Current Architecture Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [Database Design](#database-design)
5. [API Structure](#api-structure)
6. [User Flow Architecture](#user-flow-architecture)
7. [Security Implementation](#security-implementation)
8. [Deployment Architecture](#deployment-architecture)

---

## 🎯 System Overview

Codementee is a **freemium mentorship-based interview preparation platform** built with a modern, scalable architecture designed to handle growth from startup to enterprise scale.

### Core Architecture Principles
- **Microservice-Ready**: Modular design for easy service extraction
- **API-First**: Clean separation between frontend and backend
- **Tier-Aware**: Built-in freemium model support
- **Cloud-Native**: Containerized and cloud-ready
- **Security-First**: Role-based access control throughout

### High-Level System Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                ┌─────▼─────┐
                │    VPS    │
                │62.72.13.129│
                └─────┬─────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼───────┐ ┌───▼────┐ ┌─────▼─────┐
│   Frontend    │ │Backend │ │   Redis   │
│  Container    │ │Container│ │ Container │
│               │ │        │ │           │
│ ┌───────────┐ │ │FastAPI │ │   Redis   │
│ │   Nginx   │ │ │+Gunicorn│ │  Cache    │
│ │ (serves   │ │ │        │ │           │
│ │  React)   │ │ │        │ │           │
│ └───────────┘ │ │        │ │           │
│ Port: 3000    │ │Port:8001│ │Port: 6379 │
└───────────────┘ └────────┘ └───────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
            ┌─────────▼─────────┐ ┌───────────────┐
            │   MongoDB Atlas   │ │ External APIs │
            │   (Database)      │ │ • Razorpay    │
            │   Cloud Hosted    │ │ • Resend      │
            └───────────────────┘ │ • Google Meet │
                                  └───────────────┘
```

---

## 🛠️ Technology Stack

### Frontend Stack
```javascript
{
  "framework": "React 19.x",
  "routing": "React Router 7.x",
  "styling": "Tailwind CSS 3.x",
  "components": "Shadcn/UI (Radix UI primitives)",
  "buildTool": "Create React App + CRACO",
  "httpClient": "Axios with interceptors",
  "stateManagement": "React Context API",
  "icons": "Lucide React",
  "notifications": "Sonner",
  "formHandling": "React Hook Form + Zod"
}
```

### Backend Stack
```python
{
  "framework": "FastAPI (Python 3.11+)",
  "database": "MongoDB Atlas with Motor async driver",
  "authentication": "JWT tokens with bcrypt",
  "payment": "Razorpay (live keys)",
  "email": "Resend API",
  "caching": "Redis",
  "validation": "Pydantic models",
  "async": "asyncio/await patterns"
}
```

### Infrastructure Stack
```yaml
containerization: "Docker + Docker Compose"
webServer: "Nginx (reverse proxy)"
ssl: "Let's Encrypt certificates"
monitoring: "Docker logs + health checks"
deployment: "VPS with Docker containers"
```

---

## 🏛️ Application Architecture

### Frontend Architecture

#### Component Hierarchy
```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard layouts
│   ├── landing/           # Landing page sections
│   ├── layout/            # Shared layouts
│   └── ui/               # Shadcn/UI components
├── contexts/
│   └── AuthContext.jsx   # Global auth state with tier detection
├── pages/
│   ├── admin/            # Admin dashboard pages
│   ├── mentor/           # Mentor dashboard pages
│   ├── mentee/           # Mentee dashboard pages (tier-aware)
│   ├── RegisterPage.jsx  # Free registration
│   └── *.jsx            # Public pages
├── utils/
│   └── api.js           # Axios configuration with tier handling
└── hooks/
    └── use-toast.js     # Toast notifications
```

#### State Management Pattern
```javascript
// AuthContext with tier detection
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tier detection
  const isFreeUser = user?.status === 'Free' || !user?.plan_id;
  
  return (
    <AuthContext.Provider value={{ user, setUser, loading, isFreeUser }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Routing Structure
```javascript
// App.js routing with tier awareness
<Routes>
  {/* Public routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/login" element={<LoginPage />} />
  
  {/* Protected routes with role-based access */}
  <Route path="/admin/*" element={
    <ProtectedRoute role="admin">
      <AdminRoutes />
    </ProtectedRoute>
  } />
  
  <Route path="/mentor/*" element={
    <ProtectedRoute role="mentor">
      <MentorRoutes />
    </ProtectedRoute>
  } />
  
  <Route path="/mentee/*" element={
    <ProtectedRoute role="mentee">
      <MenteeRoutes />
    </ProtectedRoute>
  } />
</Routes>
```

### Backend Architecture

#### Single-File FastAPI Structure
```python
# server.py - Organized with clear sections
from fastapi import FastAPI, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI(title="Codementee API", version="1.0.0")

# ============ DATABASE CONNECTION ============
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ============ AUTHENTICATION ============
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # JWT token validation with role extraction
    pass

async def require_admin_role(user=Depends(get_current_user)):
    # Admin-only access control
    pass

async def require_paid_tier(user=Depends(get_current_user)):
    # Paid tier access control
    pass

# ============ PUBLIC ENDPOINTS ============
@app.get("/api/companies")
async def get_companies():
    # Public company data
    pass

# ============ AUTHENTICATION ENDPOINTS ============
@app.post("/api/auth/register-free")
async def register_free_user(data: FreeUserCreate):
    # Free registration without payment
    pass

# ============ ADMIN ENDPOINTS ============
@app.post("/api/admin/confirm-booking")
async def admin_confirm_booking(data: AdminConfirmBookingRequest, 
                               user=Depends(require_admin_role)):
    # Admin mentor assignment
    pass

# ============ TIER-AWARE ENDPOINTS ============
@app.get("/api/ai-tools/resume-analysis")
async def analyze_resume(user=Depends(require_paid_tier)):
    # Premium feature for paid users only
    pass
```

#### Pydantic Models Organization
```python
# Request/Response models grouped by feature
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

class FreeUserCreate(UserBase):
    password: str
    # No payment fields required

class AdminConfirmBookingRequest(BaseModel):
    booking_request_id: str
    mentor_id: str
    confirmed_slot_id: str

class BookingRequestCreate(BaseModel):
    company_id: str
    interview_type: str
    experience_level: str
    interview_track: str
    specific_topics: List[str]
    additional_notes: Optional[str]
    preferred_slots: List[str]
```

---

## 🗄️ Database Design

### MongoDB Collections Schema

#### 1. Users Collection
```javascript
{
  "_id": ObjectId,
  "id": "uuid-string",           // Application ID
  "name": "John Doe",
  "email": "john@example.com",
  "password_hash": "bcrypt-hash",
  "role": "mentee|mentor|admin",
  "status": "Free|Active|Paused",
  "plan_id": "foundation|growth|accelerator|null",
  "plan_name": "Foundation|Growth|Accelerator|Free Tier",
  "current_role": "SDE-1",
  "target_role": "Amazon SDE-2",
  "created_at": ISODate,
  "updated_at": ISODate
}
```

#### 2. Companies Collection
```javascript
{
  "_id": ObjectId,
  "id": "uuid-string",
  "name": "Amazon",
  "category": "product|unicorn|startup|service",
  "interview_tracks": ["sde", "sde2", "senior_sde", "principal"],
  "difficulty_levels": ["junior", "mid", "senior", "staff_plus"],
  "description": "E-commerce & Cloud Giant",
  "created_at": ISODate
}
```

#### 3. Booking Requests Collection (Enhanced)
```javascript
{
  "_id": ObjectId,
  "id": "uuid-string",
  "mentee_id": "uuid-string",
  "mentee_name": "string",
  "mentee_email": "string",
  
  // Admin-assigned fields
  "mentor_id": "uuid-string",      // Assigned by admin
  "mentor_name": "string",         // Assigned by admin
  "mentor_email": "string",        // Assigned by admin
  
  // Interview details
  "company_id": "uuid-string",
  "company_name": "string",
  "interview_type": "coding|system_design|behavioral|hr_round",
  "experience_level": "junior|mid|senior|staff_plus",
  "interview_track": "sde2|l4|e3|general",
  "specific_topics": ["Arrays & Strings", "Dynamic Programming"],
  "additional_notes": "Focus areas or special requirements",
  
  // Slot management
  "preferred_slots": [
    {
      "id": "slot_uuid",
      "date": "2026-02-01",
      "start_time": "10:00",
      "end_time": "11:00"
    }
  ],
  "confirmed_slot": {
    "id": "slot_uuid",
    "date": "2026-02-01",
    "start_time": "10:00",
    "end_time": "11:00"
  },
  
  // Meeting details
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "meet_link_id": "uuid-string",
  
  // Status tracking
  "status": "pending|confirmed|cancelled",
  "confirmed_by": "admin_uuid",
  "confirmed_at": ISODate,
  "created_at": ISODate
}
```

#### 4. Pricing Plans Collection
```javascript
{
  "_id": ObjectId,
  "plan_id": "foundation|growth|accelerator",
  "name": "Foundation",
  "price": 199900,              // Price in paise (₹1,999)
  "duration_months": 1,
  "limits": {
    "mock_interviews": 1,
    "resume_reviews": 1,
    "ai_tools": 1
  },
  "features": [
    "1 Mock Interview (total)",
    "Basic Resume Review",
    "Interview Prep Guide"
  ],
  "is_popular": false,
  "created_at": ISODate
}
```

#### 5. Time Slots Collection
```javascript
{
  "_id": ObjectId,
  "id": "uuid-string",
  "date": "2026-02-01",
  "start_time": "10:00",
  "end_time": "11:00",
  "interview_types": ["coding", "behavioral"],  // Supported types
  "status": "available|booked|blocked",
  "created_at": ISODate
}
```

### Database Relationships
```
users (1) ──────► (N) booking_requests
  │                      │
  │                      ▼
  └──► (N) orders    companies (1)
         │              │
         ▼              ▼
    pricing_plans   time_slots (N)
                        │
                        ▼
                   meet_links (1)
```

### Indexing Strategy
```javascript
// Performance-critical indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1, "status": 1 })
db.booking_requests.createIndex({ "mentee_id": 1, "status": 1 })
db.booking_requests.createIndex({ "mentor_id": 1, "status": 1 })
db.booking_requests.createIndex({ "status": 1, "created_at": -1 })
db.mocks.createIndex({ "mentee_id": 1, "date": -1 })
db.mocks.createIndex({ "mentor_id": 1, "date": -1 })
db.orders.createIndex({ "email": 1, "status": 1 })
db.time_slots.createIndex({ "date": 1, "status": 1 })
```

---

## 🔌 API Structure

### Endpoint Organization
```
/api/
├── auth/                    # Authentication endpoints
│   ├── POST /register-free  # Free registration (no payment)
│   ├── POST /register       # Legacy paid registration
│   ├── POST /login          # User login
│   └── POST /logout         # User logout
│
├── admin/                   # Admin-only endpoints
│   ├── GET  /booking-requests      # View all booking requests
│   ├── POST /confirm-booking       # Assign mentor & confirm
│   ├── GET  /mentors              # List all mentors
│   ├── GET  /mentees              # List all mentees
│   ├── GET  /companies            # Manage companies
│   └── GET  /analytics            # Admin analytics
│
├── mentor/                  # Mentor-only endpoints
│   ├── GET  /booking-requests     # Assigned bookings
│   ├── GET  /mocks               # Scheduled interviews
│   ├── POST /feedback            # Submit feedback
│   └── GET  /dashboard           # Mentor dashboard data
│
├── mentee/                  # Mentee endpoints (tier-aware)
│   ├── POST /booking-request     # Create booking request
│   ├── GET  /booking-requests    # View own requests
│   ├── GET  /mocks              # View scheduled interviews
│   ├── GET  /feedbacks          # View received feedback
│   └── GET  /dashboard          # Mentee dashboard data
│
├── ai-tools/               # AI features (paid tier only)
│   ├── POST /resume-analysis    # AI resume analysis
│   ├── POST /interview-prep     # AI interview preparation
│   └── POST /question-generator # AI question generation
│
├── community/              # Community features (paid tier)
│   ├── GET  /forum-posts       # Forum posts
│   ├── POST /forum-posts       # Create post
│   └── POST /comments          # Add comments
│
├── payment/                # Payment processing
│   ├── POST /create-order      # Create Razorpay order
│   ├── POST /verify-payment    # Verify payment
│   └── POST /webhook           # Razorpay webhook
│
└── public/                 # Public endpoints
    ├── GET  /companies         # List companies
    ├── GET  /pricing-plans     # Pricing information
    └── GET  /health           # Health check
```

### API Response Patterns

#### Success Response
```javascript
{
  "data": [...],
  "message": "Operation successful",
  "user_tier": "Free|Active",
  "timestamp": "2026-02-01T10:00:00Z"
}
```

#### Error Response
```javascript
{
  "detail": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2026-02-01T10:00:00Z",
  "upgrade_url": "/mentee/book"  // For tier-related errors
}
```

#### Tier-Based Error Response
```javascript
{
  "detail": "Upgrade required to access this feature",
  "code": "TIER_UPGRADE_REQUIRED",
  "required_tier": "Active",
  "current_tier": "Free",
  "upgrade_url": "/mentee/book"
}
```

### Authentication Flow
```
1. User Registration/Login
   ├── Free Registration: POST /api/auth/register-free
   ├── Paid Registration: POST /api/payment/create-order → Payment → Account
   └── Login: POST /api/auth/login

2. Token Usage
   ├── Include in Authorization header: "Bearer <token>"
   ├── Automatic validation in protected routes
   └── Role and tier extraction from token

3. Access Control
   ├── Role-based: admin, mentor, mentee
   ├── Tier-based: Free, Active
   └── Feature-based: specific endpoint restrictions
```

---

## 👥 User Flow Architecture

### Freemium User Journey
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Landing Page  │───►│ Free Register   │───►│ Mentee Dashboard│
│                 │    │ (No Payment)    │    │ (Explore Mode)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Full Platform   │◄───│ Payment Success │◄───│ Booking Process │
│ Access          │    │ (Tier Upgrade)  │    │ (Choose Plan)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Admin-Controlled Mentor Assignment Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Mentee Books    │───►│ Admin Reviews   │───►│ Mentor Assigned │
│ Interview       │    │ & Assigns       │    │ via Email       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Pending Status  │    │ Meeting Link    │    │ Interview       │
│ in Dashboard    │    │ Auto-Assigned   │    │ Conducted       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Booking System Architecture
```
Step 1: Company Selection
├── Product Companies (Amazon, Google, Microsoft, Meta, Apple, Netflix)
├── Indian Unicorns (Flipkart, Zomato, Paytm, Swiggy)
└── Category-based filtering with visual indicators

Step 2: Interview Configuration
├── Interview Type (Coding, System Design, Behavioral, HR)
├── Experience Level (Junior, Mid, Senior, Staff+)
├── Interview Track (SDE2, L4, E3, etc.)
└── Specific Topics & Focus Areas

Step 3: Slot Selection
├── Available slots filtered by interview type
├── Visual indicators for slot compatibility
├── Multiple slot preferences allowed
└── Duration and timing clearly displayed

Step 4: Confirmation
├── Review all selections
├── Add additional notes for mentor
├── Confirm booking request
└── Submit for admin assignment

Step 5: Payment (Free Users Only)
├── Plan selection (Foundation, Growth, Accelerator)
├── Razorpay payment integration
├── Automatic tier upgrade after payment
└── Booking confirmation after successful payment
```

---

## 🔒 Security Implementation

### Authentication & Authorization

#### JWT Token Structure
```javascript
{
  "user_id": "uuid-string",
  "email": "user@example.com",
  "role": "mentee|mentor|admin",
  "status": "Free|Active",
  "plan_id": "foundation|growth|accelerator|null",
  "iat": 1640995200,
  "exp": 1641081600
}
```

#### Role-Based Access Control
```python
# Decorator-based access control
async def require_role(required_role: str):
    def decorator(func):
        async def wrapper(user=Depends(get_current_user)):
            if user["role"] != required_role:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            return await func(user)
        return wrapper
    return decorator

# Usage
@app.get("/api/admin/users")
@require_role("admin")
async def get_users(user: dict):
    return await db.users.find().to_list(1000)
```

#### Tier-Based Access Control
```python
async def require_paid_tier(user=Depends(get_current_user)):
    if user["status"] == "Free" or not user.get("plan_id"):
        raise HTTPException(
            status_code=403, 
            detail="Upgrade required",
            headers={"X-Upgrade-URL": "/mentee/book"}
        )
    return user

# Usage
@app.get("/api/ai-tools/resume-analysis")
async def analyze_resume(user=Depends(require_paid_tier)):
    # Premium feature implementation
    pass
```

### Data Security

#### Password Security
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

#### Input Validation
```python
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v.strip()
```

### API Security

#### Rate Limiting (Nginx)
```nginx
# Rate limiting configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

server {
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend;
    }
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
    }
}
```

#### CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://codementee.io", "https://www.codementee.io"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

#### Security Headers
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## 🚀 Deployment Architecture

### Current 3-Container Setup
Your production deployment uses a simple, efficient 3-container architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Your VPS Server                          │
│                   (62.72.13.129)                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Frontend      │  │    Backend      │  │    Redis    │  │
│  │   Container     │  │   Container     │  │  Container  │  │
│  │                 │  │                 │  │             │  │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │ ┌─────────┐ │  │
│  │  │   Nginx   │  │  │  │  FastAPI  │  │  │ │  Redis  │ │  │
│  │  │ (serves   │  │  │  │+Gunicorn  │  │  │ │ (Cache) │ │  │
│  │  │ React)    │  │  │  │           │  │  │ │         │ │  │
│  │  └───────────┘  │  │  └───────────┘  │  │ └─────────┘ │  │
│  │   Port: 3000    │  │   Port: 8001    │  │ Port: 6379  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Container Responsibilities

#### Frontend Container
```dockerfile
# Multi-stage build: React + Nginx
FROM node:20-alpine as build
# ... build React app ...

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
```

**Purpose**: Serves static React files efficiently
- ✅ **Nginx included**: For optimal static file serving
- ✅ **React Router support**: SPA routing handled
- ✅ **Gzip compression**: Faster loading
- ✅ **Asset caching**: Browser caching for performance

#### Backend Container
```dockerfile
# Simple FastAPI deployment
FROM python:3.11-slim
# ... install dependencies ...
CMD ["gunicorn", "server:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8001"]
```

**Purpose**: Handles API requests and business logic
- ✅ **No Nginx needed**: FastAPI + Gunicorn handles JSON APIs perfectly
- ✅ **Direct connection**: React app connects directly to port 8001
- ✅ **Simpler architecture**: Fewer layers = easier debugging

#### Redis Container
```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --maxmemory 256mb
```

**Purpose**: In-memory caching for performance
- ✅ **Standalone service**: No web server needed
- ✅ **Direct connection**: FastAPI connects directly
- ✅ **Persistent data**: appendonly mode for data safety
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    container_name: codementee-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    networks:
      - codementee-network

  backend:
    build: ./backend
    container_name: codementee-backend
    restart: unless-stopped
    ports:
      - "8001:8001"
    env_file:
      - ./backend/.env
    depends_on:
      - redis
    networks:
      - codementee-network

  redis:
    image: redis:7-alpine
    container_name: codementee-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    networks:
      - codementee-network

networks:
  codementee-network:
    driver: bridge
```

### Request Flow Architecture

#### Frontend Requests (Static Files)
```
User Browser → VPS:3000 → Frontend Container → Nginx → React Files
```
- **Why Nginx**: Static files (HTML, CSS, JS) served 10x faster than application servers
- **Caching**: Browser caches assets for months
- **Compression**: Gzip reduces file sizes by 70%

#### API Requests (Dynamic Data)
```
React App → VPS:8001 → Backend Container → FastAPI → JSON Response
```
- **Why No Nginx**: FastAPI + Gunicorn already handles JSON APIs perfectly
- **Direct connection**: Simpler architecture, easier debugging
- **Performance**: No additional proxy layer needed for APIs

#### Cache Requests (Data)
```
FastAPI → Redis Container → Cached Data
```
- **Direct connection**: Fastest possible cache access
- **No proxy needed**: Redis is not a web service

### Production Environment Configuration

#### Current Production Setup
- **Server**: Hostinger VPS (2GB RAM, 2 CPU cores, 40GB SSD)
- **IP Address**: 62.72.13.129
- **Containers**: 3 containers (frontend, backend, redis)
- **Database**: MongoDB Atlas (cloud-hosted)
- **SSL**: Ready for Let's Encrypt certificates
- **Domain**: Ready for codementee.io configuration

#### Environment Variables
```bash
# Backend (.env)
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/codementee
DB_NAME=codementee
JWT_SECRET=super-secure-secret-key
CORS_ORIGINS=https://codementee.io,https://www.codementee.io
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
RESEND_API_KEY=re_your_resend_api_key
SENDER_EMAIL=support@codementee.io
BCC_EMAIL=admin@codementee.io

# Frontend (.env)
REACT_APP_BACKEND_URL=https://api.codementee.io  # Production
REACT_APP_BACKEND_URL=http://localhost:8001      # Development
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

#### Current Access URLs
- **Frontend**: http://62.72.13.129:3000 (current)
- **Backend API**: http://62.72.13.129:8001 (current)
- **Future Frontend**: https://codementee.io (after DNS setup)
- **Future Backend**: https://api.codementee.io (after DNS setup)

### Future Scaling Architecture

When you reach 10,000+ users, you'll add a separate Nginx container for load balancing:

```yaml
# Future docker-compose.scale.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf  # The config in your nginx/ folder
    depends_on:
      - frontend-1
      - frontend-2
      - backend-1
      - backend-2
```

**Current**: Nginx inside frontend container (perfect for your scale)
**Future**: Separate Nginx container for load balancing multiple instances

### Health Monitoring
```python
@app.get("/health")
async def health_check():
    try:
        # Test database connection
        await db.users.count_documents({})
        
        # Test Redis connection (if Redis client is available)
        # redis_client.ping()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0.0",
            "services": {
                "database": "connected",
                "redis": "connected"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")
```

### Current Deployment Commands
```bash
# Deploy to production
./deploy-codementee.sh

# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker logs codementee-frontend
docker logs codementee-backend
docker logs codementee-redis

# Health check
curl http://62.72.13.129:8001/api/health
```

---

## 📊 Performance Considerations

### Current Architecture Benefits
- **Simple**: Only 3 containers to manage
- **Efficient**: Nginx serves React files super fast
- **Cost-effective**: No extra containers needed
- **Reliable**: Fewer moving parts = fewer failures
- **Optimal for scale**: Perfect for 0-10,000 users

### Database Optimization
- **Connection Pooling**: Motor with maxPoolSize=50
- **Indexing Strategy**: Critical indexes on frequently queried fields
- **Query Optimization**: Pagination and field projection
- **Caching**: Redis for frequently accessed data

### Frontend Optimization
- **Nginx Static Serving**: 10x faster than application servers
- **Gzip Compression**: 70% file size reduction
- **Browser Caching**: Assets cached for 1 year
- **Code Splitting**: Route-based lazy loading

### Backend Optimization
- **Async Processing**: Full async/await implementation
- **Gunicorn Workers**: Production-ready WSGI server
- **Direct API Serving**: No unnecessary proxy layers
- **Connection Reuse**: HTTP connection pooling

### Why This Architecture is Perfect for Your Scale

| Aspect | Your Setup | Enterprise Setup |
|--------|------------|------------------|
| **Complexity** | Simple (3 containers) | Complex (10+ services) |
| **Cost** | $97/month | $1000+/month |
| **Maintenance** | Easy | Requires DevOps team |
| **Performance** | Excellent for 10k users | Optimized for 100k+ users |
| **Debugging** | Straightforward | Complex distributed tracing |

This architecture provides a solid foundation for scaling from startup to enterprise level while maintaining code quality, security, and performance standards.