from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
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
from openai import AsyncOpenAI
from groq import AsyncGroq

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

# OpenAI Config
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
if OPENAI_API_KEY and OPENAI_API_KEY != 'your-openai-api-key-here':
    openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
else:
    openai_client = None

# Groq Config (Free alternative!)
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
if GROQ_API_KEY and GROQ_API_KEY != 'your-groq-api-key-here':
    groq_client = AsyncGroq(api_key=GROQ_API_KEY)
else:
    groq_client = None

# Logo URL for emails
LOGO_URL = "https://codementee.com/logo.png"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

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

# Debug endpoint to check OpenAI configuration
@app.get("/debug/ai-config")
async def debug_ai_config():
    """Debug endpoint to check if AI services are configured"""
    return {
        "openai_configured": openai_client is not None,
        "openai_key_present": bool(OPENAI_API_KEY),
        "groq_configured": groq_client is not None,
        "groq_key_present": bool(GROQ_API_KEY),
        "ai_available": openai_client is not None or groq_client is not None,
        "version": "1.2.0-with-groq"
    }

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

class TimeSlotCreate(BaseModel):
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    mentor_id: Optional[str] = None  # If None, any mentor can take it
    interview_types: Optional[List[str]] = ["coding", "system_design", "behavioral", "hr_round"]  # Supported types

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
    
    # Create free mentee account
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
        print(f"🔄 Updating plan {plan_id} with data: {update_data}")
        await db.pricing_plans.update_one({"plan_id": plan_id}, {"$set": update_data})
        print(f"✅ Plan {plan_id} updated successfully")
    
    updated_plan = await db.pricing_plans.find_one({"plan_id": plan_id})
    print(f"📊 Updated plan from DB: {updated_plan}")
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
    print("🔍 Fetching pricing plans from database...")
    plans = await db.pricing_plans.find({"is_active": True}).sort("display_order", 1).to_list(100)
    print(f"📊 Found {len(plans)} active plans")
    for plan in plans:
        print(f"  - {plan['name']}: ₹{plan['price']/100}")
    result = [serialize_doc(dict(p)) for p in plans]
    print(f"✅ Returning {len(result)} plans to frontend")
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

# ============ INTERVIEW PREPARATION FEATURES ============

