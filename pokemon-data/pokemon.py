import requests
from host import get_connection

def insert_pokemon_data():
    conn = get_connection()
    cursor = conn.cursor()

    for pokemon_id in range(1, 152):
        url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}"
        response = requests.get(url)
        data = response.json()

        # 기본 정보
        name = data["name"]

        # 종족값
        stats = data["stats"]
        base_hp = stats[0]["base_stat"]
        base_attack = stats[1]["base_stat"]
        base_defense = stats[2]["base_stat"]
        base_sp_attack = stats[3]["base_stat"]
        base_sp_defense = stats[4]["base_stat"]
        base_speed = stats[5]["base_stat"]

        # 타입
        types = data["types"]
        type1 = types[0]["type"]["name"]
        type2 = types[1]["type"]["name"] if len(types) > 1 else None

        sql = """
        INSERT INTO pokemon
        (id, name,
         base_hp, base_attack, base_defense,
         base_sp_attack, base_sp_defense, base_speed,
         type1, type2)
        VALUES (%s, %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, %s)
        """

        cursor.execute(sql, (
            pokemon_id, name,
            base_hp, base_attack, base_defense,
            base_sp_attack, base_sp_defense, base_speed,
            type1, type2
        ))

        print(f"{pokemon_id}번 {name} 저장 완료")

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    insert_pokemon_data()
