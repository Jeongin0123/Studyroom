# backend/routers/pokemon_random.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas.pokemon_random import RandomPokemonOut

router = APIRouter(
    prefix="/api/pokemon",
    tags=["pokemon"],
)


@router.get("/random", response_model=List[RandomPokemonOut])
def get_random_base_pokemon(db: Session = Depends(get_db)):
    """
    진화체인의 첫 번째(베이스) 포켓몬만 대상.
    poke_id를 기준으로 체인별 최소 poke_id를 베이스로 보고 랜덤 4개 반환.
    """
    # 체인별 최소 poke_id를 베이스 포켓몬으로 간주
    base_poke_ids = (
        db.query(func.min(models.Pokemon.poke_id).label("base_id"))
        .filter(models.Pokemon.evolution_chain_id.isnot(None))
        .group_by(models.Pokemon.evolution_chain_id)
        .subquery()
    )

    rows = (
        db.query(models.Pokemon)
        .join(base_poke_ids, models.Pokemon.poke_id == base_poke_ids.c.base_id)
        .order_by(func.rand())
        .limit(4)
        .all()
    )

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="선택 가능한 포켓몬이 없습니다.",
        )

    return [
        RandomPokemonOut(
            poke_id=p.poke_id,
            name=p.name,
            type1=p.type1,
            type2=p.type2,
        )
        for p in rows
    ]
