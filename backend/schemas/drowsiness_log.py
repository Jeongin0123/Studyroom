from pydantic import BaseModel
from datetime import datetime


# -----------------------------
# Request: 프론트가 주는 값
# -----------------------------
class DrowsinessLogCreate(BaseModel):
    user_id: int
    event_type: str  # "drowsy", "micro_drowsy", "normal"


# -----------------------------
# DB에서 읽어온 Row를 응답할 때
# -----------------------------
class DrowsinessLogOut(BaseModel):
    id: int
    user_id: int
    event_type: str
    created_at: datetime

    class Config:
        from_attributes = True


# -----------------------------
# API Response 형식
# -----------------------------
class DrowsinessLogResponse(BaseModel):
    status: str
    event_id: int
    saved_event: DrowsinessLogOut