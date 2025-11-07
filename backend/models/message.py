# backend/models/message.py
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text
from ..database import Base

class Message(Base):
    __tablename__ = "Message"

    # 설계에서 time 이 PK 라고 되어 있는데, 보통 채팅은 같은 시각에 두 개가 들어올 수도 있어서
    # 안전하게 room_id + time 을 PK 로 묶는 게 좋아.
    room_id = Column(Integer, ForeignKey("Room.room_id"), primary_key=True)
    time = Column(DateTime, primary_key=True)  # yyyy-mm-dd hh:mm:ss
    sender = Column(Integer, ForeignKey("User.user_id"), nullable=False)
    log = Column(Text, nullable=False)
    msg_class = Column("class", Integer, nullable=False)  # 0:일반, 1:시스템 ...