# Codementee Local Development Setup Guide

This guide will help you set up the Codementee application locally for development.

## Prerequisites ✅

- **Node.js**: v20.8.0+ (✅ Installed)
- **Python**: 3.9+ (✅ Installed)
- **Yarn**: 1.22+ (✅ Installed)
- **MongoDB Atlas Account** (Required for database)

## Step 1: MongoDB Atlas Setup 🗄️

Since we're using MongoDB Atlas (cloud database), you need to:

1. **Create MongoDB Atlas Account**:
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 free tier)

2. **Configure Database Access**:
   - Go to Database Access → Add New Database User
   - Create a user with username/password
   - Grant "Read and write to any database" permissions

3. **Configure Network Access**:
   - Go to Network Access → Add IP Address
   - Add `0.0.0.0/0` (allow access from anywhere) for development

4. **Get Connection String**:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

5. **Update Backend Environment**:
   - Open `backend/.env`
   - Replace the `MONGO_URL` with your Atlas connection string:
   ```
   MONGO_URL=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/codementee?retryWrites=true&w=majority
   ```

## Step 2: Backend Setup 🐍

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (already created)
source venv/bin/activate

# Dependencies are already installed, but if needed:
# pip install -r requirements.txt

# Set up initial data (creates admin, mentor, mentee users and sample data)
python setup_initial_data.py

# Start the backend server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

The backend will be available at: http://localhost:8001

## Step 3: Frontend Setup ⚛️

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Dependencies are already installed, but if needed:
# yarn install

# Start the frontend development server
yarn start
```

The frontend will be available at: http://localhost:3000

## Step 4: Verify Setup ✅

1. **Backend API**: Visit http://localhost:8001/docs to see the FastAPI documentation
2. **Frontend**: Visit http://localhost:3000 to see the landing page
3. **Test Login**: Use the test credentials below

## Test Credentials 🔑

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@codementee.com | Admin@123 |
| **Mentor** | mentor@codementee.com | Mentor@123 |
| **Mentee** | mentee@codementee.com | Mentee@123 |

## Optional: Third-Party Services Setup 🔧

For full functionality, you'll need to configure these services:

### Razorpay (Payment Processing)
1. Create account at [razorpay.com](https://razorpay.com)
2. Get Test API keys from Dashboard → Settings → API Keys
3. Update `backend/.env`:
   ```
   RAZORPAY_KEY_ID=your_test_key_id
   RAZORPAY_KEY_SECRET=your_test_key_secret
   ```

### Resend (Email Service)
1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create API key from Dashboard → API Keys
4. Update `backend/.env`:
   ```
   RESEND_API_KEY=your_resend_api_key
   SENDER_EMAIL=support@yourdomain.com
   BCC_EMAIL=admin@yourdomain.com
   ```

## Development Workflow 🔄

1. **Backend Changes**: The server auto-reloads with `--reload` flag
2. **Frontend Changes**: React dev server auto-reloads
3. **Database Changes**: Use MongoDB Atlas web interface or MongoDB Compass

## Common Issues & Solutions 🔧

### Backend Issues

**Issue**: `ModuleNotFoundError` for dependencies
```bash
# Solution: Ensure virtual environment is activated
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

**Issue**: MongoDB connection error
```bash
# Solution: Check your Atlas connection string and network access
# Ensure IP 0.0.0.0/0 is whitelisted in Atlas
```

### Frontend Issues

**Issue**: `yarn start` fails
```bash
# Solution: Clear cache and reinstall
cd frontend
rm -rf node_modules yarn.lock
yarn install
yarn start
```

**Issue**: API calls fail (CORS errors)
```bash
# Solution: Ensure backend is running on port 8001
# Check REACT_APP_BACKEND_URL in frontend/.env
```

## Project Structure 📁

```
/
├── backend/           # FastAPI Python backend
│   ├── server.py      # Main application
│   ├── .env          # Environment variables
│   └── venv/         # Python virtual environment
├── frontend/          # React frontend
│   ├── src/          # Source code
│   ├── .env          # Environment variables
│   └── node_modules/ # Dependencies
└── SETUP_GUIDE.md    # This file
```

## Next Steps 🚀

1. **Explore the Application**: Login with different roles to see various dashboards
2. **Test Booking Flow**: As a mentee, try booking a mock interview
3. **Admin Features**: Use admin account to manage users and system settings
4. **Development**: Start making changes to the codebase

## Support 💬

If you encounter issues:
1. Check the console logs (browser dev tools for frontend, terminal for backend)
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas is properly configured
4. Check that both servers are running on correct ports

Happy coding! 🎉