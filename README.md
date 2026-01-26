# Codementee - Interview Preparation Platform

A full-stack mentorship-based interview preparation platform that connects mentees with experienced mentors from top product-based companies for mock interviews.

![Codementee](https://customer-assets.emergentagent.com/job_interview-mentor-8/artifacts/w3mrzkd9_codementee_logo.png)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Deployment Strategy](#deployment-strategy)
- [User Workflows](#user-workflows)
- [Third-Party Integrations](#third-party-integrations)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Codementee** is a platform where aspiring software engineers can practice mock interviews with mentors who have successfully cracked interviews at top product-based companies like Amazon, Google, Microsoft, and more.

### Value Proposition
> "Real mock interviews with engineers who've cracked product-based companies."

### Key Roles
| Role | Description |
|------|-------------|
| **Admin** | Manages the platform, users, bookings, and revenue |
| **Mentor** | Conducts mock interviews and provides feedback |
| **Mentee** | Books mock interviews and receives feedback |

---

## Features

### For Mentees
- Self-service mock interview booking (3-step wizard)
- Company-specific interview preparation (Amazon, Google, etc.)
- View upcoming interviews with meeting links
- Access detailed feedback reports after interviews
- Subscription-based plans (Monthly, Quarterly, Biannual)

### For Mentors
- View assigned mentees
- Receive booking requests with preferred time slots
- Confirm bookings with auto-assigned Google Meet links
- Submit structured feedback after interviews
- Email notifications for new booking requests

### For Admins
- Dashboard with revenue analytics and statistics
- Manage companies for mock interviews
- Create and manage available time slots
- Manage Google Meet link pool for auto-assignment
- View all booking requests and their status
- Manage mentees and mentors
- Track payments and orders
- Assign mentors to mentees

### Platform Features
- JWT-based authentication
- Role-based access control
- Razorpay payment integration (Live)
- Automated email notifications (Resend)
- Responsive design for all devices

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| React Router | 6.x | Client-side routing |
| Tailwind CSS | 3.x | Utility-first styling |
| Shadcn/UI | Latest | Pre-built UI components |
| Axios | 1.x | HTTP client |
| Lucide React | Latest | Icons |
| Sonner | Latest | Toast notifications |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.100+ | Web framework |
| Motor | 3.x | Async MongoDB driver |
| PyJWT | 2.x | JWT authentication |
| Passlib | 1.7+ | Password hashing (bcrypt) |
| Razorpay | 1.x | Payment processing |
| Resend | 2.x | Email service |

### Database
| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Cloud database (Production) |
| MongoDB | Local database (Development) |

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| Supervisor | Process management |
| Kubernetes | Container orchestration (Production) |
| Docker | Containerization |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Tailwind)                     │
│                         Port: 3000                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Landing   │  │    Auth     │  │  Dashboard  │                │
│  │    Page     │  │   Pages     │  │    Pages    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS /api/*
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                              │
│                         Port: 8001                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │    Auth     │  │   Booking   │  │   Payment   │                │
│  │   Routes    │  │   Routes    │  │   Routes    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │  MongoDB  │   │  Razorpay │   │   Resend  │
            │   Atlas   │   │    API    │   │   Email   │
            └───────────┘   └───────────┘   └───────────┘
```

---

## Database Schema

### Collections

#### 1. `users`
Stores all user accounts (admins, mentors, mentees).

```javascript
{
  "id": "uuid-string",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "bcrypt-hashed-password",
  "role": "mentee", // "admin" | "mentor" | "mentee"
  "status": "active", // "active" | "inactive" | "paused"
  "mentor_id": "mentor-uuid", // Assigned mentor (for mentees)
  "plan_id": "quarterly", // Subscription plan (for mentees)
  "plan_name": "3 Months Plan",
  "current_role": "SDE 1", // Current job role
  "target_role": "Amazon SDE 2", // Target role
  "created_at": "2026-01-26T08:00:00.000Z"
}
```

#### 2. `orders`
Payment transactions from Razorpay.

```javascript
{
  "id": "uuid-string",
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature-string",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9999999999",
  "plan_id": "quarterly",
  "plan_name": "3 Months Plan",
  "amount": 499900, // In paise (₹4,999)
  "currency": "INR",
  "status": "paid", // "pending" | "paid" | "failed"
  "user_id": "user-uuid",
  "created_at": "2026-01-26T08:00:00.000Z",
  "paid_at": "2026-01-26T08:05:00.000Z"
}
```

#### 3. `companies`
Companies available for mock interview preparation.

```javascript
{
  "id": "uuid-string",
  "name": "Amazon",
  "logo_url": "https://example.com/amazon-logo.png",
  "description": "E-commerce & Cloud Giant",
  "created_at": "2026-01-26T08:00:00.000Z"
}
```

#### 4. `time_slots`
Available time slots for booking (created by admin).

```javascript
{
  "id": "uuid-string",
  "date": "2026-02-01", // YYYY-MM-DD
  "start_time": "10:00", // HH:MM (24-hour)
  "end_time": "11:00",
  "mentor_id": "mentor-uuid", // Optional: specific mentor
  "status": "available", // "available" | "booked"
  "created_at": "2026-01-26T08:00:00.000Z"
}
```

#### 5. `meet_links`
Google Meet link pool for auto-assignment.

```javascript
{
  "id": "uuid-string",
  "link": "https://meet.google.com/xxx-xxxx-xxx",
  "name": "Room 1", // Label for identification
  "status": "available", // "available" | "in_use"
  "current_booking_id": null, // Booking using this link
  "created_at": "2026-01-26T08:00:00.000Z"
}
```

#### 6. `booking_requests`
Mock interview booking requests from mentees.

```javascript
{
  "id": "uuid-string",
  "mentee_id": "mentee-uuid",
  "mentee_name": "John Doe",
  "mentee_email": "john@example.com",
  "mentor_id": "mentor-uuid",
  "mentor_name": "Jane Smith",
  "mentor_email": "jane@example.com",
  "company_id": "company-uuid",
  "company_name": "Amazon",
  "preferred_slots": [
    {
      "id": "slot-uuid-1",
      "date": "2026-02-01",
      "start_time": "10:00",
      "end_time": "11:00"
    },
    {
      "id": "slot-uuid-2",
      "date": "2026-02-02",
      "start_time": "14:00",
      "end_time": "15:00"
    }
  ],
  "status": "pending", // "pending" | "confirmed" | "cancelled"
  "confirmed_slot": { /* slot object */ },
  "meeting_link": "https://meet.google.com/xxx",
  "meet_link_id": "meet-link-uuid",
  "created_at": "2026-01-26T08:00:00.000Z",
  "confirmed_at": "2026-01-26T10:00:00.000Z"
}
```

#### 7. `mocks`
Confirmed mock interview sessions.

```javascript
{
  "id": "uuid-string",
  "mentee_id": "mentee-uuid",
  "mentor_id": "mentor-uuid",
  "company_name": "Amazon",
  "scheduled_at": "2026-02-01T10:00:00",
  "meet_link": "https://meet.google.com/xxx",
  "status": "scheduled", // "scheduled" | "completed" | "cancelled"
  "booking_request_id": "booking-uuid",
  "created_at": "2026-01-26T08:00:00.000Z"
}
```

#### 8. `feedbacks`
Interview feedback submitted by mentors.

```javascript
{
  "id": "uuid-string",
  "mock_id": "mock-uuid",
  "mentor_id": "mentor-uuid",
  "mentee_id": "mentee-uuid",
  "problem_solving": 4, // 0-5 scale
  "communication": 5,
  "technical_depth": 3,
  "code_quality": 4,
  "overall": 4,
  "strengths": "Good problem-solving approach...",
  "improvements": "Need to work on system design...",
  "hireability": "Hire", // "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire"
  "action_items": "Practice medium LC problems...",
  "created_at": "2026-01-26T12:00:00.000Z"
}
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login (returns JWT) |
| GET | `/api/auth/me` | Get current user |

