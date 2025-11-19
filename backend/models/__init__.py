# backend/models/__init__.py

# 1️⃣ SQLAlchemy Base, engine 가져오기
from backend.database import Base, engine

# 2️⃣ 개별 모델 import
from .user import User
from .room import Room
from .message import Message
from .drowsiness_log import DrowsinessLog
from .report import Report
from .pokemon import Pokemon
from .room_member import RoomMember

# 3️⃣ DB 테이블 생성
Base.metadata.create_all(bind=engine)

__all__ = [
    "User",
    "Room",
    "Message",
    "DrowsinessLog",
    "Report",
    "Pokemon",
    "RoomMember",
]
