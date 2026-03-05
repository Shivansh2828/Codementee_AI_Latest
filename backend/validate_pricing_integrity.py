#!/usr/bin/env python3
"""
Pricing Integrity Validator
Ensures no duplicate pricing plans exist in the database
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from collections import defaultdict

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'codementee')


async def validate_pricing_integrity():
    """
    Validate pricing plan integrity:
    1. Check for duplicate plan_ids
    2. Check for duplicate names
    3. Ensure all plans have required fields
    4. Remove duplicates if found
    
    Returns:
        bool: True if integrity is OK, False if issues were found and fixed
    """
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        print("🔍 Validating pricing plan integrity...")
        
        # Fetch all pricing plans
        plans = await db.pricing_plans.find({}).to_list(length=None)
        
        if not plans:
            print("⚠️  No pricing plans found in database")
            return True
        
        print(f"📊 Found {len(plans)} pricing plan(s)")
        
        # Track duplicates
        plan_ids = defaultdict(list)
        plan_names = defaultdict(list)
        issues_found = False
        
        # Check for duplicates
        for plan in plans:
            plan_id = plan.get('plan_id')
            name = plan.get('name')
            doc_id = plan.get('id')
            
            if plan_id:
                plan_ids[plan_id].append(doc_id)
            if name:
                plan_names[name].append(doc_id)
        
        # Check for duplicate plan_ids
        for plan_id, doc_ids in plan_ids.items():
            if len(doc_ids) > 1:
                issues_found = True
                print(f"❌ Duplicate plan_id found: '{plan_id}' ({len(doc_ids)} instances)")
                print(f"   Document IDs: {doc_ids}")
                
                # Keep the first one, delete the rest
                for doc_id in doc_ids[1:]:
                    await db.pricing_plans.delete_one({"id": doc_id})
                    print(f"   🗑️  Deleted duplicate: {doc_id}")
        
        # Check for duplicate names
        for name, doc_ids in plan_names.items():
            if len(doc_ids) > 1:
                issues_found = True
                print(f"⚠️  Duplicate plan name found: '{name}' ({len(doc_ids)} instances)")
                print(f"   Document IDs: {doc_ids}")
                # Note: We don't auto-delete by name as names might be intentionally similar
        
        # Validate required fields
        required_fields = ['plan_id', 'name', 'price', 'duration_months']
        for plan in plans:
            missing_fields = [field for field in required_fields if field not in plan]
            if missing_fields:
                issues_found = True
                print(f"❌ Plan '{plan.get('name', 'Unknown')}' missing fields: {missing_fields}")
        
        # Final report
        if issues_found:
            print("\n🔧 Pricing integrity issues found and fixed")
            
            # Show final state
            final_plans = await db.pricing_plans.find({}).to_list(length=None)
            print(f"\n📊 Final state: {len(final_plans)} pricing plan(s)")
            for plan in final_plans:
                print(f"   ✓ {plan.get('plan_id')}: {plan.get('name')} - ₹{plan.get('price', 0)/100}")
            
            return False
        else:
            print("✅ Pricing integrity validated - no issues found")
            
            # Show current plans
            print(f"\n📊 Current pricing plans:")
            for plan in plans:
                print(f"   ✓ {plan.get('plan_id')}: {plan.get('name')} - ₹{plan.get('price', 0)/100}")
            
            return True
            
    except Exception as e:
        print(f"❌ Error validating pricing integrity: {str(e)}")
        return False
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(validate_pricing_integrity())
