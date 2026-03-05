# Requirements Document: Mentor-Controlled Slot Management

## Introduction

This feature transforms the current admin-controlled mentor assignment system into a self-service mentor slot management system. Mentors will create and manage their own availability slots with their personal Google Meet links, mentees will browse and book available slots directly, and admins will have oversight through an analytics dashboard. This change reduces administrative overhead, improves scalability, and provides mentors with autonomy over their schedules.

## Glossary

- **Mentor**: A user with role "mentor" who creates availability slots and conducts mock interviews
- **Mentee**: A user with role "mentee" who books available slots for mock interviews
- **Admin**: A user with role "admin" who has oversight of all system activities
- **Slot**: A time block created by a mentor indicating their availability for conducting interviews
- **Booking**: A confirmed reservation of a slot by a mentee for a mock interview
- **Session**: A completed mock interview between a mentor and mentee
- **Interview_Type**: The category of interview (coding, system_design, behavioral, hr_round)
- **Experience_Level**: The seniority level (junior, mid, senior, staff_plus)
- **Meeting_Link**: A Google Meet URL provided by the mentor from their own account
- **System**: The Codementee platform

## Requirements

### Requirement 1: Mentor Slot Creation

**User Story:** As a mentor, I want to create availability slots with my own Google Meet links, so that mentees can book time with me according to my schedule.

#### Acceptance Criteria

1. WHEN a mentor creates a slot, THE System SHALL require date, start time, end time, and meeting link
2. WHEN a mentor creates a slot, THE System SHALL allow selection of multiple interview types supported
3. WHEN a mentor creates a slot, THE System SHALL allow selection of multiple experience levels supported
4. WHEN a mentor creates a slot, THE System SHALL allow selection of multiple company specializations
5. WHEN a mentor creates a slot, THE System SHALL allow optional preparation notes
6. WHEN a mentor creates a slot, THE System SHALL validate that the time range is at least 30 minutes
7. WHEN a mentor creates a slot, THE System SHALL validate that the date is not in the past
8. WHEN a mentor creates a slot, THE System SHALL validate that the meeting link is a valid URL
9. WHEN a mentor creates a slot, THE System SHALL set the initial status to "available"
10. WHEN a mentor creates a slot, THE System SHALL store the mentor_id with the slot

### Requirement 2: Mentor Slot Management

**User Story:** As a mentor, I want to view, edit, and delete my availability slots, so that I can keep my schedule accurate and up-to-date.

#### Acceptance Criteria

1. WHEN a mentor views their slots, THE System SHALL display all slots they created with status indicators
2. WHEN a mentor edits an available slot, THE System SHALL allow modification of all slot fields
3. WHEN a mentor attempts to edit a booked slot, THE System SHALL prevent modification of date, time, and meeting link
4. WHEN a mentor attempts to edit a booked slot, THE System SHALL allow modification of preparation notes only
5. WHEN a mentor deletes an available slot, THE System SHALL remove the slot from the database
6. WHEN a mentor attempts to delete a booked slot, THE System SHALL prevent deletion and display an error message
7. WHEN a mentor marks a slot as unavailable, THE System SHALL hide the slot from mentee browsing while preserving the data
8. WHEN a mentor marks an unavailable slot as available, THE System SHALL make the slot visible to mentees again

### Requirement 3: Mentor Booking Visibility

**User Story:** As a mentor, I want to see my upcoming bookings and past sessions, so that I can prepare for interviews and track my activity.

#### Acceptance Criteria

1. WHEN a mentor views their bookings, THE System SHALL display all booked slots with mentee information
2. WHEN a mentor views their bookings, THE System SHALL separate upcoming sessions from past sessions
3. WHEN a mentor views a booking, THE System SHALL display mentee name, company, interview type, experience level, specific topics, and additional notes
4. WHEN a mentor views their bookings, THE System SHALL sort upcoming sessions by date and time ascending
5. WHEN a mentor views their bookings, THE System SHALL sort past sessions by date and time descending
6. WHEN a mentor views a past session, THE System SHALL display whether feedback was submitted

### Requirement 4: Mentee Slot Browsing

**User Story:** As a mentee, I want to browse all available slots across mentors without seeing mentor identities initially, so that I can find suitable interview times based on my needs.

