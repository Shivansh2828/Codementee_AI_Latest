"""
Setup script: Seed DevOps and AWS course pricing plans.

Run once to create the plans, then manage from Admin Dashboard.

Usage:
  cd backend
  source venv/bin/activate
  python setup_course_plans.py
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

COURSE_PLANS = [
    {
        "id": str(uuid.uuid4()),
        "plan_id": "devops_course",
        "name": "DevOps Course",
        "service_type": "course",
        "price": 49900,        # ₹499 in paise
        "price_inr": 49900,
        "price_usd": 600,      # ~$6
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
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "plan_id": "aws_course",
        "name": "AWS Course",
        "service_type": "course",
        "price": 49900,        # ₹499 in paise
        "price_inr": 49900,
        "price_usd": 600,      # ~$6
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
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "plan_id": "devops_aws_bundle",
        "name": "DevOps + AWS Bundle",
        "service_type": "course",
        "price": 79900,        # ₹799 in paise (save ₹199)
        "price_inr": 79900,
        "price_usd": 1000,     # ~$10
        "duration_months": 0,
        "features": [
            "Everything in DevOps Course",
            "Everything in AWS Course",
            "Save ₹199 vs buying separately",
            "Lifetime access to both courses",
        ],
        "limits": {"course_access": ["devops_course", "aws_course"]},
        "is_active": True,
        "display_order": 12,
        "currencies": ["INR", "USD"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
]


async def seed_course_plans():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    for plan in COURSE_PLANS:
        existing = await db.pricing_plans.find_one({"plan_id": plan["plan_id"]})
        if existing:
            await db.pricing_plans.update_one(
                {"plan_id": plan["plan_id"]},
                {"$set": {**plan, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            print(f"Updated: {plan['plan_id']}")
        else:
            await db.pricing_plans.insert_one(plan)
            print(f"Created: {plan['plan_id']}")

    client.close()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(seed_course_plans())
