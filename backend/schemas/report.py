# backend/schemas/report.py
from pydantic import BaseModel
from datetime import date, datetime


class ReportBase(BaseModel):
    member_id: int
    study_date: date
    focus_time: int = 0
    drowsy_count: int = 0
    evolution_stage: str | None = None
    join_time: datetime | None = None
    leave_time: datetime | None = None


class ReportCreate(ReportBase):
    pass


class ReportOut(ReportBase):
    report_id: int

    class Config:
        from_attributes = True