# File upload endpoint for resume text extraction
@api_router.post("/ai-tools/extract-resume-text")
async def extract_resume_text(file: UploadFile = File(...), user=Depends(get_current_user)):
    """Extract text from uploaded resume file (PDF, DOCX, TXT)"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    try:
        # Check file size (max 5MB)
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size must be less than 5MB")
        
        # Reset file pointer
        await file.seek(0)
        
        # Extract text based on file type
        filename = file.filename.lower()
        
        if filename.endswith('.txt'):
            # Plain text file
            text = contents.decode('utf-8')
            
        elif filename.endswith('.pdf'):
            # PDF file
            import PyPDF2
            import io
            
            pdf_file = io.BytesIO(contents)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text_parts = []
            for page in pdf_reader.pages:
                text_parts.append(page.extract_text())
            
            text = '\n'.join(text_parts)
            
        elif filename.endswith('.docx'):
            # DOCX file
            import docx
            import io
            
            docx_file = io.BytesIO(contents)
            doc = docx.Document(docx_file)
            
            text_parts = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text_parts.append(paragraph.text)
            
            text = '\n'.join(text_parts)
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload TXT, PDF, or DOCX")
        
        # Validate extracted text
        if not text or len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Could not extract sufficient text from file. Please check the file or paste text manually.")
        
        logger.info(f"Successfully extracted {len(text)} characters from {filename}")
        
        return {
            "text": text,
            "filename": file.filename,
            "length": len(text)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting text from file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    target_role: str
    target_companies: List[str]
    years_of_experience: Optional[str] = None
    industry: Optional[str] = None
    key_skills: Optional[List[str]] = None

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
    """AI-powered resume analysis using OpenAI GPT-4o-mini with Groq fallback"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not openai_client and not groq_client:
        logger.error("No AI client configured")
        raise HTTPException(status_code=503, detail="AI service not configured")

    analysis = None
    ai_provider = None

    # ============ OPENAI TEMPORARILY DISABLED (UNCOMMENT WHEN CREDITS AVAILABLE) ============
    # # Try OpenAI first
    # if openai_client:
    #     try:
    #         logger.info(f"Starting OpenAI resume analysis for user {user['id']}")
    #
    #         # Prepare the prompt for OpenAI
    #         prompt = f"""Analyze this resume for a {data.target_role} position at {', '.join(data.target_companies) if data.target_companies else 'top tech companies'}.
    #
    # Resume:
    # {data.resume_text}
    #
    # Provide a comprehensive analysis in JSON format with:
    # 1. overall_score (0-100)
    # 2. strengths (array of 3-5 specific strengths)
    # 3. weaknesses (array of 3-5 specific weaknesses)
    # 4. suggestions (array of 4-6 actionable improvements)
    # 5. ats_score (0-100, how well it passes ATS systems)
    # 6. keyword_analysis (object with missing_keywords, present_keywords arrays, and keyword_density string)
    # 7. section_feedback (object with feedback for summary, experience, skills, projects sections)
    #
    # Be specific, actionable, and constructive. Focus on quantifiable achievements, action verbs, and relevance to {data.target_role}."""
    #
    #         logger.info("Calling OpenAI API...")
    #
    #         # Call OpenAI API
    #         response = await openai_client.chat.completions.create(
    #             model="gpt-4o-mini",
    #             messages=[
    #                 {"role": "system", "content": "You are an expert resume reviewer and career coach. Provide detailed, actionable feedback in JSON format."},
    #                 {"role": "user", "content": prompt}
    #             ],
    #             response_format={"type": "json_object"},
    #             temperature=0.7,
    #             max_tokens=1500
    #         )
    #
    #         logger.info("OpenAI API call successful")
    #
    #         # Parse the AI response
    #         import json
    #         analysis = json.loads(response.choices[0].message.content)
    #         ai_provider = "openai"
    #
    #         logger.info(f"Resume analysis completed with OpenAI, score: {analysis.get('overall_score', 'N/A')}")
    #
    #     except Exception as e:
    #         logger.error(f"OpenAI API error: {str(e)}")
    #         logger.error(f"Error type: {type(e).__name__}")
    #         logger.warning("OpenAI failed, attempting Groq fallback...")
    # ============ END OPENAI SECTION ============

    # Try Groq if OpenAI failed or wasn't available
    if not analysis and groq_client:
        try:
            logger.info(f"Starting Groq resume analysis for user {user['id']}")

            # Build enhanced context from additional fields
            context_parts = []
            if data.years_of_experience:
                context_parts.append(f"Experience Level: {data.years_of_experience} years")
            if data.industry:
                context_parts.append(f"Target Industry: {data.industry}")
            if data.key_skills:
                context_parts.append(f"Key Skills to Highlight: {', '.join(data.key_skills)}")
            
            additional_context = "\n".join(context_parts) if context_parts else ""

            # Prepare the enhanced prompt for Groq
            prompt = f"""Analyze this resume for a {data.target_role} position at {', '.join(data.target_companies) if data.target_companies else 'top tech companies'}.

{additional_context}

Resume:
{data.resume_text}

Provide a comprehensive analysis in JSON format with:
1. overall_score (0-100)
2. strengths (array of 3-5 specific strengths)
3. weaknesses (array of 3-5 specific weaknesses)
4. suggestions (array of 4-6 actionable improvements)
5. ats_score (0-100, how well it passes ATS systems)
6. keyword_analysis (object with missing_keywords, present_keywords arrays, and keyword_density string)
7. section_feedback (object with feedback for summary, experience, skills, projects sections)

Be specific, actionable, and constructive. Focus on quantifiable achievements, action verbs, and relevance to {data.target_role}.
{f"Pay special attention to these skills: {', '.join(data.key_skills)}" if data.key_skills else ""}
{f"Consider the candidate's {data.years_of_experience} years of experience level in your analysis." if data.years_of_experience else ""}
{f"Tailor recommendations for the {data.industry} industry." if data.industry else ""}"""

            logger.info("Calling Groq API...")

            # Call Groq API
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an expert resume reviewer and career coach. Provide detailed, actionable feedback in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=1500
            )

            logger.info("Groq API call successful")

            # Parse the AI response
            import json
            analysis = json.loads(response.choices[0].message.content)
            ai_provider = "groq"

            logger.info(f"Resume analysis completed with Groq, score: {analysis.get('overall_score', 'N/A')}")

        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            logger.warning("Groq also failed, using fallback mock data")

    # Final fallback to mock data if both AI providers fail
    if not analysis:
        logger.warning("Using fallback mock data - both AI providers failed")
        analysis = {
            "overall_score": 70,
            "strengths": [
                "Resume structure is clear and organized",
                "Relevant experience mentioned",
                "Technical skills are listed"
            ],
            "weaknesses": [
                "Could add more quantified achievements",
                "Action verbs could be stronger",
                "Skills section needs better organization"
            ],
            "suggestions": [
                "Add metrics to achievements (e.g., 'Improved performance by 30%')",
                "Use stronger action verbs like 'architected', 'optimized', 'delivered'",
                "Reorganize skills by relevance to target role",
                "Add more specific technologies used in projects"
            ],
            "ats_score": 65,
            "keyword_analysis": {
                "missing_keywords": ["cloud", "agile", "CI/CD"],
                "present_keywords": ["python", "javascript", "react"],
                "keyword_density": "moderate"
            },
            "section_feedback": {
                "summary": "Good but could be more targeted",
                "experience": "Strong but needs more metrics",
                "skills": "Comprehensive but poorly organized",
                "projects": "Good technical depth"
            }
        }
        ai_provider = "fallback"

    # Store analysis in database
    analysis_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "resume_text": data.resume_text[:1000],  # Store first 1000 chars for reference
        "target_role": data.target_role,
        "target_companies": data.target_companies,
        "analysis": analysis,
        "ai_provider": ai_provider,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.resume_analyses.insert_one(analysis_doc)

    return {**analysis, "ai_provider": ai_provider}

