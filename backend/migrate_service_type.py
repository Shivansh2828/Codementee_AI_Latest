"""
Migration Script: Add service_type to pricing_plans

Adds `service_type: "mock_interview"` to all existing pricing_plans documents
that are missing the field. This is a non-destructive, additive migration —
no existing fields are altered.

Requirements: 6.1, 6.8, 10.6
"""

import asyncio
import os
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


async def migrate_service_type():
    """Add service_type field to all pricing_plans documents missing it."""
    collection = db.pricing_plans

    # Count documents missing service_type
    missing_count = await collection.count_documents({"service_type": {"$exists": False}})
    total_count = await collection.count_documents({})

    logger.info(f"Total pricing_plans documents: {total_count}")
    logger.info(f"Documents missing service_type: {missing_count}")

    if missing_count == 0:
        logger.info("No documents need migration. All plans already have service_type.")
        return {"migrated": 0, "total": total_count, "skipped": total_count}

    # Update all documents missing service_type
    result = await collection.update_many(
        {"service_type": {"$exists": False}},
        {"$set": {"service_type": "mock_interview"}},
    )

    logger.info(f"Migrated {result.modified_count} documents (set service_type='mock_interview')")
    return {
        "migrated": result.modified_count,
        "total": total_count,
        "skipped": total_count - result.modified_count,
    }


async def validate_migration():
    """Validate that all pricing_plans documents now have a service_type field."""
    collection = db.pricing_plans

    missing = await collection.count_documents({"service_type": {"$exists": False}})
    total = await collection.count_documents({})

    if missing > 0:
        logger.error(f"Validation FAILED: {missing}/{total} documents still missing service_type")
        return False

    logger.info(f"Validation PASSED: all {total} documents have service_type")
    return True


async def main():
    logger.info("=" * 60)
    logger.info("Starting service_type migration for pricing_plans")
    logger.info("=" * 60)

    try:
        result = await migrate_service_type()
        logger.info(f"Migration result: {result}")

        valid = await validate_migration()
        if not valid:
            logger.error("Migration validation failed!")
            sys.exit(1)

        logger.info("Migration completed successfully.")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
