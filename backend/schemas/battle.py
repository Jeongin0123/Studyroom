from pydantic import BaseModel


class BattleMoveOut(BaseModel):
    move_id: int
    name: str
    name_ko: str | None = None
    power: int | None
    damage_class: str
