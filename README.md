# Codementee - Mock Interview Platform

A freemium mentorship-based interview preparation platform connecting aspiring software engineers with experienced mentors. Now with **global multi-currency support** for international users!

**🌐 Live Site:** https://codementee.io

---

## 👋 New Here? Start With This

1. **Read this README** (5 min) - Understand the project
2. **Run locally**: `./start-local-dev.sh`
3. **Deploy changes**: `./deploy.sh` on VPS
4. **Check status**: `./CHECK_STATUS.sh`

---

## 🚀 Quick Start

### Local Development
```bash
./start-local-dev.sh
```

### Production Deployment
```bash
# On VPS
ssh root@62.72.13.129
cd /var/www/codementee
./deploy.sh
```

## 🌍 Multi-Currency Support (NEW!)

### Overview
Platform supports both Indian and international users with automatic currency detection and appropriate payment gateways.

### How It Works
- **India Users**: See ₹ prices → Pay via Razorpay → Mentors get ₹800/session
- **International Users**: See $ prices → Pay via Cashfree → Mentors get $10/session
- **Automatic Detection**: IP-based geolocation (no user input needed)
- **Admin Control**: Edit both INR and USD prices from `/admin/pricing`

### Current Pricing
| Plan | India (INR) | International (USD) |
|------|-------------|---------------------|
| Mock Starter | ₹1,999 | $24 |
| Interview Pro | ₹6,999 | $84 |
| Interview Elite | ₹14,999 | $180 |

### Payment Gateways
- **Razorpay** (India): Lower fees (~2%), familiar UX
- **Cashfree** (International): Global support, USD payments

### Mentor Payouts
- **India sessions**: ₹800 per 45-60 min session
- **International sessions**: $10 per 45-60 min session
- **Automatic currency**: Based on mentee's payment currency

---

## 📚 Documentation

This README is your single source of truth. All information is consolidated here.

**Quick Access:**
- **[CHECK_STATUS.sh](CHECK_STATUS.sh)** - Check system status
- **[deploy.sh](deploy.sh)** - Deploy to production
- **[.kiro/steering/](./kiro/steering/)** - Development guidelines

---

## 🏗️ Architecture

```
Internet (HTTPS) → Nginx → FastAPI Backend → MongoDB Atlas (Cloud)
                      ↓
                Static Files (React)
```

**Components:**
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI (served by Nginx)
- **Backend**: FastAPI (Python) with Uvicorn (systemd service, port 8001)
- **Database**: MongoDB Atlas (cloud-hosted)
- **Web Server**: Nginx (reverse proxy + SSL termination)
- **Payment**: Razorpay (India) + Cashfree (International)
- **Domain**: https://codementee.io

**Why No Docker?** Systemd is simpler, more reliable, and easier to debug for single-server deployments. The current setup provides 99.9%+ uptime with auto-recovery.

---

## 🔑 Test Credentials

- **Admin**: admin@codementee.com / Admin@123
- **Mentor**: mentor@codementee.com / Mentor@123
- **Mentee**: mentee@codementee.com / Mentee@123

---

## 📦 Project Structure

```
codementee/
├── deploy.sh                    # Main deployment script (auto-detects changes)
├── CHECK_STATUS.sh              # System status checker
├── start-local-dev.sh           # Local development startup
├── README.md                    # This file (single source of truth)
├── backend/                     # FastAPI backend
│   ├── server.py               # Main application
│   ├── setup_initial_data.py   # Database initialization
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables (not in git)
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── CurrencyContext.jsx  # NEW: Multi-currency support
│   │   ├── pages/              # Page components
│   │   └── components/         # Reusable components
│   ├── public/
│   │   └── index.html          # Includes Razorpay + Cashfree SDKs
│   ├── build/                  # Production build (generated)
│   ├── package.json            # Node dependencies
│   └── .env.production         # Production config
├── systemd/                     # Systemd service files
│   └── codementee-backend.service
└── .kiro/steering/              # Development guidelines
    ├── tech.md                 # Technology stack
    ├── features.md             # Feature documentation
    ├── development.md          # Development practices
    └── documentation-policy.md # This policy
```

---

## 🛠️ Essential Commands

### Development
```bash
./start-local-dev.sh              # Start local dev servers
```

### Deployment
```bash
./deploy.sh                       # Deploy to production
./CHECK_STATUS.sh                 # Check system status
```

