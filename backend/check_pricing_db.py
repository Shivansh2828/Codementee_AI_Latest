import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def check_pricing():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    plans = await db.pricing_plans.find({'is_active': True}).sort('display_order', 1).to_list(100)
    print(f'\n✅ Found {len(plans)} active pricing plans in database:\n')
    for plan in plans:
        print(f'  📦 {plan["plan_id"]}: {plan["name"]} - ₹{plan["price"]/100:,.0f}')
        print(f'     Features: {len(plan.get("features", []))} items')
        print(f'     Display Order: {plan.get("display_order", 0)}')
        print(f'     Active: {plan.get("is_active", False)}')
        print()
    client.close()

if __name__ == "__main__":
    asyncio.run(check_pricing())
