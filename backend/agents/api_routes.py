"""
API Routes for AI Agents
Job Application Agent & Referral Finder Agent
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from .job_application_agent import JobApplicationAgent
from .referral_finder_agent import ReferralFinderAgent

# Will be initialized in server.py
job_agent = None
referral_agent = None
_db = None
_get_current_user = None

router = APIRouter(prefix="/ai-agents", tags=["AI Agents"])


def inject_dependencies(database, auth_dependency):
    """Inject database and auth dependency from main server"""
    global _db, _get_current_user
    _db = database
    _get_current_user = auth_dependency

_send_job_digest_email = None

def inject_email_callback(email_fn):
    """Inject the email digest function from server to avoid circular imports"""
    global _send_job_digest_email
    _send_job_digest_email = email_fn


def get_user():
    """Return the actual auth dependency for FastAPI"""
    return _get_current_user


# ============ MODELS ============

class JobPreferencesModel(BaseModel):
    job_title: str
    location: str
    skills: List[str]
    experience_years: int
    expected_salary: Optional[int] = None
    preferred_companies: List[str] = []
    telegram_id: Optional[str] = None
    enable_sheets_logging: bool = False

class ResumeParseRequest(BaseModel):
    resume_text: str

class JobSearchRequest(BaseModel):
    job_title: str
    location: str
    max_results: int = 50

class ReferralSearchRequest(BaseModel):
    company: str
    role_filter: Optional[str] = None
    limit: int = 20

class DraftMessageRequest(BaseModel):
    employee_id: str
    job_url: Optional[str] = None

class TrackOutreachRequest(BaseModel):
    employee_id: str
    message_sent: str
    platform: str = "linkedin"

class UpdateResponseRequest(BaseModel):
    outreach_id: str
    response_text: str
    response_type: str


# ============ JOB APPLICATION AGENT ENDPOINTS ============

@router.post("/job-preferences")
async def save_job_preferences(
    preferences: JobPreferencesModel,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Save user's job search preferences"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    existing = await _db.job_preferences.find_one({"user_id": user["id"]})

    pref_doc = {
        "user_id": user["id"],
        **preferences.dict(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    if existing:
        await _db.job_preferences.update_one(
            {"user_id": user["id"]},
            {"$set": pref_doc}
        )
        message = "Preferences updated"
    else:
        pref_doc["id"] = str(uuid.uuid4())
        pref_doc["created_at"] = datetime.now(timezone.utc).isoformat()
        await _db.job_preferences.insert_one(pref_doc)
        message = "Preferences saved"

    if '_id' in pref_doc:
        del pref_doc['_id']

    return {"message": message, "preferences": pref_doc}


@router.get("/job-preferences")
async def get_job_preferences(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Get user's job search preferences"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    preferences = await _db.job_preferences.find_one({"user_id": user["id"]})

    if not preferences:
        return {"message": "No preferences found", "preferences": None}

    if '_id' in preferences:
        del preferences['_id']

    return {"preferences": preferences}

@router.delete("/job-preferences")
async def reset_job_preferences(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Reset/delete user's job search preferences and saved matches"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    await _db.job_preferences.delete_many({"user_id": user["id"]})
    await _db.job_matches.delete_many({"user_id": user["id"]})

    return {"message": "Preferences and saved matches cleared"}



@router.post("/parse-resume")
async def parse_resume(
    data: ResumeParseRequest,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Parse resume and extract skills, experience, education"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not job_agent:
        raise HTTPException(status_code=503, detail="Job agent not initialized")

    parsed_data = await job_agent.parse_resume(data.resume_text)

    await _db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "parsed_resume": parsed_data,
            "resume_parsed_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    return {"message": "Resume parsed successfully", "data": parsed_data}


@router.post("/search-jobs")
async def search_jobs(
    data: JobSearchRequest,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Search for jobs matching criteria"""
    import logging
    _logger = logging.getLogger(__name__)

    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not job_agent:
        raise HTTPException(status_code=503, detail="Job agent not initialized")

    preferences = await _db.job_preferences.find_one({"user_id": user["id"]})
    if not preferences:
        raise HTTPException(status_code=400, detail="Please set job preferences first")

    try:
        # Merge preferences skills with resume-parsed skills
        pref_skills = preferences.get("skills", [])
        parsed_resume = user.get("parsed_resume")
        if parsed_resume and parsed_resume.get("skills"):
            all_skills = list(set(pref_skills + parsed_resume["skills"]))
        else:
            all_skills = pref_skills

        user_profile = {
            "skills": all_skills,
            "total_years": preferences.get("experience_years", 0),
            "location": preferences.get("location", ""),
            "expected_salary": preferences.get("expected_salary", 0),
            "preferred_companies": preferences.get("preferred_companies", [])
        }

        _logger.info(f"Searching jobs: title={data.job_title}, location={data.location}")

        jobs = await job_agent.search_jobs(
            user_profile=user_profile,
            job_title=data.job_title,
            location=data.location,
            max_results=data.max_results
        )

        _logger.info(f"Found {len(jobs)} jobs, now scoring...")

        # Batch score all jobs in a single AI call (much faster)
        scored_jobs = await job_agent.score_jobs_batch(jobs, user_profile)
        scored_jobs.sort(key=lambda x: x.get("score", 0), reverse=True)

        _logger.info(f"Returning {len(scored_jobs)} scored jobs")

        # Save results to job_matches (skip duplicates)
        from datetime import datetime, timezone
        import uuid as _uuid
        for job in scored_jobs:
            existing = await _db.job_matches.find_one({
                "user_id": user["id"],
                "title": job.get("title"),
                "company": job.get("company")
            })
            if not existing:
                await _db.job_matches.insert_one({
                    "id": str(_uuid.uuid4()),
                    "user_id": user["id"],
                    "job_id": job.get("id"),
                    "company": job.get("company"),
                    "title": job.get("title"),
                    "location": job.get("location"),
                    "salary": job.get("salary"),
                    "url": job.get("url"),
                    "score": job.get("score"),
                    "reasoning": job.get("reasoning"),
                    "recommendation": job.get("recommendation"),
                    "source": job.get("source", ""),
                    "status": "found",
                    "created_at": datetime.now(timezone.utc).isoformat()
                })

        return {"total_found": len(scored_jobs), "jobs": scored_jobs}

    except Exception as e:
        _logger.error(f"Search jobs error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Job search failed: {str(e)}")


