# pokemon_image.py
# PokeAPI에서 포켓몬 이미지 URL을 가져와서
# pokemon 테이블의 image_url 컬럼에 자동 저장하는 스크립트

import time
import requests
from host import get_connection


def fetch_json(url: str):
    """PokeAPI 요청 + JSON 파싱 헬퍼 함수"""
    try:
        res = requests.get(url, timeout=10)
        if res.status_code != 200:
            print(f"[요청 실패] {url} (status={res.status_code})")
            return None
        return res.json()
    except Exception as e:
        print(f"[예외 발생] {url} → {e}")
        return None


def update_pokemon_images(start_id: int = 1, end_id: int = 151):
    """
    포켓몬 id 범위를 돌면서 이미지 URL을 pokemon.image_url 에 저장
    - 우선순위 1: official-artwork 이미지
    - 우선순위 2: front_default 스프라이트
    """
    conn = get_connection()
    cursor = conn.cursor()

    for pokemon_id in range(start_id, end_id + 1):
        url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}"
        data = fetch_json(url)
        if not data:
            continue

        name = data["name"]

        # 1순위: 공식 일러스트(official-artwork)
        sprites = data.get("sprites", {})
        other = sprites.get("other", {})
        official = other.get("official-artwork", {})
        image_url = official.get("front_default")

        # 2순위: 기본 정면 스프라이트
        if not image_url:
            image_url = sprites.get("front_default")

        if not image_url:
            print(f"[경고] {pokemon_id}번 {name} 은(는) 이미지 URL을 찾지 못함")
            continue

        # DB에 업데이트
        cursor.execute(
            """
            UPDATE pokemon
            SET image_url = %s
            WHERE id = %s
            """,
            (image_url, pokemon_id),
        )
        conn.commit()

        print(f"[저장 완료] {pokemon_id}번 {name} → {image_url}")

        # PokeAPI 요청 너무 자주 안 날리게 잠깐 쉬기
        time.sleep(0.1)

    cursor.close()
    conn.close()
    print("\n=== 포켓몬 이미지 URL 업데이트 완료 ===")


if __name__ == "__main__":
    # 1~151번 포켓몬 대상으로 실행
    update_pokemon_images(1, 151)
