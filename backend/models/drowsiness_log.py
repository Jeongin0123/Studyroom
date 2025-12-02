# backend/models/drowsiness_log.py
from sqlalchemy import Column, Integer, String, DateTime, func

from ..database import Base

class DrowsinessLog(Base):
    __tablename__ = "DrowsinessLog"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 나중에 로그인 연동되면 FK 가능, 지금은 Nullable X
    user_id = Column(Integer, nullable=False)

    # "drowsy" | "micro_drowsy" | "normal"
    event_type = Column(String(30), nullable=False)

    # 기록된 시간
    created_at = Column(DateTime(timezone=True), server_default=func.now())