# Design Document: Mentor-Controlled Slot Management

## Overview

This design transforms the current admin-controlled mentor assignment system into a self-service mentor slot management system. The new architecture empowers mentors to create and manage their own availability slots with personal Google Meet links, enables mentees to browse and book slots directly, and provides admins with comprehensive oversight through analytics dashboards.

### Key Design Principles

1. **Mentor Autonomy**: Mentors control their schedules without admin intervention
2. **Mentee Self-Service**: Mentees can browse and book slots independently
3. **Admin Oversight**: Admins maintain visibility and control through analytics
4. **Scalability**: System scales naturally as more mentors join
5. **Data Integrity**: Robust validation and concurrent access handling

### System Transformation

**Current System (Admin-Controlled)**:
- Admin creates generic time slots
- Mentees submit booking requests
- Admin manually assigns mentors
- Admin confirms bookings and sends emails

**New System (Mentor-Controlled)**:
- Mentors create their own slots with meeting links
- Mentees browse available slots (anonymized)
- Mentees book slots directly
- System automatically confirms and sends emails
- Admin monitors through analytics dashboard

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├──────────────────┬──────────────────┬──────────────────────┤
│  Mentor Portal   │  Mentee Portal   │   Admin Dashboard    │
│  - Slot CRUD     │  - Browse Slots  │   - Analytics        │
│  - View Bookings │  - Book Slots    │   - Session Monitor  │
│                  │  - Cancel        │   - Revenue Track    │
└──────────────────┴──────────────────┴──────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (FastAPI)                       │
├──────────────────┬──────────────────┬──────────────────────┤
│  Mentor Routes   │  Mentee Routes   │   Admin Routes       │
│  /mentor/slots   │  /mentee/slots   │   /admin/analytics   │
│  /mentor/bookings│  /mentee/bookings│   /admin/sessions    │
└──────────────────┴──────────────────┴──────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Collections                         │
│  - mentor_slots (replaces time_slots)                       │
│  - bookings (replaces booking_requests + mocks)             │
│  - users (existing)                                          │
│  - feedbacks (existing)                                      │
│  - pricing_plans (existing)                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  - Resend (Email notifications)                             │
│  - Razorpay (Payment processing)                            │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**Mentor Slot Creation Flow**:
```
Mentor → Create Slot Request → Validation → Store in mentor_slots → Success Response
```

**Mentee Booking Flow**:
```
Mentee → Browse Slots → Select Slot → Booking Request → 
Tier Validation → Slot Availability Check → Transaction Lock →
Create Booking → Update Slot Status → Send Emails → Success Response
```

**Admin Analytics Flow**:
```
Admin → Request Analytics → Aggregate Data → Calculate Metrics → Return Dashboard Data
```


## Components and Interfaces

### Backend Components

#### 1. Mentor Slot Management Service

**Responsibilities**:
- Create, read, update, delete mentor slots
- Validate slot data (time ranges, dates, URLs)
- Manage slot status transitions
- Filter slots by mentor

**Key Functions**:
```python
async def create_mentor_slot(mentor_id: str, slot_data: MentorSlotCreate) -> MentorSlot:
    """Create a new availability slot for a mentor"""
    # Validate time range (minimum 30 minutes)
    # Validate date is not in the past
    # Validate meeting link URL
    # Set initial status to "available"
    # Store mentor_id with slot
    
async def update_mentor_slot(slot_id: str, mentor_id: str, updates: MentorSlotUpdate) -> MentorSlot:
    """Update an existing slot (with restrictions for booked slots)"""
    # Check slot ownership
    # If booked, only allow notes updates
    # If available, allow all field updates
    
async def delete_mentor_slot(slot_id: str, mentor_id: str) -> bool:
    """Delete a slot (only if not booked)"""
    # Check slot ownership
    # Prevent deletion if status is "booked"
    
async def get_mentor_slots(mentor_id: str, status_filter: Optional[str] = None) -> List[MentorSlot]:
    """Get all slots for a mentor with optional status filtering"""
    
async def toggle_slot_availability(slot_id: str, mentor_id: str, available: bool) -> MentorSlot:
    """Mark slot as available/unavailable"""
```

#### 2. Mentee Booking Service

**Responsibilities**:
- Browse available slots (with filtering)
- Create bookings with validation
- Cancel bookings (with time restrictions)
- Manage mentee booking history

