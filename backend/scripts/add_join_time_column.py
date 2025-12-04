from sqlalchemy import text
import sys
import os

# Add the parent directory to sys.path to allow importing backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine

def add_column():
    with engine.connect() as conn:
        try:
            # Try MySQL syntax first
            conn.execute(text("ALTER TABLE RoomMember ADD COLUMN join_time DATETIME DEFAULT CURRENT_TIMESTAMP"))
            print("Column added successfully")
        except Exception as e:
            print(f"Error adding column: {e}")
            # If it fails, it might be because the column already exists or syntax error.
            # In SQLite, adding a column with default value might be tricky if not nullable, 
            # but here we are adding it.

if __name__ == "__main__":
    add_column()
