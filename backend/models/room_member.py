# backend/models/room_member.py
from sqlalchemy import Column, Integer, ForeignKey, String, UniqueConstraint, DateTime, func
from ..database import Base

class RoomMember(Base):
    __tablename__ = "RoomMember"

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("Room.room_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("User.user_id"), nullable=False)
    role = Column(String(20), nullable=False, default="member")  # 'member' / 'owner'
    drowsiness_count = Column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    join_time = Column(DateTime, default=func.now())

    __table_args__ = (
        UniqueConstraint("room_id", "user_id", name="uq_room_user"),
        # 같은 사람이 같은 방에 중복으로 들어가지 못하게
    )