**Key Functions**:
```python
async def browse_available_slots(filters: SlotFilters) -> List[AnonymizedSlot]:
    """Get available slots with mentor identity hidden"""
    # Filter by status = "available"
    # Exclude past dates
    # Apply interview type, experience level, date range, company filters
    # Hide mentor_id and mentor_name
    # Sort by date/time ascending
    
async def book_slot(mentee_id: str, slot_id: str, booking_details: BookingDetails) -> Booking:
    """Book an available slot"""
    # Verify mentee tier (paid only)
    # Check interview quota
    # Lock slot for transaction
    # Verify slot still available
    # Validate company is in slot's specializations
    # Create booking record
    # Update slot status to "booked"
    # Decrement mentee quota
    # Send confirmation emails
    # Release lock
    
async def cancel_booking(booking_id: str, mentee_id: str) -> bool:
    """Cancel a booking (if more than 24 hours before session)"""
    # Verify booking ownership
    # Check 24-hour cancellation policy
    # Update slot status to "available"
    # Delete booking record
    # Restore mentee quota
    # Send cancellation emails
    
async def get_mentee_bookings(mentee_id: str) -> Dict[str, List[Booking]]:
    """Get mentee's bookings separated by upcoming/past"""
    # Query bookings by mentee_id
    # Separate by date (upcoming vs past)
    # Include mentor information
    # Include feedback status for past sessions
```

#### 3. Admin Analytics Service

**Responsibilities**:
- Aggregate session data
- Calculate mentor metrics
- Track booking patterns
- Manage revenue and payouts

**Key Functions**:
```python
async def get_all_sessions(filters: SessionFilters) -> List[Booking]:
    """Get all bookings with filtering"""
    # Filter by status, mentor, mentee, date range, interview type
    # Sort by date/time descending
    # Include all booking details
    
async def get_mentor_analytics(date_range: Optional[DateRange] = None) -> List[MentorMetrics]:
    """Calculate metrics for each mentor"""
    # Total slots created
    # Total slots booked
    # Utilization rate (booked/created)
    # Average rating from feedback
    # Total sessions completed
    # Allow sorting by any metric
    
async def get_booking_analytics(date_range: Optional[DateRange] = None) -> BookingAnalytics:
    """Aggregate booking pattern data"""
    # Most popular time slots (day of week, hour)
    # Most requested interview types
    # Most requested companies
    # Booking trends over time
    # Average time from slot creation to booking
    # Cancellation rate
    
async def get_revenue_tracking(date_range: Optional[DateRange] = None) -> RevenueMetrics:
    """Calculate revenue and payout metrics"""
    # Total revenue from bookings
    # Total mentor payouts owed
    # Net profit
    # Revenue by pricing plan
    # Individual mentor payout amounts
    
async def cancel_session_as_admin(booking_id: str, admin_id: str) -> bool:
    """Admin cancels a session"""
    # Update slot status to "available"
    # Delete booking record
    # Send notifications to both parties
```

#### 4. Email Notification Service

**Responsibilities**:
- Send booking confirmation emails
- Send reminder emails (24 hours before)
- Send feedback request emails (after session)
- Send cancellation notifications

**Key Functions**:
```python
async def send_booking_confirmation(booking: Booking) -> bool:
    """Send confirmation emails to mentor and mentee"""
    # Mentee email: includes mentor name, meeting link, session details
    # Mentor email: includes mentee name, topics, notes, session details
    # Include preparation instructions if provided
    # Attach calendar invite
    # Send within 1 minute
    
async def send_reminder_emails(booking: Booking) -> bool:
    """Send reminder 24 hours before session"""
    # Check if session is cancelled
    # Mentee email: includes preparation tips
    # Mentor email: includes mentee's topics and notes
    # Include all session details
    
async def send_feedback_requests(booking: Booking) -> bool:
    """Send feedback requests after session ends"""
    # Wait 1 hour after session end time
    # Check if feedback already submitted
    # Include direct link to feedback form
    # Include session details for context
    
async def send_cancellation_notifications(booking: Booking, cancelled_by: str) -> bool:
    """Send cancellation emails to both parties"""
    # Include cancellation reason if provided
    # Include session details
```

#### 5. Concurrent Access Handler

**Responsibilities**:
- Prevent double-booking through database locks
- Handle race conditions gracefully
- Provide clear error messages

**Key Functions**:
```python
async def acquire_slot_lock(slot_id: str) -> bool:
    """Acquire exclusive lock on slot for booking transaction"""
    # Use MongoDB findAndModify with atomic operations
    # Set lock flag with timestamp
    # Return success/failure
    
async def release_slot_lock(slot_id: str) -> bool:
    """Release slot lock after transaction"""
    # Clear lock flag
    # Update timestamp
    
async def handle_concurrent_booking_failure(mentee_id: str, slot_id: str) -> Dict:
    """Handle failed booking due to concurrent access"""
    # Return error message
    # Refresh available slots list
    # Suggest alternative slots
```

