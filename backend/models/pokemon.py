# backend/models/pokemon.py
from sqlalchemy import Column, Integer, String
from ..database import Base

class Pokemon(Base):
    __tablename__ = "Pokemon"

    poke_id = Column(Integer, primary_key=True, autoincrement=False)  # PokeAPI id 사용
    name = Column(String(50), nullable=False)
    image_url = Column(String(255))
    base_hp = Column(Integer, nullable=True)
    base_attack = Column(Integer, nullable=True)
    base_defense = Column(Integer, nullable=True)
    base_sp_attack = Column(Integer, nullable=True)
    base_sp_defense = Column(Integer, nullable=True)
    base_speed = Column(Integer, nullable=True)
