# Codementee - Mock Interview Platform

A freemium mentorship-based interview preparation platform connecting aspiring software engineers with experienced mentors.

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

- **[DEPLOYMENT_SOP.md](DEPLOYMENT_SOP.md)** - Complete deployment guide
- **[CHECK_STATUS.sh](CHECK_STATUS.sh)** - Check system status

## 🏗️ Architecture

- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python) + MongoDB
- **Deployment**: Systemd services + Nginx
- **Domain**: https://codementee.io

## 🔑 Test Credentials

- **Admin**: admin@codementee.com / Admin@123
- **Mentor**: mentor@codementee.com / Mentor@123
- **Mentee**: mentee@codementee.com / Mentee@123

## 📦 Project Structure

```
codementee/
├── frontend/          # React application
├── backend/           # FastAPI application
├── deploy.sh          # Main deployment script
├── DEPLOYMENT_SOP.md  # Deployment guide
└── CHECK_STATUS.sh    # Status checker
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

## 📝 License

Proprietary - All rights reserved

---

For detailed deployment instructions, see [DEPLOYMENT_SOP.md](DEPLOYMENT_SOP.md)
