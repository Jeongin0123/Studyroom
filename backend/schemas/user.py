# backend/schemas/user.py
import json
from typing import List, Any
from pydantic import BaseModel, EmailStr, Field, field_validator


def _normalize_selected(value: Any) -> List[int]:
    """Ensure selected is always returned as a list of ints."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, (tuple, set)):
        return list(value)
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return parsed
        except (ValueError, TypeError):
            return []
    if isinstance(value, (int, float)):
        return [int(value)]
    return []


class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase): # 회원가입
    pw: str  # 비밀번호는 생성 시에만 받기
    nickname: str

class UserLogin(UserBase): # 로그인
    pw: str
    
class UserOut(UserBase): # 응답
    user_id: int
    nickname: str
    selected: List[int] = Field(default_factory=list) 
    exp: int = 0
    # email

    @field_validator("selected", mode="before")
    @classmethod
    def ensure_list(cls, value: Any) -> List[int]:
        return _normalize_selected(value)

    # Pydantic v2에서는 orm_mode -> from_attributes
    class Config:
        from_attributes = True


class PasswordForgotRequest(BaseModel):
    email: EmailStr


class PasswordForgotResponse(BaseModel):
    password: str
    nickname: str


class UserUpdate(BaseModel):
    email: EmailStr
    nickname: str
    pw: str


class UserProfileOut(UserOut):
    total_focus_time: int
    recent_week_focus_times: List[int]
    consecutive_study_days: int
