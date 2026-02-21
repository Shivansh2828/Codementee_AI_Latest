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
- [x] **Manage Companies** - Add/delete companies for mock interviews
- [x] **Manage Time Slots** - Create available slots for booking
- [x] **View Booking Requests** - Monitor all booking requests

### Mentor Dashboard
- [x] See assigned mentees and upcoming interviews
- [x] Button to join external meeting link
- [x] Form to submit structured feedback after mock interview
- [x] **Booking Requests** - View and confirm pending booking requests from mentees

### Mentee Dashboard
- [x] See upcoming mock interview details and join link
- [x] View feedback reports after mock
- [x] **Schedule Mock Interview** - 3-step booking flow:
  - Step 1: Select company (Amazon, Google, etc.)
  - Step 2: Choose up to 2 preferred time slots
  - Step 3: Review and submit request

### Booking System Flow
```
Admin: Creates Meet Link Pool (Google Meet URLs)
          ↓
Mentee → Select Company → Pick 2 Slots → Submit
                                           ↓
                              Mentor receives email + dashboard notification
                                           ↓
                              Mentor confirms slot
                                           ↓
                              System auto-assigns Meet Link from pool
                                           ↓
                              Both receive confirmation email with link
                                           ↓
                              Session visible in both dashboards
                                           ↓
                              Admin releases link after interview (reusable)
```

### Landing Page
- [x] Professional, clean, minimal UI
- [x] Value proposition: "Real mock interviews with engineers who've cracked product based companies"
- [x] Company logos of top product-based companies
- [x] Three membership plans:
  - **Mock Starter**: ₹2,999 - 1 MAANG mock, resume review, ATS tools
  - **Interview Pro**: ₹6,999 - 3 MAANG mocks, improvement tracking, strategy call (Most Popular)
  - **Interview Elite**: ₹14,999 - 6 MAANG mocks, live resume review, referrals, WhatsApp support

### Payment Integration
- [x] Razorpay integration for payments (LIVE keys active)
- [x] Direct payment flow on Apply page
- [x] Auto-create mentee account upon successful payment
- [x] Redirect to mentee dashboard after payment

### Email Notifications
- [x] Welcome email on successful payment (with logo, order summary)
- [x] Booking request email to mentor
- [x] Booking confirmation email to both mentor and mentee
- From: Support@codementee.com
- BCC: shivanshbiz28@gmail.com

### Policy Pages
- [x] Privacy Policy
- [x] Terms of Service
- [x] Refund Policy
- [x] Contact Us (with WhatsApp integration)

## Technical Stack
- **Frontend**: React, React Router, Tailwind CSS, Shadcn UI, Axios
- **Backend**: FastAPI, MongoDB Atlas (cloud database)
- **Authentication**: JWT tokens
- **Payments**: Razorpay (LIVE keys)
- **Emails**: Resend API

## Database Collections
- **users** - All users (admin, mentor, mentee)
- **orders** - Payment transactions
- **companies** - Companies for mock interviews
- **time_slots** - Available booking slots
- **meet_links** - Google Meet link pool (auto-assigned)
- **booking_requests** - Mentee booking requests
- **mocks** - Confirmed mock interviews
- **feedbacks** - Interview feedback

## Test Credentials
- **Admin**: admin@codementee.com / Admin@123
- **Mentor**: mentor@codementee.com / Mentor@123
- **Mentee**: mentee@codementee.com / Mentee@123

## Recent Updates (Jan 2026)
- Implemented complete booking system
- Added company management for admin
- Added time slot management for admin
- **Added Google Meet Link Pool** - Auto-assigns links when mentor confirms
- Created mentee booking flow (3 steps)
- Created mentor booking request confirmation
- Added email notifications for booking flow
- Connected to MongoDB Atlas (cloud)
- Integrated Resend for emails

## Future/Backlog
- Google Calendar API integration (auto-create events)
- SMS notifications via Twilio
- Mobile app