### Frontend Components

#### 1. Mentor Slot Management Interface

**Components**:
- `MentorSlotList`: Display all mentor's slots with status indicators
- `MentorSlotForm`: Create/edit slot form with validation
- `MentorSlotCard`: Individual slot display with actions
- `MentorBookingsList`: View upcoming and past bookings

**Key Features**:
- Visual calendar view of slots
- Quick actions (edit, delete, toggle availability)
- Booking details with mentee information
- Preparation notes management

#### 2. Mentee Slot Browsing Interface

**Components**:
- `SlotBrowser`: Main browsing interface with filters
- `SlotFilters`: Filter panel (interview type, experience, date, company)
- `SlotCard`: Anonymized slot display
- `BookingModal`: Booking form with company/track selection
- `MenteeBookingsList`: View bookings with mentor details

**Key Features**:
- Real-time slot availability
- Advanced filtering
- Clear booking flow
- Cancellation with policy enforcement

#### 3. Admin Analytics Dashboard

**Components**:
- `SessionMonitor`: All sessions with filtering
- `MentorAnalytics`: Mentor performance metrics
- `BookingAnalytics`: Booking pattern visualizations
- `RevenueTracker`: Financial metrics and payout management

**Key Features**:
- Interactive charts and graphs
- Export functionality
- Real-time updates
- Drill-down capabilities


## Data Models

### MongoDB Collections

#### 1. mentor_slots Collection (NEW - replaces time_slots)

```python
{
  "id": "uuid",
  "mentor_id": "uuid",  # Owner of the slot
  "mentor_name": "string",  # Cached for queries
  "mentor_email": "string",  # Cached for notifications
  
  # Time and availability
  "date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "status": "available|booked|unavailable|completed",
  
  # Meeting information
  "meeting_link": "https://meet.google.com/...",  # Mentor's own link
  
  # Capabilities
  "interview_types": ["coding", "system_design", "behavioral", "hr_round"],
  "experience_levels": ["junior", "mid", "senior", "staff_plus"],
  "company_specializations": ["uuid1", "uuid2"],  # Company IDs
  
  # Optional information
  "preparation_notes": "string|null",  # Instructions for mentees
  
  # Metadata
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes**:
- `mentor_id` (for mentor queries)
- `status` (for availability filtering)
- `date` (for date range queries)
- Compound: `status + date` (for mentee browsing)

#### 2. bookings Collection (NEW - replaces booking_requests + mocks)

```python
{
  "id": "uuid",
  
  # Slot reference
  "slot_id": "uuid",  # Reference to mentor_slots
  
  # Participants
  "mentee_id": "uuid",
  "mentee_name": "string",
  "mentee_email": "string",
  "mentor_id": "uuid",
  "mentor_name": "string",
  "mentor_email": "string",
  
  # Session details
  "company_id": "uuid",
  "company_name": "string",
  "interview_type": "coding|system_design|behavioral|hr_round",
  "experience_level": "junior|mid|senior|staff_plus",
  "interview_track": "sde2|l4|e3|general",
  
  # Mentee preferences
  "specific_topics": ["Arrays & Strings", "Dynamic Programming"],
  "additional_notes": "string",
  
  # Scheduling
  "date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "meeting_link": "https://meet.google.com/...",
  
  # Status tracking
  "status": "confirmed|completed|cancelled",
  "cancelled_by": "mentee_id|mentor_id|admin_id|null",
  "cancellation_reason": "string|null",
  
  # Feedback tracking
  "feedback_submitted": false,
  "feedback_id": "uuid|null",
  
  # Metadata
  "created_at": "datetime",
  "confirmed_at": "datetime",
  "completed_at": "datetime|null",
  "cancelled_at": "datetime|null"
}
```

**Indexes**:
- `mentee_id` (for mentee queries)
- `mentor_id` (for mentor queries)
- `status` (for filtering)
- `date` (for date range queries)
- Compound: `mentee_id + status` (for mentee dashboard)
- Compound: `mentor_id + status` (for mentor dashboard)

#### 3. users Collection (EXISTING - minor updates)

```python
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "password": "hashed_string",
  "role": "admin|mentor|mentee",
  
  # Tier information (for mentees)
  "status": "Free|Active|Paused",
  "plan_id": "foundation|growth|accelerator|null",
  "plan_name": "string",
  
  # Quota tracking (for mentees)
  "interview_quota_remaining": 3,  # NEW: Track remaining interviews
  "interview_quota_total": 3,  # NEW: Total interviews in plan
  
  # Mentor information (for mentors)
  "mentor_specializations": ["System Design", "Algorithms"],  # NEW
  "mentor_companies": ["Amazon", "Google"],  # NEW
  "mentor_bio": "string",  # NEW
  
  # Metadata
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### 4. feedbacks Collection (EXISTING - no changes)

