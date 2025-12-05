# backend/schemas/pokemon.py
from pydantic import BaseModel
from typing import Optional


class PokemonBase(BaseModel):
    poke_id: int


class PokemonCreate(PokemonBase):
    pass


class PokemonOut(PokemonBase):
    class Config:
        from_attributes = True


class UserPokemonOut(BaseModel):
    id: int  # user_pokemon_id
    user_id: int
    poke_id: int
    level: int
    exp: int
    name: str  # Pokemon name
    type1: str
    type2: Optional[str] = None
    slot: Optional[int] = None  # Active team slot (1-6)

    class Config:
        from_attributes = True