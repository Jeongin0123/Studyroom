# app_ai_chat.py
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import os

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

router = APIRouter(prefix="/ai-chat", tags=["AI Chat"])

class AIChatIn(BaseModel):
    room_id: str | None = None
    message: str

class AIChatOut(BaseModel):
    reply: str
    created_at: str

SYSTEM = "당신은 스터디룸의 학습 보조 AI입니다. 친절하고 간결하게 답하세요."
model_name = os.getenv("OPENAI_MODEL", "gpt-4o")
llm = ChatOpenAI(model=model_name, temperature=0.2)

@router.post("/message", response_model=AIChatOut)
async def ai_message(body: AIChatIn):
    resp = await llm.ainvoke([SystemMessage(content=SYSTEM), HumanMessage(content=body.message)])
    return AIChatOut(reply=resp.content, created_at=datetime.utcnow().isoformat())
