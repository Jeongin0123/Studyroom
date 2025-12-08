// src/components/StudyRoom.tsx
import { BattleZonePanel } from "./BattleZonePanel";
import { WebcamGrid } from "./WebcamGrid";
import { RightPanel } from "./RightPanel";
import exitImg from "../assets/exit.png";
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";
import { AiChatPage } from "./AiChatPage";
import { useRoom } from './RoomContext';
import { usePage } from './PageContext';
import { useState, useEffect } from "react";
import { BattleRequestPopup } from "./BattleRequestPopup";
import { BattleSelectPokemonPopup } from "./BattleSelectPokemonPopup";
import { useUser } from './UserContext';
import { useBattleSocket } from '../hooks/useBattleSocket';

export default function StudyRoom() {
  const { roomData, setRoomData } = useRoom();
  const { setCurrentPage } = usePage();
  const { user } = useUser();

  // WebSocket 배틀 시스템
  const {
    sendBattleRequest,
    acceptBattle,
    rejectBattle,
    selectPokemon,
    enterBattle,
    incomingRequest,
    battleAccepted,
    opponentPokemon,
    battleData,
    opponentReady,
    battleId
  } = useBattleSocket(roomData?.room_id || null, user?.userId || null);

  const handleLeave = async () => {
    if (!roomData?.room_id || !user?.userId) {
      console.error('방 ID 또는 사용자 ID가 없습니다.');
      setCurrentPage('home');
      return;
    }

    try {
      const response = await fetch(`/api/rooms/out?room_id=${roomData.room_id}&user_id=${user.userId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('방 나가기 실패:', data.detail);
        alert(data.detail || '방 나가기에 실패했습니다.');
        return;
      }

      console.log('방 나가기 성공:', data.message);

      // RoomContext 초기화
      setRoomData(null);

      // 홈으로 이동
      setCurrentPage('home');
    } catch (error) {
      console.error('방 나가기 오류:', error);
      alert('방 나가기 중 오류가 발생했습니다.');

      // 오류가 발생해도 홈으로 이동
      setRoomData(null);
      setCurrentPage('home');
    }
  };

  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [showSelectPopup, setShowSelectPopup] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [drowsinessCount, setDrowsinessCount] = useState(0);
  const [currentState, setCurrentState] = useState<string>("Normal");
  const [lastSleepyDetection, setLastSleepyDetection] = useState<number>(0);
  const [currentOpponentId, setCurrentOpponentId] = useState<number | null>(null);
  const [mySelectedPokemon, setMySelectedPokemon] = useState<any>(null);
  const [isRequester, setIsRequester] = useState(false); // 배틀 신청자 여부

  // 🎯 슬라이딩 윈도우 버퍼 (최근 10개 감지 결과 저장)
  const [, setDetectionWindow] = useState<string[]>([]);


  // 경고 메시지 지연 표시를 위한 상태
  const [showWarningMessage, setShowWarningMessage] = useState(false);
  const [warningTimer, setWarningTimer] = useState<number | null>(null);

  // currentState가 Normal로 돌아왔을 때 3초 후에 경고 메시지 숨기기
  useEffect(() => {
    if (drowsinessCount >= 1 && drowsinessCount <= 5) {
      if (currentState !== "Normal") {
        // 경고 상태: 즉시 경고 메시지 표시
        setShowWarningMessage(true);
        if (warningTimer !== null) {
          clearTimeout(warningTimer);
          setWarningTimer(null);
        }
      } else {
        // 정상 상태로 돌아옴: 3초 후에 경고 메시지 숨기기
        const timer = window.setTimeout(() => {
          setShowWarningMessage(false);
        }, 3000);
        setWarningTimer(timer);

        return () => {
          clearTimeout(timer);
        };
      }
    } else if (drowsinessCount === 0) {
      // 졸음 횟수가 0이면 경고 메시지 즉시 숨기기
      setShowWarningMessage(false);
      if (warningTimer !== null) {
        clearTimeout(warningTimer);
        setWarningTimer(null);
      }
    }
  }, [currentState, drowsinessCount]);

  const handleDrowsinessDetected = (result: string) => {
    setCurrentState(result);
    console.log(`[졸음 감지] 현재 상태: ${result}`);

    // 🎯 윈도우에 새 결과 추가 (최대 10개 유지)
    setDetectionWindow(prev => {
      const newWindow = [...prev, result].slice(-10);

      console.log(`[윈도우] 현재 버퍼: [${newWindow.join(', ')}] (${newWindow.length}/10)`);

      // 윈도우가 10개 채워졌을 때만 과반수 체크
      if (newWindow.length === 10) {
        const sleepyCount = newWindow.filter(r => r === "Sleepy").length;
        const yawnCount = newWindow.filter(r => r === "Yawn").length;
        const normalCount = newWindow.filter(r => r === "Normal").length;

        console.log(`[윈도우] 통계 - Sleepy: ${sleepyCount}, Yawn: ${yawnCount}, Normal: ${normalCount}`);

        // 과반수(6개 이상)가 Sleepy이고, 마지막 카운트로부터 충분한 시간이 지났으면
        if (sleepyCount >= 6) {
          const now = Date.now();
          if (now - lastSleepyDetection > 3000) {
            // 백엔드 API 호출하여 졸음 로그 저장
            if (!user?.userId) {
              console.error('[졸음 감지] 사용자 ID가 없습니다.');
              return newWindow;
            }

            fetch(`/api/drowsiness/log`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user.userId,
                event_type: 'drowsy'
              })
            })
              .then(res => res.json())
              .then(data => {
                console.log(`[졸음 감지] ⚠️ 졸음 로그 저장 완료!`, data);
              })
              .catch(err => {
                console.error('[졸음 감지] API 호출 실패:', err);
              });
            setDrowsinessCount(prev => prev + 1);
            setLastSleepyDetection(now);
            console.log(`[졸음 감지] ⚠️ 졸음 횟수 증가! (윈도우 내 Sleepy: ${sleepyCount}/10)`);

            // 🎯 윈도우 초기화
            console.log("[졸음 감지] 🔄 졸음 카운트 후 윈도우 초기화");
            return [];
          } else {
            console.log(`[졸음 감지] ⏸️ 쿨다운 중 (${Math.round((3000 - (now - lastSleepyDetection)) / 1000)}초 남음)`);
          }
        } else {
          console.log(`[졸음 감지] ✅ 과반수 미달 (Sleepy ${sleepyCount}/10 < 6)`);
        }
      } else {
        console.log(`[윈도우] ⏳ 버퍼 채우는 중... (${newWindow.length}/10)`);
      }

      return newWindow;
    });
  };

  const handleBattleRequest = (targetId: number) => {
    // WebSocket으로 배틀 신청 보내기
    if (user?.nickname) {
      sendBattleRequest(targetId, user.nickname);
      setIsRequester(true); // 신청자로 표시
      console.log(`User ${targetId}에게 배틀 신청`);
    }
  };

  // 배틀 수락
  const handleAcceptBattle = () => {
    if (currentOpponentId) {
      acceptBattle(currentOpponentId);
      setShowRequestPopup(false);
      setShowSelectPopup(true);
    }
  };

  // 배틀 거절
  const handleRejectBattle = () => {
    if (currentOpponentId) {
      rejectBattle(currentOpponentId);
      setShowRequestPopup(false);
      setCurrentOpponentId(null);
    }
  };

  // 배틀 신청 받았을 때
  useEffect(() => {
    if (incomingRequest) {
      setCurrentOpponentId(incomingRequest.from_user_id);
      setShowRequestPopup(true);
    }
  }, [incomingRequest]);

  // \ubc30\ud2c0 \uc218\ub77d\ub418\uc5c8\uc744 \ub54c
  useEffect(() => {
    if (battleAccepted && !showRequestPopup) {
      setShowSelectPopup(true);
    }
  }, [battleAccepted, showRequestPopup]);

  const handleEnterBattle = async (userPokemonId: number) => {
    try {
      // 선택한 포켓몬 정보 가져오기
      const response = await fetch(`/api/user-pokemon/${userPokemonId}`);
      const pokemonData = await response.json();

      setMySelectedPokemon(pokemonData);

      // 상대방에게 포켓몬 선택 알림
      if (currentOpponentId) {
        selectPokemon(currentOpponentId, {
          id: pokemonData.user_pokemon_id,
          name: pokemonData.pokemon_name,
          level: pokemonData.level,
          sprite: pokemonData.sprite_url,
          hp: pokemonData.hp,
          type: pokemonData.type,
          exp: pokemonData.exp
        });

        // 내 정보 전송
        enterBattle(currentOpponentId, {
          nickname: user?.nickname || '사용자',
          pokemon: {
            id: pokemonData.user_pokemon_id,
            name: pokemonData.pokemon_name,
            level: pokemonData.level,
            sprite: pokemonData.sprite_url,
            hp: pokemonData.hp,
            type: pokemonData.type,
            exp: pokemonData.exp
          }
        });
      }

      setShowSelectPopup(false);
    } catch (error) {
      console.error('포켓몬 정보 가져오기 실패:', error);
    }
  };

  // \uc591\ucabd \ubaa8\ub450 \uc900\ube44\ub418\uba74 \ubc30\ud2c0 \uc785\uc7a5
  useEffect(() => {
    const createAndEnterBattle = async () => {
      if (opponentReady && mySelectedPokemon && battleData && !battleId) {
        try {
          // \uc2e0\uccad\uc790\ub9cc \ubc30\ud2c0 \uc0dd\uc131
          if (isRequester) {
            console.log('[Battle] \ubc30\ud2c0 \uc0dd\uc131 \uc2dc\uc791...');

            const response = await fetch('http://localhost:8000/api/battle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                player_a_user_pokemon_id: mySelectedPokemon.user_pokemon_id,
                player_b_user_pokemon_id: battleData.opponentPokemon?.id
              })
            });

            if (!response.ok) {
              throw new Error('\ubc30\ud2c0 \uc0dd\uc131 \uc2e4\ud328');
            }

            const battleResult = await response.json();
            console.log('[Battle] \ubc30\ud2c0 \uc0dd\uc131 \uc131\uacf5:', battleResult);

            // \ubc30\ud2c0 \ub370\uc774\ud130 \uc800\uc7a5
            sessionStorage.setItem('battleData', JSON.stringify({
              ...battleData,
              battle_id: battleResult.battle_id,
              myPokemon: mySelectedPokemon,
              myMoves: battleResult.player_a_moves
            }));

            // \ubc30\ud2c0 \ud654\uba74\uc73c\ub85c \uc774\ub3d9
            setCurrentPage('battle_room');
          }
        } catch (error) {
          console.error('[Battle] \ubc30\ud2c0 \uc0dd\uc131 \uc624\ub958:', error);
          alert('\ubc30\ud2c0 \uc0dd\uc131\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.');
        }
      } else if (opponentReady && mySelectedPokemon && battleData && battleId) {
        // \uc218\ub77d\uc790\ub294 battle_id\ub97c \ubc1b\uc740 \ud6c4 \uc774\ub3d9
        console.log('[Battle] \ubc30\ud2c0 ID \ubc1b\uc74c:', battleId);

        sessionStorage.setItem('battleData', JSON.stringify({
          ...battleData,
          battle_id: battleId,
          myPokemon: mySelectedPokemon
        }));

        setCurrentPage('battle_room');
      }
    };

    createAndEnterBattle();
  }, [opponentReady, mySelectedPokemon, battleData, battleId, isRequester, setCurrentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      <header
        className="w-full bg-white/80 backdrop-blur-sm border-b border-blue-100"
        style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="w-12" />
          <img src={logo} alt="STUDYMON" className="h-12 w-auto drop-shadow" />
          <button onClick={handleLeave} className="flex justify-center">
            <img
              src={exitImg}
              alt="퇴장하기"
              className="h-12 w-auto hover:scale-[1.02] transition-transform"
            />
          </button>
        </div>
      </header>

      <main className="w-full px-2 pb-0 flex-1 pt-2">
        <div className="w-full rounded-2xl bg-white/85 backdrop-blur-sm border border-blue-100 shadow-lg p-3 h-full flex flex-col">
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-170px)]">
            {/* 왼쪽 패널: 배틀존 */}
            <div className="col-span-3">
              <BattleZonePanel />
            </div>

            {/* 중앙: 웹캠 + 상태 */}
            <div className="col-span-6 flex flex-col gap-3 min-h-0 h-full">
              <WebcamGrid onBattleRequest={handleBattleRequest} onDrowsinessDetected={handleDrowsinessDetected} />

              {/* 졸음 감지 상태 표시 - 하단까지 확장 */}
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-1000 text-3xl">😴 졸음 감지 모니터링</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">누적 졸음 횟수:</span>
                    <span className={`text-xl font-bold ${drowsinessCount > 5 ? 'text-red-500' : 'text-blue-500'}`}>
                      {drowsinessCount}회
                    </span>
                  </div>
                </div>

                <br></br>
                {/* 현재 상태 표시 */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                  <span className="text-sm font-medium text-gray-600">현재 상태:</span>
                  <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${currentState === "Normal"
                    ? "bg-green-100 text-green-700"
                    : currentState === "Yawn"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                    {currentState === "Normal" && "😊 정상"}
                    {currentState === "Yawn" && "🥱 하품"}
                    {currentState === "Sleepy" && "😴 졸림 감지!"}
                  </div>
                </div>

                {/* 졸음 횟수에 따른 동적 메시지 - 3초 지연 적용 */}
                {(drowsinessCount === 0 || (currentState === "Normal" && !showWarningMessage)) && (
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-sm text-blue-700 font-bold whitespace-nowrap">스터디몬이 지켜보고 있어요! 오늘도 파이팅! 🔥</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-blue-600 text-xs font-semibold whitespace-nowrap">열심히 공부 중!</span>
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-white shadow-sm">
                        <img
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                          alt="포켓몬"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {drowsinessCount >= 1 && drowsinessCount <= 5 && (currentState !== "Normal" || showWarningMessage) && (
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-sm text-orange-700 font-bold whitespace-nowrap animate-pulse">⚠️ 졸음 감지! 잠을 깨세요!</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-orange-600 text-xs font-semibold whitespace-nowrap">스트레칭 권장</span>
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-orange-200 bg-white shadow-sm">
                        <img
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png"
                          alt="포켓몬"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {drowsinessCount >= 6 && currentState !== "Normal" && (
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-sm text-red-700 font-bold whitespace-nowrap animate-bounce">🚨 졸음 심각! 즉시 휴식!</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-red-600 text-xs font-semibold whitespace-nowrap">공부 중단 권장</span>
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-red-200 bg-white shadow-sm">
                        <img
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png"
                          alt="포켓몬"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    {/* 경고음 재생 */}
                    <audio autoPlay loop>
                      <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWm98OScTgwOUKXh8LdjHAU2kdXzzn0vBSF1xe/glEILElyx6OyrWBUIRJzd8sFuIwUrgc7y2Yk2CBhpvfDknE4MDlCl4fC3YxwFNpHV8859LwUhdc" type="audio/wav" />
                    </audio>
                  </div>
                )}
              </div>

            </div>

            {/* 오른쪽: 채팅 패널 */}
            <div className="col-span-3 flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0 h-full">
                <RightPanel onOpenAiChat={() => setShowAiChat(true)} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAiChat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <AiChatPage variant="modal" onClose={() => setShowAiChat(false)} />
          </div>
        </div>
      )}

      {/* 배틀 신청 팝업 (상대방이 나에게 신청했을 때) */}
      {showRequestPopup && incomingRequest && (
        <BattleRequestPopup
          requesterName={incomingRequest.from_nickname}
          onAccept={handleAcceptBattle}
          onReject={handleRejectBattle}
        />
      )}

      {/* 포켓몬 선택 팝업 (수락 후 내 포켓몬 선택) */}
      {showSelectPopup && (
        <BattleSelectPokemonPopup
          onEnterBattle={handleEnterBattle}
          onCancel={() => setShowSelectPopup(false)}
        />
      )}
    </div>
  );
}
