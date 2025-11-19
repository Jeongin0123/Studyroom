from typing import List, Optional
from pydantic import BaseModel


class RoomBase(BaseModel):
    title: str
    capacity: Optional[int]


class RoomCreate(RoomBase):
    pass


class RoomOut(RoomBase):
    room_id: int

    class Config:
        from_attributes = True


class RoomParticipantsOut(RoomBase):             
    participant_count: int
    participant_user_ids: List[int]

    class Config:
        from_attributes = True
