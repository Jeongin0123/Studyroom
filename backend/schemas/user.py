# backend/schemas/user.py
from typing import List
from pydantic import BaseModel


class UserBase(BaseModel):
    email: str

class UserCreate(UserBase): # 회원가입
    pw: str  # 비밀번호는 생성 시에만 받기
    nickname: str

class UserLogin(UserBase): # 로그인
    pw: str
    
class UserOut(UserBase): # 응답
    user_id: int
    nickname: str
    exp: int = 0

    # Pydantic v2에서는 orm_mode -> from_attributes
    class Config:
        from_attributes = True


class PasswordForgotRequest(BaseModel):
    email: str


class PasswordForgotResponse(BaseModel):
    password: str
    nickname: str


class UserUpdate(BaseModel):
    email: str
    nickname: str
    pw: str


class UserProfileOut(UserOut):
    total_focus_time: int
    recent_week_focus_times: List[int]
    consecutive_study_days: int
