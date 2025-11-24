# backend/models/move.py
from sqlalchemy import Column, Integer, String, Text, UniqueConstraint

from ..database import Base


class Move(Base):
    __tablename__ = "move"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    power = Column(Integer, nullable=True)
    pp = Column(Integer, nullable=True)
    accuracy = Column(Integer, nullable=True)
    type = Column(String(20), nullable=False)
    damage_class = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("name", name="uq_move_name"),
    )
