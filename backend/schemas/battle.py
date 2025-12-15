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


class PokemonInfo(BaseModel):
    poke_id: int
    name: str
    level: int
    exp: int
    type1: str
    type2: str | None = None
    user_nickname: str


class BattleCreateResponse(BaseModel):
    battle_id: int
    player_a_user_pokemon_id: int
    player_b_user_pokemon_id: int
    player_a_pokemon: PokemonInfo
    player_b_pokemon: PokemonInfo
    player_a_moves: list[BattleAssignedMove]
    player_b_moves: list[BattleAssignedMove]
    first_turn_user_pokemon_id: int  # 선공권을 가진 포켓몬 ID
    player_a_current_hp: int  # Player A의 현재 HP
    player_b_current_hp: int  # Player B의 현재 HP
