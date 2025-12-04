# backend/routers/auth.py
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..schemas.user import (
    UserLogin,
    UserOut,
    UserProfileOut,
    PasswordForgotRequest,
    PasswordForgotResponse,
    UserUpdate,
)
from ..schemas.pokemon import PokemonBase

router = APIRouter(
    prefix="/api",
    tags=["auth"],
)

@router.post("/login", response_model=UserOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    # 1) 이메일로 사용자 찾기
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 이메일의 사용자가 없습니다.",
        )

    # 2) 비밀번호 확인 (지금은 평문 비교)
    if user.pw != payload.pw:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="비밀번호가 올바르지 않습니다.",
        )

    # 3) 로그인 성공 → 사용자 정보 반환
    return user


@router.post("/password/forgot", response_model=PasswordForgotResponse)
def forgot_password(payload: PasswordForgotRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="존재하지 않는 회원입니다.",
        )
    return PasswordForgotResponse(password=user.pw, nickname=user.nickname)

from ..schemas.user import UserCreate

@router.post("/register")
def register(payload: UserCreate, db: Session = Depends(get_db)):
    
    # 1) 이미 존재하는 이메일인지 확인
    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 이메일입니다."
        )
    # 1-1) 이미 존재하는 닉네임인지 확인
    existing_nickname = db.query(models.User).filter(models.User.nickname == payload.nickname).first()
    if existing_nickname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 닉네임입니다."
        )

    # 2) 새 사용자 생성
    new_user = models.User(
        email=payload.email,
        pw=payload.pw,  # ⚠️ 나중에는 반드시 해시해야 함!
        nickname=payload.nickname,
        exp=100,  # 초기 exp 100으로 설정 (졸음 감지 테스트용)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "회원가입이 완료되었습니다."}


@router.patch("/users/update/{user_id}")
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 사용자가 존재하지 않습니다.")

    email_owner = (
        db.query(models.User)
        .filter(models.User.email == payload.email, models.User.user_id != user_id)
        .first()
    )
    if email_owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 이메일입니다.",
        )

    nickname_owner = (
        db.query(models.User)
        .filter(models.User.nickname == payload.nickname, models.User.user_id != user_id)
        .first()
    )
    if nickname_owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 닉네임입니다.",
        )

    user.email = payload.email
    user.nickname = payload.nickname
    user.pw = payload.pw

    db.commit()
    db.refresh(user)

    return {"message": "정보 수정되었습니다."}

@router.get("/users/profile", response_model=UserProfileOut)
def get_profile(user_id: int = Query(..., description="사용자 ID"), db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 사용자가 존재하지 않습니다.")

    focus_rows = (
        db.query(
            models.Report.study_date,
            func.coalesce(func.sum(models.Report.focus_time), 0).label("focus_time"),
        )
        .filter(models.Report.member_id == user_id)
        .group_by(models.Report.study_date)
        .all()
    )

    daily_focus = {row.study_date: row.focus_time for row in focus_rows}
    total_focus_time = sum(daily_focus.values())

    today = date.today()
    recent_week = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        recent_week.append(daily_focus.get(day, 0))

    consecutive_days = 0
    streak_day = today
    while daily_focus.get(streak_day, 0) > 0:
        consecutive_days += 1
        streak_day -= timedelta(days=1)

    return UserProfileOut(
        user_id=user.user_id,
        email=user.email,
        nickname=user.nickname,
        exp=user.exp,
        total_focus_time=total_focus_time,
        recent_week_focus_times=recent_week,
        consecutive_study_days=consecutive_days,
    )


@router.post("/me/pokemon")
def add_user_pokemon(
    payload: PokemonBase,
    user_id: int = Query(..., description="사용자 ID"),
    db: Session = Depends(get_db),
):
    """
    사용자가 보유 포켓몬을 추가하고, 활성 슬롯이 비어 있으면 다음 슬롯에 자동 배치한다.
    """
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 사용자가 존재하지 않습니다.")

    poke = db.query(models.Pokemon).filter(models.Pokemon.poke_id == payload.poke_id).first()
    if not poke:
        raise HTTPException(status_code=404, detail="해당 포켓몬을 찾을 수 없습니다.")

    new_user_poke = models.UserPokemon(
        user_id=user_id,
        poke_id=payload.poke_id,
        level=1,
        exp=0,
    )
    db.add(new_user_poke)
    db.flush()  # id 확보용

    added_to_team = False
    existing_slots = (
        db.query(models.UserActiveTeam.slot)
        .filter(models.UserActiveTeam.user_id == user_id)
        .all()
    )
    occupied = {s.slot for s in existing_slots}
    if len(occupied) < 6:
        # 비어 있는 가장 작은 슬롯 선택 (1~6)
        for cand in range(1, 7):
            if cand not in occupied:
                next_slot = cand
                break
        db.add(
            models.UserActiveTeam(
                user_id=user_id,
                user_pokemon_id=new_user_poke.id,
                slot=next_slot,
            )
        )
        added_to_team = True

    db.commit()

    return {
        "message": "포켓몬이 추가되었습니다.",
        "user_pokemon_id": new_user_poke.id,
        "added_to_active_team": added_to_team,
        "slot": next_slot if added_to_team else None,
    }
