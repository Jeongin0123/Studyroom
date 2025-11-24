# backend/scripts/fill_types.py
"""
PokeAPI에서 타입/상성 정보를 가져와
type, type_effectiveness 테이블을 채운다.
"""
import time
from typing import Dict, Tuple

import requests
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend import models


def _fetch_json(url: str) -> Dict:
    res = requests.get(url, timeout=10)
    if res.status_code != 200:
        print(f"[skip] {url} status={res.status_code}")
        return {}
    try:
        return res.json()
    except Exception as e:
        print(f"[error] JSON parse {url}: {e}")
        return {}


def fill_types():
    db: Session = SessionLocal()
    type_ids = range(1, 19)  # 1~18: normal ~ fairy

    try:
        print("=== type 테이블 채우기 ===")
        for type_id in type_ids:
            data = _fetch_json(f"https://pokeapi.co/api/v2/type/{type_id}")
            if not data:
                continue
            name = data["name"]
            db.merge(models.Type(id=type_id, name=name))
            print(f"  - {type_id}: {name}")
            time.sleep(0.05)
        db.commit()

        # 이름 → id 매핑
        name_to_id = {t.name: t.id for t in db.query(models.Type).all()}

        # 기본값 1.0
        effectiveness: Dict[Tuple[int, int], float] = {}
        for atk in type_ids:
            for de in type_ids:
                effectiveness[(atk, de)] = 1.0

        print("=== damage_relations 적용 ===")
        for atk_id in type_ids:
            data = _fetch_json(f"https://pokeapi.co/api/v2/type/{atk_id}")
            if not data:
                continue
            rel = data["damage_relations"]

            def apply(list_name: str, mul: float):
                for t in rel.get(list_name, []):
                    def_id = name_to_id.get(t["name"])
                    if def_id:
                        effectiveness[(atk_id, def_id)] = mul

            apply("double_damage_to", 2.0)
            apply("half_damage_to", 0.5)
            apply("no_damage_to", 0.0)
            print(f"  - atk {atk_id} 적용 완료")
            time.sleep(0.05)

        print("=== type_effectiveness 저장 ===")
        db.query(models.TypeEffectiveness).delete()
        for (atk_id, def_id), mul in effectiveness.items():
            db.add(
                models.TypeEffectiveness(
                    attacker_type_id=atk_id,
                    defender_type_id=def_id,
                    multiplier=mul,
                )
            )
        db.commit()
        print("✅ 완료")
    finally:
        db.close()


if __name__ == "__main__":
    fill_types()
