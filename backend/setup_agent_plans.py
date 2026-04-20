"""
Setup script to seed AI Agent pricing plans into the pricing_plans collection.
Run this once to create the plans, then manage them from the Admin Dashboard.

Usage:
  cd backend
  source venv/bin/activate
  python setup_agent_plans.py
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

AGENT_PLANS = [
    {
        "id": str(uuid.uuid4()),
        "plan_id": "agent_trial",
        "name": "AI Agent Trial (1 Month)",
        "service_type": "ai_agent",
        "price": 9900,           # ₹99 in paise
        "price_inr": 9900,
        "price_usd": 200,        # $2 in cents
        "duration_months": 1,
        "features": [
            "Job Search Agent — 5 searches",
            "Referral Finder Agent — 3 searches",
            "Email support",
        ],
        "limits": {
            "job_searches": 5,
            "referral_searches": 3,
        },
        "is_active": True,
        "display_order": 1,
        "currencies": ["INR", "USD"],
    },
    {
        "id": str(uuid.uuid4()),
        "plan_id": "agent_monthly",
        "name": "AI Agent Monthly",
        "service_type": "ai_agent",
        "price": 19900,          # ₹199 in paise
        "price_inr": 19900,
        "price_usd": 400,        # $4 in cents
        "duration_months": 1,
        "features": [
            "Job Search Agent — 30 searches/month",
            "Referral Finder Agent — 20 searches/month",
            "Auto job alerts (daily email digest)",
            "Priority support",
        ],
        "limits": {
            "job_searches": 30,
            "referral_searches": 20,
        },
        "is_active": True,
        "display_order": 2,
        "currencies": ["INR", "USD"],
    },
    {
        "id": str(uuid.uuid4()),
        "plan_id": "agent_quarterly",
        "name": "AI Agent Quarterly (3 Months)",
        "service_type": "ai_agent",
        "price": 49900,          # ₹499 in paise
        "price_inr": 49900,
        "price_usd": 1000,       # $10 in cents
        "duration_months": 3,
        "features": [
            "Job Search Agent — Unlimited searches",
            "Referral Finder Agent — Unlimited searches",
            "Auto job alerts (daily email digest)",
            "Priority support",
            "Save ₹98 vs monthly",
        ],
        "limits": {
            "job_searches": -1,
            "referral_searches": -1,
        },
        "is_active": True,
        "display_order": 3,
        "currencies": ["INR", "USD"],
    },
    {
        "id": str(uuid.uuid4()),
        "plan_id": "agent_yearly",
        "name": "AI Agent Yearly",
        "service_type": "ai_agent",
        "price": 149900,         # ₹1,499 in paise
        "price_inr": 149900,
        "price_usd": 1800,       # $18 in cents
        "duration_months": 12,
        "features": [
            "Job Search Agent — Unlimited searches",
            "Referral Finder Agent — Unlimited searches",
            "Auto job alerts (daily email digest)",
            "Priority support",
            "Save 37% vs monthly",
        ],
        "limits": {
            "job_searches": -1,
            "referral_searches": -1,
        },
        "is_active": True,
        "display_order": 4,
        "currencies": ["INR", "USD"],
    },
]


async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    print(f"Connected to {DB_NAME}")
    print(f"Setting up AI Agent pricing plans...\n")

    for plan in AGENT_PLANS:
        existing = await db.pricing_plans.find_one({"plan_id": plan["plan_id"]})
        if existing:
            # Update existing plan
            plan["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.pricing_plans.update_one(
                {"plan_id": plan["plan_id"]},
                {"$set": plan}
            )
            print(f"  ✅ Updated: {plan['plan_id']} — {plan['name']} — ₹{plan['price_inr'] / 100}")
        else:
            # Insert new plan
            plan["created_at"] = datetime.now(timezone.utc).isoformat()
            plan["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.pricing_plans.insert_one(plan)
            print(f"  ✅ Created: {plan['plan_id']} — {plan['name']} — ₹{plan['price_inr'] / 100}")

    # Verify
    print(f"\n--- Current AI Agent plans in DB ---")
    async for p in db.pricing_plans.find({"service_type": "ai_agent"}).sort("display_order", 1):
        status = "🟢 Active" if p.get("is_active") else "🔴 Inactive"
        print(f"  {status} {p['plan_id']}: {p['name']} — ₹{p.get('price_inr', 0) / 100} / ${p.get('price_usd', 0) / 100}")

    print(f"\nDone! You can now manage these plans from Admin Dashboard → Pricing → AI Agents tab.")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
