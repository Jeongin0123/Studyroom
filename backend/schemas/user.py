# backend/schemas/user.py
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    nickname: str
    selected: Optional[List[int]] = None  # 선택된 포켓몬 (max 6이라고 했던 값)

class UserCreate(UserBase): # 회원가입
    pw: str  # 비밀번호는 생성 시에만 받기

class UserLogin(BaseModel): # 로그인
    pw: str

class UserOut(UserBase): # 응답
    user_id: int
    # email
    # nickname
    # selected

    # Pydantic v2에서는 orm_mode -> from_attributes
    class Config:
        from_attributes = True
