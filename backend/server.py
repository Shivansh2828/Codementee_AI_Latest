from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, File, UploadFile, Form
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
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
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
LOGO_URL = "https://codementee.com/logo.png"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Add validation error handler for better debugging
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error on {request.method} {request.url.path}")
    logger.error(f"Validation errors: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "message": "Validation error - check request data format"
        }
    )

# Health check endpoint (outside /api prefix for Docker health check)
@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring"""
    try:
        # Test database connection
        await db.users.count_documents({})
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")

# ============ MODELS ============
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "mentee"  # admin, mentor, mentee

class FreeUserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    current_role: str = ""
    target_role: str = ""

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
    plan_id: str  # starter, professional, premium
    name: str
    price: int  # in paise
    duration_months: int
    features: List[str] = []
    limits: dict = {}  # Usage limits for the plan
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
    limits: dict = {}
    is_active: bool = True
    display_order: int = 1

class PricingPlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None  # in paise
    duration_months: Optional[int] = None
    features: Optional[List[str]] = None
    limits: Optional[dict] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

# ============ BOOKING SYSTEM MODELS ============
class CompanyCreate(BaseModel):
    name: str
    logo_url: Optional[str] = ""
    description: Optional[str] = ""
    category: Optional[str] = "product"  # "product", "service", "startup", "unicorn"
    interview_tracks: Optional[List[str]] = []  # Available interview tracks for this company
    difficulty_levels: Optional[List[str]] = ["junior", "mid", "senior"]  # Supported levels

class MeetLinkCreate(BaseModel):
    link: str
    name: Optional[str] = ""  # Optional label like "Room 1"

class BookingRequestCreate(BaseModel):
    company_id: str
    slot_ids: List[str]  # Up to 2 preferred slots
    interview_type: str  # "coding", "system_design", "behavioral", "hr_round", "mixed"
    experience_level: str  # "junior", "mid", "senior", "staff_plus"
    specific_topics: Optional[List[str]] = []  # Specific areas to focus on
    additional_notes: Optional[str] = ""
    interview_track: Optional[str] = "general"  # Company-specific track or "general"

class ConfirmBookingRequest(BaseModel):
    booking_request_id: str
    confirmed_slot_id: str
    # meeting_link is now auto-assigned from pool

# ============ MENTOR-CONTROLLED SLOT MANAGEMENT MODELS ============

# Mentor Slot Models
class MentorSlotCreate(BaseModel):
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    meeting_link: str
    interview_types: List[str]  # ["coding", "system_design", "behavioral", "hr_round"]
    experience_levels: List[str]  # ["junior", "mid", "senior", "staff_plus"]
    company_specializations: List[str]  # Company IDs
    preparation_notes: Optional[str] = None

class MentorSlotUpdate(BaseModel):
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    meeting_link: Optional[str] = None
    interview_types: Optional[List[str]] = None
    experience_levels: Optional[List[str]] = None
    company_specializations: Optional[List[str]] = None
    preparation_notes: Optional[str] = None

class MentorSlotResponse(BaseModel):
    id: str
    mentor_id: str
    mentor_name: str
    mentor_email: str
    date: str
    start_time: str
    end_time: str
    meeting_link: str
    status: str  # available, booked, unavailable, completed
    interview_types: List[str]
    experience_levels: List[str]
    company_specializations: List[str]
    preparation_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

# Mentee Booking Models
class SlotFilters(BaseModel):
    interview_type: Optional[str] = None
    experience_level: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    company_id: Optional[str] = None

class AnonymizedSlot(BaseModel):
    id: str
    date: str
    start_time: str
    end_time: str
    interview_types: List[str]
    experience_levels: List[str]
    company_specializations: List[str]
    preparation_notes: Optional[str]
    # Note: mentor_id and mentor_name are excluded

class BookingCreate(BaseModel):
    slot_id: str
    company_id: str
    interview_track: str
    specific_topics: Optional[List[str]] = []
    additional_notes: Optional[str] = ""

class BookingResponse(BaseModel):
    id: str
    slot_id: str
    mentee_id: str
    mentee_name: str
    mentee_email: str
    mentor_id: str
    mentor_name: str
    mentor_email: str
    company_id: str
    company_name: str
    interview_type: str
    experience_level: str
    interview_track: str
    specific_topics: List[str]
    additional_notes: str
    date: str
    start_time: str
    end_time: str
    meeting_link: str
    status: str  # confirmed, completed, cancelled
    feedback_submitted: bool
    feedback_id: Optional[str]
    created_at: datetime
    confirmed_at: datetime
    completed_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    cancelled_by: Optional[str]
    cancellation_reason: Optional[str]

# Admin Analytics Models
class MentorMetrics(BaseModel):
    mentor_id: str
    mentor_name: str
    total_slots_created: int
    total_slots_booked: int
    utilization_rate: float  # booked/created
    average_rating: float
    total_sessions_completed: int

class BookingAnalytics(BaseModel):
    popular_time_slots: dict  # {"Monday 10:00": count}
    interview_type_counts: dict
    company_counts: dict
    booking_trends: List[dict]  # Time series data
    avg_time_to_booking: float  # Hours
    cancellation_rate: float

class RevenueMetrics(BaseModel):
    total_revenue: float
    total_payouts_owed: float
    net_profit: float
    revenue_by_plan: dict
    mentor_payouts: List[dict]  # Per-mentor breakdown

class SessionFilters(BaseModel):
    status: Optional[str] = None  # upcoming, completed, cancelled
    mentor_id: Optional[str] = None
    mentee_id: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    interview_type: Optional[str] = None

class DateRange(BaseModel):
    start_date: str  # YYYY-MM-DD
    end_date: str  # YYYY-MM-DD

# ============ RESUME REVIEW MODELS ============
class ResumeReviewRequest(BaseModel):
    target_role: str
    target_companies: Optional[str] = ""
    specific_focus: Optional[str] = ""
    additional_notes: Optional[str] = ""

# ============ BUG REPORT MODELS ============
class BugReportCreate(BaseModel):
    title: str
    description: str
    severity: str  # low, medium, high, critical
    priority: Optional[str] = "medium"  # low, medium, high, critical
    category: Optional[str] = "bug"  # bug, general, booking, payment, feature
    page: str
    screenshot_url: Optional[str] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None

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

async def send_upgrade_email(name: str, email: str, plan_name: str, amount: int):
    """Send upgrade email to existing user after successful payment"""
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
                            
                            <!-- Upgrade Message -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #10b981; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Account Upgraded! 🚀</h1>
                                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hi <strong>{name}</strong>,
                                    </p>
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Great news! Your account has been successfully upgraded. You now have access to all premium features.
                                    </p>
                                    
                                    <!-- Order Summary -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 30px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <h3 style="color: #10b981; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Upgrade Summary</h3>
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">New Plan</td>
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
                                    
                                    <!-- CTA Button -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="https://codementee.com/mentee" style="display: inline-block; background-color: #10b981; color: #0f172a; padding: 16px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                                            Start Booking Interviews
                                        </a>
                                    </div>
                                    
                                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                                        Questions? Reply to this email or contact us at support@codementee.com
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
            "subject": f"Account Upgraded - Welcome to {plan_name}!",
            "html": html_content
        }
        
        # Add BCC if configured
        if BCC_EMAIL:
            params["bcc"] = [BCC_EMAIL]
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Upgrade email sent to {email}, id: {result.get('id')}")
        return result
    except Exception as e:
        logger.error(f"Failed to send upgrade email to {email}: {str(e)}")
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

async def send_booking_confirmed_email(recipient_name: str, recipient_email: str, company_name: str, slot_time: str, meeting_link: str, is_mentor: bool = False, mentor_name: str = None, mentor_email: str = None):
    """Send email when booking is confirmed"""
    try:
        if is_mentor:
            role_text = "You have confirmed"
            mentor_section = ""
        else:
            role_text = "Your mock interview has been confirmed"
            mentor_section = f"""
                            <tr>
                                <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Mentor</td>
                                <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{mentor_name or 'Assigned'}</td>
                            </tr>
            """ if mentor_name else ""
        
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
                            {mentor_section}
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

async def send_bug_report_email(bug_report: dict):
    """Send email notification to admin when a bug/support request is reported"""
    try:
        severity_colors = {
            "low": "#10b981",
            "medium": "#f59e0b",
            "high": "#ef4444",
            "critical": "#dc2626"
        }
        severity_color = severity_colors.get(bug_report["severity"], "#6b7280")
        
        category_icons = {
            "bug": "🐛",
            "general": "❓",
            "booking": "📅",
            "payment": "💳",
            "feature": "💡"
        }
        category = bug_report.get("category", "bug")
        category_icon = category_icons.get(category, "📝")
        category_name = category.replace("_", " ").title()
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .bug-card {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid {severity_color}; }}
                .severity-badge {{ display: inline-block; padding: 5px 15px; border-radius: 20px; background: {severity_color}; color: white; font-weight: bold; text-transform: uppercase; font-size: 12px; margin-right: 10px; }}
                .category-badge {{ display: inline-block; padding: 5px 15px; border-radius: 20px; background: #06b6d4; color: white; font-weight: bold; text-transform: uppercase; font-size: 12px; }}
                .info-row {{ margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 5px; }}
                .label {{ font-weight: bold; color: #4b5563; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{category_icon} New Support Request</h1>
                    <p>A user has submitted a {category_name} request</p>
                </div>
                <div class="content">
                    <div class="bug-card">
                        <div style="margin-bottom: 15px;">
                            <span class="category-badge">{category_name}</span>
                            <span class="severity-badge">{bug_report["severity"]} Priority</span>
                        </div>
                        
                        <h2 style="color: #1f2937; margin: 15px 0;">{bug_report["title"]}</h2>
                        
                        <div class="info-row">
                            <span class="label">Page:</span> {bug_report.get("page_url", "Not specified")}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Description:</span><br/>
                            <div style="margin-top: 10px; white-space: pre-wrap;">{bug_report["description"]}</div>
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Reporter:</span> {bug_report.get("reporter_name", "Anonymous")} ({bug_report.get("reporter_role", "Unknown")})<br/>
                            <span class="label">Email:</span> {bug_report.get("reporter_email", "Not provided")}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Reported At:</span> {bug_report["created_at"]}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Request ID:</span> {bug_report["id"]}
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #6b7280;">Please review and respond to this request in the admin dashboard.</p>
                        <a href="https://codementee.com/admin/bug-reports" style="display: inline-block; margin-top: 15px; padding: 12px 30px; background: #06b6d4; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Admin Panel</a>
                    </div>
                </div>
                <div class="footer">
                    <p>Codementee Support System</p>
                    <p>This is an automated notification</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Update subject based on category
        subject_prefix = {
            "bug": "🐛 Bug Report",
            "general": "❓ General Query",
            "booking": "📅 Booking Help",
            "payment": "💳 Payment Issue",
            "feature": "💡 Feature Request"
        }.get(category, "📝 Support Request")
        
        params = {
            "from": SENDER_EMAIL,
            "to": [BCC_EMAIL],  # Send to admin email (support@codementee.com)
            "subject": f"{subject_prefix} [{bug_report['severity'].upper()}]: {bug_report['title']}",
            "html": html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Support request email sent to admin: {category} - {bug_report['title']}")
        return result
    except Exception as e:
        logger.error(f"Failed to send bug report email: {str(e)}")
        return None

async def send_resume_request_email(request: dict):
    """Send email notification to admin when a resume review is requested"""
    try:
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .request-card {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }}
                .info-row {{ margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 5px; }}
                .label {{ font-weight: bold; color: #4b5563; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📄 New Resume Review Request</h1>
                    <p>A mentee has submitted their resume for review</p>
                </div>
                <div class="content">
                    <div class="request-card">
                        <h2 style="color: #1f2937; margin: 15px 0;">Resume Review Request</h2>
                        
                        <div class="info-row">
                            <span class="label">Mentee:</span> {request["mentee_name"]}<br/>
                            <span class="label">Email:</span> {request["mentee_email"]}<br/>
                            <span class="label">Plan:</span> {request.get("plan_id", "N/A").upper()}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Target Role:</span> {request["target_role"]}
                        </div>
                        
                        {f'<div class="info-row"><span class="label">Target Companies:</span> {request["target_companies"]}</div>' if request.get("target_companies") else ''}
                        
                        {f'<div class="info-row"><span class="label">Specific Focus:</span> {request["specific_focus"]}</div>' if request.get("specific_focus") else ''}
                        
                        {f'<div class="info-row"><span class="label">Additional Notes:</span><br/><div style="margin-top: 10px; white-space: pre-wrap;">{request["additional_notes"]}</div></div>' if request.get("additional_notes") else ''}
                        
                        <div class="info-row">
                            <span class="label">Resume File:</span> {request["resume_filename"]}<br/>
                            <span class="label">File Type:</span> {request["resume_content_type"]}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Submitted At:</span> {request["created_at"]}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Request ID:</span> {request["id"]}
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #6b7280;">Please review the resume and provide feedback within 2-3 business days.</p>
                        <p style="color: #6b7280;">Access the admin dashboard to download the resume and submit feedback.</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Codementee Resume Review System</p>
                    <p>This is an automated notification</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [BCC_EMAIL],  # Send to admin email
            "subject": f"📄 New Resume Review Request - {request['mentee_name']}",
            "html": html_content,
            "attachments": [
                {
                    "filename": request["resume_filename"],
                    "content": request["resume_data"]  # Base64 encoded content
                }
            ]
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Resume request email sent to admin with attachment")
        return result
    except Exception as e:
        logger.error(f"Failed to send resume request email: {str(e)}")
        return None

async def send_resume_booking_request_email(booking: dict, resume_request: dict):
    """Send email notification to admin when a resume review call is requested"""
    try:
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .booking-card {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }}
                .info-row {{ margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 5px; }}
                .label {{ font-weight: bold; color: #4b5563; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📞 New Resume Review Call Request</h1>
                    <p>A mentee wants to book a 30-min resume review call</p>
                </div>
                <div class="content">
                    <div class="booking-card">
                        <h2 style="color: #1f2937;">Resume Review Call Booking</h2>
                        
                        <div class="info-row">
                            <span class="label">Mentee:</span> {booking["mentee_name"]}<br/>
                            <span class="label">Email:</span> {booking["mentee_email"]}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Target Role:</span> {resume_request["target_role"]}<br/>
                            {f'<span class="label">Target Companies:</span> {resume_request["target_companies"]}<br/>' if resume_request.get("target_companies") else ''}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Preferred Slots:</span><br/>
                            {'<br/>'.join([f"• {slot['date']} at {slot['start_time']} - {slot['end_time']}" for slot in booking["preferred_slots"]])}
                        </div>
                        
                        {f'<div class="info-row"><span class="label">Additional Notes:</span><br/>{booking["additional_notes"]}</div>' if booking.get("additional_notes") else ''}
                        
                        <div class="info-row">
                            <span class="label">Resume File:</span> {resume_request["resume_filename"]}
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #6b7280;">Please assign a mentor and confirm the booking in the admin dashboard.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [BCC_EMAIL],
            "subject": f"📞 Resume Review Call Request - {booking['mentee_name']}",
            "html": html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Resume booking request email sent to admin")
        return result
    except Exception as e:
        logger.error(f"Failed to send resume booking email: {str(e)}")
        return None

async def send_slot_request_email(mentee_name: str, mentee_email: str, resume_request: dict):
    """Send email to admin and mentors when mentee requests more resume review slots"""
    try:
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .alert-card {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }}
                .info-row {{ margin: 10px 0; padding: 10px; background: #fef3c7; border-radius: 5px; }}
                .label {{ font-weight: bold; color: #92400e; }}
                .cta-button {{ display: inline-block; margin-top: 20px; padding: 14px 32px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ More Resume Review Slots Needed!</h1>
                    <p>A mentee is waiting for available slots</p>
                </div>
                <div class="content">
                    <div class="alert-card">
                        <h2 style="color: #92400e; margin: 15px 0;">Slot Request Details</h2>
                        
                        <div class="info-row">
                            <span class="label">Mentee:</span> {mentee_name}<br/>
                            <span class="label">Email:</span> {mentee_email}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Target Role:</span> {resume_request["target_role"]}<br/>
                            {f'<span class="label">Target Companies:</span> {resume_request["target_companies"]}<br/>' if resume_request.get("target_companies") else ''}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">Resume File:</span> {resume_request["resume_filename"]}
                        </div>
                        
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <p style="margin: 0; color: #92400e; font-weight: bold;">
                                ⏰ Action Required: Please create more 30-minute resume review slots
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #6b7280; margin-bottom: 15px;">
                            <strong>For Mentors:</strong> Please create resume review slots in your dashboard<br/>
                            <strong>For Admin:</strong> Please coordinate with mentors to add more availability
                        </p>
                        <a href="https://codementee.com/login" class="cta-button">Go to Dashboard</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Get all mentors
        mentors = await db.users.find({"role": "mentor"}).to_list(1000)
        mentor_emails = [m["email"] for m in mentors]
        
        # Send to admin
        params = {
            "from": SENDER_EMAIL,
            "to": [BCC_EMAIL],  # Admin email
            "cc": mentor_emails,  # CC all mentors
            "subject": f"⚠️ More Resume Review Slots Needed - {mentee_name}",
            "html": html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Slot request email sent to admin and {len(mentor_emails)} mentors")
        return result
    except Exception as e:
        logger.error(f"Failed to send slot request email: {str(e)}")
        return None

async def send_resume_booking_confirmed_email(recipient_name: str, recipient_email: str, slot_time: str, meeting_link: str, is_mentor: bool = False, mentor_name: str = None, mentee_name: str = None, resume_details: dict = None):
    """Send confirmation email for resume review call booking"""
    try:
        if is_mentor:
            title = "Resume Review Call Confirmed"
            message = f"You have a resume review call scheduled with {mentee_name}"
            details_section = f"""
                <div class="info-row">
                    <span class="label">Mentee:</span> {mentee_name}<br/>
                    <span class="label">Target Role:</span> {resume_details.get('target_role', 'N/A')}<br/>
                    {f'<span class="label">Target Companies:</span> {resume_details.get("target_companies")}<br/>' if resume_details.get("target_companies") else ''}
                </div>
                <div class="info-row">
                    <span class="label">Resume File:</span> {resume_details.get('resume_filename', 'N/A')}<br/>
                    <span class="label">Note:</span> Please review the resume before the call
                </div>
            """
        else:
            title = "Resume Review Call Confirmed!"
            message = f"Your 30-minute resume review call with {mentor_name} is confirmed"
            details_section = f"""
                <div class="info-row">
                    <span class="label">Mentor:</span> {mentor_name}<br/>
                    <span class="label">Duration:</span> 30 minutes
                </div>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .info-card {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
                .info-row {{ margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 5px; }}
                .label {{ font-weight: bold; color: #4b5563; }}
                .meeting-link {{ display: inline-block; margin-top: 20px; padding: 14px 32px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ {title}</h1>
                    <p>{message}</p>
                </div>
                <div class="content">
                    <div class="info-card">
                        <h2 style="color: #1f2937;">Call Details</h2>
                        
                        <div class="info-row">
                            <span class="label">Date & Time:</span> {slot_time}
                        </div>
                        
                        {details_section}
                        
                        <div style="text-align: center;">
                            <a href="{meeting_link}" class="meeting-link">Join Meeting</a>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px;">
                            <strong>Reminder:</strong> Please join the call on time. The meeting link will be active 5 minutes before the scheduled time.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [recipient_email],
            "subject": f"✅ Resume Review Call Confirmed - {slot_time}",
            "html": html_content
        }
        
        if BCC_EMAIL:
            params["bcc"] = [BCC_EMAIL]
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Resume booking confirmation email sent to {recipient_email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send resume booking confirmation email: {str(e)}")
        return None

async def send_resume_feedback_email(request: dict, feedback: str, is_update: bool = False):
    """Send email notification to mentee when resume feedback is ready"""
    try:
        title = "🔄 Your Resume Feedback Has Been Updated!" if is_update else "✅ Your Resume Review is Ready!"
        greeting = "We've updated your resume feedback with additional insights!" if is_update else "Great news! Our expert has reviewed your resume"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .feedback-card {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
                .info-row {{ margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 5px; }}
                .label {{ font-weight: bold; color: #4b5563; }}
                .feedback-text {{ background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 15px 0; white-space: pre-wrap; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
                .update-badge {{ background: #06b6d4; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; display: inline-block; margin-bottom: 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{title}</h1>
                    <p>Expert feedback on your resume</p>
                </div>
                <div class="content">
                    <div class="feedback-card">
                        {f'<span class="update-badge">UPDATED FEEDBACK</span>' if is_update else ''}
                        <h2 style="color: #1f2937; margin: 15px 0;">Hi {request["mentee_name"]},</h2>
                        
                        <p style="color: #4b5563; margin: 15px 0;">
                            {greeting} for the <strong>{request["target_role"]}</strong> position.
                        </p>
                        
                        <div class="feedback-text">
                            <strong style="color: #059669;">Expert Feedback:</strong><br/><br/>
                            {feedback}
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://codementee.io/mentee/feedbacks" 
                               style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                View Full Feedback
                            </a>
                        </div>
                        
                        <div class="info-row">
                            <p style="color: #6b7280; margin: 0;">
                                <strong>Next Steps:</strong><br/>
                                1. Review the feedback carefully<br/>
                                2. Update your resume based on suggestions<br/>
                                3. Apply the improvements to your job applications
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #6b7280;">Need more help? Book a mock interview to practice your skills!</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Codementee - Your Interview Prep Partner</p>
                    <p>Questions? Reply to this email or contact support@codementee.com</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        subject_prefix = "🔄 Updated" if is_update else "✅"
        
        params = {
            "from": SENDER_EMAIL,
            "to": [request["mentee_email"]],
            "bcc": [BCC_EMAIL],
            "subject": f"{subject_prefix} Resume Feedback - {request['target_role']}",
            "html": html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Resume feedback email {'update' if is_update else 'submission'} sent to {request['mentee_email']}")
        return result
    except Exception as e:
        logger.error(f"Failed to send resume feedback email: {str(e)}")
        return None

# ============ NEW MENTOR-CONTROLLED SLOT EMAIL FUNCTIONS ============

async def send_new_booking_confirmation_emails(booking: dict):
    """
    Send booking confirmation emails to both mentor and mentee.
    Includes appropriate details for each recipient, preparation instructions if provided,
    and calendar invite attachment.
    Requirements: 6.10, 13.1, 13.2, 13.3, 13.4, 13.5
    """
    try:
        # Format date and time for display
        slot_datetime = f"{booking['date']} at {booking['start_time']} - {booking['end_time']}"
        
        # Generate calendar invite (iCal format)
        start_datetime = datetime.fromisoformat(f"{booking['date']}T{booking['start_time']}:00")
        end_datetime = datetime.fromisoformat(f"{booking['date']}T{booking['end_time']}:00")
        
        # Create iCal content
        ical_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Codementee//Mock Interview//EN
BEGIN:VEVENT
UID:{booking['id']}@codementee.com
DTSTAMP:{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}
DTSTART:{start_datetime.strftime('%Y%m%dT%H%M%S')}
DTEND:{end_datetime.strftime('%Y%m%dT%H%M%S')}
SUMMARY:Mock Interview - {booking['company_name']}
DESCRIPTION:Mock Interview for {booking['company_name']}\\nInterview Type: {booking['interview_type']}\\nMeeting Link: {booking['meeting_link']}
LOCATION:{booking['meeting_link']}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR"""
        
        # Prepare preparation notes section if available
        prep_notes_section = ""
        if booking.get('preparation_notes'):
            prep_notes_section = f"""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #06b6d4;">
                        <h3 style="color: #06b6d4; margin: 0 0 12px 0; font-size: 16px;">📝 Preparation Instructions</h3>
                        <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0;">{booking['preparation_notes']}</p>
                    </div>
            """
        
        # Send email to mentee
        mentee_topics_section = ""
        if booking.get('specific_topics'):
            topics_list = ", ".join(booking['specific_topics'])
            mentee_topics_section = f"""
                            <tr>
                                <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Focus Topics</td>
                                <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{topics_list}</td>
                            </tr>
            """
        
        mentee_html = f"""
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
                            
                            <!-- Confirmation Message -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #10b981; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Mock Interview Confirmed! ✅</h1>
                                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hi <strong>{booking['mentee_name']}</strong>,
                                    </p>
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Great news! Your mock interview has been confirmed. Your mentor <strong style="color: #06b6d4;">{booking['mentor_name']}</strong> is ready to help you prepare for <strong>{booking['company_name']}</strong>.
                                    </p>
                                    
                                    <!-- Session Details -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 30px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <h3 style="color: #06b6d4; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Session Details</h3>
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Date & Time</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{slot_datetime}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Company</td>
                                                        <td style="color: #06b6d4; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['company_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Interview Type</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['interview_type'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Experience Level</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['experience_level'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Mentor</td>
                                                        <td style="color: #10b981; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['mentor_name']}</td>
                                                    </tr>
                                                    {mentee_topics_section}
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    {prep_notes_section}
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="{booking['meeting_link']}" style="display: inline-block; background-color: #10b981; color: white; padding: 16px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                                                    Join Meeting
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                                        📅 A calendar invite is attached to this email<br>
                                        ⏰ Please join 5 minutes early to test your setup
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                                    <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                                        © 2025 Codementee. All rights reserved.<br>
                                        Questions? Reply to this email or contact us at support@codementee.com
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
        
        mentee_params = {
            "from": SENDER_EMAIL,
            "to": [booking['mentee_email']],
            "subject": f"Mock Interview Confirmed - {booking['company_name']} with {booking['mentor_name']}",
            "html": mentee_html,
            "attachments": [{
                "filename": "interview.ics",
                "content": ical_content
            }]
        }
        
        if BCC_EMAIL:
            mentee_params["bcc"] = [BCC_EMAIL]
        
        # Send email to mentor
        mentor_notes_section = ""
        if booking.get('additional_notes'):
            mentor_notes_section = f"""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <h3 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 16px;">💬 Mentee's Additional Notes</h3>
                        <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0;">{booking['additional_notes']}</p>
                    </div>
            """
        
        mentor_topics_section = ""
        if booking.get('specific_topics'):
            topics_html = "".join([f"<li style='color: #e2e8f0; padding: 4px 0;'>{topic}</li>" for topic in booking['specific_topics']])
            mentor_topics_section = f"""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #06b6d4;">
                        <h3 style="color: #06b6d4; margin: 0 0 12px 0; font-size: 16px;">🎯 Mentee's Focus Topics</h3>
                        <ul style="margin: 0; padding-left: 20px;">{topics_html}</ul>
                    </div>
            """
        
        mentor_html = f"""
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
                            
                            <!-- Confirmation Message -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #06b6d4; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">New Mock Interview Scheduled 📅</h1>
                                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hi <strong>{booking['mentor_name']}</strong>,
                                    </p>
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        You have a new mock interview scheduled with <strong style="color: #06b6d4;">{booking['mentee_name']}</strong> for <strong>{booking['company_name']}</strong>.
                                    </p>
                                    
                                    <!-- Session Details -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 30px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <h3 style="color: #06b6d4; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Session Details</h3>
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Date & Time</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{slot_datetime}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Mentee</td>
                                                        <td style="color: #10b981; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['mentee_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Company</td>
                                                        <td style="color: #06b6d4; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['company_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Interview Type</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['interview_type'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Experience Level</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['experience_level'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Interview Track</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['interview_track']}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    {mentor_topics_section}
                                    {mentor_notes_section}
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="{booking['meeting_link']}" style="display: inline-block; background-color: #06b6d4; color: #0f172a; padding: 16px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);">
                                                    Join Meeting
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                                        📅 A calendar invite is attached to this email<br>
                                        ⏰ Please join 5 minutes early to prepare
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                                    <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                                        © 2025 Codementee. All rights reserved.<br>
                                        Questions? Reply to this email or contact us at support@codementee.com
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
        
        mentor_params = {
            "from": SENDER_EMAIL,
            "to": [booking['mentor_email']],
            "subject": f"New Mock Interview - {booking['company_name']} with {booking['mentee_name']}",
            "html": mentor_html,
            "attachments": [{
                "filename": "interview.ics",
                "content": ical_content
            }]
        }
        
        if BCC_EMAIL:
            mentor_params["bcc"] = [BCC_EMAIL]
        
        # Send both emails
        mentee_result = await asyncio.to_thread(resend.Emails.send, mentee_params)
        mentor_result = await asyncio.to_thread(resend.Emails.send, mentor_params)
        
        logger.info(f"Booking confirmation emails sent - Mentee: {mentee_result.get('id')}, Mentor: {mentor_result.get('id')}")
        return {"mentee": mentee_result, "mentor": mentor_result}
        
    except Exception as e:
        logger.error(f"Failed to send booking confirmation emails: {str(e)}")
        return None

async def send_cancellation_notification_emails(booking: dict, cancelled_by_role: str = "mentee", cancellation_reason: str = None):
    """
    Send cancellation notification emails to both mentor and mentee.
    Includes cancellation reason if provided and session details.
    Requirements: 8.5
    """
    try:
        # Format date and time for display
        slot_datetime = f"{booking['date']} at {booking['start_time']} - {booking['end_time']}"
        
        # Prepare cancellation reason section if available
        reason_section = ""
        if cancellation_reason:
            reason_section = f"""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <h3 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 16px;">📝 Cancellation Reason</h3>
                        <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0;">{cancellation_reason}</p>
                    </div>
            """
        
        # Determine who cancelled
        cancelled_by_text = "the mentee" if cancelled_by_role == "mentee" else "the mentor"
        
        # Send email to mentee
        mentee_html = f"""
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
                            
                            <!-- Cancellation Message -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #ef4444; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Mock Interview Cancelled ❌</h1>
                                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hi <strong>{booking['mentee_name']}</strong>,
                                    </p>
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Your mock interview for <strong style="color: #06b6d4;">{booking['company_name']}</strong> has been cancelled by {cancelled_by_text}.
                                    </p>
                                    
                                    <!-- Session Details -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 30px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <h3 style="color: #ef4444; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Cancelled Session Details</h3>
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Date & Time</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{slot_datetime}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Company</td>
                                                        <td style="color: #06b6d4; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['company_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Interview Type</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['interview_type'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Mentor</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['mentor_name']}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    {reason_section}
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="https://codementee.com/mentee/book" style="display: inline-block; background-color: #06b6d4; color: #0f172a; padding: 16px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);">
                                                    Book Another Interview
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                                        Your interview quota has been restored. You can book another session anytime.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                                    <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                                        © 2025 Codementee. All rights reserved.<br>
                                        Questions? Reply to this email or contact us at support@codementee.com
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
        
        # Send email to mentor
        mentor_html = f"""
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
                            
                            <!-- Cancellation Message -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #ef4444; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Mock Interview Cancelled ❌</h1>
                                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hi <strong>{booking['mentor_name']}</strong>,
                                    </p>
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        The mock interview with <strong style="color: #06b6d4;">{booking['mentee_name']}</strong> for <strong>{booking['company_name']}</strong> has been cancelled by {cancelled_by_text}.
                                    </p>
                                    
                                    <!-- Session Details -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 30px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <h3 style="color: #ef4444; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Cancelled Session Details</h3>
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Date & Time</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{slot_datetime}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Mentee</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['mentee_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Company</td>
                                                        <td style="color: #06b6d4; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['company_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Interview Type</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['interview_type'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    {reason_section}
                                    
                                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                                        Your slot has been made available again for other mentees to book.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                                    <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                                        © 2025 Codementee. All rights reserved.<br>
                                        Questions? Reply to this email or contact us at support@codementee.com
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
        
        mentee_params = {
            "from": SENDER_EMAIL,
            "to": [booking['mentee_email']],
            "subject": f"Mock Interview Cancelled - {booking['company_name']}",
            "html": mentee_html
        }
        
        if BCC_EMAIL:
            mentee_params["bcc"] = [BCC_EMAIL]
        
        mentor_params = {
            "from": SENDER_EMAIL,
            "to": [booking['mentor_email']],
            "subject": f"Mock Interview Cancelled - {booking['company_name']} with {booking['mentee_name']}",
            "html": mentor_html
        }
        
        if BCC_EMAIL:
            mentor_params["bcc"] = [BCC_EMAIL]
        
        # Send both emails
        mentee_result = await asyncio.to_thread(resend.Emails.send, mentee_params)
        mentor_result = await asyncio.to_thread(resend.Emails.send, mentor_params)
        
        logger.info(f"Cancellation notification emails sent - Mentee: {mentee_result.get('id')}, Mentor: {mentor_result.get('id')}")
        return {"mentee": mentee_result, "mentor": mentor_result}
        
    except Exception as e:
        logger.error(f"Failed to send cancellation notification emails: {str(e)}")
        return None

async def send_reminder_emails(booking: dict):
    """
    Send reminder emails 24 hours before session.
    Includes session details, preparation tips for mentee, and mentee's topics/notes for mentor.
    Skip if session is cancelled.
    Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
    """
    try:
        # Check if booking is cancelled
        if booking.get('status') == 'cancelled':
            logger.info(f"Skipping reminder emails for cancelled booking {booking['id']}")
            return None
        
        # Format date and time for display
        slot_datetime = f"{booking['date']} at {booking['start_time']} - {booking['end_time']}"
        
        # Send email to mentee with preparation tips
        mentee_prep_tips = """
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
                        <h3 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px;">💡 Preparation Tips</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; font-size: 14px; line-height: 1.8;">
                            <li>Review the company's recent projects and tech stack</li>
                            <li>Practice explaining your thought process out loud</li>
                            <li>Prepare questions to ask your mentor</li>
                            <li>Test your microphone and camera before the session</li>
                            <li>Have a pen and paper ready for notes</li>
                            <li>Join 5 minutes early to ensure everything works</li>
                        </ul>
                    </div>
        """
        
        mentee_html = f"""
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
                            
                            <!-- Reminder Message -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #f59e0b; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Mock Interview Tomorrow! ⏰</h1>
                                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hi <strong>{booking['mentee_name']}</strong>,
                                    </p>
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        This is a friendly reminder that your mock interview with <strong style="color: #06b6d4;">{booking['mentor_name']}</strong> for <strong>{booking['company_name']}</strong> is scheduled for tomorrow!
                                    </p>
                                    
                                    <!-- Session Details -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 30px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <h3 style="color: #f59e0b; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Session Details</h3>
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Date & Time</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{slot_datetime}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Company</td>
                                                        <td style="color: #06b6d4; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['company_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Interview Type</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['interview_type'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Mentor</td>
                                                        <td style="color: #10b981; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['mentor_name']}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    {mentee_prep_tips}
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="{booking['meeting_link']}" style="display: inline-block; background-color: #10b981; color: white; padding: 16px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                                                    Join Meeting
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                                        Good luck! You've got this! 💪
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                                    <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                                        © 2025 Codementee. All rights reserved.<br>
                                        Questions? Reply to this email or contact us at support@codementee.com
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
        
        # Send email to mentor with mentee's topics and notes
        mentor_topics_section = ""
        if booking.get('specific_topics'):
            topics_html = "".join([f"<li style='color: #e2e8f0; padding: 4px 0;'>{topic}</li>" for topic in booking['specific_topics']])
            mentor_topics_section = f"""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #06b6d4;">
                        <h3 style="color: #06b6d4; margin: 0 0 12px 0; font-size: 16px;">🎯 Mentee's Focus Topics</h3>
                        <ul style="margin: 0; padding-left: 20px;">{topics_html}</ul>
                    </div>
            """
        
        mentor_notes_section = ""
        if booking.get('additional_notes'):
            mentor_notes_section = f"""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <h3 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 16px;">💬 Mentee's Additional Notes</h3>
                        <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0;">{booking['additional_notes']}</p>
                    </div>
            """
        
        mentor_html = f"""
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
                            
                            <!-- Reminder Message -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #f59e0b; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Mock Interview Tomorrow! ⏰</h1>
                                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hi <strong>{booking['mentor_name']}</strong>,
                                    </p>
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        This is a friendly reminder that you have a mock interview scheduled tomorrow with <strong style="color: #06b6d4;">{booking['mentee_name']}</strong> for <strong>{booking['company_name']}</strong>.
                                    </p>
                                    
                                    <!-- Session Details -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 30px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <h3 style="color: #f59e0b; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Session Details</h3>
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Date & Time</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{slot_datetime}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Mentee</td>
                                                        <td style="color: #10b981; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['mentee_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Company</td>
                                                        <td style="color: #06b6d4; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['company_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Interview Type</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['interview_type'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Experience Level</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['experience_level'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    {mentor_topics_section}
                                    {mentor_notes_section}
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="{booking['meeting_link']}" style="display: inline-block; background-color: #06b6d4; color: #0f172a; padding: 16px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);">
                                                    Join Meeting
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                                        Please join 5 minutes early to prepare
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                                    <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                                        © 2025 Codementee. All rights reserved.<br>
                                        Questions? Reply to this email or contact us at support@codementee.com
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
        
        mentee_params = {
            "from": SENDER_EMAIL,
            "to": [booking['mentee_email']],
            "subject": f"Reminder: Mock Interview Tomorrow - {booking['company_name']}",
            "html": mentee_html
        }
        
        if BCC_EMAIL:
            mentee_params["bcc"] = [BCC_EMAIL]
        
        mentor_params = {
            "from": SENDER_EMAIL,
            "to": [booking['mentor_email']],
            "subject": f"Reminder: Mock Interview Tomorrow - {booking['company_name']} with {booking['mentee_name']}",
            "html": mentor_html
        }
        
        if BCC_EMAIL:
            mentor_params["bcc"] = [BCC_EMAIL]
        
        # Send both emails
        mentee_result = await asyncio.to_thread(resend.Emails.send, mentee_params)
        mentor_result = await asyncio.to_thread(resend.Emails.send, mentor_params)
        
        logger.info(f"Reminder emails sent - Mentee: {mentee_result.get('id')}, Mentor: {mentor_result.get('id')}")
        return {"mentee": mentee_result, "mentor": mentor_result}
        
    except Exception as e:
        logger.error(f"Failed to send reminder emails: {str(e)}")
        return None

async def check_and_send_reminder_emails():
    """
    Background job to check for sessions 24 hours away and queue reminder emails.
    This should be called by a scheduler (cron job or background task).
    Requirements: 14.1-14.5
    """
    try:
        # Calculate the target date (24 hours from now)
        target_datetime = datetime.now(timezone.utc) + timedelta(hours=24)
        target_date = target_datetime.date().isoformat()
        target_hour = target_datetime.hour
        
        # Find bookings scheduled for approximately 24 hours from now
        # We'll check bookings on the target date within a 2-hour window
        bookings = await db.bookings.find({
            "date": target_date,
            "status": "confirmed"  # Only send reminders for confirmed bookings
        }).to_list(1000)
        
        reminders_sent = 0
        for booking in bookings:
            # Parse the booking time
            booking_hour = int(booking['start_time'].split(':')[0])
            
            # Check if this booking is within our 2-hour window
            if abs(booking_hour - target_hour) <= 1:
                # Send reminder emails
                result = await send_reminder_emails(dict(booking))
                if result:
                    reminders_sent += 1
        
        logger.info(f"Reminder email check complete. Sent {reminders_sent} reminders.")
        return {"reminders_sent": reminders_sent}
        
    except Exception as e:
        logger.error(f"Failed to check and send reminder emails: {str(e)}")
        return None

async def send_feedback_request_emails(booking: dict):
    """
    Send feedback request emails 1 hour after session end time.
    Sent to both mentor and mentee.
    """
    try:
        mentee_name = booking.get("mentee_name", "Mentee")
        mentee_email = booking.get("mentee_email")
        mentor_name = booking.get("mentor_name", "Mentor")
        mentor_email = booking.get("mentor_email")
        company_name = booking.get("company_name", "Company")
        slot_date = booking.get("slot_date")
        slot_time = f"{booking.get('slot_start_time')} - {booking.get('slot_end_time')}"
        
        if not mentee_email or not mentor_email:
            logger.error("Missing email addresses for feedback request")
            return None
        
        # Format date nicely
        try:
            date_obj = datetime.fromisoformat(slot_date.replace('Z', '+00:00'))
            formatted_date = date_obj.strftime("%B %d, %Y")
        except:
            formatted_date = slot_date
        
        # Mentee email
        mentee_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 0; background-color: #f7fafc; }}
                .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; font-weight: 700; }}
                .content {{ padding: 40px 30px; }}
                .content h2 {{ color: #2d3748; font-size: 22px; margin-bottom: 20px; }}
                .content p {{ color: #4a5568; margin-bottom: 16px; font-size: 16px; }}
                .session-details {{ background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 24px 0; border-radius: 8px; }}
                .session-details p {{ margin: 8px 0; color: #2d3748; }}
                .session-details strong {{ color: #1a202c; }}
                .cta-button {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; transition: transform 0.2s; }}
                .cta-button:hover {{ transform: translateY(-2px); }}
                .footer {{ background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }}
                .footer a {{ color: #667eea; text-decoration: none; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📝 Share Your Feedback</h1>
                </div>
                <div class="content">
                    <h2>Hi {mentee_name},</h2>
                    <p>Thank you for completing your mock interview session! We hope it was valuable for your preparation.</p>
                    
                    <div class="session-details">
                        <p><strong>Company:</strong> {company_name}</p>
                        <p><strong>Date:</strong> {formatted_date}</p>
                        <p><strong>Time:</strong> {slot_time}</p>
                        <p><strong>Mentor:</strong> {mentor_name}</p>
                    </div>
                    
                    <p>Your feedback helps us improve our service and helps other mentees make informed decisions. Please take a moment to share your experience.</p>
                    
                    <center>
                        <a href="https://codementee.io/mentee/feedbacks" class="cta-button">Submit Feedback</a>
                    </center>
                    
                    <p style="margin-top: 24px; font-size: 14px; color: #718096;">Your honest feedback is greatly appreciated and will help us maintain the quality of our mentorship program.</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br><strong>Team Codementee</strong></p>
                    <p style="margin-top: 16px;">
                        <a href="https://codementee.io">Visit Dashboard</a> | 
                        <a href="mailto:support@codementee.io">Contact Support</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Mentor email
        mentor_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 0; background-color: #f7fafc; }}
                .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; font-weight: 700; }}
                .content {{ padding: 40px 30px; }}
                .content h2 {{ color: #2d3748; font-size: 22px; margin-bottom: 20px; }}
                .content p {{ color: #4a5568; margin-bottom: 16px; font-size: 16px; }}
                .session-details {{ background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 24px 0; border-radius: 8px; }}
                .session-details p {{ margin: 8px 0; color: #2d3748; }}
                .session-details strong {{ color: #1a202c; }}
                .cta-button {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; transition: transform 0.2s; }}
                .cta-button:hover {{ transform: translateY(-2px); }}
                .footer {{ background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }}
                .footer a {{ color: #667eea; text-decoration: none; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📝 Provide Feedback</h1>
                </div>
                <div class="content">
                    <h2>Hi {mentor_name},</h2>
                    <p>Thank you for conducting the mock interview session! Your expertise and guidance are invaluable to our mentees.</p>
                    
                    <div class="session-details">
                        <p><strong>Mentee:</strong> {mentee_name}</p>
                        <p><strong>Company:</strong> {company_name}</p>
                        <p><strong>Date:</strong> {formatted_date}</p>
                        <p><strong>Time:</strong> {slot_time}</p>
                    </div>
                    
                    <p>Please provide detailed feedback on the mentee's performance. Your insights will help them improve and succeed in their interviews.</p>
                    
                    <center>
                        <a href="https://codementee.io/mentor/feedbacks" class="cta-button">Submit Feedback</a>
                    </center>
                    
                    <p style="margin-top: 24px; font-size: 14px; color: #718096;">Your detailed feedback helps mentees understand their strengths and areas for improvement.</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br><strong>Team Codementee</strong></p>
                    <p style="margin-top: 16px;">
                        <a href="https://codementee.io">Visit Dashboard</a> | 
                        <a href="mailto:support@codementee.io">Contact Support</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send mentee email
        mentee_params = {
            "from": f"Codementee <{SENDER_EMAIL}>",
            "to": [mentee_email],
            "subject": f"Share Your Feedback - {company_name} Mock Interview",
            "html": mentee_html
        }
        
        # Send mentor email
        mentor_params = {
            "from": f"Codementee <{SENDER_EMAIL}>",
            "to": [mentor_email],
            "subject": f"Provide Feedback - {mentee_name}'s Mock Interview",
            "html": mentor_html
        }
        
        # Add BCC if configured
        if BCC_EMAIL:
            mentee_params["bcc"] = [BCC_EMAIL]
            mentor_params["bcc"] = [BCC_EMAIL]
        
        # Send both emails
        mentee_result = await asyncio.to_thread(resend.Emails.send, mentee_params)
        mentor_result = await asyncio.to_thread(resend.Emails.send, mentor_params)
        
        logger.info(f"Feedback request emails sent - Mentee: {mentee_result.get('id')}, Mentor: {mentor_result.get('id')}")
        return {"mentee": mentee_result, "mentor": mentor_result}
    except Exception as e:
        logger.error(f"Failed to send feedback request emails: {str(e)}")
        return None

async def send_new_slot_notification_emails(slot: dict):
    """
    Send notification emails to all users (free and paid) when a new slot is created.
    This helps drive engagement and conversions.
    """
    try:
        logger.info(f"📧 Starting slot notification email process for slot {slot.get('id')}")
        
        mentor_name = slot.get("mentor_name", "Mentor")
        slot_date = slot.get("date")
        slot_time = f"{slot.get('start_time')} - {slot.get('end_time')}"
        interview_types = ", ".join([t.replace("_", " ").title() for t in slot.get("interview_types", [])])
        experience_levels = ", ".join([l.replace("_", " ").title() for l in slot.get("experience_levels", [])])
        
        # Format date nicely
        try:
            date_obj = datetime.strptime(slot_date, "%Y-%m-%d")
            formatted_date = date_obj.strftime("%B %d, %Y")
            day_of_week = date_obj.strftime("%A")
        except Exception as e:
            logger.warning(f"Date parsing error: {e}, using raw date")
            formatted_date = slot_date
            day_of_week = ""
        
        # Get all mentee users (both free and paid)
        all_mentees = await db.users.find({"role": "mentee"}).to_list(1000)
        
        if not all_mentees:
            logger.warning("⚠️ No mentees found in database to notify")
            return None
        
        logger.info(f"📨 Found {len(all_mentees)} mentees to notify")
        
        # Send emails in batches to avoid overwhelming the email service
        batch_size = 50
        sent_count = 0
        failed_count = 0
        
        for i in range(0, len(all_mentees), batch_size):
            batch = all_mentees[i:i + batch_size]
            logger.info(f"Processing batch {i//batch_size + 1} ({len(batch)} mentees)")
            
            for mentee in batch:
                mentee_name = mentee.get("name", "there")
                mentee_email = mentee.get("email")
                is_paid = mentee.get("status") == "Active" and mentee.get("plan_id")
                
                if not mentee_email:
                    logger.warning(f"Skipping mentee {mentee.get('id')} - no email")
                    continue
                
                # Customize message based on user status
                if is_paid:
                    cta_text = "Book This Slot Now"
                    cta_url = "https://codementee.io/mentee/slots"
                    message = "A new mock interview slot is now available! Book it before it fills up."
                else:
                    cta_text = "Upgrade & Book Slot"
                    cta_url = "https://codementee.io/register"
                    message = "A new mock interview slot is available! Upgrade to a paid plan to book your session with expert mentors."
                
                html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 0; background-color: #f7fafc; }}
                        .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }}
                        .header {{ background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px 30px; text-align: center; }}
                        .header h1 {{ color: white; margin: 0; font-size: 28px; font-weight: 700; }}
                        .badge {{ display: inline-block; background: rgba(255, 255, 255, 0.2); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }}
                        .content {{ padding: 40px 30px; }}
                        .content h2 {{ color: #2d3748; font-size: 22px; margin-bottom: 20px; }}
                        .content p {{ color: #4a5568; margin-bottom: 16px; font-size: 16px; }}
                        .slot-details {{ background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #06b6d4; padding: 24px; margin: 24px 0; border-radius: 8px; }}
                        .slot-details p {{ margin: 10px 0; color: #0c4a6e; font-size: 15px; }}
                        .slot-details strong {{ color: #075985; }}
                        .slot-details .highlight {{ background: white; padding: 12px; border-radius: 6px; margin-top: 12px; }}
                        .cta-button {{ display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3); }}
                        .cta-button:hover {{ transform: translateY(-2px); box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4); }}
                        .urgency {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 8px; }}
                        .urgency p {{ color: #92400e; margin: 0; font-size: 14px; font-weight: 500; }}
                        .footer {{ background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }}
                        .footer a {{ color: #06b6d4; text-decoration: none; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎯 New Slot Available!</h1>
                            <span class="badge">LIMITED AVAILABILITY</span>
                        </div>
                        <div class="content">
                            <h2>Hi {mentee_name},</h2>
                            <p>{message}</p>
                            
                            <div class="slot-details">
                                <p><strong>📅 Date:</strong> {day_of_week}, {formatted_date}</p>
                                <p><strong>🕐 Time:</strong> {slot_time}</p>
                                <p><strong>👨‍💼 Mentor:</strong> {mentor_name}</p>
                                <div class="highlight">
                                    <p><strong>💼 Interview Types:</strong> {interview_types}</p>
                                    <p><strong>📊 Experience Levels:</strong> {experience_levels}</p>
                                </div>
                            </div>
                            
                            <div class="urgency">
                                <p>⚡ Slots fill up fast! Book now to secure your spot with an expert mentor.</p>
                            </div>
                            
                            <center>
                                <a href="{cta_url}" class="cta-button">{cta_text}</a>
                            </center>
                            
                            <p style="margin-top: 24px; font-size: 14px; color: #718096;">Don't miss this opportunity to practice with industry experts and ace your interviews!</p>
                        </div>
                        <div class="footer">
                            <p>Best regards,<br><strong>Team Codementee</strong></p>
                            <p style="margin-top: 16px;">
                                <a href="https://codementee.io">Visit Dashboard</a> | 
                                <a href="https://codementee.io/pricing">View Pricing</a> |
                                <a href="mailto:support@codementee.io">Contact Support</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """
                
                params = {
                    "from": f"Codementee <{SENDER_EMAIL}>",
                    "to": [mentee_email],
                    "subject": f"🎯 New Mock Interview Slot Available - {formatted_date}",
                    "html": html
                }
                
                # Send email (don't wait for response to speed up batch processing)
                try:
                    result = await asyncio.to_thread(resend.Emails.send, params)
                    sent_count += 1
                    logger.debug(f"✅ Email sent to {mentee_email}, result: {result}")
                except Exception as e:
                    failed_count += 1
                    logger.error(f"❌ Failed to send notification to {mentee_email}: {str(e)}")
                    continue
            
            # Small delay between batches to avoid rate limiting
            if i + batch_size < len(all_mentees):
                await asyncio.sleep(1)
        
        logger.info(f"✅ Slot notification complete: {sent_count} sent, {failed_count} failed out of {len(all_mentees)} total")
        return {"sent_count": sent_count, "failed_count": failed_count, "total": len(all_mentees)}
    except Exception as e:
        logger.error(f"❌ Critical error in send_new_slot_notification_emails: {str(e)}")
        logger.exception(e)  # This will log the full stack trace
        return None

    """
    Send feedback request emails 1 hour after session end time.
    Includes direct link to feedback form and session details.
    Skip if feedback already submitted.
    Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
    """
    try:
        # Check if feedback already submitted
        if booking.get('feedback_submitted'):
            logger.info(f"Skipping feedback request for booking {booking['id']} - feedback already submitted")
            return None
        
        # Format date and time for display
        slot_datetime = f"{booking['date']} at {booking['start_time']} - {booking['end_time']}"
        
        # Generate feedback form links
        mentee_feedback_link = f"https://codementee.com/mentee/feedback/{booking['id']}"
        mentor_feedback_link = f"https://codementee.com/mentor/feedback/{booking['id']}"
        
        # Send email to mentee
        mentee_html = f"""
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
                            
                            <!-- Feedback Request Message -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #06b6d4; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">How Was Your Interview? 💭</h1>
                                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hi <strong>{booking['mentee_name']}</strong>,
                                    </p>
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        We hope your mock interview with <strong style="color: #06b6d4;">{booking['mentor_name']}</strong> went well! Your feedback helps us improve and helps other mentees make informed decisions.
                                    </p>
                                    
                                    <!-- Session Details -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 30px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <h3 style="color: #06b6d4; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Session Details</h3>
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Date & Time</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{slot_datetime}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Company</td>
                                                        <td style="color: #06b6d4; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['company_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Interview Type</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['interview_type'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Mentor</td>
                                                        <td style="color: #10b981; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['mentor_name']}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
                                        <h3 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px;">📝 Your Feedback Matters</h3>
                                        <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0;">
                                            Please take 2 minutes to share your experience. Your honest feedback helps us maintain quality and helps other mentees choose the right mentor.
                                        </p>
                                    </div>
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="{mentee_feedback_link}" style="display: inline-block; background-color: #10b981; color: white; padding: 16px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                                                    Submit Feedback
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                                        This should only take 2 minutes of your time
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                                    <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                                        © 2025 Codementee. All rights reserved.<br>
                                        Questions? Reply to this email or contact us at support@codementee.com
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
        
        # Send email to mentor
        mentor_html = f"""
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
                            
                            <!-- Feedback Request Message -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #06b6d4; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Share Your Feedback 💭</h1>
                                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Hi <strong>{booking['mentor_name']}</strong>,
                                    </p>
                                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Thank you for conducting the mock interview with <strong style="color: #06b6d4;">{booking['mentee_name']}</strong>! Please share your feedback to help them improve.
                                    </p>
                                    
                                    <!-- Session Details -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 30px 0;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <h3 style="color: #06b6d4; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Session Details</h3>
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Date & Time</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{slot_datetime}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Mentee</td>
                                                        <td style="color: #10b981; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['mentee_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Company</td>
                                                        <td style="color: #06b6d4; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['company_name']}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Interview Type</td>
                                                        <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">{booking['interview_type'].replace('_', ' ').title()}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
                                        <h3 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px;">📝 Your Feedback Helps Them Grow</h3>
                                        <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0;">
                                            Please provide constructive feedback on their performance. Your insights will help them prepare better for their actual interviews.
                                        </p>
                                    </div>
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="{mentor_feedback_link}" style="display: inline-block; background-color: #06b6d4; color: #0f172a; padding: 16px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);">
                                                    Submit Feedback
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                                        This should only take 3-5 minutes of your time
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                                    <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                                        © 2025 Codementee. All rights reserved.<br>
                                        Questions? Reply to this email or contact us at support@codementee.com
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
        
        mentee_params = {
            "from": SENDER_EMAIL,
            "to": [booking['mentee_email']],
            "subject": f"How was your interview with {booking['mentor_name']}?",
            "html": mentee_html
        }
        
        if BCC_EMAIL:
            mentee_params["bcc"] = [BCC_EMAIL]
        
        mentor_params = {
            "from": SENDER_EMAIL,
            "to": [booking['mentor_email']],
            "subject": f"Feedback Request - {booking['company_name']} with {booking['mentee_name']}",
            "html": mentor_html
        }
        
        if BCC_EMAIL:
            mentor_params["bcc"] = [BCC_EMAIL]
        
        # Send both emails
        mentee_result = await asyncio.to_thread(resend.Emails.send, mentee_params)
        mentor_result = await asyncio.to_thread(resend.Emails.send, mentor_params)
        
        logger.info(f"Feedback request emails sent - Mentee: {mentee_result.get('id')}, Mentor: {mentor_result.get('id')}")
        return {"mentee": mentee_result, "mentor": mentor_result}
        
    except Exception as e:
        logger.error(f"Failed to send feedback request emails: {str(e)}")
        return None

async def check_and_send_feedback_requests():
    """
    Background job to check for completed sessions and send feedback requests 1 hour after end time.
    This should be called by a scheduler (cron job or background task).
    Requirements: 15.1-15.5
    """
    try:
        # Calculate the target time (1 hour ago)
        target_datetime = datetime.now(timezone.utc) - timedelta(hours=1)
        target_date = target_datetime.date().isoformat()
        target_hour = target_datetime.hour
        
        # Find bookings that ended approximately 1 hour ago
        bookings = await db.bookings.find({
            "date": target_date,
            "status": "confirmed",
            "feedback_submitted": False
        }).to_list(1000)
        
        feedback_requests_sent = 0
        for booking in bookings:
            # Parse the booking end time
            end_hour = int(booking['end_time'].split(':')[0])
            
            # Check if this booking ended within our 2-hour window
            if abs(end_hour - target_hour) <= 1:
                # Send feedback request emails
                result = await send_feedback_request_emails(dict(booking))
                if result:
                    feedback_requests_sent += 1
        
        logger.info(f"Feedback request check complete. Sent {feedback_requests_sent} requests.")
        return {"feedback_requests_sent": feedback_requests_sent}
        
    except Exception as e:
        logger.error(f"Failed to check and send feedback requests: {str(e)}")
        return None

async def update_completed_slot_statuses():
    """
    Background job to check for past sessions and update slot status to "completed".
    This should be called by a scheduler (cron job or background task).
    Requirements: 16.4
    """
    try:
        # Get current date and time
        now = datetime.now(timezone.utc)
        current_date = now.date().isoformat()
        current_time = now.strftime('%H:%M')
        
        # Find all booked slots where the end time has passed
        # First, get all booked slots from today and earlier
        slots = await db.mentor_slots.find({
            "status": "booked",
            "date": {"$lte": current_date}
        }).to_list(1000)
        
        slots_updated = 0
        for slot in slots:
            slot_date = slot['date']
            slot_end_time = slot['end_time']
            
            # Create datetime for slot end
            try:
                slot_end_datetime = datetime.fromisoformat(f"{slot_date}T{slot_end_time}:00")
                if slot_end_datetime.tzinfo is None:
                    slot_end_datetime = slot_end_datetime.replace(tzinfo=timezone.utc)
                
                # If slot end time has passed, update status to completed
                if slot_end_datetime < now:
                    await db.mentor_slots.update_one(
                        {"id": slot['id']},
                        {"$set": {
                            "status": "completed",
                            "updated_at": now.isoformat()
                        }}
                    )
                    slots_updated += 1
                    logger.info(f"Updated slot {slot['id']} to completed status")
            except Exception as e:
                logger.error(f"Failed to process slot {slot.get('id')}: {str(e)}")
                continue
        
        logger.info(f"Slot status update complete. Updated {slots_updated} slots to completed.")
        return {"slots_updated": slots_updated}
        
    except Exception as e:
        logger.error(f"Failed to update completed slot statuses: {str(e)}")
        return None

# ============ SCHEDULER SETUP ============
scheduler = AsyncIOScheduler()

def start_scheduler():
    """
    Start the background scheduler for automated tasks.
    Runs:
    - Slot status updates every hour
    - Reminder emails every hour
    - Feedback requests every hour
    """
    try:
        # Update completed slot statuses every hour
        scheduler.add_job(
            update_completed_slot_statuses,
            CronTrigger(minute=0),  # Run at the top of every hour
            id='update_slot_statuses',
            name='Update completed slot statuses',
            replace_existing=True
        )
        
        # Send reminder emails every hour
        scheduler.add_job(
            check_and_send_reminder_emails,
            CronTrigger(minute=15),  # Run at 15 minutes past every hour
            id='send_reminder_emails',
            name='Send reminder emails for sessions 24h away',
            replace_existing=True
        )
        
        # Send feedback requests every hour
        scheduler.add_job(
            check_and_send_feedback_requests,
            CronTrigger(minute=30),  # Run at 30 minutes past every hour
            id='send_feedback_requests',
            name='Send feedback requests for completed sessions',
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("Background scheduler started successfully")
        logger.info("Scheduled jobs:")
        logger.info("  - Update slot statuses: Every hour at :00")
        logger.info("  - Send reminder emails: Every hour at :15")
        logger.info("  - Send feedback requests: Every hour at :30")
        
    except Exception as e:
        logger.error(f"Failed to start scheduler: {str(e)}")

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

@api_router.post("/auth/register-free")
async def register_free_user(data: FreeUserCreate):
    """Register a free mentee account - no payment required"""
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create free mentee account with quota fields
    user_doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": "mentee",
        "status": "Free",  # Free tier
        "plan_id": None,
        "plan_name": "Free Tier",
        "mentor_id": None,
        "current_role": data.current_role,
        "target_role": data.target_role,
        "interview_quota_total": 0,
        "interview_quota_remaining": 0,
        "plan_features": {
            "mock_interviews": 0,
            "resume_reviews": 0,
            "resume_review_type": "none",
            "offline_profile_creation": 0,
            "ai_tools_access": "none",
            "community_access": False,
            "priority_support": False,
            "strategy_calls": 0,
            "referral_guidance": False
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Generate token for auto-login
    token = create_token(user_doc["id"], user_doc["role"])
    
    return {
        "success": True,
        "message": "Welcome to Codementee! Explore your dashboard to get started.",
        "access_token": token,
        "user": serialize_doc(user_doc)
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    logger.info(f"Login attempt for email: {credentials.email}")
    logger.info(f"Received credentials: email={credentials.email}, password_length={len(credentials.password)}")
    
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        logger.warning(f"User not found: {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user["password"]):
        logger.warning(f"Invalid password for user: {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Ensure user has quota fields (for users created before migration)
    if "interview_quota_total" not in user:
        # Determine quota based on plan
        plan_configs = {
            "starter": {"quota": 1, "features": {
                "mock_interviews": 1, "resume_reviews": 1, "resume_review_type": "email", "offline_profile_creation": 0,
                "ai_tools_access": "limited", "community_access": False, "priority_support": False,
                "strategy_calls": 0, "referral_guidance": False
            }},
            "pro": {"quota": 3, "features": {
                "mock_interviews": 3, "resume_reviews": 1, "resume_review_type": "call", "offline_profile_creation": 0,
                "ai_tools_access": "full", "community_access": True, "priority_support": False,
                "strategy_calls": 1, "referral_guidance": False
            }},
            "elite": {"quota": 6, "features": {
                "mock_interviews": 6, "resume_reviews": 1, "resume_review_type": "call", "offline_profile_creation": 1,
                "ai_tools_access": "full", "community_access": True, "priority_support": True,
                "strategy_calls": 0, "referral_guidance": True
            }}
        }
        
        plan_id = user.get("plan_id")
        if plan_id and plan_id in plan_configs:
            config = plan_configs[plan_id]
            # Count existing bookings
            bookings_count = await db.bookings.count_documents({
                "mentee_id": user["id"],
                "status": {"$in": ["confirmed", "completed"]}
            })
            remaining = max(0, config["quota"] - bookings_count)
            
            # Update user with quota fields
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {
                    "interview_quota_total": config["quota"],
                    "interview_quota_remaining": remaining,
                    "plan_features": config["features"]
                }}
            )
            user["interview_quota_total"] = config["quota"]
            user["interview_quota_remaining"] = remaining
            user["plan_features"] = config["features"]
        else:
            # Free user or unknown plan
            user["interview_quota_total"] = 0
            user["interview_quota_remaining"] = 0
            user["plan_features"] = {
                "mock_interviews": 0, "resume_reviews": 0, "resume_review_type": "none", "offline_profile_creation": 0,
                "ai_tools_access": "none", "community_access": False, "priority_support": False,
                "strategy_calls": 0, "referral_guidance": False
            }
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {
                    "interview_quota_total": 0,
                    "interview_quota_remaining": 0,
                    "plan_features": user["plan_features"]
                }}
            )
    
    logger.info(f"Login successful for user: {credentials.email}")
    token = create_token(user["id"], user["role"])
    return {
        "access_token": token,
        "user": serialize_doc(dict(user))
    }

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return serialize_doc(dict(user))

# ============ ADMIN ROUTES ============

# Admin User Management
@api_router.get("/admin/users")
async def get_all_users(user=Depends(get_current_user)):
    """Get all users for admin management"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    users = await db.users.find({}).sort("created_at", -1).to_list(10000)
    return [serialize_doc(dict(u)) for u in users]

@api_router.put("/admin/users/{user_id}")
async def update_user(user_id: str, updates: dict, user=Depends(get_current_user)):
    """Update user details - admin only"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Validate updates
    allowed_fields = ["name", "email", "role", "status", "plan_id", "plan_name", 
                     "interview_quota_remaining", "resume_review_quota"]
    update_data = {k: v for k, v in updates.items() if k in allowed_fields}
    
    # Handle password update separately (hash it)
    if "password" in updates and updates["password"]:
        update_data["password"] = hash_password(updates["password"])
    
    # Auto-update plan_name when plan_id changes
    if "plan_id" in update_data and update_data["plan_id"]:
        plan = await db.pricing_plans.find_one({"plan_id": update_data["plan_id"]})
        if plan:
            update_data["plan_name"] = plan["name"]
    elif "plan_id" in update_data and not update_data["plan_id"]:
        # If plan_id is None/null, clear plan_name too
        update_data["plan_name"] = None
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db.users.find_one({"id": user_id})
    return serialize_doc(updated_user)

@api_router.post("/admin/users/{user_id}/increase-quota")
async def increase_user_quota(user_id: str, data: dict, user=Depends(get_current_user)):
    """Increase user quota - admin only"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    quota_type = data.get("quota_type")  # "interview_quota_remaining" or "resume_review_quota"
    amount = data.get("amount", 0)
    
    if quota_type not in ["interview_quota_remaining", "resume_review_quota"]:
        raise HTTPException(status_code=400, detail="Invalid quota type")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$inc": {quota_type: amount}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db.users.find_one({"id": user_id})
    return serialize_doc(updated_user)

# Admin Slot Management
@api_router.get("/admin/all-slots")
async def get_all_slots(user=Depends(get_current_user)):
    """Get all mock interview slots across all mentors"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    slots = await db.time_slots.find({}).sort("date", 1).to_list(10000)
    return [serialize_doc(dict(s)) for s in slots]

@api_router.get("/admin/all-resume-slots")
async def get_all_resume_slots(user=Depends(get_current_user)):
    """Get all resume review slots across all mentors"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    slots = await db.resume_review_slots.find({}).sort("date", 1).to_list(10000)
    return [serialize_doc(dict(s)) for s in slots]

@api_router.get("/admin/bookings")
async def get_all_bookings(user=Depends(get_current_user)):
    """Get all bookings across all mentees"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    bookings = await db.bookings.find({}).sort("created_at", -1).to_list(10000)
    return [serialize_doc(dict(b)) for b in bookings]

@api_router.patch("/admin/slots/{slot_id}")
async def admin_update_slot(slot_id: str, data: dict, user=Depends(get_current_user)):
    """Admin can update any slot"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Prepare update data
    update_data = {}
    allowed_fields = ["date", "start_time", "end_time", "meeting_link", "status", 
                     "interview_types", "experience_levels", "company_specializations", 
                     "preparation_notes"]
    
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.time_slots.update_one(
        {"id": slot_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    return {"message": "Slot updated successfully"}

@api_router.patch("/admin/resume-slots/{slot_id}")
async def admin_update_resume_slot(slot_id: str, data: dict, user=Depends(get_current_user)):
    """Admin can update any resume review slot"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Prepare update data
    update_data = {}
    allowed_fields = ["date", "start_time", "end_time", "meeting_link", "status"]
    
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.resume_review_slots.update_one(
        {"id": slot_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    return {"message": "Resume slot updated successfully"}

@api_router.post("/admin/create-slot")
async def admin_create_slot(data: dict, user=Depends(get_current_user)):
    """Admin can create slots on behalf of mentors"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    mentor_id = data.get("mentor_id")
    slot_type = data.get("slot_type", "mock")  # mock or resume
    
    # Get mentor details
    mentor = await db.users.find_one({"id": mentor_id, "role": "mentor"})
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    slot_doc = {
        "id": str(uuid.uuid4()),
        "mentor_id": mentor_id,
        "mentor_name": mentor["name"],
        "mentor_email": mentor["email"],
        "date": data.get("date"),
        "start_time": data.get("start_time"),
        "end_time": data.get("end_time"),
        "meeting_link": data.get("meeting_link"),
        "status": "available",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if slot_type == "mock":
        slot_doc["interview_types"] = data.get("interview_types", [])
        slot_doc["experience_levels"] = data.get("experience_levels", [])
        slot_doc["company_specializations"] = data.get("company_specializations", [])
        slot_doc["preparation_notes"] = data.get("preparation_notes", "")
        await db.time_slots.insert_one(slot_doc)
    else:
        await db.resume_review_slots.insert_one(slot_doc)
    
    return {"message": "Slot created successfully", "slot_id": slot_doc["id"]}

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
    
    # Format orders for consistent display
    formatted_orders = []
    for order in orders:
        formatted_order = serialize_doc(dict(order))
        # Ensure amount is properly formatted (convert to rupees if in paise)
        if formatted_order.get("amount", 0) > 10000:  # Likely in paise
            formatted_order["amount_rupees"] = formatted_order["amount"] / 100
        else:  # Already in rupees
            formatted_order["amount_rupees"] = formatted_order["amount"]
        formatted_orders.append(formatted_order)
    
    return formatted_orders

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

# ============ ADMIN BOOKING REQUESTS ============

@api_router.get("/admin/booking-requests")
async def get_all_booking_requests(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    requests = await db.booking_requests.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(dict(r)) for r in requests]

class AdminConfirmBookingRequest(BaseModel):
    booking_request_id: str
    mentor_id: str
    confirmed_slot_id: str

@api_router.post("/admin/confirm-booking")
async def admin_confirm_booking(data: AdminConfirmBookingRequest, user=Depends(get_current_user)):
    """Admin confirms booking by assigning mentor and slot"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Get booking request
    request = await db.booking_requests.find_one({"id": data.booking_request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Booking request not found")
    
    if request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Booking already processed")
    
    # Get mentor details
    mentor = await db.users.find_one({"id": data.mentor_id, "role": "mentor"})
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
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
        raise HTTPException(status_code=400, detail="No available meeting links. Please add more meeting links first.")
    
    meeting_link = meet_link_doc["link"]
    await assign_meet_link(meet_link_doc["id"], data.booking_request_id)
    
    # Update booking request with mentor assignment and confirmation
    await db.booking_requests.update_one(
        {"id": data.booking_request_id},
        {"$set": {
            "status": "confirmed",
            "mentor_id": mentor["id"],
            "mentor_name": mentor["name"],
            "mentor_email": mentor["email"],
            "confirmed_slot": confirmed_slot,
            "meeting_link": meeting_link,
            "meet_link_id": meet_link_doc["id"],
            "confirmed_at": datetime.now(timezone.utc).isoformat(),
            "confirmed_by": user["id"]
        }}
    )
    
    # Mark the slot as booked
    await db.time_slots.update_one({"id": data.confirmed_slot_id}, {"$set": {"status": "booked"}})
    
    # Create a mock interview record
    mock_doc = {
        "id": str(uuid.uuid4()),
        "mentee_id": request["mentee_id"],
        "mentor_id": mentor["id"],
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
    
    # Email to mentee with mentor details
    if mentee:
        asyncio.create_task(send_booking_confirmed_email(
            recipient_name=mentee["name"],
            recipient_email=mentee["email"],
            company_name=request["company_name"],
            slot_time=slot_time_str,
            meeting_link=meeting_link,
            is_mentor=False,
            mentor_name=mentor["name"],
            mentor_email=mentor["email"]
        ))
    
    # Email to mentor
    asyncio.create_task(send_booking_confirmed_email(
        recipient_name=mentor["name"],
        recipient_email=mentor["email"],
        company_name=request["company_name"],
        slot_time=slot_time_str,
        meeting_link=meeting_link,
        is_mentor=True
    ))
    
    return {
        "message": "Booking confirmed successfully", 
        "mock_id": mock_doc["id"], 
        "meeting_link": meeting_link,
        "mentor_name": mentor["name"]
    }

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
        "limits": data.limits,
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
async def get_public_pricing_plans(response: Response):
    """Get active pricing plans for public display"""
    # Prevent caching to ensure fresh data
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    plans = await db.pricing_plans.find({"is_active": True}).sort("display_order", 1).to_list(100)
    result = [serialize_doc(dict(p)) for p in plans]
    return result

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

# ============ BUG REPORT / SUPPORT REQUEST SYSTEM ============
@api_router.post("/bug-reports")
async def create_bug_report(data: BugReportCreate):
    """Create a bug report - accessible to all users (authenticated or not)"""
    bug_report = {
        "id": str(uuid.uuid4()),
        "title": data.title,
        "description": data.description,
        "severity": data.severity,
        "priority": data.priority if hasattr(data, 'priority') else "medium",
        "category": data.category if hasattr(data, 'category') else "bug",
        "page_url": data.page,
        "screenshot_url": data.screenshot_url if hasattr(data, 'screenshot_url') else None,
        "reporter_id": data.user_id,
        "reporter_name": data.user_name,
        "reporter_email": data.user_email,
        "reporter_role": data.user_role,
        "status": "open",  # open, in_progress, resolved
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bug_reports.insert_one(bug_report)
    
    # Send email notification to admin
    try:
        await send_bug_report_email(bug_report)
    except Exception as e:
        logger.error(f"Failed to send bug report email: {str(e)}")
    
    return {"message": "Bug report submitted successfully", "id": bug_report["id"]}

# Alias for support requests (uses same endpoint)
@api_router.post("/support-requests")
async def create_support_request(data: BugReportCreate):
    """Create a support request - accessible to all users (authenticated or not)"""
    return await create_bug_report(data)

@api_router.get("/admin/bug-reports")
async def get_bug_reports(user=Depends(get_current_user)):
    """Get all bug reports - admin only"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    bug_reports = await db.bug_reports.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(dict(b)) for b in bug_reports]

@api_router.get("/bug-reports/my")
async def get_my_bug_reports(user=Depends(get_current_user)):
    """Get bug reports submitted by current user"""
    bug_reports = await db.bug_reports.find({"reporter_id": user["id"]}).sort("created_at", -1).to_list(1000)
    return [serialize_doc(dict(b)) for b in bug_reports]

@api_router.put("/admin/bug-reports/{bug_id}/status")
async def update_bug_status(bug_id: str, data: dict, user=Depends(get_current_user)):
    """Update bug report status - admin only"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    status = data.get("status")
    if status not in ["open", "in_progress", "resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # Get the bug report
    bug_report = await db.bug_reports.find_one({"id": bug_id})
    if not bug_report:
        raise HTTPException(status_code=404, detail="Bug report not found")
    
    # Update status
    await db.bug_reports.update_one(
        {"id": bug_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create notification for the reporter
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": bug_report["reporter_id"],
        "type": "bug_status_update",
        "title": "Bug Report Status Updated",
        "message": f"Your bug report '{bug_report['title']}' has been marked as {status.replace('_', ' ')}",
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)
    
    return {"message": "Bug report status updated"}

# ============ NOTIFICATION SYSTEM ============
@api_router.get("/notifications")
async def get_notifications(user=Depends(get_current_user)):
    """Get notifications for current user"""
    notifications = await db.notifications.find({"user_id": user["id"]}).sort("created_at", -1).limit(50).to_list(50)
    return [serialize_doc(dict(n)) for n in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user=Depends(get_current_user)):
    """Mark notification as read"""
    await db.notifications.update_one(
        {"id": notification_id, "user_id": user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/mark-all-read")
async def mark_all_notifications_read(user=Depends(get_current_user)):
    """Mark all notifications as read for current user"""
    result = await db.notifications.update_many(
        {"user_id": user["id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"message": f"Marked {result.modified_count} notifications as read"}

@api_router.delete("/notifications/clear-all")
async def clear_all_notifications(user=Depends(get_current_user)):
    """Delete all notifications for current user"""
    result = await db.notifications.delete_many({"user_id": user["id"]})
    return {"message": f"Cleared {result.deleted_count} notifications"}

@api_router.get("/notifications/unread/count")
async def get_unread_count(user=Depends(get_current_user)):
    """Get count of unread notifications"""
    count = await db.notifications.count_documents({"user_id": user["id"], "read": False})
    return {"count": count}

# ============ ADMIN RESUME REVIEW MANAGEMENT ============
@api_router.get("/admin/resume-requests")
async def get_all_resume_requests(user=Depends(get_current_user)):
    """Get all resume review requests - admin only"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    requests = await db.resume_requests.find().sort("created_at", -1).to_list(1000)
    
    # Remove resume_data from response (too large)
    for req in requests:
        if "resume_data" in req:
            del req["resume_data"]
    
    return [serialize_doc(dict(r)) for r in requests]

@api_router.get("/admin/resume-requests/{request_id}/download")
async def admin_download_resume(request_id: str, user=Depends(get_current_user)):
    """Download the submitted resume - admin only"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    request = await db.resume_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Resume request not found")
    
    # Decode base64 data
    import base64
    file_content = base64.b64decode(request["resume_data"])
    
    from fastapi.responses import Response
    return Response(
        content=file_content,
        media_type=request["resume_content_type"],
        headers={"Content-Disposition": f"attachment; filename={request['resume_filename']}"}
    )

@api_router.put("/admin/resume-requests/{request_id}/status")
async def update_resume_status(request_id: str, data: dict, user=Depends(get_current_user)):
    """Update resume request status - admin only"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    status = data.get("status")
    if not status or status not in ["pending", "in_review", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    await db.resume_requests.update_one(
        {"id": request_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Resume request status updated"}

@api_router.post("/admin/resume-requests/{request_id}/feedback")
async def submit_resume_feedback(
    request_id: str,
    feedback_data: dict,
    user=Depends(get_current_user)
):
    """Submit feedback for a resume review - admin only"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    request = await db.resume_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Resume request not found")
    
    # Check if this is an update (already has feedback)
    is_update = request.get("status") == "completed" and request.get("reviewer_notes")
    
    # Structure the feedback object
    feedback = {
        "overall_score": feedback_data.get("overall_score"),
        "ats_score": feedback_data.get("ats_score"),
        "impact_score": feedback_data.get("impact_score"),
        "strengths": feedback_data.get("strengths", ""),
        "improvements": feedback_data.get("improvements", ""),
        "ats_recommendations": feedback_data.get("ats_recommendations", ""),
        "reviewer_notes": feedback_data.get("reviewer_notes", ""),
        "reference_resume_url": feedback_data.get("reference_resume_url", ""),
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "updated": is_update
    }
    
    # Update request with feedback
    await db.resume_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "completed",
            "reviewer_id": user["id"],
            "reviewer_notes": feedback_data.get("reviewer_notes", ""),  # Keep for backward compatibility
            "feedback": feedback,  # New structured feedback
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send email notification to mentee
    try:
        email_subject_prefix = "🔄 Updated" if is_update else "✅"
        await send_resume_feedback_email(request, feedback_data.get("reviewer_notes", ""), is_update)
    except Exception as e:
        logger.error(f"Failed to send resume feedback email: {str(e)}")
    
    return {"message": "Feedback updated successfully" if is_update else "Feedback submitted successfully"}

@api_router.post("/admin/upload-reference-resume")
async def upload_reference_resume(
    file: UploadFile = File(...),
    request_id: str = Form(...),
    user=Depends(get_current_user)
):
    """Upload a reference resume file for a review"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Validate file
    if not file.content_type in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Only PDF and Word documents are allowed")
    
    # Read file content
    file_content = await file.read()
    if len(file_content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    # Store file as base64 in MongoDB (in production, use S3 or similar)
    import base64
    file_base64 = base64.b64encode(file_content).decode('utf-8')
    
    # Create a reference resume document
    reference_doc = {
        "id": str(uuid.uuid4()),
        "request_id": request_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "file_data": file_base64,
        "uploaded_by": user["id"],
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reference_resumes.insert_one(reference_doc)
    
    # Return a download URL
    file_url = f"/api/admin/reference-resume/{reference_doc['id']}/download"
    
    return {"file_url": file_url, "filename": file.filename}

@api_router.get("/admin/reference-resume/{reference_id}/download")
async def download_reference_resume(
    reference_id: str,
    user=Depends(get_current_user)
):
    """Download a reference resume file"""
    # Allow both admin and mentees to download
    if user["role"] not in ["admin", "mentee"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    reference = await db.reference_resumes.find_one({"id": reference_id})
    if not reference:
        raise HTTPException(status_code=404, detail="Reference resume not found")
    
    # Decode base64 file
    import base64
    file_content = base64.b64decode(reference["file_data"])
    
    return Response(
        content=file_content,
        media_type=reference["content_type"],
        headers={
            "Content-Disposition": f"attachment; filename={reference['filename']}"
        }
    )

# ============ BOOKING SYSTEM - PUBLIC/MENTEE ROUTES ============
@api_router.get("/companies")
async def get_public_companies():
    companies = await db.companies.find().to_list(1000)
    return [serialize_doc(dict(c)) for c in companies]

# ============ FOUNDING BATCH SLOTS ============
FOUNDING_SLOTS_TOTAL = 25

@api_router.get("/founding-slots")
async def get_founding_slots():
    """Get founding batch slot availability - public endpoint"""
    try:
        # Count successful founding batch purchases
        # Assuming founding batch is tracked via a specific plan or flag
        founding_purchases = await db.orders.count_documents({
            "status": "success",
            "is_founding_batch": True
        })
        
        remaining = max(0, FOUNDING_SLOTS_TOTAL - founding_purchases)
        
        return {
            "total": FOUNDING_SLOTS_TOTAL,
            "filled": founding_purchases,
            "remaining": remaining,
            "sold_out": remaining == 0
        }
    except Exception as e:
        logger.error(f"Error fetching founding slots: {str(e)}")
        # Return default values on error
        return {
            "total": FOUNDING_SLOTS_TOTAL,
            "filled": 0,
            "remaining": FOUNDING_SLOTS_TOTAL,
            "sold_out": False
        }

@api_router.get("/recent-bookings")
async def get_recent_bookings():
    """Get recent successful bookings for social proof - public endpoint"""
    try:
        # Get recent confirmed bookings (last 24 hours)
        from datetime import datetime, timedelta, timezone
        
        twenty_four_hours_ago = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        
        # Get recent booking requests that were confirmed
        recent_bookings = await db.booking_requests.find({
            "status": "confirmed",
            "confirmed_at": {"$gte": twenty_four_hours_ago}
        }).sort("confirmed_at", -1).limit(20).to_list(20)
        
        # Format for social proof (anonymize data)
        social_proof = []
        for booking in recent_bookings:
            # Extract first name only
            mentee_name = booking.get("mentee_name", "Someone")
            first_name = mentee_name.split()[0] if mentee_name else "Someone"
            
            # Get interview type
            interview_type = booking.get("interview_type", "mock interview")
            interview_type_display = interview_type.replace("_", " ").title()
            
            # Get company name
            company_name = booking.get("company_name", "")
            
            social_proof.append({
                "first_name": first_name,
                "interview_type": interview_type_display,
                "company_name": company_name,
                "timestamp": booking.get("confirmed_at")
            })
        
        return social_proof
    except Exception as e:
        logger.error(f"Error fetching recent bookings: {str(e)}")
        return []

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
        "interview_type": data.interview_type,
        "experience_level": data.experience_level,
        "specific_topics": data.specific_topics,
        "additional_notes": data.additional_notes,
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
            is_mentor=False,
            mentor_name=user["name"],
            mentor_email=user["email"]
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
    feedbacks = await db.feedbacks.find({"mentor_id": user["id"]}).sort("created_at", -1).to_list(1000)
    return [serialize_doc(dict(f)) for f in feedbacks]

@api_router.post("/mentor/feedbacks")
async def create_mentor_feedback(
    rating: int = Form(...),
    technical_skills: str = Form(...),
    communication: str = Form(...),
    problem_solving: str = Form(...),
    areas_of_improvement: str = Form(...),
    overall_feedback: str = Form(...),
    booking_id: str = Form(...),
    mentee_id: str = Form(...),
    mentee_name: str = Form(...),
    user=Depends(get_current_user)
):
    """Create new feedback for a mentee"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    # Validate rating
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    feedback_doc = {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        "mentor_id": user["id"],
        "mentor_name": user["name"],
        "mentee_id": mentee_id,
        "mentee_name": mentee_name,
        "rating": rating,
        "technical_skills": technical_skills,
        "communication": communication,
        "problem_solving": problem_solving,
        "areas_of_improvement": areas_of_improvement,
        "overall_feedback": overall_feedback,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.feedbacks.insert_one(feedback_doc)
    
    # Update booking status to indicate feedback submitted
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"feedback_submitted": True, "feedback_id": feedback_doc["id"]}}
    )
    
    # Create notification for mentee
    mentee_notification = {
        "id": str(uuid.uuid4()),
        "user_id": mentee_id,
        "type": "feedback_received",
        "title": "Feedback Received",
        "message": f"{user['name']} has submitted feedback for your mock interview. Rating: {rating}/5 stars",
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(mentee_notification)
    
    return serialize_doc(feedback_doc)

@api_router.put("/mentor/feedbacks/{feedback_id}")
async def update_mentor_feedback(
    feedback_id: str,
    rating: int = Form(...),
    technical_skills: str = Form(...),
    communication: str = Form(...),
    problem_solving: str = Form(...),
    areas_of_improvement: str = Form(...),
    overall_feedback: str = Form(...),
    user=Depends(get_current_user)
):
    """Update existing feedback"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    # Validate rating
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if feedback exists and belongs to this mentor
    existing = await db.feedbacks.find_one({"id": feedback_id, "mentor_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    update_data = {
        "rating": rating,
        "technical_skills": technical_skills,
        "communication": communication,
        "problem_solving": problem_solving,
        "areas_of_improvement": areas_of_improvement,
        "overall_feedback": overall_feedback,
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.feedbacks.update_one(
        {"id": feedback_id},
        {"$set": update_data}
    )
    
    updated_feedback = await db.feedbacks.find_one({"id": feedback_id})
    return serialize_doc(updated_feedback)

# ============ MENTOR SLOT MANAGEMENT ROUTES ============

def validate_time_range(start_time: str, end_time: str) -> bool:
    """Validate that time range is at least 30 minutes"""
    from datetime import datetime
    start = datetime.strptime(start_time, "%H:%M")
    end = datetime.strptime(end_time, "%H:%M")
    duration = (end - start).total_seconds() / 60
    return duration >= 30

def validate_date_not_past(date_str: str) -> bool:
    """Validate that date is not in the past"""
    from datetime import datetime, date
    slot_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    return slot_date >= date.today()

def validate_meeting_link(link: str) -> bool:
    """Validate meeting link URL format"""
    import re
    # Accept Google Meet, Zoom, and Microsoft Teams URLs
    patterns = [
        r'https?://meet\.google\.com/[a-z\-]+',
        r'https?://[^/]*zoom\.us/j/\d+',  # Fixed: allow subdomains
        r'https?://teams\.microsoft\.com/.*'
    ]
    return any(re.match(pattern, link) for pattern in patterns)

@api_router.post("/mentor/slots")
async def create_mentor_slot(slot_data: MentorSlotCreate, user=Depends(get_current_user)):
    """Create a new availability slot for a mentor"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    # Validate required fields (Pydantic handles this, but explicit check for clarity)
    if not all([slot_data.date, slot_data.start_time, slot_data.end_time, slot_data.meeting_link]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    # Validate time range (minimum 30 minutes)
    if not validate_time_range(slot_data.start_time, slot_data.end_time):
        raise HTTPException(status_code=400, detail="Time range must be at least 30 minutes")
    
    # Validate date is not in the past
    if not validate_date_not_past(slot_data.date):
        raise HTTPException(status_code=400, detail="Date cannot be in the past")
    
    # Validate meeting link URL
    if not validate_meeting_link(slot_data.meeting_link):
        raise HTTPException(status_code=400, detail="Invalid meeting link URL. Must be Google Meet, Zoom, or Microsoft Teams")
    
    # Create slot document
    slot_doc = {
        "id": str(uuid.uuid4()),
        "mentor_id": user["id"],
        "mentor_name": user["name"],
        "mentor_email": user["email"],
        "date": slot_data.date,
        "start_time": slot_data.start_time,
        "end_time": slot_data.end_time,
        "meeting_link": slot_data.meeting_link,
        "status": "available",  # Initial status
        "interview_types": slot_data.interview_types,
        "experience_levels": slot_data.experience_levels,
        "company_specializations": slot_data.company_specializations,
        "preparation_notes": slot_data.preparation_notes,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.mentor_slots.insert_one(slot_doc)
    
    logger.info(f"✅ Slot created: {slot_doc['id']} by mentor {user['id']}")
    logger.info(f"📧 Triggering slot notification emails...")
    
    # Send notification emails to all mentees (both free and paid) in the background
    # This runs asynchronously without blocking the response
    asyncio.create_task(send_new_slot_notification_emails(slot_doc))
    
    return serialize_doc(slot_doc)

@api_router.get("/mentor/slots")
async def get_mentor_slots(status: Optional[str] = None, user=Depends(get_current_user)):
    """Get all slots for a mentor with optional status filtering"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    query = {"mentor_id": user["id"]}
    if status:
        query["status"] = status
    
    slots = await db.mentor_slots.find(query).sort("date", 1).to_list(1000)
    return [serialize_doc(dict(s)) for s in slots]

@api_router.put("/mentor/slots/{slot_id}")
async def update_mentor_slot(slot_id: str, updates: MentorSlotUpdate, user=Depends(get_current_user)):
    """Update an existing slot (with restrictions for booked slots)"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    # Get the slot
    slot = await db.mentor_slots.find_one({"id": slot_id})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    # Check ownership
    if slot["mentor_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your slot")
    
    # Prepare update fields
    update_fields = {}
    
    # If slot is booked, only allow notes updates
    if slot["status"] == "booked":
        if updates.preparation_notes is not None:
            update_fields["preparation_notes"] = updates.preparation_notes
        
        # Reject other field updates
        if any([
            updates.date is not None,
            updates.start_time is not None,
            updates.end_time is not None,
            updates.meeting_link is not None,
            updates.interview_types is not None,
            updates.experience_levels is not None,
            updates.company_specializations is not None
        ]):
            raise HTTPException(status_code=400, detail="Cannot modify date, time, or meeting link for booked slots. Only preparation notes can be updated.")
    else:
        # For available slots, allow all updates
        if updates.date is not None:
            if not validate_date_not_past(updates.date):
                raise HTTPException(status_code=400, detail="Date cannot be in the past")
            update_fields["date"] = updates.date
        
        if updates.start_time is not None:
            update_fields["start_time"] = updates.start_time
        
        if updates.end_time is not None:
            update_fields["end_time"] = updates.end_time
        
        # Validate time range if both times are being updated
        if updates.start_time or updates.end_time:
            start = updates.start_time or slot["start_time"]
            end = updates.end_time or slot["end_time"]
            if not validate_time_range(start, end):
                raise HTTPException(status_code=400, detail="Time range must be at least 30 minutes")
        
        if updates.meeting_link is not None:
            if not validate_meeting_link(updates.meeting_link):
                raise HTTPException(status_code=400, detail="Invalid meeting link URL")
            update_fields["meeting_link"] = updates.meeting_link
        
        if updates.interview_types is not None:
            update_fields["interview_types"] = updates.interview_types
        
        if updates.experience_levels is not None:
            update_fields["experience_levels"] = updates.experience_levels
        
        if updates.company_specializations is not None:
            update_fields["company_specializations"] = updates.company_specializations
        
        if updates.preparation_notes is not None:
            update_fields["preparation_notes"] = updates.preparation_notes
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_fields["updated_at"] = datetime.now(timezone.utc)
    
    await db.mentor_slots.update_one({"id": slot_id}, {"$set": update_fields})
    
    updated_slot = await db.mentor_slots.find_one({"id": slot_id})
    return serialize_doc(dict(updated_slot))

@api_router.delete("/mentor/slots/{slot_id}")
async def delete_mentor_slot(slot_id: str, user=Depends(get_current_user)):
    """Delete a slot (only if not booked)"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    # Get the slot
    slot = await db.mentor_slots.find_one({"id": slot_id})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    # Check ownership
    if slot["mentor_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your slot")
    
    # Prevent deletion if booked
    if slot["status"] == "booked":
        raise HTTPException(status_code=400, detail="Cannot delete a booked slot. Please contact admin if you need to cancel.")
    
    await db.mentor_slots.delete_one({"id": slot_id})
    return {"message": "Slot deleted successfully"}

@api_router.patch("/mentor/slots/{slot_id}")
async def update_slot(slot_id: str, data: dict, user=Depends(get_current_user)):
    """Update slot details (date, time, meeting link)"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    slot = await db.mentor_slots.find_one({"id": slot_id, "mentor_id": user["id"]})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    if slot["status"] != "available":
        raise HTTPException(status_code=400, detail="Can only edit available slots")
    
    update_data = {}
    if "date" in data:
        update_data["date"] = data["date"]
    if "start_time" in data:
        update_data["start_time"] = data["start_time"]
    if "end_time" in data:
        update_data["end_time"] = data["end_time"]
    if "meeting_link" in data:
        update_data["meeting_link"] = data["meeting_link"]
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.mentor_slots.update_one({"id": slot_id}, {"$set": update_data})
    return {"message": "Slot updated successfully"}

@api_router.patch("/mentor/slots/{slot_id}/availability")
async def toggle_slot_availability(slot_id: str, available: bool, user=Depends(get_current_user)):
    """Mark slot as available/unavailable"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    # Get the slot
    slot = await db.mentor_slots.find_one({"id": slot_id})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    # Check ownership
    if slot["mentor_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your slot")
    
    # Determine new status
    if available:
        # Only set to available if not booked or completed
        if slot["status"] in ["booked", "completed"]:
            raise HTTPException(status_code=400, detail="Cannot make booked or completed slots available")
        new_status = "available"
    else:
        new_status = "unavailable"
    
    await db.mentor_slots.update_one(
        {"id": slot_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    updated_slot = await db.mentor_slots.find_one({"id": slot_id})
    return serialize_doc(dict(updated_slot))

@api_router.get("/mentor/bookings")
async def get_mentor_bookings(user=Depends(get_current_user)):
    """Get all bookings for a mentor, separated by upcoming and past"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    # Get all bookings for this mentor
    all_bookings = await db.bookings.find({"mentor_id": user["id"]}).to_list(1000)
    
    # Separate into upcoming and past
    now = datetime.now(timezone.utc).date()
    upcoming = []
    past = []
    
    for booking in all_bookings:
        booking_date = datetime.strptime(booking["date"], "%Y-%m-%d").date()
        if booking_date >= now:
            upcoming.append(serialize_doc(dict(booking)))
        else:
            past.append(serialize_doc(dict(booking)))
    
    # Sort upcoming by date ascending, past by date descending
    upcoming.sort(key=lambda x: (x["date"], x["start_time"]))
    past.sort(key=lambda x: (x["date"], x["start_time"]), reverse=True)
    
    return {
        "upcoming": upcoming,
        "past": past
    }

# ============ MENTEE ROUTES ============

@api_router.get("/mentee/slots/browse")
async def browse_available_slots(
    interview_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    company_id: Optional[str] = None,
    user=Depends(get_current_user)
):
    """
    Browse available slots with filtering.
    Returns only available slots with future dates, hiding mentor identity.
    Supports filtering by interview_type, experience_level, date_range, and company.
    """
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Build query - only available slots with future dates
    today = datetime.now(timezone.utc).date().isoformat()
    query = {
        "status": "available",
        "date": {"$gte": today}
    }
    
    # Apply filters (AND logic)
    if interview_type:
        query["interview_types"] = interview_type
    
    if experience_level:
        query["experience_levels"] = experience_level
    
    if date_from:
        query["date"]["$gte"] = date_from
    
    if date_to:
        if "$lte" not in query.get("date", {}):
            query["date"] = query.get("date", {})
        query["date"]["$lte"] = date_to
    
    if company_id:
        query["company_specializations"] = company_id
    
    # Fetch slots
    slots = await db.mentor_slots.find(query).to_list(1000)
    
    # Sort by date and time ascending
    slots.sort(key=lambda x: (x["date"], x["start_time"]))
    
    # Return anonymized slots (hide mentor identity)
    anonymized_slots = []
    for slot in slots:
        anonymized_slot = {
            "id": slot["id"],
            "date": slot["date"],
            "start_time": slot["start_time"],
            "end_time": slot["end_time"],
            "interview_types": slot["interview_types"],
            "experience_levels": slot["experience_levels"],
            "company_specializations": slot["company_specializations"],
            "preparation_notes": slot.get("preparation_notes")
        }
        anonymized_slots.append(anonymized_slot)
    
    return anonymized_slots

@api_router.post("/mentee/bookings")
async def create_booking(booking_data: BookingCreate, user=Depends(get_current_user)):
    """
    Create a booking for an available slot.
    Validates tier, quota, company selection, and slot availability.
    Implements slot locking for concurrent access prevention.
    """
    # Log incoming request for debugging
    logger.info(f"Booking request from user {user['id']}: {booking_data.dict()}")
    
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Verify mentee tier (paid only)
    if user.get("status") == "Free" or not user.get("plan_id"):
        raise HTTPException(
            status_code=403,
            detail={
                "error": "authorization_error",
                "message": "Upgrade to a paid plan to book mock interviews",
                "code": "TIER_UPGRADE_REQUIRED",
                "upgrade_url": "/mentee/book"
            }
        )
    
    # Check interview quota
    quota_remaining = user.get("interview_quota_remaining", 0)
    if quota_remaining <= 0:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "quota_exceeded",
                "message": "You have used all interviews in your plan",
                "code": "INTERVIEW_QUOTA_EXCEEDED",
                "remaining_quota": 0,
                "upgrade_url": "/mentee/book"
            }
        )
    
    # Acquire slot lock for transaction (using MongoDB findAndModify for atomicity)
    slot_lock_result = await db.mentor_slots.find_one_and_update(
        {
            "id": booking_data.slot_id,
            "status": "available",
            "$or": [
                {"lock": {"$exists": False}},
                {"lock.expires_at": {"$lt": datetime.now(timezone.utc)}}
            ]
        },
        {
            "$set": {
                "lock": {
                    "locked_by": user["id"],
                    "locked_at": datetime.now(timezone.utc),
                    "expires_at": datetime.now(timezone.utc) + timedelta(seconds=30)
                }
            }
        },
        return_document=True
    )
    
    if not slot_lock_result:
        # Slot not available or already locked
        raise HTTPException(
            status_code=409,
            detail={
                "error": "conflict",
                "message": "This slot is no longer available or is being booked by another user",
                "code": "SLOT_NOT_AVAILABLE"
            }
        )
    
    try:
        slot = dict(slot_lock_result)
        
        # Validate company is in slot's specializations (if specializations are specified)
        # If company_specializations is empty or not set, allow any company
        if slot.get("company_specializations") and len(slot["company_specializations"]) > 0:
            if booking_data.company_id not in slot["company_specializations"]:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "validation_error",
                        "message": "Selected company is not in slot's specializations",
                        "field": "company_id",
                        "code": "INVALID_COMPANY_SELECTION"
                    }
                )
        
        # Get company details
        company = await db.companies.find_one({"id": booking_data.company_id})
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Determine interview type and experience level from slot
        # For now, use the first values (in a real system, mentee would select these)
        interview_type = slot["interview_types"][0] if slot["interview_types"] else "coding"
        experience_level = slot["experience_levels"][0] if slot["experience_levels"] else "mid"
        
        # Create booking record
        booking_id = str(uuid.uuid4())
        booking_doc = {
            "id": booking_id,
            "slot_id": slot["id"],
            "mentee_id": user["id"],
            "mentee_name": user["name"],
            "mentee_email": user["email"],
            "mentor_id": slot["mentor_id"],
            "mentor_name": slot["mentor_name"],
            "mentor_email": slot["mentor_email"],
            "company_id": booking_data.company_id,
            "company_name": company["name"],
            "interview_type": interview_type,
            "experience_level": experience_level,
            "interview_track": booking_data.interview_track,
            "specific_topics": booking_data.specific_topics or [],
            "additional_notes": booking_data.additional_notes or "",
            "date": slot["date"],
            "start_time": slot["start_time"],
            "end_time": slot["end_time"],
            "meeting_link": slot["meeting_link"],
            "status": "confirmed",
            "cancelled_by": None,
            "cancellation_reason": None,
            "feedback_submitted": False,
            "feedback_id": None,
            "created_at": datetime.now(timezone.utc),
            "confirmed_at": datetime.now(timezone.utc),
            "completed_at": None,
            "cancelled_at": None
        }
        
        await db.bookings.insert_one(booking_doc)
        
        # Create notifications for mentee and mentor
        mentee_notification = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "booking_confirmed",
            "title": "Mock Interview Booked!",
            "message": f"Your mock interview with {slot['mentor_name']} for {company['name']} is confirmed on {slot['date']} at {slot['start_time']}",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(mentee_notification)
        logger.info(f"✅ Created mentee notification: {mentee_notification['id']} for user {user['id']}")
        
        mentor_notification = {
            "id": str(uuid.uuid4()),
            "user_id": slot["mentor_id"],
            "type": "new_booking",
            "title": "New Booking Received",
            "message": f"{user['name']} booked your slot for {company['name']} on {slot['date']} at {slot['start_time']}",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(mentor_notification)
        logger.info(f"✅ Created mentor notification: {mentor_notification['id']} for user {slot['mentor_id']}")
        
        # Update slot status to "booked" and remove lock
        await db.mentor_slots.update_one(
            {"id": slot["id"]},
            {
                "$set": {"status": "booked", "updated_at": datetime.now(timezone.utc)},
                "$unset": {"lock": ""}
            }
        )
        
        # Decrement mentee quota
        await db.users.update_one(
            {"id": user["id"]},
            {
                "$inc": {"interview_quota_remaining": -1},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            }
        )
        
        # Send confirmation emails (async, don't wait)
        asyncio.create_task(send_new_booking_confirmation_emails(booking_doc))
        
        # Return booking response with revealed mentor information
        return {
            "id": booking_doc["id"],
            "slot_id": booking_doc["slot_id"],
            "mentee_id": booking_doc["mentee_id"],
            "mentor_id": booking_doc["mentor_id"],
            "mentor_name": booking_doc["mentor_name"],
            "mentor_email": booking_doc["mentor_email"],
            "company_name": booking_doc["company_name"],
            "interview_type": booking_doc["interview_type"],
            "experience_level": booking_doc["experience_level"],
            "date": booking_doc["date"],
            "start_time": booking_doc["start_time"],
            "end_time": booking_doc["end_time"],
            "meeting_link": booking_doc["meeting_link"],
            "status": booking_doc["status"],
            "created_at": booking_doc["created_at"]
        }
        
    except HTTPException:
        # Release lock on error
        await db.mentor_slots.update_one(
            {"id": booking_data.slot_id},
            {"$unset": {"lock": ""}}
        )
        raise
    except Exception as e:
        # Release lock on any error
        await db.mentor_slots.update_one(
            {"id": booking_data.slot_id},
            {"$unset": {"lock": ""}}
        )
        raise HTTPException(status_code=500, detail=f"Booking failed: {str(e)}")

@api_router.delete("/mentee/bookings/{booking_id}")
async def cancel_booking(booking_id: str, user=Depends(get_current_user)):
    """
    Cancel a booking.
    Verifies booking ownership and 24-hour cancellation policy.
    Restores slot status and mentee quota.
    """
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Find booking
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Verify booking ownership
    if booking["mentee_id"] != user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only cancel your own bookings"
        )
    
    # Check if already cancelled
    if booking["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    # Check 24-hour cancellation policy
    booking_datetime = datetime.fromisoformat(f"{booking['date']}T{booking['start_time']}:00")
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    hours_until_session = (booking_datetime - now).total_seconds() / 3600
    
    if hours_until_session < 24:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "policy_violation",
                "message": "Bookings can only be cancelled more than 24 hours in advance",
                "code": "CANCELLATION_POLICY_VIOLATION",
                "hours_until_session": round(hours_until_session, 1)
            }
        )
    
    # Update slot status to "available"
    await db.mentor_slots.update_one(
        {"id": booking["slot_id"]},
        {
            "$set": {
                "status": "available",
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Delete booking record
    await db.bookings.delete_one({"id": booking_id})
    
    # Restore mentee quota
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$inc": {"interview_quota_remaining": 1},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    # Send cancellation notifications (async, don't wait)
    asyncio.create_task(send_cancellation_notification_emails(
        booking=dict(booking),
        cancelled_by_role="mentee",
        cancellation_reason=None
    ))
    
    return {"message": "Booking cancelled successfully"}

@api_router.get("/mentee/bookings")
async def get_mentee_bookings(user=Depends(get_current_user)):
    """
    Get all bookings for a mentee.
    Returns bookings separated into upcoming and past sessions.
    Includes mentor information, meeting links, and feedback status.
    """
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Fetch all bookings for mentee
    bookings = await db.bookings.find({"mentee_id": user["id"]}).to_list(1000)
    
    # Separate into upcoming and past
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    upcoming = []
    past = []
    
    for booking in bookings:
        booking_dict = dict(booking)
        
        # Check if feedback exists for this booking
        feedback = await db.feedbacks.find_one({"booking_id": booking_dict["id"]})
        booking_dict["feedback_submitted"] = feedback is not None
        if feedback:
            booking_dict["feedback_id"] = feedback["id"]
        
        # Determine if upcoming or past
        booking_datetime = datetime.fromisoformat(f"{booking_dict['date']}T{booking_dict['start_time']}:00")
        
        if booking_datetime > now:
            upcoming.append(serialize_doc(booking_dict))
        else:
            past.append(serialize_doc(booking_dict))
    
    # Sort upcoming by date ascending, past by date descending
    upcoming.sort(key=lambda x: (x["date"], x["start_time"]))
    past.sort(key=lambda x: (x["date"], x["start_time"]), reverse=True)
    
    return {
        "upcoming": upcoming,
        "past": past
    }

@api_router.get("/mentee/feedbacks")
async def get_mentee_feedbacks(user=Depends(get_current_user)):
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    feedbacks = await db.feedbacks.find({"mentee_id": user["id"]}).to_list(1000)
    return [serialize_doc(dict(f)) for f in feedbacks]

# ============ RESUME REVIEW SYSTEM ============
@api_router.post("/mentee/resume-request")
async def create_resume_request(
    resume: UploadFile = File(...),
    target_role: str = Form(...),
    target_companies: str = Form(""),
    specific_focus: str = Form(""),
    additional_notes: str = Form(""),
    user=Depends(get_current_user)
):
    """Submit a resume for expert review"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Check if user has resume review quota
    resume_reviews = user.get("plan_features", {}).get("resume_reviews", 0)
    if resume_reviews <= 0:
        raise HTTPException(
            status_code=403,
            detail="No resume reviews available in your plan. Please upgrade."
        )
    
    # Check how many reviews already used
    used_reviews = await db.resume_requests.count_documents({
        "mentee_id": user["id"],
        "status": {"$ne": "cancelled"}
    })
    
    if used_reviews >= resume_reviews:
        raise HTTPException(
            status_code=403,
            detail="You have used all your resume reviews. Please upgrade your plan."
        )
    
    # Validate file
    if not resume.content_type in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Only PDF and Word documents are allowed")
    
    # Read file content
    file_content = await resume.read()
    if len(file_content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    # Store file (in production, use S3 or similar)
    # For now, we'll store as base64 in MongoDB
    import base64
    file_base64 = base64.b64encode(file_content).decode('utf-8')
    
    # Create resume request
    request_doc = {
        "id": str(uuid.uuid4()),
        "mentee_id": user["id"],
        "mentee_name": user["name"],
        "mentee_email": user["email"],
        "plan_id": user.get("plan_id"),
        "resume_filename": resume.filename,
        "resume_content_type": resume.content_type,
        "resume_data": file_base64,  # In production, store S3 URL
        "target_role": target_role,
        "target_companies": target_companies,
        "specific_focus": specific_focus,
        "additional_notes": additional_notes,
        "status": "pending",  # pending, in_review, completed, cancelled
        "reviewer_id": None,
        "reviewer_notes": None,
        "feedback_file": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.resume_requests.insert_one(request_doc)
    
    # Send email notification to admin
    try:
        await send_resume_request_email(request_doc)
    except Exception as e:
        logger.error(f"Failed to send resume request email: {str(e)}")
    
    return {
        "message": "Resume review request submitted successfully",
        "request_id": request_doc["id"],
        "status": "pending"
    }

@api_router.get("/mentee/resume-requests")
async def get_resume_requests(user=Depends(get_current_user)):
    """Get all resume review requests for the mentee"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    requests = await db.resume_requests.find({"mentee_id": user["id"]}).sort("created_at", -1).to_list(1000)
    
    # Remove resume_data from response (too large)
    for req in requests:
        if "resume_data" in req:
            del req["resume_data"]
    
    return [serialize_doc(dict(r)) for r in requests]

@api_router.get("/mentee/resume-requests/{request_id}/download")
async def download_resume(request_id: str, user=Depends(get_current_user)):
    """Download the submitted resume"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    request = await db.resume_requests.find_one({"id": request_id, "mentee_id": user["id"]})
    if not request:
        raise HTTPException(status_code=404, detail="Resume request not found")
    
    # Decode base64 data
    import base64
    file_content = base64.b64decode(request["resume_data"])
    
    from fastapi.responses import Response
    return Response(
        content=file_content,
        media_type=request["resume_content_type"],
        headers={"Content-Disposition": f"attachment; filename={request['resume_filename']}"}
    )

# ============ RESUME REVIEW CALL BOOKING SYSTEM ============

class ResumeReviewBookingCreate(BaseModel):
    resume_request_id: str  # Link to the uploaded resume
    preferred_slot_ids: List[str]  # Up to 2 preferred slots
    additional_notes: Optional[str] = ""

@api_router.post("/mentee/resume-review-booking")
async def create_resume_review_booking(data: ResumeReviewBookingCreate, user=Depends(get_current_user)):
    """Create a resume review call booking request"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Check if user has call-based resume review
    review_type = user.get("plan_features", {}).get("resume_review_type")
    if review_type != "call":
        raise HTTPException(
            status_code=403,
            detail="Your plan includes email review only. Upgrade to Pro or Elite for 30-min calls."
        )
    
    # Verify resume request exists and belongs to user
    resume_request = await db.resume_requests.find_one({
        "id": data.resume_request_id,
        "mentee_id": user["id"]
    })
    if not resume_request:
        raise HTTPException(status_code=404, detail="Resume request not found")
    
    # Check if booking already exists for this resume
    existing_booking = await db.resume_review_bookings.find_one({
        "resume_request_id": data.resume_request_id,
        "status": {"$in": ["pending", "confirmed"]}
    })
    if existing_booking:
        raise HTTPException(
            status_code=400,
            detail="A booking already exists for this resume review"
        )
    
    # Verify slots exist and are available
    if len(data.preferred_slot_ids) == 0 or len(data.preferred_slot_ids) > 2:
        raise HTTPException(status_code=400, detail="Please select 1-2 preferred slots")
    
    preferred_slots = []
    for slot_id in data.preferred_slot_ids:
        slot = await db.resume_review_slots.find_one({"id": slot_id, "status": "available"})
        if not slot:
            raise HTTPException(status_code=404, detail=f"Slot {slot_id} not found or not available")
        preferred_slots.append({
            "id": slot["id"],
            "date": slot["date"],
            "start_time": slot["start_time"],
            "end_time": slot["end_time"]
        })
    
    # Create booking request
    booking = {
        "id": str(uuid.uuid4()),
        "resume_request_id": data.resume_request_id,
        "mentee_id": user["id"],
        "mentee_name": user["name"],
        "mentee_email": user["email"],
        "mentor_id": None,  # Assigned by admin
        "mentor_name": None,
        "mentor_email": None,
        "preferred_slots": preferred_slots,
        "confirmed_slot": None,
        "meeting_link": None,
        "status": "pending",  # pending, confirmed, completed, cancelled
        "additional_notes": data.additional_notes,
        "confirmed_by": None,
        "confirmed_at": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.resume_review_bookings.insert_one(booking)
    
    # Send email notification to admin
    try:
        await send_resume_booking_request_email(booking, resume_request)
    except Exception as e:
        logger.error(f"Failed to send resume booking email: {str(e)}")
    
    return {
        "message": "Resume review call booking request submitted successfully",
        "booking_id": booking["id"],
        "status": "pending"
    }

@api_router.get("/mentee/resume-review-bookings")
async def get_resume_review_bookings(user=Depends(get_current_user)):
    """Get all resume review bookings for the mentee"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    bookings = await db.resume_review_bookings.find({"mentee_id": user["id"]}).sort("created_at", -1).to_list(1000)
    return [serialize_doc(dict(b)) for b in bookings]

# ============ MENTOR RESUME REVIEW SLOT MANAGEMENT ============

class ResumeReviewSlotCreate(BaseModel):
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    meeting_link: str

@api_router.post("/mentor/resume-review-slots")
async def create_resume_review_slot(data: ResumeReviewSlotCreate, user=Depends(get_current_user)):
    """Create a resume review slot (30-min slots only)"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    # Validate time slot is 30 minutes
    from datetime import datetime as dt
    start = dt.strptime(data.start_time, "%H:%M")
    end = dt.strptime(data.end_time, "%H:%M")
    duration = (end - start).seconds / 60
    
    if duration != 30:
        raise HTTPException(status_code=400, detail="Resume review slots must be exactly 30 minutes")
    
    # Create slot
    slot = {
        "id": str(uuid.uuid4()),
        "mentor_id": user["id"],
        "mentor_name": user["name"],
        "mentor_email": user["email"],
        "date": data.date,
        "start_time": data.start_time,
        "end_time": data.end_time,
        "meeting_link": data.meeting_link,
        "status": "available",  # available, booked, completed
        "booking_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.resume_review_slots.insert_one(slot)
    
    return {
        "message": "Resume review slot created successfully",
        "slot_id": slot["id"]
    }

@api_router.get("/mentor/resume-review-slots")
async def get_mentor_resume_slots(user=Depends(get_current_user)):
    """Get all resume review slots for the mentor"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    slots = await db.resume_review_slots.find({"mentor_id": user["id"]}).sort("date", 1).to_list(1000)
    return [serialize_doc(dict(s)) for s in slots]

@api_router.get("/mentor/resume-review-bookings")
async def get_mentor_resume_bookings(user=Depends(get_current_user)):
    """Get all resume review bookings assigned to the mentor"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    bookings = await db.resume_review_bookings.find({"mentor_id": user["id"]}).sort("created_at", -1).to_list(1000)
    return [serialize_doc(dict(b)) for b in bookings]

@api_router.delete("/mentor/resume-review-slots/{slot_id}")
async def delete_resume_review_slot(slot_id: str, user=Depends(get_current_user)):
    """Delete a resume review slot"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    slot = await db.resume_review_slots.find_one({"id": slot_id, "mentor_id": user["id"]})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    if slot["status"] == "booked":
        raise HTTPException(status_code=400, detail="Cannot delete a booked slot")
    
    await db.resume_review_slots.delete_one({"id": slot_id})
    return {"message": "Slot deleted successfully"}

@api_router.patch("/mentor/resume-review-slots/{slot_id}")
async def update_resume_review_slot(slot_id: str, data: dict, user=Depends(get_current_user)):
    """Update resume review slot details"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    slot = await db.resume_review_slots.find_one({"id": slot_id, "mentor_id": user["id"]})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    if slot["status"] != "available":
        raise HTTPException(status_code=400, detail="Can only edit available slots")
    
    update_data = {}
    if "date" in data:
        update_data["date"] = data["date"]
    if "start_time" in data:
        update_data["start_time"] = data["start_time"]
    if "end_time" in data:
        update_data["end_time"] = data["end_time"]
    if "meeting_link" in data:
        update_data["meeting_link"] = data["meeting_link"]
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.resume_review_slots.update_one({"id": slot_id}, {"$set": update_data})
    return {"message": "Slot updated successfully"}

# ============ ADMIN RESUME REVIEW BOOKING MANAGEMENT ============

@api_router.get("/admin/resume-review-bookings")
async def get_all_resume_review_bookings(user=Depends(get_current_user)):
    """Get all resume review booking requests - admin only"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    bookings = await db.resume_review_bookings.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(dict(b)) for b in bookings]

@api_router.post("/admin/confirm-resume-review-booking")
async def confirm_resume_review_booking(data: dict, user=Depends(get_current_user)):
    """Confirm a resume review booking with mentor assignment"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    booking_id = data.get("booking_id")
    mentor_id = data.get("mentor_id")
    confirmed_slot_id = data.get("confirmed_slot_id")
    
    if not all([booking_id, mentor_id, confirmed_slot_id]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    # Get booking
    booking = await db.resume_review_bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Get mentor
    mentor = await db.users.find_one({"id": mentor_id, "role": "mentor"})
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    # Get confirmed slot
    confirmed_slot = next((s for s in booking["preferred_slots"] if s["id"] == confirmed_slot_id), None)
    if not confirmed_slot:
        raise HTTPException(status_code=404, detail="Confirmed slot not found in preferred slots")
    
    # Get the actual slot from database
    slot = await db.resume_review_slots.find_one({"id": confirmed_slot_id})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    if slot["status"] != "available":
        raise HTTPException(status_code=400, detail="Slot is no longer available")
    
    # Update booking
    await db.resume_review_bookings.update_one(
        {"id": booking_id},
        {"$set": {
            "mentor_id": mentor_id,
            "mentor_name": mentor["name"],
            "mentor_email": mentor["email"],
            "confirmed_slot": confirmed_slot,
            "meeting_link": slot["meeting_link"],
            "status": "confirmed",
            "confirmed_by": user["id"],
            "confirmed_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update slot status
    await db.resume_review_slots.update_one(
        {"id": confirmed_slot_id},
        {"$set": {
            "status": "booked",
            "booking_id": booking_id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Get updated booking
    updated_booking = await db.resume_review_bookings.find_one({"id": booking_id})
    
    # Send confirmation emails
    try:
        # Get resume request details
        resume_request = await db.resume_requests.find_one({"id": updated_booking["resume_request_id"]})
        
        # Email to mentee
        await send_resume_booking_confirmed_email(
            recipient_name=updated_booking["mentee_name"],
            recipient_email=updated_booking["mentee_email"],
            mentor_name=mentor["name"],
            slot_time=f"{confirmed_slot['date']} at {confirmed_slot['start_time']}",
            meeting_link=slot["meeting_link"],
            is_mentor=False
        )
        
        # Email to mentor
        await send_resume_booking_confirmed_email(
            recipient_name=mentor["name"],
            recipient_email=mentor["email"],
            mentee_name=updated_booking["mentee_name"],
            slot_time=f"{confirmed_slot['date']} at {confirmed_slot['start_time']}",
            meeting_link=slot["meeting_link"],
            is_mentor=True,
            resume_details=resume_request
        )
    except Exception as e:
        logger.error(f"Failed to send confirmation emails: {str(e)}")
    
    return {
        "message": "Resume review booking confirmed successfully",
        "booking": serialize_doc(dict(updated_booking))
    }

@api_router.get("/mentee/available-resume-review-slots")
async def get_available_resume_slots(user=Depends(get_current_user)):
    """Get all available resume review slots for booking"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Get available slots (anonymized - no mentor info)
    slots = await db.resume_review_slots.find({"status": "available"}).sort("date", 1).to_list(1000)
    
    # Remove mentor identifying information
    anonymized_slots = []
    for slot in slots:
        anonymized_slots.append({
            "id": slot["id"],
            "date": slot["date"],
            "start_time": slot["start_time"],
            "end_time": slot["end_time"],
            # Don't include mentor_id, mentor_name, mentor_email, meeting_link
        })
    
    return anonymized_slots

@api_router.post("/mentee/request-resume-review-slots")
async def request_more_resume_slots(data: dict, user=Depends(get_current_user)):
    """Request more resume review slots when none are available"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    resume_request_id = data.get("resume_request_id")
    mentee_name = data.get("mentee_name", user["name"])
    mentee_email = data.get("mentee_email", user["email"])
    
    # Get resume request details
    resume_request = await db.resume_requests.find_one({"id": resume_request_id})
    if not resume_request:
        raise HTTPException(status_code=404, detail="Resume request not found")
    
    # Send email to admin and all mentors
    try:
        await send_slot_request_email(mentee_name, mentee_email, resume_request)
    except Exception as e:
        logger.error(f"Failed to send slot request email: {str(e)}")
    
    return {"message": "Slot request sent successfully"}

# ============ USERS LOOKUP ============
@api_router.get("/users/{user_id}")
async def get_user(user_id: str, user=Depends(get_current_user)):
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_doc(dict(target))

# ============ INTERVIEW PREPARATION FEATURES ============

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    target_role: str
    target_companies: List[str]

class ResumeAnalysisResponse(BaseModel):
    overall_score: int  # 1-100
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    ats_score: int  # 1-100
    keyword_analysis: dict
    section_feedback: dict

@api_router.post("/ai-tools/resume-analysis")
async def analyze_resume(data: ResumeAnalysisRequest, user=Depends(get_current_user)):
    """AI-powered resume analysis"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # For now, return mock analysis - will integrate with AI service later
    analysis = {
        "overall_score": 75,
        "strengths": [
            "Strong technical skills mentioned",
            "Good project descriptions",
            "Relevant experience for target role"
        ],
        "weaknesses": [
            "Missing quantified achievements",
            "Could improve action verbs",
            "Skills section needs better organization"
        ],
        "suggestions": [
            "Add metrics to your achievements (e.g., 'Improved performance by 30%')",
            "Use stronger action verbs like 'architected', 'optimized', 'delivered'",
            "Reorganize skills by relevance to target role",
            "Add more specific technologies used in projects"
        ],
        "ats_score": 68,
        "keyword_analysis": {
            "missing_keywords": ["microservices", "cloud", "agile", "CI/CD"],
            "present_keywords": ["python", "javascript", "react", "sql"],
            "keyword_density": "moderate"
        },
        "section_feedback": {
            "summary": "Good but could be more targeted to role",
            "experience": "Strong but needs more metrics",
            "skills": "Comprehensive but poorly organized",
            "projects": "Good technical depth"
        }
    }
    
    # Store analysis in database
    analysis_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "resume_text": data.resume_text[:1000],  # Store first 1000 chars for reference
        "target_role": data.target_role,
        "target_companies": data.target_companies,
        "analysis": analysis,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.resume_analyses.insert_one(analysis_doc)
    
    return analysis

class InterviewPrepRequest(BaseModel):
    company: str
    role: str
    interview_type: str  # "technical", "behavioral", "system_design"
    experience_level: str

@api_router.post("/ai-tools/interview-prep")
async def get_interview_prep(data: InterviewPrepRequest, user=Depends(get_current_user)):
    """AI-powered interview preparation suggestions"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Mock response - will integrate with AI service later
    prep_data = {
        "company_insights": {
            "culture": f"{data.company} values innovation, customer obsession, and technical excellence",
            "interview_process": "Typically 4-5 rounds including technical, system design, and behavioral",
            "common_questions": [
                "Tell me about a time you had to make a trade-off",
                "How would you design a scalable system?",
                "Describe a challenging technical problem you solved"
            ]
        },
        "technical_topics": [
            "Data Structures & Algorithms",
            "System Design Fundamentals",
            "Database Design",
            "API Design",
            "Scalability Concepts"
        ],
        "behavioral_framework": {
            "method": "STAR (Situation, Task, Action, Result)",
            "key_areas": ["Leadership", "Problem Solving", "Customer Focus", "Innovation"]
        },
        "practice_problems": [
            "Design a URL shortener like bit.ly",
            "Implement LRU Cache",
            "Design a chat application",
            "Two Sum problem variations"
        ],
        "timeline": {
            "week_1": "Focus on core algorithms and data structures",
            "week_2": "System design fundamentals",
            "week_3": "Behavioral preparation and mock interviews",
            "week_4": "Company-specific preparation and final practice"
        }
    }
    
    return prep_data

@api_router.get("/ai-tools/interview-questions")
async def get_interview_questions(
    company: str,
    role: str,
    interview_type: str,
    user=Depends(get_current_user)
):
    """Get AI-generated interview questions"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Mock questions - will integrate with AI service later
    questions = {
        "technical": [
            "Implement a function to reverse a linked list",
            "Design a data structure for a social media feed",
            "How would you optimize a slow database query?",
            "Explain the difference between SQL and NoSQL databases"
        ],
        "behavioral": [
            "Tell me about a time you disagreed with your manager",
            "Describe a project where you had to learn a new technology quickly",
            "How do you handle competing priorities?",
            "Give an example of when you went above and beyond"
        ],
        "system_design": [
            "Design a notification system",
            "How would you design Instagram?",
            "Design a distributed cache",
            "Architecture for a real-time chat application"
        ]
    }
    
    return {
        "questions": questions.get(interview_type, []),
        "tips": [
            "Practice explaining your thought process out loud",
            "Ask clarifying questions before starting",
            "Consider edge cases and scalability",
            "Be prepared to discuss trade-offs"
        ]
    }

# ============ COMMUNITY FEATURES ============

class ForumPostCreate(BaseModel):
    title: str
    content: str
    category: str  # "general", "technical", "behavioral", "offers", "referrals"
    tags: List[str] = []

class ForumCommentCreate(BaseModel):
    post_id: str
    content: str

@api_router.post("/community/posts")
async def create_forum_post(data: ForumPostCreate, user=Depends(get_current_user)):
    """Create a new forum post"""
    post_doc = {
        "id": str(uuid.uuid4()),
        "author_id": user["id"],
        "author_name": user["name"],
        "title": data.title,
        "content": data.content,
        "category": data.category,
        "tags": data.tags,
        "upvotes": 0,
        "downvotes": 0,
        "comment_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.forum_posts.insert_one(post_doc)
    return serialize_doc(post_doc)

@api_router.get("/community/posts")
async def get_forum_posts(
    category: Optional[str] = None,
    limit: int = 20,
    skip: int = 0,
    user=Depends(get_current_user)
):
    """Get forum posts"""
    query = {}
    if category:
        query["category"] = category
    
    posts = await db.forum_posts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [serialize_doc(dict(p)) for p in posts]

@api_router.post("/community/posts/{post_id}/comments")
async def create_comment(post_id: str, data: ForumCommentCreate, user=Depends(get_current_user)):
    """Add comment to a forum post"""
    # Check if post exists
    post = await db.forum_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment_doc = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "author_id": user["id"],
        "author_name": user["name"],
        "content": data.content,
        "upvotes": 0,
        "downvotes": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.forum_comments.insert_one(comment_doc)
    
    # Update comment count
    await db.forum_posts.update_one({"id": post_id}, {"$inc": {"comment_count": 1}})
    
    return serialize_doc(comment_doc)

@api_router.get("/community/posts/{post_id}/comments")
async def get_post_comments(post_id: str, user=Depends(get_current_user)):
    """Get comments for a forum post"""
    comments = await db.forum_comments.find({"post_id": post_id}).sort("created_at", 1).to_list(100)
    return [serialize_doc(dict(c)) for c in comments]

# ============ MENTOR SELECTION FEATURE ============

@api_router.get("/mentors/available")
async def get_available_mentors(user=Depends(get_current_user)):
    """Get list of available mentors with their profiles"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    mentors = await db.users.find({"role": "mentor", "status": "active"}).to_list(100)
    
    # Enhance mentor data with stats
    enhanced_mentors = []
    for mentor in mentors:
        # Get mentor stats
        total_mocks = await db.mocks.count_documents({"mentor_id": mentor["id"]})
        avg_rating = 4.8  # Mock rating - will calculate from feedback later
        
        mentor_profile = {
            "id": mentor["id"],
            "name": mentor["name"],
            "email": mentor["email"],
            "experience": mentor.get("experience", "5+ years at top companies"),
            "companies": mentor.get("companies", ["Amazon", "Google"]),
            "specializations": mentor.get("specializations", ["System Design", "Algorithms"]),
            "total_interviews": total_mocks,
            "rating": avg_rating,
            "bio": mentor.get("bio", "Experienced engineer passionate about helping others succeed"),
            "availability": mentor.get("availability", "Weekends and evenings"),
            "languages": mentor.get("languages", ["English", "Hindi"])
        }
        enhanced_mentors.append(mentor_profile)
    
    return enhanced_mentors

@api_router.post("/mentee/select-mentor")
async def select_mentor(mentor_id: str, user=Depends(get_current_user)):
    """Allow mentee to select their preferred mentor"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Check if mentor exists and is available
    mentor = await db.users.find_one({"id": mentor_id, "role": "mentor", "status": "active"})
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found or unavailable")
    
    # Update mentee's mentor assignment
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"mentor_id": mentor_id, "mentor_assigned_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": f"Mentor {mentor['name']} assigned successfully"}

# ============ RAZORPAY PAYMENT ROUTES ============
class CreateOrderRequest(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None  # Optional for existing users upgrading
    plan_id: str  # starter, professional, premium, mock_1, mock_3, mock_5
    current_role: str = ""
    target_role: str = ""
    timeline: str = ""
    struggle: str = ""
    is_upgrade: bool = False  # True if existing user is upgrading/buying add-ons

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str  # Our internal order ID

PLAN_PRICES = {
    # New minimal launch pricing
    "foundation": 199900,   # ₹1,999 in paise
    "growth": 499900,       # ₹4,999 in paise  
    "accelerator": 899900,  # ₹8,999 in paise
    # Legacy support for old plan IDs - DEPRECATED: Use dynamic pricing
    "starter": 199900,      # ₹1,999 in paise
    "professional": 499900, # ₹4,999 in paise
    "premium": 899900,      # ₹8,999 in paise
    "monthly": 199900,      # ₹1,999 in paise
    "quarterly": 499900,    # ₹4,999 in paise
    "biannual": 899900      # ₹8,999 in paise
}

PLAN_NAMES = {
    # New minimal launch plans
    "foundation": "Foundation Plan",
    "growth": "Growth Plan",
    "accelerator": "Accelerator Plan", 
    # Legacy support for old plan IDs - DEPRECATED: Use dynamic pricing
    "starter": "Starter Plan",
    "professional": "Professional Plan", 
    "premium": "Premium Plan",
    "monthly": "Monthly Plan",
    "quarterly": "3 Months Plan",
    "biannual": "6 Months Plan"
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
    
    # Mock add-on plans (not in database)
    mock_addons = {
        "mock_1": {"price": 249900, "name": "1 Mock Interview", "duration_months": 0},
        "mock_3": {"price": 699900, "name": "3 Mock Interviews", "duration_months": 0},
        "mock_5": {"price": 1099900, "name": "5 Mock Interviews", "duration_months": 0}
    }
    
    if plan_id in mock_addons:
        return mock_addons[plan_id]
    
    # Fallback to hardcoded values for backward compatibility
    if plan_id in PLAN_PRICES:
        duration_map = {
            # New minimal launch plans
            "foundation": 1,
            "growth": 3,
            "accelerator": 6,
            # Legacy support
            "starter": 1,
            "professional": 3,
            "premium": 6,
            "monthly": 1,
            "quarterly": 3,
            "biannual": 6
        }
        return {
            "price": PLAN_PRICES[plan_id],
            "name": PLAN_NAMES[plan_id],
            "duration_months": duration_map.get(plan_id, 1),
            "features": []
        }
    
    return None

@api_router.post("/payment/create-order")
async def create_payment_order(data: CreateOrderRequest):
    # Check if email already exists
    existing = await db.users.find_one({"email": data.email})
    
    # Handle different scenarios
    if existing:
        # If this is an upgrade/add-on purchase (user is logged in and buying more)
        if data.is_upgrade:
            # Allow existing users to buy add-ons or upgrade
            pass
        else:
            # New registration attempt with existing email
            if existing.get("status") == "Active" or existing.get("plan_id"):
                raise HTTPException(status_code=400, detail="Email already registered with a paid plan. Please login instead.")
            
            # If user exists but is free tier, allow upgrade
            if existing.get("status") == "Free":
                pass
            else:
                raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")
    else:
        # New user registration - password is required
        if not data.password:
            raise HTTPException(status_code=400, detail="Password is required for new registration")
    
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
                "plan": data.plan_id,
                "upgrade": "true" if existing else "false"
            }
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")
    
    # Store order in DB with user details (pending status)
    # Check if this is a founding batch purchase (first 25 customers)
    founding_count = await db.orders.count_documents({"status": "success", "is_founding_batch": True})
    is_founding_batch = founding_count < FOUNDING_SLOTS_TOTAL
    
    order_doc = {
        "id": str(uuid.uuid4()),
        "razorpay_order_id": razorpay_order["id"],
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password) if data.password else (existing["password"] if existing else None),
        "plan_id": data.plan_id,
        "plan_name": plan_name,
        "amount": amount,
        "current_role": data.current_role,
        "target_role": data.target_role,
        "timeline": data.timeline,
        "struggle": data.struggle,
        "status": "pending",
        "is_upgrade": data.is_upgrade or bool(existing),
        "is_founding_batch": is_founding_batch,
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
    
    # Check if this is an upgrade (user already exists)
    existing_user = await db.users.find_one({"email": order["email"]})
    
    if existing_user and order.get("is_upgrade"):
        # Check if this is a mock add-on purchase
        if order["plan_id"].startswith("mock_"):
            # This is a mock add-on purchase - just add to quota
            mock_counts = {
                "mock_1": 1,
                "mock_3": 3,
                "mock_5": 5
            }
            
            additional_mocks = mock_counts.get(order["plan_id"], 0)
            
            # Update user's quota
            await db.users.update_one(
                {"email": order["email"]},
                {
                    "$inc": {
                        "interview_quota_total": additional_mocks,
                        "interview_quota_remaining": additional_mocks
                    },
                    "$set": {
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # Get updated user
            updated_user = await db.users.find_one({"email": order["email"]})
            user_doc = updated_user
            
            # Generate token for auto-login
            token = create_token(user_doc["id"], user_doc["role"])
            
            # Send upgrade email (non-blocking)
            asyncio.create_task(send_upgrade_email(
                name=order["name"],
                email=order["email"],
                plan_name=order["plan_name"],
                amount=int(order["amount"] / 100)  # Convert paise to rupees
            ))
            
            return {
                "success": True,
                "message": f"Payment successful! {additional_mocks} mock interview(s) added to your account.",
                "access_token": token,
                "user": serialize_doc(user_doc)
            }
        
        # Get plan configuration for quota (for plan upgrades)
        plan_configs = {
            "starter": {
                "interview_quota_total": 1,
                "plan_features": {
                    "mock_interviews": 1,
                    "resume_reviews": 1,
                    "resume_review_type": "email",
                    "offline_profile_creation": 0,
                    "ai_tools_access": "limited",
                    "community_access": False,
                    "priority_support": False,
                    "strategy_calls": 0,
                    "referral_guidance": False
                }
            },
            "pro": {
                "interview_quota_total": 3,
                "plan_features": {
                    "mock_interviews": 3,
                    "resume_reviews": 1,
                    "resume_review_type": "call",
                    "offline_profile_creation": 0,
                    "ai_tools_access": "full",
                    "community_access": True,
                    "priority_support": False,
                    "strategy_calls": 1,
                    "referral_guidance": False
                }
            },
            "elite": {
                "interview_quota_total": 6,
                "plan_features": {
                    "mock_interviews": 6,
                    "resume_reviews": 1,
                    "resume_review_type": "call",
                    "offline_profile_creation": 1,
                    "ai_tools_access": "full",
                    "community_access": True,
                    "priority_support": True,
                    "strategy_calls": 0,
                    "referral_guidance": True
                }
            }
        }
        
        plan_config = plan_configs.get(order["plan_id"], plan_configs["starter"])
        
        # This is an upgrade - update existing user
        await db.users.update_one(
            {"email": order["email"]},
            {"$set": {
                "status": "Active",
                "plan_id": order["plan_id"],
                "plan_name": order["plan_name"],
                "current_role": order.get("current_role", existing_user.get("current_role", "")),
                "target_role": order.get("target_role", existing_user.get("target_role", "")),
                "interview_quota_total": plan_config["interview_quota_total"],
                "interview_quota_remaining": plan_config["interview_quota_total"],
                "plan_features": plan_config["plan_features"],
                "upgraded_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"email": order["email"]})
        user_doc = updated_user
        
        # Generate token for auto-login
        token = create_token(user_doc["id"], user_doc["role"])
        
        # Send upgrade email (non-blocking)
        asyncio.create_task(send_upgrade_email(
            name=order["name"],
            email=order["email"],
            plan_name=order["plan_name"],
            amount=int(order["amount"] / 100)  # Convert paise to rupees
        ))
        
        return {
            "success": True,
            "message": "Payment successful! Your account has been upgraded.",
            "access_token": token,
            "user": serialize_doc(user_doc)
        }
    
    else:
        # Get plan configuration for quota
        plan_configs = {
            "starter": {
                "interview_quota_total": 1,
                "plan_features": {
                    "mock_interviews": 1,
                    "resume_reviews": 1,
                    "resume_review_type": "email",
                    "offline_profile_creation": 0,
                    "ai_tools_access": "limited",
                    "community_access": False,
                    "priority_support": False,
                    "strategy_calls": 0,
                    "referral_guidance": False
                }
            },
            "pro": {
                "interview_quota_total": 3,
                "plan_features": {
                    "mock_interviews": 3,
                    "resume_reviews": 1,
                    "resume_review_type": "call",
                    "offline_profile_creation": 0,
                    "ai_tools_access": "full",
                    "community_access": True,
                    "priority_support": False,
                    "strategy_calls": 1,
                    "referral_guidance": False
                }
            },
            "elite": {
                "interview_quota_total": 6,
                "plan_features": {
                    "mock_interviews": 6,
                    "resume_reviews": 1,
                    "resume_review_type": "call",
                    "offline_profile_creation": 1,
                    "ai_tools_access": "full",
                    "community_access": True,
                    "priority_support": True,
                    "strategy_calls": 0,
                    "referral_guidance": True
                }
            }
        }
        
        plan_config = plan_configs.get(order["plan_id"], plan_configs["starter"])
        
        # This is a new user - create account
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
            "interview_quota_total": plan_config["interview_quota_total"],
            "interview_quota_remaining": plan_config["interview_quota_total"],
            "plan_features": plan_config["plan_features"],
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

# ============ MENTOR PAYOUT TRACKING SYSTEM ============

class PayoutRequest(BaseModel):
    mock_id: str
    mentor_id: str
    amount: int  # Amount in paise (₹800 = 80000 paise)
    notes: Optional[str] = None

class PayoutUpdate(BaseModel):
    status: str  # pending, approved, paid, rejected
    admin_notes: Optional[str] = None

@api_router.post("/admin/payouts")
async def create_payout(payout_data: PayoutRequest, user=Depends(get_current_user)):
    """Admin creates a payout entry for a mentor after mock interview completion"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Verify mock interview exists and is completed
    mock = await db.mocks.find_one({"id": payout_data.mock_id})
    if not mock:
        raise HTTPException(status_code=404, detail="Mock interview not found")
    
    if mock.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Mock interview must be completed")
    
    # Check if payout already exists for this mock
    existing_payout = await db.payouts.find_one({"mock_id": payout_data.mock_id})
    if existing_payout:
        raise HTTPException(status_code=400, detail="Payout already exists for this mock interview")
    
    # Get mentor details
    mentor = await db.users.find_one({"id": payout_data.mentor_id, "role": "mentor"})
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    payout_doc = {
        "id": str(uuid.uuid4()),
        "mock_id": payout_data.mock_id,
        "mentor_id": payout_data.mentor_id,
        "mentor_name": mentor["name"],
        "mentor_email": mentor["email"],
        "amount": payout_data.amount,
        "status": "pending",  # pending, approved, paid, rejected
        "notes": payout_data.notes,
        "admin_notes": None,
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payouts.insert_one(payout_doc)
    return serialize_doc(payout_doc)

@api_router.get("/admin/payouts")
async def get_all_payouts(
    status: Optional[str] = None,
    mentor_id: Optional[str] = None,
    user=Depends(get_current_user)
):
    """Admin gets all payouts with optional filtering"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    query = {}
    if status:
        query["status"] = status
    if mentor_id:
        query["mentor_id"] = mentor_id
    
    payouts = await db.payouts.find(query).sort("created_at", -1).to_list(1000)
    
    # Enrich with mock interview details
    for payout in payouts:
        mock = await db.mocks.find_one({"id": payout["mock_id"]})
        if mock:
            payout["mock_details"] = {
                "company_name": mock.get("company_name"),
                "interview_type": mock.get("interview_type"),
                "scheduled_at": mock.get("scheduled_at"),
                "mentee_name": mock.get("mentee_name")
            }
    
    return [serialize_doc(dict(p)) for p in payouts]

@api_router.put("/admin/payouts/{payout_id}")
async def update_payout_status(
    payout_id: str, 
    update_data: PayoutUpdate, 
    user=Depends(get_current_user)
):
    """Admin updates payout status (approve, reject, mark as paid)"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    payout = await db.payouts.find_one({"id": payout_id})
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    
    update_fields = {
        "status": update_data.status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user["id"]
    }
    
    if update_data.admin_notes:
        update_fields["admin_notes"] = update_data.admin_notes
    
    if update_data.status == "paid":
        update_fields["paid_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.payouts.update_one(
        {"id": payout_id},
        {"$set": update_fields}
    )
    
    updated_payout = await db.payouts.find_one({"id": payout_id})
    return serialize_doc(dict(updated_payout))

@api_router.get("/mentor/payouts")
async def get_mentor_payouts(user=Depends(get_current_user)):
    """Mentor gets their own payout history"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    payouts = await db.payouts.find({"mentor_id": user["id"]}).sort("created_at", -1).to_list(1000)
    
    # Enrich with mock interview details
    for payout in payouts:
        mock = await db.mocks.find_one({"id": payout["mock_id"]})
        if mock:
            payout["mock_details"] = {
                "company_name": mock.get("company_name"),
                "interview_type": mock.get("interview_type"),
                "scheduled_at": mock.get("scheduled_at"),
                "mentee_name": mock.get("mentee_name")
            }
    
    return [serialize_doc(dict(p)) for p in payouts]

@api_router.get("/mentor/payout-stats")
async def get_mentor_payout_stats(user=Depends(get_current_user)):
    """Mentor gets their payout statistics"""
    if user["role"] != "mentor":
        raise HTTPException(status_code=403, detail="Mentor only")
    
    # Aggregate payout statistics
    pipeline = [
        {"$match": {"mentor_id": user["id"]}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_amount": {"$sum": "$amount"}
        }}
    ]
    
    stats_cursor = db.payouts.aggregate(pipeline)
    stats_list = await stats_cursor.to_list(length=None)
    
    # Format statistics
    stats = {
        "total_earned": 0,
        "pending_amount": 0,
        "paid_amount": 0,
        "total_sessions": 0,
        "pending_sessions": 0,
        "paid_sessions": 0
    }
    
    for stat in stats_list:
        status = stat["_id"]
        count = stat["count"]
        amount = stat["total_amount"]
        
        stats["total_sessions"] += count
        stats["total_earned"] += amount
        
        if status == "pending":
            stats["pending_amount"] = amount
            stats["pending_sessions"] = count
        elif status in ["approved", "paid"]:
            stats["paid_amount"] += amount
            stats["paid_sessions"] += count
    
    return stats

@api_router.get("/admin/payout-stats")
async def get_admin_payout_stats(user=Depends(get_current_user)):
    """Admin gets overall payout statistics"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Aggregate overall statistics
    pipeline = [
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_amount": {"$sum": "$amount"}
        }}
    ]
    
    stats_cursor = db.payouts.aggregate(pipeline)
    stats_list = await stats_cursor.to_list(length=None)
    
    # Format statistics
    stats = {
        "total_payouts": 0,
        "total_amount": 0,
        "pending_amount": 0,
        "approved_amount": 0,
        "paid_amount": 0,
        "pending_count": 0,
        "approved_count": 0,
        "paid_count": 0
    }
    
    for stat in stats_list:
        status = stat["_id"]
        count = stat["count"]
        amount = stat["total_amount"]
        
        stats["total_payouts"] += count
        stats["total_amount"] += amount
        
        if status == "pending":
            stats["pending_amount"] = amount
            stats["pending_count"] = count
        elif status == "approved":
            stats["approved_amount"] = amount
            stats["approved_count"] = count
        elif status == "paid":
            stats["paid_amount"] = amount
            stats["paid_count"] = count
    
    return stats

# ============ ADMIN ANALYTICS AND MONITORING ============

@api_router.get("/admin/sessions")
async def get_all_sessions(
    status: Optional[str] = None,
    mentor_id: Optional[str] = None,
    mentee_id: Optional[str] = None,
    interview_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user=Depends(get_current_user)
):
    """
    Get all bookings with filtering for admin monitoring
    Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
    """
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Build filter query
    query = {}
    
    if status:
        query["status"] = status
    
    if mentor_id:
        query["mentor_id"] = mentor_id
    
    if mentee_id:
        query["mentee_id"] = mentee_id
    
    if interview_type:
        query["interview_type"] = interview_type
    
    # Date range filtering
    if date_from or date_to:
        date_query = {}
        if date_from:
            date_query["$gte"] = date_from
        if date_to:
            date_query["$lte"] = date_to
        if date_query:
            query["date"] = date_query
    
    # Get bookings sorted by date/time descending
    bookings = await db.bookings.find(query).sort([("date", -1), ("start_time", -1)]).to_list(1000)
    
    return [serialize_doc(dict(b)) for b in bookings]


@api_router.delete("/admin/sessions/{booking_id}")
async def cancel_session_as_admin(
    booking_id: str,
    cancellation_reason: Optional[str] = None,
    user=Depends(get_current_user)
):
    """
    Admin cancels a session
    Requirements: 9.6
    """
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Get booking
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Update slot status to "available"
    await db.mentor_slots.update_one(
        {"id": booking["slot_id"]},
        {"$set": {"status": "available", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Update booking status to cancelled
    await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "status": "cancelled",
                "cancelled_by": user["id"],
                "cancellation_reason": cancellation_reason or "Cancelled by admin",
                "cancelled_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Restore mentee's interview quota
    mentee = await db.users.find_one({"id": booking["mentee_id"]})
    if mentee and mentee.get("interview_quota_remaining") is not None:
        await db.users.update_one(
            {"id": booking["mentee_id"]},
            {"$inc": {"interview_quota_remaining": 1}}
        )
    
    # Send cancellation notifications
    try:
        await send_cancellation_notification_emails(
            dict(booking),
            cancelled_by_role="admin",
            cancellation_reason=cancellation_reason or "Cancelled by admin"
        )
    except Exception as e:
        logger.error(f"Failed to send cancellation emails: {str(e)}")
    
    return {"message": "Session cancelled successfully"}


@api_router.get("/admin/mentor-analytics")
async def get_mentor_analytics(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    sort_by: Optional[str] = "total_slots_created",
    sort_order: Optional[str] = "desc",
    user=Depends(get_current_user)
):
    """
    Calculate metrics for each mentor
    Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
    """
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Get all mentors
    mentors = await db.users.find({"role": "mentor"}).to_list(1000)
    
    analytics = []
    
    for mentor in mentors:
        mentor_id = mentor["id"]
        
        # Build date filter for slots
        slot_query = {"mentor_id": mentor_id}
        if date_from or date_to:
            date_query = {}
            if date_from:
                date_query["$gte"] = date_from
            if date_to:
                date_query["$lte"] = date_to
            if date_query:
                slot_query["created_at"] = date_query
        
        # Total slots created
        total_slots_created = await db.mentor_slots.count_documents(slot_query)
        
        # Total slots booked
        booked_query = {**slot_query, "status": "booked"}
        total_slots_booked = await db.mentor_slots.count_documents(booked_query)
        
        # Utilization rate
        utilization_rate = (total_slots_booked / total_slots_created * 100) if total_slots_created > 0 else 0
        
        # Build date filter for bookings
        booking_query = {"mentor_id": mentor_id, "status": "completed"}
        if date_from or date_to:
            date_query = {}
            if date_from:
                date_query["$gte"] = date_from
            if date_to:
                date_query["$lte"] = date_to
            if date_query:
                booking_query["date"] = date_query
        
        # Total sessions completed
        total_sessions_completed = await db.bookings.count_documents(booking_query)
        
        # Average rating from feedback
        completed_bookings = await db.bookings.find(booking_query).to_list(1000)
        booking_ids = [b["id"] for b in completed_bookings]
        
        average_rating = 0.0
        if booking_ids:
            feedbacks = await db.feedbacks.find({"booking_id": {"$in": booking_ids}}).to_list(1000)
            if feedbacks:
                total_rating = sum(f.get("overall", 0) for f in feedbacks)
                average_rating = total_rating / len(feedbacks)
        
        analytics.append({
            "mentor_id": mentor_id,
            "mentor_name": mentor.get("name", "Unknown"),
            "mentor_email": mentor.get("email", ""),
            "total_slots_created": total_slots_created,
            "total_slots_booked": total_slots_booked,
            "utilization_rate": round(utilization_rate, 2),
            "average_rating": round(average_rating, 2),
            "total_sessions_completed": total_sessions_completed
        })
    
    # Sort analytics
    reverse = (sort_order == "desc")
    analytics.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)
    
    return analytics


@api_router.get("/admin/booking-analytics")
async def get_booking_analytics(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user=Depends(get_current_user)
):
    """
    Aggregate booking pattern data
    Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
    """
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Build date filter
    query = {}
    if date_from or date_to:
        date_query = {}
        if date_from:
            date_query["$gte"] = date_from
        if date_to:
            date_query["$lte"] = date_to
        if date_query:
            query["date"] = date_query
    
    # Get all bookings in date range
    bookings = await db.bookings.find(query).to_list(10000)
    
    # Popular time slots by day/hour
    popular_time_slots = {}
    for booking in bookings:
        # Parse date to get day of week
        try:
            booking_date = datetime.fromisoformat(booking["date"])
            day_name = booking_date.strftime("%A")
            hour = booking["start_time"].split(":")[0]
            slot_key = f"{day_name} {hour}:00"
            popular_time_slots[slot_key] = popular_time_slots.get(slot_key, 0) + 1
        except:
            pass
    
    # Most requested interview types
    interview_type_counts = {}
    for booking in bookings:
        interview_type = booking.get("interview_type", "unknown")
        interview_type_counts[interview_type] = interview_type_counts.get(interview_type, 0) + 1
    
    # Most requested companies
    company_counts = {}
    for booking in bookings:
        company_name = booking.get("company_name", "unknown")
        company_counts[company_name] = company_counts.get(company_name, 0) + 1
    
    # Booking trends over time (group by date)
    booking_trends = {}
    for booking in bookings:
        date = booking.get("date", "unknown")
        booking_trends[date] = booking_trends.get(date, 0) + 1
    
    # Convert to list of dicts for easier charting
    booking_trends_list = [{"date": date, "count": count} for date, count in sorted(booking_trends.items())]
    
    # Average time to booking (from slot creation to booking)
    total_time_hours = 0
    booking_count = 0
    for booking in bookings:
        try:
            # Get the slot
            slot = await db.mentor_slots.find_one({"id": booking["slot_id"]})
            if slot and slot.get("created_at") and booking.get("created_at"):
                slot_created = datetime.fromisoformat(slot["created_at"])
                booking_created = datetime.fromisoformat(booking["created_at"])
                time_diff = (booking_created - slot_created).total_seconds() / 3600  # Convert to hours
                total_time_hours += time_diff
                booking_count += 1
        except:
            pass
    
    avg_time_to_booking = (total_time_hours / booking_count) if booking_count > 0 else 0
    
    # Cancellation rate
    total_bookings = len(bookings)
    cancelled_bookings = len([b for b in bookings if b.get("status") == "cancelled"])
    cancellation_rate = (cancelled_bookings / total_bookings * 100) if total_bookings > 0 else 0
    
    return {
        "popular_time_slots": popular_time_slots,
        "interview_type_counts": interview_type_counts,
        "company_counts": company_counts,
        "booking_trends": booking_trends_list,
        "avg_time_to_booking": round(avg_time_to_booking, 2),
        "cancellation_rate": round(cancellation_rate, 2),
        "total_bookings": total_bookings,
        "cancelled_bookings": cancelled_bookings
    }


@api_router.get("/admin/revenue-tracking")
async def get_revenue_tracking(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user=Depends(get_current_user)
):
    """
    Calculate revenue and payout metrics
    Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6
    """
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Build date filter for orders
    order_query = {"status": "paid"}
    if date_from or date_to:
        date_query = {}
        if date_from:
            date_query["$gte"] = date_from
        if date_to:
            date_query["$lte"] = date_to
        if date_query:
            order_query["created_at"] = date_query
    
    # Get all paid orders in date range
    orders = await db.orders.find(order_query).to_list(10000)
    
    # Total revenue (convert paise to rupees)
    total_revenue = sum(o.get("amount", 0) for o in orders) / 100
    
    # Revenue by pricing plan
    revenue_by_plan = {}
    for order in orders:
        plan_id = order.get("plan_id", "unknown")
        amount = order.get("amount", 0) / 100
        revenue_by_plan[plan_id] = revenue_by_plan.get(plan_id, 0) + amount
    
    # Build date filter for bookings
    booking_query = {"status": "completed"}
    if date_from or date_to:
        date_query = {}
        if date_from:
            date_query["$gte"] = date_from
        if date_to:
            date_query["$lte"] = date_to
        if date_query:
            booking_query["date"] = date_query
    
    # Get completed bookings to calculate mentor payouts
    completed_bookings = await db.bookings.find(booking_query).to_list(10000)
    
    # Mentor payout rate (₹800 per session as per unit economics)
    MENTOR_PAYOUT_PER_SESSION = 800
    
    # Calculate mentor payouts
    mentor_payouts = {}
    for booking in completed_bookings:
        mentor_id = booking.get("mentor_id")
        mentor_name = booking.get("mentor_name", "Unknown")
        
        if mentor_id not in mentor_payouts:
            mentor_payouts[mentor_id] = {
                "mentor_id": mentor_id,
                "mentor_name": mentor_name,
                "sessions_completed": 0,
                "total_payout": 0
            }
        
        mentor_payouts[mentor_id]["sessions_completed"] += 1
        mentor_payouts[mentor_id]["total_payout"] += MENTOR_PAYOUT_PER_SESSION
    
    # Convert to list
    mentor_payouts_list = list(mentor_payouts.values())
    
    # Total payouts owed
    total_payouts_owed = sum(mp["total_payout"] for mp in mentor_payouts_list)
    
    # Net profit
    net_profit = total_revenue - total_payouts_owed
    
    return {
        "total_revenue": round(total_revenue, 2),
        "total_payouts_owed": round(total_payouts_owed, 2),
        "net_profit": round(net_profit, 2),
        "revenue_by_plan": {k: round(v, 2) for k, v in revenue_by_plan.items()},
        "mentor_payouts": mentor_payouts_list,
        "total_orders": len(orders),
        "total_completed_sessions": len(completed_bookings)
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

@app.on_event("startup")
async def startup_scheduler():
    """Start the background scheduler on application startup"""
    start_scheduler()

@app.on_event("shutdown")
async def shutdown_db_client():
    """Shutdown database client and scheduler on application shutdown"""
    scheduler.shutdown()
    client.close()
