# backend/main.py
from __future__ import annotations

import os
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List

# ---------- ENV ----------
from dotenv import load_dotenv

# 1차: backend/.env (uvicorn 실행 위치와 관계없이 고정)
BASE_DIR = Path(__file__).resolve().parent
loaded = load_dotenv(BASE_DIR / ".env")

# 2차: 현재 작업 디렉터리에서 탐색 (예전 방식)
if not loaded:
    loaded = load_dotenv()

# 3차: 프로젝트 구조상 ../remind/.env 도 탐색
if not loaded:
    alt_env = BASE_DIR.parent / "remind" / ".env"
    if alt_env.exists():
        load_dotenv(dotenv_path=alt_env)

# ---------- FastAPI ----------
from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------- LangChain / LCEL ----------
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser

# ---------- SQLAlchemy (MySQL) ----------
from sqlalchemy.orm import Session
from backend.database import engine, Base, get_db, SessionLocal

# ============================================================
# FastAPI + CORS
# ============================================================
app = FastAPI(title="Studyroom Backend (Unified)", version="1.2.0")

# CORS 허용 Origin 구성 (환경변수 있으면 우선, 없으면 기본값)
def _parse_origins(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    return [o.strip() for o in raw.split(",") if o.strip()]

CLIENT_ORIGINS = _parse_origins(os.getenv("CORS_ALLOW_ORIGINS"))

DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    # 환경변수 지정이 없으면 안전한 기본 목록 사용
    allow_origins=CLIENT_ORIGINS if CLIENT_ORIGINS else DEFAULT_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# DB 세팅 (backend.database 사용)
# ============================================================
# 1. DB가 없으면 생성 (서버 레벨 연결)
from sqlalchemy import create_engine
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "011026")
MYSQL_DB = os.getenv("MYSQL_DB", "studyroom")

SERVER_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
    f"@{MYSQL_HOST}:{MYSQL_PORT}/?charset=utf8mb4"
)

