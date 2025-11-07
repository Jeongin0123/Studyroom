# backend/main.py
from fastapi import FastAPI
from .database import engine, Base
from .models import *  # 위에서 만든 것들 전부 import
from .routers import auth 

app = FastAPI()
app.include_router(auth.router)

# 앱 시작할 때 테이블 없으면 생성
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "hello studyroom"}