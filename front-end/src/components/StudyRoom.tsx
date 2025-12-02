// src/components/StudyRoom.tsx
import { StudyRoomHeader } from "./StudyRoomHeader";
import { BattleZonePanel } from "./BattleZonePanel";
import { WebcamGrid } from "./WebcamGrid";
import { StatusArea } from "./StatusArea";
import { RightPanel } from "./RightPanel";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useRoom } from './RoomContext';
import { usePage } from './PageContext';
import { useState } from "react";
import { BattleRequestPopup } from "./BattleRequestPopup";
import { BattleSelectPokemonPopup } from "./BattleSelectPokemonPopup";

export default function StudyRoom() {
  const { roomData } = useRoom();
  const { setCurrentPage } = usePage();

  const handleLeave = () => {
    setCurrentPage('home');
  };

  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [showSelectPopup, setShowSelectPopup] = useState(false);
  const [requesterName, setRequesterName] = useState("");
  const [drowsinessCount, setDrowsinessCount] = useState(0);
  const [currentState, setCurrentState] = useState<string>("Normal");
  const [lastSleepyDetection, setLastSleepyDetection] = useState<number>(0);
  const [inBattle, setInBattle] = useState(false);
  const [opponentPokemon, setOpponentPokemon] = useState("🔥");

  // 🎯 슬라이딩 윈도우 버퍼 (최근 10개 감지 결과 저장)
  const [detectionWindow, setDetectionWindow] = useState<string[]>([]);

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
            const userId = 1; // 임시 user_id

            fetch(`http://localhost:8000/api/drowsiness/log`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
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
    // 1. 배틀 신청 시뮬레이션
    // 실제로는 소켓으로 상대방에게 요청을 보내야 함
    // 여기서는 1.5초 후 상대방이 나에게 신청한 것처럼 시뮬레이션
    console.log(`User ${targetId}에게 배틀 신청`);

    setTimeout(() => {
      setRequesterName("파이리456"); // 시뮬레이션용 상대방 이름
      setShowRequestPopup(true);
    }, 1500);
  };

  const handleAcceptBattle = () => {
    setShowRequestPopup(false);
    setShowSelectPopup(true);
  };

  const handleRejectBattle = () => {
    setShowRequestPopup(false);
  };

  const handleEnterBattle = (pokemonIndex: number) => {
    setShowSelectPopup(false);
    // setInBattle(true); // 기존 로직 주석 처리
    setCurrentPage('battle_room'); // 페이지 전환
    console.log(`배틀 시작! 선택한 포켓몬 인덱스: ${pokemonIndex}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-violet-100 flex flex-col">
      <StudyRoomHeader />

      <main className="container mx-auto px-8 pb-8 flex-1">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* 왼쪽 패널: 배틀존 */}
          <div className="col-span-2">
            <BattleZonePanel
              inBattle={inBattle}
              opponentName={requesterName}
              opponentPokemon={opponentPokemon}
              myPokemon="⚡"
            />
          </div>

          {/* 중앙: 웹캠 + 상태 */}
          <div className="col-span-7 flex flex-col gap-4">
            <WebcamGrid onBattleRequest={handleBattleRequest} onDrowsinessDetected={handleDrowsinessDetected} />

            {/* 졸음 감지 상태 표시 */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700">😴 졸음 감지 모니터링</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">누적 졸음 횟수:</span>
                  <span className={`text-xl font-bold ${drowsinessCount > 5 ? 'text-red-500' : 'text-blue-500'}`}>
                    {drowsinessCount}회
                  </span>
                </div>
              </div>

              {/* 현재 상태 표시 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
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
            </div>

            <StatusArea />
          </div>

          {/* 오른쪽: 퇴장하기 버튼 + 채팅 패널 */}
          <div className="col-span-3 flex flex-col gap-4">
            <Button
              onClick={handleLeave}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-3xl shadow-xl transition-all hover:shadow-2xl py-6"
            >
              <LogOut className="mr-2 h-5 w-5" />
              퇴장하기
            </Button>

            <div className="flex-1">
              <RightPanel />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* 배틀 신청 팝업 (상대방이 나에게 신청했을 때) */}
      {showRequestPopup && (
        <BattleRequestPopup
          requesterName={requesterName}
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