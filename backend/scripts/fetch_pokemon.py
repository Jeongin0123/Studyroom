# backend/scripts/fetch_pokemon.py
import requests
from sqlalchemy.orm import Session

from backend.database import SessionLocal  # get_db랑 비슷하게 세션 만드는 함수
from backend import models

API_BASE = "https://pokeapi.co/api/v2/pokemon"


def fetch_and_save_pokemon(start_id: int = 1, end_id: int = 151):
    """
    포켓몬 id 범위를 돌면서 이름 + 이미지 URL을 Pokemon 테이블에 저장.
    (지금은 예시로 1~151: 1세대)
    """
    db: Session = SessionLocal()

    try:
        for poke_id in range(start_id, end_id + 1):
            print(f"Fetching pokemon {poke_id}...")

            resp = requests.get(f"{API_BASE}/{poke_id}")
            resp.raise_for_status()
            data = resp.json()

            name = data["name"]  # 예: "bulbasaur"
            
            # 🔹 타입 정보 파싱 
            types = data.get("types", [])
            # slot 순서대로 정렬(원래도 보통 1,2지만 혹시 몰라서)
            types = sorted(types, key=lambda t: t["slot"])

            type1 = types[0]["type"]["name"] if len(types) > 0 else None
            type2 = types[1]["type"]["name"] if len(types) > 1 else None

            # 이미지 주소 (official-artwork 우선, 없으면 기본 front_default)
            sprites = data["sprites"]
            image_url = (
                sprites.get("other", {})
                .get("official-artwork", {})
                .get("front_default")
                or sprites.get("front_default")
            )

            stats = data.get("stats", [])
            stat_lookup = {s["stat"]["name"]: s["base_stat"] for s in stats}

            # 이미 있으면 업데이트, 없으면 새로 생성 (upsert 느낌)
            pokemon = models.Pokemon(
                poke_id=poke_id,
                name=name,
                type1=type1,
                type2=type2,
                image_url=image_url,
                base_hp=stat_lookup.get("hp"),
                base_attack=stat_lookup.get("attack"),
                base_defense=stat_lookup.get("defense"),
                base_sp_attack=stat_lookup.get("special-attack"),
                base_sp_defense=stat_lookup.get("special-defense"),
                base_speed=stat_lookup.get("speed"),
            )
            db.merge(pokemon)  # 같은 PK면 update, 아니면 insert

            # 여러 개 넣을 때는 중간중간 commit
            if poke_id % 20 == 0:
                db.commit()

        db.commit()
        print("✅ Done!")
    finally:
        db.close()


if __name__ == "__main__":
    # 1세대 151마리만 예시로
    fetch_and_save_pokemon(1, 151)