#### Acceptance Criteria

1. WHEN a mentee browses slots, THE System SHALL display all available slots from all mentors
2. WHEN a mentee browses slots, THE System SHALL hide mentor identity information until after booking
3. WHEN a mentee browses slots, THE System SHALL display date, time, interview types, experience levels, and company specializations for each slot
4. WHEN a mentee browses slots, THE System SHALL exclude slots with status "unavailable" or "booked"
5. WHEN a mentee browses slots, THE System SHALL exclude slots with dates in the past
6. WHEN a mentee browses slots, THE System SHALL sort slots by date and time ascending by default

### Requirement 5: Mentee Slot Filtering

**User Story:** As a mentee, I want to filter available slots by interview type, experience level, date range, and company specialization, so that I can quickly find slots that match my needs.

#### Acceptance Criteria

1. WHEN a mentee applies an interview type filter, THE System SHALL display only slots supporting that interview type
2. WHEN a mentee applies an experience level filter, THE System SHALL display only slots supporting that experience level
3. WHEN a mentee applies a date range filter, THE System SHALL display only slots within that date range
4. WHEN a mentee applies a company filter, THE System SHALL display only slots with that company specialization
5. WHEN a mentee applies multiple filters, THE System SHALL display only slots matching all filter criteria
6. WHEN a mentee clears filters, THE System SHALL display all available slots again

### Requirement 6: Mentee Slot Booking

**User Story:** As a mentee, I want to book an available slot with my interview details, so that I can schedule a mock interview with a mentor.

#### Acceptance Criteria

1. WHEN a mentee books a slot, THE System SHALL require company selection from the slot's specializations
2. WHEN a mentee books a slot, THE System SHALL require interview track selection based on the company
3. WHEN a mentee books a slot, THE System SHALL allow optional specific topics selection
4. WHEN a mentee books a slot, THE System SHALL allow optional additional notes
5. WHEN a mentee books a slot, THE System SHALL verify the mentee has an active paid tier status
6. WHEN a mentee books a slot, THE System SHALL verify the slot is still available before confirming
7. WHEN a mentee books a slot, THE System SHALL update the slot status to "booked"
8. WHEN a mentee books a slot, THE System SHALL create a booking record with mentee and mentor information
9. WHEN a mentee books a slot, THE System SHALL reveal the mentor identity and meeting link to the mentee
10. WHEN a mentee books a slot, THE System SHALL send confirmation emails to both mentor and mentee

### Requirement 7: Mentee Booking Management

**User Story:** As a mentee, I want to view my upcoming bookings and past sessions, so that I can track my interview schedule and history.

#### Acceptance Criteria

1. WHEN a mentee views their bookings, THE System SHALL display all their bookings with mentor information
2. WHEN a mentee views their bookings, THE System SHALL separate upcoming sessions from past sessions
3. WHEN a mentee views a booking, THE System SHALL display mentor name, meeting link, company, interview type, date, and time
4. WHEN a mentee views their bookings, THE System SHALL sort upcoming sessions by date and time ascending
5. WHEN a mentee views their bookings, THE System SHALL sort past sessions by date and time descending
6. WHEN a mentee views a past session, THE System SHALL display whether they submitted feedback

### Requirement 8: Mentee Booking Cancellation

**User Story:** As a mentee, I want to cancel my bookings within a reasonable timeframe, so that I can adjust my schedule when needed.

#### Acceptance Criteria

1. WHEN a mentee cancels a booking more than 24 hours before the session, THE System SHALL allow the cancellation
2. WHEN a mentee attempts to cancel a booking less than 24 hours before the session, THE System SHALL prevent cancellation and display a policy message
3. WHEN a mentee cancels a booking, THE System SHALL update the slot status back to "available"
4. WHEN a mentee cancels a booking, THE System SHALL remove the booking record
5. WHEN a mentee cancels a booking, THE System SHALL send cancellation notification emails to both mentor and mentee
6. WHEN a mentee cancels a booking, THE System SHALL restore the mentee's interview quota if applicable

### Requirement 9: Admin Session Monitoring

**User Story:** As an admin, I want to view all scheduled sessions across all mentors and mentees, so that I can monitor platform activity and intervene if necessary.

