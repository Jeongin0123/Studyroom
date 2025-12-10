# backend/routers/battle_moves_api.py
"""PokeAPI에서 포켓몬 기술을 동적으로 가져오는 헬퍼 함수"""
import random
import requests
from typing import List
from fastapi import HTTPException, status
from .. import models


def fetch_moves_from_pokeapi(poke_id: int) -> List[dict]:
    """PokeAPI에서 해당 포켓몬의 공격 기술을 가져와서 4개 선택"""
    try:
        # PokeAPI에서 포켓몬 정보 가져오기
        response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{poke_id}")
        response.raise_for_status()
        pokemon_data = response.json()
        
        # 포켓몬이 배울 수 있는 기술 목록
        move_list = pokemon_data.get("moves", [])
        if not move_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이 포켓몬은 배울 수 있는 기술이 없습니다.",
            )
        
        # 각 기술의 상세 정보 가져오기
        move_details = []
        for move_entry in move_list[:50]:  # 최대 50개만 확인 (성능)
            move_url = move_entry["move"]["url"]
            try:
                move_response = requests.get(move_url)
                move_response.raise_for_status()
                move_data = move_response.json()
                
                # 공격 기술만 선택 (power가 있고 damage_class가 status가 아닌 것)
                power = move_data.get("power")
                damage_class = move_data.get("damage_class", {}).get("name")
                
                if power and power > 0 and damage_class != "status":
                    # 한글 이름 찾기
                    name_ko = move_data["name"]
                    for name_entry in move_data.get("names", []):
                        if name_entry.get("language", {}).get("name") == "ko":
                            name_ko = name_entry.get("name", move_data["name"])
                            break
                    
                    move_info = {
                        "id": move_data["id"],
                        "name": move_data["name"],
                        "name_ko": name_ko,
                        "power": power,
                        "pp": move_data.get("pp", 10),
                        "accuracy": move_data.get("accuracy", 100),
                        "damage_class": damage_class,
                        "type": move_data.get("type", {}).get("name", "normal"),
                    }
                    move_details.append(move_info)
                    
                    if len(move_details) >= 20:  # 충분한 후보 확보
                        break
            except Exception as e:
                print(f"기술 정보 가져오기 실패: {move_url}, {e}")
                continue
        
        if not move_details:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="공격 기술 후보가 존재하지 않습니다.",
            )
        
        # 4개 선택 로직
        chosen: list[dict] = []
        chosen_ids: set[int] = set()
        
        # 1. 강력한 기술 (100-150)
        strong_candidates = [m for m in move_details if 100 <= m["power"] <= 150]
        if strong_candidates:
            strong_random = random.choice(strong_candidates)
            chosen.append(strong_random)
            chosen_ids.add(strong_random["id"])
        
        # 2. 약한 기술 (1-40)
        weak_candidates = [m for m in move_details if 1 <= m["power"] <= 40 and m["id"] not in chosen_ids]
        if weak_candidates:
            weak_random = random.choice(weak_candidates)
            chosen.append(weak_random)
            chosen_ids.add(weak_random["id"])
        
        # 3. 물리 기술
        physical_candidates = [
            m for m in move_details
            if m["damage_class"] == "physical" and m["id"] not in chosen_ids
        ]
        if physical_candidates:
            physical_random = random.choice(physical_candidates)
            chosen.append(physical_random)
            chosen_ids.add(physical_random["id"])
        
        # 4. 특수 기술
        special_candidates = [
            m for m in move_details
            if m["damage_class"] == "special" and m["id"] not in chosen_ids
        ]
        if special_candidates:
            special_random = random.choice(special_candidates)
            chosen.append(special_random)
            chosen_ids.add(special_random["id"])
        
        # 4개 미만이면 랜덤으로 채우기
        while len(chosen) < 4:
            remaining = [m for m in move_details if m["id"] not in chosen_ids]
            if not remaining:
                break
            extra = random.choice(remaining)
            chosen.append(extra)
            chosen_ids.add(extra["id"])
        
        return chosen
    
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PokeAPI 호출 실패: {str(e)}",
        )