@router.get("/job-matches")
async def get_job_matches(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    limit: int = 20,
    min_score: int = 60
):
    """Get user's saved job matches"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    matches = await _db.job_matches.find(
        {"user_id": user["id"], "score": {"$gte": min_score}}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)

    for match in matches:
        if '_id' in match:
            del match['_id']

    return {"total": len(matches), "matches": matches}


@router.post("/run-daily-search")
async def trigger_daily_search(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Manually trigger daily job search"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not job_agent:
        raise HTTPException(status_code=503, detail="Job agent not initialized")

    async def _run_and_email(user_id):
        await job_agent.run_daily_search(user_id)
        if _send_job_digest_email:
            await _send_job_digest_email(user_id)

    import asyncio
    asyncio.create_task(_run_and_email(user["id"]))

    return {"message": "Daily job search started"}


@router.post("/mark-applied")
async def mark_job_applied(
    data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Mark a job as applied so it won't be suggested again"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    job_title = data.get("job_title", "")
    company = data.get("company", "")
    job_url = data.get("job_url", "")

    if not job_title or not company:
        raise HTTPException(status_code=400, detail="job_title and company required")

    from datetime import datetime, timezone
    doc = {
        "user_id": user["id"],
        "job_title": job_title,
        "company": company,
        "job_url": job_url,
        "applied_at": datetime.now(timezone.utc).isoformat()
    }
    await _db.applied_jobs.update_one(
        {"user_id": user["id"], "job_title": job_title, "company": company},
        {"$set": doc},
        upsert=True
    )
    return {"message": "Job marked as applied"}


@router.get("/applied-jobs")
async def get_applied_jobs(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Get list of jobs user has marked as applied"""
    user = await _get_current_user(credentials)
    applied = await _db.applied_jobs.find(
        {"user_id": user["id"]}
    ).to_list(length=500)

    for a in applied:
        if '_id' in a:
            del a['_id']

    return {"applied": applied}


# ============ REFERRAL FINDER AGENT ENDPOINTS ============