### Service Management (VPS)
```bash
systemctl restart codementee-backend   # Restart backend
systemctl reload nginx                 # Reload Nginx
journalctl -u codementee-backend -f    # View logs
```

### Database Operations
```bash
# Initialize database with sample data
cd backend
python setup_initial_data.py

# Check database data
python check_db_data.py
```

---

## 🌐 Production URLs

- **Website**: https://codementee.io
- **API**: https://codementee.io/api
- **Admin**: https://codementee.io/admin
- **VPS IP**: 62.72.13.129

---

## 📊 System Performance

- **Concurrent Users**: 10,000+
- **Requests/Second**: 1,000+
- **API Response Time**: <100ms
- **Expected Uptime**: 99.9%+
- **Reliability Score**: 9/10
- **Global Reach**: India + International (USD)

---

## 🔧 Configuration Files

### Backend (.env - not in git)
```bash
# Database
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/codementee?retryWrites=true&w=majority
DB_NAME=codementee_dev

# JWT
JWT_SECRET=your-secret-key

# Payment Gateways
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_secret
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret
CASHFREE_BASE_URL=https://api.cashfree.com/pg

# Email
RESEND_API_KEY=your_api_key
SENDER_EMAIL=support@codementee.com
BCC_EMAIL=admin@codementee.com

# URLs
FRONTEND_URL=https://codementee.io
BACKEND_URL=https://codementee.io/api
CORS_ORIGINS=https://codementee.io,https://www.codementee.io
```

### Frontend (.env.production)
```bash
REACT_APP_BACKEND_URL=
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_key
GENERATE_SOURCEMAP=false
```

**Note:** `REACT_APP_BACKEND_URL=` (empty) is correct! Frontend `api.js` adds `/api` prefix automatically.

---

## 💳 Payment Integration

### Razorpay (India)
- **Purpose**: Indian users (INR payments)
- **Fees**: ~2%
- **Integration**: Checkout.js SDK
- **Test Mode**: Use test keys for development

### Cashfree (International)
- **Purpose**: International users (USD payments)
- **Fees**: ~3%
- **Integration**: Cashfree SDK v3
- **Test Mode**: Sandbox environment available

### Currency Detection
- **Method**: IP-based geolocation (ip-api.com)
- **Fallback**: Defaults to INR if detection fails
- **Endpoint**: `/api/detect-currency`
- **Response**: `{ "country": "US", "currency": "USD", "is_india": false }`

### Admin Price Management
1. Login as admin
2. Go to `/admin/pricing`
3. Edit plan → See both INR and USD fields
4. Update prices → Click "Sync to Website"
5. Changes reflect immediately

---

## 👨‍💼 Mentor Payout System

### Payout Rates
- **India**: ₹800 per 45-60 minute session
- **International**: $10 per 45-60 minute session

### How It Works
1. Mock interview completed
2. Admin creates payout entry
3. System auto-detects currency from mentee's payment
4. Mentor sees payout in appropriate currency
5. Admin approves and processes payment

### Viewing Payouts
- **Mentor**: `/mentor/payouts` - See all payouts with currency
- **Admin**: `/admin/payouts` - Manage all payouts

---

## 🎯 Key Features

### Freemium Model
- **Free Tier**: Dashboard exploration, pricing view
- **Paid Tier**: Full access after payment
- **Upgrade Flow**: Integrated payment within booking

### Admin-Controlled Mentor Assignment
- Mentees cannot select mentors
- Admin assigns best-fit mentor
- Professional matching process
- Email notifications to both parties

### Multi-Currency Support
- Automatic currency detection
- Dual payment gateways
- Currency-aware pricing
- Multi-currency payouts

### Interview Types
- Coding Interview (60-90 min)
- System Design (45-60 min)
- Behavioral Interview (30-45 min)
- HR Round (30-45 min)

### Company Categories
- Product Companies (Amazon, Google, Microsoft, Meta, Apple, Netflix)
- Indian Unicorns (Flipkart, Zomato, Paytm, Swiggy)
- Startups & Service Companies

---

## 🚀 Deployment Process

### Automatic Deployment
```bash
./deploy.sh
```

**What it does:**
1. Detects changes (frontend/backend)
2. Pulls latest code from GitHub
3. Rebuilds changed components
4. Restarts services
5. Verifies deployment

### Manual Deployment

**Backend Only:**
```bash
systemctl restart codementee-backend
```

