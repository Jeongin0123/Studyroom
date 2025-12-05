from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.detector import predict_drowsiness
from backend.database import get_db
from backend.models.room_member import RoomMember
from backend.schemas.drowsiness_log import DrowsinessLogCreate

router = APIRouter(prefix="/api/drowsiness", tags=["Drowsiness"])


# ============================================================
# 1) 졸음 감지 엔드포인트
# ============================================================
@router.post("/detect")
async def detect_drowsiness_endpoint(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = predict_drowsiness(contents)
        return {"result": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ============================================================
# 2) 졸음 로그 저장 엔드포인트
# ============================================================
@router.post("/log")
def log_drowsiness(req: DrowsinessLogCreate, db: Session = Depends(get_db)):
    try:
        # 졸음 횟수 증가 (RoomMember 테이블)
        if req.event_type == "drowsy":
            # Find the user's current room membership
            room_member = (
                db.query(RoomMember)
                .filter(RoomMember.user_id == req.user_id)
                .first()
            )
            
            if room_member:
                room_member.drowsiness_count += 1

        db.commit()

        return {
            "status": "success",
        }
    except Exception as e:
        print(f"[Log] Failed to save: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
