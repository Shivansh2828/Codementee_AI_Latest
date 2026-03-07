"""
Add test booking data for social proof popup testing
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "codementee")

async def add_test_bookings():
    """Add test confirmed bookings for social proof"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Sample test bookings
    test_bookings = [
        {
            "mentee_name": "Rahul Sharma",
            "company_name": "Amazon",
            "interview_type": "coding"
        },
        {
            "mentee_name": "Priya Patel",
            "company_name": "Google",
            "interview_type": "system_design"
        },
        {
            "mentee_name": "Amit Kumar",
            "company_name": "Microsoft",
            "interview_type": "behavioral"
        },
        {
            "mentee_name": "Sneha Reddy",
            "company_name": "Meta",
            "interview_type": "coding"
        },
        {
            "mentee_name": "Vikram Singh",
            "company_name": "Flipkart",
            "interview_type": "system_design"
        }
    ]
    
    # Add bookings with timestamps in the last 24 hours
    for i, booking in enumerate(test_bookings):
        # Spread bookings over the last 12 hours
        hours_ago = i * 2 + 1
        confirmed_at = (datetime.now(timezone.utc) - timedelta(hours=hours_ago)).isoformat()
        
        booking_doc = {
            "id": str(uuid.uuid4()),
            "mentee_id": str(uuid.uuid4()),
            "mentee_name": booking["mentee_name"],
            "mentee_email": f"test{i}@example.com",
            "company_name": booking["company_name"],
            "interview_type": booking["interview_type"],
            "status": "confirmed",
            "confirmed_at": confirmed_at,
            "confirmed_by": "admin",
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=hours_ago + 1)).isoformat()
        }
        
        # Check if already exists
        existing = await db.booking_requests.find_one({"mentee_email": booking_doc["mentee_email"]})
        if not existing:
            await db.booking_requests.insert_one(booking_doc)
            print(f"✅ Added test booking: {booking['mentee_name']} - {booking['company_name']} {booking['interview_type']}")
        else:
            print(f"⏭️  Skipped (already exists): {booking['mentee_name']}")
    
    print(f"\n✅ Test bookings setup complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_test_bookings())
