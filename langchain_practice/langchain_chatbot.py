from __future__ import annotations

import os
from datetime import datetime
from typing import Optional, List
from pathlib import Path

# ---------- ENV ----------
from dotenv import load_dotenv

# 1) 현재 작업 디렉토리에 .env가 있으면 우선 로드
loaded = load_dotenv()
# 2) 없으면 ../remind/.env도 탐색해서 로드 (프로젝트 구조 배려)
if not loaded:
    alt_env = Path(__file__).resolve().parent.parent / "remind" / ".env"
    if alt_env.exists():
        load_dotenv(dotenv_path=alt_env)

# ---------- FastAPI ----------
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------- LangChain / LCEL ----------
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser

# ---------- SQLAlchemy (MySQL) ----------
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session

# -----------------------------
# DB 세팅 (MySQL) — DB가 없으면 자동 생성
# -----------------------------
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "studyroom")

# 1) 서버 레벨 연결(데이터베이스 지정 없이) → DB 생성 보장
SERVER_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/?charset=utf8mb4"
server_engine = create_engine(
    SERVER_URL,
    pool_pre_ping=True,
    future=True,
)
with server_engine.connect() as conn:
    conn.exec_driver_sql(
        f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DB}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    )

# 2) 실제 앱이 사용할 DB 엔진 생성
DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"
)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # 죽은 커넥션 자동 감지
    pool_recycle=3600,    # MySQL wait_timeout 대응
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), nullable=True, index=True)  # 방ID나 사용자ID로 사용
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

# 테이블 생성 (없으면 생성)
Base.metadata.create_all(engine)

# -----------------------------
# LCEL 체인 정의
# -----------------------------
PRIMARY_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
llm = ChatOpenAI(
    model=PRIMARY_MODEL,
    temperature=0.2,          # 답변 안정성
    timeout=60,               # 네트워크 지연 방어
)
prompt = ChatPromptTemplate.from_messages([
    ("system", "너는 온라인 스터디룸 사용자를 도와주는 학습 코치야."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])
# 프롬프트 → LLM → 문자열 파서
chain = prompt | llm | StrOutputParser()

# -----------------------------
# DB 유틸
# -----------------------------
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

# -----------------------------
# FastAPI 앱 + CORS
# -----------------------------
app = FastAPI(title="Studyroom AI", version="0.1.0")

# ✅ 개발/테스트 환경에서 확실하게 허용되도록 CORS 정리
front_origin_env = os.getenv("FRONT_ORIGIN")  # 특정 도메인을 강제하고 싶으면 여기에 설정
dev_allow_all = os.getenv("DEV_ALLOW_ALL_CORS", "false").lower() == "true"

if dev_allow_all:
    # 개발 중 문제 있으면 .env에 DEV_ALLOW_ALL_CORS=true 로 전면 허용
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # 기본 허용 목록(로컬 프론트)
    allow_list = [
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:5173", "http://127.0.0.1:5173",
    ]
    if front_origin_env:
        allow_list.append(front_origin_env)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_list,
        allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",  # 포트 바뀌어도 허용
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# -----------------------------
# Schemas
# -----------------------------
class ChatRequest(BaseModel):
    user_id: Optional[str] = None   # 방ID 또는 사용자ID (권장: room-XXXX)
    message: str

# -----------------------------
# Routes
# -----------------------------
@app.get("/")
def root():
    return {"service": "Studyroom AI", "status": "running"}

@app.get("/health")
def health(request: Request):
    try:
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
        has_key = bool(os.getenv("OPENAI_API_KEY"))
        return {
            "status": "ok",
            "db": MYSQL_DB,
            "model": PRIMARY_MODEL,
            "openai_key": has_key,
            "client_origin": request.headers.get("Origin"),
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "detail": str(e)})

@app.post("/chat")
def chat(req: ChatRequest):
    db = SessionLocal()
    try:
        # 방/사용자 단위로 대화 세션 유지
        conv = get_or_create_conversation(db, req.user_id)
        history = history_from_db(db, conv.id)

        # 사용자 메시지 저장 + 히스토리에 추가
        save_message(db, conv.id, "user", req.message)
        history.append(HumanMessage(req.message))

        # LCEL 체인 호출
        ai_text = chain.invoke({"history": history, "input": req.message})

        # AI 메시지 저장
        save_message(db, conv.id, "assistant", ai_text)

        return {"conversation_id": conv.id, "reply": ai_text}
    except Exception as e:
        # 프론트에서 원인을 보기 쉽게 전달
        return JSONResponse(
            status_code=500,
            content={"error": f"backend-error: {type(e).__name__}: {e}"}
        )
    finally:
        db.close()

@app.get("/conversations/{user_id}")
def list_messages(user_id: str):
    db = SessionLocal()
    try:
        conv = get_or_create_conversation(db, user_id)
        msgs = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.id.asc())
            .all()
        )
        return {
            "conversation_id": conv.id,
            "messages": [
                {
                    "id": m.id,
                    "role": m.role,
                    "content": m.content,
                    "created_at": m.created_at.isoformat(),
                }
                for m in msgs
            ],
        }
    finally:
        db.close()
