from database import SessionLocal
import models

db = SessionLocal()

# 포켓몬 몇 개 확인
pokemons = db.query(models.Pokemon).limit(5).all()

print("=== Pokemon base_hp 확인 ===")
for p in pokemons:
    print(f"ID: {p.poke_id}, Name: {p.name}, base_hp: {p.base_hp}")

db.close()
