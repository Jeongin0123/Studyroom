# backend/models/report.py
from sqlalchemy import Column, Integer, Date, DateTime, String, ForeignKey
from ..database import Base

class Report(Base):
    __tablename__ = "Report"

    report_id = Column(Integer, primary_key=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("User.user_id"), nullable=False)
    room_id = Column(Integer, ForeignKey("Room.room_id"), nullable=True)  # 어느 방에서 공부했는지
    study_date = Column(Date, nullable=False)
    focus_time = Column(Integer, nullable=False, default=0)
    drowsy_count = Column(Integer, nullable=False, default=0)
    evolution_stage = Column(String(20))
    join_time = Column(DateTime)
    leave_time = Column(DateTime)