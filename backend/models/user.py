# backend/models/user.py
from sqlalchemy import Column, Integer, String, JSON
from ..database import Base

class User(Base):
    __tablename__ = "User"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), unique=True, nullable=False)
    pw = Column(String(255), nullable=False)
    nickname = Column(String(100), nullable=False)
    selected = Column(JSON, nullable=True)
