# Project Structure & Organization

## Root Directory Layout
```
/
├── backend/           # FastAPI Python backend
├── frontend/          # React frontend application
├── memory/           # Product requirements and documentation
├── tests/            # Test files
├── test_reports/     # Test execution reports
└── .kiro/           # Kiro configuration and steering
```

## Backend Structure (`/backend/`)
```
backend/
├── server.py         # Main FastAPI application (single file architecture)
├── requirements.txt  # Python dependencies
├── .env             # Environment variables (not in git)
├── setup_initial_data.py  # Initial data setup with tier support
├── fix_pricing_transparency.py  # Pricing cleanup script
└── tests/           # Backend tests
```

**Key Backend Patterns:**
- Single-file FastAPI app with modular route organization
- Async/await patterns with Motor MongoDB driver
- Pydantic models for request/response validation
- JWT-based authentication with role-based access control
- Tier-based access control for premium features
- Free registration endpoint (`/auth/register-free`)
- Integrated payment processing within booking flow
- Email templates embedded in functions (HTML strings)

## Frontend Structure (`/frontend/`)
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── dashboard/     # Dashboard layouts
│   │   ├── landing/       # Landing page sections
│   │   ├── layout/        # Layout components
│   │   └── ui/           # Shadcn/UI components
│   ├── contexts/
│   │   └── AuthContext.jsx  # Authentication state management with tier detection
│   ├── pages/
│   │   ├── admin/         # Admin dashboard pages (includes booking management)
│   │   ├── mentor/        # Mentor dashboard pages
│   │   ├── mentee/        # Mentee dashboard pages (tier-aware, interview status)
│   │   ├── RegisterPage.jsx  # Free registration page
│   │   ├── ApplyPage.jsx     # Payment-based registration (legacy)
│   │   └── *.jsx         # Public pages (landing, auth, policies)
│   ├── utils/
│   │   └── api.js        # Axios configuration with tier handling
│   ├── hooks/
│   │   └── use-toast.js  # Toast notification hook
│   ├── lib/
│   │   └── utils.js      # Utility functions
│   ├── data/
│   │   └── mock.js       # Mock data for development (updated pricing)
│   ├── App.js           # Main app with routing (includes /register route)
│   ├── index.js         # React entry point
│   └── index.css        # Tailwind CSS imports
├── package.json
├── tailwind.config.js   # Tailwind configuration
├── craco.config.js     # CRACO build configuration
└── components.json     # Shadcn/UI configuration
```

## Component Organization Patterns

### Page Structure
- Each user role has dedicated page directory (`admin/`, `mentor/`, `mentee/`)
- Pages follow naming convention: `{Role}{Feature}.jsx` (e.g., `AdminMentees.jsx`)
- Public pages in root pages directory
- **New**: `RegisterPage.jsx` for free registration flow

### Component Architecture
- **UI Components**: Reusable Shadcn/UI components in `/components/ui/`
- **Feature Components**: Role-specific components in subdirectories
- **Layout Components**: Shared layouts in `/components/layout/`
- **Landing Components**: Marketing page sections in `/components/landing/`
- **Tier-Aware Components**: Different UI based on user tier (free vs paid)

### Routing Patterns
- Role-based route protection with `ProtectedRoute` component
- Route structure: `/{role}/{feature}` (e.g., `/admin/mentees`, `/mentor/booking-requests`)
- Public routes at root level (`/`, `/login`, `/register`, `/apply`)
- **Updated**: `/mentee/mocks` shows interview status (no mentor selection)
- **New**: `/register` for free signup, `/apply` for legacy payment flow

## Configuration Files

### Build & Development
- `craco.config.js` - Custom React App configuration
- `tailwind.config.js` - Tailwind CSS customization with Shadcn/UI theme
- `components.json` - Shadcn/UI component configuration
- `postcss.config.js` - PostCSS configuration for Tailwind

### Package Management
- Frontend: Yarn with `package.json`
- Backend: pip with `requirements.txt`

## Data Flow Patterns

### Authentication & Tier Management
- JWT tokens stored in localStorage, managed by AuthContext
- Tier detection: `user?.status === 'Free' || !user?.plan_id`
- Different UI rendering based on user tier
- Upgrade prompts for free users

### API Calls
- Centralized through `api.js` with automatic token injection
- Tier-aware error handling (upgrade prompts)
- Payment integration within booking flow

### State Management
- React Context for global state (auth, user tier)
- Local state for components
- Tier-based conditional rendering

### Form Handling
- React Hook Form with Zod validation (where applicable)
- Multi-step forms with integrated payment (booking flow)
- Free registration without payment requirement

## User Flow Architecture

### Free User Journey
```
Landing → Register (Free) → Dashboard (Explore) → Booking (Start) → Payment → Admin Assignment → Interview
```

### Paid User Journey
```
Landing → Register (Free) → Dashboard → Booking → Admin Assignment → Interview
```

### Legacy Journey (Still Supported)
```
Landing → Apply → Payment → Dashboard
```

## Naming Conventions
- **Files**: PascalCase for components (`.jsx`), camelCase for utilities (`.js`)
- **Directories**: kebab-case for multi-word directories
- **API Endpoints**: RESTful with role prefixes (`/api/admin/`, `/api/mentor/`)
- **Database Fields**: snake_case for consistency with Python backend
- **User Tiers**: "Free" for free tier, "Active" for paid tier

## Tier-Based Architecture

### Frontend Tier Detection
```jsx
const { user } = useAuth();
const isFreeUser = user?.status === 'Free' || !user?.plan_id;

// Conditional rendering
{isFreeUser ? <FreeUserUI /> : <PaidUserUI />}
```

### Backend Tier Validation
```python
# Tier-based access control
async def require_paid_tier(user=Depends(get_current_user)):
    if user["status"] == "Free" or not user.get("plan_id"):
        raise HTTPException(status_code=403, detail="Upgrade required")
    return user
```

### Database Tier Tracking
```json
{
  "user_id": "uuid",
  "status": "Free|Active",
  "plan_id": "foundation|growth|accelerator|null",
  "plan_name": "Foundation|Growth|Accelerator|Free Tier"
}
```

This architecture supports a seamless freemium experience where users can explore the platform before committing to payment, leading to higher conversion rates and better user satisfaction.