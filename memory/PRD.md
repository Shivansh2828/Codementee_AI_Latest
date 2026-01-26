# Codementee - Product Requirements Document

## Overview
A mentorship-based interview preparation platform with three roles: Admin, Mentor, and Mentee. Features real mock interviews with engineers from top product-based companies.

## Core Requirements

### Authentication
- Email/password JWT-based authentication
- Role-based access control (admin, mentor, mentee)
- Auto-login after successful payment registration

### Admin Dashboard
- [x] View lists of mentees and mentors
- [x] Assign mentors to mentees
- [x] View upcoming mock interviews and mark as complete
- [x] View submitted feedback
- [x] Update mentee status
- [x] **Revenue Tracking** - Total revenue, orders by plan, detailed orders list with search/filters

### Mentor Dashboard
- [x] See assigned mentees and upcoming interviews
- [x] Button to join external meeting link
- [x] Form to submit structured feedback after mock interview

### Mentee Dashboard
- [x] See upcoming mock interview details and join link
- [x] View feedback reports after mock

### Landing Page
- [x] Professional, clean, minimal UI
- [x] Value proposition: "Real mock interviews with engineers who've cracked product based companies"
- [x] Company logos of top product-based companies
- [x] Three membership plans: Monthly (₹1,999), 3 Months (₹4,999), 6 Months (₹8,999)

### Payment Integration
- [x] Razorpay integration for payments (LIVE keys active)
- [x] Direct payment flow on Apply page
- [x] Auto-create mentee account upon successful payment
- [x] Redirect to mentee dashboard after payment

### Policy Pages
- [x] Privacy Policy
- [x] Terms of Service
- [x] Refund Policy
- [x] Contact Us (with WhatsApp integration)

## Technical Stack
- **Frontend**: React, React Router, Tailwind CSS, Shadcn UI, Axios
- **Backend**: FastAPI, MongoDB (motor async driver)
- **Authentication**: JWT tokens
- **Payments**: Razorpay (LIVE keys)

## Test Credentials
- **Admin**: admin@test.com / password
- **Mentor**: mentor@test.com / password
- **Mentee**: Created dynamically via payment flow

## Key API Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/admin/orders` - List all payment orders
- `GET /api/admin/revenue-stats` - Revenue statistics
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment and create user

## Recent Updates (Jan 2026)
- Completed revenue tracking feature for Admin
- Added Admin Orders page with search and filter functionality
- Updated Razorpay from test keys to LIVE keys
- All tests passing (13/13 backend, 100% frontend)

## Future/Backlog
- None pending - MVP complete
