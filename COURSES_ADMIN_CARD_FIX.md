# Admin Courses Tab - Card Rendering Fix

## Problem
Course plan cards in the Admin Pricing Dashboard were not displaying properly. The issue was:
1. Course plans have `price_inr` and `price_usd` set to `None` initially (prices are set via Admin Dashboard)
2. The card rendering logic didn't handle `None` prices gracefully
3. Course plans lack service-specific fields (like mentorship or resume review), making cards look sparse
4. No visual indicator that prices need to be set

## Solution
Updated `AdminPricing.jsx` `renderPlanCard()` function to:

### 1. Handle Null Prices
- Check if prices are set: `const pricesNotSet = !plan.price || !plan.price_usd;`
- Display "Not set" message instead of "N/A" or broken values
- Add visual warning badge when prices are missing

### 2. Add Course-Specific Section
- Display course access list with checkmarks
- Shows which courses are included in the plan
- Example: "DevOps Course", "AWS Course" for bundle plans

### 3. Visual Improvements
- Add amber warning badge: "⚠️ Prices Not Set" when prices are missing
- Slightly reduce opacity of cards with missing prices
- Better visual hierarchy for course information

## Changes Made
**File**: `frontend/src/pages/admin/AdminPricing.jsx`

### Before
```jsx
<div className="flex items-baseline gap-1">
  <span className={`${theme.text.secondary} text-lg`}>$</span>
  <span className={`text-3xl font-bold ${theme.text.primary}`}>
    {plan.price_usd ? (plan.price_usd / 100).toFixed(0) : 'N/A'}
  </span>
</div>
```

### After
```jsx
{plan.price_usd ? (
  <div className="flex items-baseline gap-1">
    <span className={`${theme.text.secondary} text-lg`}>$</span>
    <span className={`text-3xl font-bold ${theme.text.primary}`}>
      {(plan.price_usd / 100).toFixed(0)}
    </span>
  </div>
) : (
  <div className={`text-sm ${theme.text.muted} italic`}>Not set</div>
)}
```

### Added Course Section
```jsx
{/* Course-specific info */}
{plan.service_type === 'course' && plan.limits?.course_access && (
  <div className={`space-y-1 pt-2 border-t ${theme.border.primary}`}>
    <h4 className={`font-medium ${theme.text.primary} text-sm`}>Course Access:</h4>
    <div className="text-sm space-y-1">
      {plan.limits.course_access.map((course, idx) => (
        <div key={idx} className={`flex items-center gap-2 ${theme.text.secondary}`}>
          <CheckCircle className="w-3 h-3 text-[#06b6d4]" />
          <span className="capitalize">{course.replace(/_/g, ' ')}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

## Testing
✅ Frontend build successful
✅ No TypeScript/ESLint errors
✅ Cards now display properly with:
  - Clear "Not set" indicators for missing prices
  - Warning badge for incomplete plans
  - Course access information visible
  - Better visual hierarchy

## Next Steps for Admin
1. Go to Admin Dashboard → Pricing → Courses tab
2. Click "Edit" on any course plan
3. Set `Price INR (₹)` and `Price USD ($)`
4. Click "Update Plan"
5. Warning badge will disappear once prices are set
6. Click "Sync to Website" to push changes to frontend

## Files Modified
- `frontend/src/pages/admin/AdminPricing.jsx` - Updated `renderPlanCard()` function
