# backend/models/user.py
from sqlalchemy import Column, Integer, String
from ..database import Base
from sqlalchemy.dialects.mysql import JSON   #

class User(Base):
    __tablename__ = "User"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), unique=True, nullable=False)
    pw = Column(String(255), nullable=False)
    nickname = Column(String(100), nullable=False)
    selected = Column(JSON, nullable=True)
    exp = Column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
