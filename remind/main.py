# remind/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from PokemonRoute import pokemon, focus_rules

app = FastAPI()

# ✅ 프런트엔드(React 3000) CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 라우터 등록
app.include_router(pokemon.router)
app.include_router(focus_rules.router)

# ✅ 서버 상태 확인용
@app.get("/")
def ping():
    return {"ok": True}
