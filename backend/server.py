from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import razorpay
import hmac
import hashlib
import resend
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with SSL certificate
import certifi
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
db = client[os.environ['DB_NAME']]

# JWT Config
SECRET_KEY = os.environ.get('JWT_SECRET', 'codementee-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Razorpay Config
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET')
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Resend Email Config
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
BCC_EMAIL = os.environ.get('BCC_EMAIL')
resend.api_key = RESEND_API_KEY

# Logo URL for emails
LOGO_URL = "https://customer-assets.emergentagent.com/job_interview-mentor-8/artifacts/w3mrzkd9_codementee_logo.png"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "mentee"  # admin, mentor, mentee

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str = "active"
    mentor_id: Optional[str] = None
    created_at: datetime

class MockInterview(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mentee_id: str
    mentor_id: str
    scheduled_at: datetime
    meet_link: str = ""
    status: str = "scheduled"  # scheduled, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MockInterviewCreate(BaseModel):
    mentee_id: str
    mentor_id: str
    scheduled_at: datetime
    meet_link: str = ""

class Feedback(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mock_id: str
    mentor_id: str
    mentee_id: str
    problem_solving: int = Field(ge=0, le=5)
    communication: int = Field(ge=0, le=5)
    technical_depth: int = Field(ge=0, le=5)
    code_quality: int = Field(ge=0, le=5)
    overall: int = Field(ge=0, le=5)
    strengths: str
    improvements: str
    hireability: str  # "Strong Hire", "Hire", "Lean No Hire", "No Hire"
    action_items: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FeedbackCreate(BaseModel):
    mock_id: str
    mentee_id: str
    problem_solving: int = Field(ge=0, le=5)
    communication: int = Field(ge=0, le=5)
    technical_depth: int = Field(ge=0, le=5)
    code_quality: int = Field(ge=0, le=5)
    overall: int = Field(ge=0, le=5)
    strengths: str
    improvements: str
    hireability: str
    action_items: str

class AssignMentor(BaseModel):
    mentee_id: str
    mentor_id: str

class UpdateStatus(BaseModel):
    status: str  # Applied, Active, Interviewed, Upgraded, Paused

# ============ PRICING MODELS ============
class PricingPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plan_id: str  # monthly, quarterly, biannual
    name: str
    price: int  # in paise
    duration_months: int
    features: List[str] = []
    is_active: bool = True
    display_order: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PricingPlanCreate(BaseModel):
    plan_id: str
    name: str
    price: int  # in paise
    duration_months: int
    features: List[str] = []
    is_active: bool = True
    display_order: int = 1

class PricingPlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None  # in paise
    duration_months: Optional[int] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

# ============ BOOKING SYSTEM MODELS ============
class CompanyCreate(BaseModel):
    name: str
    logo_url: Optional[str] = ""
    description: Optional[str] = ""

class TimeSlotCreate(BaseModel):
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    mentor_id: Optional[str] = None  # If None, any mentor can take it

class MeetLinkCreate(BaseModel):
    link: str
    name: Optional[str] = ""  # Optional label like "Room 1"

class BookingRequestCreate(BaseModel):
    company_id: str
    slot_ids: List[str]  # Up to 2 preferred slots

class ConfirmBookingRequest(BaseModel):
    booking_request_id: str
    confirmed_slot_id: str
    # meeting_link is now auto-assigned from pool

# ============ HELPERS ============
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": user_id, "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

def serialize_doc(doc):
    if doc and '_id' in doc:
        del doc['_id']
    if doc and 'password' in doc:
        del doc['password']
    return doc

# ============ EMAIL FUNCTIONS ============
async def send_welcome_email(name: str, email: str, plan_name: str, amount: int):
    """Send welcome email to new mentee after successful payment"""
    try:
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                            <!-- Header with Logo -->
                            <tr>
                                <td style="padding: 30px 40px; text-align: center; border-bottom: 1px solid #334155;">
                                    <img src="{LOGO_URL}" alt="Codementee" style="height: 50px; width: auto;" />
                                </td>
                            </tr>
                            
                            <!-- Welcome Message -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #06b6d4; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Welcome to Codementee! 🎉</h1>
                                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hi <strong>{name}</strong>,
                                    </p>
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Thank you for joining Codementee! Your payment has been successfully processed, and your account is now active.
                                    </p>
                                    
                                    <!-- Order Summary -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 30px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <h3 style="color: #06b6d4; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Plan</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{plan_name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Amount Paid</td>
                                                        <td style="color: #10b981; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">₹{amount:,}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- What's Next -->
                                    <h3 style="color: #e2e8f0; margin: 30px 0 16px 0; font-size: 18px;">What's Next?</h3>
                                    <ul style="color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                        <li>A mentor will be assigned to you within 24-48 hours</li>
                                        <li>You'll receive mock interview schedules via email</li>
                                        <li>Access your dashboard to track progress and view feedback</li>
                                    </ul>
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="https://codementee.com/login" style="display: inline-block; background-color: #06b6d4; color: #0f172a; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                                    Go to Dashboard
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                        If you have any questions, feel free to reach out to us at <a href="mailto:Support@codementee.com" style="color: #06b6d4; text-decoration: none;">Support@codementee.com</a>
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                                    <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                                        © 2025 Codementee. All rights reserved.<br>
                                        Real mock interviews with engineers who've cracked product-based companies.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": f"Welcome to Codementee, {name}! 🚀",
            "html": html_content
        }
        
        # Add BCC if configured
        if BCC_EMAIL:
            params["bcc"] = [BCC_EMAIL]
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Welcome email sent to {email}, id: {result.get('id')}")
        return result
    except Exception as e:
        logger.error(f"Failed to send welcome email to {email}: {str(e)}")
        return None

async def send_booking_request_email(mentor_name: str, mentor_email: str, mentee_name: str, company_name: str, slots: list):
    """Send email to mentor when mentee requests a booking"""
    try:
        slots_html = "".join([f"<li style='color: #e2e8f0; padding: 8px 0;'>{slot}</li>" for slot in slots])
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 40px; font-family: Arial, sans-serif; background-color: #0f172a;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden;">
                <div style="padding: 30px; text-align: center; border-bottom: 1px solid #334155;">
                    <img src="{LOGO_URL}" alt="Codementee" style="height: 50px;" />
                </div>
                <div style="padding: 40px;">
                    <h1 style="color: #06b6d4; margin: 0 0 20px 0; font-size: 24px;">New Booking Request 📅</h1>
                    <p style="color: #e2e8f0; font-size: 16px;">Hi {mentor_name},</p>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                        <strong style="color: #e2e8f0;">{mentee_name}</strong> has requested a mock interview for <strong style="color: #06b6d4;">{company_name}</strong>.
                    </p>
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #06b6d4; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase;">Preferred Slots</h3>
                        <ul style="margin: 0; padding-left: 20px;">{slots_html}</ul>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px;">Please login to your dashboard to confirm one of the slots.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://codementee.com/login" style="display: inline-block; background-color: #06b6d4; color: #0f172a; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                            View Request
                        </a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {"from": SENDER_EMAIL, "to": [mentor_email], "subject": f"New Booking Request from {mentee_name}", "html": html_content}
        if BCC_EMAIL:
            params["bcc"] = [BCC_EMAIL]
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Booking request email sent to {mentor_email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send booking request email: {str(e)}")
        return None

async def send_booking_confirmed_email(recipient_name: str, recipient_email: str, company_name: str, slot_time: str, meeting_link: str, is_mentor: bool = False):
    """Send email when booking is confirmed"""
    try:
        role_text = "You have confirmed" if is_mentor else "Your mock interview has been confirmed"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 40px; font-family: Arial, sans-serif; background-color: #0f172a;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden;">
                <div style="padding: 30px; text-align: center; border-bottom: 1px solid #334155;">
                    <img src="{LOGO_URL}" alt="Codementee" style="height: 50px;" />
                </div>
                <div style="padding: 40px;">
                    <h1 style="color: #10b981; margin: 0 0 20px 0; font-size: 24px;">Mock Interview Confirmed ✅</h1>
                    <p style="color: #e2e8f0; font-size: 16px;">Hi {recipient_name},</p>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">{role_text} for <strong style="color: #06b6d4;">{company_name}</strong>.</p>
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <table width="100%">
                            <tr>
                                <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Date & Time</td>
                                <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{slot_time}</td>
                            </tr>
                            <tr>
                                <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Company</td>
                                <td style="color: #06b6d4; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{company_name}</td>
                            </tr>
                        </table>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{meeting_link}" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                            Join Meeting
                        </a>
                    </div>
                    <p style="color: #64748b; font-size: 12px; text-align: center;">Add this to your calendar and be ready 5 minutes early.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {"from": SENDER_EMAIL, "to": [recipient_email], "subject": f"Mock Interview Confirmed - {company_name}", "html": html_content}
        if BCC_EMAIL:
            params["bcc"] = [BCC_EMAIL]
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Booking confirmed email sent to {recipient_email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send booking confirmed email: {str(e)}")
        return None

# ============ AUTH ROUTES ============
@api_router.post("/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "id": str(uuid.uuid4()),
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role,
        "status": "active",
        "mentor_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    return {"message": "User created successfully"}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["role"])
    return {
        "access_token": token,
        "user": serialize_doc(dict(user))
    }

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return serialize_doc(dict(user))

# ============ ADMIN ROUTES ============
@api_router.get("/admin/mentees")
async def get_mentees(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    mentees = await db.users.find({"role": "mentee"}).to_list(1000)
    return [serialize_doc(dict(m)) for m in mentees]

@api_router.get("/admin/mentors")
async def get_mentors(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    mentors = await db.users.find({"role": "mentor"}).to_list(1000)
    return [serialize_doc(dict(m)) for m in mentors]

@api_router.post("/admin/assign-mentor")
async def assign_mentor(data: AssignMentor, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.users.update_one({"id": data.mentee_id}, {"$set": {"mentor_id": data.mentor_id}})
    return {"message": "Mentor assigned"}

@api_router.put("/admin/mentee/{mentee_id}/status")
async def update_mentee_status(mentee_id: str, data: UpdateStatus, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.users.update_one({"id": mentee_id}, {"$set": {"status": data.status}})
    return {"message": "Status updated"}

@api_router.get("/admin/mocks")
async def get_all_mocks(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    mocks = await db.mocks.find().to_list(1000)
    return [serialize_doc(dict(m)) for m in mocks]

@api_router.put("/admin/mock/{mock_id}/complete")
async def mark_mock_complete(mock_id: str, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.mocks.update_one({"id": mock_id}, {"$set": {"status": "completed"}})
    return {"message": "Mock marked as completed"}

@api_router.get("/admin/feedbacks")
async def get_all_feedbacks(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    feedbacks = await db.feedbacks.find().to_list(1000)
    return [serialize_doc(dict(f)) for f in feedbacks]

@api_router.get("/admin/orders")
async def get_all_orders(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    orders = await db.orders.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(dict(o)) for o in orders]

@api_router.get("/admin/revenue-stats")
async def get_revenue_stats(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Get all paid orders
    paid_orders = await db.orders.find({"status": "paid"}).to_list(1000)
    
    # Calculate stats
    total_revenue = sum(o.get("amount", 0) for o in paid_orders) / 100  # Convert paise to rupees
    total_orders = len(paid_orders)
    
    # Revenue by plan
    plan_revenue = {}
    plan_counts = {}
    for order in paid_orders:
        plan = order.get("plan_id", "unknown")
        plan_revenue[plan] = plan_revenue.get(plan, 0) + (order.get("amount", 0) / 100)
        plan_counts[plan] = plan_counts.get(plan, 0) + 1
    
    # Recent orders (last 10)
    recent_orders = paid_orders[:10] if paid_orders else []
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "plan_revenue": plan_revenue,
        "plan_counts": plan_counts,
        "recent_orders": [serialize_doc(dict(o)) for o in recent_orders]
    }

# ============ BOOKING SYSTEM - ADMIN ROUTES ============
@api_router.get("/admin/companies")
async def get_companies(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    companies = await db.companies.find().to_list(1000)
    return [serialize_doc(dict(c)) for c in companies]

@api_router.post("/admin/companies")
async def create_company(data: CompanyCreate, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    company_doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "logo_url": data.logo_url,
        "description": data.description,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.companies.insert_one(company_doc)
    return serialize_doc(company_doc)

@api_router.delete("/admin/companies/{company_id}")
async def delete_company(company_id: str, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.companies.delete_one({"id": company_id})
    return {"message": "Company deleted"}

@api_router.get("/admin/time-slots")
async def get_all_time_slots(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    slots = await db.time_slots.find().sort("date", 1).to_list(1000)
    return [serialize_doc(dict(s)) for s in slots]

@api_router.post("/admin/time-slots")
async def create_time_slot(data: TimeSlotCreate, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    slot_doc = {
        "id": str(uuid.uuid4()),
        "date": data.date,
        "start_time": data.start_time,
        "end_time": data.end_time,
        "mentor_id": data.mentor_id,
        "status": "available",  # available, booked
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.time_slots.insert_one(slot_doc)
    return serialize_doc(slot_doc)

@api_router.delete("/admin/time-slots/{slot_id}")
async def delete_time_slot(slot_id: str, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.time_slots.delete_one({"id": slot_id})
    return {"message": "Time slot deleted"}

@api_router.get("/admin/booking-requests")
async def get_all_booking_requests(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    requests = await db.booking_requests.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(dict(r)) for r in requests]

# ============ ADMIN PRICING MANAGEMENT ============
@api_router.get("/admin/pricing-plans")
async def get_pricing_plans(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    plans = await db.pricing_plans.find().sort("display_order", 1).to_list(100)
    return [serialize_doc(dict(p)) for p in plans]

@api_router.post("/admin/pricing-plans")
async def create_pricing_plan(data: PricingPlanCreate, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Check if plan_id already exists
    existing = await db.pricing_plans.find_one({"plan_id": data.plan_id})
    if existing:
        raise HTTPException(status_code=400, detail="Plan ID already exists")
    
    plan_doc = {
        "id": str(uuid.uuid4()),
        "plan_id": data.plan_id,
        "name": data.name,
        "price": data.price,
        "duration_months": data.duration_months,
        "features": data.features,
        "is_active": data.is_active,
        "display_order": data.display_order,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.pricing_plans.insert_one(plan_doc)
    return serialize_doc(plan_doc)

@api_router.put("/admin/pricing-plans/{plan_id}")
async def update_pricing_plan(plan_id: str, data: PricingPlanUpdate, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    plan = await db.pricing_plans.find_one({"plan_id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Pricing plan not found")
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.pricing_plans.update_one({"plan_id": plan_id}, {"$set": update_data})
    
    updated_plan = await db.pricing_plans.find_one({"plan_id": plan_id})
    return serialize_doc(dict(updated_plan))

@api_router.delete("/admin/pricing-plans/{plan_id}")
async def delete_pricing_plan(plan_id: str, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.pricing_plans.delete_one({"plan_id": plan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pricing plan not found")
    
    return {"message": "Pricing plan deleted successfully"}

# ============ PUBLIC PRICING ROUTES ============
@api_router.get("/pricing-plans")
async def get_public_pricing_plans():
    """Get active pricing plans for public display"""
    plans = await db.pricing_plans.find({"is_active": True}).sort("display_order", 1).to_list(100)
    
    # Transform backend data to frontend format
    transformed_plans = []
    for plan in plans:
        # Calculate per month price
        per_month = plan["price"] // (plan["duration_months"] * 100)  # Convert from paise to rupees
        
        # Determine if popular (middle plan or explicitly marked)
        popular = plan.get("popular", plan["plan_id"] == "quarterly")
        
        # Calculate original price and savings for multi-month plans
        original_price = None
        savings = None
        if plan["duration_months"] > 1:
            monthly_price = 1999  # Base monthly price
            original_price = monthly_price * plan["duration_months"]
            savings_amount = original_price - (plan["price"] // 100)
            if savings_amount > 0:
                savings = f"Save ₹{savings_amount:,}"
        
        # Map duration
        duration_map = {
            1: "1 Month",
            3: "3 Months", 
            6: "6 Months",
            12: "12 Months"
        }
        
        # Map CTA text
        cta_map = {
            "monthly": "Start Monthly",
            "quarterly": "Best Value",
            "biannual": "Maximum Prep"
        }
        
        transformed_plan = {
            "id": plan["plan_id"],
            "name": plan["name"],
            "duration": duration_map.get(plan["duration_months"], f"{plan['duration_months']} Months"),
            "price": plan["price"] // 100,  # Convert from paise to rupees
            "originalPrice": original_price,
            "perMonth": per_month,
            "popular": popular,
            "savings": savings,
            "features": plan.get("features", []),
            "cta": cta_map.get(plan["plan_id"], "Choose Plan")
        }
        transformed_plans.append(transformed_plan)
    
    return transformed_plans

# ============ MEET LINKS MANAGEMENT ============
@api_router.get("/admin/meet-links")
async def get_meet_links(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    links = await db.meet_links.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(dict(l)) for l in links]

@api_router.post("/admin/meet-links")
async def create_meet_link(data: MeetLinkCreate, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Check if link already exists
    existing = await db.meet_links.find_one({"link": data.link})
    if existing:
        raise HTTPException(status_code=400, detail="This link already exists")
    
    link_doc = {
        "id": str(uuid.uuid4()),
        "link": data.link,
        "name": data.name or f"Room {await db.meet_links.count_documents({}) + 1}",
        "status": "available",  # available, in_use
        "current_booking_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.meet_links.insert_one(link_doc)
    return serialize_doc(link_doc)

@api_router.delete("/admin/meet-links/{link_id}")
async def delete_meet_link(link_id: str, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    link = await db.meet_links.find_one({"id": link_id})
    if link and link.get("status") == "in_use":
        raise HTTPException(status_code=400, detail="Cannot delete a link that is currently in use")
    
    await db.meet_links.delete_one({"id": link_id})
    return {"message": "Meet link deleted"}

@api_router.post("/admin/meet-links/{link_id}/release")
async def release_meet_link(link_id: str, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    await db.meet_links.update_one(
        {"id": link_id},
        {"$set": {"status": "available", "current_booking_id": None}}
    )
    return {"message": "Meet link released"}

async def get_available_meet_link():
    """Get an available meet link from the pool"""
    link = await db.meet_links.find_one({"status": "available"})
    return link

async def assign_meet_link(link_id: str, booking_id: str):
    """Mark a meet link as in use"""
    await db.meet_links.update_one(
        {"id": link_id},
        {"$set": {"status": "in_use", "current_booking_id": booking_id}}
    )

# ============ BOOKING SYSTEM - PUBLIC/MENTEE ROUTES ============
@api_router.get("/companies")
async def get_public_companies():
    companies = await db.companies.find().to_list(1000)
    return [serialize_doc(dict(c)) for c in companies]

@api_router.get("/available-slots")
async def get_available_slots(user=Depends(get_current_user)):
    slots = await db.time_slots.find({"status": "available"}).sort("date", 1).to_list(1000)
    return [serialize_doc(dict(s)) for s in slots]

@api_router.post("/mentee/booking-request")
async def create_booking_request(data: BookingRequestCreate, user=Depends(get_current_user)):
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    if len(data.slot_ids) > 2:
        raise HTTPException(status_code=400, detail="Maximum 2 slots allowed")
    
    # Get company details
    company = await db.companies.find_one({"id": data.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get slot details
    slots = await db.time_slots.find({"id": {"$in": data.slot_ids}, "status": "available"}).to_list(10)
    if len(slots) != len(data.slot_ids):
        raise HTTPException(status_code=400, detail="Some slots are not available")
    
    # Get assigned mentor
    mentor = None
    if user.get("mentor_id"):
        mentor = await db.users.find_one({"id": user["mentor_id"]})
    
    if not mentor:
        # Find any available mentor
        mentor = await db.users.find_one({"role": "mentor"})
    
    if not mentor:
        raise HTTPException(status_code=400, detail="No mentor available")
    
    # Create booking request
    slot_details = [{"id": s["id"], "date": s["date"], "start_time": s["start_time"], "end_time": s["end_time"]} for s in slots]
    
    request_doc = {
        "id": str(uuid.uuid4()),
        "mentee_id": user["id"],
        "mentee_name": user["name"],
        "mentee_email": user["email"],
        "mentor_id": mentor["id"],
        "mentor_name": mentor["name"],
        "mentor_email": mentor["email"],
        "company_id": data.company_id,
        "company_name": company["name"],
        "preferred_slots": slot_details,
        "status": "pending",  # pending, confirmed, cancelled
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.booking_requests.insert_one(request_doc)
    
    # Send email to mentor
    slot_strings = [f"{s['date']} at {s['start_time']} - {s['end_time']}" for s in slot_details]
    asyncio.create_task(send_booking_request_email(
        mentor_name=mentor["name"],
        mentor_email=mentor["email"],
        mentee_name=user["name"],
        company_name=company["name"],
        slots=slot_strings
    ))
    
    return serialize_doc(request_doc)

@api_router.get("/mentee/booking-requests")
async def get_mentee_booking_requests(user=Depends(get_current_user)):
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    requests = await db.booking_requests.find({"mentee_id": user["id"]}).sort("created_at", -1).to_list(100)
    return [serialize_doc(dict(r)) for r in requests]

# ============ BOOKING SYSTEM - MENTOR ROUTES ============
@api_router.get("/mentor/booking-requests")
async def get_mentor_booking_requests(user=Depends(get_current_user)):
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    requests = await db.booking_requests.find({"mentor_id": user["id"], "status": "pending"}).sort("created_at", -1).to_list(100)
    return [serialize_doc(dict(r)) for r in requests]

@api_router.post("/mentor/confirm-booking")
async def confirm_booking(data: ConfirmBookingRequest, user=Depends(get_current_user)):
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    # Get booking request
    request = await db.booking_requests.find_one({"id": data.booking_request_id, "mentor_id": user["id"]})
    if not request:
        raise HTTPException(status_code=404, detail="Booking request not found")
    
    if request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Booking already processed")
    
    # Find the confirmed slot
    confirmed_slot = None
    for slot in request["preferred_slots"]:
        if slot["id"] == data.confirmed_slot_id:
            confirmed_slot = slot
            break
    
    if not confirmed_slot:
        raise HTTPException(status_code=400, detail="Invalid slot selection")
    
    # Auto-assign meeting link from pool
    meet_link_doc = await get_available_meet_link()
    if not meet_link_doc:
        raise HTTPException(status_code=400, detail="No available meeting links. Please contact admin to add more.")
    
    meeting_link = meet_link_doc["link"]
    await assign_meet_link(meet_link_doc["id"], data.booking_request_id)
    
    # Update booking request status
    await db.booking_requests.update_one(
        {"id": data.booking_request_id},
        {"$set": {
            "status": "confirmed",
            "confirmed_slot": confirmed_slot,
            "meeting_link": meeting_link,
            "meet_link_id": meet_link_doc["id"],
            "confirmed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Mark the slot as booked
    await db.time_slots.update_one({"id": data.confirmed_slot_id}, {"$set": {"status": "booked"}})
    
    # Create a mock interview record
    mock_doc = {
        "id": str(uuid.uuid4()),
        "mentee_id": request["mentee_id"],
        "mentor_id": user["id"],
        "company_name": request["company_name"],
        "scheduled_at": f"{confirmed_slot['date']}T{confirmed_slot['start_time']}:00",
        "meet_link": meeting_link,
        "status": "scheduled",
        "booking_request_id": data.booking_request_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.mocks.insert_one(mock_doc)
    
    # Get mentee details
    mentee = await db.users.find_one({"id": request["mentee_id"]})
    
    # Send confirmation emails
    slot_time_str = f"{confirmed_slot['date']} at {confirmed_slot['start_time']} - {confirmed_slot['end_time']}"
    
    # Email to mentee
    if mentee:
        asyncio.create_task(send_booking_confirmed_email(
            recipient_name=mentee["name"],
            recipient_email=mentee["email"],
            company_name=request["company_name"],
            slot_time=slot_time_str,
            meeting_link=meeting_link,
            is_mentor=False
        ))
    
    # Email to mentor
    asyncio.create_task(send_booking_confirmed_email(
        recipient_name=user["name"],
        recipient_email=user["email"],
        company_name=request["company_name"],
        slot_time=slot_time_str,
        meeting_link=meeting_link,
        is_mentor=True
    ))
    
    return {"message": "Booking confirmed", "mock_id": mock_doc["id"], "meeting_link": meeting_link}

# ============ MOCK INTERVIEW ROUTES ============
@api_router.post("/mocks")
async def create_mock(mock: MockInterviewCreate, user=Depends(get_current_user)):
    if user["role"] not in ["admin", "mentor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    mock_doc = {
        "id": str(uuid.uuid4()),
        "mentee_id": mock.mentee_id,
        "mentor_id": mock.mentor_id,
        "scheduled_at": mock.scheduled_at.isoformat(),
        "meet_link": mock.meet_link,
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.mocks.insert_one(mock_doc)
    return serialize_doc(mock_doc)

@api_router.get("/mocks")
async def get_mocks(user=Depends(get_current_user)):
    query = {}
    if user["role"] == "mentor":
        query["mentor_id"] = user["id"]
    elif user["role"] == "mentee":
        query["mentee_id"] = user["id"]
    mocks = await db.mocks.find(query).to_list(1000)
    return [serialize_doc(dict(m)) for m in mocks]

# ============ MENTOR ROUTES ============
@api_router.get("/mentor/mentees")
async def get_mentor_mentees(user=Depends(get_current_user)):
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    mentees = await db.users.find({"mentor_id": user["id"], "role": "mentee"}).to_list(1000)
    return [serialize_doc(dict(m)) for m in mentees]

@api_router.post("/mentor/feedback")
async def submit_feedback(feedback: FeedbackCreate, user=Depends(get_current_user)):
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    feedback_doc = {
        "id": str(uuid.uuid4()),
        "mock_id": feedback.mock_id,
        "mentor_id": user["id"],
        "mentee_id": feedback.mentee_id,
        "problem_solving": feedback.problem_solving,
        "communication": feedback.communication,
        "technical_depth": feedback.technical_depth,
        "code_quality": feedback.code_quality,
        "overall": feedback.overall,
        "strengths": feedback.strengths,
        "improvements": feedback.improvements,
        "hireability": feedback.hireability,
        "action_items": feedback.action_items,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.feedbacks.insert_one(feedback_doc)
    await db.mocks.update_one({"id": feedback.mock_id}, {"$set": {"status": "completed"}})
    return serialize_doc(feedback_doc)

@api_router.get("/mentor/feedbacks")
async def get_mentor_feedbacks(user=Depends(get_current_user)):
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    feedbacks = await db.feedbacks.find({"mentor_id": user["id"]}).to_list(1000)
    return [serialize_doc(dict(f)) for f in feedbacks]

# ============ MENTEE ROUTES ============
@api_router.get("/mentee/feedbacks")
async def get_mentee_feedbacks(user=Depends(get_current_user)):
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    feedbacks = await db.feedbacks.find({"mentee_id": user["id"]}).to_list(1000)
    return [serialize_doc(dict(f)) for f in feedbacks]

# ============ USERS LOOKUP ============
@api_router.get("/users/{user_id}")
async def get_user(user_id: str, user=Depends(get_current_user)):
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_doc(dict(target))

# ============ RAZORPAY PAYMENT ROUTES ============
class CreateOrderRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    plan_id: str  # monthly, quarterly, biannual
    current_role: str = ""
    target_role: str = ""
    timeline: str = ""
    struggle: str = ""

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str  # Our internal order ID

PLAN_PRICES = {
    "monthly": 199900,      # ₹1,999 in paise - DEPRECATED: Use dynamic pricing
    "quarterly": 499900,    # ₹4,999 in paise - DEPRECATED: Use dynamic pricing
    "biannual": 899900      # ₹8,999 in paise - DEPRECATED: Use dynamic pricing
}

PLAN_NAMES = {
    "monthly": "Monthly Plan",      # DEPRECATED: Use dynamic pricing
    "quarterly": "3 Months Plan",   # DEPRECATED: Use dynamic pricing
    "biannual": "6 Months Plan"     # DEPRECATED: Use dynamic pricing
}

async def get_pricing_plan(plan_id: str):
    """Get pricing plan from database, fallback to hardcoded values"""
    plan = await db.pricing_plans.find_one({"plan_id": plan_id, "is_active": True})
    if plan:
        return {
            "price": plan["price"],
            "name": plan["name"],
            "duration_months": plan["duration_months"],
            "features": plan.get("features", [])
        }
    
    # Fallback to hardcoded values for backward compatibility
    if plan_id in PLAN_PRICES:
        return {
            "price": PLAN_PRICES[plan_id],
            "name": PLAN_NAMES[plan_id],
            "duration_months": 1 if plan_id == "monthly" else (3 if plan_id == "quarterly" else 6),
            "features": []
        }
    
    return None

@api_router.post("/payment/create-order")
async def create_payment_order(data: CreateOrderRequest):
    # Check if email already exists
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")
    
    # Get pricing plan (dynamic or fallback)
    plan_info = await get_pricing_plan(data.plan_id)
    if not plan_info:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    
    amount = plan_info["price"]
    plan_name = plan_info["name"]
    
    # Create Razorpay order
    try:
        razorpay_order = razorpay_client.order.create({
            "amount": amount,
            "currency": "INR",
            "receipt": f"order_{uuid.uuid4().hex[:10]}",
            "notes": {
                "email": data.email,
                "plan": data.plan_id
            }
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")
    
    # Store order in DB with user details (pending status)
    order_doc = {
        "id": str(uuid.uuid4()),
        "razorpay_order_id": razorpay_order["id"],
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "plan_id": data.plan_id,
        "plan_name": plan_name,
        "amount": amount,
        "current_role": data.current_role,
        "target_role": data.target_role,
        "timeline": data.timeline,
        "struggle": data.struggle,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order_doc)
    
    return {
        "order_id": order_doc["id"],
        "razorpay_order_id": razorpay_order["id"],
        "razorpay_key_id": RAZORPAY_KEY_ID,
        "amount": amount,
        "currency": "INR",
        "name": data.name,
        "email": data.email
    }

@api_router.post("/payment/verify")
async def verify_payment(data: VerifyPaymentRequest):
    # Get order from DB
    order = await db.orders.find_one({"id": data.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["status"] == "paid":
        raise HTTPException(status_code=400, detail="Order already processed")
    
    # Verify signature
    try:
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != data.razorpay_signature:
            raise HTTPException(status_code=400, detail="Payment verification failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signature verification error: {str(e)}")
    
    # Update order status
    await db.orders.update_one(
        {"id": data.order_id},
        {"$set": {
            "status": "paid",
            "razorpay_payment_id": data.razorpay_payment_id,
            "paid_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Create user account
    user_doc = {
        "id": str(uuid.uuid4()),
        "name": order["name"],
        "email": order["email"],
        "password": order["password"],
        "role": "mentee",
        "status": "Active",
        "plan_id": order["plan_id"],
        "plan_name": order["plan_name"],
        "mentor_id": None,
        "current_role": order.get("current_role", ""),
        "target_role": order.get("target_role", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Generate token for auto-login
    token = create_token(user_doc["id"], user_doc["role"])
    
    # Send welcome email (non-blocking)
    asyncio.create_task(send_welcome_email(
        name=order["name"],
        email=order["email"],
        plan_name=order["plan_name"],
        amount=int(order["amount"] / 100)  # Convert paise to rupees
    ))
    
    return {
        "success": True,
        "message": "Payment successful! Welcome to Codementee.",
        "access_token": token,
        "user": serialize_doc(user_doc)
    }

@api_router.get("/payment/config")
async def get_payment_config():
    return {"razorpay_key_id": RAZORPAY_KEY_ID}

@api_router.get("/")
async def root():
    return {"message": "Codementee API"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
