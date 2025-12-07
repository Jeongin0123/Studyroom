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
    evolution_stage=1 (또는 없으면 체인별 최소 poke_id)만 대상, 랜덤 4개 반환.
    """
    # DB Dialect 확인하여 랜덤 함수 결정
    if db.bind.dialect.name == "sqlite":
        rand_func = func.random()
    else:
        rand_func = func.rand()

    base_poke_ids = (
        db.query(
            func.min(models.Pokemon.poke_id).label("base_id"),
            models.Pokemon.evolution_chain_id.label("chain_id"),
        )
        .filter(models.Pokemon.evolution_chain_id.isnot(None))
        .group_by(models.Pokemon.evolution_chain_id)
        .subquery()
    )

    rows = (
        db.query(models.Pokemon)
        .filter(
            (models.Pokemon.evolution_stage == 1)
            | (
                models.Pokemon.evolution_stage.is_(None)
                & models.Pokemon.evolution_chain_id.isnot(None)
                & models.Pokemon.poke_id.in_(db.query(base_poke_ids.c.base_id))
            )
        )
        .order_by(rand_func)
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
