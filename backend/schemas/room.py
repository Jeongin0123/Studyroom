from typing import List, Optional, Literal
from pydantic import BaseModel


class RoomBase(BaseModel):
    title: str
    capacity: Optional[int]
    battle_enabled: Literal[0, 1] = 0


class RoomCreate(RoomBase):
    pass


class RoomOut(RoomBase):
    room_id: int

    class Config:
        from_attributes = True


class RoomParticipantsOut(RoomBase):  
    room_id: int           
    participant_count: int
    participant_user_ids: List[int]

    class Config:
        from_attributes = True
