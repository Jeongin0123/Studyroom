# backend/scripts/fetch_moves.py
import time
import requests
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend import models

API_BASE = "https://pokeapi.co/api/v2/move"


def _extract_description(data: dict) -> str | None:
    """
    effect_entries에서 한국어(short_effect) 우선, 없으면 영어, 둘 다 없으면 None.
    """
    entries = data.get("effect_entries", [])
    for lang in ("ko", "en"):
        for entry in entries:
            if entry.get("language", {}).get("name") == lang:
                return entry.get("short_effect") or entry.get("effect")
    return None


def fetch_and_save_moves(start_id: int = 1, end_id: int = 900, sleep: float = 0.05):
    """
    PokeAPI에서 move 정보를 가져와 move 테이블에 upsert.
    - 컬럼: id, name, power, pp, accuracy, type, damage_class, description
    - 존재하지 않는 move id는 건너뜀
    """
    db: Session = SessionLocal()

    try:
        for move_id in range(start_id, end_id + 1):
            url = f"{API_BASE}/{move_id}"
            resp = requests.get(url, timeout=10)

            if resp.status_code != 200:
                print(f"{move_id}번 기술 없음 → 건너뜀")
                continue

            data = resp.json()

            move = models.Move(
                id=move_id,
                name=data["name"],
                power=data.get("power"),
                pp=data.get("pp"),
                accuracy=data.get("accuracy"),
                type=data["type"]["name"],
                damage_class=data["damage_class"]["name"],
                description=_extract_description(data),
            )

            db.merge(move)  # 같은 PK면 update, 없으면 insert

            if move_id % 50 == 0:
                db.commit()
                print(f"... {move_id}번까지 저장/업데이트 완료")

            if sleep:
                time.sleep(sleep)  # 과도한 요청 방지

        db.commit()
        print("✅ move 데이터 업데이트 완료")
    finally:
        db.close()


if __name__ == "__main__":
    fetch_and_save_moves()
