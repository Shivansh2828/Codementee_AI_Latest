"""
Backup Script for Migration

This script creates backups of the booking_requests, mocks, and time_slots collections
before running the migration. Backups are stored with timestamps for easy restoration.

Requirements: 17.6
"""

import asyncio
import os
import json
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Backup directory
BACKUP_DIR = ROOT_DIR / 'backups'
BACKUP_DIR.mkdir(exist_ok=True)


def serialize_document(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    
    # Remove MongoDB _id field
    if '_id' in doc:
        del doc['_id']
    
    # Convert datetime objects to ISO format strings
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    
    return doc


async def backup_collection(collection_name, timestamp):
    """
    Backup a single collection to a JSON file.
    
    Args:
        collection_name: Name of the collection to backup
        timestamp: Timestamp string for the backup filename
    
    Returns:
        dict: Backup result with count and filename
    """
    logger.info(f"Backing up collection: {collection_name}")
    
    try:
        # Get collection
        collection = db[collection_name]
        
        # Count documents
        count = await collection.count_documents({})
        logger.info(f"Found {count} documents in {collection_name}")
        
        if count == 0:
            logger.info(f"No documents to backup in {collection_name}")
            return {
                'collection': collection_name,
                'count': 0,
                'filename': None,
                'success': True
            }
        
        # Fetch all documents
        documents = await collection.find().to_list(None)
        
        # Serialize documents
        serialized_docs = [serialize_document(dict(doc)) for doc in documents]
        
        # Create backup filename
        filename = f"{collection_name}_{timestamp}.json"
        filepath = BACKUP_DIR / filename
        
        # Write to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(serialized_docs, f, indent=2, ensure_ascii=False)
        
        logger.info(f"✅ Backed up {count} documents to {filename}")
        
        return {
            'collection': collection_name,
            'count': count,
            'filename': filename,
            'filepath': str(filepath),
            'success': True
        }
        
    except Exception as e:
        logger.error(f"Error backing up {collection_name}: {str(e)}")
        return {
            'collection': collection_name,
            'count': 0,
            'filename': None,
            'success': False,
            'error': str(e)
        }


async def create_backup_manifest(timestamp, backup_results):
    """
    Create a manifest file with backup metadata.
    
    Args:
        timestamp: Timestamp string for the backup
        backup_results: List of backup results from each collection
    """
    manifest = {
        'timestamp': timestamp,
        'backup_date': datetime.now(timezone.utc).isoformat(),
        'database': os.environ['DB_NAME'],
        'collections': backup_results,
        'total_documents': sum(r['count'] for r in backup_results),
        'success': all(r['success'] for r in backup_results)
    }
    
    manifest_filename = f"backup_manifest_{timestamp}.json"
    manifest_filepath = BACKUP_DIR / manifest_filename
    
    with open(manifest_filepath, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    logger.info(f"✅ Created backup manifest: {manifest_filename}")
    return manifest


async def backup_all_collections():
    """Main backup function - backs up all collections needed for migration"""
    logger.info("=" * 80)
    logger.info("Starting backup of collections for migration")
    logger.info("=" * 80)
    
    # Generate timestamp for this backup
    timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
    logger.info(f"Backup timestamp: {timestamp}")
    logger.info(f"Backup directory: {BACKUP_DIR}")
    
    # Collections to backup
    collections_to_backup = [
        'booking_requests',
        'mocks',
        'time_slots'
    ]
    
    backup_results = []
    
    # Backup each collection
    for collection_name in collections_to_backup:
        result = await backup_collection(collection_name, timestamp)
        backup_results.append(result)
    
    # Create manifest
    manifest = await create_backup_manifest(timestamp, backup_results)
    
    # Summary
    logger.info("=" * 80)
    logger.info("Backup Summary")
    logger.info(f"Timestamp: {timestamp}")
    logger.info(f"Total collections backed up: {len(backup_results)}")
    logger.info(f"Total documents backed up: {manifest['total_documents']}")
    
    for result in backup_results:
        status = "✅" if result['success'] else "❌"
        logger.info(f"{status} {result['collection']}: {result['count']} documents")
    
    if manifest['success']:
        logger.info("✅ All backups completed successfully")
    else:
        logger.error("❌ Some backups failed")
    
    logger.info("=" * 80)
    
    return manifest


async def restore_collection(backup_filename):
    """
    Restore a collection from a backup file.
    
    Args:
        backup_filename: Name of the backup file to restore from
    
    Note: This is a utility function for manual restoration if needed.
    """
    logger.info(f"Restoring from backup: {backup_filename}")
    
    try:
        filepath = BACKUP_DIR / backup_filename
        
        if not filepath.exists():
            logger.error(f"Backup file not found: {filepath}")
            return False
        
        # Extract collection name from filename
        collection_name = backup_filename.split('_')[0]
        
        # Read backup file
        with open(filepath, 'r', encoding='utf-8') as f:
            documents = json.load(f)
        
        logger.info(f"Found {len(documents)} documents in backup")
        
        # Get collection
        collection = db[collection_name]
        
        # Insert documents
        if documents:
            await collection.insert_many(documents)
            logger.info(f"✅ Restored {len(documents)} documents to {collection_name}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error restoring from backup: {str(e)}")
        return False


async def list_backups():
    """List all available backups"""
    logger.info("Available backups:")
    
    backup_files = sorted(BACKUP_DIR.glob('backup_manifest_*.json'), reverse=True)
    
    if not backup_files:
        logger.info("No backups found")
        return []
    
    backups = []
    for manifest_file in backup_files:
        with open(manifest_file, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
            backups.append(manifest)
            
            logger.info(f"\nBackup: {manifest['timestamp']}")
            logger.info(f"Date: {manifest['backup_date']}")
            logger.info(f"Total documents: {manifest['total_documents']}")
            logger.info(f"Status: {'✅ Success' if manifest['success'] else '❌ Failed'}")
            
            for collection in manifest['collections']:
                logger.info(f"  - {collection['collection']}: {collection['count']} documents")
    
    return backups


async def main():
    """Main entry point"""
    try:
        # Create backup
        manifest = await backup_all_collections()
        
        return manifest
        
    except Exception as e:
        logger.error(f"Backup failed: {str(e)}")
        raise
    finally:
        # Close database connection
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
