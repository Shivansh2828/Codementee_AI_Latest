# 🧩 Codementee Component Usage Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Frontend Components](#frontend-components)
3. [Backend Components](#backend-components)
4. [Database Components](#database-components)
5. [Infrastructure Components](#infrastructure-components)
6. [External Services](#external-services)
7. [Development Tools](#development-tools)
8. [Component Interaction Flow](#component-interaction-flow)

---

## 🎯 System Overview

Your Codementee platform uses a **modern, scalable architecture** with each component serving a specific purpose. Here's how they all work together:

```
User Browser ──► Nginx ──► React App ──► FastAPI ──► MongoDB Atlas
                  │                        │
                  └── SSL/HTTPS            └── Redis Cache
                  └── Load Balancing       └── External APIs
```

---

## 🎨 Frontend Components

### 1. **React 19.x** - Main Frontend Framework
**What it does**: Creates the user interface that users interact with

**Why we use it**:
- **Component-based**: Reusable UI components (buttons, forms, dashboards)
- **Virtual DOM**: Fast rendering and updates
- **Large ecosystem**: Tons of libraries and community support
- **Modern**: Latest features like concurrent rendering

**In your project**:
```javascript
// Example: User dashboard component
function MenteeDashboard() {
  const [bookings, setBookings] = useState([]);
  
  return (
    <div className="dashboard">
      <h1>Welcome to your dashboard</h1>
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

**Real-world analogy**: React is like the **interior design** of a house - it makes everything look good and function smoothly for the people living there.

### 2. **React Router 7.x** - Navigation System
**What it does**: Handles navigation between different pages without page reloads

**Why we use it**:
- **Single Page Application (SPA)**: Fast navigation
- **Role-based routing**: Different routes for admin, mentor, mentee
- **Protected routes**: Ensures only logged-in users access certain pages

**In your project**:
```javascript
// Different routes for different user roles
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/admin/*" element={<AdminRoutes />} />
  <Route path="/mentee/*" element={<MenteeRoutes />} />
</Routes>
```

**Real-world analogy**: Like a **GPS system** in your car - it knows where you are and how to get you where you want to go.

### 3. **Tailwind CSS** - Styling Framework
**What it does**: Provides utility classes for styling components

**Why we use it**:
- **Utility-first**: Style directly in HTML/JSX
- **Consistent design**: Pre-defined spacing, colors, fonts
- **Responsive**: Easy mobile-first design
- **Small bundle size**: Only includes used styles

**In your project**:
```javascript
// Tailwind classes for styling
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Book Interview
</button>
```

**Real-world analogy**: Like having a **professional stylist's wardrobe** - everything matches and looks professional without thinking about it.

### 4. **Shadcn/UI** - Component Library
**What it does**: Provides pre-built, accessible UI components

**Why we use it**:
- **Accessibility**: Components work with screen readers
- **Consistent design**: Professional look across the app
- **Customizable**: Can modify to match your brand
- **Modern**: Uses latest React patterns

**In your project**:
```javascript
// Pre-built components that look professional
import { Button, Card, Dialog } from '@/components/ui'

<Card>
  <CardHeader>
    <CardTitle>Interview Booking</CardTitle>
  </CardHeader>
  <CardContent>
    <Button onClick={bookInterview}>Book Now</Button>
  </CardContent>
</Card>
```

**Real-world analogy**: Like buying **furniture from IKEA** - everything looks good together and is ready to use.

### 5. **Axios** - HTTP Client
**What it does**: Makes API calls to your backend

**Why we use it**:
- **Promise-based**: Easy async/await syntax
- **Interceptors**: Automatically add authentication tokens
- **Error handling**: Centralized error management
- **Request/Response transformation**: Format data automatically

**In your project**:
```javascript
// Automatic token injection for authenticated requests
const api = axios.create({
  baseURL: 'https://api.codementee.io',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
const bookings = await api.get('/mentee/booking-requests');
```

**Real-world analogy**: Like a **personal assistant** who handles all your phone calls and knows exactly what to say.

---

## ⚙️ Backend Components

### 1. **FastAPI** - Backend Framework
**What it does**: Handles all server-side logic, API endpoints, and business rules

**Why we use it**:
- **Fast**: One of the fastest Python frameworks
- **Automatic documentation**: Creates API docs automatically
- **Type hints**: Catches errors before they happen
- **Async support**: Handles many requests simultaneously
- **Easy to learn**: Simple, clean syntax

**In your project**:
```python
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI(title="Codementee API")

@app.post("/api/mentee/booking-request")
async def create_booking(data: BookingRequestCreate, user=Depends(get_current_user)):
    # Validate user can make booking
    if user["status"] == "Free":
        raise HTTPException(status_code=403, detail="Upgrade required")
    
    # Create booking in database
    booking = await db.booking_requests.insert_one(data.dict())
    return {"message": "Booking created", "id": booking.inserted_id}
```

**Real-world analogy**: Like the **kitchen in a restaurant** - it receives orders, processes them, and sends back the finished product.

### 2. **Pydantic** - Data Validation
**What it does**: Validates and serializes data coming in and going out of your API

**Why we use it**:
- **Type safety**: Ensures data is the correct type
- **Automatic validation**: Rejects invalid data
- **Documentation**: Generates API documentation
- **Error messages**: Clear error messages for invalid data

**In your project**:
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
```

**Real-world analogy**: Like a **security guard** at a building - checks everyone coming in to make sure they belong there.

### 3. **Motor** - MongoDB Async Driver
**What it does**: Connects your FastAPI app to MongoDB database asynchronously

**Why we use it**:
- **Async/await**: Doesn't block other requests while waiting for database
- **Connection pooling**: Efficiently manages database connections
- **MongoDB integration**: Native MongoDB operations
- **Performance**: Handles many database operations simultaneously

**In your project**:
```python
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Async database operations
async def get_user_bookings(user_id: str):
    bookings = await db.booking_requests.find({"mentee_id": user_id}).to_list(100)
    return bookings
```

**Real-world analogy**: Like a **high-speed elevator** - can handle multiple people going to different floors without everyone waiting in line.

### 4. **JWT (JSON Web Tokens)** - Authentication
**What it does**: Securely identifies users without storing sessions on the server

**Why we use it**:
- **Stateless**: Server doesn't need to remember who's logged in
- **Secure**: Cryptographically signed tokens
- **Scalable**: Works across multiple servers
- **Standard**: Industry-standard authentication method

**In your project**:
```python
import jwt
from datetime import datetime, timedelta

def create_access_token(user_data: dict):
    expire = datetime.utcnow() + timedelta(hours=24)
    token_data = {
        "user_id": user_data["id"],
        "email": user_data["email"],
        "role": user_data["role"],
        "exp": expire
    }
    return jwt.encode(token_data, JWT_SECRET, algorithm="HS256")
```

**Real-world analogy**: Like a **VIP wristband** at a concert - proves you paid for entry and shows what areas you can access.

---

## 🗄️ Database Components

### 1. **MongoDB Atlas** - Cloud Database
**What it does**: Stores all your application data in the cloud

**Why we use it**:
- **Cloud-hosted**: No server maintenance required
- **Scalable**: Automatically handles growth
- **Flexible schema**: Easy to add new fields
- **Backup**: Automatic backups and point-in-time recovery
- **Global**: Fast access from anywhere in the world

**In your project**:
```javascript
// Document structure (like a JSON object)
{
  "_id": ObjectId("..."),
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "mentee",
  "status": "Active",
  "plan_id": "growth",
  "created_at": ISODate("2026-02-01T10:00:00Z")
}
```

**Real-world analogy**: Like a **bank vault in the cloud** - your data is safe, accessible 24/7, and automatically backed up.

### 2. **Collections** - Data Organization
**What they do**: Organize different types of data (like tables in SQL)

**Your collections**:
- **users**: All user accounts (admin, mentor, mentee)
- **booking_requests**: Interview booking requests
- **mocks**: Confirmed interviews
- **companies**: Available companies for interviews
- **pricing_plans**: Subscription plans
- **orders**: Payment transactions
- **feedbacks**: Interview feedback
- **time_slots**: Available interview times
- **meet_links**: Google Meet links pool

**Real-world analogy**: Like **filing cabinets** in an office - each cabinet (collection) holds related documents (data).

---

## 🏗️ Infrastructure Components

### 1. **Nginx** - Web Server & Reverse Proxy
**What it does**: Acts as the front door to your application

**Why we use it**:
- **Reverse proxy**: Routes requests to the right service
- **Load balancing**: Distributes traffic across multiple servers
- **SSL termination**: Handles HTTPS certificates
- **Static file serving**: Serves images, CSS, JS files efficiently
- **Rate limiting**: Prevents abuse and DDoS attacks

**In your project**:
```nginx
# Routes different URLs to different services
server {
    listen 443 ssl;
    server_name codementee.io;
    
    # Frontend (React app)
    location / {
        proxy_pass http://frontend:80;
    }
}

server {
    listen 443 ssl;
    server_name api.codementee.io;
    
    # Backend (FastAPI)
    location / {
        proxy_pass http://backend:8001;
        # Rate limiting: max 100 requests per minute
        limit_req zone=api burst=20 nodelay;
    }
}
```

**Real-world analogy**: Like a **hotel concierge** - greets everyone, directs them to the right place, and handles security.

### 2. **Redis** - In-Memory Cache
**What it does**: Stores frequently accessed data in memory for super-fast retrieval

**Why we use it**:
- **Speed**: 1000x faster than database for cached data
- **Reduces database load**: Fewer queries to MongoDB
- **Session storage**: Stores user sessions across multiple servers
- **Pub/Sub**: Can send messages between services
- **Persistence**: Can save data to disk

**In your project**:
```python
import redis

redis_client = redis.Redis(host='redis', port=6379, db=0)

# Cache frequently accessed data
async def get_companies():
    # Try cache first
    cached_companies = redis_client.get("companies")
    if cached_companies:
        return json.loads(cached_companies)
    
    # If not in cache, get from database
    companies = await db.companies.find().to_list(1000)
    
    # Store in cache for 10 minutes
    redis_client.setex("companies", 600, json.dumps(companies))
    return companies
```

**Real-world analogy**: Like keeping **frequently used items on your desk** instead of in a filing cabinet - much faster to access.

### 3. **Docker** - Containerization
**What it does**: Packages your application with all its dependencies

**Why we use it**:
- **Consistency**: Runs the same everywhere (dev, staging, production)
- **Isolation**: Each service runs in its own container
- **Easy deployment**: One command to deploy everything
- **Scalability**: Easy to run multiple copies
- **Version control**: Can roll back to previous versions

**In your project**:
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    container_name: codementee-frontend
    ports:
      - "3000:80"
  
  backend:
    build: ./backend
    container_name: codementee-backend
    ports:
      - "8001:8001"
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    container_name: codementee-redis
    ports:
      - "6379:6379"
```

**Real-world analogy**: Like **shipping containers** - everything needed is packed inside, and they work the same way whether on a truck, ship, or train.

### 4. **Let's Encrypt** - SSL Certificates
**What it does**: Provides free HTTPS certificates for secure connections

**Why we use it**:
- **Free**: No cost for SSL certificates
- **Automatic renewal**: Certificates renew themselves
- **Trusted**: Recognized by all browsers
- **Security**: Encrypts data between user and server

**In your project**:
```bash
# Automatic certificate generation
certbot --nginx -d codementee.io -d www.codementee.io -d api.codementee.io
```

**Real-world analogy**: Like a **security seal** on a package - proves it hasn't been tampered with during delivery.

---

## 🌐 External Services

### 1. **Razorpay** - Payment Processing
**What it does**: Handles all payment transactions securely

**Why we use it**:
- **PCI compliant**: Meets security standards for handling payments
- **Multiple payment methods**: Cards, UPI, wallets, net banking
- **Indian market**: Optimized for Indian users
- **Webhooks**: Notifies your app when payments complete
- **Dashboard**: Track all transactions

**In your project**:
```python
import razorpay

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Create payment order
order = client.order.create({
    'amount': 499900,  # ₹4,999 in paise
    'currency': 'INR',
    'receipt': f'order_{user_id}_{timestamp}'
})

# Verify payment
client.utility.verify_payment_signature({
    'razorpay_order_id': order_id,
    'razorpay_payment_id': payment_id,
    'razorpay_signature': signature
})
```

**Real-world analogy**: Like a **bank teller** - handles money transactions safely and gives you a receipt.

### 2. **Resend** - Email Service
**What it does**: Sends transactional emails (confirmations, notifications)

**Why we use it**:
- **Reliable delivery**: High email delivery rates
- **Developer-friendly**: Simple API
- **Templates**: HTML email templates
- **Analytics**: Track email opens and clicks
- **Compliance**: Handles email regulations

**In your project**:
```python
import resend

resend.api_key = RESEND_API_KEY

# Send booking confirmation email
resend.Emails.send({
    "from": "support@codementee.io",
    "to": user_email,
    "subject": "Interview Confirmed - Amazon SDE2",
    "html": f"""
    <h1>Your interview is confirmed!</h1>
    <p>Company: Amazon</p>
    <p>Mentor: {mentor_name}</p>
    <p>Meeting Link: {meeting_link}</p>
    """
})
```

**Real-world analogy**: Like a **postal service** - reliably delivers your messages to the right people.

### 3. **Google Meet** - Video Conferencing
**What it does**: Provides video meeting links for interviews

**Why we use it**:
- **Reliable**: Google's infrastructure
- **No account required**: Mentees can join without Google account
- **Recording**: Can record sessions (with permission)
- **Screen sharing**: For coding interviews
- **Mobile support**: Works on phones and tablets

**In your project**:
```python
# Pool of pre-created Google Meet links
meet_links = [
    "https://meet.google.com/abc-defg-hij",
    "https://meet.google.com/klm-nopq-rst",
    "https://meet.google.com/uvw-xyza-bcd"
]

# Auto-assign available link to booking
async def assign_meet_link(booking_id: str):
    available_link = await db.meet_links.find_one({"status": "available"})
    if available_link:
        await db.meet_links.update_one(
            {"id": available_link["id"]},
            {"$set": {"status": "in_use", "booking_id": booking_id}}
        )
        return available_link["link"]
```

**Real-world analogy**: Like **conference rooms** in an office - you book one when you need to meet.

---

## 🛠️ Development Tools

### 1. **Create React App (CRA)** - Frontend Build Tool
**What it does**: Sets up React development environment with build tools

**Why we use it**:
- **Zero configuration**: Works out of the box
- **Hot reloading**: See changes instantly during development
- **Production builds**: Optimized builds for deployment
- **Testing**: Built-in testing framework

### 2. **CRACO** - CRA Configuration Override
**What it does**: Allows customization of Create React App without ejecting

**Why we use it**:
- **Tailwind integration**: Adds Tailwind CSS support
- **Custom webpack config**: Modify build process
- **Plugin support**: Add additional build plugins

### 3. **Yarn** - Package Manager
**What it does**: Manages JavaScript dependencies

**Why we use it**:
- **Fast**: Parallel downloads and caching
- **Reliable**: Lock file ensures consistent installs
- **Workspace support**: Manages multiple packages

### 4. **pip** - Python Package Manager
**What it does**: Manages Python dependencies

**Why we use it**:
- **Standard**: Default Python package manager
- **Virtual environments**: Isolates project dependencies
- **Requirements.txt**: Lists all dependencies

---

## 🔄 Component Interaction Flow

### 1. **User Registration Flow**
```
User fills form → React validates → Axios sends to FastAPI → 
Pydantic validates → Motor saves to MongoDB → JWT token created → 
Redis caches session → Response sent back → User logged in
```

### 2. **Booking Interview Flow**
```
User selects company → React Router navigates → Axios fetches companies from cache → 
Redis returns cached data → User fills booking form → FastAPI validates → 
MongoDB stores booking → Admin gets notification → Mentor assigned → 
Resend sends emails → Google Meet link assigned
```

### 3. **Payment Flow**
```
User chooses plan → Razorpay order created → User pays → 
Razorpay webhook notifies FastAPI → User tier updated in MongoDB → 
Redis cache cleared → Confirmation email sent via Resend
```

### 4. **Production Request Flow**
```
User browser → Nginx (SSL termination) → 
├── Static files served directly by Nginx
└── API requests → FastAPI container → 
    ├── Check Redis cache first
    └── If not cached → MongoDB Atlas → Cache result in Redis
```

## 🎯 Why This Architecture Works

### **For Small Scale (Current)**
- **Simple**: Easy to understand and maintain
- **Cost-effective**: Minimal infrastructure costs
- **Fast development**: Quick to add new features
- **Reliable**: Proven technologies

### **For Large Scale (Future)**
- **Scalable**: Each component can be scaled independently
- **Maintainable**: Clear separation of concerns
- **Performant**: Caching and async processing
- **Resilient**: Multiple layers of redundancy

## 🚀 Key Benefits

1. **Developer Experience**: Modern tools make development enjoyable
2. **User Experience**: Fast, responsive application
3. **Maintainability**: Clean architecture is easy to modify
4. **Scalability**: Can grow from 100 to 100,000 users
5. **Security**: Multiple layers of security
6. **Cost Efficiency**: Pay only for what you use

This architecture gives you the best of both worlds - simple enough to understand and maintain, yet powerful enough to scale to enterprise levels!