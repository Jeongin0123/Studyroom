import mysql.connector

def get_connection():
    conn = mysql.connector.connect(
        host="127.0.0.1",
        port=23306,
        user="root",
        password="1234",      # 네 비밀번호로 바꿔도 됨
        database="pokemon_db" # 아까 만든 DB 이름
    )
    return conn



