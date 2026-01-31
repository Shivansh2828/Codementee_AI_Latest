# Development Best Practices & Guidelines

## Code Organization Principles

### Backend Architecture (FastAPI)
- **Single File Pattern**: All routes in `server.py` with clear section comments
- **Model Organization**: Pydantic models grouped by feature (Auth, Booking, Pricing, Admin Assignment, etc.)
- **Route Grouping**: Use `# ============ SECTION NAME ============` for clear separation
- **Async/Await**: All database operations use Motor async driver patterns
- **Error Handling**: Consistent HTTPException with descriptive messages
- **Tier-Based Access Control**: Implement proper restrictions for free vs paid users
- **Admin Controls**: Separate admin endpoints for mentor assignment and booking management

### Frontend Architecture (React)
- **Component Hierarchy**: Pages → Components → UI Components
- **Naming Convention**: PascalCase for components, camelCase for utilities
- **State Management**: React Context for global state, local state for components
- **API Integration**: Centralized through `api.js` with automatic token injection
- **Styling**: Tailwind CSS with Shadcn/UI components for consistency
- **Tier-Aware UI**: Different experiences based on user tier (free vs paid)
- **Role-Based UI**: Admin interfaces for mentor assignment and booking management

### Dashboard Layout Best Practices
- **Mobile Overlay**: Use simple conditional rendering for mobile sidebar overlay
- **State Management**: Always declare useState hooks at component top level
- **Event Handlers**: Clean up event listeners in useEffect cleanup functions
- **Z-Index Management**: Proper layering - sidebar (z-50), overlay (z-40), content (default)
- **Responsive Design**: Hide/show elements appropriately for mobile vs desktop
- **Click Handling**: Ensure overlay clicks close sidebar without blocking other interactions

## Mentor Assignment System Patterns

### Admin Booking Management
```javascript
// Admin booking confirmation with mentor assignment
const handleAssignMentor = async () => {
  try {
    await api.post('/admin/confirm-booking', {
      booking_request_id: bookingId,
      mentor_id: selectedMentor,
      confirmed_slot_id: selectedSlot
    });
    toast.success('Booking confirmed and mentor assigned!');
  } catch (error) {
    toast.error('Failed to assign mentor');
  }
};
```

### Backend Admin Assignment
```python
# Admin-only mentor assignment endpoint
@api_router.post("/admin/confirm-booking")
async def admin_confirm_booking(data: AdminConfirmBookingRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Assign mentor, confirm slot, send emails
    # Auto-assign meeting link from pool
    # Create mock interview record
```

### Email Notification Patterns
```python
# Enhanced email with mentor details for mentees
async def send_booking_confirmed_email(
    recipient_name: str, 
    recipient_email: str, 
    company_name: str, 
    slot_time: str, 
    meeting_link: str, 
    is_mentor: bool = False, 
    mentor_name: str = None, 
    mentor_email: str = None
):
```

## User Tier Management

### Tier Detection Patterns
```javascript
// Frontend tier detection
const { user } = useAuth();
const isFreeUser = user?.status === 'Free' || !user?.plan_id;

// Conditional rendering based on tier
{isFreeUser ? (
  <UpgradePrompt />
) : (
  <PremiumFeature />
)}
```

### Backend Tier Validation
```python
# Tier-based access control
async def require_paid_tier(user=Depends(get_current_user)):
    if user["status"] == "Free" or not user.get("plan_id"):
        raise HTTPException(status_code=403, detail="Upgrade required")
    return user

# Usage in routes
@api_router.get("/ai-tools/resume-analysis")
async def analyze_resume(user=Depends(require_paid_tier)):
    # Premium feature implementation
```

## Database Design Patterns

### Collection Naming
- Use snake_case for collection names: `booking_requests`, `time_slots`, `pricing_plans`
- Include metadata fields: `created_at`, `updated_at`, `id` (UUID string)
- Soft delete pattern: Use `status` field instead of hard deletes where applicable
- Tier tracking: Include user tier information in relevant collections

### Document Structure
```javascript
// Standard document pattern with tier awareness
{
  "id": "uuid-string",           // Primary identifier
  "user_id": "user-uuid",        // User reference
  "user_tier": "Free|Active",    // User tier at time of creation
  "created_at": "ISO-datetime",  // Creation timestamp
  "updated_at": "ISO-datetime",  // Last modification
  "status": "active|inactive",   // Soft delete support
  // ... feature-specific fields
}
```

