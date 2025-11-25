# backend/models/battle.py
from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint

from ..database import Base


class Battle(Base):
    __tablename__ = "Battle"

    id = Column(Integer, primary_key=True, autoincrement=True)
    player_a_user_pokemon_id = Column(Integer, ForeignKey("UserPokemon.id"), nullable=False)
    player_b_user_pokemon_id = Column(Integer, ForeignKey("UserPokemon.id"), nullable=False)
    status = Column(String(20), nullable=False, default="ongoing", server_default="ongoing")


class BattleMove(Base):
    __tablename__ = "BattleMove"

    id = Column(Integer, primary_key=True, autoincrement=True)
    battle_id = Column(Integer, ForeignKey("Battle.id"), nullable=False)
    user_pokemon_id = Column(Integer, ForeignKey("UserPokemon.id"), nullable=False)
    move_id = Column(Integer, ForeignKey("move.id"), nullable=False)
    slot = Column(Integer, nullable=False)  # 1~4
    current_pp = Column(Integer, nullable=True)

    __table_args__ = (
        UniqueConstraint("battle_id", "user_pokemon_id", "slot", name="uq_battle_slot"),
        UniqueConstraint("battle_id", "user_pokemon_id", "move_id", name="uq_battle_move_once"),
    )