#### Acceptance Criteria

1. WHEN an admin views sessions, THE System SHALL display all bookings with mentor and mentee information
2. WHEN an admin views sessions, THE System SHALL allow filtering by status (upcoming, completed, cancelled)
3. WHEN an admin views sessions, THE System SHALL allow filtering by mentor, mentee, date range, and interview type
4. WHEN an admin views sessions, THE System SHALL display booking details including company, interview type, date, time, and meeting link
5. WHEN an admin views sessions, THE System SHALL sort sessions by date and time descending by default
6. WHEN an admin cancels a session, THE System SHALL update the slot status to "available" and send notifications to both parties

### Requirement 10: Admin Mentor Analytics

**User Story:** As an admin, I want to see mentor activity metrics, so that I can understand mentor engagement and performance.

#### Acceptance Criteria

1. WHEN an admin views mentor analytics, THE System SHALL display total slots created per mentor
2. WHEN an admin views mentor analytics, THE System SHALL display total slots booked per mentor
3. WHEN an admin views mentor analytics, THE System SHALL calculate and display utilization rate (booked/created) per mentor
4. WHEN an admin views mentor analytics, THE System SHALL display average mentor rating from feedback
5. WHEN an admin views mentor analytics, THE System SHALL display total sessions completed per mentor
6. WHEN an admin views mentor analytics, THE System SHALL allow filtering by date range
7. WHEN an admin views mentor analytics, THE System SHALL allow sorting by any metric

### Requirement 11: Admin Booking Analytics

**User Story:** As an admin, I want to see booking pattern analytics, so that I can understand platform demand and optimize offerings.

#### Acceptance Criteria

1. WHEN an admin views booking analytics, THE System SHALL display most popular time slots by day of week and hour
2. WHEN an admin views booking analytics, THE System SHALL display most requested interview types with counts
3. WHEN an admin views booking analytics, THE System SHALL display most requested companies with counts
4. WHEN an admin views booking analytics, THE System SHALL display booking trends over time with a chart
5. WHEN an admin views booking analytics, THE System SHALL display average time between slot creation and booking
6. WHEN an admin views booking analytics, THE System SHALL display cancellation rate and reasons if provided

### Requirement 12: Admin Revenue Tracking

**User Story:** As an admin, I want to track revenue and mentor payouts, so that I can manage platform finances.

#### Acceptance Criteria

1. WHEN an admin views revenue tracking, THE System SHALL display total revenue from bookings by date range
2. WHEN an admin views revenue tracking, THE System SHALL display total mentor payouts owed by date range
3. WHEN an admin views revenue tracking, THE System SHALL display net profit by date range
4. WHEN an admin views revenue tracking, THE System SHALL display revenue breakdown by pricing plan
5. WHEN an admin views revenue tracking, THE System SHALL display individual mentor payout amounts
6. WHEN an admin views revenue tracking, THE System SHALL allow marking payouts as completed

### Requirement 13: Booking Confirmation Emails

**User Story:** As a user, I want to receive email notifications when bookings are confirmed, so that I have all necessary information for the session.

#### Acceptance Criteria

1. WHEN a booking is confirmed, THE System SHALL send an email to the mentee with mentor name, meeting link, date, time, company, and interview type
2. WHEN a booking is confirmed, THE System SHALL send an email to the mentor with mentee name, date, time, company, interview type, specific topics, and additional notes
3. WHEN a booking is confirmed, THE System SHALL include preparation instructions in both emails if provided by the mentor
4. WHEN a booking is confirmed, THE System SHALL include a calendar invite attachment in both emails
5. WHEN a booking is confirmed, THE System SHALL send emails within 1 minute of booking confirmation

### Requirement 14: Session Reminder Emails

**User Story:** As a user, I want to receive reminder emails before my scheduled sessions, so that I don't forget about upcoming interviews.

#### Acceptance Criteria

1. WHEN a session is scheduled 24 hours in the future, THE System SHALL send a reminder email to both mentor and mentee
2. WHEN a reminder email is sent, THE System SHALL include session details (date, time, meeting link, company, interview type)
3. WHEN a reminder email is sent to the mentee, THE System SHALL include preparation tips
4. WHEN a reminder email is sent to the mentor, THE System SHALL include mentee's specific topics and notes
5. WHEN a session is cancelled before the reminder time, THE System SHALL not send reminder emails

