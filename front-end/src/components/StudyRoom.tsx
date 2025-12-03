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
  const [showAiChat, setShowAiChat] = useState(false);
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
            <BattleZonePanel
              inBattle={inBattle}
              opponentName={requesterName}
              opponentPokemon={opponentPokemon}
              myPokemon="⚡"
            />
          </div>

          {/* 중앙: 웹캠 + 상태 */}
          <div className="col-span-6 flex flex-col gap-3 min-h-0 h-full">
            <WebcamGrid onBattleRequest={handleBattleRequest} onDrowsinessDetected={handleDrowsinessDetected} />

            {/* 졸음 감지 상태 표시 - 하단까지 확장 */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100 flex-1 flex flex-col min-h-0">
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

              <p className="mt-3 text-sm text-blue-600 font-semibold">스터디몬이 지켜보고 있어요! 오늘도 파이팅! 🔥</p>
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
