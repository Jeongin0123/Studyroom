# backend/models/room.py
from sqlalchemy import Column, Integer, String
from ..database import Base

class Room(Base):
    __tablename__ = "Room"

    room_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), unique=True, nullable=False)
    capacity = Column(Integer)
    purpose = Column(
        String(255),
        nullable=False,
        default="",
        server_default="",
    )
    battle_enabled = Column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    # 참여 멤버는 room_member로 뺌
