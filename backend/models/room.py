# backend/models/room.py
from sqlalchemy import Column, Integer, String, ForeignKey
from ..database import Base

class Room(Base):
    __tablename__ = "Room"

    room_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), unique=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("User.user_id"), nullable=False)
    member_id = Column(Integer, ForeignKey("User.user_id"), nullable=False)