# backend/routers/battle.py
import random
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..schemas.battle import (
    BattleAssignedMove,
    BattleCreateRequest,
    BattleCreateResponse,
    BattleDamageRequest,
    BattleDamageResponse,
    BattleMoveOut,
)

router = APIRouter(
    prefix="/api/battle",
    tags=["battle"],
)




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


def _ensure_active_team(db: Session, user_pokemon_id: int) -> None:
    exists = (
        db.query(models.UserActiveTeam)
        .filter(models.UserActiveTeam.user_pokemon_id == user_pokemon_id)
        .first()
    )
    if not exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="활성 팀에 등록된 포켓몬이 아닙니다.",
        )


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


def _get_battle(db: Session, battle_id: int) -> models.Battle:
    battle = db.query(models.Battle).filter(models.Battle.id == battle_id).first()
    if not battle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 배틀을 찾을 수 없습니다.",
        )
    return battle


def _ensure_battle_participant(db: Session, battle: models.Battle, user_pokemon_id: int) -> None:
    if user_pokemon_id not in {battle.player_a_user_pokemon_id, battle.player_b_user_pokemon_id}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="해당 배틀의 참가 포켓몬이 아닙니다.",
        )


def _set_initial_hp(battle: models.Battle, player_a_hp: int | None, player_b_hp: int | None) -> None:
    battle.player_a_current_hp = player_a_hp
    battle.player_b_current_hp = player_b_hp


@router.post("/damage", response_model=BattleDamageResponse)
def calc_battle_damage(payload: BattleDamageRequest, db: Session = Depends(get_db)):
    """
    공격자/방어자(UserPokemon id)와 선택한 move_id, battle_id를 받아
    타입 상성 + STAB + 랜덤 보정을 포함한 데미지를 계산한다.
    """
    battle = _get_battle(db, payload.battle_id)
    attacker_up = _get_user_pokemon(db, payload.attacker_user_pokemon_id)
    defender_up = _get_user_pokemon(db, payload.defender_user_pokemon_id)
    _ensure_battle_participant(db, battle, attacker_up.id)
    _ensure_battle_participant(db, battle, defender_up.id)
    _ensure_active_team(db, attacker_up.id)
    _ensure_active_team(db, defender_up.id)

    attacker = _get_base_pokemon(db, attacker_up.poke_id)
    defender = _get_base_pokemon(db, defender_up.poke_id)

    # 배틀에 등록된 기술인지 및 PP 확인
    bm = (
        db.query(models.BattleMove)
        .filter(
            models.BattleMove.battle_id == battle.id,
            models.BattleMove.user_pokemon_id == attacker_up.id,
            models.BattleMove.move_id == payload.move_id,
        )
        .first()
    )
    if not bm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="해당 배틀에 등록되지 않은 기술입니다.",
        )
    if bm.current_pp is not None and bm.current_pp <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="기술의 PP가 부족합니다.",
        )

    move = _get_move(db, payload.move_id)

    type_mult = _get_type_multiplier(
        db,
        move_type=move.type,
        def_type1=defender.type1,
        def_type2=defender.type2,
    )
    damage, _ = _calc_damage(attacker, defender, move, type_mult)

    # Apply drowsiness penalty
    attacker_user = db.query(models.User).filter(
        models.User.user_id == attacker_up.user_id
    ).first()
    
    if attacker_user and attacker_user.drowsiness_count > 0:
        # Calculate penalty: 10% per count, max 50%
        penalty_percent = min(attacker_user.drowsiness_count * 10, 50)
        penalty_multiplier = 1.0 - (penalty_percent / 100.0)
        damage = int(damage * penalty_multiplier)

    # PP 차감
    if bm.current_pp is not None:
        bm.current_pp = max(0, bm.current_pp - 1)

    # HP 차감 (defender)
    if battle.player_a_user_pokemon_id == defender_up.id:
        current_hp = battle.player_a_current_hp if battle.player_a_current_hp is not None else defender.base_hp or 0
        battle.player_a_current_hp = max(0, current_hp - damage)
        defender_hp = battle.player_a_current_hp
    else:
        current_hp = battle.player_b_current_hp if battle.player_b_current_hp is not None else defender.base_hp or 0
        battle.player_b_current_hp = max(0, current_hp - damage)
        defender_hp = battle.player_b_current_hp

    db.commit()

    return BattleDamageResponse(
        damage=damage,
        defender_current_hp=defender_hp,
    )