@router.post("/find-referrals")
async def find_referrals(
    data: ReferralSearchRequest,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Find employees at target company for referrals"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not referral_agent:
        raise HTTPException(status_code=503, detail="Referral agent not initialized")

    result = await referral_agent.find_and_draft_workflow(
        user_id=user["id"],
        target_company=data.company,
        role_filter=data.role_filter
    )

    return result


@router.post("/draft-message")
async def draft_referral_message(
    data: DraftMessageRequest,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Draft personalized referral message for an employee"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not referral_agent:
        raise HTTPException(status_code=503, detail="Referral agent not initialized")

    employee = await _db.referral_employees.find_one({"id": data.employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Build user profile from multiple sources
    prefs = await _db.job_preferences.find_one({"user_id": user["id"]})
    parsed_resume = user.get("parsed_resume", {}) or {}

    skills = list(user.get("skills", []))
    if prefs and prefs.get("skills"):
        skills = list(set(skills + prefs["skills"]))
    if parsed_resume.get("skills"):
        skills = list(set(skills + parsed_resume["skills"]))

    user_profile = {
        "name": user.get("name", ""),
        "current_role": parsed_resume.get("current_role", "") or (prefs.get("job_title", "") if prefs else ""),
        "skills": skills,
        "target_role": prefs.get("job_title", "") if prefs else ""
    }

    messages = await referral_agent.draft_referral_message(
        employee=employee,
        user_profile=user_profile,
        job_details={"url": data.job_url} if data.job_url else None
    )

    if '_id' in employee:
        del employee['_id']

    return {"employee": employee, "messages": messages}


@router.post("/track-outreach")
async def track_outreach(
    data: TrackOutreachRequest,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Track referral outreach sent to an employee"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not referral_agent:
        raise HTTPException(status_code=503, detail="Referral agent not initialized")

    outreach_id = await referral_agent.track_outreach(
        user_id=user["id"],
        employee_id=data.employee_id,
        message_sent=data.message_sent,
        platform=data.platform
    )

    await referral_agent.schedule_follow_up(outreach_id, days_after=3)

    return {"message": "Outreach tracked successfully", "outreach_id": outreach_id}


@router.post("/update-response")
async def update_outreach_response(
    data: UpdateResponseRequest,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Update outreach with response received"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not referral_agent:
        raise HTTPException(status_code=503, detail="Referral agent not initialized")

    await referral_agent.update_response(
        outreach_id=data.outreach_id,
        response_text=data.response_text,
        response_type=data.response_type
    )

    return {"message": "Response updated successfully"}


@router.get("/referral-pipeline")
async def get_referral_pipeline(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Get user's referral pipeline status"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    if not referral_agent:
        raise HTTPException(status_code=503, detail="Referral agent not initialized")

    pipeline = await referral_agent.get_referral_pipeline(user["id"])
    return pipeline


@router.get("/referral-outreach")
async def get_referral_outreach(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    limit: int = 50
):
    """Get user's referral outreach history"""
    user = await _get_current_user(credentials)
    if user["role"] != "mentee":
        raise HTTPException(status_code=403, detail="Mentee only")

    outreach = await _db.referral_outreach.find(
        {"user_id": user["id"]}
    ).sort("sent_at", -1).limit(limit).to_list(length=limit)

    for item in outreach:
        if '_id' in item:
            del item['_id']

    return {"total": len(outreach), "outreach": outreach}


# ============ ADMIN ENDPOINTS ============

@router.get("/admin/job-agent-stats")
async def get_job_agent_stats(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Get job agent statistics (admin only)"""
    user = await _get_current_user(credentials)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    active_users = await _db.job_preferences.count_documents({})
    total_matches = await _db.job_matches.count_documents({})

    matches_by_status = await _db.job_matches.aggregate([
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]).to_list(length=None)

    return {
        "active_users": active_users,
        "total_matches": total_matches,
        "by_status": {item["_id"]: item["count"] for item in matches_by_status}
    }


@router.get("/admin/referral-agent-stats")
async def get_referral_agent_stats(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Get referral agent statistics (admin only)"""
    user = await _get_current_user(credentials)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    total_outreach = await _db.referral_outreach.count_documents({})
    total_responses = await _db.referral_outreach.count_documents({"response_received": True})
    positive_responses = await _db.referral_outreach.count_documents({"response_type": "positive"})

    response_rate = 0
    if total_outreach > 0:
        response_rate = round((total_responses / total_outreach) * 100, 1)

    return {
        "total_outreach": total_outreach,
        "total_responses": total_responses,
        "positive_responses": positive_responses,
        "response_rate": response_rate
    }
