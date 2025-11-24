# backend/models/pokemon_type.py
from sqlalchemy import Column, Float, ForeignKey, Integer, String, UniqueConstraint

from ..database import Base


class Type(Base):
    __tablename__ = "type"

    id = Column(Integer, primary_key=True, autoincrement=False)  # 1~18 고정 id
    name = Column(String(50), nullable=False, unique=True)


class TypeEffectiveness(Base):
    __tablename__ = "type_effectiveness"

    attacker_type_id = Column(Integer, ForeignKey("type.id"), primary_key=True)
    defender_type_id = Column(Integer, ForeignKey("type.id"), primary_key=True)
    multiplier = Column(Float, nullable=False, default=1.0)

    __table_args__ = (
        UniqueConstraint(
            "attacker_type_id",
            "defender_type_id",
            name="uq_type_effectiveness_pair",
        ),
    )
