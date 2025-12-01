from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime

from backend.detector import predict_drowsiness
from backend.database import get_db
from backend.models.drowsiness_log import DrowsinessLog
from backend.schemas.drowsiness_log import (
    DrowsinessLogCreate,
    DrowsinessLogOut,
    DrowsinessLogResponse
)

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
@router.post("/log", response_model=DrowsinessLogResponse)
def log_drowsiness(req: DrowsinessLogCreate, db: Session = Depends(get_db)):
    try:
        # 1. 로그 저장
        new_log = DrowsinessLog(
            user_id=req.user_id,
            event_type=req.event_type,
            detected_time=datetime.now(),
        )
        db.add(new_log)
        
        # 2. 졸음 횟수 증가 (Report 테이블)
        if req.event_type == "drowsy":
            from backend.models.report import Report
            from datetime import date
            
            today = date.today()
            report = (
                db.query(Report)
                .filter(Report.member_id == req.user_id, Report.study_date == today)
                .first()
            )
            
            if report:
                report.drowsy_count += 1
            else:
                # 리포트가 없으면 새로 생성 (혹은 무시, 정책에 따라 다름)
                # 여기서는 간단히 로그만 남기고 패스하거나, 필요하면 생성 로직 추가
                pass

        db.commit()
        db.refresh(new_log)

        return DrowsinessLogResponse(
            status="success",
            event_id=new_log.id,
            saved_event=new_log
        )
    except Exception as e:
        print(f"[Log] Failed to save: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})