class InterviewPrepRequest(BaseModel):
    company: str
    role: str
    interview_type: str  # "technical", "behavioral", "system_design"
    experience_level: str

@api_router.post("/ai-tools/interview-prep")
async def get_interview_prep(data: InterviewPrepRequest, user=Depends(get_current_user)):
    """AI-powered interview preparation suggestions using OpenAI GPT-4o-mini with Groq fallback"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not openai_client and not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured")

    prep_data = None
    ai_provider = None

    # ============ OPENAI TEMPORARILY DISABLED (UNCOMMENT WHEN CREDITS AVAILABLE) ============
    # # Try OpenAI first
    # if openai_client:
    #     try:
    #         logger.info(f"Starting OpenAI interview prep for user {user['id']}")
    #
    #         # Prepare the prompt for OpenAI
    #         prompt = f"""Create a comprehensive interview preparation guide for:
    # Company: {data.company}
    # Role: {data.role}
    # Interview Type: {data.interview_type}
    # Experience Level: {data.experience_level}
    #
    # Provide a detailed preparation plan in JSON format with:
    # 1. company_insights (object with culture, interview_process, common_questions array)
    # 2. technical_topics (array of 5-7 key topics to study)
    # 3. behavioral_framework (object with method name and key_areas array)
    # 4. practice_problems (array of 4-6 specific problems to practice)
    # 5. timeline (object with week_1, week_2, week_3, week_4 preparation focus)
    #
    # Be specific to {data.company}'s interview style and {data.interview_type} interviews. Make it actionable and realistic for {data.experience_level} level."""
    #
    #         logger.info("Calling OpenAI API...")
    #
    #         # Call OpenAI API
    #         response = await openai_client.chat.completions.create(
    #             model="gpt-4o-mini",
    #             messages=[
    #                 {"role": "system", "content": "You are an expert interview coach with deep knowledge of tech company interview processes. Provide detailed, company-specific preparation guidance in JSON format."},
    #                 {"role": "user", "content": prompt}
    #             ],
    #             response_format={"type": "json_object"},
    #             temperature=0.7,
    #             max_tokens=1500
    #         )
    #
    #         logger.info("OpenAI API call successful")
    #
    #         # Parse the AI response
    #         import json
    #         prep_data = json.loads(response.choices[0].message.content)
    #         ai_provider = "openai"
    #
    #         logger.info(f"Interview prep completed with OpenAI")
    #
    #     except Exception as e:
    #         logger.error(f"OpenAI API error: {str(e)}")
    #         logger.error(f"Error type: {type(e).__name__}")
    #         logger.warning("OpenAI failed, attempting Groq fallback...")
    # ============ END OPENAI SECTION ============

    # Try Groq if OpenAI failed or wasn't available
    if not prep_data and groq_client:
        try:
            logger.info(f"Starting Groq interview prep for user {user['id']}")

            # Prepare the prompt for Groq
            prompt = f"""Create a comprehensive interview preparation guide for:
Company: {data.company}
Role: {data.role}
Interview Type: {data.interview_type}
Experience Level: {data.experience_level}

Provide a detailed preparation plan in JSON format with:
1. company_insights (object with culture, interview_process, common_questions array)
2. technical_topics (array of 5-7 key topics to study)
3. behavioral_framework (object with method name and key_areas array)
4. practice_problems (array of 4-6 specific problems to practice)
5. timeline (object with week_1, week_2, week_3, week_4 preparation focus)

Be specific to {data.company}'s interview style and {data.interview_type} interviews. Make it actionable and realistic for {data.experience_level} level."""

            logger.info("Calling Groq API...")

            # Call Groq API
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an expert interview coach with deep knowledge of tech company interview processes. Provide detailed, company-specific preparation guidance in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=1500
            )

            logger.info("Groq API call successful")

            # Parse the AI response
            import json
            prep_data = json.loads(response.choices[0].message.content)
            ai_provider = "groq"

            logger.info(f"Interview prep completed with Groq")

        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            logger.warning("Groq also failed, using fallback mock data")

    # Final fallback to mock data if both AI providers fail
    if not prep_data:
        logger.warning("Using fallback mock data - both AI providers failed")
        prep_data = {
            "company_insights": {
                "culture": f"{data.company} values innovation, customer focus, and technical excellence",
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
        ai_provider = "fallback"

    return {**prep_data, "ai_provider": ai_provider}

@api_router.get("/ai-tools/interview-questions")
async def get_interview_questions(
    company: str,
    role: str,
    interview_type: str,
    user=Depends(get_current_user)
):
    """Get AI-generated interview questions using OpenAI GPT-4o-mini with Groq fallback"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not openai_client and not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured")

    result = None
    ai_provider = None

    # ============ OPENAI TEMPORARILY DISABLED (UNCOMMENT WHEN CREDITS AVAILABLE) ============
    # # Try OpenAI first
    # if openai_client:
    #     try:
    #         logger.info(f"Starting OpenAI interview questions for user {user['id']}")
    #
    #         # Prepare the prompt for OpenAI
    #         prompt = f"""Generate interview questions for:
    # Company: {company}
    # Role: {role}
    # Interview Type: {interview_type}
    #
    # Provide 4-6 realistic interview questions that {company} would ask for a {role} position in a {interview_type} interview.
    # Also provide 4 helpful tips for answering these types of questions.
    #
    # Return in JSON format with:
    # 1. questions (array of question strings)
    # 2. tips (array of 4 tip strings)
    #
    # Make questions specific to {company}'s interview style and realistic for the role."""
    #
    #         logger.info("Calling OpenAI API...")
    #
    #         # Call OpenAI API
    #         response = await openai_client.chat.completions.create(
    #             model="gpt-4o-mini",
    #             messages=[
    #                 {"role": "system", "content": "You are an expert interviewer who creates realistic, company-specific interview questions. Provide questions and tips in JSON format."},
    #                 {"role": "user", "content": prompt}
    #             ],
    #             response_format={"type": "json_object"},
    #             temperature=0.8,
    #             max_tokens=800
    #         )
    #
    #         logger.info("OpenAI API call successful")
    #
    #         # Parse the AI response
    #         import json
    #         result = json.loads(response.choices[0].message.content)
    #         ai_provider = "openai"
    #
    #         logger.info(f"Interview questions completed with OpenAI")
    #
    #     except Exception as e:
    #         logger.error(f"OpenAI API error: {str(e)}")
    #         logger.error(f"Error type: {type(e).__name__}")
    #         logger.warning("OpenAI failed, attempting Groq fallback...")
    # ============ END OPENAI SECTION ============

    # Try Groq if OpenAI failed or wasn't available
    if not result and groq_client:
        try:
            logger.info(f"Starting Groq interview questions for user {user['id']}")

            # Prepare the prompt for Groq
            prompt = f"""Generate interview questions for:
Company: {company}
Role: {role}
Interview Type: {interview_type}

Provide 4-6 realistic interview questions that {company} would ask for a {role} position in a {interview_type} interview.
Also provide 4 helpful tips for answering these types of questions.

Return in JSON format with:
1. questions (array of question strings)
2. tips (array of 4 tip strings)

Make questions specific to {company}'s interview style and realistic for the role."""

            logger.info("Calling Groq API...")

            # Call Groq API
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an expert interviewer who creates realistic, company-specific interview questions. Provide questions and tips in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.8,
                max_tokens=800
            )

            logger.info("Groq API call successful")

            # Parse the AI response
            import json
            result = json.loads(response.choices[0].message.content)
            ai_provider = "groq"

            logger.info(f"Interview questions completed with Groq")

        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            logger.warning("Groq also failed, using fallback mock data")

    # Final fallback to mock data if both AI providers fail
    if not result:
        logger.warning("Using fallback mock data - both AI providers failed")
        questions_map = {
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

        result = {
            "questions": questions_map.get(interview_type, questions_map["technical"]),
            "tips": [
                "Practice explaining your thought process out loud",
                "Ask clarifying questions before starting",
                "Consider edge cases and scalability",
                "Be prepared to discuss trade-offs"
            ]
        }
        ai_provider = "fallback"

    return {**result, "ai_provider": ai_provider}

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

# ============ INTERVIEW PREPARATION CHECKLIST ============

class ChecklistItemUpdate(BaseModel):
    item_id: str
    completed: bool

class ChecklistProgressUpdate(BaseModel):
    mock_id: str
    completed_items: List[str]

@api_router.get("/mentee/prep-checklist")
async def get_prep_checklist(
    interview_type: Optional[str] = "coding",
    company: Optional[str] = None,
    user=Depends(get_current_user)
):
    """Get interview preparation checklist based on interview type and company"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Base checklist items for all interviews
    base_checklist = {
        "technical_setup": {
            "title": "Technical Setup",
            "icon": "monitor",
            "items": [
                {"id": "test_camera", "text": "Test your camera and ensure good lighting", "required": True},
                {"id": "test_microphone", "text": "Test your microphone and audio quality", "required": True},
                {"id": "test_internet", "text": "Check internet connection (minimum 5 Mbps)", "required": True},
                {"id": "backup_device", "text": "Have a backup device ready", "required": False},
                {"id": "quiet_space", "text": "Find a quiet, distraction-free space", "required": True},
                {"id": "close_apps", "text": "Close unnecessary applications", "required": True}
            ]
        },
        "environment": {
            "title": "Environment Setup",
            "icon": "home",
            "items": [
                {"id": "clean_background", "text": "Ensure clean, professional background", "required": True},
                {"id": "good_lighting", "text": "Position yourself facing natural light or lamp", "required": True},
                {"id": "water_ready", "text": "Keep water nearby", "required": False},
                {"id": "inform_family", "text": "Inform family/roommates about interview", "required": True},
                {"id": "phone_silent", "text": "Put phone on silent mode", "required": True}
            ]
        },
        "materials": {
            "title": "Materials Ready",
            "icon": "file-text",
            "items": [
                {"id": "resume_ready", "text": "Have your resume open and ready", "required": True},
                {"id": "notepad_ready", "text": "Keep notepad and pen for notes", "required": False},
                {"id": "questions_prepared", "text": "Prepare questions to ask interviewer", "required": True},
                {"id": "company_research", "text": "Research company background and culture", "required": True}
            ]
        }
    }
    
    # Interview type specific items
    interview_specific = {
        "coding": {
            "title": "Coding Interview Prep",
            "icon": "code",
            "items": [
                {"id": "ide_setup", "text": "Set up your preferred IDE/code editor", "required": True},
                {"id": "review_ds", "text": "Review data structures (Arrays, LinkedList, Trees, Graphs)", "required": True},
                {"id": "review_algo", "text": "Review algorithms (Sorting, Searching, DP, Greedy)", "required": True},
                {"id": "practice_problems", "text": "Solve 2-3 warm-up problems", "required": True},
                {"id": "time_complexity", "text": "Review Big O notation and complexity analysis", "required": True},
                {"id": "edge_cases", "text": "Practice thinking about edge cases", "required": True},
                {"id": "test_code_sharing", "text": "Test screen sharing and code editor", "required": True}
            ]
        },
        "system_design": {
            "title": "System Design Prep",
            "icon": "layout",
            "items": [
                {"id": "whiteboard_tool", "text": "Set up digital whiteboard tool (Excalidraw, Draw.io)", "required": True},
                {"id": "review_patterns", "text": "Review common design patterns", "required": True},
                {"id": "scalability", "text": "Review scalability concepts (Load balancing, Caching, Sharding)", "required": True},
                {"id": "databases", "text": "Review database choices (SQL vs NoSQL)", "required": True},
                {"id": "microservices", "text": "Review microservices architecture", "required": True},
                {"id": "caching", "text": "Review caching strategies (Redis, Memcached)", "required": True},
                {"id": "message_queues", "text": "Review message queues (Kafka, RabbitMQ)", "required": True}
            ]
        },
        "behavioral": {
            "title": "Behavioral Interview Prep",
            "icon": "users",
            "items": [
                {"id": "star_method", "text": "Review STAR method (Situation, Task, Action, Result)", "required": True},
                {"id": "prepare_stories", "text": "Prepare 5-7 stories from past experiences", "required": True},
                {"id": "leadership", "text": "Prepare leadership examples", "required": True},
                {"id": "conflict", "text": "Prepare conflict resolution examples", "required": True},
                {"id": "failure", "text": "Prepare failure and learning examples", "required": True},
                {"id": "teamwork", "text": "Prepare teamwork examples", "required": True},
                {"id": "company_values", "text": "Research company values and culture fit", "required": True}
            ]
        },
        "hr_round": {
            "title": "HR Round Prep",
            "icon": "briefcase",
            "items": [
                {"id": "salary_research", "text": "Research salary ranges for the role", "required": True},
                {"id": "career_goals", "text": "Prepare your career goals statement", "required": True},
                {"id": "why_company", "text": "Prepare 'Why this company?' answer", "required": True},
                {"id": "why_role", "text": "Prepare 'Why this role?' answer", "required": True},
                {"id": "strengths", "text": "Prepare your top 3 strengths with examples", "required": True},
                {"id": "weaknesses", "text": "Prepare 1-2 weaknesses with improvement plans", "required": True},
                {"id": "notice_period", "text": "Know your notice period and availability", "required": True}
            ]
        }
    }
    
    # Company-specific tips
    company_tips = {
        "Amazon": [
            "Review Amazon's 16 Leadership Principles",
            "Prepare examples demonstrating 'Customer Obsession'",
            "Practice 'Dive Deep' scenarios",
            "Be ready to discuss 'Bias for Action' examples"
        ],
        "Google": [
            "Focus on Googleyness and Leadership",
            "Prepare examples of ambiguous problem solving",
            "Review Google's mission and products",
            "Practice explaining complex topics simply"
        ],
        "Microsoft": [
            "Review Microsoft's culture and growth mindset",
            "Prepare collaboration examples",
            "Focus on innovation and learning",
            "Be ready to discuss technical depth"
        ],
        "Meta": [
            "Review Meta's core values",
            "Prepare examples of moving fast",
            "Focus on impact and ownership",
            "Be ready to discuss scale challenges"
        ]
    }
    
    # Build complete checklist
    checklist = {
        "sections": [base_checklist["technical_setup"], base_checklist["environment"], base_checklist["materials"]],
        "interview_specific": interview_specific.get(interview_type, interview_specific["coding"]),
        "company_tips": company_tips.get(company, []),
        "general_tips": [
            "Join the meeting 5 minutes early",
            "Smile and maintain good energy throughout",
            "Think out loud - explain your thought process",
            "Ask clarifying questions before diving in",
            "It's okay to take a moment to think",
            "Be honest if you don't know something",
            "Show enthusiasm for the role and company",
            "Thank the interviewer at the end"
        ]
    }
    
    # Add interview-specific section to main sections
    checklist["sections"].append(checklist["interview_specific"])
    
    return checklist

@api_router.get("/mentee/prep-checklist/{mock_id}/progress")
async def get_checklist_progress(mock_id: str, user=Depends(get_current_user)):
    """Get user's checklist progress for a specific mock interview"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Get progress from database
    progress = await db.checklist_progress.find_one({
        "mock_id": mock_id,
        "mentee_id": user["id"]
    })
    
    if not progress:
        return {"completed_items": [], "last_updated": None}
    
    return {
        "completed_items": progress.get("completed_items", []),
        "last_updated": progress.get("updated_at")
    }

@api_router.post("/mentee/prep-checklist/{mock_id}/progress")
async def update_checklist_progress(
    mock_id: str,
    data: ChecklistProgressUpdate,
    user=Depends(get_current_user)
):
    """Update user's checklist progress"""
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")
    
    # Verify mock belongs to user
    mock = await db.mocks.find_one({"id": mock_id, "mentee_id": user["id"]})
    if not mock:
        raise HTTPException(status_code=404, detail="Mock interview not found")
    
    # Update or create progress
    progress_doc = {
        "mock_id": mock_id,
        "mentee_id": user["id"],
        "completed_items": data.completed_items,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.checklist_progress.update_one(
        {"mock_id": mock_id, "mentee_id": user["id"]},
        {"$set": progress_doc},
        upsert=True
    )
    
    # Calculate completion percentage
    total_items = len(data.completed_items)
    completion_percentage = (total_items / 30) * 100  # Approximate total items
    
    return {
        "message": "Progress updated",
        "completed_items": data.completed_items,
        "completion_percentage": min(completion_percentage, 100)
    }



# ============ RAZORPAY PAYMENT ROUTES ============
class CreateOrderRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    plan_id: str  # starter, professional, premium
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
    if existing:
        # If user exists and is already paid, reject
        if existing.get("status") == "Active" or existing.get("plan_id"):
            raise HTTPException(status_code=400, detail="Email already registered with a paid plan. Please login instead.")
        
        # If user exists but is free tier, allow upgrade
        if existing.get("status") == "Free":
            # This is a free user trying to upgrade - allow it
            pass
        else:
            # Other cases (shouldn't happen, but be safe)
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
                "plan": data.plan_id,
                "upgrade": "true" if existing else "false"
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
        "password": hash_password(data.password) if not existing else existing["password"],
        "plan_id": data.plan_id,
        "plan_name": plan_name,
        "amount": amount,
        "current_role": data.current_role,
        "target_role": data.target_role,
        "timeline": data.timeline,
        "struggle": data.struggle,
        "status": "pending",
        "is_upgrade": True if existing else False,
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
        # This is an upgrade - update existing user
        await db.users.update_one(
            {"email": order["email"]},
            {"$set": {
                "status": "Active",
                "plan_id": order["plan_id"],
                "plan_name": order["plan_name"],
                "current_role": order.get("current_role", existing_user.get("current_role", "")),
                "target_role": order.get("target_role", existing_user.get("target_role", "")),
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
