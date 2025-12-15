"""
데이터베이스 마이그레이션: Battle 테이블에 first_turn_user_pokemon_id 컬럼 추가
"""
import pymysql
from dotenv import load_dotenv
import os

# .env 파일 로드
load_dotenv()

# 데이터베이스 연결 정보
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "studymon")

try:
    # 데이터베이스 연결
    connection = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    print(f"✅ 데이터베이스 '{DB_NAME}'에 연결되었습니다.")
    
    with connection.cursor() as cursor:
        # first_turn_user_pokemon_id 컬럼 추가
        sql = """
        ALTER TABLE Battle 
        ADD COLUMN first_turn_user_pokemon_id INTEGER NULL
        """
        
        cursor.execute(sql)
        connection.commit()
        
        print("✅ Battle 테이블에 'first_turn_user_pokemon_id' 컬럼이 추가되었습니다.")
        
        # 테이블 구조 확인
        cursor.execute("DESCRIBE Battle")
        columns = cursor.fetchall()
        
        print("\n📋 Battle 테이블 구조:")
        for col in columns:
            print(f"  - {col['Field']}: {col['Type']} (Null: {col['Null']}, Default: {col['Default']})")
    
    connection.close()
    print("\n✅ 마이그레이션이 성공적으로 완료되었습니다!")
    print("🔄 백엔드 서버를 재시작해주세요.")
    
except pymysql.err.OperationalError as e:
    if e.args[0] == 1060:
        print("⚠️  'first_turn_user_pokemon_id' 컬럼이 이미 존재합니다.")
    else:
        print(f"❌ 데이터베이스 연결 오류: {e}")
except Exception as e:
    print(f"❌ 마이그레이션 실패: {e}")
