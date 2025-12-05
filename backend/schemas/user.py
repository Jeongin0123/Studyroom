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
    has_pokemon: bool = False

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
    recent_5_days_dates: List[str]  # 최근 5일 날짜 (MM/DD 형식)
    recent_5_days_focus_times: List[int]  # 사용자의 최근 5일 공부시간
    recent_5_days_avg_focus_times: List[int]  # 다른 사용자들의 최근 5일 평균
    consecutive_study_days: int
    rank: int  # 누적 공부시간 기준 등수
    total_users: int  # 전체 사용자 수
