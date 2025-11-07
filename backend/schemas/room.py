# backend/schemas/room.py
from pydantic import BaseModel


class RoomBase(BaseModel):
    title: str
    owner_id: int
    member_id: int  # 방에 들어온(참가자) user_id


class RoomCreate(RoomBase):
    pass


class RoomOut(RoomBase):
    room_id: int

    class Config:
        from_attributes = True