"""
Setup script: Create resume review pricing plan templates (no hardcoded prices).

This script creates resume review plan templates. All prices are managed dynamically
from the Admin Dashboard. Supports multi-currency with Razorpay (INR) and Cashfree (USD).

Usage:
  cd backend
  source venv/bin/activate
  python setup_resume_review_plans.py

After running this, go to Admin Dashboard → Pricing to set prices for each currency.
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

# Resume review plan templates — NO HARDCODED PRICES
# All prices are set via Admin Dashboard and stored in the database
RESUME_REVIEW_PLANS = [
    {
        "id": str(uuid.uuid4()),
        "plan_id": "starter_resume",
        "name": "Starter Resume Review",
        "service_type": "resume_review",
        "description": "Email-based resume review from a MAANG engineer",
        # Default prices (can be updated via Admin Dashboard)
        "price_inr": 29900,  # ₹299
        "price_usd": 400,    # $4
        "duration_months": 0,  # One-time service
        "features": [
            "1 resume review",
            "Email-based feedback",
            "Detailed comments on resume",
            "ATS optimization tips",
            "5 business days delivery",
        ],
        "limits": {"resume_reviews": 1},
        "is_active": True,
        "display_order": 1,
        "review_type": "email",
        "delivery_timeframe": "5 business days",
        "currencies": ["INR", "USD"],
        "payment_gateways": {
            "INR": "razorpay",      # India: Razorpay
            "USD": "cashfree"       # International: Cashfree
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "plan_id": "pro_resume",
        "name": "Pro Resume Review",
        "service_type": "resume_review",
        "description": "Live 30-minute call with a MAANG engineer for resume review",
        # Default prices (can be updated via Admin Dashboard)
        "price_inr": 59900,  # ₹599
        "price_usd": 800,    # $8
        "duration_months": 0,  # One-time service
        "features": [
            "1 live resume review call",
            "30 minutes with MAANG engineer",
            "Real-time feedback & suggestions",
            "ATS optimization",
            "LinkedIn profile review",
            "Immediate availability",
        ],
        "limits": {"resume_reviews": 1},
        "is_active": True,
        "display_order": 2,
        "review_type": "call",
        "delivery_timeframe": "Immediate",
        "session_duration_minutes": 30,
        "currencies": ["INR", "USD"],
        "payment_gateways": {
            "INR": "razorpay",      # India: Razorpay
            "USD": "cashfree"       # International: Cashfree
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "plan_id": "elite_resume",
        "name": "Elite Resume Review",
        "service_type": "resume_review",
        "description": "2 resume reviews (email + call) with senior MAANG engineers",
        # Default prices (can be updated via Admin Dashboard)
        "price_inr": 99900,  # ₹999
        "price_usd": 1200,   # $12
        "duration_months": 0,  # One-time service
        "features": [
            "1 email-based resume review",
            "1 live 45-minute review call",
            "Senior MAANG engineer",
            "Complete resume overhaul",
            "LinkedIn optimization",
            "Cover letter review",
            "Interview-ready resume",
        ],
        "limits": {"resume_reviews": 2},
        "is_active": True,
        "display_order": 3,
        "review_type": "both",
        "delivery_timeframe": "5 business days + Immediate call",
        "session_duration_minutes": 45,
        "currencies": ["INR", "USD"],
        "payment_gateways": {
            "INR": "razorpay",      # India: Razorpay
            "USD": "cashfree"       # International: Cashfree
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
]


async def seed_resume_review_plans():
    """Create resume review plan templates with default prices."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    for plan in RESUME_REVIEW_PLANS:
        existing = await db.pricing_plans.find_one({"plan_id": plan["plan_id"]})
        if existing:
            # Update all fields including prices
            plan["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.pricing_plans.update_one(
                {"plan_id": plan["plan_id"]},
                {"$set": plan}
            )
            print(f"✓ Updated: {plan['plan_id']} (price_inr={plan['price_inr']}, price_usd={plan['price_usd']})")
        else:
            await db.pricing_plans.insert_one(plan)
            print(f"✓ Created: {plan['plan_id']} (price_inr={plan['price_inr']}, price_usd={plan['price_usd']})")

    client.close()
    print("\n✅ Done. Resume review plans created with default prices.")
    print("📌 You can update prices anytime via Admin Dashboard → Pricing")


if __name__ == "__main__":
    asyncio.run(seed_resume_review_plans())
