# 🎓 Admin Courses Tab — Pricing Management

## Problem

The Admin Pricing Management page was missing a "Courses" tab. Admins could only manage:
- Mock Interview plans
- Mentorship plans
- Resume Review plans
- AI Agents plans

But **could not manage Course pricing plans** (DevOps, AWS, Bundle).

## Solution

Added 'course' service type to the admin pricing management system.

### File: `frontend/src/pages/admin/AdminPricing.jsx`

**Change 1: Add 'course' to SERVICE_TYPES**
```javascript
const SERVICE_TYPES = [
  { value: 'mock_interview', label: 'Mock Interview', icon: Sparkles },
  { value: 'mentorship', label: 'Mentorship', icon: Users },
  { value: 'resume_review', label: 'Resume Review', icon: FileText },
  { value: 'ai_agent', label: 'AI Agents', icon: Bot },
  { value: 'course', label: 'Courses', icon: Tag },  // ← Added this line
];
```

**Change 2: Add 'course' to SERVICE_TYPE_LABELS**
```javascript
const SERVICE_TYPE_LABELS = {
  mock_interview: 'Mock Interview',
  mentorship: 'Mentorship',
  resume_review: 'Resume Review',
  ai_agent: 'AI Agents',
  course: 'Courses',  // ← Added this line
};
```

## How It Works

The admin pricing page uses dynamic tabs that are automatically generated from the `SERVICE_TYPES` array:

```javascript
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    {SERVICE_TYPES.map(st => (
      <TabsTrigger key={st.value} value={st.value}>
        <st.icon className="w-4 h-4" /> {st.label}
      </TabsTrigger>
    ))}
  </TabsList>

  {SERVICE_TYPES.map(st => (
    <TabsContent key={st.value} value={st.value}>
      {renderServicePlansTab()}
    </TabsContent>
  ))}
</Tabs>
```

By adding 'course' to `SERVICE_TYPES`, the tab automatically appears and works with the existing rendering logic.

## What Admins Can Now Do

### In Admin Dashboard → Pricing → Courses Tab

✅ **View all course pricing plans:**
- DevOps Course
- AWS Course
- DevOps + AWS Bundle

✅ **Edit course pricing:**
- Set `price_inr` (in paise)
- Set `price_usd` (in cents)
- Update features
- Change display order
- Activate/deactivate plans

✅ **Create new course plans:**
- Click "+ Add Plan"
- Set plan_id, name, prices
- Configure features and limits
- Set service_type to "course"

✅ **Delete course plans:**
- Click trash icon on any plan
- Confirm deletion

## Admin Workflow

### To Set Course Prices

1. Go to **Admin Dashboard** → **Pricing**
2. Click **Courses** tab
3. Find the course plan (e.g., "AWS Course")
4. Click **Edit** (pencil icon)
5. Update:
   - `price_inr`: 49900 (for ₹499)
   - `price_usd`: 600 (for $6)
6. Click **Save**
7. Prices update immediately on frontend

### To Create New Course Plan

1. Go to **Courses** tab
2. Click **+ Add Plan**
3. Fill in:
   - Plan ID: `my_course`
   - Name: `My Course`
   - Service Type: `course` (auto-selected)
   - Price INR: `49900`
   - Price USD: `600`
   - Features: (list features)
   - Limits: `{"course_access": ["my_course"]}`
4. Click **Create**

## Testing

### Test 1: Courses Tab Appears

1. Go to `https://codementee.io/admin`
2. Click **Pricing**
3. **Expected:** See tabs for:
   - Mock Interview
   - Mentorship
   - Resume Review
   - AI Agents
   - **Courses** ← New tab
   - Coupon Codes

### Test 2: View Course Plans

1. Click **Courses** tab
2. **Expected:** See course plans:
   - DevOps Course
   - AWS Course
   - DevOps + AWS Bundle

### Test 3: Edit Course Price

1. Click **Courses** tab
2. Find "AWS Course"
3. Click **Edit** (pencil icon)
4. Change `price_inr` to 59900
5. Click **Save**
6. **Expected:** Success message
7. Go to `/mentee/book?tab=courses`
8. **Expected:** AWS Course shows new price

### Test 4: Create New Course

1. Click **Courses** tab
2. Click **+ Add Plan**
3. Fill in form:
   - Plan ID: `test_course`
   - Name: `Test Course`
   - Service Type: `course`
   - Price INR: `29900`
   - Price USD: `400`
4. Click **Create**
5. **Expected:** New plan appears in list

## Deployment

1. Commit changes:
   ```bash
   git add frontend/src/pages/admin/AdminPricing.jsx
   git commit -m "Add: Courses tab to admin pricing management"
   git push origin main
   ```

2. Deploy to VPS:
   ```bash
   ssh root@62.72.13.129
   cd /var/www/codementee
   ./deploy.sh
   ```

3. Test the admin panel

## Features

✅ **Dynamic tabs** — Automatically generated from SERVICE_TYPES  
✅ **Full CRUD** — Create, read, update, delete course plans  
✅ **Multi-currency** — Set prices for INR and USD  
✅ **Real-time updates** — Changes reflect immediately on frontend  
✅ **Consistent UI** — Same interface as other service types  
✅ **Error handling** — Shows validation errors  

## Related Files

- `frontend/src/pages/admin/AdminPricing.jsx` — Admin pricing page
- `backend/setup_course_plans.py` — Creates course plan templates
- `frontend/src/pages/mentee/MenteePricing.jsx` — User pricing page
- `frontend/src/components/landing/PricingSection.jsx` — Landing page pricing

## Notes

- The change is minimal (2 lines added)
- No backend changes needed
- Fully backward compatible
- Uses existing admin UI components
- Follows same pattern as other service types

## Support

If courses tab doesn't appear:

1. **Clear browser cache** (Cmd+Shift+R or Ctrl+Shift+R)
2. **Check browser console** for errors (F12 → Console)
3. **Verify deployment** completed successfully
4. **Check backend logs** for API errors:
   ```bash
   journalctl -u codementee-backend -f | grep -i course
   ```

## Next Steps

1. ✅ Deploy changes
2. ✅ Test Courses tab appears
3. ✅ Set course prices in admin
4. ✅ Verify prices show on frontend
5. ✅ Test payment flow with course plans
