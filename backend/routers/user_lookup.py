# backend/routers/user_lookup.py
from fastapi import APIRouter, HTTPException
from backend.database import SessionLocal
from sqlalchemy import text

router = APIRouter(prefix="/api/user", tags=["user"])

@router.get("/by-nickname/{nickname}")
async def get_user_by_nickname(nickname: str):
    """닉네임으로 사용자 ID 조회"""
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT user_id FROM user WHERE nickname = :nickname"),
            {"nickname": nickname}
        ).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"userId": result[0], "nickname": nickname}
    finally:
        db.close()