try:
    server_engine = create_engine(SERVER_URL, pool_pre_ping=True, future=True)
    with server_engine.connect() as conn:
        conn.exec_driver_sql(
            f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DB}` "
            f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        )
except Exception as e:
    print(f"[DB:init] CREATE DATABASE 실패: {type(e).__name__}: {e}")

# 2. 앱 레벨 엔진 (backend.database)
# 앱 시작 시 테이블 생성은 backend.models.__init__에서 처리하거나 startup 이벤트에서 처리


# ============================================================
# LangChain 체인 (지연 생성)
# ============================================================
PRIMARY_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

prompt = ChatPromptTemplate.from_messages([
    ("system", "너는 온라인 스터디룸 사용자를 도와주는 학습 코치야."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])

def get_chain():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY가 설정되어 있지 않습니다 (.env 확인).")
    llm = ChatOpenAI(model=PRIMARY_MODEL, temperature=0.2, timeout=60)
    return prompt | llm | StrOutputParser()

# ============================================================
# 스키마
# ============================================================
class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=8000)

# ============================================================
# DB 유틸
# ============================================================
# ============================================================
# 공통 헬퍼
# ============================================================
def _json_500(e: Exception, tag: str):
    print(f"[{tag}] {type(e).__name__}: {e}")
    return JSONResponse(status_code=500, content={"error": f"{tag}: {type(e).__name__}: {e}"})

# ============================================================
# 라우트
# ============================================================
@app.get("/")
def root():
    return {"status": "ok", "service": "studyroom-backend-unified"}

# 헬스체크
def _health_payload(request: Request):
    try:
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
        has_key = bool(os.getenv("OPENAI_API_KEY"))
        return {
            "ok": True,
            "db": MYSQL_DB,
            "model": PRIMARY_MODEL,
            "openai_key": has_key,
            "client_origin": request.headers.get("Origin"),
        }
    except Exception as e:
        return {"ok": False, "detail": f"{type(e).__name__}: {e}"}

@app.get("/health")
def health(request: Request):
    return _health_payload(request)

@app.get("/api/health")
def api_health(request: Request):
    return _health_payload(request)

# ---- AI 채팅 엔드포인트 ----
def _chat_core(req: ChatRequest):
    try:
        chain = get_chain()
        ai_text = chain.invoke({"history": [], "input": req.message})
        return {"reply": ai_text}
    except HTTPException:
        raise
    except Exception as e:
        return _json_500(e, "backend-error")

# 기본/레거시
@app.post("/chat")
def chat(req: ChatRequest):
    return _chat_core(req)

@app.post("/ai-chat/message")
def chat_legacy(req: ChatRequest):
    return _chat_core(req)

# ✅ 프론트 호환 경로 추가 (/ask)
@app.post("/ai-chat/ask")
def chat_ask(req: ChatRequest):
    return _chat_core(req)

# 프록시(/api) 경로도 허용
@app.post("/api/chat")
def chat_api(req: ChatRequest):
    return _chat_core(req)

@app.post("/api/ai-chat/message")
def chat_api_legacy(req: ChatRequest):
    return _chat_core(req)

@app.post("/api/ai-chat/ask")
def chat_api_ask(req: ChatRequest):
    return _chat_core(req)

# ---- 포켓몬 프록시 ----
from urllib.request import urlopen, Request as URLRequest
from urllib.error import HTTPError, URLError

@app.get("/api/pokemon/{poke_id}")
def get_pokemon(poke_id: int):
    url = f"https://pokeapi.co/api/v2/pokemon/{poke_id}"
    try:
        req = URLRequest(url, headers={"User-Agent": "studyroom/1.0"})
        with urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        return data
    except HTTPError as e:
        return JSONResponse(status_code=e.code, content={"error": f"PokeAPI HTTP {e.code}"})
    except URLError as e:
        return JSONResponse(status_code=502, content={"error": f"PokeAPI unreachable: {e.reason}"})
    except Exception as e:
        return _json_500(e, "pokemon-proxy-error")

# ---- 더미 엔드포인트(404 소거용) ----
@app.get("/api/focus/{tail:path}")
def focus_nop(tail: str):
    # 204는 본문이 없어야 하므로 Response 사용
    return Response(status_code=204)

# ============================================================
# 앱 라이프사이클
# ============================================================
# ============================================================
# 앱 라이프사이클
# ============================================================
@app.on_event("startup")
def on_startup():
    print("[startup] Studyroom Backend unified app started")
    # 앱 시작할 때 테이블 없으면 생성
    Base.metadata.create_all(bind=engine)

# ============================================================
# 라우터 통합
# ============================================================
from .routers import auth, room, battle, pokemon_random, drowsiness 

app.include_router(auth.router)
app.include_router(room.router)
app.include_router(battle.router)
app.include_router(pokemon_random.router)
app.include_router(drowsiness.router)

# ============================================================
# 졸음 감지 엔드포인트
# ============================================================
# from fastapi import UploadFile, File
# from backend.detector import predict_drowsiness

# @app.post("/api/drowsiness/detect")
# async def detect_drowsiness_endpoint(file: UploadFile = File(...)):
#     try:
#         contents = await file.read()
#         result = predict_drowsiness(contents)
#         return {"result": result}
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})

# # 로그 저장 엔드포인트 (이전에 추가한 것 유지)
# class DrowsinessLogRequest(BaseModel):
#     member_id: int
#     confidence: float = 0.0
#     warning_issued: bool = True

# @app.post("/api/drowsiness/log")
# def log_drowsiness(req: DrowsinessLogRequest):
#     db = SessionLocal()
#     try:
#         # backend.models.DrowsinessLog 사용
#         # models.py에 정의된 클래스 이름 확인 필요 (DrowsinessLog vs FocusEventLog)
#         # 여기서는 backend.models.drowsiness_log.DrowsinessLog 라고 가정하거나
#         # models/__init__.py에서 export된 이름을 사용해야 함.
#         # 안전하게 backend.models 모듈을 통해 접근
#         import backend.models
        
        log = backend.models.DrowsinessLog(
            member_id=req.member_id,
            detected_time=datetime.now(),
            confidence=req.confidence,
            warning_issued=req.warning_issued
        )
        db.add(log)
        db.commit()
        return {"status": "ok", "id": log.id}
    except Exception as e:
        print(f"[Log] Failed to save drowsiness log: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        db.close()
#         log = backend.models.DrowsinessLog(
#             member_id=req.member_id,
#             detected_time=datetime.now(),
#             confidence=req.confidence,
#             warning_issued=req.warning_issued
#         )
#         db.add(log)
#         db.commit()
#         return {"status": "ok", "id": log.id}
#     except Exception as e:
#         print(f"[Log] Failed to save drowsiness log: {e}")
#         return JSONResponse(status_code=500, content={"error": str(e)})
#     finally:
#         db.close()

