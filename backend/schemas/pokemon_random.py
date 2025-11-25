from pydantic import BaseModel
from typing import Optional


class RandomPokemonOut(BaseModel):
    poke_id: int
    name: str
    type1: str
    type2: Optional[str] = None

    class Config:
        from_attributes = True
