# Mentor Assignment System Guide

## Overview
Admin-controlled mentor assignment system where mentees cannot see or select mentors directly. Mentors are professionally assigned by admin team and communicated via email after booking confirmation.

## System Architecture

### User Flow
1. **Mentee**: Books interview (company, type, slots) → Sees pending status
2. **Admin**: Reviews request → Assigns mentor → Confirms slot → System sends emails
3. **Mentee & Mentor**: Receive confirmation emails with meeting details

### Database Schema

#### Booking Requests Collection
```json
{
  "id": "uuid",
  "mentee_id": "uuid",
  "mentee_name": "string",
  "mentee_email": "string",
  "mentor_id": "uuid",  // Assigned by admin
  "mentor_name": "string",  // Assigned by admin  
  "mentor_email": "string",  // Assigned by admin
  "company_id": "uuid",
  "company_name": "string",
  "interview_type": "coding|system_design|behavioral|hr_round",
  "experience_level": "junior|mid|senior|staff_plus",
  "interview_track": "sde2|l4|e3|general",
  "specific_topics": ["Arrays & Strings", "Dynamic Programming"],
  "additional_notes": "Focus areas or special requirements",
  "preferred_slots": [
    {
      "id": "slot_uuid",
      "date": "2026-02-01", 
      "start_time": "10:00",
      "end_time": "11:00"
    }
  ],
  "confirmed_slot": {
    "id": "slot_uuid",
    "date": "2026-02-01",
    "start_time": "10:00", 
    "end_time": "11:00"
  },
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "meet_link_id": "uuid",
  "status": "pending|confirmed|cancelled",
  "confirmed_by": "admin_uuid",
  "confirmed_at": "datetime",
  "created_at": "datetime"
}
```

#### Meet Links Pool
```json
{
  "id": "uuid",
  "link": "https://meet.google.com/abc-defg-hij",
  "name": "Interview Room 1",
  "status": "available|in_use",
  "current_booking_id": "uuid|null",
  "created_at": "datetime"
}
```

## API Endpoints

### Admin Booking Management
```python
# Get all booking requests
GET /api/admin/booking-requests
# Returns: List of booking requests with mentee details

# Confirm booking with mentor assignment
POST /api/admin/confirm-booking
{
  "booking_request_id": "uuid",
  "mentor_id": "uuid", 
  "confirmed_slot_id": "uuid"
}
# Returns: Confirmation with meeting link and mentor details
```

### Mentee Interface
```python
# Create booking request
POST /api/mentee/booking-request
{
  "company_id": "uuid",
  "slot_ids": ["uuid1", "uuid2"],
  "interview_type": "coding",
  "experience_level": "mid",
  "specific_topics": ["Arrays", "DP"],
  "additional_notes": "Focus on optimization"
}

# Get mentee's booking requests and confirmed interviews
GET /api/mentee/booking-requests
GET /api/mentee/mocks
```

## Frontend Implementation

### Admin Booking Interface (`AdminBookings.jsx`)
```jsx
// Enhanced booking cards with mentor assignment
<Card className="bg-[#1e293b] border-[#334155]">
  <CardHeader>
    <CardTitle>{booking.company_name}</CardTitle>
    {booking.status === 'pending' && (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Assign Mentor</Button>
        </DialogTrigger>
        <DialogContent>
          {/* Mentor selection dropdown */}
          <Select value={selectedMentor} onValueChange={setSelectedMentor}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a mentor" />
            </SelectTrigger>
            <SelectContent>
              {mentors.map(mentor => (
                <SelectItem key={mentor.id} value={mentor.id}>
                  {mentor.name} ({mentor.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Slot confirmation */}
          <Select value={selectedSlot} onValueChange={setSelectedSlot}>
            <SelectTrigger>
              <SelectValue placeholder="Choose preferred slot" />
            </SelectTrigger>
            <SelectContent>
              {booking.preferred_slots.map(slot => (
                <SelectItem key={slot.id} value={slot.id}>
                  {slot.date} at {slot.start_time} - {slot.end_time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>
    )}
  </CardHeader>
</Card>
```

### Mentee Interview Status (`MenteeMentorSelection.jsx`)
```jsx
// Shows booking requests and confirmed interviews
const MenteeMentorSelection = () => {
  // Displays:
  // 1. Pending booking requests with status
  // 2. Confirmed interviews with meeting links
  // 3. Clear messaging about admin assignment process
  
  return (
    <DashboardLayout title="Your Mock Interviews">
      {/* Info about mentor assignment process */}
      <Card className="bg-[#06b6d4]/10 border-[#06b6d4]/30">
        <CardContent>
          <p>Our team carefully assigns the best mentor for your interview 
             based on your selected company, interview type, and experience level. 
             You'll receive mentor details via email once confirmed.</p>
        </CardContent>
      </Card>
      
      {/* Pending requests and confirmed interviews */}
    </DashboardLayout>
  );
};
```

