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

export default function StudyRoom() {
  const { roomData } = useRoom();
  const { setCurrentPage } = usePage();

  const handleLeave = () => {
    setCurrentPage('home');
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
            <WebcamGrid />
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
    </div>
  );
}
