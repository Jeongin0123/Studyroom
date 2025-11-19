# backend/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..schemas.user import UserLogin, UserOut

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
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        )

    # 3) 로그인 성공 → 사용자 정보 반환
    return user

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
        selected=payload.selected if getattr(payload, "selected", None) is not None else [],
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "회원가입이 완료되었습니다."}

@router.get("/profile", response_model=UserOut)
def get_profile(user_id: int = Query(..., description="사용자 ID"), db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 사용자가 존재하지 않습니다.")
    
    return {
        "user_id": user.user_id,
        "email": user.email,
        "nickname": user.nickname,
        "selected": user.selected
    }
