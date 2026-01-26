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
                "status": "active",
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
                "status": "active",
                "mentor_id": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(mentor_user)
            print("✅ Mentor user created: mentor@codementee.com / Mentor@123")
        else:
            print("ℹ️  Mentor user already exists")
        
        # 3. Create Mentee User
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
        
        # 4. Create Sample Companies
        companies_data = [
            {"name": "Amazon", "logo_url": "", "description": "E-commerce & Cloud Giant"},
            {"name": "Google", "logo_url": "", "description": "Search & Technology Leader"},
            {"name": "Microsoft", "logo_url": "", "description": "Software & Cloud Services"},
            {"name": "Meta", "logo_url": "", "description": "Social Media & VR/AR"},
            {"name": "Apple", "logo_url": "", "description": "Consumer Electronics & Software"},
            {"name": "Netflix", "logo_url": "", "description": "Streaming & Entertainment"},
        ]
        
        for company_data in companies_data:
            exists = await db.companies.find_one({"name": company_data["name"]})
            if not exists:
                company_doc = {
                    "id": str(uuid.uuid4()),
                    "name": company_data["name"],
                    "logo_url": company_data["logo_url"],
                    "description": company_data["description"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.companies.insert_one(company_doc)
                print(f"✅ Company created: {company_data['name']}")
        
        # 5. Create Sample Time Slots
        from datetime import date, timedelta
        
        time_slots = [
            {"date": "2026-02-01", "start_time": "10:00", "end_time": "11:00"},
            {"date": "2026-02-01", "start_time": "14:00", "end_time": "15:00"},
            {"date": "2026-02-02", "start_time": "10:00", "end_time": "11:00"},
            {"date": "2026-02-02", "start_time": "16:00", "end_time": "17:00"},
            {"date": "2026-02-03", "start_time": "11:00", "end_time": "12:00"},
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
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.time_slots.insert_one(slot_doc)
                print(f"✅ Time slot created: {slot_data['date']} {slot_data['start_time']}-{slot_data['end_time']}")
        
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
        
        # 7. Create Default Pricing Plans
        pricing_plans = [
            {
                "plan_id": "monthly",
                "name": "Monthly Plan",
                "price": 199900,  # ₹1,999 in paise
                "duration_months": 1,
                "features": [
                    "Unlimited mock interviews",
                    "Detailed feedback reports",
                    "Company-specific preparation",
                    "Email support"
                ],
                "is_active": True,
                "display_order": 1
            },
            {
                "plan_id": "quarterly",
                "name": "3 Months Plan",
                "price": 499900,  # ₹4,999 in paise
                "duration_months": 3,
                "features": [
                    "Unlimited mock interviews",
                    "Detailed feedback reports",
                    "Company-specific preparation",
                    "Priority mentor assignment",
                    "Email & chat support",
                    "Progress tracking"
                ],
                "is_active": True,
                "display_order": 2
            },
            {
                "plan_id": "biannual",
                "name": "6 Months Plan",
                "price": 899900,  # ₹8,999 in paise
                "duration_months": 6,
                "features": [
                    "Unlimited mock interviews",
                    "Detailed feedback reports",
                    "Company-specific preparation",
                    "Priority mentor assignment",
                    "24/7 support",
                    "Progress tracking",
                    "Career guidance sessions",
                    "Resume review"
                ],
                "is_active": True,
                "display_order": 3
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
                    "duration_months": plan_data["duration_months"],
                    "features": plan_data["features"],
                    "is_active": plan_data["is_active"],
                    "display_order": plan_data["display_order"],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await db.pricing_plans.insert_one(plan_doc)
                print(f"✅ Pricing plan created: {plan_data['name']} - ₹{plan_data['price']/100}")
        
        print("\n🎉 Initial data setup completed successfully!")
        print("\n📋 Test Credentials:")
        print("   Admin:  admin@codementee.com / Admin@123")
        print("   Mentor: mentor@codementee.com / Mentor@123")
        print("   Mentee: mentee@codementee.com / Mentee@123")
        
    except Exception as e:
        print(f"❌ Error setting up initial data: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(setup_initial_data())