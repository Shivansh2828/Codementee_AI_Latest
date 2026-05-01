# 💰 Pricing Management Guide

## Overview

All prices in Codementee are **dynamically managed from the Admin Dashboard**. No prices are hardcoded in the codebase. This allows you to:

- ✅ Update prices instantly without redeploying
- ✅ Set different prices for different currencies (INR, USD)
- ✅ Manage course pricing independently
- ✅ Apply discounts via coupon codes
- ✅ Support international payments (Razorpay for India, Cashfree for USD)

---

## Architecture

### Payment Gateway Selection

The system automatically selects the payment gateway based on user's currency:

```
User Location → Currency Detection → Payment Gateway
├─ India (INR) → Razorpay
└─ International (USD) → Cashfree
```

### Price Storage

All prices are stored in MongoDB `pricing_plans` collection:

```json
{
  "plan_id": "aws_course",
  "name": "AWS Course",
  "service_type": "course",
  "price_inr": 49900,      // ₹499 (in paise)
  "price_usd": 600,        // $6 (in cents)
  "currencies": ["INR", "USD"],
  "payment_gateways": {
    "INR": "razorpay",
    "USD": "cashfree"
  }
}
```

---

## Setting Up Course Pricing

### Step 1: Create Course Plan Templates

Run the setup script on the VPS:

```bash
ssh root@62.72.13.129
cd /var/www/codementee/backend
python setup_course_plans.py
```

This creates three course plan templates:
- **DevOps Course** (plan_id: `devops_course`)
- **AWS Course** (plan_id: `aws_course`)
- **DevOps + AWS Bundle** (plan_id: `devops_aws_bundle`)

**Important:** The setup script does NOT set prices. Prices must be set via Admin Dashboard.

### Step 2: Set Prices via Admin Dashboard

1. Go to **Admin Dashboard** → **Pricing**
2. Find each course plan
3. Set `price_inr` (in paise) and `price_usd` (in cents)

Example:
- DevOps Course: ₹499 (49900 paise) / $6 (600 cents)
- AWS Course: ₹499 (49900 paise) / $6 (600 cents)
- Bundle: ₹799 (79900 paise) / $10 (1000 cents)

---

## API Endpoints

### Get All Pricing Plans

```bash
GET /api/pricing-plans?currency=INR&service_type=course
```

Response:
```json
[
  {
    "plan_id": "aws_course",
    "name": "AWS Course",
    "price": 49900,
    "currency": "INR",
    "features": ["36 topics", "Lifetime access"],
    "limits": {"course_access": ["aws_course"]}
  }
]
```

### Admin: Update Pricing Plan

```bash
PUT /api/admin/pricing-plans/aws_course
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price_inr": 49900,
  "price_usd": 600,
  "is_active": true,
  "display_order": 11
}
```

### Admin: Create New Pricing Plan

```bash
POST /api/admin/pricing-plans
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "plan_id": "new_course",
  "name": "New Course",
  "service_type": "course",
  "price_inr": 29900,
  "price_usd": 400,
  "features": ["Feature 1", "Feature 2"],
  "limits": {"course_access": ["new_course"]},
  "is_active": true,
  "display_order": 13
}
```

---

## Currency & Payment Gateway Logic

### How Currency is Detected

1. **User's IP address** → Geolocation API
2. **Country code** → Currency mapping
3. **Currency** → Payment gateway selection

```python
# In backend/server.py
country_code = await detect_user_country(request)
currency = get_currency_for_country(country_code)

if currency == "INR":
    payment_gateway = "razorpay"
else:
    payment_gateway = "cashfree"
```

### Supported Currencies

| Currency | Country | Payment Gateway | Price Field |
|----------|---------|-----------------|-------------|
| INR | India | Razorpay | `price_inr` (paise) |
| USD | USA, UK, etc. | Cashfree | `price_usd` (cents) |

### Adding New Currencies

To add a new currency (e.g., EUR):

1. **Update backend** (`server.py`):
   ```python
   def get_currency_for_country(country_code):
       currency_map = {
           "IN": "INR",
           "US": "USD",
           "GB": "USD",
           "DE": "EUR",  # Add new mapping
       }
       return currency_map.get(country_code, "USD")
   ```

