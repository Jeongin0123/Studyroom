from sqlalchemy import Column, Integer, DateTime, JSON, Enum
from sqlalchemy.sql import func
from db import Base

class UserPokemon(Base):
    __tablename__ = "user_pokemon"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, unique=True, nullable=False)
    species_id = Column(Integer, nullable=False)
    stage = Column(Integer, nullable=False, default=1)
    exp = Column(Integer, nullable=False, default=0)
    energy = Column(Integer, nullable=False, default=100)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class FocusEventLog(Base):
    __tablename__ = "focus_event_log"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    event_type = Column(Enum("FOCUS_PLUS", "DROWSY", name="evtype"), nullable=False)
    score = Column(Integer, nullable=False)
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