### Admin Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/revenue-stats` | Revenue analytics |
| GET | `/api/admin/mentees` | List all mentees |
| GET | `/api/admin/mentors` | List all mentors |
| GET | `/api/admin/orders` | List all orders |
| POST | `/api/admin/assign-mentor` | Assign mentor to mentee |
| PUT | `/api/admin/mentees/{id}/status` | Update mentee status |
| GET | `/api/admin/companies` | List companies |
| POST | `/api/admin/companies` | Add company |
| DELETE | `/api/admin/companies/{id}` | Delete company |
| GET | `/api/admin/time-slots` | List time slots |
| POST | `/api/admin/time-slots` | Create time slot |
| DELETE | `/api/admin/time-slots/{id}` | Delete time slot |
| GET | `/api/admin/meet-links` | List meet links |
| POST | `/api/admin/meet-links` | Add meet link |
| DELETE | `/api/admin/meet-links/{id}` | Delete meet link |
| POST | `/api/admin/meet-links/{id}/release` | Release meet link |
| GET | `/api/admin/booking-requests` | List all bookings |

### Mentor Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentor/mentees` | List assigned mentees |
| GET | `/api/mentor/mocks` | List mock interviews |
| GET | `/api/mentor/booking-requests` | List pending bookings |
| POST | `/api/mentor/confirm-booking` | Confirm booking |

