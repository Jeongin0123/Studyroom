from __future__ import annotations

import os
from datetime import datetime
from typing import Optional, List
from pathlib import Path

# ---------- ENV ----------
from dotenv import load_dotenv

# 에이전트 추가 (리서치용)
from research_agent import get_research_answer

loaded = load_dotenv()
if not loaded:
    alt_env = Path(__file__).resolve().parent.parent / "remind" / ".env"
    if alt_env.exists():
        load_dotenv(dotenv_path=alt_env)

# ---------- FastAPI ----------
from fastapi import FastAPI, Request, UploadFile, File, Form  # ✅ UploadFile, File, Form 추가
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

# ---------- PDF 기반 QA 모듈 ----------
# pdf_agent.py 에서 제공 (create_pdf_store, ask_pdf 구현 필요)
from pdf_agent import create_pdf_store, ask_pdf  # ✅ PDF 에이전트 임포트


# -----------------------------
# DB 세팅 (MySQL) — DB가 없으면 자동 생성
# -----------------------------
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "23306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "1234")
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
                lines.append(
                    f"[검색결과 {i+1}]\n제목: {r.get('title')}\n링크: {r.get('href')}\n요약: {r.get('body')}\n"
                )
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
# 리서치 사용 여부 판단 로직
# -----------------------------
def should_use_research(message: str) -> bool:
    """
    이 메시지가 '검색 기반 리서치'가 어울리는 질문인지 간단히 판단한다.
    - 시사성/최신 정보 관련 키워드
    - '~가 뭐야?' 같은 정의 질문
    - '설명해줘/정리해줘/알려줘/요약해줘' 등 짧은 개념 요청
    """
    msg = message.strip()

    # 1) 시사/최신 느낌
    hot_keywords = ["최신", "최근", "요즘", "요새", "트렌드", "이슈", "뉴스"]
    if any(k in msg for k in hot_keywords):
        return True

    # 2) '~가 뭐야?', '~이 뭐야?', '~은 뭐야?' 형태
    if msg.endswith("뭐야?") or msg.endswith("뭔데?") or msg.endswith("무엇인가?"):
        return True

    # 3) 간단한 설명/정리 요청 (너무 긴 공부질문은 일반 모드로)
    ask_keywords = ["설명해줘", "정리해줘", "알려줘", "요약해줘", "찾아줘", "검색해줘", "search"]
    if any(k in msg for k in ask_keywords) and len(msg) <= 80:
        return True

    return False


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

# ✅ PDF 업로드 경로 폴더
UPLOAD_DIR = Path(__file__).resolve().parent / "uploaded_pdfs"
UPLOAD_DIR.mkdir(exist_ok=True)


# -----------------------------
# Schemas
# -----------------------------
class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    message: str


class PdfChatRequest(BaseModel):  # ✅ PDF 전용 요청 스키마 추가
    user_id: Optional[str] = None
    doc_id: str
    message: str


# -----------------------------
# Routes (기존 경로)
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


# 1) 자동 리서치 포함 단순 채팅 (/chat)
@app.post("/chat")
def chat(req: ChatRequest):
    db = SessionLocal()
    try:
        conv = get_or_create_conversation(db, req.user_id)
        history = history_from_db(db, conv.id)

        # 사용자 메시지 저장
        save_message(db, conv.id, "user", req.message)

        # 이 메시지가 리서치가 어울리는 질문이라면 → 리서치 에이전트 사용
        if should_use_research(req.message):
            ai_text = get_research_answer(req.message)
        else:
            # 아니면 기존 학습 코치 체인 사용
            history.append(HumanMessage(req.message))
            ai_text = chain.invoke({"history": history, "input": req.message})

        # AI 답변 저장
        save_message(db, conv.id, "assistant", ai_text)

        return {"conversation_id": conv.id, "reply": ai_text}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"backend-error: {type(e).__name__}: {e}"},
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

        # ✅ 1단계: 자동 리서치 여부 먼저 판단
        if should_use_research(req.message):
            # 리서치 에이전트 사용 (웹 검색 + 정리 + [유사한 검색결과])
            ai_text = get_research_answer(req.message)
        else:
            # ✅ 2단계: 평소에는 에이전트 입력 구성 (검색: 접두어 처리 등)
            agent_input = build_agent_input(req.message)

            history.append(HumanMessage(agent_input))

            ai_text = chain.invoke({"history": history, "input": agent_input})

        # AI 답변 저장
        save_message(db, conv.id, "assistant", ai_text)

        return {"conversation_id": conv.id, "reply": ai_text}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"agent-error: {type(e).__name__}: {e}"},
        )
    finally:
        db.close()