```python
{
  "id": "uuid",
  "booking_id": "uuid",  # Reference to bookings (was mock_id)
  "mentor_id": "uuid",
  "mentee_id": "uuid",
  
  # Ratings
  "problem_solving": 1-5,
  "communication": 1-5,
  "technical_depth": 1-5,
  "code_quality": 1-5,
  "overall": 1-5,
  
  # Feedback content
  "strengths": "string",
  "improvements": "string",
  "hireability": "Strong Hire|Hire|Lean No Hire|No Hire",
  "action_items": "string",
  
  # Metadata
  "created_at": "datetime"
}
```

#### 5. companies Collection (EXISTING - no changes)

```python
{
  "id": "uuid",
  "name": "string",
  "logo_url": "string",
  "description": "string",
  "category": "product|unicorn|startup|service",
  "interview_tracks": ["sde", "sde2", "senior_sde", "principal"],
  "difficulty_levels": ["junior", "mid", "senior", "staff_plus"],
  "created_at": "datetime"
}
```

### API Request/Response Models

#### Mentor Slot Models

```python
class MentorSlotCreate(BaseModel):
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    meeting_link: str
    interview_types: List[str]
    experience_levels: List[str]
    company_specializations: List[str]  # Company IDs
    preparation_notes: Optional[str] = None

class MentorSlotUpdate(BaseModel):
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    meeting_link: Optional[str] = None
    interview_types: Optional[List[str]] = None
    experience_levels: Optional[List[str]] = None
    company_specializations: Optional[List[str]] = None
    preparation_notes: Optional[str] = None

class MentorSlotResponse(BaseModel):
    id: str
    mentor_id: str
    date: str
    start_time: str
    end_time: str
    meeting_link: str
    status: str
    interview_types: List[str]
    experience_levels: List[str]
    company_specializations: List[str]
    preparation_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
```

#### Mentee Booking Models

```python
class SlotFilters(BaseModel):
    interview_type: Optional[str] = None
    experience_level: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    company_id: Optional[str] = None

class AnonymizedSlot(BaseModel):
    id: str
    date: str
    start_time: str
    end_time: str
    interview_types: List[str]
    experience_levels: List[str]
    company_specializations: List[str]
    # Note: mentor_id and mentor_name are excluded

class BookingCreate(BaseModel):
    slot_id: str
    company_id: str
    interview_track: str
    specific_topics: Optional[List[str]] = []
    additional_notes: Optional[str] = ""

class BookingResponse(BaseModel):
    id: str
    slot_id: str
    mentee_id: str
    mentor_id: str
    mentor_name: str  # Revealed after booking
    mentor_email: str  # Revealed after booking
    company_name: str
    interview_type: str
    experience_level: str
    date: str
    start_time: str
    end_time: str
    meeting_link: str  # Revealed after booking
    status: str
    created_at: datetime
```

#### Admin Analytics Models

