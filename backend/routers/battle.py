# backend/routers/battle.py
import random
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..schemas.battle import (
    BattleDamageRequest,
    BattleDamageResponse,
    BattleMoveOut,
)

router = APIRouter(
    prefix="/api/battle",
    tags=["battle"],
)


@router.get(
    "/user-pokemon/{user_pokemon_id}/moves",
    response_model=List[BattleMoveOut],
)
def get_battle_moves(
    user_pokemon_id: int,
    db: Session = Depends(get_db),
):
    """
    UserPokemon.id 기준으로 배틀 입장 시 사용할 기술 4개를 랜덤 생성한다.

    대상 기술:
    - move 테이블의 모든 기술 중에서
    - power IS NOT NULL, power > 0
    - damage_class != 'status'

    선택 규칙:
    1) power 100~150 사이 랜덤 1개
    2) power 1~40 사이 랜덤 1개
    3) (위에서 고른 두 개를 제외한) physical 기술 중 랜덤 1개
    4) (위에서 고른 것들을 제외한) special 기술 중 랜덤 1개

    만약 카테고리 후보 부족으로 4개 미만이면,
    남아 있는 기술 중 power 높은 것부터 채워서 최대 4개까지 맞춘다.
    """

    # 1) UserPokemon 존재 확인 (배틀 입장용 검증)
    user_pokemon = (
        db.query(models.UserPokemon)
        .filter(models.UserPokemon.id == user_pokemon_id)
        .first()
    )
    if not user_pokemon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 UserPokemon을 찾을 수 없습니다.",
        )

    # 1-1) 활성 팀에 포함되어 있는지 검증
    active_slot = (
        db.query(models.UserActiveTeam)
        .filter(models.UserActiveTeam.user_pokemon_id == user_pokemon_id)
        .first()
    )
    if not active_slot:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="활성 팀에 등록된 포켓몬이 아닙니다.",
        )

    # 2) move 테이블에서 '공격 기술' 전체 조회
    moves = (
        db.query(models.Move)
        .filter(
            models.Move.power.isnot(None),
            models.Move.power > 0,
            models.Move.damage_class != "status",
        )
        .all()
    )

    if not moves:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="공격 기술 후보가 존재하지 않습니다.",
        )

    chosen: list[models.Move] = []
    chosen_ids: set[int] = set()

    # 3) power 100~150 구간 랜덤 1개
    strong_candidates = [m for m in moves if 100 <= m.power <= 150]
    strong_random = random.choice(strong_candidates) if strong_candidates else None
    if strong_random:
        chosen.append(strong_random)
        chosen_ids.add(strong_random.id)

    # 4) power 1~40 구간 랜덤 1개
    weak_candidates = [m for m in moves if 1 <= m.power <= 40 and m.id not in chosen_ids]
    weak_random = random.choice(weak_candidates) if weak_candidates else None
    if weak_random:
        chosen.append(weak_random)
        chosen_ids.add(weak_random.id)

    # 5) 나머지 중 physical 랜덤 1개
    physical_candidates = [
        m for m in moves
        if m.damage_class == "physical" and m.id not in chosen_ids
    ]
    physical_random = random.choice(physical_candidates) if physical_candidates else None
    if physical_random:
        chosen.append(physical_random)
        chosen_ids.add(physical_random.id)

    # 6) 나머지 중 special 랜덤 1개
    special_candidates = [
        m for m in moves
        if m.damage_class == "special" and m.id not in chosen_ids
    ]
    special_random = random.choice(special_candidates) if special_candidates else None
    if special_random:
        chosen.append(special_random)
        chosen_ids.add(special_random.id)

    # 7) 4개가 안 되면, 남은 기술 중 power 높은 순으로 채우기
    while len(chosen) < 4:
        rest = [m for m in moves if m.id not in chosen_ids]
        if not rest:
            break
        best_rest = max(rest, key=lambda m: m.power)
        chosen.append(best_rest)
        chosen_ids.add(best_rest.id)

    final_moves = chosen[:4]

    return [
        BattleMoveOut(
            move_id=m.id,
            name=m.name,
            name_ko=getattr(m, "name_ko", None),
            power=m.power,
            damage_class=m.damage_class,
        )
        for m in final_moves
    ]


