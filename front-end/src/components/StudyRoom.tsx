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
    setCurrentPage('battle_room');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-violet-100 flex flex-col">
      <StudyRoomHeader />

      <main className="container mx-auto px-8 pb-8 flex-1">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* 왼쪽 패널: 배틀존 */}
          <div className="col-span-2">
            <BattleZonePanel />
          </div>

          {/* 중앙: 웹캠 + 상태 */}
          <div className="col-span-7 flex flex-col gap-4">
            <WebcamGrid onBattleRequest={handleBattleRequest} />
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
