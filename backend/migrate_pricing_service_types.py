"""
Migration Script: Fix service_type on all pricing_plans

Sets the correct service_type for each plan based on plan_id:
- starter, pro, elite → mock_interview
- mentorship_* → mentorship
- resume_* → resume_review
- agent_* → ai_agent
- Plans with no service_type and no matching pattern → mock_interview (default)

Also ensures all mock interview plans have correct price_inr synced with price field.

Run: cd backend && python migrate_pricing_service_types.py
"""

import asyncio
import os
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s", handlers=[logging.StreamHandler(sys.stdout)])
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]


def get_service_type(plan_id: str, current_service_type: str = None) -> str:
    """Determine the correct service_type based on plan_id."""
    if current_service_type and current_service_type != "mock_interview":
        # If already set to something specific (mentorship, resume_review, ai_agent), keep it
        return current_service_type

    plan_id = (plan_id or "").lower()
    if plan_id.startswith("mentorship_"):
        return "mentorship"
    if plan_id.startswith("resume_"):
        return "resume_review"
    if plan_id.startswith("agent_"):
        return "ai_agent"
    # Default: starter, pro, elite, and anything else → mock_interview
    return "mock_interview"


async def migrate():
    collection = db.pricing_plans
    plans = await collection.find({}).to_list(100)

    logger.info(f"Found {len(plans)} pricing plans in database")
    logger.info("-" * 60)

    updated = 0
    for plan in plans:
        plan_id = plan.get("plan_id", "unknown")
        current_st = plan.get("service_type")
        correct_st = get_service_type(plan_id, current_st)

        changes = {}

        # Fix service_type if missing or wrong
        if current_st != correct_st:
            changes["service_type"] = correct_st

        # Ensure price_inr is synced with price
        if plan.get("price") and not plan.get("price_inr"):
            changes["price_inr"] = plan["price"]

        # Ensure price is synced with price_inr
        if plan.get("price_inr") and not plan.get("price"):
            changes["price"] = plan["price_inr"]

        if changes:
            changes["updated_at"] = datetime.now(timezone.utc).isoformat()
            await collection.update_one({"_id": plan["_id"]}, {"$set": changes})
            logger.info(f"  ✅ {plan_id}: updated {changes}")
            updated += 1
        else:
            logger.info(f"  ⏭️  {plan_id}: already correct (service_type={current_st})")

    logger.info("-" * 60)
    logger.info(f"Updated {updated}/{len(plans)} plans")


async def show_summary():
    collection = db.pricing_plans
    plans = await collection.find({}).sort("display_order", 1).to_list(100)

    logger.info("\n📋 Current pricing_plans summary:")
    logger.info(f"{'plan_id':<20} {'service_type':<18} {'active':<8} {'price_inr':<12} {'price_usd':<12} {'name'}")
    logger.info("-" * 90)
    for p in plans:
        logger.info(
            f"{p.get('plan_id','?'):<20} "
            f"{p.get('service_type','MISSING'):<18} "
            f"{str(p.get('is_active', '?')):<8} "
            f"{str(p.get('price_inr','?')):<12} "
            f"{str(p.get('price_usd','?')):<12} "
            f"{p.get('name','?')}"
        )


async def main():
    logger.info("=" * 60)
    logger.info("Pricing Plans — service_type migration")
    logger.info("=" * 60)

    try:
        await show_summary()
        logger.info("")
        await migrate()
        await show_summary()
        logger.info("\nDone.")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