def _get_type_multiplier(db: Session, move_type: str, def_type1: str | None, def_type2: str | None) -> float:
    """type_effectiveness 테이블 기준으로 배율을 계산한다."""
    def get_type_id(tname: str | None) -> int | None:
        if not tname:
            return None
        row = db.query(models.Type).filter(models.Type.name == tname).first()
        return row.id if row else None

    atk_id = get_type_id(move_type)
    if atk_id is None:
        return 1.0

    def mul_for(def_name: str | None) -> float:
        def_id = get_type_id(def_name)
        if def_id is None:
            return 1.0
        row = (
            db.query(models.TypeEffectiveness)
            .filter(
                models.TypeEffectiveness.attacker_type_id == atk_id,
                models.TypeEffectiveness.defender_type_id == def_id,
            )
            .first()
        )
        return row.multiplier if row else 1.0

    m1 = mul_for(def_type1)
    m2 = mul_for(def_type2)
    return m1 * m2


def _get_user_pokemon(db: Session, user_pokemon_id: int) -> models.UserPokemon:
    up = (
        db.query(models.UserPokemon)
        .filter(models.UserPokemon.id == user_pokemon_id)
        .first()
    )
    if not up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 UserPokemon을 찾을 수 없습니다.",
        )
    return up


def _get_base_pokemon(db: Session, poke_id: int) -> models.Pokemon:
    poke = db.query(models.Pokemon).filter(models.Pokemon.poke_id == poke_id).first()
    if not poke:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="포켓몬 기본 정보가 없습니다.",
        )
    return poke


def _get_move(db: Session, move_id: int) -> models.Move:
    mv = db.query(models.Move).filter(models.Move.id == move_id).first()
    if not mv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="기술 정보를 찾을 수 없습니다.",
        )
    return mv


def _calc_damage(attacker: models.Pokemon, defender: models.Pokemon, move: models.Move, type_multiplier: float, level: int = 50) -> tuple[int, float]:
    """단순화된 포켓몬 데미지 공식(STAB/타입 반영). 반환: (damage, stab)."""
    power = move.power
    if power is None or power == 0:
        return 0, 1.0

    if move.damage_class == "physical":
        atk_stat = attacker.base_attack or 1
        def_stat = defender.base_defense or 1
    elif move.damage_class == "special":
        atk_stat = attacker.base_sp_attack or 1
        def_stat = defender.base_sp_defense or 1
    else:
        return 0, 1.0

    base = (((2 * level / 5 + 2) * power * atk_stat / def_stat) / 50) + 2

    stab = 1.5 if move.type in (attacker.type1, attacker.type2) else 1.0
    rand = random.uniform(0.85, 1.0)

    damage = base * stab * type_multiplier * rand
    return max(1, int(damage)), stab


@router.post("/damage", response_model=BattleDamageResponse)
def calc_battle_damage(payload: BattleDamageRequest, db: Session = Depends(get_db)):
    """
    공격자/방어자(UserPokemon id)와 선택한 move_id를 받아
    타입 상성 + STAB + 랜덤 보정을 포함한 데미지를 계산한다.
    """
    attacker_up = _get_user_pokemon(db, payload.attacker_user_pokemon_id)
    defender_up = _get_user_pokemon(db, payload.defender_user_pokemon_id)

    attacker = _get_base_pokemon(db, attacker_up.poke_id)
    defender = _get_base_pokemon(db, defender_up.poke_id)

    move = _get_move(db, payload.move_id)

    type_mult = _get_type_multiplier(
        db,
        move_type=move.type,
        def_type1=defender.type1,
        def_type2=defender.type2,
    )
    damage, stab = _calc_damage(attacker, defender, move, type_mult)

    return BattleDamageResponse(
        damage=damage,
        type_multiplier=type_mult,
        stab=stab,
    )
