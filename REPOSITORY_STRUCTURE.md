# 📁 Repository Structure

## Essential Files (Root Level)

### Scripts
- **deploy.sh** - Main production deployment script
- **CHECK_STATUS.sh** - Check system status on VPS
- **start-local-dev.sh** - Start local development servers

### Documentation
- **README.md** - Project overview
- **DEPLOYMENT_SOP.md** - Complete deployment guide
- **DEPLOYMENT_SUMMARY.md** - Deployment summary

---

## Directory Structure

### `/backend/` - Backend Application
```
backend/
├── server.py              # Main FastAPI application
├── setup_initial_data.py  # Database initialization
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables (not in git)
```

### `/frontend/` - Frontend Application
```
frontend/
├── src/                   # React source code
├── public/                # Static assets
├── build/                 # Production build (generated)
├── package.json           # Node dependencies
├── .env                   # Local development config
└── .env.production        # Production config
```

### `/.kiro/` - Kiro Configuration
```
.kiro/
└── steering/              # Development guidelines
    ├── tech.md           # Technology stack
    ├── structure.md      # Project structure
    ├── product.md        # Product overview
    ├── features.md       # Feature documentation
    ├── development.md    # Development practices
    ├── deployment.md     # Deployment info
    └── mentor-assignment.md  # Mentor system docs
```

### `/systemd/` - Service Configurations
```
systemd/
├── codementee-backend.service   # Backend systemd service
└── codementee-frontend.service  # Frontend systemd service (legacy)
```

### `/memory/` - Product Documentation
Product requirements and specifications

### `/tests/` & `/test_reports/` - Testing
Test files and reports

---

## What Each File Does

### deploy.sh
Main deployment script. Automatically:
- Pulls latest code
- Detects changes (frontend/backend)
- Installs dependencies if needed
- Builds/restarts services
- Verifies deployment

**Usage:**
```bash
# On VPS
./deploy.sh
```

### CHECK_STATUS.sh
Checks status of all services and tests API/frontend.

**Usage:**
```bash
./CHECK_STATUS.sh
```

### start-local-dev.sh
Starts both frontend and backend for local development.

**Usage:**
```bash
./start-local-dev.sh
```

### DEPLOYMENT_SOP.md
Complete deployment guide with:
- Step-by-step instructions
- Common scenarios
- Troubleshooting
- Best practices

### backend/server.py
Main FastAPI application with all routes and business logic.

### backend/setup_initial_data.py
Initializes database with:
- Test users (admin, mentor, mentee)
- Companies
- Pricing plans
- Time slots

**Usage:**
```bash
cd backend
python3 setup_initial_data.py
```

---

## Files NOT in Git

These files contain sensitive data and are in `.gitignore`:

- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend local development config
- `frontend/build/` - Production build (generated)
- `node_modules/` - Node dependencies
- `__pycache__/` - Python cache
- `.DS_Store` - macOS files

---

## Configuration Files

### backend/.env (Not in Git)
```bash
MONGO_URL=mongodb://localhost:27017/?tls=false
DB_NAME=codementee
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
RESEND_API_KEY=your-api-key
SENDER_EMAIL=support@codementee.com
BCC_EMAIL=admin@codementee.com
CORS_ORIGINS=https://codementee.io,https://www.codementee.io
```

### frontend/.env.production
```bash
REACT_APP_BACKEND_URL=
REACT_APP_ENVIRONMENT=production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_key
GENERATE_SOURCEMAP=false
```

---

## VPS File Locations

### Application
- Code: `/var/www/codementee/`
- Frontend build: `/var/www/codementee/frontend/build/`
- Backend: `/var/www/codementee/backend/`

### Configuration
- Nginx: `/etc/nginx/sites-available/codementee`
- Backend service: `/etc/systemd/system/codementee-backend.service`
- Backend env: `/var/www/codementee/backend/.env`

### Logs
- Backend: `journalctl -u codementee-backend`
- Nginx: `/var/log/nginx/error.log`

---

## Clean Repository

Total essential files in root: **6**
- 3 scripts
- 3 documentation files

Everything else is either:
- Application code (frontend/backend)
- Configuration (.kiro/steering)
- Generated files (build, node_modules)

---

*Last Updated: February 14, 2026*