## Email System

### Enhanced Email Templates
```python
# Mentee confirmation email includes mentor details
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
    # For mentees: includes mentor information
    # For mentors: standard confirmation
```

### Email Content Structure
- **Subject**: "Mock Interview Confirmed - {Company}"
- **Mentee Email**: Includes mentor name and meeting details
- **Mentor Email**: Includes mentee information and meeting details
- **Professional Branding**: Codementee logo and consistent styling

## Meeting Link Management

### Auto-Assignment System
```python
async def get_available_meet_link():
    """Get an available meet link from the pool"""
    link = await db.meet_links.find_one({"status": "available"})
    return link

async def assign_meet_link(link_id: str, booking_id: str):
    """Mark a meet link as in use"""
    await db.meet_links.update_one(
        {"id": link_id},
        {"$set": {"status": "in_use", "current_booking_id": booking_id}}
    )
```

### Admin Meet Link Management
- Add/remove Google Meet links via admin interface
- Track usage and availability
- Automatic release after interview completion
- Prevent conflicts with concurrent bookings

## Navigation & UI Updates

### Mentee Navigation (Updated)
```jsx
// Removed mentor selection, updated labels
const menteeNavigation = [
  { path: '/mentee', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/mentee/book', label: 'Schedule Mock', icon: CalendarPlus },
  { path: '/mentee/mocks', label: 'My Interviews', icon: Calendar }, // Updated
  { path: '/mentee/feedbacks', label: 'My Feedbacks', icon: MessageSquare },
  // AI Tools section...
];
```

### Pricing Features (Updated)
```javascript
// Removed "Mentor selection" from pricing features
const pricingFeatures = [
  "3 Mock Interviews (total)",
  "Expert Resume Review + Templates", 
  "All AI Interview Prep Tools",
  "Priority community access",
  // "Mentor selection" - REMOVED
  "Video recordings of sessions",
  "Chat support"
];
```

## Development Patterns

### Admin Role Validation
```python
# Ensure admin-only access for mentor assignment
async def require_admin_role(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user

@api_router.post("/admin/confirm-booking")
async def admin_confirm_booking(data: AdminConfirmBookingRequest, user=Depends(require_admin_role)):
    # Admin mentor assignment logic
```

### Error Handling
```python
# Comprehensive error handling for assignment process
try:
    # Mentor assignment logic
    pass
except Exception as e:
    logger.error(f"Mentor assignment failed: {str(e)}")
    raise HTTPException(status_code=500, detail="Assignment failed")
```

### Frontend State Management
```jsx
// Admin booking state management
const [assigningBooking, setAssigningBooking] = useState(null);
const [selectedMentor, setSelectedMentor] = useState('');
const [selectedSlot, setSelectedSlot] = useState('');
const [processing, setProcessing] = useState(false);

// Handle assignment with proper error handling
const handleAssignMentor = async () => {
  if (!selectedMentor || !selectedSlot) {
    toast.error('Please select both mentor and slot');
    return;
  }
  
  setProcessing(true);
  try {
    await api.post('/admin/confirm-booking', {
      booking_request_id: assigningBooking.id,
      mentor_id: selectedMentor,
      confirmed_slot_id: selectedSlot
    });
    toast.success('Booking confirmed and mentor assigned!');
    fetchData(); // Refresh data
  } catch (error) {
    toast.error('Failed to assign mentor');
  }
  setProcessing(false);
};
```

## Testing Guidelines

### Admin Interface Testing
- Test mentor dropdown population
- Test slot selection from mentee preferences
- Test booking confirmation flow
- Test error handling for invalid selections

### Email Testing
- Verify mentor details in mentee emails
- Test email delivery for both parties
- Validate email template rendering
- Test BCC functionality for admin oversight

### Integration Testing
- Complete flow: booking → assignment → confirmation → emails
- Meeting link assignment and release
- Database consistency after assignments
- Role-based access control validation

## Benefits of This System

1. **Quality Control**: Admin ensures optimal mentor-mentee matching
2. **Professional Experience**: Curated assignments vs self-selection
3. **Scalability**: Centralized assignment process
4. **User Experience**: Clear communication via email
5. **Business Value**: Higher satisfaction through better matching

This mentor assignment system provides professional, scalable mentor matching while maintaining clear communication and user experience standards.