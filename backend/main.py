# backend/main.py
from __future__ import annotations

import os
import sys
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

# ---------- 경로 설정 (langchain_practice 모듈 사용용) ----------
BASE_DIR = Path(__file__).resolve().parent.parent          # 프로젝트 루트 (backend의 부모)
LANGCHAIN_DIR = BASE_DIR / "langchain_practice"           # langchain_practice 폴더

if LANGCHAIN_DIR.exists() and str(LANGCHAIN_DIR) not in sys.path:
    sys.path.append(str(LANGCHAIN_DIR))

# research_agent, pdf_agent 를 기존처럼 import
from research_agent import get_research_answer           # langchain_practice/research_agent.py
from pdf_agent import create_pdf_store, ask_pdf          # langchain_practice/pdf_agent.py

# ---------- FastAPI ----------
from fastapi import (
    FastAPI,
    Request,
    HTTPException,
    Response,
    UploadFile,
    File,
)
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------- LangChain / LCEL ----------
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser

# ---------- DuckDuckGo 검색 ----------
from duckduckgo_search import DDGS

# ---------- SQLAlchemy (MySQL) ----------
from sqlalchemy import create_engine
from backend.database import engine, Base, get_db, SessionLocal
# PokemonRoute 라우터
from backend.PokemonRoute import pokemon

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
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "1234")
MYSQL_DB = os.getenv("MYSQL_DB", "studyroom")

SERVER_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
    f"@{MYSQL_HOST}:{MYSQL_PORT}/?charset=utf8mb4"
)

DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
    f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"
)


