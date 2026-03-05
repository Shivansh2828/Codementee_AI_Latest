# Implementation Plan: Mentor-Controlled Slot Management

## Overview

This implementation plan transforms the admin-controlled mentor assignment system into a mentor-controlled slot management system. The approach follows an incremental strategy: database schema updates, backend API implementation, frontend interface development, migration scripts, and finally integration testing.

## Tasks

- [x] 1. Database Schema Setup and Models
  - Create new `mentor_slots` collection schema with indexes
  - Create new `bookings` collection schema with indexes
  - Update `users` collection schema with quota fields and mentor profile fields
  - Define Pydantic models for all new data structures
  - _Requirements: 1.1-1.10, 6.1-6.10, 18.2-18.3_

- [ ] 2. Backend: Mentor Slot Management API
  - [x] 2.1 Implement slot creation endpoint with validation
    - Validate required fields (date, time, meeting_link)
    - Validate time range (minimum 30 minutes)
    - Validate date is not in the past
    - Validate meeting link URL format
    - Set initial status to "available"
    - Store mentor_id with slot
    - _Requirements: 1.1, 1.6, 1.7, 1.8, 1.9, 1.10_
  
  - [ ]* 2.2 Write property tests for slot creation validation
    - **Property 1: Required Fields Validation**
    - **Property 2: Minimum Time Range Validation**
    - **Property 3: Past Date Rejection**
    - **Property 4: Meeting Link URL Validation**
    - **Property 5: Initial Slot Status**
    - **Validates: Requirements 1.1, 1.6, 1.7, 1.8, 1.9, 1.10**
  
  - [x] 2.3 Implement slot update endpoint with status-based restrictions
    - Allow full updates for "available" slots
    - Restrict updates for "booked" slots (notes only)
    - Verify slot ownership
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ]* 2.4 Write property tests for slot update restrictions
    - **Property 7: Available Slot Full Editability**
    - **Property 8: Booked Slot Edit Restrictions**
    - **Validates: Requirements 2.2, 2.3, 2.4**
  
  - [x] 2.5 Implement slot deletion endpoint with status checks
    - Allow deletion of "available" slots
    - Prevent deletion of "booked" slots
    - Verify slot ownership
    - _Requirements: 2.5, 2.6_
  
  - [ ]* 2.6 Write property tests for slot deletion
    - **Property 9: Available Slot Deletion**
    - **Property 10: Booked Slot Deletion Prevention**
    - **Validates: Requirements 2.5, 2.6**
  
  - [x] 2.7 Implement slot availability toggle endpoint
    - Mark slots as available/unavailable
    - Hide unavailable slots from mentee browsing
    - Preserve slot data
    - _Requirements: 2.7, 2.8_
  
  - [x] 2.8 Implement mentor bookings query endpoint
    - Return all bookings for mentor
    - Separate upcoming and past sessions
    - Include mentee information
    - Include feedback status
    - Sort appropriately
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Backend: Mentee Slot Browsing and Booking API
  - [x] 3.1 Implement slot browsing endpoint with filtering
    - Return only "available" slots with future dates
    - Hide mentor identity (mentor_id, mentor_name)
    - Apply filters (interview_type, experience_level, date_range, company)
    - Support multiple filter conjunction (AND logic)
    - Sort by date/time ascending
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 3.2 Write property tests for slot browsing and filtering
    - **Property 12: Available Slots Visibility**
    - **Property 13: Slot Browsing Data Completeness**
    - **Property 14: Default Slot Sorting**
    - **Property 15: Single Filter Application**
    - **Property 16: Multiple Filter Conjunction**
    - **Property 17: Filter Clear Round-Trip**
    - **Validates: Requirements 4.1-4.6, 5.1-5.6**
  
  - [x] 3.3 Implement booking creation endpoint with validation
    - Verify mentee tier (paid only)
    - Check interview quota
    - Validate company selection
    - Implement slot locking for concurrent access
    - Verify slot availability
    - Create booking record
    - Update slot status to "booked"
    - Decrement mentee quota
    - Reveal mentor information in response
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 6.7, 6.8, 6.9, 18.1, 18.2, 18.3, 20.1, 20.2, 20.3_
  
  - [ ]* 3.4 Write property tests for booking creation
    - **Property 18: Company Validation**
    - **Property 19: Tier-Based Booking Access**
    - **Property 20: Slot Availability Verification**
    - **Property 21: Booking Status Transition**
    - **Property 22: Mentor Identity Revelation**
    - **Property 24: Interview Quota Management**
    - **Property 43: Single Booking Success**
    - **Property 44: Slot Lock Lifecycle**
    - **Validates: Requirements 6.1, 6.2, 6.5, 6.6, 6.7, 6.8, 6.9, 18.1-18.3, 20.1-20.3**
  
  - [x] 3.5 Implement booking cancellation endpoint
    - Verify booking ownership
    - Check 24-hour cancellation policy
    - Update slot status to "available"
    - Delete booking record
    - Restore mentee quota
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 18.4_
  
  - [ ]* 3.6 Write property tests for booking cancellation
    - **Property 25: 24-Hour Cancellation Policy**
    - **Property 26: Cancellation State Restoration**
    - **Validates: Requirements 8.1-8.4, 8.6, 18.4**
  
  - [x] 3.7 Implement mentee bookings query endpoint
    - Return all bookings for mentee
    - Separate upcoming and past sessions
    - Include mentor information and meeting links
    - Include feedback status
    - Sort appropriately
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 4. Backend: Email Notification System
  - [x] 4.1 Implement booking confirmation email function
    - Send to both mentor and mentee
    - Include appropriate details for each recipient
    - Include preparation instructions if provided
    - Generate and attach calendar invite
    - Send within 1 minute of booking
    - _Requirements: 6.10, 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 4.2 Implement cancellation notification email function
    - Send to both mentor and mentee
    - Include cancellation reason if provided
    - Include session details
    - _Requirements: 8.5_
  
  - [x] 4.3 Implement reminder email scheduling system
    - Queue reminder emails 24 hours before session
    - Include session details
    - Mentee email: include preparation tips
    - Mentor email: include mentee's topics and notes
    - Skip if session is cancelled
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [x] 4.4 Implement feedback request email system
    - Send 1 hour after session end time
    - Include direct link to feedback form
    - Include session details
    - Skip if feedback already submitted
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ]* 4.5 Write unit tests for email notification system
    - Test email content generation
    - Test timing logic
    - Test conditional sending (cancellations, feedback submitted)
    - _Requirements: 6.10, 8.5, 13.1-13.5, 14.1-14.5, 15.1-15.5_