### Requirement 15: Post-Session Feedback Requests

**User Story:** As a user, I want to receive feedback request emails after sessions, so that I can provide and receive constructive feedback.

#### Acceptance Criteria

1. WHEN a session end time has passed, THE System SHALL send a feedback request email to the mentee within 1 hour
2. WHEN a session end time has passed, THE System SHALL send a feedback request email to the mentor within 1 hour
3. WHEN a feedback request email is sent, THE System SHALL include a direct link to the feedback form
4. WHEN a feedback request email is sent, THE System SHALL include session details for context
5. WHEN feedback has already been submitted, THE System SHALL not send additional feedback request emails

### Requirement 16: Slot Status Management

**User Story:** As the system, I want to automatically manage slot statuses, so that slot availability is always accurate.

#### Acceptance Criteria

1. WHEN a slot is created, THE System SHALL set status to "available"
2. WHEN a slot is booked, THE System SHALL set status to "booked"
3. WHEN a booking is cancelled, THE System SHALL set status back to "available"
4. WHEN a slot's end time has passed, THE System SHALL set status to "completed"
5. WHEN a mentor marks a slot as unavailable, THE System SHALL set status to "unavailable"
6. WHEN a mentor marks an unavailable slot as available again, THE System SHALL set status to "available" only if not booked or completed

### Requirement 17: Data Migration from Old System

**User Story:** As a developer, I want to migrate existing booking data to the new schema, so that historical data is preserved and the system remains functional.

#### Acceptance Criteria

1. WHEN the migration script runs, THE System SHALL convert all existing booking_requests to the new bookings schema
2. WHEN the migration script runs, THE System SHALL convert all existing mocks to the new bookings schema
3. WHEN the migration script runs, THE System SHALL convert all existing time_slots to mentor_slots with assigned mentor_ids
4. WHEN the migration script runs, THE System SHALL preserve all historical data including dates, times, and user relationships
5. WHEN the migration script runs, THE System SHALL validate data integrity after migration
6. WHEN the migration script runs, THE System SHALL create a backup of old data before migration
7. WHEN the migration script runs, THE System SHALL log all migration activities and any errors

### Requirement 18: Tier-Based Access Control

**User Story:** As the system, I want to enforce tier-based access control for booking slots, so that only paid users can book mock interviews.

#### Acceptance Criteria

1. WHEN a free tier user attempts to book a slot, THE System SHALL prevent the booking and display an upgrade message
2. WHEN a paid tier user books a slot, THE System SHALL verify their remaining interview quota
3. WHEN a paid tier user books a slot, THE System SHALL decrement their remaining interview quota
4. WHEN a paid tier user cancels a booking more than 24 hours in advance, THE System SHALL restore their interview quota
5. WHEN a paid tier user's plan expires, THE System SHALL prevent new bookings until renewal

### Requirement 19: Meeting Link Validation

**User Story:** As the system, I want to validate meeting links provided by mentors, so that mentees receive working meeting links.

#### Acceptance Criteria

1. WHEN a mentor provides a meeting link, THE System SHALL validate it is a properly formatted URL
2. WHEN a mentor provides a meeting link, THE System SHALL accept Google Meet, Zoom, and Microsoft Teams URLs
3. WHEN a mentor provides an invalid meeting link, THE System SHALL display a validation error
4. WHEN a mentor saves a slot with a meeting link, THE System SHALL store the link securely
5. WHEN a mentee books a slot, THE System SHALL provide the meeting link in the confirmation email

### Requirement 20: Concurrent Booking Prevention

**User Story:** As the system, I want to prevent concurrent bookings of the same slot, so that double-booking does not occur.

#### Acceptance Criteria

1. WHEN multiple mentees attempt to book the same slot simultaneously, THE System SHALL allow only the first booking to succeed
2. WHEN a booking transaction begins, THE System SHALL lock the slot record
3. WHEN a booking transaction completes, THE System SHALL release the slot lock
4. WHEN a booking fails due to concurrent access, THE System SHALL display a message that the slot is no longer available
5. WHEN a booking fails due to concurrent access, THE System SHALL refresh the available slots list for the mentee
