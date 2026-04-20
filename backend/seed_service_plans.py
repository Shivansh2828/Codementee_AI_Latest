"""
Seed Script: Add Mentorship and Resume Review pricing plans to the database.

This script creates the mentorship and resume review plans that are currently
only hardcoded in the frontend pages. After running this, they'll appear in
the admin pricing dashboard under their respective tabs and be editable.

Also ensures all existing mock interview plans have service_type set.

Run: cd backend && python seed_service_plans.py
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

load_dotenv(Path(__file__).parent / ".env")
client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

MENTORSHIP_PLANS = [
    {
        "plan_id": "mentorship_1m",
        "name": "1 Month",
        "service_type": "mentorship",
        "price": 999900,
        "price_inr": 999900,
        "price_usd": 12000,
        "duration_months": 1,
        "sessions_count": 4,
        "session_duration_minutes": 60,
        "features": [
            "4 sessions (1 hr each)",
            "Dedicated mentor",
            "Personalized study plan",
            "Chat support between sessions"
        ],
        "limits": {"sessions": 4},
        "is_active": True,
        "display_order": 1,
        "discount_percent": 0,
        "currencies": ["INR", "USD"],
    },
    {
        "plan_id": "mentorship_2m",
        "name": "2 Months",
        "service_type": "mentorship",
        "price": 1799900,
        "price_inr": 1799900,
        "price_usd": 21600,
        "duration_months": 2,
        "sessions_count": 8,
        "session_duration_minutes": 60,
        "features": [
            "8 sessions (1 hr each)",
            "Dedicated mentor",
            "Personalized study plan",
            "Chat support between sessions",
            "Resume review included"
        ],
        "limits": {"sessions": 8},
        "is_active": True,
        "display_order": 2,
        "discount_percent": 10,
        "currencies": ["INR", "USD"],
    },
    {
        "plan_id": "mentorship_3m",
        "name": "3 Months",
        "service_type": "mentorship",
        "price": 2399900,
        "price_inr": 2399900,
        "price_usd": 28800,
        "duration_months": 3,
        "sessions_count": 12,
        "session_duration_minutes": 60,
        "features": [
            "12 sessions (1 hr each)",
            "Dedicated mentor",
            "Personalized study plan",
            "Chat support between sessions",
            "Resume review included",
            "Priority scheduling"
        ],
        "limits": {"sessions": 12},
        "is_active": True,
        "display_order": 3,
        "discount_percent": 20,
        "currencies": ["INR", "USD"],
    },
]

RESUME_REVIEW_PLANS = [
    {
        "plan_id": "resume_email",
        "name": "Review over Email",
        "service_type": "resume_review",
        "price": 149900,
        "price_inr": 149900,
        "price_usd": 1800,
        "duration_months": 0,
        "features": [
            "Detailed written feedback",
            "ATS compatibility check",
            "Formatting & structure review",
            "Delivered in 5 business days"
        ],
        "review_type": "email",
        "delivery_timeframe": "5 business days",
        "limits": {"resume_reviews": 1},
        "is_active": True,
        "display_order": 1,
        "currencies": ["INR", "USD"],
    },
    {
        "plan_id": "resume_call",
        "name": "45-min Call",
        "service_type": "resume_review",
        "price": 299900,
        "price_inr": 299900,
        "price_usd": 3600,
        "duration_months": 0,
        "session_duration_minutes": 45,
        "features": [
            "Live 1-on-1 video session",
            "Real-time resume walkthrough",
            "ATS compatibility check",
            "Personalized improvement plan",
            "Follow-up summary via email"
        ],
        "review_type": "call",
        "delivery_timeframe": "Live session",
        "limits": {"resume_reviews": 1},
        "is_active": True,
        "display_order": 2,
        "currencies": ["INR", "USD"],
    },
]


async def seed_plans(plans, label):
    """Insert plans that don't already exist."""
    created = 0
    skipped = 0
    for plan in plans:
        existing = await db.pricing_plans.find_one({"plan_id": plan["plan_id"]})
        if existing:
            logger.info(f"  ⏭️  {plan['plan_id']}: already exists — skipped")
            skipped += 1
            continue

        plan["id"] = str(uuid.uuid4())
        plan["created_at"] = datetime.now(timezone.utc).isoformat()
        plan["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.pricing_plans.insert_one(plan)
        logger.info(f"  ✅ {plan['plan_id']}: created ({plan['name']})")
        created += 1

    logger.info(f"  {label}: {created} created, {skipped} skipped")
    return created


async def fix_mock_interview_service_type():
    """Ensure starter/pro/elite have service_type=mock_interview."""
    mock_ids = ["starter", "pro", "elite"]
    fixed = 0
    for pid in mock_ids:
        result = await db.pricing_plans.update_one(
            {"plan_id": pid, "$or": [{"service_type": {"$exists": False}}, {"service_type": None}]},
            {"$set": {"service_type": "mock_interview", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        if result.modified_count > 0:
            logger.info(f"  ✅ {pid}: set service_type=mock_interview")
            fixed += 1
    return fixed


async def show_summary():
    plans = await db.pricing_plans.find({}).sort("display_order", 1).to_list(100)
    logger.info(f"\n📋 All pricing plans ({len(plans)}):")
    logger.info(f"{'plan_id':<20} {'service_type':<18} {'active':<8} {'INR':<10} {'USD':<10} {'name'}")
    logger.info("-" * 85)
    for p in plans:
        inr = p.get("price_inr", p.get("price", "?"))
        usd = p.get("price_usd", "?")
        logger.info(
            f"{p.get('plan_id','?'):<20} "
            f"{p.get('service_type','MISSING'):<18} "
            f"{str(p.get('is_active','?')):<8} "
            f"{str(inr):<10} "
            f"{str(usd):<10} "
            f"{p.get('name','?')}"
        )


async def main():
    logger.info("=" * 60)
    logger.info("Seeding Mentorship & Resume Review pricing plans")
    logger.info("=" * 60)

    try:
        await show_summary()

        logger.info("\n--- Fixing mock interview service_type ---")
        await fix_mock_interview_service_type()

        logger.info("\n--- Seeding Mentorship plans ---")
        await seed_plans(MENTORSHIP_PLANS, "Mentorship")

        logger.info("\n--- Seeding Resume Review plans ---")
        await seed_plans(RESUME_REVIEW_PLANS, "Resume Review")

        await show_summary()
        logger.info("\nDone.")
    except Exception as e:
        logger.error(f"Failed: {e}")
        sys.exit(1)
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
