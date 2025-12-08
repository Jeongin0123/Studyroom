# backend/schemas/pokemon.py
from pydantic import BaseModel, Field
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


class ActiveTeamSwap(BaseModel):
    from_slot: int = Field(..., ge=1, le=6)
    to_slot: int = Field(..., ge=1, le=6)


class ActiveTeamAssign(BaseModel):
    slot: int = Field(..., ge=1, le=6)
    user_pokemon_id: int


class ActiveTeamClear(BaseModel):
    slot: int = Field(..., ge=1, le=6)
