"""
One-time script to create Razorpay Subscription Plans for AI Agent plans.

Run ONCE on the server:
  cd backend && python create_razorpay_plans.py

This creates plans in Razorpay and saves their plan IDs to the database
so the backend can reference them when creating subscriptions.
"""

import asyncio
import os
import sys
import razorpay
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

load_dotenv(Path(__file__).parent / ".env")

RAZORPAY_KEY_ID = os.environ["RAZORPAY_KEY_ID"]
RAZORPAY_KEY_SECRET = os.environ["RAZORPAY_KEY_SECRET"]
client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

mongo_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = mongo_client[os.environ["DB_NAME"]]

# Plans to create in Razorpay
PLANS = [
    {
        "internal_id": "agent_monthly",
        "period": "monthly",
        "interval": 1,
        "item": {
            "name": "AI Agent Monthly",
            "amount": 19900,  # ₹199 in paise
            "currency": "INR",
            "description": "AI Job Search + Referral Finder — Monthly subscription"
        }
    },
    {
        "internal_id": "agent_quarterly",
        "period": "monthly",
        "interval": 3,  # Every 3 months
        "item": {
            "name": "AI Agent Quarterly",
            "amount": 59900,  # ₹599 in paise
            "currency": "INR",
            "description": "AI Job Search + Referral Finder — Quarterly subscription (save ₹98)"
        }
    },
]


async def save_plan_id(internal_id: str, razorpay_plan_id: str):
    """Save the Razorpay plan ID to the database."""
    await db.razorpay_plans.update_one(
        {"internal_id": internal_id},
        {"$set": {"internal_id": internal_id, "razorpay_plan_id": razorpay_plan_id}},
        upsert=True
    )
    logger.info(f"  Saved to DB: {internal_id} → {razorpay_plan_id}")


async def main():
    logger.info("=" * 60)
    logger.info("Creating Razorpay Subscription Plans for AI Agents")
    logger.info("=" * 60)

    for plan in PLANS:
        internal_id = plan["internal_id"]
        logger.info(f"\nCreating plan: {internal_id}")

        # Check if already exists in DB
        existing = await db.razorpay_plans.find_one({"internal_id": internal_id})
        if existing and existing.get("razorpay_plan_id"):
            logger.info(f"  Already exists: {existing['razorpay_plan_id']} — skipping")
            continue

        try:
            result = client.plan.create({
                "period": plan["period"],
                "interval": plan["interval"],
                "item": plan["item"],
                "notes": {"internal_id": internal_id}
            })
            razorpay_plan_id = result["id"]
            logger.info(f"  Created: {razorpay_plan_id}")
            await save_plan_id(internal_id, razorpay_plan_id)
        except Exception as e:
            logger.error(f"  Failed to create plan {internal_id}: {e}")

    # Show all saved plans
    logger.info("\n--- Saved Razorpay Plans ---")
    plans = await db.razorpay_plans.find({}).to_list(100)
    for p in plans:
        logger.info(f"  {p['internal_id']} → {p.get('razorpay_plan_id', 'MISSING')}")

    logger.info("\nDone. Add these plan IDs to your .env if needed.")
    mongo_client.close()


if __name__ == "__main__":
    asyncio.run(main())
