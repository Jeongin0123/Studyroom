# backend/models/user_pokemon.py
from sqlalchemy import (
    CheckConstraint,
    Column,
    ForeignKey,
    Integer,
    UniqueConstraint,
)

from ..database import Base


class UserPokemon(Base):
    __tablename__ = "UserPokemon"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("User.user_id"), nullable=False)
    poke_id = Column(Integer, ForeignKey("Pokemon.poke_id"), nullable=False)
    level = Column(Integer, nullable=False, default=1, server_default="1")
    exp = Column(Integer, nullable=False, default=0, server_default="0")


class UserActiveTeam(Base):
    __tablename__ = "UserActiveTeam"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("User.user_id"), nullable=False)
    user_pokemon_id = Column(Integer, ForeignKey("UserPokemon.id"), nullable=False)
    slot = Column(Integer, nullable=False)

    __table_args__ = (
        CheckConstraint("slot BETWEEN 1 AND 6", name="ck_user_team_slot_range"),
        UniqueConstraint("user_id", "slot", name="uq_user_slot"),
        UniqueConstraint("user_pokemon_id", name="uq_user_pokemon_once"),
    )
