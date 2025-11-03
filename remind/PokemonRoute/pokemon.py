# remind/PokemonRoute/pokemon.py
from fastapi import APIRouter, HTTPException
import httpx
from functools import lru_cache

router = APIRouter(prefix="/pokemon", tags=["pokemon"])
BASE = "https://pokeapi.co/api/v2"

def http_error(status: int, msg: str):
    # 항상 JSON으로 떨어지도록
    raise HTTPException(status_code=status, detail={"ok": False, "error": msg})

def fetch_json(path: str):
    url = f"{BASE}{path}"
    try:
        # 인증서 검증 유지(회사/학교망에서 문제면 verify=False로 바꿔서 테스트 가능)
        with httpx.Client(timeout=10.0) as c:
            r = c.get(url)
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as e:
        http_error(e.response.status_code, f"PokeAPI {e.response.status_code}: {url}")
    except (httpx.ConnectError, httpx.ReadTimeout) as e:
        http_error(502, f"PokeAPI connect/read error: {e.__class__.__name__}")
    except Exception as e:
        http_error(502, f"PokeAPI unknown error: {type(e).__name__}")

@router.get("/species/{name_or_id}")
def species(name_or_id: str):
    return fetch_json(f"/pokemon-species/{name_or_id}")

@router.get("/evolution-chain/{chain_id}")
def evo_chain(chain_id: int):
    return fetch_json(f"/evolution-chain/{chain_id}")

@router.get("/pokemon/{name_or_id}")
def pokemon(name_or_id: str):
    return fetch_json(f"/pokemon/{name_or_id}")
