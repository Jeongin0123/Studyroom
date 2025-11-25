from pydantic import BaseModel


class BattleMoveOut(BaseModel):
    move_id: int
    name: str
    name_ko: str | None = None
    power: int | None
    damage_class: str


class BattleDamageRequest(BaseModel):
    attacker_user_pokemon_id: int
    defender_user_pokemon_id: int
    move_id: int


class BattleDamageResponse(BaseModel):
    damage: int
    type_multiplier: float
    stab: float
