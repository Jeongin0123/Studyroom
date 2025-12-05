# backend/models/report.py
from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey
from ..database import Base

class Report(Base):
    __tablename__ = "Report"

    report_id = Column(Integer, primary_key=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("User.user_id"), nullable=False)
    study_date = Column(Date, nullable=False)
    focus_time = Column(Integer, nullable=False, default=0)
    join_time = Column(DateTime)
    leave_time = Column(DateTime)
    drowsy_count = Column(Integer, nullable=False, default=0, server_default="0")