### Mentee Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentee/mocks` | List my mock interviews |
| GET | `/api/mentee/feedbacks` | List my feedbacks |
| GET | `/api/mentee/booking-requests` | List my bookings |
| POST | `/api/mentee/booking-request` | Create booking request |

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List companies |
| GET | `/api/available-slots` | List available slots |

### Payment Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment/config` | Get Razorpay key ID |
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify payment |

### Feedback Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feedbacks` | List feedbacks |
| POST | `/api/feedbacks` | Submit feedback |
| GET | `/api/feedbacks/{id}` | Get feedback details |

### Mock Interview Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mocks` | List mock interviews |
| POST | `/api/mocks` | Create mock interview |
| PUT | `/api/mocks/{id}/status` | Update mock status |

---

## Project Structure

```
/app
├── backend/
│   ├── .env                    # Backend environment variables
│   ├── requirements.txt        # Python dependencies
│   └── server.py              # FastAPI application
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardLayout.jsx
│   │   │   ├── landing/
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── PricingSection.jsx
│   │   │   │   ├── DeliverablesSection.jsx
│   │   │   │   └── ...
│   │   │   └── ui/            # Shadcn components
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       └── ...
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminMentees.jsx
│   │   │   │   ├── AdminMentors.jsx
│   │   │   │   ├── AdminMocks.jsx
│   │   │   │   ├── AdminFeedbacks.jsx
│   │   │   │   ├── AdminPayments.jsx
│   │   │   │   ├── AdminCompanies.jsx
│   │   │   │   ├── AdminTimeSlots.jsx
│   │   │   │   ├── AdminBookings.jsx
│   │   │   │   └── AdminMeetLinks.jsx
│   │   │   ├── mentor/
│   │   │   │   ├── MentorDashboard.jsx
│   │   │   │   ├── MentorMentees.jsx
│   │   │   │   ├── MentorMocks.jsx
│   │   │   │   ├── MentorFeedbacks.jsx
│   │   │   │   └── MentorBookingRequests.jsx
│   │   │   ├── mentee/
│   │   │   │   ├── MenteeDashboard.jsx
│   │   │   │   ├── MenteeMocks.jsx
│   │   │   │   ├── MenteeFeedbacks.jsx
│   │   │   │   └── MenteeBooking.jsx
│   │   │   ├── ApplyPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── TermsOfService.jsx
│   │   │   ├── RefundPolicy.jsx
│   │   │   └── ContactUs.jsx
│   │   ├── utils/
│   │   │   └── api.js         # Axios instance
│   │   ├── App.js             # Main app with routes
│   │   └── index.css          # Tailwind styles
│   ├── .env                   # Frontend environment variables
│   ├── package.json
│   └── tailwind.config.js
│
└── memory/
    └── PRD.md                 # Product requirements document
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.11+
- MongoDB (local or Atlas)
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/codementee.git
cd codementee
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="codementee"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production"
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=support@yourdomain.com
BCC_EMAIL=admin@yourdomain.com
EOF

# Start backend server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Step 3: Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
yarn install

# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
EOF

# Start frontend development server
yarn start
```

### Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

### Step 5: Create Initial Admin User

```bash
curl -X POST "http://localhost:8001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@codementee.com",
    "password": "Admin@123",
    "role": "admin"
  }'
```

---

## Environment Variables

### Backend (`/backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URL` | MongoDB connection string | Yes |
| `DB_NAME` | Database name | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes (Production) |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret | Yes |
| `RESEND_API_KEY` | Resend Email API Key | Yes |
| `SENDER_EMAIL` | From email address | Yes |
| `BCC_EMAIL` | BCC email for copies | No |

### Frontend (`/frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_BACKEND_URL` | Backend API URL | Yes |

---

## Deployment Strategy

### Option 1: Emergent Platform (Recommended)

The application is optimized for deployment on [Emergent](https://emergent.sh).

1. **Push to GitHub** using "Save to Github" feature
2. **Deploy** via Emergent dashboard
3. **Configure** environment variables in deployment settings

### Option 2: Docker Deployment

#### Dockerfile for Backend

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Dockerfile for Frontend

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=codementee
      - CORS_ORIGINS=*
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_BACKEND_URL=http://backend:8001
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### Deploy with Docker Compose

```bash
docker-compose up -d
```

### Option 3: Kubernetes Deployment

#### Backend Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: codementee-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: codementee-backend
  template:
    metadata:
      labels:
        app: codementee-backend
    spec:
      containers:
      - name: backend
        image: your-registry/codementee-backend:latest
        ports:
        - containerPort: 8001
        envFrom:
        - secretRef:
            name: codementee-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: codementee-backend
spec:
  selector:
    app: codementee-backend
  ports:
  - port: 8001
    targetPort: 8001
```

#### Frontend Deployment

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: codementee-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: codementee-frontend
  template:
    metadata:
      labels:
        app: codementee-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/codementee-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: codementee-frontend
spec:
  selector:
    app: codementee-frontend
  ports:
  - port: 80
    targetPort: 80
```

#### Ingress Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: codementee-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: codementee.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: codementee-backend
            port:
              number: 8001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: codementee-frontend
            port:
              number: 80
```

### Option 4: Cloud Platform Deployment

#### AWS (EC2 + RDS + S3)

1. **Database**: Use MongoDB Atlas or DocumentDB
2. **Backend**: Deploy on EC2 or ECS
3. **Frontend**: Deploy on S3 + CloudFront
4. **Load Balancer**: ALB for traffic distribution

#### Google Cloud Platform

1. **Database**: MongoDB Atlas or Firestore
2. **Backend**: Cloud Run or GKE
3. **Frontend**: Cloud Storage + Cloud CDN
4. **Load Balancer**: Cloud Load Balancing

#### DigitalOcean

1. **Database**: MongoDB Atlas or Managed Database
2. **Backend**: App Platform or Droplet
3. **Frontend**: App Platform or Spaces + CDN

---

## User Workflows

### Mentee Registration & Payment Flow

```
1. Visit Landing Page
         │
         ▼
2. Click "Get Started" / Select Plan
         │
         ▼
3. Fill Registration Form
   (Name, Email, Phone, Current Role, Target Role)
         │
         ▼
4. Razorpay Payment Popup
         │
         ▼
5. Payment Success
         │
         ▼
6. Auto-create User Account + Order Record
         │
         ▼
7. Send Welcome Email
         │
         ▼
8. Redirect to Mentee Dashboard
```

### Mock Interview Booking Flow

```
MENTEE                          MENTOR                          ADMIN
  │                               │                               │
  │ 1. Click "Schedule Mock"      │                               │
  │                               │                               │
  │ 2. Select Company             │                               │
  │    (Amazon, Google, etc.)     │                               │
  │                               │                               │
  │ 3. View Available Slots       │                               │
  │    (Created by Admin) ◄───────┼───────────────────────────────┤ Creates Time Slots
  │                               │                               │
  │ 4. Select 2 Preferred Slots   │                               │
  │                               │                               │
  │ 5. Submit Booking Request     │                               │
  │         │                     │                               │
  │         └─────────────────────► 6. Receive Email + Dashboard  │
  │                               │    Notification               │
  │                               │                               │
  │                               │ 7. View Booking Request       │
  │                               │                               │
  │                               │ 8. Select Slot to Confirm     │
  │                               │                               │
  │                               │ 9. Click "Confirm"            │
  │                               │         │                     │
  │                               │         ▼                     │
  │                               │ 10. System Auto-assigns       │
  │                               │     Google Meet Link ◄────────┤ Manages Meet Link Pool
  │                               │                               │
  │ ◄─────────────────────────────┤ 11. Both Receive Email        │
  │ 12. Receive Confirmation      │     with Meeting Link         │
  │     Email with Link           │                               │
  │                               │                               │
  │ 13. Join Meeting at           │ 13. Join Meeting at           │
  │     Scheduled Time            │     Scheduled Time            │
  │                               │                               │
  │                               │ 14. Submit Feedback           │
  │                               │     After Interview           │
  │ ◄─────────────────────────────┤                               │
  │ 15. View Feedback in          │                               │
  │     Dashboard                 │                               │
```

---

## Third-Party Integrations

### Razorpay (Payments)

**Setup:**
1. Create account at [razorpay.com](https://razorpay.com)
2. Get API Key ID and Key Secret from Dashboard → Settings → API Keys
3. Add to backend `.env`

**Flow:**
1. Frontend calls `/api/payment/create-order` to create order
2. Razorpay popup opens for payment
3. On success, frontend calls `/api/payment/verify` with payment details
4. Backend verifies signature and creates user

### Resend (Emails)

**Setup:**
1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create API key from Dashboard → API Keys
4. Add to backend `.env`

**Email Templates:**
- Welcome email (on successful payment)
- Booking request notification (to mentor)
- Booking confirmation (to both mentor and mentee)

### MongoDB Atlas (Database)

**Setup:**
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster (M0)
3. Create database user with password
4. Add `0.0.0.0/0` to Network Access
5. Get connection string from Connect → Drivers
6. Add to backend `.env`

---

## Testing

### Backend Testing

```bash
cd backend

# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/ -v
```

### Frontend Testing

```bash
cd frontend

# Run tests
yarn test

# Run with coverage
yarn test --coverage
```

### API Testing with cURL

```bash
# Health check
curl http://localhost:8001/api/

# Register
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test@123","role":"mentee"}'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}'

# Get user (with token)
curl http://localhost:8001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
Error: ServerSelectionTimeoutError
```
**Solution:**
- Check if MongoDB is running
- Verify connection string in `.env`
- For Atlas: Check IP whitelist and credentials

#### 2. CORS Error
```
Access to fetch blocked by CORS policy
```
**Solution:**
- Ensure `CORS_ORIGINS` includes frontend URL
- Check if backend is running on correct port

#### 3. JWT Invalid Token
```
{"detail": "Invalid token"}
```
**Solution:**
- Token may be expired (24-hour expiry)
- Re-login to get new token
- Check `JWT_SECRET` is consistent

#### 4. Razorpay Payment Failed
```
Payment verification failed
```
**Solution:**
- Verify API keys are correct (test vs live)
- Check signature verification logic
- Ensure amount matches order amount

#### 5. Emails Not Sending
```
Failed to send email
```
**Solution:**
- Verify Resend API key
- Check domain verification status
- Verify sender email is from verified domain

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For support, email support@codementee.com or join our WhatsApp group.

---

## Changelog

### v1.0.0 (January 2026)
- Initial release
- User authentication (Admin, Mentor, Mentee)
- Mock interview booking system
- Razorpay payment integration
- Resend email notifications
- Google Meet link pool auto-assignment
- Admin dashboard with analytics
- Responsive design

---

**Built with ❤️ by Codementee Team**
