"""
Update Jane's resume review quota to unlimited (999)
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def update_jane_resume_quota():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🔍 Finding Jane's account...")
    
    # Find Jane
    jane = await db.users.find_one({"email": "jane@example.com"})
    
    if not jane:
        print("❌ Jane not found!")
        return
    
    print(f"✅ Found Jane: {jane['name']} ({jane['email']})")
    print(f"   Current plan: {jane.get('plan_id', 'N/A')}")
    print(f"   Current resume reviews: {jane.get('plan_features', {}).get('resume_reviews', 0)}")
    
    # Update Jane's resume review quota
    result = await db.users.update_one(
        {"email": "jane@example.com"},
        {"$set": {
            "plan_features.resume_reviews": 999,  # Unlimited (999 is effectively unlimited)
            "plan_features.resume_review_type": "call"  # Keep call-based review
        }}
    )
    
    if result.modified_count > 0:
        print("✅ Successfully updated Jane's resume review quota to 999 (unlimited)")
        
        # Verify the update
        updated_jane = await db.users.find_one({"email": "jane@example.com"})
        print(f"   New resume reviews: {updated_jane.get('plan_features', {}).get('resume_reviews', 0)}")
        print(f"   Review type: {updated_jane.get('plan_features', {}).get('resume_review_type', 'N/A')}")
    else:
        print("⚠️  No changes made (quota might already be set)")
    
    client.close()
    print("\n✅ Migration complete!")

if __name__ == "__main__":
    asyncio.run(update_jane_resume_quota())