2. **Update pricing plan**:
   ```json
   {
     "price_eur": 500,  // €5 (in cents)
     "currencies": ["INR", "USD", "EUR"],
     "payment_gateways": {
       "INR": "razorpay",
       "USD": "cashfree",
       "EUR": "cashfree"
     }
   }
   ```

3. **Update frontend** (`MenteePricing.jsx`):
   ```javascript
   const currencySymbol = {
     "INR": "₹",
     "USD": "$",
     "EUR": "€"
   };
   ```

---

## Coupon Codes

### Create Coupon Code (Admin)

```bash
POST /api/admin/coupons
Authorization: Bearer <admin_token>

{
  "code": "LAUNCH20",
  "discount_type": "percentage",
  "discount_value": 20,
  "max_uses": 100,
  "valid_from": "2025-05-01T00:00:00Z",
  "valid_to": "2025-05-31T23:59:59Z",
  "applicable_services": ["course", "mock_interview"],
  "min_order_amount": 0
}
```

### Apply Coupon Code (User)

When creating an order:

```bash
POST /api/payment/create-order

{
  "plan_id": "aws_course",
  "name": "John Doe",
  "email": "john@example.com",
  "coupon_code": "LAUNCH20"
}
```

The backend will:
1. Validate the coupon code
2. Check if it's applicable to the service type
3. Apply the discount
4. Return the discounted amount

---

## Best Practices

### 1. Price Consistency

Keep prices consistent across currencies using a conversion rate:

```
₹499 (INR) ≈ $6 (USD)
Conversion rate: 1 USD = ~83 INR
```

### 2. Bundle Discounts

For bundle plans, always set a lower price than individual courses:

```
DevOps Course: ₹499
AWS Course: ₹499
Bundle: ₹799 (save ₹199)
```

### 3. Seasonal Pricing

Use coupon codes for seasonal discounts instead of changing base prices:

```
Base price: ₹499
Coupon "SUMMER30": 30% off = ₹349
```

### 4. Monitor Price Changes

All price updates are logged with timestamps:

```json
{
  "plan_id": "aws_course",
  "updated_at": "2025-05-01T10:30:00Z",
  "price_inr": 49900
}
```

---

## Troubleshooting

### Issue: Course plans not showing on pricing page

**Solution:**
1. Run setup script: `python setup_course_plans.py`
2. Check if prices are set in Admin Dashboard
3. Verify `is_active: true` in pricing plan

### Issue: Wrong payment gateway selected

**Solution:**
1. Check user's IP geolocation
2. Verify currency detection: `GET /api/payment/config`
3. Check `payment_gateways` mapping in pricing plan

### Issue: Coupon code not applying

**Solution:**
1. Verify coupon is active: `valid_from` ≤ now ≤ `valid_to`
2. Check `applicable_services` includes the plan's service type
3. Verify `min_order_amount` is met
4. Check `max_uses` hasn't been exceeded

---

## Quick Reference

### Common Price Points (INR / USD)

| Plan | INR | USD |
|------|-----|-----|
| Single Course | ₹499 / 49900 | $6 / 600 |
| Bundle (2 courses) | ₹799 / 79900 | $10 / 1000 |
| Starter Mock | ₹2,999 / 299900 | $36 / 3600 |
| Pro Mock | ₹6,999 / 699900 | $84 / 8400 |
| Elite Mock | ₹14,999 / 1499900 | $180 / 18000 |

### Environment Variables

```bash
# .env (backend)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
CASHFREE_APP_ID=...
CASHFREE_SECRET_KEY=...
```

### Database Collections

```
pricing_plans
├─ plan_id (unique)
├─ name
├─ service_type
├─ price_inr
├─ price_usd
├─ is_active
└─ display_order

coupon_codes
├─ code (unique)
├─ discount_type
├─ discount_value
├─ max_uses
├─ current_uses
├─ valid_from
├─ valid_to
└─ applicable_services
```

---

## Support

For questions about pricing management:
- Check Admin Dashboard → Pricing
- Review API logs: `journalctl -u codementee-backend -f`
- Contact: support@codementee.com
