# backend/models/pokemon.py
from sqlalchemy import Column, Integer, String
from ..database import Base

class Pokemon(Base):
    __tablename__ = "Pokemon"

    poke_id = Column(Integer, primary_key=True, autoincrement=False)  # PokeAPI id 사용
    name = Column(String(50), nullable=False)
    image_url = Column(String(255))
    back_image_url = Column(String(255))
    base_hp = Column(Integer, nullable=True)
    base_attack = Column(Integer, nullable=True)
    base_defense = Column(Integer, nullable=True)
    base_sp_attack = Column(Integer, nullable=True)
    base_sp_defense = Column(Integer, nullable=True)
    base_speed = Column(Integer, nullable=True)
    type1 = Column(String(50), nullable=False)
    type2 = Column(String(50), nullable=True)
    evolution_chain_id = Column(Integer, nullable=True)
    # 1 = 체인의 첫 번째 형태, 2 = 두 번째 진화 형태, ...
    evolution_stage = Column(Integer, nullable=True)
