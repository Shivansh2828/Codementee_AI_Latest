# AI Agent Pricing & Razorpay Subscription Analysis

## Current Pricing Configuration

### Backend Pricing (server.py)
```python
# India (INR) - in paise
"agent_trial": 9900,      # ₹99
"agent_monthly": 19900,   # ₹199
"agent_quarterly": 59900, # ₹599 (3 months, save ₹98)
"agent_yearly": 149900,   # ₹1,499 (12 months)

# International (USD) - in cents
"agent_trial": 200,       # $2
"agent_monthly": 400,     # $4
"agent_quarterly": 1000,  # $10 (3 months, save $2)
"agent_yearly": 1800,     # $18 (12 months)
```

### Razorpay Subscription Plans (create_razorpay_plans.py)
```python
{
    "internal_id": "agent_monthly",
    "period": "monthly",
    "interval": 1,
    "amount": 19900,  # ₹199 in paise
}
{
    "internal_id": "agent_quarterly",
    "period": "monthly",
    "interval": 3,  # Every 3 months
    "amount": 59900,  # ₹599 in paise
}
```

## ✅ PRICING IS ACCURATE

The pricing is consistent across:
- Backend hardcoded values
- Razorpay plan creation script
- Database pricing plans
- Frontend display

## ⚠️ RAZORPAY SUBSCRIPTION ISSUES

### Current Implementation Problems

#### 1. **Missing Mandate Setup Information**
The frontend does NOT inform users about:
- ❌ Automatic recurring billing
- ❌ Mandate/auto-debit authorization
- ❌ How to cancel subscription
- ❌ Billing cycle details

**Current UI only shows:**
```jsx
description: `${currentPlan.name} — Auto-renews monthly`
// And at bottom:
{currency === 'INR' && <><span>•</span><span>Auto-renews monthly</span></>}
```

#### 2. **Incorrect Description for Quarterly Plan**
```jsx
description: `${currentPlan.name} — Auto-renews monthly`
```
This says "Auto-renews monthly" even for the **quarterly plan** which renews every 3 months!

#### 3. **Missing Subscription Management**
- No way for users to view subscription status
- No way to cancel subscription from dashboard
- No subscription details page
- No billing history for subscriptions

#### 4. **Webhook Dependency**
The subscription activation relies on webhooks:
```python
@api_router.post("/payment/subscription-webhook")
async def razorpay_subscription_webhook(request: Request):
    # Activates user when subscription.charged event fires
```

If webhook fails or is delayed, user won't get access immediately.

## 🔧 REQUIRED FIXES

### 1. Enhanced Payment Page Information

Add clear subscription disclosure:

```jsx
{currency === 'INR' && (
  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
    <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
      <AlertCircle size={18} />
      Recurring Subscription
    </h4>
    <ul className="text-gray-400 text-sm space-y-1">
      <li>• This is a recurring subscription that auto-renews</li>
      <li>• {formData.selectedPlan === 'agent_quarterly' 
           ? 'Billed every 3 months' 
           : 'Billed monthly'}</li>
      <li>• You will be charged automatically until you cancel</li>
      <li>• You can cancel anytime from your dashboard</li>
      <li>• A payment mandate will be set up with your bank</li>
    </ul>
  </div>
)}
```

### 2. Fix Description Based on Plan

```jsx
const getBillingDescription = (planId) => {
  if (planId === 'agent_quarterly') {
    return 'Auto-renews every 3 months';
  }
  return 'Auto-renews monthly';
};

// In Razorpay options:
description: `${currentPlan.name} — ${getBillingDescription(formData.selectedPlan)}`
```

### 3. Add Subscription Management Dashboard

Create `/mentee/subscription` page with:
- Current subscription status
- Next billing date
- Billing amount
- Cancel subscription button
- Billing history

### 4. Update Terms & Refund Policy

Add clear subscription terms:
- Cancellation policy
- Refund policy for subscriptions
- Mandate authorization details
- Auto-renewal terms

### 5. Improve Webhook Reliability

Add fallback polling in case webhook is delayed:

```python
# In subscription-status endpoint, add more aggressive polling
# Check Razorpay API directly if webhook hasn't fired within 30 seconds
```

## 📋 IMPLEMENTATION CHECKLIST

### High Priority (Before Production)
- [ ] Add subscription disclosure on payment page
- [ ] Fix quarterly plan description (says "monthly" incorrectly)
- [ ] Add "Cancel Subscription" option in user dashboard
- [ ] Update Terms of Service with subscription details
- [ ] Update Refund Policy for subscriptions

### Medium Priority
- [ ] Create subscription management page
- [ ] Add billing history for subscriptions
- [ ] Show next billing date in dashboard
- [ ] Email notification before auto-renewal
- [ ] Add subscription status indicator

### Low Priority
- [ ] Subscription pause feature
- [ ] Upgrade/downgrade between plans
- [ ] Proration handling
- [ ] Multiple payment method support

## 🚨 LEGAL/COMPLIANCE REQUIREMENTS

### India RBI Guidelines for Recurring Payments
1. **Pre-debit Notification**: Send email 24 hours before charging
2. **Mandate Registration**: User must explicitly authorize recurring payments
3. **Easy Cancellation**: Provide simple cancellation mechanism
4. **Transaction Alerts**: Send SMS/email after each charge

### Current Compliance Status
- ❌ No pre-debit notification system
- ✅ Mandate registration (handled by Razorpay)
- ❌ No easy cancellation in dashboard
- ⚠️ Transaction alerts (only via webhook emails)

## 💡 RECOMMENDATIONS

### Immediate Actions
1. **Add prominent subscription disclosure** on AgentPurchasePage
2. **Fix the quarterly plan description** bug
3. **Add cancel subscription button** in dashboard
4. **Test the complete flow** with real Razorpay test mode

### Before Going Live
1. Set up Razorpay webhook URL in production
2. Test webhook failure scenarios
3. Add subscription management UI
4. Update legal documents
5. Implement pre-debit notifications

### Future Enhancements
1. Allow plan upgrades/downgrades
2. Add subscription pause feature
3. Implement usage-based billing
4. Add referral credits for subscriptions
