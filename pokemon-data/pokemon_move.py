# pokemon_move.py
# 포켓몬(1~151)이 배울 수 있는 기술 목록을 조회해서
# 공격용 기술 중에서 점수가 높은 것 4개를 골라
# pokemon_move 테이블에 자동으로 넣어주는 스크립트

import requests
import time
from host import get_connection


def get_move_detail(move_url, cache):
    """
    기술 상세 정보를 가져와서 캐시에 저장하고, 이후에는 재사용한다.
    """
    if move_url in cache:
        return cache[move_url]

    try:
        res = requests.get(move_url, timeout=10)
        if res.status_code != 200:
            return None
        data = res.json()
    except Exception:
        return None

    cache[move_url] = data
    # 너무 많은 요청으로 차단되지 않게 잠깐 대기
    time.sleep(0.1)
    return data


def insert_pokemon_moves():
    conn = get_connection()
    cursor = conn.cursor()

    # 기술 상세 정보는 여러 번 재사용하므로 캐시에 저장
    move_cache = {}

    # 1번 ~ 151번 포켓몬을 대상으로 처리
    for pokemon_id in range(1, 152):
        print(f"\n=== {pokemon_id}번 포켓몬 처리 중 ===")

        # 포켓몬 기본 정보 요청
        poke_url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}"

        try:
            res = requests.get(poke_url, timeout=10)
            if res.status_code != 200:
                print(f"{pokemon_id}번 포켓몬 요청 실패 (상태코드 {res.status_code})")
                continue
            pokemon_data = res.json()
        except Exception as e:
            print(f"{pokemon_id}번 포켓몬 요청/파싱 에러: {e}")
            continue

        name = pokemon_data["name"]
        # 예: ['grass', 'poison']
        types = [t["type"]["name"] for t in pokemon_data["types"]]

        candidates = []

        # 이 포켓몬이 배울 수 있는 모든 기술 순회
        for m in pokemon_data["moves"]:
            move_name = m["move"]["name"]
            move_url = m["move"]["url"]

            move_detail = get_move_detail(move_url, move_cache)
            if not move_detail:
                continue

            power = move_detail["power"]                  # 위력
            damage_class = move_detail["damage_class"]["name"]  # physical / special / status
            move_type = move_detail["type"]["name"]

            # 위력이 없거나(보조기) 상태기(status)이면 배틀용 공격 기술로 보지 않고 제외
            if power is None or damage_class == "status":
                continue

            # 타입 일치(STAB)이면 가중치를 조금 더 줌
            stab_bonus = 1.5 if move_type in types else 1.0
            score = power * stab_bonus

            candidates.append({
                "name": move_name,
                "score": score,
            })

        if not candidates:
            print(f"{pokemon_id}번 {name} 은(는) 공격 기술 후보가 없음")
            continue

        # 점수가 높은 순으로 정렬해서 상위 4개를 핵심 기술로 선택
        candidates.sort(key=lambda x: x["score"], reverse=True)
        top_moves = candidates[:4]

        print(f"{name} 추천 기술 4개:", [m["name"] for m in top_moves])

        # 선택된 기술들을 pokemon_move 테이블에 저장
        for m in top_moves:
            move_name = m["name"]

            # move 테이블에서 id 찾기
            cursor.execute("SELECT id FROM move WHERE name = %s", (move_name,))
            row = cursor.fetchone()

            if not row:
                print(f"  - 경고: move 테이블에 '{move_name}' 없음 → 건너뜀")
                continue

            move_id = row[0]

            # 이미 같은 (pokemon_id, move_id)가 있으면 무시
            cursor.execute(
                """
                INSERT IGNORE INTO pokemon_move (pokemon_id, move_id, learn_level)
                VALUES (%s, %s, %s)
                """,
                (pokemon_id, move_id, 1)
            )

        # 포켓몬 하나 처리할 때마다 저장
        conn.commit()

    cursor.close()
    conn.close()
    print("\n=== pokemon_move 자동 배정 완료 ===")


if __name__ == "__main__":
    insert_pokemon_moves()
