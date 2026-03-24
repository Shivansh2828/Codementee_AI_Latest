# Technology Stack & Development Guide

## Architecture
Full-stack freemium application with separate frontend and backend services, designed for scalability from startup to enterprise level. Now with **global multi-currency support**.

### Current Production Status
- **Deployed**: Production-ready on Hostinger VPS (62.72.13.129)
- **Containerized**: Docker-based deployment with docker-compose
- **Database**: MongoDB Atlas cloud database
- **SSL**: Let's Encrypt certificates ready
- **Monitoring**: Health checks and logging implemented
- **Payment**: Razorpay (India) + Cashfree (International)
- **Global**: Multi-currency support (INR + USD)

## Frontend Stack
- **Framework**: React 19.x with React Router 7.x for routing
- **Styling**: Tailwind CSS 3.x with utility-first approach
- **UI Components**: Shadcn/UI component library (Radix UI primitives)
- **Build Tool**: Create React App with CRACO for customization
- **HTTP Client**: Axios with interceptors for authentication
- **State Management**: React Context (AuthContext, ThemeContext, CurrencyContext)
- **Icons**: Lucide React
- **Notifications**: Sonner for toast messages
- **Payment SDKs**: Razorpay Checkout.js + Cashfree SDK v3

## Backend Stack
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB Atlas (cloud) with Motor async driver
- **Authentication**: JWT tokens with bcrypt password hashing
- **Payment**: Razorpay (India, INR) + Cashfree (International, USD)
- **Email**: Resend API for transactional emails
- **Process Management**: Supervisor for production
- **Currency Detection**: IP-based geolocation (ip-api.com)

## Multi-Currency System

### Payment Gateways
- **Razorpay**: India users (INR payments, ~2% fees)
- **Cashfree**: International users (USD payments, ~3% fees)
- **Auto-routing**: Based on user location detection

### Currency Detection
- **Method**: IP-based geolocation
- **Endpoint**: `/api/detect-currency`
- **Fallback**: Defaults to INR if detection fails
- **Response**: `{ "country": "US", "currency": "USD", "is_india": false }`

### Pricing Structure
| Plan | India (INR) | International (USD) |
|------|-------------|---------------------|
| Mock Starter | ₹1,999 | $24 |
| Interview Pro | ₹6,999 | $84 |
| Interview Elite | ₹14,999 | $180 |

### Mentor Payouts
- **India sessions**: ₹800 per session
- **International sessions**: $10 per session
- **Auto-detection**: Based on mentee's payment currency

## Database Collections
- `users` - All user accounts with tier status and currency preference
- `orders` - Payment transactions with currency and gateway info
- `companies` - Available companies with categories
- `time_slots` - Bookable time slots
- `meet_links` - Google Meet link pool
- `booking_requests` - Interview booking requests
- `mocks` - Confirmed mock interviews
- `feedbacks` - Post-interview evaluations
- `pricing_plans` - Dynamic pricing with INR and USD prices
- `payouts` - Mentor payouts with currency tracking
- `resume_analyses` - AI-powered resume analysis
- `forum_posts` - Community forum posts
- `forum_comments` - Community forum comments

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

**Always use `deploy.sh` for production deployments.**

```bash
# On VPS
ssh root@62.72.13.129
cd /var/www/codementee
./deploy.sh
```

## Environment Configuration

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001  # Development
REACT_APP_BACKEND_URL=https://api.codementee.io  # Production
```

### Backend (.env)
```
MONGO_URL=mongodb+srv://...  # MongoDB Atlas
DB_NAME=codementee
CORS_ORIGINS=https://codementee.io,https://www.codementee.io
JWT_SECRET=your-secret-key

# Razorpay (India)
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_secret

# Cashfree (International)
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret
CASHFREE_BASE_URL=https://api.cashfree.com/pg

# Email
RESEND_API_KEY=your_resend_key
SENDER_EMAIL=support@codementee.com
BCC_EMAIL=admin@codementee.com

# URLs
FRONTEND_URL=https://codementee.io
BACKEND_URL=https://codementee.io/api
```

## API Structure
- Base URL: `/api`
- Authentication: Bearer token in Authorization header
- Role-based endpoints: `/admin/*`, `/mentor/*`, `/mentee/*`
- Currency detection: `/api/detect-currency`
- Multi-currency pricing: `/api/pricing-plans?currency=USD`
- Payment creation: `/api/payment/create-order` (auto-routes to gateway)
- Webhooks: `/api/payment/cashfree-webhook`

## User Tier System
- **Free Tier**: Dashboard exploration, no payment required
- **Paid Tier**: Full access after payment (INR or USD)
- **Currency**: Stored with user for payout calculations

## Pricing Management
- **Admin Control**: `/admin/pricing` dashboard
- **Dual Currency**: Edit both INR and USD prices
- **Real-time Sync**: Changes reflect immediately
- **Database-Driven**: All pricing in MongoDB

## Testing Credentials
- **Admin**: admin@codementee.com / Admin@123
- **Mentor**: mentor@codementee.com / Mentor@123
- **Mentee (Paid)**: mentee@codementee.com / Mentee@123

## Production URLs
- **Frontend**: https://codementee.io
- **Backend API**: https://codementee.io/api
- **VPS IP**: 62.72.13.129
- **Health Check**: https://codementee.io/api/health