- [x] 5. Backend: Admin Analytics and Monitoring API
  - [x] 5.1 Implement session monitoring endpoint
    - Return all bookings with filtering
    - Filter by status, mentor, mentee, date range, interview type
    - Include all booking details
    - Sort by date/time descending
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 5.2 Implement admin session cancellation endpoint
    - Update slot status to "available"
    - Delete booking record
    - Send notifications to both parties
    - _Requirements: 9.6_
  
  - [x] 5.3 Implement mentor analytics endpoint
    - Calculate total slots created per mentor
    - Calculate total slots booked per mentor
    - Calculate utilization rate
    - Calculate average rating from feedback
    - Calculate total sessions completed
    - Support date range filtering
    - Support sorting by any metric
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [ ]* 5.4 Write property tests for mentor analytics
    - **Property 36: Mentor Slot Count Accuracy**
    - **Property 37: Utilization Rate Calculation**
    - **Validates: Requirements 10.1, 10.2, 10.3**
  
  - [x] 5.5 Implement booking analytics endpoint
    - Aggregate popular time slots by day/hour
    - Count most requested interview types
    - Count most requested companies
    - Generate booking trends over time
    - Calculate average time to booking
    - Calculate cancellation rate
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  
  - [x] 5.6 Implement revenue tracking endpoint
    - Calculate total revenue by date range
    - Calculate total payouts owed
    - Calculate net profit
    - Break down revenue by pricing plan
    - Show individual mentor payout amounts
    - Support marking payouts as completed
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [ ]* 5.7 Write property tests for analytics calculations
    - **Property 38: Booking Pattern Aggregation**
    - **Property 39: Revenue Calculation Accuracy**
    - **Validates: Requirements 11.1-11.3, 12.1-12.3**

- [x] 6. Checkpoint - Backend API Complete
  - Ensure all backend tests pass
  - Verify API endpoints with Postman/curl
  - Check database indexes are created
  - Review error handling and logging
  - Ask the user if questions arise