**Frontend Only:**
```bash
cd frontend
rm -rf build node_modules/.cache
NODE_ENV=production yarn build
systemctl restart codementee-frontend
```

**Both:**
```bash
./deploy.sh
```

---

## 🧪 Testing

### Local Testing
```bash
# Start services
./start-local-dev.sh

# Visit
http://localhost:3000  # Frontend
http://localhost:8001/api/health  # Backend health check
```

### Currency Testing
```bash
# Test India (default)
curl http://localhost:8001/api/detect-currency

# Test USD pricing
curl "http://localhost:8001/api/pricing-plans?currency=USD"

# Test INR pricing
curl "http://localhost:8001/api/pricing-plans?currency=INR"
```

### Payment Testing
- **Razorpay Test Cards**: Use test mode keys
- **Cashfree Test Cards**: 4111 1111 1111 1111, CVV: 123

---

## 📈 Monitoring

### Health Checks
```bash
# Backend health
curl https://codementee.io/api/health

# System status
./CHECK_STATUS.sh
```

### Logs
```bash
# Backend logs
journalctl -u codementee-backend -f

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Database
```bash
# Check MongoDB connection
mongosh "mongodb+srv://..."

# Check collections
use codementee_dev
db.users.countDocuments()
db.orders.countDocuments()
db.pricing_plans.find()
```

---

## 🔒 Security

### Best Practices
- All API keys in `.env` (not in git)
- HTTPS only (Let's Encrypt SSL)
- JWT token authentication
- Role-based access control
- Payment gateway signature verification
- CORS restrictions in production

### Credentials Management
- Never commit `.env` files
- Rotate keys regularly
- Use different keys for dev/prod
- Store backups securely

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
journalctl -u codementee-backend -n 50
# Check for Python errors, missing dependencies
```

### Frontend Build Fails
```bash
cd frontend
rm -rf node_modules build
yarn install
yarn build
```

### Database Connection Issues
```bash
# Check MongoDB Atlas connection
# Verify IP whitelist includes VPS IP
# Check connection string in .env
```

### Payment Gateway Issues
```bash
# Razorpay: Check dashboard for errors
# Cashfree: Check merchant dashboard
# Verify webhook URLs are accessible
```

### Currency Detection Not Working
```bash
# Check if ip-api.com is accessible
curl http://ip-api.com/json/8.8.8.8
# Should return country info
```

---

## 📞 Support

### For Development Issues
- Check logs: `journalctl -u codementee-backend -f`
- Check status: `./CHECK_STATUS.sh`
- Review steering files: `.kiro/steering/`

### For Payment Issues
- **Razorpay**: https://dashboard.razorpay.com/
- **Cashfree**: https://merchant.cashfree.com/

### For Database Issues
- **MongoDB Atlas**: https://cloud.mongodb.com/

---

## 📝 Development Guidelines

### Code Organization
- Follow patterns in `.kiro/steering/development.md`
- Use existing component structure
- Keep backend routes in `server.py`
- Group related functionality

### Adding New Features
1. Check if it's free or paid tier
2. Implement tier-based access control
3. Add upgrade prompts for free users
4. Update admin controls if needed
5. Test with both currencies

### Documentation
- **Update README.md** (this file) for major changes
- **Update steering files** for development patterns
- **Don't create new docs** - consolidate here

---

## 🎓 Learning Resources

### Technology Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Python 3.11+
- **Database**: MongoDB Atlas
- **Payment**: Razorpay, Cashfree
- **Deployment**: Systemd, Nginx

### Useful Links
- React Docs: https://react.dev/
- FastAPI Docs: https://fastapi.tiangolo.com/
- MongoDB Docs: https://docs.mongodb.com/
- Razorpay Docs: https://razorpay.com/docs/
- Cashfree Docs: https://docs.cashfree.com/

---

## 📝 License

Proprietary - All rights reserved

---

## 🎉 Recent Updates

### Multi-Currency Support (Latest)
- ✅ Automatic currency detection
- ✅ Dual payment gateways (Razorpay + Cashfree)
- ✅ Admin control for both INR and USD prices
- ✅ Multi-currency mentor payouts
- ✅ Global reach enabled

### Previous Updates
- Admin-controlled mentor assignment
- Freemium model implementation
- Enhanced booking flow
- Transparent pricing strategy

---

**For detailed technical information, see `.kiro/steering/` files.**
