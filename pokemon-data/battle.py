# battle.py
# 포켓몬 배틀 데미지 계산 테스트 스크립트
# - DB에서 포켓몬 / 기술 정보를 읽어와서
#   "타입에 상관없이" 한 번의 공격 데미지를 계산하는 예시

import random
from host import get_connection


# -----------------------------
# DB에서 정보 가져오기 함수들
# -----------------------------
def get_pokemon(cursor, pokemon_id: int) -> dict:
    """포켓몬 한 마리 정보 가져오기"""
    sql = """
    SELECT id, name,
           base_hp,
           base_attack, base_defense,
           base_sp_attack, base_sp_defense,
           base_speed,
           type1, type2
    FROM pokemon
    WHERE id = %s
    """
    cursor.execute(sql, (pokemon_id,))
    row = cursor.fetchone()
    if not row:
        raise ValueError(f"pokemon_id={pokemon_id} 포켓몬을 찾을 수 없음")

    return {
        "id": row[0],
        "name": row[1],
        "hp": row[2],
        "atk": row[3],
        "def": row[4],
        "sp_atk": row[5],
        "sp_def": row[6],
        "speed": row[7],
        "type1": row[8],
        "type2": row[9],
    }


def get_move(cursor, move_id: int) -> dict:
    """기술 정보 가져오기"""
    sql = """
    SELECT id, name,
           power,
           damage_class,   -- 'physical' / 'special' / 'status'
           type            -- 기술 타입 (fire, water, grass ...)
    FROM move
    WHERE id = %s
    """
    cursor.execute(sql, (move_id,))
    row = cursor.fetchone()
    if not row:
        raise ValueError(f"move_id={move_id} 기술을 찾을 수 없음")

    return {
        "id": row[0],
        "name": row[1],
        "power": row[2],
        "damage_class": row[3],
        "type": row[4],
    }


# 아래 두 함수(get_type_id, get_type_multiplier)는
# 지금은 사용하지 않지만, 나중에 타입 상성을 다시 켜고 싶을 때 쓸 수 있음.
def get_type_id(cursor, type_name: str) -> int:
    """type 테이블에서 타입 이름 → id 로 변환"""
    if type_name is None:
        raise ValueError("타입 이름이 None 입니다.")

    sql = "SELECT id FROM type WHERE name = %s"
    cursor.execute(sql, (type_name,))
    row = cursor.fetchone()
    if not row:
        raise ValueError(f"type '{type_name}' 을(를) type 테이블에서 찾을 수 없음")
    return row[0]


def get_type_multiplier(cursor, move_type: str,
                        def_type1: str | None,
                        def_type2: str | None) -> float:
    """(현재는 사용 안 함) 공격 타입 vs 방어 타입1,2 상성 배율 계산"""
    atk_id = get_type_id(cursor, move_type)

    def mul_for(def_type: str | None) -> float:
        if def_type is None:
            return 1.0
        def_id = get_type_id(cursor, def_type)
        sql = """
        SELECT multiplier
        FROM type_effectiveness
        WHERE attacker_type_id = %s AND defender_type_id = %s
        """
        cursor.execute(sql, (atk_id, def_id))
        row = cursor.fetchone()
        return row[0] if row else 1.0

    m1 = mul_for(def_type1)
    m2 = mul_for(def_type2)
    return m1 * m2


# -----------------------------
# 데미지 계산 로직
# -----------------------------
def calc_damage(attacker: dict,
                defender: dict,
                move: dict,
                type_multiplier: float,
                level: int = 50) -> int:
    """
    단순화된 포켓몬 데미지 공식 (타입 영향 전부 제거 버전)

    base = (((2L/5+2) * Power * Atk / Def) / 50) + 2
    최종 = base * 랜덤(0.85~1.0)

    ※ STAB, 타입 상성 배율(type_multiplier)은 전부 무시함.
    """

    power = move["power"]
    if power is None or power == 0:
        # 위력이 없는 보조기술(status) 등
        return 0

    # 물리 / 특수에 따라 능력치 선택
    if move["damage_class"] == "physical":
        atk_stat = attacker["atk"]
        def_stat = defender["def"]
    elif move["damage_class"] == "special":
        atk_stat = attacker["sp_atk"]
        def_stat = defender["sp_def"]
    else:
        # damage_class 가 status 이면 데미지 0으로 처리
        return 0

    # 기본 데미지 (공식 단순화 버전)
    base = (((2 * level / 5 + 2) * power * atk_stat / def_stat) / 50) + 2

    # ✅ 타입 관련 요소 전부 끄기
    stab = 1.0              # STAB 보너스 사용 안 함
    type_multiplier = 1.0   # 타입 상성도 항상 1배로 고정

    # 랜덤 보정 (0.85 ~ 1.0)
    rand = random.uniform(0.85, 1.0)

    damage = base * stab * type_multiplier * rand

    # 최소 1 이상으로 보장
    return max(1, int(damage))


# -----------------------------
# 테스트용 main 함수
# -----------------------------
def main():
    conn = get_connection()
    cursor = conn.cursor()

    # 예시: 6번 리자몽이 3번 이상해꽃 공격
    attacker_id = 6   # charizard
    defender_id = 3   # venusaur

    attacker = get_pokemon(cursor, attacker_id)
    defender = get_pokemon(cursor, defender_id)

    # 공격자가 가진 기술 중 첫 번째 기술 하나 가져오기
    cursor.execute(
        "SELECT move_id FROM pokemon_move WHERE pokemon_id = %s LIMIT 1",
        (attacker_id,)
    )
    row = cursor.fetchone()
    if not row:
        raise ValueError("해당 포켓몬에게 배정된 기술이 없습니다.")
    move_id = row[0]
    move = get_move(cursor, move_id)

    # ✅ 타입 상성 무시: 항상 1배로 고정
    type_mul = 1.0

    damage = calc_damage(attacker, defender, move, type_mul, level=50)

    print("=== 배틀 데미지 계산 테스트 (타입 무시 버전) ===")
    print(f"공격 포켓몬 : {attacker['name']} (ID {attacker_id})")
    print(f"방어 포켓몬 : {defender['name']} (ID {defender_id})")
    print(f"사용 기술   : {move['name']} (타입: {move['type']}, 분류: {move['damage_class']})")
    print(f"타입 상성   : {type_mul} (항상 1배, 데미지에 영향 없음)")
    print(f"예상 데미지 : {damage}")

    cursor.close()
    conn.close()


if __name__ == "__main__":
    main()
