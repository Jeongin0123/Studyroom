from sqlalchemy import text
import sys
import os

# Add the parent directory to sys.path to allow importing backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine

def add_room_id_column():
    with engine.connect() as conn:
        try:
            # Add room_id column to Report table
            conn.execute(text("ALTER TABLE Report ADD COLUMN room_id INT NULL"))
            conn.commit()
            print("✅ room_id 컬럼이 Report 테이블에 추가되었습니다.")
            
            # Add foreign key constraint
            try:
                conn.execute(text("ALTER TABLE Report ADD FOREIGN KEY (room_id) REFERENCES Room(room_id)"))
                conn.commit()
                print("✅ Foreign key 제약조건이 추가되었습니다.")
            except Exception as e:
                print(f"⚠️ Foreign key 추가 중 오류 (이미 존재할 수 있음): {e}")
                
        except Exception as e:
            if "Duplicate column name" in str(e) or "1060" in str(e):
                print("ℹ️ room_id 컬럼이 이미 존재합니다.")
            else:
                print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    add_room_id_column()
