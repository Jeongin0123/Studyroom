# remind/PokemonRoute/pokemon.py
from fastapi import APIRouter, HTTPException
import httpx
from functools import lru_cache
from typing import Any, Dict, List, Optional

router = APIRouter(prefix="/pokemon", tags=["pokemon"])
BASE = "https://pokeapi.co/api/v2"


def http_error(status: int, msg: str):
    """에러를 항상 JSON 형태로 내려주기 위한 헬퍼"""
    raise HTTPException(status_code=status, detail={"ok": False, "error": msg})


def fetch_json(path: str) -> Dict[str, Any]:
    """BASE 뒤에 path를 붙여서 GET → JSON 반환"""
    url = f"{BASE}{path}"
    try:
        with httpx.Client(timeout=10.0) as c:
            r = c.get(url)
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as e:
        http_error(e.response.status_code, f"PokeAPI {e.response.status_code}: {url}")
    except (httpx.ConnectError, httpx.ReadTimeout):
        http_error(504, f"Timeout or connect error: {url}")


@lru_cache(maxsize=256)
def get_pokemon(id_or_name: str) -> Dict[str, Any]:
    """ /pokemon/{id_or_name} 결과를 캐시에 저장해서 재사용 """
    return fetch_json(f"/pokemon/{id_or_name}")


@lru_cache(maxsize=256)
def get_species(id_or_name: str) -> Dict[str, Any]:
    """ /pokemon-species/{id_or_name} 결과 캐시 """
    return fetch_json(f"/pokemon-species/{id_or_name}")


def get_json_absolute(url: str) -> Dict[str, Any]:
    """절대 URL로 직접 요청할 때 사용 (진화체인 등)"""
    try:
        with httpx.Client(timeout=10.0) as c:
            r = c.get(url)
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as e:
        http_error(e.response.status_code, f"External {e.response.status_code}: {url}")
    except (httpx.ConnectError, httpx.ReadTimeout):
        http_error(504, f"Timeout or connect error: {url}")


def simplify_evolution_chain(chain_json: Dict[str, Any]) -> List[Dict[str, Optional[Any]]]:
    """
    진화 체인을 간단한 리스트 형태로 변환.
    예) [ {"name": "bulbasaur", "min_level": None},
          {"name": "ivysaur",   "min_level": 16}, ... ]
    """
    result: List[Dict[str, Optional[Any]]] = []

    def walk(node: Dict[str, Any], via_level: Optional[int]):
        # 현재 노드(포켓몬 종) 추가
        result.append(
            {
                "name": node["species"]["name"],
                "min_level": via_level,
            }
        )
        # 다음 단계로 재귀
        for nxt in node.get("evolves_to", []):
            details = nxt.get("evolution_details", [])
            min_level = None
            if details:
                min_level = details[0].get("min_level")
            walk(nxt, min_level)

    walk(chain_json["chain"], None)
    return result


def safe(obj: Optional[Dict[str, Any]], *path: str, default=None):
    """
    중첩 dict에서 안전하게 키를 따라가며 꺼내는 헬퍼.
    중간에 None이 나오면 default 반환.
    """
    cur: Any = obj
    for k in path:
        if cur is None:
            return default
        cur = cur.get(k)
        if cur is None:
            return default
    return cur if cur is not None else default


@router.get("/{id_or_name}")
def pokemon_basic(id_or_name: str):
    """
    가장 기본 버전: id, name 만 제공
    (기존 간단 엔드포인트 유지용)
    """
    p = get_pokemon(id_or_name)
    return {
        "ok": True,
        "data": {
            "id": p["id"],
            "name": p["name"],
        },
    }


@router.get("/{id_or_name}/full")
def pokemon_full(id_or_name: str):
    """
    스터디룸 프로젝트에서 사용할 간단 확장 버전.
    포켓몬에 과하게 집착하지 않도록 최소 구성만 포함:

    - 기본: id, name
    - 타입 목록
    - 능력(히든 여부 포함)
    - 공식 일러스트 스프라이트
    - 일부 스탯 (hp, attack 정도만)
    - 종 정보: 색, 성장률, 포획률
    - 진화 체인(간단 버전)
    """
    p = get_pokemon(id_or_name)
    s = get_species(id_or_name)

    # 진화체인 정보 가져오기
    evo_url = s["evolution_chain"]["url"]
    evo_json = get_json_absolute(evo_url)

    # 전체 스탯에서 hp, attack만 추려서 사용
    stat_map = {st["stat"]["name"]: st["base_stat"] for st in p.get("stats", [])}
    stats: Dict[str, int] = {}
    for key in ("hp", "attack"):
        if key in stat_map:
            stats[key] = stat_map[key]

    data = {
        "id": p["id"],
        "name": p["name"],
        "types": [t["type"]["name"] for t in p.get("types", [])],
        "abilities": [
            {
                "name": a["ability"]["name"],
                "hidden": a.get("is_hidden", False),
            }
            for a in p.get("abilities", [])
        ],
        "sprites": {
            # 공식 일러스트만 사용 (기본 front_default는 생략)
            "official_artwork": safe(
                p, "sprites", "other", "official-artwork", "front_default"
            ),
        },
        "stats": stats,
        "species": {
            "color": safe(s, "color", "name"),
            "growth_rate": safe(s, "growth_rate", "name"),
            "capture_rate": s.get("capture_rate"),
        },
        "evolution_chain": simplify_evolution_chain(evo_json),
    }

    return {"ok": True, "data": data}
