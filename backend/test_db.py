# remind/test_db.py
import os, pymysql
from dotenv import load_dotenv

load_dotenv()  # .env 읽기

print("ENV MYSQL_HOST/PORT/DB/USER:",
      os.getenv("MYSQL_HOST"), os.getenv("MYSQL_PORT"),
      os.getenv("MYSQL_DB"), os.getenv("MYSQL_USER"))

host = os.getenv("MYSQL_HOST", "127.0.0.1")
port = int(os.getenv("MYSQL_PORT", "3306"))
user = os.getenv("MYSQL_USER", "root")
pw   = os.getenv("MYSQL_PASSWORD", "")
db   = os.getenv("MYSQL_DB", "studyroom")

print("Trying connect to:", host, port)
conn = pymysql.connect(host=host, port=port, user=user, password=pw,
                       database=db, charset="utf8mb4")
with conn.cursor() as cur:
    cur.execute("SELECT 1")
    print("SELECT 1 ->", cur.fetchone())
conn.close()
print("✅ DB connection OK")
