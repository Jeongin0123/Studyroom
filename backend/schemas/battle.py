from pydantic import BaseModel


class BattleMoveOut(BaseModel):
    move_id: int
    name: str
    name_ko: str | None = None
    power: int | None
    pp: int | None = None
    damage_class: str


class BattleDamageRequest(BaseModel):
    battle_id: int
    attacker_user_pokemon_id: int
    defender_user_pokemon_id: int
    move_id: int


class BattleDamageResponse(BaseModel):
    damage: int
    defender_current_hp: int | None = None
    battle_finished: bool = False
    winner_user_id: int | None = None
    winner_user_pokemon_id: int | None = None


class BattleCreateRequest(BaseModel):
    player_a_user_pokemon_id: int
    player_b_user_pokemon_id: int


class BattleAssignedMove(BattleMoveOut):
    slot: int
    current_pp: int | None = None


class BattleCreateResponse(BaseModel):
    battle_id: int
    player_a_user_pokemon_id: int
    player_b_user_pokemon_id: int
    player_a_moves: list[BattleAssignedMove]
    player_b_moves: list[BattleAssignedMove]
