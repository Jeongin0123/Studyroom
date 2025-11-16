# backend/schemas/drowsiness_log.py
from pydantic import BaseModel
from datetime import datetime


class DrowsinessLogBase(BaseModel):
    member_id: int
    detected_time: datetime
    confidence: float | None = None
    warning_issued: bool = False


class DrowsinessLogCreate(DrowsinessLogBase):
    pass


class DrowsinessLogOut(DrowsinessLogBase):
    id: int

    class Config:
        from_attributes = True