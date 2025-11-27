# backend/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
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