def _choose_moves_for_battle(db: Session) -> List[models.Move]:
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

    strong_candidates = [m for m in moves if 100 <= m.power <= 150]
    strong_random = random.choice(strong_candidates) if strong_candidates else None
    if strong_random:
        chosen.append(strong_random)
        chosen_ids.add(strong_random.id)

    weak_candidates = [m for m in moves if 1 <= m.power <= 40 and m.id not in chosen_ids]
    weak_random = random.choice(weak_candidates) if weak_candidates else None
    if weak_random:
        chosen.append(weak_random)
        chosen_ids.add(weak_random.id)

    physical_candidates = [
        m for m in moves
        if m.damage_class == "physical" and m.id not in chosen_ids
    ]
    physical_random = random.choice(physical_candidates) if physical_candidates else None
    if physical_random:
        chosen.append(physical_random)
        chosen_ids.add(physical_random.id)

    special_candidates = [
        m for m in moves
        if m.damage_class == "special" and m.id not in chosen_ids
    ]
    special_random = random.choice(special_candidates) if special_candidates else None
    if special_random:
        chosen.append(special_random)
        chosen_ids.add(special_random.id)

    while len(chosen) < 4:
        rest = [m for m in moves if m.id not in chosen_ids]
        if not rest:
            break
        best_rest = max(rest, key=lambda m: m.power)
        chosen.append(best_rest)
        chosen_ids.add(best_rest.id)

    return chosen[:4]


def _assign_moves_to_battle(
    db: Session,
    battle_id: int,
    user_pokemon_id: int,
    moves: List[models.Move],
) -> List[BattleAssignedMove]:
    assigned: List[BattleAssignedMove] = []
    for idx, mv in enumerate(moves, start=1):
        bm = models.BattleMove(
            battle_id=battle_id,
            user_pokemon_id=user_pokemon_id,
            move_id=mv.id,
            slot=idx,
            current_pp=mv.pp,
        )
        db.add(bm)
        assigned.append(
            BattleAssignedMove(
                move_id=mv.id,
                name=mv.name,
                name_ko=getattr(mv, "name_ko", None),
                power=mv.power,
                pp=mv.pp,
                damage_class=mv.damage_class,
                slot=idx,
                current_pp=mv.pp,
            )
        )
    return assigned


@router.post("", response_model=BattleCreateResponse, status_code=status.HTTP_201_CREATED)
def create_battle(payload: BattleCreateRequest, db: Session = Depends(get_db)):
    """배틀을 생성하고 각 포켓몬의 기술 4개를 확정 저장한다."""
    player_a_up = _get_user_pokemon(db, payload.player_a_user_pokemon_id)
    player_b_up = _get_user_pokemon(db, payload.player_b_user_pokemon_id)
    _ensure_active_team(db, player_a_up.id)
    _ensure_active_team(db, player_b_up.id)

    # 이미 진행 중인 배틀에 참여 중인지 확인
    existing_battle = (
        db.query(models.Battle)
        .filter(
            models.Battle.status == "ongoing",
            or_(
                models.Battle.player_a_user_pokemon_id.in_([player_a_up.id, player_b_up.id]),
                models.Battle.player_b_user_pokemon_id.in_([player_a_up.id, player_b_up.id]),
            ),
        )
        .first()
    )
    if existing_battle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 진행 중인 배틀에 참여 중입니다.",
        )

    battle = models.Battle(
        player_a_user_pokemon_id=player_a_up.id,
        player_b_user_pokemon_id=player_b_up.id,
        status="ongoing",
    )
    # 초기 HP 설정 (기본 종족값 사용)
    player_a_base = _get_base_pokemon(db, player_a_up.poke_id)
    player_b_base = _get_base_pokemon(db, player_b_up.poke_id)
    _set_initial_hp(battle, player_a_base.base_hp, player_b_base.base_hp)
    db.add(battle)
    db.commit()
    db.refresh(battle)

    player_a_moves = _choose_moves_for_battle(db)
    player_b_moves = _choose_moves_for_battle(db)

    assigned_player_a = _assign_moves_to_battle(db, battle.id, player_a_up.id, player_a_moves)
    assigned_player_b = _assign_moves_to_battle(db, battle.id, player_b_up.id, player_b_moves)
    db.commit()

    return BattleCreateResponse(
        battle_id=battle.id,
        player_a_user_pokemon_id=player_a_up.id,
        player_b_user_pokemon_id=player_b_up.id,
        player_a_moves=assigned_player_a,
        player_b_moves=assigned_player_b,
    )


@router.get(
    "/{battle_id}/moves",
    response_model=List[BattleAssignedMove],
)
def get_battle_moves_for_participant(
    battle_id: int,
    user_pokemon_id: int,
    db: Session = Depends(get_db),
):
    """배틀에 확정된 기술 4개와 남은 PP를 반환한다."""
    battle = _get_battle(db, battle_id)
    _ensure_battle_participant(db, battle, user_pokemon_id)

    rows = (
        db.query(models.BattleMove, models.Move)
        .join(models.Move, models.Move.id == models.BattleMove.move_id)
        .filter(
            models.BattleMove.battle_id == battle_id,
            models.BattleMove.user_pokemon_id == user_pokemon_id,
        )
        .order_by(models.BattleMove.slot.asc())
        .all()
    )
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="등록된 기술이 없습니다.",
        )

    return [
        BattleAssignedMove(
            move_id=mv.id,
            name=mv.name,
            name_ko=getattr(mv, "name_ko", None),
            power=mv.power,
            pp=mv.pp,
            damage_class=mv.damage_class,
            slot=bm.slot,
            current_pp=bm.current_pp,
        )
        for bm, mv in rows
    ]
