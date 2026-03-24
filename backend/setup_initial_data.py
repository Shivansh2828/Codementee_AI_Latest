#!/usr/bin/env python3
"""
Initial data setup script for Codementee
Creates admin user and sample data for development
"""

import asyncio
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'codementee')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def setup_initial_data():
    """Set up initial data for the application"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🚀 Setting up initial data for Codementee...")
    
    try:
        # 1. Create Admin User
        admin_exists = await db.users.find_one({"email": "admin@codementee.com"})
        if not admin_exists:
            admin_user = {
                "id": str(uuid.uuid4()),
                "name": "Admin User",
                "email": "admin@codementee.com",
                "password": hash_password("Admin@123"),
                "role": "admin",
                "status": "Active",
                "mentor_id": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(admin_user)
            print("✅ Admin user created: admin@codementee.com / Admin@123")
        else:
            print("ℹ️  Admin user already exists")
        
        # 2. Create Mentor User
        mentor_exists = await db.users.find_one({"email": "mentor@codementee.com"})
        if not mentor_exists:
            mentor_user = {
                "id": str(uuid.uuid4()),
                "name": "John Mentor",
                "email": "mentor@codementee.com",
                "password": hash_password("Mentor@123"),
                "role": "mentor",
                "status": "Active",
                "mentor_id": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(mentor_user)
            print("✅ Mentor user created: mentor@codementee.com / Mentor@123")
        else:
            print("ℹ️  Mentor user already exists")
        
        # 3. Create Mentee User (Paid)
        mentee_exists = await db.users.find_one({"email": "mentee@codementee.com"})
        if not mentee_exists:
            mentee_user = {
                "id": str(uuid.uuid4()),
                "name": "Jane Mentee",
                "email": "mentee@codementee.com",
                "password": hash_password("Mentee@123"),
                "role": "mentee",
                "status": "Active",
                "plan_id": "quarterly",
                "plan_name": "3 Months Plan",
                "mentor_id": None,
                "current_role": "SDE 1",
                "target_role": "Amazon SDE 2",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(mentee_user)
            print("✅ Mentee user created: mentee@codementee.com / Mentee@123")
        else:
            print("ℹ️  Mentee user already exists")
        
        # 4. Create Free Test User (for payment testing)
        free_user_exists = await db.users.find_one({"email": "free@codementee.com"})
        if not free_user_exists:
            free_user = {
                "id": str(uuid.uuid4()),
                "name": "Free Test User",
                "email": "free@codementee.com",
                "password": hash_password("Free@123"),
                "role": "mentee",
                "status": "Free",
                "plan_id": None,
                "plan_name": "Free Tier",
                "mentor_id": None,
                "current_role": "SDE 1",
                "target_role": "Amazon SDE 2",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(free_user)
            print("✅ Free test user created: free@codementee.com / Free@123")
        else:
            print("ℹ️  Free test user already exists")
        
        # 4. Create Enhanced Companies with Interview Tracks
        companies_data = [
            {
                "name": "Amazon", 
                "logo_url": "", 
                "description": "E-commerce & Cloud Giant",
                "category": "product",
                "interview_tracks": ["sde", "sde2", "senior_sde", "principal", "leadership"],
                "difficulty_levels": ["junior", "mid", "senior", "staff_plus"]
            },
            {
                "name": "Google", 
                "logo_url": "", 
                "description": "Search & Technology Leader",
                "category": "product",
                "interview_tracks": ["l3", "l4", "l5", "l6", "staff", "senior_staff"],
                "difficulty_levels": ["junior", "mid", "senior", "staff_plus"]
            },
            {
                "name": "Microsoft", 
                "logo_url": "", 
                "description": "Software & Cloud Services",
                "category": "product",
                "interview_tracks": ["sde", "sde2", "senior", "principal", "partner"],
                "difficulty_levels": ["junior", "mid", "senior", "staff_plus"]
            },
            {
                "name": "Meta", 
                "logo_url": "", 
                "description": "Social Media & VR/AR",
                "category": "product",
                "interview_tracks": ["e3", "e4", "e5", "e6", "e7"],
                "difficulty_levels": ["junior", "mid", "senior", "staff_plus"]
            },
            {
                "name": "Apple", 
                "logo_url": "", 
                "description": "Consumer Electronics & Software",
                "category": "product",
                "interview_tracks": ["ict2", "ict3", "ict4", "ict5", "ict6"],
                "difficulty_levels": ["junior", "mid", "senior", "staff_plus"]
            },
            {
                "name": "Netflix", 
                "logo_url": "", 
                "description": "Streaming & Entertainment",
                "category": "product",
                "interview_tracks": ["l4", "l5", "l6", "l7", "senior_staff"],
                "difficulty_levels": ["mid", "senior", "staff_plus"]
            },
            {
                "name": "Netflix", 
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", 
                "description": "Streaming & Entertainment",
                "category": "product",
                "interview_tracks": ["l4", "l5", "l6", "l7", "senior_staff"],
                "difficulty_levels": ["mid", "senior", "staff_plus"]
            },
            {
                "name": "Zomato", 
                "logo_url": "", 
                "description": "Food Delivery & Restaurant Discovery",
                "category": "unicorn",
                "interview_tracks": ["sde1", "sde2", "senior", "lead", "principal"],
                "difficulty_levels": ["junior", "mid", "senior"]
            },
            {
                "name": "Paytm", 
                "logo_url": "", 
                "description": "Digital Payments & Financial Services",
                "category": "unicorn",
                "interview_tracks": ["associate", "sde", "senior_sde", "principal", "architect"],
                "difficulty_levels": ["junior", "mid", "senior", "staff_plus"]
            },
            {
                "name": "Swiggy", 
                "logo_url": "", 
                "description": "Food Delivery & Quick Commerce",
                "category": "unicorn",
                "interview_tracks": ["sde1", "sde2", "sde3", "staff", "principal"],
                "difficulty_levels": ["junior", "mid", "senior", "staff_plus"]
            }
        ]
        
        for company_data in companies_data:
            exists = await db.companies.find_one({"name": company_data["name"]})
            if not exists:
                company_doc = {
                    "id": str(uuid.uuid4()),
                    "name": company_data["name"],
                    "logo_url": company_data["logo_url"],
                    "description": company_data["description"],
                    "category": company_data["category"],
                    "interview_tracks": company_data["interview_tracks"],
                    "difficulty_levels": company_data["difficulty_levels"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.companies.insert_one(company_doc)
                print(f"✅ Company created: {company_data['name']} ({company_data['category']})")
            else:
                # Update existing companies with new fields
                await db.companies.update_one(
                    {"name": company_data["name"]},
                    {"$set": {
                        "category": company_data["category"],
                        "interview_tracks": company_data["interview_tracks"],
                        "difficulty_levels": company_data["difficulty_levels"]
                    }}
                )
                print(f"✅ Company updated: {company_data['name']} ({company_data['category']})")
        
        # 5. Create Enhanced Time Slots with Interview Types
        from datetime import date, timedelta
        
        time_slots = [
            {"date": "2026-02-01", "start_time": "10:00", "end_time": "11:00", "interview_types": ["coding", "behavioral"]},
            {"date": "2026-02-01", "start_time": "14:00", "end_time": "15:00", "interview_types": ["system_design", "coding"]},
            {"date": "2026-02-02", "start_time": "10:00", "end_time": "11:00", "interview_types": ["coding", "hr_round"]},
            {"date": "2026-02-02", "start_time": "16:00", "end_time": "17:00", "interview_types": ["behavioral", "coding"]},
            {"date": "2026-02-03", "start_time": "11:00", "end_time": "12:00", "interview_types": ["system_design"]},
            {"date": "2026-02-03", "start_time": "15:00", "end_time": "16:30", "interview_types": ["coding", "system_design"]},
            {"date": "2026-02-04", "start_time": "09:00", "end_time": "10:00", "interview_types": ["behavioral", "hr_round"]},
            {"date": "2026-02-04", "start_time": "14:00", "end_time": "15:30", "interview_types": ["coding", "behavioral"]},
        ]
        
        for slot_data in time_slots:
            exists = await db.time_slots.find_one({
                "date": slot_data["date"], 
                "start_time": slot_data["start_time"]
            })
            if not exists:
                slot_doc = {
                    "id": str(uuid.uuid4()),
                    "date": slot_data["date"],
                    "start_time": slot_data["start_time"],
                    "end_time": slot_data["end_time"],
                    "mentor_id": None,
                    "status": "available",
                    "interview_types": slot_data["interview_types"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.time_slots.insert_one(slot_doc)
                print(f"✅ Time slot created: {slot_data['date']} {slot_data['start_time']}-{slot_data['end_time']} ({', '.join(slot_data['interview_types'])})")
            else:
                # Update existing slots with interview types
                await db.time_slots.update_one(
                    {"date": slot_data["date"], "start_time": slot_data["start_time"]},
                    {"$set": {"interview_types": slot_data["interview_types"]}}
                )
                print(f"✅ Time slot updated: {slot_data['date']} {slot_data['start_time']}-{slot_data['end_time']}")
        
        # 6. Create Sample Meet Links
        meet_links = [
            {"link": "https://meet.google.com/abc-defg-hij", "name": "Room 1"},
            {"link": "https://meet.google.com/klm-nopq-rst", "name": "Room 2"},
            {"link": "https://meet.google.com/uvw-xyza-bcd", "name": "Room 3"},
        ]
        
        for link_data in meet_links:
            exists = await db.meet_links.find_one({"link": link_data["link"]})
            if not exists:
                link_doc = {
                    "id": str(uuid.uuid4()),
                    "link": link_data["link"],
                    "name": link_data["name"],
                    "status": "available",
                    "current_booking_id": None,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.meet_links.insert_one(link_doc)
                print(f"✅ Meet link created: {link_data['name']}")
        
        # 7. Create Default Pricing Plans with Enhanced Features
        pricing_plans = [
            {
                "plan_id": "starter",
                "name": "Mock Starter",
                "price": 299900,  # ₹2,999 in paise
                "price_inr": 299900,
                "price_usd": 3600,  # $36 in cents
                "duration_months": 1,
                "features": [
                    "1 MAANG-Level Mock Interview",
                    "Detailed Feedback Report",
                    "Resume Review (Email-based)",
                    "Proven Resume Templates",
                    "Free AI ATS Resume Checker Access"
                ],
                "limits": {
                    "mock_interviews": 1,
                    "resume_reviews": 1,
                    "ai_tools": True,
                    "whatsapp_support": False,
                    "referral_support": False
                },
                "is_active": True,
                "display_order": 1
            },
            {
                "plan_id": "pro",
                "name": "Interview Pro",
                "price": 699900,  # ₹6,999 in paise
                "price_inr": 699900,
                "price_usd": 8400,  # $84 in cents
                "duration_months": 3,
                "features": [
                    "3 MAANG-Level Mock Interviews",
                    "Improvement Tracking Between Mocks",
                    "Resume Review by MAANG Engineer",
                    "1 Strategy Call",
                    "Proven Resume Templates",
                    "Free AI ATS Resume Checker Access"
                ],
                "limits": {
                    "mock_interviews": 3,
                    "resume_reviews": 1,
                    "strategy_calls": 1,
                    "ai_tools": True,
                    "whatsapp_support": False,
                    "referral_support": False
                },
                "is_active": True,
                "display_order": 2
            },
            {
                "plan_id": "elite",
                "name": "Interview Elite",
                "price": 1499900,  # ₹14,999 in paise
                "price_inr": 1499900,
                "price_usd": 18000,  # $180 in cents
                "duration_months": 6,
                "features": [
                    "6 MAANG-Level Mock Interviews",
                    "Live Resume Review Session",
                    "Referral Guidance (Best Effort)",
                    "Priority WhatsApp Support",
                    "Proven Resume Templates",
                    "Free AI ATS Resume Checker Access"
                ],
                "limits": {
                    "mock_interviews": 6,
                    "live_resume_review": 1,
                    "ai_tools": True,
                    "whatsapp_support": True,
                    "referral_support": True
                },
                "is_active": True,
                "display_order": 3
            },
            # AI Agent Standalone Plans
            {
                "plan_id": "agent_trial",
                "name": "AI Agent Trial (1 Month)",
                "price": 9900,  # ₹99 in paise
                "price_inr": 9900,
                "price_usd": 200,  # $2 in cents
                "duration_months": 1,
                "features": [
                    "AI Job Search Agent",
                    "AI Referral Finder",
                    "Daily email digest",
                    "LinkedIn referral drafts",
                    "Resume parsing & scoring"
                ],
                "limits": {
                    "mock_interviews": 0,
                    "ai_job_search": True,
                    "ai_referral_finder": True,
                    "daily_job_digest": True
                },
                "is_active": True,
                "display_order": 4
            },
            {
                "plan_id": "agent_monthly",
                "name": "AI Agent Monthly",
                "price": 19900,  # ₹199 in paise
                "price_inr": 19900,
                "price_usd": 400,  # $4 in cents
                "duration_months": 1,
                "features": [
                    "AI Job Search Agent",
                    "AI Referral Finder",
                    "Daily email digest",
                    "LinkedIn referral drafts",
                    "Resume parsing & scoring"
                ],
                "limits": {
                    "mock_interviews": 0,
                    "ai_job_search": True,
                    "ai_referral_finder": True,
                    "daily_job_digest": True
                },
                "is_active": True,
                "display_order": 5
            },
            {
                "plan_id": "agent_quarterly",
                "name": "AI Agent Quarterly (3 Months)",
                "price": 59900,  # ₹599 in paise
                "price_inr": 59900,
                "price_usd": 1000,  # $10 in cents
                "duration_months": 3,
                "features": [
                    "AI Job Search Agent",
                    "AI Referral Finder",
                    "Daily email digest",
                    "LinkedIn referral drafts",
                    "Resume parsing & scoring",
                    "Save ₹98 (INR) or $2 (USD)"
                ],
                "limits": {
                    "mock_interviews": 0,
                    "ai_job_search": True,
                    "ai_referral_finder": True,
                    "daily_job_digest": True
                },
                "is_active": True,
                "display_order": 6
            }
        ]
        
        for plan_data in pricing_plans:
            exists = await db.pricing_plans.find_one({"plan_id": plan_data["plan_id"]})
            if not exists:
                plan_doc = {
                    "id": str(uuid.uuid4()),
                    "plan_id": plan_data["plan_id"],
                    "name": plan_data["name"],
                    "price": plan_data["price"],
                    "price_inr": plan_data.get("price_inr", plan_data["price"]),
                    "price_usd": plan_data.get("price_usd", int(plan_data["price"] / 83)),  # Fallback conversion
                    "duration_months": plan_data["duration_months"],
                    "features": plan_data["features"],
                    "limits": plan_data["limits"],
                    "is_active": plan_data["is_active"],
                    "display_order": plan_data["display_order"],
                    "currencies": ["INR", "USD"],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await db.pricing_plans.insert_one(plan_doc)
                print(f"✅ Pricing plan created: {plan_data['name']} - ₹{plan_data['price']/100} / ${plan_data.get('price_usd', 0)/100}")
            else:
                # Update existing plans with new pricing
                update_data = {
                    "name": plan_data["name"],
                    "price": plan_data["price"],
                    "price_inr": plan_data.get("price_inr", plan_data["price"]),
                    "price_usd": plan_data.get("price_usd", int(plan_data["price"] / 83)),
                    "duration_months": plan_data["duration_months"],
                    "features": plan_data["features"],
                    "limits": plan_data["limits"],
                    "is_active": plan_data["is_active"],
                    "display_order": plan_data["display_order"],
                    "currencies": ["INR", "USD"],
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await db.pricing_plans.update_one(
                    {"plan_id": plan_data["plan_id"]},
                    {"$set": update_data}
                )
                print(f"✅ Pricing plan updated: {plan_data['name']} - ₹{plan_data['price']/100} / ${plan_data.get('price_usd', 0)/100}")
        
        # Validate pricing integrity
        print("🔍 Validating pricing plan integrity...")
        from validate_pricing_integrity import validate_pricing_integrity
        integrity_ok = await validate_pricing_integrity()
        if integrity_ok:
            print("✅ Pricing integrity validated")
        else:
            print("🔧 Pricing integrity issues fixed")

        print("\n🎉 Initial data setup completed successfully!")
        print("\n📋 Test Credentials:")
        print("   Admin:  admin@codementee.com / Admin@123")
        print("   Mentor: mentor@codementee.com / Mentor@123")
        print("   Mentee: mentee@codementee.com / Mentee@123")
        print("   Free:   free@codementee.com / Free@123 (for payment testing)")
        
    except Exception as e:
        print(f"❌ Error setting up initial data: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(setup_initial_data())