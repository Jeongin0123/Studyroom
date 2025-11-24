# pokemon_type.py
# 포켓몬 타입 테이블(type)과 타입 상성 테이블(type_effectiveness)을 자동 구성하는 스크립트

import requests
import time
from host import get_connection


def fetch_json(url: str):
    """HTTP 요청 + JSON 파싱 헬퍼 함수"""
    res = requests.get(url, timeout=10)
    if res.status_code != 200:
        print(f"요청 실패: {url} (status={res.status_code})")
        return None
    try:
        return res.json()
    except Exception as e:
        print(f"JSON 파싱 에러: {url} → {e}")
        return None


def insert_types_and_effectiveness():
    conn = get_connection()
    cursor = conn.cursor()

    # ------------------------------------------------------
    # 1) type 테이블 채우기 (1~18번 타입: normal ~ fairy)
    # ------------------------------------------------------
    type_ids = range(1, 19)

    print("=== type 테이블 채우는 중 ===")
    for type_id in type_ids:
        url = f"https://pokeapi.co/api/v2/type/{type_id}"
        data = fetch_json(url)
        if not data:
            continue

        name = data["name"]

        cursor.execute(
            "INSERT INTO type (id, name) VALUES (%s, %s) "
            "ON DUPLICATE KEY UPDATE name = VALUES(name)",
            (type_id, name),
        )
        print(f"{type_id}번 타입 {name} 저장 완료")

        time.sleep(0.1)

    conn.commit()

    # 이름 → id 매핑
    cursor.execute("SELECT id, name FROM type")
    rows = cursor.fetchall()
    name_to_id = {name: tid for (tid, name) in rows}

    # ------------------------------------------------------
    # 2) 기본 상성 = 모두 1.0
    # ------------------------------------------------------
    effectiveness = {}

    for atk_id in type_ids:
        for def_id in type_ids:
            effectiveness[(atk_id, def_id)] = 1.0

    # ------------------------------------------------------
    # 3) damage_relations 적용
    # ------------------------------------------------------
    print("\n=== 타입별 damage_relations 적용 ===")
    for atk_id in type_ids:
        url = f"https://pokeapi.co/api/v2/type/{atk_id}"
        data = fetch_json(url)
        if not data:
            continue

        atk_name = data["name"]
        rel = data["damage_relations"]

        def apply_multiplier(type_list, mul):
            for t in type_list:
                def_name = t["name"]
                def_id = name_to_id.get(def_name)
                if def_id is None:
                    continue
                effectiveness[(atk_id, def_id)] = mul

        apply_multiplier(rel["double_damage_to"], 2.0)
        apply_multiplier(rel["half_damage_to"], 0.5)
        apply_multiplier(rel["no_damage_to"], 0.0)

        print(f"{atk_name} 타입 상성 적용 완료")
        time.sleep(0.1)

    # ------------------------------------------------------
    # 4) type_effectiveness 테이블에 저장
    # ------------------------------------------------------
    print("\n=== type_effectiveness 테이블 저장 ===")
    cursor.execute("TRUNCATE TABLE type_effectiveness")

    for (atk_id, def_id), mul in effectiveness.items():
        cursor.execute(
            """
            INSERT INTO type_effectiveness
            (attacker_type_id, defender_type_id, multiplier)
            VALUES (%s, %s, %s)
            """,
            (atk_id, def_id, mul),
        )

    conn.commit()
    cursor.close()
    conn.close()
    print("\n=== 타입 상성 테이블 생성 완료 ===")


if __name__ == "__main__":
    insert_types_and_effectiveness()
