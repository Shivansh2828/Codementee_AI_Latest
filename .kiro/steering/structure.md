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
└── tests/           # Backend tests
```

**Key Backend Patterns:**
- Single-file FastAPI app with modular route organization
- Async/await patterns with Motor MongoDB driver
- Pydantic models for request/response validation
- JWT-based authentication with role-based access control
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
│   │   └── AuthContext.jsx  # Authentication state management
│   ├── pages/
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── mentor/        # Mentor dashboard pages
│   │   ├── mentee/        # Mentee dashboard pages
│   │   └── *.jsx         # Public pages (landing, auth, policies)
│   ├── utils/
│   │   └── api.js        # Axios configuration
│   ├── hooks/
│   │   └── use-toast.js  # Toast notification hook
│   ├── lib/
│   │   └── utils.js      # Utility functions
│   ├── data/
│   │   └── mock.js       # Mock data for development
│   ├── App.js           # Main app with routing
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

### Component Architecture
- **UI Components**: Reusable Shadcn/UI components in `/components/ui/`
- **Feature Components**: Role-specific components in subdirectories
- **Layout Components**: Shared layouts in `/components/layout/`
- **Landing Components**: Marketing page sections in `/components/landing/`

### Routing Patterns
- Role-based route protection with `ProtectedRoute` component
- Route structure: `/{role}/{feature}` (e.g., `/admin/mentees`, `/mentor/booking-requests`)
- Public routes at root level (`/`, `/login`, `/apply`)

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
1. **Authentication**: JWT tokens stored in localStorage, managed by AuthContext
2. **API Calls**: Centralized through `api.js` with automatic token injection
3. **State Management**: React Context for global state, local state for components
4. **Form Handling**: React Hook Form with Zod validation (where applicable)

## Naming Conventions
- **Files**: PascalCase for components (`.jsx`), camelCase for utilities (`.js`)
- **Directories**: kebab-case for multi-word directories
- **API Endpoints**: RESTful with role prefixes (`/api/admin/`, `/api/mentor/`)
- **Database Fields**: snake_case for consistency with Python backend