# 3) 리서치 + 유사 검색결과 에이전트 (/research-chat)
@app.post("/research-chat")
def research_chat(req: ChatRequest):
    db = SessionLocal()
    try:
        conv = get_or_create_conversation(db, req.user_id)

        # 사용자 메시지 저장
        save_message(db, conv.id, "user", req.message)

        # 리서치 에이전트 호출 (설명 + [유사한 검색결과])
        ai_text = get_research_answer(req.message)

        # AI 답변 저장
        save_message(db, conv.id, "assistant", ai_text)

        return {"conversation_id": conv.id, "reply": ai_text}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"research-error: {type(e).__name__}: {e}"},
        )
    finally:
        db.close()


# 4) PDF 업로드 → doc_id 발급
@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...)):
    # 확장자 체크
    filename = file.filename or "document.pdf"
    ext = filename.split(".")[-1].lower()
    if ext != "pdf":
        return JSONResponse(
            status_code=400,
            content={"error": "PDF 파일만 업로드 가능합니다."},
        )

    # 파일 저장
    save_path = UPLOAD_DIR / filename
    with open(save_path, "wb") as f:
        f.write(await file.read())

    # 벡터 스토어 생성 + doc_id 발급
    try:
        doc_id = create_pdf_store(str(save_path))
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"pdf-index-error: {type(e).__name__}: {e}"},
        )

    return {"doc_id": doc_id, "message": "PDF 업로드 및 인덱싱 완료"}


# 5) PDF 기반 질의응답 (/pdf-chat)
@app.post("/pdf-chat")
def pdf_chat(req: PdfChatRequest):
    db = SessionLocal()
    try:
        conv = get_or_create_conversation(db, req.user_id)

        # 사용자 메시지 저장
        save_message(db, conv.id, "user", f"[PDF:{req.doc_id}] {req.message}")

        # PDF 에이전트로 질의
        answer = ask_pdf(req.doc_id, req.message)

        # AI 답변 저장
        save_message(db, conv.id, "assistant", answer)

        return {
            "conversation_id": conv.id,
            "doc_id": req.doc_id,
            "reply": answer,
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"pdf-chat-error: {type(e).__name__}: {e}"},
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


# -----------------------------
# ✅ /api/ 경로용 별칭 라우트 추가 (프론트 호환)
# -----------------------------

# 헬스체크 /api/health
@app.get("/api/health")
def health_api(request: Request):
    return health(request)

# /api/chat  → 기존 /chat 재사용
@app.post("/api/chat")
def chat_api(req: ChatRequest):
    return chat(req)

# /api/agent-chat → 기존 /agent-chat 재사용
@app.post("/api/agent-chat")
def agent_chat_api(req: ChatRequest):
    return agent_chat(req)

# /api/research-chat → 기존 /research-chat 재사용
@app.post("/api/research-chat")
def research_chat_api(req: ChatRequest):
    return research_chat(req)

# /api/upload_pdf → 기존 /upload_pdf 재사용
@app.post("/api/upload_pdf")
async def upload_pdf_api(file: UploadFile = File(...)):
    return await upload_pdf(file)

# /api/pdf-chat → 기존 /pdf-chat 재사용
@app.post("/api/pdf-chat")
def pdf_chat_api(req: PdfChatRequest):
    return pdf_chat(req)
