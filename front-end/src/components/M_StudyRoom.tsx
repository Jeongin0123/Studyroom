import { PokemonBattle } from './PokemonBattle';
import { WebcamGrid } from './WebcamGrid';
import { ChatPanel } from './ChatPanel';
import { Button } from './ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { RoomData } from './CreateStudyRoom';
import WebcamView from '../WebcamView'; // ✅ 추가: 로컬 카메라 미리보기

interface StudyRoomProps {
  roomData: RoomData;
  onLeave: () => void;
}

export function M_StudyRoom({ roomData, onLeave }: StudyRoomProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-4">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onLeave}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              나가기
            </Button>
            <div>
              <h1 className="mb-1">{roomData.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  4/{roomData.maxParticipants}명
                </span>
                <span>목적: {getPurposeLabel(roomData.studyPurpose)}</span>
                {roomData.battleMode && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    배틀 모드
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Section - Pokemon Battle */}
        {roomData.battleMode && (
          <div className="lg:col-span-1 h-[calc(100vh-180px)]">
            <PokemonBattle />
          </div>
        )}

        {/* Middle Section - Webcams */}
        <div className={`${roomData.battleMode ? 'lg:col-span-1' : 'lg:col-span-2'} h-[calc(100vh-180px)]`}>
          {/* ✅ 먼저 로컬 카메라 확인 */}
          <div className="h-full flex items-center justify-center">
            <WebcamView />
          </div>

          {/* ⬇️ 나중에 멀티 타일(WebRTC)로 갈 때 이 줄로 교체 */}
          {/* <WebcamGrid /> */}
        </div>

        {/* Right Section - Chat */}
        <div className="lg:col-span-1 h-[calc(100vh-180px)]">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}

function getPurposeLabel(purpose: string): string {
  const labels: { [key: string]: string } = {
    exam: '시험 준비',
    certification: '자격증 준비',
    language: '어학 공부',
    programming: '프로그래밍 학습',
    homework: '과제/숙제',
    reading: '독서',
    other: '기타'
  };
  return labels[purpose] || purpose;
}