```python
class MentorMetrics(BaseModel):
    mentor_id: str
    mentor_name: str
    total_slots_created: int
    total_slots_booked: int
    utilization_rate: float  # booked/created
    average_rating: float
    total_sessions_completed: int

class BookingAnalytics(BaseModel):
    popular_time_slots: Dict[str, int]  # "Monday 10:00": count
    interview_type_counts: Dict[str, int]
    company_counts: Dict[str, int]
    booking_trends: List[Dict]  # Time series data
    avg_time_to_booking: float  # Hours
    cancellation_rate: float

class RevenueMetrics(BaseModel):
    total_revenue: float
    total_payouts_owed: float
    net_profit: float
    revenue_by_plan: Dict[str, float]
    mentor_payouts: List[Dict]  # Per-mentor breakdown
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Slot Creation and Validation Properties

**Property 1: Required Fields Validation**
*For any* slot creation request, if any required field (date, start_time, end_time, meeting_link) is missing, the system should reject the request with a validation error.
**Validates: Requirements 1.1**

**Property 2: Minimum Time Range Validation**
*For any* slot creation request, if the time range between start_time and end_time is less than 30 minutes, the system should reject the request.
**Validates: Requirements 1.6**

**Property 3: Past Date Rejection**
*For any* slot creation request, if the date is in the past, the system should reject the request.
**Validates: Requirements 1.7**

**Property 4: Meeting Link URL Validation**
*For any* slot creation request, if the meeting_link is not a valid URL format (Google Meet, Zoom, or Microsoft Teams), the system should reject the request.
**Validates: Requirements 1.8, 19.2, 19.3**

**Property 5: Initial Slot Status**
*For any* successfully created slot, the status field should be set to "available" and the mentor_id should match the creating mentor.
**Validates: Requirements 1.9, 1.10**

**Property 6: Multi-Value Field Storage**
*For any* slot creation with multiple interview_types, experience_levels, or company_specializations, all provided values should be stored in the slot record.
**Validates: Requirements 1.2, 1.3, 1.4**

### Slot Management Properties

**Property 7: Available Slot Full Editability**
*For any* slot with status "available", all fields (date, time, meeting_link, types, levels, companies, notes) should be modifiable by the owning mentor.
**Validates: Requirements 2.2**

**Property 8: Booked Slot Edit Restrictions**
*For any* slot with status "booked", only the preparation_notes field should be modifiable; attempts to modify date, time, or meeting_link should be rejected.
**Validates: Requirements 2.3, 2.4**

**Property 9: Available Slot Deletion**
*For any* slot with status "available", the owning mentor should be able to delete it, and it should be removed from the database.
**Validates: Requirements 2.5**

**Property 10: Booked Slot Deletion Prevention**
*For any* slot with status "booked", deletion attempts should be rejected with an error message.
**Validates: Requirements 2.6**

**Property 11: Slot Visibility Toggle**
*For any* slot, marking it as unavailable should hide it from mentee browsing queries while preserving all slot data, and marking it available again should restore visibility.
**Validates: Requirements 2.7, 2.8**

### Mentee Browsing Properties

**Property 12: Available Slots Visibility**
*For any* mentee browsing request, only slots with status "available" and date not in the past should be returned, with mentor_id and mentor_name excluded from the response.
**Validates: Requirements 4.1, 4.2, 4.4, 4.5**

**Property 13: Slot Browsing Data Completeness**
*For any* slot returned in mentee browsing, the response should include date, start_time, end_time, interview_types, experience_levels, and company_specializations.
**Validates: Requirements 4.3**

**Property 14: Default Slot Sorting**
*For any* mentee browsing request without explicit sorting, slots should be sorted by date ascending, then by start_time ascending.
**Validates: Requirements 4.6**

### Filtering Properties

**Property 15: Single Filter Application**
*For any* mentee browsing request with a single filter (interview_type, experience_level, date_range, or company), only slots matching that filter criterion should be returned.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

**Property 16: Multiple Filter Conjunction**
*For any* mentee browsing request with multiple filters, only slots matching ALL filter criteria should be returned (AND logic, not OR).
**Validates: Requirements 5.5**

**Property 17: Filter Clear Round-Trip**
*For any* mentee browsing session, applying filters then clearing them should return the same set of slots as the initial unfiltered query.
**Validates: Requirements 5.6**

### Booking Creation Properties

**Property 18: Company Validation**
*For any* booking request, the selected company_id must be present in the slot's company_specializations list, otherwise the booking should be rejected.
**Validates: Requirements 6.1**

**Property 19: Tier-Based Booking Access**
*For any* booking request from a user with status "Free" or no plan_id, the booking should be rejected with an upgrade message.
**Validates: Requirements 6.5, 18.1**

**Property 20: Slot Availability Verification**
*For any* booking request, the slot's status must be "available" at the time of booking confirmation, otherwise the booking should fail with an appropriate error.
**Validates: Requirements 6.6**

**Property 21: Booking Status Transition**
*For any* successful booking, the slot status should transition from "available" to "booked", and a booking record should be created with both mentee and mentor information.
**Validates: Requirements 6.7, 6.8**

**Property 22: Mentor Identity Revelation**
*For any* successful booking, the response should include mentor_name, mentor_email, and meeting_link that were previously hidden during browsing.
**Validates: Requirements 6.9**

**Property 23: Booking Confirmation Emails**
*For any* successful booking, confirmation emails should be sent to both mentor and mentee within 1 minute, with appropriate details for each recipient.
**Validates: Requirements 6.10, 13.1, 13.2, 13.5**

**Property 24: Interview Quota Management**
*For any* successful booking by a paid user, their interview_quota_remaining should be decremented by 1.
**Validates: Requirements 18.2, 18.3**

### Booking Cancellation Properties

**Property 25: 24-Hour Cancellation Policy**
*For any* booking cancellation request, if the session date/time is more than 24 hours in the future, the cancellation should succeed; if less than 24 hours, it should be rejected.
**Validates: Requirements 8.1, 8.2**

**Property 26: Cancellation State Restoration**
*For any* successful cancellation, the slot status should transition from "booked" back to "available", the booking record should be deleted, and the mentee's interview_quota_remaining should be incremented by 1.
**Validates: Requirements 8.3, 8.4, 8.6, 18.4**

**Property 27: Cancellation Notifications**
*For any* successful cancellation, notification emails should be sent to both mentor and mentee.
**Validates: Requirements 8.5**

### Booking Query Properties

**Property 28: Mentor Booking Completeness**
*For any* mentor querying their bookings, all bookings where mentor_id matches should be returned with complete mentee information.
**Validates: Requirements 3.1**

**Property 29: Mentee Booking Completeness**
*For any* mentee querying their bookings, all bookings where mentee_id matches should be returned with complete mentor information and meeting links.
**Validates: Requirements 7.1**

**Property 30: Booking Temporal Separation**
*For any* user querying their bookings, sessions should be separated into "upcoming" (date/time in future) and "past" (date/time in past) categories.
**Validates: Requirements 3.2, 7.2**

**Property 31: Upcoming Bookings Sort Order**
*For any* list of upcoming bookings, they should be sorted by date ascending, then by start_time ascending.
**Validates: Requirements 3.4, 7.4**

**Property 32: Past Bookings Sort Order**
*For any* list of past bookings, they should be sorted by date descending, then by start_time descending.
**Validates: Requirements 3.5, 7.5**

**Property 33: Feedback Status Inclusion**
*For any* past booking, the response should include whether feedback has been submitted (feedback_submitted field).
**Validates: Requirements 3.6, 7.6**

### Admin Analytics Properties

**Property 34: Session Query Completeness**
*For any* admin session query, all bookings matching the filter criteria should be returned with both mentor and mentee information.
**Validates: Requirements 9.1**

**Property 35: Admin Filter Application**
*For any* admin session query with filters (status, mentor_id, mentee_id, date_range, interview_type), only bookings matching all specified filters should be returned.
**Validates: Requirements 9.2, 9.3**

**Property 36: Mentor Slot Count Accuracy**
*For any* mentor in the analytics, total_slots_created should equal the count of all slots where mentor_id matches, and total_slots_booked should equal the count of slots with status "booked".
**Validates: Requirements 10.1, 10.2**

**Property 37: Utilization Rate Calculation**
*For any* mentor with at least one created slot, utilization_rate should equal total_slots_booked divided by total_slots_created.
**Validates: Requirements 10.3**

**Property 38: Booking Pattern Aggregation**
*For any* booking analytics query, counts should accurately reflect the number of bookings grouped by time slot, interview type, and company.
**Validates: Requirements 11.1, 11.2, 11.3**

**Property 39: Revenue Calculation Accuracy**
*For any* revenue tracking query, total_revenue should equal the sum of all paid order amounts, and net_profit should equal total_revenue minus total_payouts_owed.
**Validates: Requirements 12.1, 12.2, 12.3**

### Email Notification Properties

**Property 40: Confirmation Email Content**
*For any* booking confirmation email, the mentee email should include mentor_name and meeting_link, while the mentor email should include mentee_name, specific_topics, and additional_notes.
**Validates: Requirements 13.1, 13.2**

**Property 41: Reminder Email Timing**
*For any* booking scheduled more than 24 hours in the future, reminder emails should be queued to send 24 hours before the session start time, unless the booking is cancelled.
**Validates: Requirements 14.1, 14.5**

**Property 42: Feedback Request Timing**
*For any* completed booking, feedback request emails should be sent to both mentor and mentee within 1 hour after the session end time, but only if feedback has not already been submitted.
**Validates: Requirements 15.1, 15.2, 15.5**

### Concurrent Access Properties

**Property 43: Single Booking Success**
*For any* set of concurrent booking requests for the same slot, at most one booking should succeed, and all others should receive a "slot no longer available" error.
**Validates: Requirements 20.1, 20.4**

**Property 44: Slot Lock Lifecycle**
*For any* booking transaction, a slot lock should be acquired before checking availability, and released after the transaction completes (success or failure).
**Validates: Requirements 20.2, 20.3**

### Status Transition Properties

**Property 45: Automatic Completion Status**
*For any* booking where the end_time has passed, the slot status should automatically transition to "completed".
**Validates: Requirements 16.4**

**Property 46: Conditional Availability Restoration**
*For any* slot marked as unavailable, marking it available again should only succeed if the current status is "unavailable" (not "booked" or "completed").
**Validates: Requirements 16.6**

**Property 47: Plan Expiration Enforcement**
*For any* user whose plan has expired (based on plan duration and purchase date), booking attempts should be rejected until plan renewal.
**Validates: Requirements 18.5**


## Error Handling

### Error Categories and Responses

#### 1. Validation Errors (400 Bad Request)

**Slot Creation Validation**:
```python
{
  "error": "validation_error",
  "message": "Time range must be at least 30 minutes",
  "field": "start_time, end_time",
  "code": "INVALID_TIME_RANGE"
}
```

**Booking Validation**:
```python
{
  "error": "validation_error",
  "message": "Selected company is not in slot's specializations",
  "field": "company_id",
  "code": "INVALID_COMPANY_SELECTION"
}
```

#### 2. Authorization Errors (403 Forbidden)

**Tier Restriction**:
```python
{
  "error": "authorization_error",
  "message": "Upgrade to a paid plan to book mock interviews",
  "code": "TIER_UPGRADE_REQUIRED",
  "upgrade_url": "/mentee/book"
}
```

**Ownership Violation**:
```python
{
  "error": "authorization_error",
  "message": "You can only modify your own slots",
  "code": "SLOT_OWNERSHIP_REQUIRED"
}
```

#### 3. Resource Not Found (404 Not Found)

```python
{
  "error": "not_found",
  "message": "Slot not found or no longer available",
  "code": "SLOT_NOT_FOUND"
}
```

#### 4. Conflict Errors (409 Conflict)

**Concurrent Booking**:
```python
{
  "error": "conflict",
  "message": "This slot has just been booked by another user",
  "code": "SLOT_ALREADY_BOOKED",
  "suggested_slots": [...]  # Alternative available slots
}
```

**Status Conflict**:
```python
{
  "error": "conflict",
  "message": "Cannot delete a booked slot",
  "code": "SLOT_STATUS_CONFLICT"
}
```

#### 5. Business Logic Errors (422 Unprocessable Entity)

**Cancellation Policy**:
```python
{
  "error": "policy_violation",
  "message": "Bookings can only be cancelled more than 24 hours in advance",
  "code": "CANCELLATION_POLICY_VIOLATION",
  "hours_until_session": 18
}
```

**Quota Exceeded**:
```python
{
  "error": "quota_exceeded",
  "message": "You have used all interviews in your plan",
  "code": "INTERVIEW_QUOTA_EXCEEDED",
  "remaining_quota": 0,
  "upgrade_url": "/mentee/book"
}
```

### Error Handling Patterns

#### Backend Error Handling

```python
# Validation errors
try:
    validate_slot_time_range(start_time, end_time)