### Relationships
- **User References**: Store user_id strings, not ObjectId references
- **Tier Validation**: Include tier checks in data access patterns
- **Embedded Documents**: Use for small, related data (e.g., slot details in booking requests)
- **Lookup Collections**: Separate collections for reference data (companies, pricing_plans)

## API Design Standards

### Route Structure
```
/api/auth/*           - Authentication endpoints (register, register-free, login)
/api/admin/*          - Admin-only endpoints  
/api/mentor/*         - Mentor-only endpoints
/api/mentee/*         - Mentee endpoints (tier-aware)
/api/ai-tools/*       - AI feature endpoints (paid tier only)
/api/community/*      - Community feature endpoints (paid tier only)
/api/companies        - Public company data
/api/pricing-plans    - Public pricing data
/api/payment/*        - Payment processing (integrated with booking)
```

### Response Patterns
```javascript
// Success Response
{
  "data": [...],
  "message": "Optional success message",
  "user_tier": "Free|Active"  // Include tier info when relevant
}

// Error Response with Upgrade Prompt
{
  "detail": "Upgrade required to access this feature",
  "code": "TIER_UPGRADE_REQUIRED",
  "upgrade_url": "/mentee/book"  // Direct to upgrade flow
}
```

### Authentication Flow
1. **Free Registration**: POST `/api/auth/register-free` → Returns JWT token, no payment
2. **Paid Registration**: POST `/api/payment/create-order` → Payment → Account creation
3. **Token Usage**: Include in Authorization header: `Bearer <token>`
4. **Token Validation**: Automatic validation in protected routes with tier checking
5. **Tier Checking**: Server-side tier validation for premium features

## Frontend Development Patterns

### Component Structure with Tier Awareness
```jsx
// Standard component pattern with tier support
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import UpgradePrompt from '../../components/UpgradePrompt';

const ComponentName = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isFreeUser = user?.status === 'Free' || !user?.plan_id;
  
  // API calls with tier awareness
  const fetchData = async () => {
    try {
      const response = await api.get('/endpoint');
      setData(response.data);
    } catch (error) {
      if (error.response?.data?.code === 'TIER_UPGRADE_REQUIRED') {
        // Handle upgrade requirement
        toast.error('Upgrade required for this feature');
      } else {
        toast.error('Error message');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Render with tier-based UI
  return (
    <DashboardLayout title="Page Title">
      {isFreeUser ? (
        <UpgradePrompt feature="Feature Name" />
      ) : (
        <PremiumContent data={data} />
      )}
    </DashboardLayout>
  );
};
```

### Form Handling with Payment Integration
```jsx
// Multi-step form with integrated payment
const [step, setStep] = useState(1);
const [formData, setFormData] = useState({});
const [selectedPlan, setSelectedPlan] = useState('growth');

// Handle form submission with payment for free users
const handleSubmit = async () => {
  if (isFreeUser) {
    // Redirect to payment step
    setStep(5); // Payment step
    return;
  }
  
  // Process form for paid users
  await submitForm();
};

// Payment handling
const handlePayment = async () => {
  // Razorpay integration
  // Update user tier after successful payment
  // Continue with original form submission
};
```

## Testing Strategies

### Backend Testing
- **Unit Tests**: Test individual functions and API endpoints
- **Integration Tests**: Test complete user flows (registration, booking, payment)
- **Tier Testing**: Test access control for free vs paid features
- **Data Validation**: Test Pydantic model validation
- **Authentication**: Test JWT token generation and validation

### Frontend Testing
- **Component Tests**: Test individual component rendering and interactions
- **Integration Tests**: Test complete user workflows
- **Tier Testing**: Test different UI states for free vs paid users
- **API Integration**: Mock API responses for consistent testing
- **Payment Flow**: Test booking + payment integration

### Test Data Management
- Use `setup_initial_data.py` for consistent test data setup
- Create separate test database for testing
- Reset test data between test runs
- Include both free and paid user test accounts
- Use realistic but anonymized test data

## Security Best Practices

