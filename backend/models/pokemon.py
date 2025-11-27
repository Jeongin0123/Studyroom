# backend/models/pokemon.py
from sqlalchemy import Column, Integer
from ..database import Base

class Pokemon(Base):
    __tablename__ = "Pokemon"

    poke_id = Column(Integer, primary_key=True)