- [x] 7. Frontend: Mentor Slot Management Interface
  - [x] 7.1 Create MentorSlotList component
    - Display all mentor's slots with status indicators
    - Show upcoming and past slots separately
    - Include quick actions (edit, delete, toggle availability)
    - _Requirements: 2.1_
  
  - [x] 7.2 Create MentorSlotForm component
    - Form for creating/editing slots
    - Validate all fields client-side
    - Support multiple interview types, experience levels, companies
    - Date/time pickers
    - Meeting link input with validation
    - Preparation notes textarea
    - _Requirements: 1.1-1.10, 2.2-2.4_
  
  - [x] 7.3 Create MentorBookingsList component
    - Display mentor's bookings
    - Separate upcoming and past sessions
    - Show mentee information
    - Show session details
    - Indicate feedback status
    - _Requirements: 3.1-3.6_
  
  - [ ]* 7.4 Write component tests for mentor interface
    - Test slot creation form validation
    - Test slot list rendering
    - Test booking list rendering
    - _Requirements: 1.1-1.10, 2.1-2.8, 3.1-3.6_

- [x] 8. Frontend: Mentee Slot Browsing and Booking Interface
  - [x] 8.1 Create SlotBrowser component
    - Display available slots in grid/list view
    - Show anonymized slot information
    - Implement real-time availability updates
    - _Requirements: 4.1-4.6_
  
  - [x] 8.2 Create SlotFilters component
    - Filter by interview type
    - Filter by experience level
    - Filter by date range
    - Filter by company
    - Clear filters button
    - _Requirements: 5.1-5.6_
  
  - [x] 8.3 Create BookingModal component
    - Company selection dropdown (from slot's specializations)
    - Interview track selection (based on company)
    - Specific topics multi-select
    - Additional notes textarea
    - Booking confirmation
    - _Requirements: 6.1-6.4_
  
  - [x] 8.4 Create MenteeBookingsList component
    - Display mentee's bookings
    - Separate upcoming and past sessions
    - Show mentor information and meeting links
    - Show session details
    - Cancellation button with policy check
    - Indicate feedback status
    - _Requirements: 7.1-7.6, 8.1-8.6_
  
  - [ ]* 8.5 Write component tests for mentee interface
    - Test slot browsing with filters
    - Test booking modal flow
    - Test cancellation confirmation
    - _Requirements: 4.1-4.6, 5.1-5.6, 6.1-6.10, 7.1-7.6, 8.1-8.6_

- [x] 9. Frontend: Admin Analytics Dashboard
  - [x] 9.1 Create SessionMonitor component
    - Display all sessions with filtering
    - Filter controls (status, mentor, mentee, date range, interview type)
    - Session details display
    - Admin cancellation action
    - _Requirements: 9.1-9.6_
  
  - [x] 9.2 Create MentorAnalytics component
    - Display mentor metrics table
    - Show slots created, booked, utilization rate
    - Show average rating and completed sessions
    - Support sorting by any column
    - Date range filter
    - _Requirements: 10.1-10.7_
  
  - [x] 9.3 Create BookingAnalytics component
    - Display popular time slots chart
    - Display interview type distribution
    - Display company demand chart
    - Display booking trends over time
    - Show cancellation rate
    - _Requirements: 11.1-11.6_
  
  - [x] 9.4 Create RevenueTracker component
    - Display revenue metrics
    - Show total revenue, payouts, net profit
    - Revenue breakdown by plan
    - Individual mentor payout table
    - Mark payouts as completed action
    - _Requirements: 12.1-12.6_
  
  - [ ]* 9.5 Write component tests for admin dashboard
    - Test session monitor filtering
    - Test analytics data rendering
    - Test revenue tracker calculations
    - _Requirements: 9.1-9.6, 10.1-10.7, 11.1-11.6, 12.1-12.6_

- [ ] 10. Checkpoint - Frontend Complete
  - Ensure all frontend tests pass
  - Verify UI/UX with manual testing
  - Check responsive design on mobile
  - Review accessibility compliance
  - Ask the user if questions arise

- [x] 11. Data Migration Scripts
  - [x] 11.1 Create migration script for booking_requests to bookings
    - Read all existing booking_requests
    - Transform to new bookings schema
    - Preserve all data (dates, times, user relationships)
    - Validate data integrity
    - _Requirements: 17.1, 17.4, 17.5_
  
  - [x] 11.2 Create migration script for mocks to bookings
    - Read all existing mocks
    - Transform to new bookings schema
    - Merge with migrated booking_requests where applicable
    - Preserve all data
    - Validate data integrity
    - _Requirements: 17.2, 17.4, 17.5_
  
  - [x] 11.3 Create migration script for time_slots to mentor_slots
    - Read all existing time_slots
    - Assign mentor_ids (use existing assignments or admin default)
    - Transform to new mentor_slots schema
    - Preserve all data
    - Validate data integrity
    - _Requirements: 17.3, 17.4, 17.5_
  
  - [x] 11.4 Create backup script
    - Backup booking_requests collection
    - Backup mocks collection
    - Backup time_slots collection
    - Store with timestamp
    - _Requirements: 17.6_
  
  - [x] 11.5 Create migration orchestration script
    - Run backup first
    - Run all migrations in order
    - Log all activities
    - Handle errors gracefully
    - Validate final state
    - _Requirements: 17.1-17.7_
  
  - [ ]* 11.6 Write tests for migration scripts
    - Test with sample data
    - Verify data preservation
    - Verify schema transformation
    - Test rollback capability
    - _Requirements: 17.1-17.7_

- [x] 12. Automated Status Updates and Scheduled Tasks
  - [x] 12.1 Implement slot status auto-completion
    - Background job to check for past sessions
    - Update slot status to "completed" when end_time passed
    - _Requirements: 16.4_
  
  - [x] 12.2 Implement reminder email scheduler
    - Background job to check for sessions 24 hours away
    - Queue reminder emails
    - _Requirements: 14.1-14.5_
  
  - [x] 12.3 Implement feedback request scheduler
    - Background job to check for completed sessions
    - Send feedback requests 1 hour after end_time
    - Check if feedback already submitted
    - _Requirements: 15.1-15.5_
  
  - [x]* 12.4 Write tests for scheduled tasks
    - Test status update logic
    - Test email scheduling logic
    - Test timing calculations
    - _Requirements: 14.1-14.5, 15.1-15.5, 16.4_

- [x] 13. Integration Testing and End-to-End Flows
  - [ ]* 13.1 Write integration tests for complete booking flow
    - Mentor creates slot
    - Mentee browses and finds slot
    - Mentee books slot
    - Verify slot status changed
    - Verify booking created
    - Verify emails sent
    - _Requirements: 1.1-1.10, 4.1-4.6, 6.1-6.10, 13.1-13.5_
  
  - [ ]* 13.2 Write integration tests for cancellation flow
    - Create booking
    - Mentee cancels booking
    - Verify slot status restored
    - Verify booking deleted
    - Verify quota restored
    - Verify emails sent
    - _Requirements: 8.1-8.6_
  
  - [ ]* 13.3 Write integration tests for concurrent booking
    - Simulate multiple mentees booking same slot
    - Verify only one succeeds
    - Verify others get appropriate error
    - _Requirements: 20.1-20.5_
  
  - [ ]* 13.4 Write integration tests for admin analytics
    - Create multiple slots and bookings
    - Query analytics endpoints
    - Verify calculations are correct
    - _Requirements: 10.1-10.7, 11.1-11.6, 12.1-12.6_

- [ ] 14. Deployment Preparation
  - [ ] 14.1 Update API documentation
    - Document all new endpoints
    - Include request/response examples
    - Document error codes
  
  - [ ] 14.2 Update environment configuration
    - Add any new environment variables
    - Update deployment scripts
    - Update systemd service files if needed
  
  - [ ] 14.3 Create deployment runbook
    - Pre-deployment checklist
    - Migration execution steps
    - Rollback procedures
    - Post-deployment verification
  
  - [ ] 14.4 Update monitoring and alerting
    - Add metrics for new endpoints
    - Set up alerts for critical errors
    - Configure logging for new features

- [ ] 15. Final Checkpoint and Deployment
  - Run full test suite (unit + property + integration)
  - Perform manual QA testing
  - Execute migration on staging environment
  - Verify all features work end-to-end
  - Deploy to production
  - Monitor for issues
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional test-related sub-tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Migration scripts preserve all historical data
- The implementation follows a backend-first approach to enable frontend development against working APIs

