# backend/main.py
from __future__ import annotations

import os
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List

# ---------- ENV ----------
from dotenv import load_dotenv

# 1차: 현재 경로(.env)
loaded = load_dotenv()
# 2차: 프로젝트 구조상 ../remind/.env 도 탐색
if not loaded:
    alt_env = Path(__file__).resolve().parent.parent / "remind" / ".env"
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
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, DateTime, ForeignKey,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session

# ✅ PokemonRoute 모듈 import (상세 포켓몬 API)
from PokemonRoute import pokemon

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
# DB 세팅 (없으면 자동 생성)
# ============================================================
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "studyroom")

SERVER_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
    f"@{MYSQL_HOST}:{MYSQL_PORT}/?charset=utf8mb4"
)

DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
    f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"
)

# 서버 레벨 엔진(스키마 생성용)
server_engine = create_engine(
    SERVER_URL,
    pool_pre_ping=True,
    future=True,
    pool_recycle=3600,
)

# DB 생성
try:
    with server_engine.connect() as conn:
        conn.exec_driver_sql(
            f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DB}` "
            f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        )
except Exception as e:
    print(f"[DB:init] CREATE DATABASE 실패: {type(e).__name__}: {e}")

# 앱 레벨 엔진
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True,
    pool_recycle=3600,
    pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "10")),
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), nullable=True, index=True)
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.id.asc()",
    )

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    role = Column(String(10), nullable=False)  # 'system' | 'user' | 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    conversation = relationship("Conversation", back_populates="messages")

# 테이블 생성
try:
    Base.metadata.create_all(engine)
except Exception as e:
    print(f"[DB:init] create_all 실패: {type(e).__name__}: {e}")

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
def get_or_create_conversation(db: Session, user_id: Optional[str]) -> Conversation:
    if user_id:
        conv = (
            db.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.id.desc())
            .first()
        )
        if conv:
            return conv
    conv = Conversation(user_id=user_id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv

def history_from_db(db: Session, conversation_id: int) -> List:
    rows = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.id.asc())
        .all()
    )
    messages: List = [SystemMessage("너는 온라인 스터디룸 사용자를 도와주는 학습 코치야.")]
    for r in rows:
        if r.role == "user":
            messages.append(HumanMessage(r.content))
        elif r.role == "assistant":
            messages.append(AIMessage(r.content))
    return messages

def save_message(db: Session, conversation_id: int, role: str, content: str) -> None:
    db.add(Message(conversation_id=conversation_id, role=role, content=content))
    db.commit()

# ============================================================
# 공통 헬퍼
# ============================================================
def _json_500(e: Exception, tag: str):
    print(f"[{tag}] {type(e).__name__}: {e}")
    return JSONResponse(status_code=500, content={"error": f"{tag}: {type(e).__name__}: {e}"})

# ============================================================
# 라우트
# ============================================================
# ✅ PokemonRoute 라우터 등록 (/pokemon/... 엔드포인트들)
app.include_router(pokemon.router)

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
    db = SessionLocal()
    try:
        conv = get_or_create_conversation(db, req.user_id)
        history = history_from_db(db, conv.id)

        # 사용자 메시지 저장 + 히스토리 반영
        save_message(db, conv.id, "user", req.message)
        history.append(HumanMessage(req.message))

        # LLM 실행
        chain = get_chain()
        ai_text = chain.invoke({"history": history, "input": req.message})

        # 응답 저장
        save_message(db, conv.id, "assistant", ai_text)
        return {"conversation_id": conv.id, "reply": ai_text}
    except HTTPException:
        raise
    except Exception as e:
        return _json_500(e, "backend-error")
    finally:
        db.close()

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
@app.on_event("startup")
def on_startup():
    print("[startup] Studyroom Backend unified app started")
