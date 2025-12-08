# backend/utils/pokemon_evolution.py
from sqlalchemy.orm import Session

from .. import models


def maybe_evolve_pokemon(db: Session, up: models.UserPokemon) -> None:
    """
    레벨이 5/10 이상이면 같은 체인의 다음 evolution_stage 포켓몬으로 poke_id를 교체.
    EXP는 진화 시 0으로 초기화, 레벨은 유지.
    """
    while True:
        base = db.query(models.Pokemon).filter(models.Pokemon.poke_id == up.poke_id).first()
        if not base or base.evolution_chain_id is None:
            return

        chain_members = (
            db.query(models.Pokemon)
            .filter(models.Pokemon.evolution_chain_id == base.evolution_chain_id)
            .all()
        )
        chain_members.sort(key=lambda p: ((p.evolution_stage or 9999), p.poke_id))

        try:
            current_index = next(i for i, p in enumerate(chain_members) if p.poke_id == base.poke_id)
        except StopIteration:
            return

        current_stage = base.evolution_stage or (current_index + 1)
        if base.evolution_stage is None:
            base.evolution_stage = current_stage

        required_level = _required_level(current_stage)
        if required_level is None or (up.level or 1) < required_level:
            return

        if current_index + 1 >= len(chain_members):
            return
        next_mon = chain_members[current_index + 1]

        up.poke_id = next_mon.poke_id
        up.exp = 0  # 진화 시 경험치 초기화 후 루프 재평가


def _required_level(stage: int) -> int | None:
    if stage == 1:
        return 5
    if stage == 2:
        return 10
    return None
