"""Database configuration (single source of truth)."""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Load environment from backend/.env first, then fall back to parent .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)
load_dotenv()  # allow project root .env override

MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "doiymysql")
MYSQL_DB = os.getenv("MYSQL_DB", "studyroom")

DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
    f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"
)

engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    future=True,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "10")),
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def get_session() -> Session:
    """Return a new database session."""
    return SessionLocal()


def get_db():
    """FastAPI dependency that yields a session and closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