try:
    server_engine = create_engine(SERVER_URL, pool_pre_ping=True, future=True, )
    # pool_recycle=3600)
    with server_engine.connect() as conn:
        conn.exec_driver_sql(
            f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DB}` "
            f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        )
except Exception as e:
    print(f"[DB:init] CREATE DATABASE 실패: {type(e).__name__}: {e}")

# 2. 앱 레벨 엔진 (backend.database)
# 앱 시작 시 테이블 생성은 backend.models.__init__에서 처리하거나 startup 이벤트에서 처리
# engine = create_engine(
#     DATABASE_URL,
#     pool_pre_ping=True,
#     future=True,
#     pool_recycle=3600,
#     pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
#     max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "10")),
# )
# SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Base = declarative_base()

# class Conversation(Base):
#     __tablename__ = "conversations"
#     id = Column(Integer, primary_key=True)
#     user_id = Column(String(255), nullable=True, index=True)
#     title = Column(String(255), nullable=True)
#     created_at = Column(DateTime, default=datetime.utcnow)
#     messages = relationship(
#         "Message",
#         back_populates="conversation",
#         cascade="all, delete-orphan",
#         order_by="Message.id.asc()",
#     )

# class Message(Base):
#     __tablename__ = "messages"
#     id = Column(Integer, primary_key=True)
#     conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
#     role = Column(String(10), nullable=False)  # 'system' | 'user' | 'assistant'
#     content = Column(Text, nullable=False)
#     created_at = Column(DateTime, default=datetime.utcnow)
#     conversation = relationship("Conversation", back_populates="messages")

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
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY가 설정되어 있지 않습니다 (.env 확인).",
        )
    llm = ChatOpenAI(model=PRIMARY_MODEL, temperature=0.2, timeout=60)
    return prompt | llm | StrOutputParser()

# ============================================================
# AI 보조 함수 (리서치/검색 관련)  ← langchain_chatbot.py 에서 가져옴
# ============================================================
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
    - '검색: ...' 으로 시작하면 → DuckDuckGo 검색 결과를 함께 넘겨서 답변
    - 아니면 원래 메시지를 그대로 사용
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

    return stripped

def should_use_research(message: str) -> bool:
    """
    이 메시지가 '검색 기반 리서치'가 어울리는 질문인지 간단히 판단한다.
    """
    msg = message.strip()

    # 1) 시사/최신 느낌
    hot_keywords = ["최신", "최근", "요즘", "요새", "트렌드", "이슈", "뉴스"]
    if any(k in msg for k in hot_keywords):
        return True

    # 2) '~가 뭐야?' / '~이 뭐야?' 형태
    if msg.endswith("뭐야?") or msg.endswith("뭔데?") or msg.endswith("무엇인가?"):
        return True

    # 3) 간단한 설명/정리 요청
    ask_keywords = ["설명해줘", "정리해줘", "알려줘", "요약해줘", "찾아줘", "검색해줘", "search"]
    if any(k in msg for k in ask_keywords) and len(msg) <= 80:
        return True

    return False

# ============================================================
# 스키마
# ============================================================
class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=8000)

class PdfChatRequest(BaseModel):
    user_id: Optional[str] = None
    doc_id: str
    message: str = Field(..., min_length=1, max_length=8000)

# ============================================================
# DB 유틸
# ============================================================
# def get_or_create_conversation(db: Session, user_id: Optional[str]) -> Conversation:
#     if user_id:
#         conv = (
#             db.query(Conversation)
#             .filter(Conversation.user_id == user_id)
#             .order_by(Conversation.id.desc())
#             .first()
#         )
#         if conv:
#             return conv
#     conv = Conversation(user_id=user_id)
#     db.add(conv)
#     db.commit()
#     db.refresh(conv)
#     return conv

# def history_from_db(db: Session, conversation_id: int) -> List:
#     rows = (
#         db.query(Message)
#         .filter(Message.conversation_id == conversation_id)
#         .order_by(Message.id.asc())
#         .all()
#     )
#     messages: List = [SystemMessage("너는 온라인 스터디룸 사용자를 도와주는 학습 코치야.")]
#     for r in rows:
#         if r.role == "user":
#             messages.append(HumanMessage(r.content))
#         elif r.role == "assistant":
#             messages.append(AIMessage(r.content))
#     return messages

# def save_message(db: Session, conversation_id: int, role: str, content: str) -> None:
#     db.add(Message(conversation_id=conversation_id, role=role, content=content))
#     db.commit()
# ============================================================
# 공통 헬퍼
# ============================================================
def _json_500(e: Exception, tag: str):
    print(f"[{tag}] {type(e).__name__}: {e}")
    return JSONResponse(status_code=500, content={"error": f"{tag}: {type(e).__name__}: {e}"})

# ✅ PDF 업로드 경로 (기존 langchain_practice와 동일 폴더 사용)
UPLOAD_DIR = LANGCHAIN_DIR / "uploaded_pdfs"
UPLOAD_DIR.mkdir(exist_ok=True)

# ============================================================
# 라우트
# ============================================================
# ✅ PokemonRoute 라우터 등록 (/pokemon/... 엔드포인트들)
# app.include_router(pokemon.router)

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

# ---- 기본 AI 채팅 엔드포인트 (이전 버전 유지) ----
def _chat_core(req: ChatRequest):
    # db = SessionLocal()
    try:
        # conv = get_or_create_conversation(db, req.user_id)
        # history = history_from_db(db, conv.id)

        # # 사용자 메시지 저장 + 히스토리 반영
        # save_message(db, conv.id, "user", req.message)
        # history.append(HumanMessage(req.message))

        chain = get_chain()
        ai_text = chain.invoke({"history": [], "input": req.message})
        return {"reply": ai_text}
    except HTTPException:
        raise
    except Exception as e:
        return _json_500(e, "backend-error")

@app.post("/chat")
def chat(req: ChatRequest):
    return _chat_core(req)

@app.post("/ai-chat/message")
def chat_legacy(req: ChatRequest):
    return _chat_core(req)

@app.post("/ai-chat/ask")
def chat_ask(req: ChatRequest):
    return _chat_core(req)

@app.post("/api/chat")
def chat_api(req: ChatRequest):
    return _chat_core(req)

@app.post("/api/ai-chat/message")
def chat_api_legacy(req: ChatRequest):
    return _chat_core(req)

@app.post("/api/ai-chat/ask")
def chat_api_ask(req: ChatRequest):
    return _chat_core(req)

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
# ✨ 에이전트 기반 채팅 / 리서치 에이전트
#    (langchain_chatbot.py 의 /agent-chat, /research-chat 통합)
# ============================================================
# @app.post("/agent-chat")
# def agent_chat(req: ChatRequest):
#     db = SessionLocal()
#     try:
#         conv = get_or_create_conversation(db, req.user_id)
#         history = history_from_db(db, conv.id)

#         # 사용자 메시지 저장
#         save_message(db, conv.id, "user", req.message)

#         # 1단계: 리서치 사용 여부 판단
#         if should_use_research(req.message):
#             ai_text = get_research_answer(req.message)
#         else:
#             # 2단계: '검색:' 접두어 처리 등
#             agent_input = build_agent_input(req.message)
#             history.append(HumanMessage(agent_input))
#             chain = get_chain()
#             ai_text = chain.invoke({"history": history, "input": agent_input})

#         # AI 답변 저장
#         save_message(db, conv.id, "assistant", ai_text)

#         return {"conversation_id": conv.id, "reply": ai_text}
#     except Exception as e:
#         return _json_500(e, "agent-error")
#     finally:
#         db.close()

# @app.post("/api/agent-chat")
# def agent_chat_api(req: ChatRequest):
#     return agent_chat(req)

# @app.post("/research-chat")
# def research_chat(req: ChatRequest):
#     db = SessionLocal()
#     try:
#         conv = get_or_create_conversation(db, req.user_id)
#         save_message(db, conv.id, "user", req.message)

#         ai_text = get_research_answer(req.message)

#         save_message(db, conv.id, "assistant", ai_text)
#         return {"conversation_id": conv.id, "reply": ai_text}
#     except Exception as e:
#         return _json_500(e, "research-error")
#     finally:
#         db.close()

# @app.post("/api/research-chat")
# def research_chat_api(req: ChatRequest):
#     return research_chat(req)

# # ============================================================
# # ✨ PDF 업로드 / PDF 기반 질의응답
# #    (langchain_chatbot.py 의 /upload_pdf, /pdf-chat 통합)
# # ============================================================
# @app.post("/upload_pdf")
# async def upload_pdf(file: UploadFile = File(...)):
#     # 확장자 체크
#     filename = file.filename or "document.pdf"
#     ext = filename.split(".")[-1].lower()
#     if ext != "pdf":
#         return JSONResponse(
#             status_code=400,
#             content={"error": "PDF 파일만 업로드 가능합니다."},
#         )

#     # 파일 저장 (langchain_practice/uploaded_pdfs 폴더)
#     save_path = UPLOAD_DIR / filename
#     with open(save_path, "wb") as f:
#         f.write(await file.read())

#     # 벡터 스토어 생성 + doc_id 발급
#     try:
#         doc_id = create_pdf_store(str(save_path))
#     except Exception as e:
#         return _json_500(e, "pdf-index-error")

#     return {"doc_id": doc_id, "message": "PDF 업로드 및 인덱싱 완료"}

# @app.post("/api/upload_pdf")
# async def upload_pdf_api(file: UploadFile = File(...)):
#     return await upload_pdf(file)

# @app.post("/pdf-chat")
# def pdf_chat(req: PdfChatRequest):
#     db = SessionLocal()
#     try:
#         conv = get_or_create_conversation(db, req.user_id)

#         # 사용자 메시지 저장 (어떤 문서에 대한 질문인지 표시)
#         save_message(db, conv.id, "user", f"[PDF:{req.doc_id}] {req.message}")

#         # PDF 에이전트로 질의
#         answer = ask_pdf(req.doc_id, req.message)

#         # AI 답변 저장
#         save_message(db, conv.id, "assistant", answer)

#         return {
#             "conversation_id": conv.id,
#             "doc_id": req.doc_id,
#             "reply": answer,
#         }
#     except Exception as e:
#         return _json_500(e, "pdf-chat-error")
#     finally:
#         db.close()

# @app.post("/api/pdf-chat")
# def pdf_chat_api(req: PdfChatRequest):
#     return pdf_chat(req)

# # ============================================================
# # 📜 대화 조회 (user_id 별 전체 메시지)
# # ============================================================
# @app.get("/conversations/{user_id}")
# def list_messages(user_id: str):
#     db = SessionLocal()
#     try:
#         conv = get_or_create_conversation(db, user_id)
#         msgs = (
#             db.query(Message)
#             .filter(Message.conversation_id == conv.id)
#             .order_by(Message.id.asc())
#             .all()
#         )
#         return {
#             "conversation_id": conv.id,
#             "messages": [
#                 {
#                     "id": m.id,
#                     "role": m.role,
#                     "content": m.content,
#                     "created_at": m.created_at.isoformat(),
#                 }
#                 for m in msgs
#             ],
#         }
#     finally:
#         db.close()


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
    
    # 포켓몬 데이터 자동 로드
    try:
        from backend.scripts.fetch_pokemon import ensure_pokemon_seeded
        print("[startup] Checking Pokemon data...")
        seeded = ensure_pokemon_seeded(start_id=1, end_id=151, min_count=1)
        if seeded:
            print("[startup] ✅ Pokemon data loaded successfully!")
        else:
            print("[startup] ✅ Pokemon data already exists")
    except Exception as e:
        print(f"[startup] ⚠️ Failed to load Pokemon data: {e}")




# ============================================================
# 라우터 통합
# ============================================================
from .routers import auth, room, battle, pokemon_random, drowsiness 

app.include_router(auth.router)
app.include_router(room.router)
app.include_router(battle.router)
app.include_router(pokemon_random.router)
app.include_router(drowsiness.router)


# ---- 포켓몬 프록시 (순서 중요: 다른 포켓몬 라우터보다 나중에 등록되어야 함) ----
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
