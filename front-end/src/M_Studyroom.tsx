import { useState } from "react";
import { CreateStudyRoom, RoomData } from "./components/CreateStudyRoom";
// 이름 충돌 피하려고 별칭으로 가져옴 (동일 이름이어도 무방하다고 했지만, 가독성↑)
import { M_StudyRoom as RoomScreen } from "./components/M_StudyRoom";
import WebcamView from "./WebcamView"; // ✅ 미리보기에서 마이크 패널까지 보이게 사용

export default function M_StudyRoom() {
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const [entered, setEntered] = useState(false); // 방 생성 후, 미리보기 -> 실제 입장 여부

  const handleCreateRoom = (roomData: RoomData) => {
    setCurrentRoom(roomData);
    setEntered(false); // 새 방 만들면 먼저 미리보기부터
  };

  const handleLeaveRoom = () => {
    setEntered(false);
    setCurrentRoom(null);
  };

  // 1) 아직 방을 생성하지 않았다면: 방 만들기 화면
  if (!currentRoom) {
    return <CreateStudyRoom onCreateRoom={handleCreateRoom} />;
  }

  // 2) 방은 생성했지만 아직 “입장” 전이면: 카메라 미리보기(마이크 패널 포함)
  if (currentRoom && !entered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-5xl mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">카메라 미리보기</h1>
            <div className="flex gap-2">
              <button
                className="rounded-md border px-4 py-2"
                onClick={handleLeaveRoom}
              >
                취소
              </button>
              <button
                className="rounded-md bg-black text-white px-4 py-2"
                onClick={() => setEntered(true)}
              >
                이 설정으로 스터디룸 입장
              </button>
            </div>
          </div>

          {/* ✅ 미리보기에서는 마이크 패널을 보이게 */}
          <div className="rounded-xl bg-white p-4 shadow">
            <WebcamView showMicPanel />
          </div>

          <p className="mt-3 text-sm text-gray-500">
            팁: 상단 드롭다운에서 카메라/마이크를 선택하고, “마이크 테스트(3초)”로 입력을 확인한 후 입장하세요.
          </p>
        </div>
      </div>
    );
  }

  // 3) “이 설정으로 입장”을 누르면 실제 스터디룸 화면
  return <RoomScreen roomData={currentRoom} onLeave={handleLeaveRoom} />;
}
