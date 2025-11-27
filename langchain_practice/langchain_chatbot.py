from __future__ import annotations

import os
from datetime import datetime
from typing import Optional, List
from pathlib import Path

# ---------- ENV ----------
from dotenv import load_dotenv

loaded = load_dotenv()
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

# ---------- DuckDuckGo 검색 툴 ----------
from duckduckgo_search import DDGS

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
# LCEL 체인 정의 (기본 LLM)
# -----------------------------
PRIMARY_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
llm = ChatOpenAI(
    model=PRIMARY_MODEL,
    temperature=0.2,
    timeout=60,
)
prompt = ChatPromptTemplate.from_messages([
    ("system", "너는 온라인 스터디룸 사용자를 도와주는 학습 코치야."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])
chain = prompt | llm | StrOutputParser()

# -----------------------------
# 간단한 툴: DuckDuckGo 웹 검색
# -----------------------------
def run_web_search(query: str) -> str:
    """DuckDuckGo 검색 툴. 상위 3개 결과를 텍스트로 정리."""
    try:
        lines: List[str] = []
        with DDGS() as ddgs:
            for i, r in enumerate(ddgs.text(query, max_results=3)):
                lines.append(f"[검색결과 {i+1}]\n제목: {r.get('title')}\n링크: {r.get('href')}\n요약: {r.get('body')}\n")
        if not lines:
            return "검색 결과가 없습니다."
        return "\n".join(lines)
    except Exception as e:
        return f"웹 검색 중 오류가 발생했습니다: {e}"


def build_agent_input(user_message: str) -> str:
    """
    에이전트 흉내내기:
    - 메시지가 '검색:' 으로 시작하면 → 검색 툴 실행 후 결과를 포함해서 LLM에 전달
    - 아니면 그냥 원래 메시지를 전달
    """
    stripped = user_message.strip()

    if stripped.startswith("검색:"):
        query = stripped.split("검색:", 1)[1].strip()
        if not query:
            return "사용자가 '검색:' 이라고만 입력했습니다. 검색어를 다시 물어보고 도와주세요."

        search_text = run_web_search(query)
        return (
            f"사용자가 다음 내용을 검색해달라고 요청했습니다: '{query}'\n\n"
            f"아래는 DuckDuckGo에서 가져온 검색 결과입니다:\n\n"
            f"{search_text}\n\n"
            "위 내용을 바탕으로 사용자가 이해하기 쉽게 한국어로 정리해서 알려주세요."
        )

    # 그 외에는 그냥 원래 입력 사용
    return stripped


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
app = FastAPI(title="Studyroom AI", version="1.0.0")

front_origin_env = os.getenv("FRONT_ORIGIN")
dev_allow_all = os.getenv("DEV_ALLOW_ALL_CORS", "false").lower() == "true"

if dev_allow_all:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    allow_list = [
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:5173", "http://127.0.0.1:5173",
    ]
    if front_origin_env:
        allow_list.append(front_origin_env)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_list,
        allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# -----------------------------
# Schemas
# -----------------------------
class ChatRequest(BaseModel):
    user_id: Optional[str] = None
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


# 1) 기존 단순 채팅 (에이전트 없이)
@app.post("/chat")
def chat(req: ChatRequest):
  db = SessionLocal()
  try:
      conv = get_or_create_conversation(db, req.user_id)
      history = history_from_db(db, conv.id)

      save_message(db, conv.id, "user", req.message)
      history.append(HumanMessage(req.message))

      ai_text = chain.invoke({"history": history, "input": req.message})

      save_message(db, conv.id, "assistant", ai_text)

      return {"conversation_id": conv.id, "reply": ai_text}
  except Exception as e:
      return JSONResponse(
          status_code=500,
          content={"error": f"backend-error: {type(e).__name__}: {e}"}
      )
  finally:
      db.close()


# 2) 에이전트 + 툴을 사용하는 채팅 (/agent-chat)
@app.post("/agent-chat")
def agent_chat(req: ChatRequest):
    db = SessionLocal()
    try:
        conv = get_or_create_conversation(db, req.user_id)
        history = history_from_db(db, conv.id)

        # 사용자 메시지 저장
        save_message(db, conv.id, "user", req.message)

        # 메시지를 보고 툴을 쓸지 말지 결정하고, LLM 입력을 구성
        agent_input = build_agent_input(req.message)

        history.append(HumanMessage(agent_input))

        ai_text = chain.invoke({"history": history, "input": agent_input})

        save_message(db, conv.id, "assistant", ai_text)

        return {"conversation_id": conv.id, "reply": ai_text}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"agent-error: {type(e).__name__}: {e}"}
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
