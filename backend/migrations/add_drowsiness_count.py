"""
Database Migration: Add drowsiness_count to User table

This script adds a new column 'drowsiness_count' to the User table
to track accumulated drowsiness for the penalty system.
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "studyroom")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def migrate():
    """Add drowsiness_count column to User table"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if column already exists
        check_query = text("""
            SELECT COUNT(*) as count
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = :db_name
            AND TABLE_NAME = 'User'
            AND COLUMN_NAME = 'drowsiness_count'
        """)
        
        result = conn.execute(check_query, {"db_name": DB_NAME})
        exists = result.fetchone()[0] > 0
        
        if exists:
            print("✓ Column 'drowsiness_count' already exists in User table")
            return
        
        # Add the column
        alter_query = text("""
            ALTER TABLE User
            ADD COLUMN drowsiness_count INT NOT NULL DEFAULT 0
        """)
        
        conn.execute(alter_query)
        conn.commit()
        
        print("✓ Successfully added 'drowsiness_count' column to User table")
        print("  - Type: INT")
        print("  - Default: 0")
        print("  - Nullable: NO")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise
