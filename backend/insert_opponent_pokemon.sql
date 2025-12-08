-- 상대방 포켓몬 (ID 45번) 추가
-- 사용자 ID는 본인의 user_id로 변경하세요

-- 1. 현재 사용자 확인 (본인의 user_id 확인)
SELECT user_id, username FROM User;

-- 2. UserPokemon에 ID 45번으로 포켓몬 추가
-- user_id를 본인의 ID로 변경하세요 (예: 1)
INSERT INTO UserPokemon (id, user_id, poke_id, level, exp, current_hp)
VALUES (45, 1, 6, 10, 0, 100);  -- user_id=1을 본인 ID로 변경

-- 3. 확인
SELECT * FROM UserPokemon WHERE id = 45;

-- 4. (선택사항) 활성 팀에도 추가하려면
-- INSERT INTO UserActiveTeam (user_id, user_pokemon_id, slot)
-- VALUES (1, 45, 6);  -- user_id=1을 본인 ID로 변경
