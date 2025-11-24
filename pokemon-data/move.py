import requests
from host import get_connection   # 네가 이미 만든 DB 연결 함수

def insert_move_data():
    conn = get_connection()
    cursor = conn.cursor()

    # 🔥 실전용: 1 ~ 600번 기술 정보 저장
    for move_id in range(1, 901):
        url = f"https://pokeapi.co/api/v2/move/{move_id}"
        response = requests.get(url)

        # 없거나 삭제된 기술은 건너뛰기
        if response.status_code != 200:
            print(f"{move_id}번 기술 없음 → 건너뜀")
            continue

        data = response.json()

        name = data["name"]
        power = data["power"]          # 없으면 None
        accuracy = data["accuracy"]    # 없으면 None
        pp = data["pp"]
        damage_class = data["damage_class"]["name"]
        type_name = data["type"]["name"]

        sql = """
        INSERT INTO move (id, name, power, accuracy, pp, damage_class, type)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(sql, (
            move_id, name, power, accuracy, pp, damage_class, type_name
        ))

        print(f"{move_id}번 기술 {name} 저장 완료")

    conn.commit()
    cursor.close()
    conn.close()


if __name__ == "__main__":
    insert_move_data()
