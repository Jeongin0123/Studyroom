"""
Database Migration: Refactor drowsiness_count from User to RoomMember

This script:
1. Removes drowsiness_count column from User table
2. Adds drowsiness_count column to RoomMember table
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from database import get_db


def migrate_drowsiness_count():
    """Migrate drowsiness_count from User to RoomMember table"""
    db = next(get_db())
    
    try:
        # Check if User table has drowsiness_count column
        result = db.execute("""
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'User'
            AND COLUMN_NAME = 'drowsiness_count'
        """)
        has_user_column = result.fetchone()[0] > 0
        
        # Check if RoomMember table has drowsiness_count column
        result = db.execute("""
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'RoomMember'
            AND COLUMN_NAME = 'drowsiness_count'
        """)
        has_room_member_column = result.fetchone()[0] > 0
        
        # Remove from User table if exists
        if has_user_column:
            print("Removing drowsiness_count column from User table...")
            db.execute("""
                ALTER TABLE User
                DROP COLUMN drowsiness_count
            """)
            db.commit()
            print("✓ Successfully removed drowsiness_count from User table")
        else:
            print("✓ Column drowsiness_count already removed from User table")
        
        # Add to RoomMember table if not exists
        if not has_room_member_column:
            print("Adding drowsiness_count column to RoomMember table...")
            db.execute("""
                ALTER TABLE RoomMember
                ADD COLUMN drowsiness_count INT NOT NULL DEFAULT 0
            """)
            db.commit()
            print("✓ Successfully added drowsiness_count to RoomMember table")
        else:
            print("✓ Column drowsiness_count already exists in RoomMember table")
        
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate_drowsiness_count()
