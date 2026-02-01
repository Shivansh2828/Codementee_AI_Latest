# Technology Stack & Development Guide

## Architecture
Full-stack freemium application with separate frontend and backend services, designed for scalability from startup to enterprise level.

### Current Production Status
- **Deployed**: Production-ready on Hostinger VPS (62.72.13.129)
- **Containerized**: Docker-based deployment with docker-compose
- **Database**: MongoDB Atlas cloud database
- **SSL**: Let's Encrypt certificates ready
- **Monitoring**: Health checks and logging implemented

## Frontend Stack
- **Framework**: React 19.x with React Router 7.x for routing
- **Styling**: Tailwind CSS 3.x with utility-first approach
- **UI Components**: Shadcn/UI component library (Radix UI primitives)
- **Build Tool**: Create React App with CRACO for customization
- **HTTP Client**: Axios with interceptors for authentication
- **State Management**: React Context (AuthContext) with user tier detection
- **Icons**: Lucide React
- **Notifications**: Sonner for toast messages

## Backend Stack
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB Atlas (cloud) with Motor async driver
- **Authentication**: JWT tokens with bcrypt password hashing
- **Payment**: Razorpay integration (live keys) with booking flow integration
- **Email**: Resend API for transactional emails (welcome, upgrade notifications)
- **Process Management**: Supervisor for production

## Database Collections
- `users` - All user accounts (admin, mentor, mentee) with tier status (Free/Paid)
- `orders` - Payment transactions linked to user upgrades
- `companies` - Available companies with categories, interview tracks, and difficulty levels
- `time_slots` - Bookable time slots with interview type compatibility
- `meet_links` - Google Meet link pool for auto-assignment by admin
- `booking_requests` - Interview booking requests with admin assignment tracking
- `mocks` - Confirmed mock interviews with mentor assignments
- `feedbacks` - Post-interview evaluations
- `pricing_plans` - Dynamic pricing plans (Foundation, Growth, Accelerator) with transparent limits
- `resume_analyses` - AI-powered resume analysis results (paid tier)
- `forum_posts` - Community forum posts (paid tier)
- `forum_comments` - Community forum comments (paid tier)

## Development Commands

### Frontend
```bash
cd frontend
yarn install          # Install dependencies
yarn start            # Development server (port 3000)
yarn build            # Production build
yarn test             # Run tests
```

### Backend
```bash
cd backend
pip install -r requirements.txt    # Install dependencies
uvicorn server:app --reload        # Development server (port 8001)
uvicorn server:app --host 0.0.0.0 --port 8001  # Production
```

### Production Deployment
```bash
# Deploy to production VPS
./deploy-codementee.sh

# Check deployment status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker logs codementee-backend
docker logs codementee-frontend
```

## Environment Configuration

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001  # Development
REACT_APP_BACKEND_URL=https://api.codementee.io  # Production
```

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017  # Local development
MONGO_URL=mongodb+srv://...  # MongoDB Atlas (production)
DB_NAME=codementee
CORS_ORIGINS=*  # Development
CORS_ORIGINS=https://codementee.io,https://www.codementee.io  # Production
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RESEND_API_KEY=your_resend_key
SENDER_EMAIL=support@yourdomain.com
BCC_EMAIL=admin@yourdomain.com
```

## API Structure
- Base URL: `/api`
- Authentication: Bearer token in Authorization header
- Role-based endpoints: `/admin/*`, `/mentor/*`, `/mentee/*`
- Admin booking management: `/admin/booking-requests`, `/admin/confirm-booking`
- Public endpoints: `/auth/*`, `/companies`, `/pricing-plans`
- Free registration: `/auth/register-free` (no payment required)
- Integrated payment: `/payment/*` (within booking flow)

## User Tier System
- **Free Tier**: 
  - Status: "Free"
  - Access: Dashboard exploration, pricing view, booking process start
  - Registration: `/auth/register-free` endpoint (no payment required)
  - Limitations: Cannot complete bookings without payment
- **Paid Tier**: 
  - Status: "Active" 
  - Access: Full platform features, mock interviews, AI tools
  - Plan tracking: Foundation/Growth/Accelerator with usage limits
  - Upgrade: Integrated payment flow within booking process

## Production Architecture
- **Frontend**: React app served via Nginx in Docker container
- **Backend**: FastAPI with Gunicorn in Docker container  
- **Database**: MongoDB Atlas (cloud-hosted)
- **Cache**: Redis container for session and data caching
- **Proxy**: Nginx reverse proxy with SSL termination
- **Deployment**: Docker Compose on VPS with health monitoring

## Testing Credentials
- **Admin**: admin@codementee.com / Admin@123
- **Mentor**: mentor@codementee.com / Mentor@123
- **Mentee (Paid)**: mentee@codementee.com / Mentee@123
- **Free User**: Register via `/register` page (no payment required)

## Production URLs
- **Frontend**: https://codementee.io (when DNS configured)
- **Backend API**: https://api.codementee.io (when DNS configured)
- **Current IP Access**: http://62.72.13.129:3000 (frontend), http://62.72.13.129:8001 (backend)
- **Health Check**: http://62.72.13.129:8001/api/health