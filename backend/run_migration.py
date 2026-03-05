"""
Migration Orchestration Script

This script orchestrates the complete migration process:
1. Creates backups of all collections
2. Runs all migrations in order
3. Validates the final state
4. Logs all activities
5. Handles errors gracefully

Requirements: 17.1-17.7
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
log_dir = Path(__file__).parent / 'logs'
log_dir.mkdir(exist_ok=True)

timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
log_file = log_dir / f'migration_{timestamp}.log'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import migration modules
sys.path.insert(0, str(ROOT_DIR))
from backup_collections import backup_all_collections
from migrate_booking_requests import migrate_booking_requests, validate_migration as validate_booking_requests
from migrate_mocks import migrate_mocks, validate_migration as validate_mocks
from migrate_time_slots import migrate_time_slots, validate_migration as validate_time_slots

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


class MigrationOrchestrator:
    """Orchestrates the complete migration process"""
    
    def __init__(self):
        self.start_time = datetime.now(timezone.utc)
        self.results = {
            'backup': None,
            'migrations': {},
            'validations': {},
            'final_state': None,
            'success': False,
            'errors': []
        }
    
    async def run(self):
        """Execute the complete migration process"""
        logger.info("=" * 80)
        logger.info("MIGRATION ORCHESTRATION - MENTOR-CONTROLLED SLOT MANAGEMENT")
        logger.info("=" * 80)
        logger.info(f"Start time: {self.start_time.isoformat()}")
        logger.info(f"Database: {os.environ['DB_NAME']}")
        logger.info(f"Log file: {log_file}")
        logger.info("=" * 80)
        
        try:
            # Step 1: Create backups
            logger.info("\n" + "=" * 80)
            logger.info("STEP 1: Creating backups")
            logger.info("=" * 80)
            
            backup_result = await self.create_backups()
            self.results['backup'] = backup_result
            
            if not backup_result['success']:
                raise Exception("Backup failed - aborting migration")
            
            logger.info("✅ Backups completed successfully")
            
            # Step 2: Run migrations
            logger.info("\n" + "=" * 80)
            logger.info("STEP 2: Running migrations")
            logger.info("=" * 80)
            
            await self.run_migrations()
            
            # Step 3: Validate migrations
            logger.info("\n" + "=" * 80)
            logger.info("STEP 3: Validating migrations")
            logger.info("=" * 80)
            
            await self.validate_migrations()
            
            # Step 4: Validate final state
            logger.info("\n" + "=" * 80)
            logger.info("STEP 4: Validating final state")
            logger.info("=" * 80)
            
            final_state = await self.validate_final_state()
            self.results['final_state'] = final_state
            
            # Check overall success
            self.results['success'] = (
                self.results['backup']['success'] and
                all(m['success'] for m in self.results['migrations'].values()) and
                all(self.results['validations'].values()) and
                final_state['success']
            )
            
            # Print summary
            self.print_summary()
            
            return self.results
            
        except Exception as e:
            logger.error(f"Migration failed: {str(e)}")
            self.results['errors'].append(str(e))
            self.results['success'] = False
            self.print_summary()
            raise
        finally:
            client.close()
    
    async def create_backups(self):
        """Create backups of all collections"""
        try:
            manifest = await backup_all_collections()
            return manifest
        except Exception as e:
            logger.error(f"Backup failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    async def run_migrations(self):
        """Run all migrations in order"""
        
        # Migration 1: booking_requests -> bookings
        logger.info("\n--- Migration 1: booking_requests -> bookings ---")
        try:
            result = await migrate_booking_requests()
            self.results['migrations']['booking_requests'] = result
            
            if result['success']:
                logger.info("✅ booking_requests migration completed")
            else:
                logger.error("❌ booking_requests migration had errors")
                
        except Exception as e:
            logger.error(f"booking_requests migration failed: {str(e)}")
            self.results['migrations']['booking_requests'] = {
                'success': False,
                'error': str(e)
            }
            self.results['errors'].append(f"booking_requests migration: {str(e)}")
        
        # Migration 2: mocks -> bookings
        logger.info("\n--- Migration 2: mocks -> bookings ---")
        try:
            result = await migrate_mocks()
            self.results['migrations']['mocks'] = result
            
            if result['success']:
                logger.info("✅ mocks migration completed")
            else:
                logger.error("❌ mocks migration had errors")
                
        except Exception as e:
            logger.error(f"mocks migration failed: {str(e)}")
            self.results['migrations']['mocks'] = {
                'success': False,
                'error': str(e)
            }
            self.results['errors'].append(f"mocks migration: {str(e)}")
        
        # Migration 3: time_slots -> mentor_slots
        logger.info("\n--- Migration 3: time_slots -> mentor_slots ---")
        try:
            result = await migrate_time_slots()
            self.results['migrations']['time_slots'] = result
            
            if result['success']:
                logger.info("✅ time_slots migration completed")
            else:
                logger.error("❌ time_slots migration had errors")
                
        except Exception as e:
            logger.error(f"time_slots migration failed: {str(e)}")
            self.results['migrations']['time_slots'] = {
                'success': False,
                'error': str(e)
            }
            self.results['errors'].append(f"time_slots migration: {str(e)}")
    
    async def validate_migrations(self):
        """Validate each migration"""
        
        # Validate booking_requests migration
        logger.info("\n--- Validating booking_requests migration ---")
        try:
            result = await validate_booking_requests()
            self.results['validations']['booking_requests'] = result
            if result:
                logger.info("✅ booking_requests validation passed")
            else:
                logger.error("❌ booking_requests validation failed")
        except Exception as e:
            logger.error(f"booking_requests validation error: {str(e)}")
            self.results['validations']['booking_requests'] = False
            self.results['errors'].append(f"booking_requests validation: {str(e)}")
        
        # Validate mocks migration
        logger.info("\n--- Validating mocks migration ---")
        try:
            result = await validate_mocks()
            self.results['validations']['mocks'] = result
            if result:
                logger.info("✅ mocks validation passed")
            else:
                logger.error("❌ mocks validation failed")
        except Exception as e:
            logger.error(f"mocks validation error: {str(e)}")
            self.results['validations']['mocks'] = False
            self.results['errors'].append(f"mocks validation: {str(e)}")
        
        # Validate time_slots migration
        logger.info("\n--- Validating time_slots migration ---")
        try:
            result = await validate_time_slots()
            self.results['validations']['time_slots'] = result
            if result:
                logger.info("✅ time_slots validation passed")
            else:
                logger.error("❌ time_slots validation failed")
        except Exception as e:
            logger.error(f"time_slots validation error: {str(e)}")
            self.results['validations']['time_slots'] = False
            self.results['errors'].append(f"time_slots validation: {str(e)}")
    
    async def validate_final_state(self):
        """Validate the final state of all collections"""
        try:
            # Count documents in all collections
            old_collections = {
                'booking_requests': await db.booking_requests.count_documents({}),
                'mocks': await db.mocks.count_documents({}),
                'time_slots': await db.time_slots.count_documents({})
            }
            
            new_collections = {
                'bookings': await db.bookings.count_documents({}),
                'mentor_slots': await db.mentor_slots.count_documents({})
            }
            
            logger.info("Old collections:")
            for name, count in old_collections.items():
                logger.info(f"  {name}: {count} documents")
            
            logger.info("New collections:")
            for name, count in new_collections.items():
                logger.info(f"  {name}: {count} documents")
            
            # Check that we have data in new collections
            success = (
                new_collections['bookings'] > 0 or 
                (old_collections['booking_requests'] == 0 and old_collections['mocks'] == 0)
            ) and (
                new_collections['mentor_slots'] > 0 or 
                old_collections['time_slots'] == 0
            )
            
            if success:
                logger.info("✅ Final state validation passed")
            else:
                logger.warning("⚠️  Final state validation: No data in new collections")
            
            return {
                'success': success,
                'old_collections': old_collections,
                'new_collections': new_collections
            }
            
        except Exception as e:
            logger.error(f"Final state validation failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def print_summary(self):
        """Print migration summary"""
        end_time = datetime.now(timezone.utc)
        duration = (end_time - self.start_time).total_seconds()
        
        logger.info("\n" + "=" * 80)
        logger.info("MIGRATION SUMMARY")
        logger.info("=" * 80)
        logger.info(f"Start time: {self.start_time.isoformat()}")
        logger.info(f"End time: {end_time.isoformat()}")
        logger.info(f"Duration: {duration:.2f} seconds")
        logger.info(f"Overall status: {'✅ SUCCESS' if self.results['success'] else '❌ FAILED'}")
        
        # Backup summary
        logger.info("\nBackup:")
        if self.results['backup']:
            logger.info(f"  Status: {'✅' if self.results['backup']['success'] else '❌'}")
            logger.info(f"  Documents backed up: {self.results['backup'].get('total_documents', 0)}")
        
        # Migration summary
        logger.info("\nMigrations:")
        for name, result in self.results['migrations'].items():
            logger.info(f"  {name}:")
            logger.info(f"    Status: {'✅' if result.get('success') else '❌'}")
            logger.info(f"    Processed: {result.get('total_processed', 0)}")
            logger.info(f"    Migrated: {result.get('migrated', 0)}")
            if 'merged' in result:
                logger.info(f"    Merged: {result.get('merged', 0)}")
            logger.info(f"    Skipped: {result.get('skipped', 0)}")
            logger.info(f"    Errors: {result.get('errors', 0)}")
        
        # Validation summary
        logger.info("\nValidations:")
        for name, result in self.results['validations'].items():
            logger.info(f"  {name}: {'✅' if result else '❌'}")
        
        # Final state
        if self.results['final_state']:
            logger.info("\nFinal State:")
            logger.info(f"  Status: {'✅' if self.results['final_state']['success'] else '❌'}")
            if 'new_collections' in self.results['final_state']:
                for name, count in self.results['final_state']['new_collections'].items():
                    logger.info(f"  {name}: {count} documents")
        
        # Errors
        if self.results['errors']:
            logger.info("\nErrors:")
            for error in self.results['errors']:
                logger.error(f"  - {error}")
        
        logger.info("\n" + "=" * 80)
        logger.info(f"Log file: {log_file}")
        logger.info("=" * 80)


async def main():
    """Main entry point"""
    orchestrator = MigrationOrchestrator()
    
    try:
        result = await orchestrator.run()
        
        if result['success']:
            logger.info("\n✅ Migration completed successfully!")
            logger.info("\nNext steps:")
            logger.info("1. Review the migration log for any warnings")
            logger.info("2. Test the new API endpoints")
            logger.info("3. Update the frontend to use new endpoints")
            logger.info("4. Monitor the application for any issues")
            logger.info("\nBackups are available in the 'backups' directory if rollback is needed.")
            return 0
        else:
            logger.error("\n❌ Migration completed with errors!")
            logger.error("Please review the log file and fix any issues before proceeding.")
            logger.error("Backups are available in the 'backups' directory for rollback.")
            return 1
            
    except Exception as e:
        logger.error(f"\n❌ Migration failed: {str(e)}")
        logger.error("Backups are available in the 'backups' directory for rollback.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
