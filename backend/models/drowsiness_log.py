# backend/models/drowsiness_log.py
from sqlalchemy import Column, Integer, DateTime, Float, Boolean, ForeignKey
from ..database import Base

class DrowsinessLog(Base):
    __tablename__ = "DrowsinessLog"

    id = Column(Integer, primary_key=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("User.user_id"), nullable=False)
    detected_time = Column(DateTime, nullable=False)
    confidence = Column(Float)
    warning_issued = Column(Boolean, default=False, nullable=False)