except ValidationError as e:
    raise HTTPException(
        status_code=400,
        detail={
            "error": "validation_error",
            "message": str(e),
            "code": "INVALID_TIME_RANGE"
        }
    )

# Concurrent access handling
try:
    async with slot_lock(slot_id):
        # Booking logic
        pass
except SlotAlreadyBookedError:
    suggested_slots = await get_similar_available_slots(slot_id)
    raise HTTPException(
        status_code=409,
        detail={
            "error": "conflict",
            "message": "Slot already booked",
            "code": "SLOT_ALREADY_BOOKED",
            "suggested_slots": suggested_slots
        }
    )

# Tier validation
if user["status"] == "Free" or not user.get("plan_id"):
    raise HTTPException(
        status_code=403,
        detail={
            "error": "authorization_error",
            "message": "Upgrade required",
            "code": "TIER_UPGRADE_REQUIRED",
            "upgrade_url": "/mentee/book"
        }
    )
```

#### Frontend Error Handling

```javascript
// Graceful error display
try {
  await api.post('/mentee/bookings', bookingData);
  toast.success('Booking confirmed!');
} catch (error) {
  const errorData = error.response?.data;
  
  if (errorData?.code === 'TIER_UPGRADE_REQUIRED') {
    // Show upgrade modal
    showUpgradeModal();
  } else if (errorData?.code === 'SLOT_ALREADY_BOOKED') {
    // Show alternative slots
    setSuggestedSlots(errorData.suggested_slots);
    toast.error('Slot just booked. Here are alternatives.');
  } else if (errorData?.code === 'CANCELLATION_POLICY_VIOLATION') {
    // Show policy explanation
    toast.error(`Cannot cancel: ${errorData.message}`);
  } else {
    // Generic error
    toast.error(errorData?.message || 'An error occurred');
  }
}
```

### Logging and Monitoring

**Critical Events to Log**:
- Slot creation/modification/deletion
- Booking creation/cancellation
- Concurrent booking conflicts
- Tier validation failures
- Email sending failures
- Database transaction failures

**Log Format**:
```python
logger.info(
    "booking_created",
    extra={
        "booking_id": booking_id,
        "mentee_id": mentee_id,
        "mentor_id": mentor_id,
        "slot_id": slot_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
)
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Property-Based Testing Configuration

**Testing Library**: Use `hypothesis` for Python backend testing

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `# Feature: mentor-controlled-slot-management, Property {number}: {property_text}`

**Example Property Test**:
```python
from hypothesis import given, strategies as st
import pytest

@given(
    date=st.dates(min_value=date.today()),
    start_time=st.times(),
    duration_minutes=st.integers(min_value=1, max_value=120)
)
@pytest.mark.property_test
def test_minimum_time_range_validation(date, start_time, duration_minutes):
    """
    Feature: mentor-controlled-slot-management
    Property 2: Minimum Time Range Validation
    
    For any slot creation request, if the time range is less than 30 minutes,
    the system should reject the request.
    """
    end_time = (datetime.combine(date, start_time) + 
                timedelta(minutes=duration_minutes)).time()
    
    slot_data = {
        "date": date.isoformat(),
        "start_time": start_time.strftime("%H:%M"),
        "end_time": end_time.strftime("%H:%M"),
        "meeting_link": "https://meet.google.com/abc-defg-hij",
        "interview_types": ["coding"],
        "experience_levels": ["mid"],
        "company_specializations": ["company-uuid"]
    }
    
    if duration_minutes < 30:
        # Should be rejected
        with pytest.raises(ValidationError):
            validate_slot_creation(slot_data)
    else:
        # Should be accepted
        result = validate_slot_creation(slot_data)
        assert result is not None
```

### Unit Testing Patterns

**Slot Creation Tests**:
```python
def test_create_slot_with_valid_data():
    """Test successful slot creation with all valid fields"""
    # Specific example test
    
def test_create_slot_with_past_date():
    """Test rejection of slot with past date"""
    # Edge case test
    
def test_create_slot_with_invalid_url():
    """Test rejection of invalid meeting link"""
    # Error condition test
```

**Booking Flow Tests**:
```python
def test_book_available_slot_as_paid_user():
    """Test successful booking by paid user"""
    
def test_book_slot_as_free_user():
    """Test rejection of booking by free user"""
    
def test_concurrent_booking_prevention():
    """Test that only one of two concurrent bookings succeeds"""
```

**Cancellation Tests**:
```python
def test_cancel_booking_more_than_24_hours():
    """Test successful cancellation with >24h notice"""
    
def test_cancel_booking_less_than_24_hours():
    """Test rejection of cancellation with <24h notice"""
    
def test_quota_restoration_on_cancellation():
    """Test that quota is restored after cancellation"""
```

### Integration Testing

**End-to-End Flows**:
1. Mentor creates slot → Mentee browses → Mentee books → Emails sent → Session completed → Feedback submitted
2. Mentor creates slot → Mentee books → Mentee cancels → Slot becomes available again
3. Multiple mentors create slots → Mentee filters → Mentee books → Admin views analytics

**API Integration Tests**:
```python
async def test_complete_booking_flow():
    """Test complete flow from slot creation to booking confirmation"""
    # Create mentor and mentee users
    # Mentor creates slot
    # Mentee browses slots
    # Mentee books slot
    # Verify slot status changed
    # Verify booking record created
    # Verify emails sent
```

### Frontend Testing

**Component Tests**:
- Slot creation form validation
- Slot browsing with filters
- Booking modal flow
- Cancellation confirmation dialog

**Integration Tests**:
- Complete mentor slot management workflow
- Complete mentee booking workflow
- Admin analytics dashboard data loading

### Migration Testing

**Data Migration Tests**:
```python
def test_migrate_booking_requests_to_bookings():
    """Test migration of old booking_requests to new bookings schema"""
    # Create sample booking_requests
    # Run migration
    # Verify all data preserved
    # Verify new schema structure
    
def test_migrate_time_slots_to_mentor_slots():
    """Test migration of old time_slots to new mentor_slots schema"""
    # Create sample time_slots
    # Assign to mentors
    # Run migration
    # Verify mentor_id assignments
    # Verify all data preserved
```

### Performance Testing

**Load Tests**:
- Concurrent slot browsing by multiple mentees
- Concurrent booking attempts on same slot
- Analytics dashboard with large datasets

**Benchmarks**:
- Slot browsing query performance (<200ms)
- Booking creation performance (<500ms)
- Analytics aggregation performance (<2s)

### Test Coverage Goals

- **Backend**: Minimum 80% code coverage
- **Frontend**: Minimum 70% code coverage
- **Property Tests**: All 47 correctness properties implemented
- **Integration Tests**: All critical user flows covered

