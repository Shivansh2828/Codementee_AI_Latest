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