### Authentication & Authorization
- **JWT Tokens**: Use secure secret keys, implement token expiration
- **Role-Based Access**: Server-side role validation for all protected routes
- **Tier-Based Access**: Additional validation for premium features
- **Password Security**: Use bcrypt for password hashing
- **Input Validation**: Validate all inputs on both client and server

### Data Protection
- **Environment Variables**: Store sensitive data in `.env` files
- **API Keys**: Never expose API keys in frontend code
- **CORS Configuration**: Restrict CORS origins in production
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Tier Enforcement**: Robust server-side tier validation

### Payment Security
- **Razorpay Integration**: Use server-side signature verification
- **Order Validation**: Validate payment amounts and order details
- **Webhook Security**: Verify webhook signatures
- **PCI Compliance**: Never store payment card data
- **Upgrade Tracking**: Secure tier upgrade process

## Performance Optimization

### Backend Optimization
- **Database Indexing**: Add indexes for frequently queried fields (user_id, tier, status)
- **Query Optimization**: Use efficient MongoDB queries with tier filtering
- **Caching**: Implement Redis for frequently accessed data (pricing plans, companies)
- **Connection Pooling**: Use connection pooling for database connections
- **Tier-Based Caching**: Different cache strategies for free vs paid users

### Frontend Optimization
- **Code Splitting**: Use React.lazy for route-based code splitting
- **Tier-Based Loading**: Load different components based on user tier
- **Image Optimization**: Optimize images and use appropriate formats
- **Bundle Analysis**: Monitor bundle size and optimize imports
- **Caching**: Implement proper caching strategies for API responses

## Deployment Guidelines

### Environment Setup
```bash
# Backend deployment with tier support
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001

# Frontend deployment with tier-aware builds
cd frontend
yarn install
yarn build
# Serve build folder with nginx or similar
```

### Environment Variables
```bash
# Production environment variables
MONGO_URL=mongodb+srv://...
DB_NAME=codementee
JWT_SECRET=secure-random-string
RAZORPAY_KEY_ID=live_key
RAZORPAY_KEY_SECRET=live_secret
RESEND_API_KEY=production_key
SENDER_EMAIL=support@codementee.com
BCC_EMAIL=admin@codementee.com
CORS_ORIGINS=https://codementee.com
```

### Monitoring & Logging
- **Application Logs**: Implement structured logging with tier information
- **Error Tracking**: Use error tracking services with tier context
- **Performance Monitoring**: Monitor API response times by tier
- **Database Monitoring**: Monitor database performance and queries
- **Conversion Tracking**: Track free-to-paid conversion metrics

## Maintenance Procedures

### Regular Tasks
- **Database Backups**: Automated daily backups
- **Log Rotation**: Implement log rotation policies
- **Security Updates**: Regular dependency updates
- **Performance Reviews**: Monthly performance analysis by tier
- **Conversion Analysis**: Regular analysis of free-to-paid conversion

### Data Management
- **User Data**: Implement data retention policies by tier
- **Analytics**: Track key metrics (registrations, conversions, bookings, revenue)
- **Cleanup**: Regular cleanup of expired sessions and temporary data
- **Tier Migration**: Handle user tier changes and data migration

### Feature Rollout
1. **Development**: Implement and test in development environment
2. **Tier Testing**: Test with both free and paid user accounts
3. **Staging**: Deploy to staging for integration testing
4. **Production**: Gradual rollout with monitoring
5. **Monitoring**: Monitor metrics and user feedback by tier
6. **Iteration**: Iterate based on feedback and conversion data

## Code Quality Standards

### Code Review Checklist
- [ ] Follows established naming conventions
- [ ] Includes proper error handling
- [ ] Has appropriate comments and documentation
- [ ] Follows security best practices
- [ ] Includes necessary validation
- [ ] Implements proper tier-based access control
- [ ] Is properly tested (including tier scenarios)
- [ ] Follows performance best practices
- [ ] Includes upgrade prompts where appropriate

### Documentation Requirements
- **API Documentation**: Document all API endpoints with tier requirements
- **Component Documentation**: Document tier-aware components
- **Setup Instructions**: Keep setup guides updated with tier system
- **Deployment Guides**: Maintain deployment documentation
- **Feature Documentation**: Document new features and tier restrictions
- **Conversion Flow**: Document the free-to-paid conversion process