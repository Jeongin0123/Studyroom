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

    # 3) 사용자가 포켓몬을 보유하고 있는지 확인
    has_pokemon = db.query(models.UserPokemon).filter(
        models.UserPokemon.user_id == user.user_id
    ).first() is not None

    # 4) 로그인 성공 → 사용자 정보 반환
    return UserOut(
        email=user.email,
        user_id=user.user_id,
        nickname=user.nickname,
        exp=user.exp,
        has_pokemon=has_pokemon
    )


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

    # 1. 현재 사용자의 날짜별 공부시간
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

    # 2. 최근 7일 데이터를 요일별로 그룹화 (일~토)
    today = date.today()
    weekday_focus = [0] * 7  # [일, 월, 화, 수, 목, 금, 토]
    
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        weekday = day.weekday()  # 0=월요일, 6=일요일
        weekday_index = (weekday + 1) % 7  # 0=일요일, 1=월요일, ..., 6=토요일
        weekday_focus[weekday_index] += daily_focus.get(day, 0)

    # 3. 다른 모든 사용자의 요일별 평균 계산 (0분 사용자 포함)
    # 모든 사용자의 최근 7일 데이터 가져오기
    all_users_focus = (
        db.query(
            models.Report.member_id,
            models.Report.study_date,
            func.coalesce(func.sum(models.Report.focus_time), 0).label("focus_time"),
        )
        .filter(
            models.Report.member_id != user_id,  # 현재 사용자 제외
            models.Report.study_date >= today - timedelta(days=6)
        )
        .group_by(models.Report.member_id, models.Report.study_date)
        .all()
    )

    # 다른 사용자들의 요일별 공부시간 합계
    other_users_weekday_total = [0] * 7
    other_users_count_by_weekday = [0] * 7
    
    # 현재 사용자를 제외한 전체 사용자 수
    total_other_users = db.query(models.User).filter(models.User.user_id != user_id).count()
    
    for row in all_users_focus:
        weekday = row.study_date.weekday()
        weekday_index = (weekday + 1) % 7
        other_users_weekday_total[weekday_index] += row.focus_time
    
    # 평균 계산 (0분 사용자도 포함하므로 전체 사용자 수로 나눔)
    weekday_avg = [
        int(total / total_other_users) if total_other_users > 0 else 0
        for total in other_users_weekday_total
    ]

    # 4. 연속 학습 일수
    consecutive_days = 0
    streak_day = today
    while daily_focus.get(streak_day, 0) > 0:
        consecutive_days += 1
        streak_day -= timedelta(days=1)

    # 5. 전체 사용자 중 등수 계산
    # 모든 사용자의 누적 공부시간 계산
    all_users_total_focus = (
        db.query(
            models.Report.member_id,
            func.coalesce(func.sum(models.Report.focus_time), 0).label("total_focus")
        )
        .group_by(models.Report.member_id)
        .all()
    )
    
    # 사용자별 누적 시간 딕셔너리
    user_totals = {row.member_id: row.total_focus for row in all_users_total_focus}
    
    # 공부 기록이 없는 사용자도 포함
    all_user_ids = [u.user_id for u in db.query(models.User.user_id).all()]
    for uid in all_user_ids:
        if uid not in user_totals:
            user_totals[uid] = 0
    
    # 내림차순 정렬하여 등수 계산
    sorted_users = sorted(user_totals.items(), key=lambda x: x[1], reverse=True)
    rank = next((i + 1 for i, (uid, _) in enumerate(sorted_users) if uid == user_id), len(sorted_users))
    total_users = len(sorted_users)

    return UserProfileOut(
        user_id=user.user_id,
        email=user.email,
        nickname=user.nickname,
        exp=user.exp,
        total_focus_time=total_focus_time,
        recent_week_focus_times=weekday_focus,
        recent_week_avg_focus_times=weekday_avg,
        consecutive_study_days=consecutive_days,
        rank=rank,
        total_users=total_users,
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
