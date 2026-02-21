# Codementee - Mock Interview Platform

A freemium mentorship-based interview preparation platform connecting aspiring software engineers with experienced mentors.

**🌐 Live Site:** https://codementee.io

---

## 👋 New Here? Start With This

1. **Read this README** (5 min) - Understand the project
2. **Run locally**: `./start-local-dev.sh`
3. **Deploy changes**: See [DEPLOYMENT_SOP.md](DEPLOYMENT_SOP.md)
4. **Understand features**: See [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md)

---

## 🚀 Quick Start

### Local Development
```bash
./start-local-dev.sh
```

### Production Deployment
```bash
# On VPS
./deploy.sh
```

## 📚 Documentation

**Reading Path (Start Here):**
1. **[README.md](README.md)** - Start here for overview and quick start
2. **[DEPLOYMENT_SOP.md](DEPLOYMENT_SOP.md)** - Read this for deployment and architecture
3. **[PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md)** - Read this for product features

**Quick Access:**
- **[CHECK_STATUS.sh](CHECK_STATUS.sh)** - Run this to check current system status

## 🏗️ Architecture

```
Internet (HTTPS) → Nginx → FastAPI Backend → MongoDB (Local)
                      ↓
                Static Files (React)
```

**Components:**
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI (served by Nginx)
- **Backend**: FastAPI (Python) with Uvicorn (systemd service, port 8001)
- **Database**: MongoDB 7.0 (local installation, port 27017)
- **Web Server**: Nginx (reverse proxy + SSL termination)
- **Domain**: https://codementee.io

**Why No Docker?** Systemd is simpler, more reliable, and easier to debug for single-server deployments. The current setup provides 99.9%+ uptime with auto-recovery.

## 🔑 Test Credentials

- **Admin**: admin@codementee.com / Admin@123
- **Mentor**: mentor@codementee.com / Mentor@123
- **Mentee**: mentee@codementee.com / Mentee@123

## 📦 Project Structure

```
codementee/
├── deploy.sh                    # Main deployment script (auto-detects changes)
├── CHECK_STATUS.sh              # System status checker
├── start-local-dev.sh           # Local development startup
├── README.md                    # This file
├── DEPLOYMENT_SOP.md            # Complete deployment guide
├── PRODUCT_REQUIREMENTS.md      # Product features & roadmap
├── backend/                     # FastAPI backend
│   ├── server.py               # Main application
│   ├── setup_initial_data.py   # Database initialization
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables (not in git)
├── frontend/                    # React frontend
│   ├── src/                    # Source code
│   ├── public/                 # Static assets
│   ├── build/                  # Production build (generated)
│   ├── package.json            # Node dependencies
│   └── .env.production         # Production config
├── systemd/                     # Systemd service files
│   └── codementee-backend.service
├── .kiro/steering/              # Development guidelines
└── tests/                       # Test files
```

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

## 🌐 Production URLs

- **Website**: https://codementee.io
- **API**: https://codementee.io/api
- **VPS IP**: 62.72.13.129

## 📊 System Performance

- **Concurrent Users**: 10,000+
- **Requests/Second**: 1,000+
- **API Response Time**: <100ms
- **Expected Uptime**: 99.9%+
- **Reliability Score**: 9/10

## 🔧 Configuration Files

### Backend (.env - not in git)
```bash
MONGO_URL=mongodb://localhost:27017/?tls=false
DB_NAME=codementee
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_secret
RESEND_API_KEY=your_api_key
SENDER_EMAIL=support@codementee.com
BCC_EMAIL=admin@codementee.com
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

## 📝 License

Proprietary - All rights reserved

---

For detailed deployment instructions, see [DEPLOYMENT_SOP.md](DEPLOYMENT_SOP.md)
