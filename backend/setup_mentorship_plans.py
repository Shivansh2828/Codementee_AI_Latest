"""
Setup script to seed 1:1 Mentorship pricing plans into the pricing_plans collection.
Run this once to create the plans, then manage them from the Admin Dashboard.

Usage:
  cd backend
  source venv/bin/activate
  python setup_mentorship_plans.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "codementee")

MENTORSHIP_PLANS = [
    {
        "id": str(uuid.uuid4()),
        "plan_id": "mentorship_starter",
        "name": "Mentorship Starter",
        "service_type": "mentorship",
        "price": 299900,          # ₹2,999 in paise
        "price_inr": 299900,
        "price_usd": 3600,        # $36 in cents
        "duration_months": 1,
        "sessions_count": 2,
        "session_duration_minutes": 45,
        "features": [
            "2 × 45-min 1:1 sessions with MAANG mentor",
            "Personalized career roadmap",
            "Resume feedback",
            "Chat support between sessions",
        ],
        "limits": {},
        "is_active": True,
        "display_order": 1,
        "currencies": ["INR", "USD"],
    },
    {
        "id": str(uuid.uuid4()),
        "plan_id": "mentorship_growth",
        "name": "Mentorship Growth",
        "service_type": "mentorship",
        "price": 499900,          # ₹4,999 in paise
        "price_inr": 499900,
        "price_usd": 6000,        # $60 in cents
        "duration_months": 1,
        "sessions_count": 4,
        "session_duration_minutes": 45,
        "features": [
            "4 × 45-min 1:1 sessions with MAANG mentor",
            "Personalized career roadmap",
            "Resume review + optimization",
            "Mock interview practice",
            "Priority chat support",
        ],
        "limits": {},
        "is_active": True,
        "display_order": 2,
        "currencies": ["INR", "USD"],
    },
    {
        "id": str(uuid.uuid4()),
        "plan_id": "mentorship_accelerator",
        "name": "Mentorship Accelerator",
        "service_type": "mentorship",
        "price": 899900,          # ₹8,999 in paise
        "price_inr": 899900,
        "price_usd": 10800,       # $108 in cents
        "duration_months": 3,
        "sessions_count": 12,
        "session_duration_minutes": 60,
        "features": [
            "12 × 60-min 1:1 sessions (weekly for 3 months)",
            "Dedicated MAANG mentor",
            "Complete interview prep (DSA + System Design + Behavioral)",
            "Resume overhaul",
            "Company-specific preparation",
            "Unlimited chat support",
            "Job referrals (where possible)",
        ],
        "limits": {},
        "is_active": True,
        "display_order": 3,
        "currencies": ["INR", "USD"],
    },
]


async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    print(f"Connected to {DB_NAME}")
    print(f"Setting up Mentorship pricing plans...\n")

    for plan in MENTORSHIP_PLANS:
        existing = await db.pricing_plans.find_one({"plan_id": plan["plan_id"]})
        if existing:
            plan["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.pricing_plans.update_one(
                {"plan_id": plan["plan_id"]},
                {"$set": plan}
            )
            print(f"  ✅ Updated: {plan['plan_id']} — {plan['name']} — ₹{plan['price_inr'] / 100} — {plan['sessions_count']} sessions")
        else:
            plan["created_at"] = datetime.now(timezone.utc).isoformat()
            plan["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.pricing_plans.insert_one(plan)
            print(f"  ✅ Created: {plan['plan_id']} — {plan['name']} — ₹{plan['price_inr'] / 100} — {plan['sessions_count']} sessions")

    # Verify
    print(f"\n--- Current Mentorship plans in DB ---")
    async for p in db.pricing_plans.find({"service_type": "mentorship"}).sort("display_order", 1):
        status = "🟢 Active" if p.get("is_active") else "🔴 Inactive"
        print(f"  {status} {p['plan_id']}: {p['name']} — ₹{p.get('price_inr', 0) / 100} — {p.get('sessions_count', 0)} sessions × {p.get('session_duration_minutes', 0)} min")

    print(f"\nDone! Manage from Admin Dashboard → Pricing → Mentorship tab.")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
