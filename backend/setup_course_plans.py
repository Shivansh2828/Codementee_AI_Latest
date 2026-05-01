"""
Setup script: Create course pricing plan templates (no hardcoded prices).

This script creates empty course plan templates. All prices are managed dynamically
from the Admin Dashboard. Supports multi-currency with Razorpay (INR) and Cashfree (USD).

Usage:
  cd backend
  source venv/bin/activate
  python setup_course_plans.py

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

# Course plan templates — NO HARDCODED PRICES
# All prices are set via Admin Dashboard and stored in the database
COURSE_PLANS = [
    {
        "id": str(uuid.uuid4()),
        "plan_id": "devops_course",
        "name": "DevOps Course",
        "service_type": "course",
        "description": "Complete DevOps interview prep — Docker, Kubernetes, CI/CD, Terraform, AWS, and more",
        # Prices are set in Admin Dashboard, not hardcoded here
        "price_inr": None,  # Set via Admin Dashboard
        "price_usd": None,  # Set via Admin Dashboard
        "duration_months": 0,  # One-time, lifetime access
        "features": [
            "64 topics — Docker, Kubernetes, CI/CD, Terraform, AWS",
            "30-Day MAANG-ready roadmap",
            "Real scenario & troubleshooting questions",
            "Lifetime access",
        ],
        "limits": {"course_access": ["devops_course"]},
        "is_active": True,
        "display_order": 10,
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
        "plan_id": "aws_course",
        "name": "AWS Course",
        "service_type": "course",
        "description": "Master AWS for cloud engineering interviews — IAM, EC2, S3, VPC, Lambda, and system design",
        # Prices are set in Admin Dashboard, not hardcoded here
        "price_inr": None,  # Set via Admin Dashboard
        "price_usd": None,  # Set via Admin Dashboard
        "duration_months": 0,  # One-time, lifetime access
        "features": [
            "36 topics — IAM, EC2, S3, VPC, RDS, Lambda, ECS/EKS",
            "30-Day MAANG-ready roadmap",
            "System design on AWS + production scenarios",
            "Lifetime access",
        ],
        "limits": {"course_access": ["aws_course"]},
        "is_active": True,
        "display_order": 11,
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
        "plan_id": "devops_aws_bundle",
        "name": "DevOps + AWS Bundle",
        "service_type": "course",
        "description": "Get both DevOps and AWS courses at a discounted bundle price",
        # Prices are set in Admin Dashboard, not hardcoded here
        "price_inr": None,  # Set via Admin Dashboard
        "price_usd": None,  # Set via Admin Dashboard
        "duration_months": 0,  # One-time, lifetime access
        "features": [
            "Everything in DevOps Course",
            "Everything in AWS Course",
            "Bundle discount applied",
            "Lifetime access to both courses",
        ],
        "limits": {"course_access": ["devops_course", "aws_course"]},
        "is_active": True,
        "display_order": 12,
        "currencies": ["INR", "USD"],
        "payment_gateways": {
            "INR": "razorpay",      # India: Razorpay
            "USD": "cashfree"       # International: Cashfree
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
]


async def seed_course_plans():
    """Create course plan templates. Prices must be set via Admin Dashboard."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    for plan in COURSE_PLANS:
        existing = await db.pricing_plans.find_one({"plan_id": plan["plan_id"]})
        if existing:
            # Update only non-price fields to preserve admin-set prices
            update_data = {k: v for k, v in plan.items() if k not in ["price_inr", "price_usd"]}
            update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.pricing_plans.update_one(
                {"plan_id": plan["plan_id"]},
                {"$set": update_data}
            )
            print(f"✓ Updated: {plan['plan_id']} (prices preserved from Admin Dashboard)")
        else:
            await db.pricing_plans.insert_one(plan)
            print(f"✓ Created: {plan['plan_id']} (set prices in Admin Dashboard)")

    client.close()
    print("\n✅ Done. Course plans created.")
    print("📌 Next step: Go to Admin Dashboard → Pricing to set prices for each currency.")
    print("   - DevOps Course: Set price_inr and price_usd")
    print("   - AWS Course: Set price_inr and price_usd")
    print("   - Bundle: Set price_inr and price_usd (with discount)")


if __name__ == "__main__":
    asyncio.run(seed_course_plans())
