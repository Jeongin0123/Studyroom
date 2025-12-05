# backend/scripts/fetch_pokemon.py
import requests
from sqlalchemy.orm import Session

from backend.database import SessionLocal  # get_db랑 비슷하게 세션 만드는 함수
from backend import models

API_BASE = "https://pokeapi.co/api/v2/pokemon"
TYPE_API = "https://pokeapi.co/api/v2/type"
MOVE_API = "https://pokeapi.co/api/v2/move"


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

            # 한국어 이름 우선, 없으면 기본 영문 이름
            species_url = f"https://pokeapi.co/api/v2/pokemon-species/{poke_id}"
            species_resp = requests.get(species_url)
            species_resp.raise_for_status()
            species_data = species_resp.json()

            korean_name = None
            for n in species_data.get("names", []):
                if n.get("language", {}).get("name") == "ko":
                    korean_name = n.get("name")
                    break

            name = korean_name or data["name"]  # 예: "이상해씨" (fallback: "bulbasaur")

            evo_chain_url = species_data.get("evolution_chain", {}).get("url")
            evo_chain_id = None
            if evo_chain_url:
                # url 예: https://pokeapi.co/api/v2/evolution-chain/1/
                try:
                    evo_chain_id = int(evo_chain_url.rstrip("/").split("/")[-1])
                except (ValueError, AttributeError):
                    evo_chain_id = None

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
            back_image_url = sprites.get("back_default")

            stats = data.get("stats", [])
            stat_lookup = {s["stat"]["name"]: s["base_stat"] for s in stats}

            # 이미 있으면 업데이트, 없으면 새로 생성 (upsert 느낌)
            pokemon = models.Pokemon(
                poke_id=poke_id,
                name=name,
                type1=type1,
                type2=type2,
                image_url=image_url,
                back_image_url=back_image_url,
                base_hp=stat_lookup.get("hp"),
                base_attack=stat_lookup.get("attack"),
                base_defense=stat_lookup.get("defense"),
                base_sp_attack=stat_lookup.get("special-attack"),
                base_sp_defense=stat_lookup.get("special-defense"),
                base_speed=stat_lookup.get("speed"),
                evolution_chain_id=evo_chain_id,
            )
            db.merge(pokemon)  # 같은 PK면 update, 아니면 insert

            # 여러 개 넣을 때는 중간중간 commit
            if poke_id % 20 == 0:
                db.commit()

        db.commit()
        print("✅ Done!")
    finally:
        db.close()


def fetch_and_save_types() -> None:
    """포켓몬 타입(1~18)을 PokeAPI에서 받아 type 테이블에 저장."""
    db: Session = SessionLocal()
    try:
        # 타입 목록 조회
        resp = requests.get(f"{TYPE_API}?limit=100")
        resp.raise_for_status()
        data = resp.json()
        results = data.get("results", [])

        # PokeAPI 타입 중 unknown/shadow(999, 10001)는 제외
        for item in results:
            name = item.get("name")
            url = item.get("url")
            if not name or not url:
                continue
            try:
                type_id = int(url.rstrip("/").split("/")[-1])
            except (ValueError, AttributeError):
                continue
            if name in {"unknown", "shadow"}:
                continue

            type_row = models.Type(id=type_id, name=name)
            db.merge(type_row)

        db.commit()
    finally:
        db.close()


def fetch_and_save_type_effectiveness() -> None:
    """타입 상성 매트릭스를 type_effectiveness 테이블에 저장."""
    db: Session = SessionLocal()
    try:
        # name -> id 매핑
        types = db.query(models.Type).all()
        name_to_id = {t.name: t.id for t in types}
        attacker_ids = list(name_to_id.values())

        for atk_name, atk_id in name_to_id.items():
            resp = requests.get(f"{TYPE_API}/{atk_id}")
            resp.raise_for_status()
            data = resp.json()
            rel = data.get("damage_relations", {})

            base = {def_id: 1.0 for def_id in attacker_ids}

            def apply(names, mult):
                for n in names or []:
                    def_id = name_to_id.get(n.get("name"))
                    if def_id:
                        base[def_id] = mult

            apply(rel.get("double_damage_to"), 2.0)
            apply(rel.get("half_damage_to"), 0.5)
            apply(rel.get("no_damage_to"), 0.0)

            for def_id, mult in base.items():
                db.merge(
                    models.TypeEffectiveness(
                        attacker_type_id=atk_id,
                        defender_type_id=def_id,
                        multiplier=mult,
                    )
                )
        db.commit()
    finally:
        db.close()


def fetch_and_save_moves(start_id: int = 1, end_id: int = 200):
    """
    move id 범위를 돌면서 move 테이블에 저장.
    기본값은 1~200까지만 받아 과도한 호출을 피함 (env로 조정 가능).
    """
    db: Session = SessionLocal()
    try:
        for move_id in range(start_id, end_id + 1):
            resp = requests.get(f"{MOVE_API}/{move_id}")
            if resp.status_code == 404:
                continue
            resp.raise_for_status()
            mv = resp.json()

            # 한국어 설명/이름 우선, 없으면 영어
            name_ko = None
            for n in mv.get("names", []):
                if n.get("language", {}).get("name") == "ko":
                    name_ko = n.get("name")
                    break

            desc = None
            for f in mv.get("flavor_text_entries", []):
                if f.get("language", {}).get("name") in ("ko", "en"):
                    desc = f.get("flavor_text")
                    if f.get("language", {}).get("name") == "ko":
                        break

            move_row = models.Move(
                id=move_id,
                name=mv.get("name"),
                name_ko=name_ko,
                power=mv.get("power"),
                pp=mv.get("pp"),
                accuracy=mv.get("accuracy"),
                type=mv.get("type", {}).get("name"),
                damage_class=mv.get("damage_class", {}).get("name") or "status",
                description=desc,
            )
            db.merge(move_row)

            if move_id % 50 == 0:
                db.commit()

        db.commit()
    finally:
        db.close()


def ensure_pokemon_seeded(start_id: int = 1, end_id: int = 151, min_count: int = 1) -> bool:
    """
    Pokemon 테이블이 비어 있으면 PokeAPI에서 데이터를 받아 채운다.
    이미 min_count 이상 존재하면 아무것도 하지 않고 False 반환.
    채웠다면 True 반환.
    """
    db: Session = SessionLocal()
    try:
        existing = db.query(models.Pokemon).count()
        if existing >= min_count:
            return False
    finally:
        db.close()

    fetch_and_save_pokemon(start_id, end_id)
    return True


if __name__ == "__main__":
    # 1세대 151마리만 예시로
    fetch_and_save_pokemon(1, 151)
