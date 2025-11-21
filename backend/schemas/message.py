# backend/schemas/message.py
from pydantic import BaseModel
from datetime import datetime


class MessageBase(BaseModel):
    room_id: int
    sender: int   # user_id
    log: str
    msg_class: int  # 0: 일반채팅, 1: 시스템 등


class MessageCreate(MessageBase):
    # time 은 서버에서 now로 만들 수도 있고, 클라에서 줄 수도 있어서 optional로
    time: datetime | None = None


class MessageOut(MessageBase):
    time: datetime

    class Config:
        from_attributes = True