---
inclusion: auto
---

# Codementee — Full Project Context

## What is Codementee?
Codementee (codementee.io) is a mentorship-based interview preparation platform. Mentees get mock interviews with engineers from top product companies (Amazon, Google, etc.), AI-powered job search and referral tools, resume reviews, and community access. Monetized via tiered subscription plans + standalone AI agent plans.

## Roles & Access

### admin
- Full platform control: user management, pricing, bookings, analytics, payouts, slots, companies
- Can delete users (cascades to notifications, job_matches, applied_jobs, job_preferences, referral_employees)
- Cannot delete self
- Dashboard: `/admin`

### mentor
- Manages slots, views bookings, submits feedback, tracks payouts
- Assigned to mentees by admin (mentees don't pick mentors)
- Dashboard: `/mentor`

### mentee
- Books mock interviews, views feedbacks, uploads resumes, accesses AI tools (if elite plan), community
- Free tier: dashboard exploration + upgrade prompts. Paid tier: full access
- AI tools (job search + referral finder) gated behind `plan_id === 'elite'` OR `role === 'agent_user'`
- Dashboard: `/mentee`

### agent_user
- Standalone AI-only role — sees only AI Job Search, Referral Finder, and Support in sidebar
- Created when a user purchases an agent plan (agent_trial, agent_monthly, agent_quarterly)
- Login redirects to `/mentee/job-search`
- Has full AI tools access, no mock interviews or mentorship features
- Dashboard uses same DashboardLayout with simplified nav

## Pricing Plans

### Mentorship Plans (role: mentee)
- foundation: ₹1,999/month — 1 mock interview
- growth: ₹4,999/3 months — 3 mock interviews
- accelerator: ₹8,999/6 months — 6 mock interviews
- Mock add-ons: mock_1 (₹2,499), mock_3 (₹6,999), mock_5 (₹10,999)

### AI Agent Plans (role: agent_user)
- agent_trial: ₹99/1 month (first month trial)
- agent_monthly: ₹199/month
- agent_quarterly: ₹599/3 months (save ₹98)
- Purchase page: `/agent-purchase?plan=agent_trial`
- Pricing cards shown in AI Features section on homepage

### Plan Access Logic
- Elite mentees get AI tools free (included in plan)
- agent_user role gets AI tools via standalone purchase
- Backend check: `_check_agent_access(user)` allows both `mentee` and `agent_user`
- Frontend check: `isElite = user?.plan_id === 'elite' || user?.role === 'agent_user'`

## Tech Stack

### Frontend
- React 19, React Router 7, Tailwind CSS 3, Shadcn/UI (Radix), Lucide icons
- Build: Create React App + CRACO
- State: React Context (AuthContext, ThemeContext)
- HTTP: Axios with token interceptor (`utils/api.js`)
- Notifications: Sonner toasts
- Theme: Dark/light mode toggle (ThemeContext)

### Backend
- FastAPI (Python 3.11+), Motor (async MongoDB driver)
- Auth: JWT (bcrypt hashing), role-based access
- Payments: Razorpay (live keys)
- Email: Resend API (support@codementee.com)
- AI: Groq API (LLM for job scoring, referral messages, resume parsing)
- Job Search: SerpAPI (Google Jobs engine, `next_page_token` pagination, `ltype=1` for remote)
- Scheduler: APScheduler (daily job search cron at 7 AM IST, feedback requests, slot status updates)

### Infrastructure
- VPS: Hostinger (62.72.13.129), no Docker — systemd services
- Nginx: SSL termination, serves React build, proxies `/api/*` to port 8001
- Backend service: `codementee-backend.service` (uvicorn, 2 workers)
- Database: MongoDB 7.0 local on VPS (port 27017) — NOT Atlas in production
- Deploy: `./deploy.sh` from `/var/www/codementee`

## Key Files

### Backend
- `backend/server.py` — All API routes (~7000 lines), models, email templates, scheduler, payment flow
- `backend/agents/api_routes.py` — AI agent endpoints (job search, referral finder, applied jobs)
- `backend/agents/job_application_agent.py` — SerpAPI integration, AI job scoring, resume parsing
- `backend/agents/referral_finder_agent.py` — LinkedIn scraping via Google, AI referral message drafting
- `backend/requirements.txt` — Python dependencies (includes groq)

### Frontend
- `frontend/src/App.js` — All routes, lazy loading, ScrollToTop
- `frontend/src/components/auth/ProtectedRoute.jsx` — Role-based route guard
- `frontend/src/components/dashboard/DashboardLayout.jsx` — Sidebar nav per role, profile dropdown
- `frontend/src/pages/AgentPurchasePage.jsx` — Standalone agent plan purchase (Razorpay)
- `frontend/src/pages/ApplyPage.jsx` — Mentorship plan purchase (Razorpay)
- `frontend/src/pages/mentee/MenteeJobSearch.jsx` — AI job search UI (tabs: Jobs For You / Applied)
- `frontend/src/pages/mentee/MenteeReferralFinder.jsx` — AI referral finder UI
- `frontend/src/components/landing/AIFeaturesSection.jsx` — Homepage AI section + agent pricing cards

## AI Agents

### Job Search Agent
- User sets preferences (job title, location, skills, experience)
- Paste resume → AI parses skills → auto-fills preferences
- SerpAPI searches Google Jobs (up to 3 pages, `next_page_token` pagination)
- AI (Groq) supplements with additional jobs if SerpAPI returns few
- AI scores each job 0-100 against user profile
- Results saved to `job_matches` collection (deduped by title+company)
- Two tabs: "Jobs For You" and "Applied"
- Mark applied, delete single job, clear all recommendations
- Fake URL detection: regex replaces AI-generated URLs with Google Jobs search (`&udm=8`)
- Daily cron: runs at 7 AM IST, appends new matches, 7-day cleanup
- Email digest after daily search

### Referral Finder Agent
- Enter company name + role filter (required, defaults to "Software Engineer")
- Finds LinkedIn profiles via Google search
- AI drafts 3 message variants (formal, friendly, concise)
- Messages include: user name, experience years, skills, GitHub/LeetCode/LinkedIn URLs, education, projects
- Always includes `Job ID: [JOB_ID]` and `Job Link: [PASTE_JOB_LINK]` placeholders
- Smooth fade/slide transition when messages appear

## Payment Flow
1. User selects plan on `/apply` (mentorship) or `/agent-purchase` (AI agents)
2. Frontend calls `POST /payment/create-order` → creates Razorpay order
3. Razorpay checkout opens in browser
4. On success: `POST /payment/verify` → verifies signature, creates/upgrades user
5. Returns JWT token → auto-login → redirect to dashboard
6. Agent plans: new users get `role: agent_user`, free users upgrading get role changed

## Database Collections
users, orders, companies, time_slots, meet_links, booking_requests, mocks, feedbacks,
pricing_plans, resume_analyses, forum_posts, forum_comments, notifications, bug_reports,
job_preferences, job_matches, applied_jobs, referral_employees, referral_outreach,
resume_review_requests, resume_review_slots, resume_review_bookings, mentor_payouts

## Git Workflow
- Feature branches → PR to mainline (no direct pushes)
- Commit → fetch origin mainline → merge → push origin feature → create PR on GitHub
- Deploy: SSH to VPS → `cd /var/www/codementee && ./deploy.sh`

## Test Credentials
- Admin: admin@codementee.com / Admin@123
- Mentor: mentor@codementee.com / Mentor@123
- Elite mentee: elite@codementee.com / Elite@123
- Agent user: agent@codementee.com / Agent@123
- Free users: register via `/register`

## Important Rules
- Site domain is codementee.io (NOT .com)
- Remove the word "real" from all UI text
- No mocks/placeholders — always implement fully
- User runs servers locally — don't start background processes
- Backend dev: `source venv/bin/activate && uvicorn server:app --reload --host 0.0.0.0 --port 8001`
- Frontend dev: `npm install --legacy-peer-deps` then `npm start`
