# backend/schemas/user.py
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    nickname: str
    selected: int  # 선택된 포켓몬 (max 6이라고 했던 값)


class UserCreate(UserBase):
    email: str
    pw: str  # 비밀번호는 생성 시에만 받기
    nickname: str

class UserLogin(BaseModel):
    email: EmailStr
    pw: str

class UserOut(UserBase):
    user_id: int
    email: str
    nickname: str

    # Pydantic v2에서는 orm_mode -> from_attributes
    class Config:
        from_attributes = True