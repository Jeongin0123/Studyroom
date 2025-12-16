import { Button } from "./ui/button";
import { useEffect, useState, useRef } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import battleZoneBg from "../assets/zone.png";
import expoke from "../assets/expoke.png";

interface BattleZonePanelProps {
  battleData: any;
  myHp: number;
  opponentHp: number;
  onHpChange: (myHp: number, opponentHp: number) => void;
  onBattleEnd: (result: 'win' | 'lose') => void;
}

export function BattleZonePanel({ battleData, myHp, opponentHp, onHpChange, onBattleEnd }: BattleZonePanelProps) {
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [myMoves, setMyMoves] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // 최대 HP를 useRef로 저장 (한 번만 설정)
  const maxMyHpRef = useRef<number>(0);
  const maxOpponentHpRef = useRef<number>(0);

  // 첫 번째 유효한 HP 값으로 최대 HP 설정
  if (maxMyHpRef.current === 0 && myHp > 0) {
    maxMyHpRef.current = myHp;
    console.log('[Battle] Max My HP set:', myHp);
  }
  if (maxOpponentHpRef.current === 0 && opponentHp > 0) {
    maxOpponentHpRef.current = opponentHp;
    console.log('[Battle] Max Opponent HP set:', opponentHp);
  }

  const maxMyHp = maxMyHpRef.current;
  const maxOpponentHp = maxOpponentHpRef.current;

  useEffect(() => {
    console.log('[Battle] HP values:', { maxMyHp, maxOpponentHp, currentMyHp: myHp, currentOpponentHp: opponentHp });
  }, [maxMyHp, maxOpponentHp, myHp, opponentHp]);

  // 배틀 데이터 로드
  // useEffect(() => {
  //   const storedData = sessionStorage.getItem('battleData');
  //   if (storedData) {
  //       const data = JSON.parse(storedData);
  //       console.log('[Battle Room] Loaded battle data:', data);
  //       setBattleData(data);
  //       setMyMoves(data.myMoves || []);
  //   }
  // }, [battleData]);

  useEffect(() => {
    console.log('[DEBUG] battleData updated:', battleData);
  }, [battleData]);

  // WebSocket 연결 backend url로 접근
  useEffect(() => {
    if (!battleData?.battleId || !battleData?.myUserId) return;

    const roomId = `battle_${battleData.battleId}`;
    const userId = battleData.myUserId;
    const ws = new WebSocket(`ws://localhost:8000/ws/battle/${roomId}/${userId}`);

    ws.onopen = () => {
      console.log('[Battle WebSocket] Connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[Battle WebSocket] Received:', data);

      if (data.type === 'battle_attack_received') {
        // 상대방 공격 수신
        handleOpponentAttack(data.attack_data);
      } else if (data.type === 'battle_result') {
        // 배틀 결과 수신
        onBattleEnd(data.result);
      }
    };

    ws.onerror = (error) => {
      console.error('[Battle WebSocket] Error:', error);
    };

    ws.onclose = () => {
      console.log('[Battle WebSocket] Disconnected');
    };

    wsRef.current = ws;

    // return () => {
    //   if (wsRef.current) {
    //     wsRef.current.close();
    //   }
    // };
  }, [battleData]);

  useEffect(() => {
    if (battleData?.myMoves) {
      setMyMoves(battleData.myMoves);
    }
  }, [battleData]);

  // 스피드 기반 초기 턴 설정
  useEffect(() => {
    if (battleData?.first_turn_user_pokemon_id && battleData?.myUserPokemonId) {
      const isMyTurnFirst = battleData.first_turn_user_pokemon_id === battleData.myUserPokemonId;
      setIsMyTurn(isMyTurnFirst);
      console.log('[Battle] Initial turn set:', isMyTurnFirst ? 'My turn' : 'Opponent turn');
      console.log('[Battle] First turn pokemon ID:', battleData.first_turn_user_pokemon_id);
      console.log('[Battle] My pokemon ID:', battleData.myUserPokemonId);
    }
  }, [battleData?.first_turn_user_pokemon_id, battleData?.myUserPokemonId]);

  // 기술 위력을 "강함", "보통", "약함"으로 분류하는 함수
  const getPowerLabel = (move: any, allMoves: any[]) => {
    if (!move.power || allMoves.length === 0) return "보통";

    // 모든 기술의 위력을 내림차순으로 정렬
    const sortedPowers = allMoves
      .map(m => m.power || 0)
      .sort((a, b) => b - a);

    const currentPower = move.power;

    // 가장 높은 위력 = 강함
    if (currentPower === sortedPowers[0]) {
      return "강함";
    }
    // 가장 낮은 위력 = 약함
    else if (currentPower === sortedPowers[sortedPowers.length - 1]) {
      return "약함";
    }
    // 중간 두 개 = 보통
    else {
      return "보통";
    }
  };

  // 상대방 공격 처리
  const handleOpponentAttack = async (attackData: any) => {
    console.log('[Battle] Opponent attack received:', attackData);

    // 양쪽 HP 모두 업데이트 (백엔드에서 받은 정확한 값 사용)
    if (attackData.player_a_current_hp !== null && attackData.player_b_current_hp !== null) {
      const isPlayerA = battleData.myUserPokemonId === battleData.player_a_user_pokemon_id;

      const newMyHp = isPlayerA ? attackData.player_a_current_hp : attackData.player_b_current_hp;
      const newOpponentHp = isPlayerA ? attackData.player_b_current_hp : attackData.player_a_current_hp;

      onHpChange(newMyHp, newOpponentHp);
      console.log('[Battle] HP synchronized after opponent attack:', { myHp: newMyHp, opponentHp: newOpponentHp });

      // 배틀 종료 체크
      if (newMyHp <= 0) {
        onBattleEnd('lose');
        // WebSocket으로 결과 전송
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'battle_result',
            opponent_id: battleData.opponentUserId,
            result: 'lose'
          }));
        }
        return;
      }
    }

    // 내 턴으로 전환
    setIsMyTurn(true);
  };

  // 기술 버튼 클릭 핸들러
  const handleMoveClick = async (move: any) => {
    if (!battleData || !isMyTurn) return;

    try {
      console.log('[Battle] Using move:', move);

      const response = await fetch('/api/battle/damage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battle_id: battleData.battleId,
          attacker_user_pokemon_id: battleData.myUserPokemonId,
          defender_user_pokemon_id: battleData.opponentUserPokemonId,
          move_id: move.move_id
        })
      });

      if (!response.ok) {
        throw new Error(`Damage API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Battle] Damage response:', data);

      // 양쪽 HP 모두 업데이트 (백엔드에서 받은 정확한 값 사용)
      if (data.player_a_current_hp !== null && data.player_b_current_hp !== null) {
        // battleData에서 내가 player_a인지 player_b인지 확인
        const isPlayerA = battleData.myUserPokemonId === battleData.player_a_user_pokemon_id;

        const newMyHp = isPlayerA ? data.player_a_current_hp : data.player_b_current_hp;
        const newOpponentHp = isPlayerA ? data.player_b_current_hp : data.player_a_current_hp;

        onHpChange(newMyHp, newOpponentHp);
        console.log('[Battle] HP synchronized:', { myHp: newMyHp, opponentHp: newOpponentHp });

        // WebSocket으로 상대방에게 공격 알림
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'battle_attack',
            opponent_id: battleData.opponentUserId,
            attack_data: data
          }));
          console.log('[Battle] Attack sent to opponent via WebSocket');
        }

        // 배틀 종료 체크
        if (newOpponentHp <= 0) {
          onBattleEnd('win');
          // WebSocket으로 결과 전송
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'battle_result',
              opponent_id: battleData.opponentUserId,
              result: 'win'
            }));
          }
          return;
        }
      }

      // 턴 전환 (상대방 턴)
      setIsMyTurn(false);
    } catch (error) {
      console.error('[Battle] Failed to use move:', error);
      alert('기술 사용 중 오류가 발생했습니다.');
    }
  };

  if (!battleData) {
    return (
      <div className="h-full bg-gradient-to-br from-white to-white backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100/70 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡⚡⚡</div>
          <h2 className="text-transparent bg-clip-text bg-gradient-to-b from-blue-600 via-sky-600 to-indigo-600">
            Battle Zone
          </h2>
          <div className="text-4xl mt-4">⚡⚡⚡</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-white via-white to-blue-50/40 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100/70 p-4 flex flex-col space-y-4">
      {/* 상대방 포켓몬 카드 */}
      <div className="flex items-center gap-3 bg-white/85 rounded-xl p-3 border border-blue-100 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden">
          <ImageWithFallback
            src={battleData?.opponentPokemon?.poke_id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${battleData.opponentPokemon.poke_id}.png` : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"}
            alt="상대 포켓몬"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-sm">
          <div className="font-bold text-gray-800">{battleData?.opponentPokemon?.user_nickname || '상대방 닉네임'}</div>
          <div className="text-gray-600">스터디몬: {battleData?.opponentPokemon?.name || '피카츄'}</div>
          <div className="text-gray-600">타입: {battleData?.opponentPokemon?.type1 || '전기'}{battleData?.opponentPokemon?.type2 ? ` / ${battleData.opponentPokemon.type2}` : ''}</div>
          <div className="text-gray-600">LEVEL: {battleData?.opponentPokemon?.level || '?'}</div>
        </div>
      </div>

      {/* 배틀 필드 */}
      <div className="relative w-full flex-1" style={{ aspectRatio: "1032 / 701" }}>
        <img
          src={battleZoneBg}
          alt="Battle field"
          className="absolute inset-0 w-full h-full object-contain"
        />
        {(() => {
          const BG_WIDTH = 6792;
          const BG_HEIGHT = 4772;
          const toPercent = (x: number, y: number) => ({
            left: `${(x / BG_WIDTH) * 100}%`,
            top: `${(y / BG_HEIGHT) * 100}%`,
          });

          const overlays = {
            p1: {
              spritePos: toPercent(4821, 2213),
              hpPos: toPercent(4700, 1200),
              sprite: battleData?.opponentPokemon?.poke_id
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${battleData.opponentPokemon.poke_id}.png`
                : expoke,
            },
            p2: {
              spritePos: toPercent(1591, 4138),
              hpPos: toPercent(3900, 4138),
              sprite: battleData?.myPokemon?.poke_id
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${battleData.myPokemon.poke_id}.png`
                : expoke,
            },
            vs: {
              pos: toPercent(1500, 2213),
            },
          };

          return (
            <>
              {/* 상대방 포켓몬 (위쪽) */}
              <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ ...overlays.p1.spritePos }}>
                <img src={overlays.p1.sprite} alt="p1" className="w-14 h-14 object-contain drop-shadow" />
              </div>
              <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ ...overlays.p1.hpPos }}>
                <div style={{ width: "200px" }}>
                  <div className="text-xs mb-1 font-bold text-blue-800">HP</div>
                  <div className="flex gap-0.5">
                    {(() => {
                      const hpPercentage = (opponentHp / maxOpponentHp) * 100;
                      const filledBars = Math.ceil((hpPercentage / 100) * 20);

                      return Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-3 flex-1 border border-blue-300"
                          style={{
                            backgroundColor: i < filledBars ? '#ef4444' : '#ffffff'
                          }}
                        />
                      ));
                    })()}
                  </div>
                  <div className="text-xs text-right font-mono text-blue-900">{opponentHp}/{maxOpponentHp}</div>
                </div>
              </div>

              {/* 내 포켓몬 (아래쪽) */}
              <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ ...overlays.p2.spritePos }}>
                <img src={overlays.p2.sprite} alt="p2" className="w-14 h-14 object-contain drop-shadow" />
              </div>
              <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ ...overlays.p2.hpPos }}>
                <div style={{ width: "200px" }}>
                  <div className="text-xs mb-1 font-bold text-blue-800">HP</div>
                  <div className="flex gap-0.5">
                    {(() => {
                      const hpPercentage = (myHp / maxMyHp) * 100;
                      const filledBars = Math.ceil((hpPercentage / 100) * 20);

                      return Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-3 flex-1 border border-blue-300"
                          style={{
                            backgroundColor: i < filledBars ? '#ef4444' : '#ffffff'
                          }}
                        />
                      ));
                    })()}
                  </div>
                  <div className="text-xs text-right font-mono text-blue-900">{myHp}/{maxMyHp}</div>
                </div>
              </div>

              {/* VS */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl text-blue-800 font-black italic"
                style={{ left: overlays.vs.pos.left, top: overlays.vs.pos.top }}
              >
                VS
              </div>
            </>
          );
        })()}
      </div>

      {/* 턴 표시 */}
      <div className="text-center">
        <div className={`text-sm font-bold ${isMyTurn ? 'text-green-600' : 'text-gray-400'}`}>
          {isMyTurn ? '내 턴!' : '상대방 턴...'}
        </div>
      </div>

      {/* 기술 버튼 */}
      <div className="grid grid-cols-2 gap-2">
        {myMoves.length > 0 ? (
          myMoves.map((move, index) => (
            <Button
              key={index}
              variant="outline"
              className="rounded-xl border-2 border-blue-100 bg-white hover:bg-blue-50 text-xs text-blue-700 py-7"
              onClick={() => handleMoveClick(move)}
              disabled={!isMyTurn}
            >
              {move.name_ko || move.name} ({getPowerLabel(move, myMoves)})
            </Button>
          ))
        ) : (
          <div className="text-gray-500 text-sm col-span-2">기술 로딩 중...</div>
        )}
      </div>

      {/* 내 포켓몬 카드 */}
      <div className="flex flex-row-reverse items-center gap-3 bg-white/85 rounded-xl p-3 border border-blue-100 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden">
          <ImageWithFallback
            src={battleData?.myPokemon?.poke_id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${battleData.myPokemon.poke_id}.png` : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"}
            alt="포켓몬"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-sm text-right">
          <div className="font-bold text-gray-800">{battleData?.myPokemon?.user_nickname || '내 닉네임'}</div>
          <div className="text-gray-600">스터디몬: {battleData?.myPokemon?.name || '피카츄'}</div>
          <div className="text-gray-600">타입: {battleData?.myPokemon?.type1 || '전기'}{battleData?.myPokemon?.type2 ? ` / ${battleData.myPokemon.type2}` : ''}</div>
          <div className="text-gray-600">LEVEL: {battleData?.myPokemon?.level || '?'}</div>
        </div>
      </div>
    </div>
  );
}
