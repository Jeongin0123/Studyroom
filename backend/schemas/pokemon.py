# backend/schemas/pokemon.py
from pydantic import BaseModel


class PokemonBase(BaseModel):
    poke_id: int


class PokemonCreate(PokemonBase):
    pass


class PokemonOut(PokemonBase):
    class Config:
        from_attributes = True