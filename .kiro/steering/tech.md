# Technology Stack & Development Guide

## Architecture
Full-stack application with separate frontend and backend services.

## Frontend Stack
- **Framework**: React 19.x with React Router 7.x for routing
- **Styling**: Tailwind CSS 3.x with utility-first approach
- **UI Components**: Shadcn/UI component library (Radix UI primitives)
- **Build Tool**: Create React App with CRACO for customization
- **HTTP Client**: Axios with interceptors for authentication
- **State Management**: React Context (AuthContext)
- **Icons**: Lucide React
- **Notifications**: Sonner for toast messages

## Backend Stack
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB Atlas (cloud) with Motor async driver
- **Authentication**: JWT tokens with bcrypt password hashing
- **Payment**: Razorpay integration (live keys)
- **Email**: Resend API for transactional emails
- **Process Management**: Supervisor for production

## Database Collections
- `users` - All user accounts (admin, mentor, mentee)
- `orders` - Payment transactions
- `companies` - Available companies for mock interviews
- `time_slots` - Bookable time slots
- `meet_links` - Google Meet link pool
- `booking_requests` - Interview booking requests
- `mocks` - Confirmed mock interviews
- `feedbacks` - Post-interview evaluations

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

## Environment Configuration

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017  # or Atlas connection string
DB_NAME=codementee
CORS_ORIGINS=*
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
- Public endpoints: `/auth/*`, `/companies`, `/available-slots`

## Testing Credentials
- **Admin**: admin@codementee.com / Admin@123
- **Mentor**: mentor@codementee.com / Mentor@123
- **Mentee**: mentee@codementee.com / Mentee@123