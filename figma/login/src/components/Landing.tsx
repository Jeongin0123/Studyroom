import { Users, Plus, User, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface LandingProps {
  onNavigateToMyPage: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

// Mock study room data
const studyRooms = [
  {
    id: 1,
    name: '토익 900점 도전방',
    currentUsers: 3,
    maxUsers: 6,
    isBattleMode: true,
    host: '피카츄마스터',
  },
  {
    id: 2,
    name: '정보처리기사 스터디',
    currentUsers: 4,
    maxUsers: 8,
    isBattleMode: false,
    host: '개발왕',
  },
  {
    id: 3,
    name: '수능 D-100 함께 공부해요',
    currentUsers: 6,
    maxUsers: 6,
    isBattleMode: true,
    host: '공부벌레',
  },
  {
    id: 4,
    name: '코딩테스트 준비방',
    currentUsers: 2,
    maxUsers: 4,
    isBattleMode: false,
    host: '알고리즘천재',
  },
  {
    id: 5,
    name: '조용히 집중하는 방',
    currentUsers: 5,
    maxUsers: 10,
    isBattleMode: false,
    host: '집중왕',
  },
  {
    id: 6,
    name: '영어 회화 스터디',
    currentUsers: 3,
    maxUsers: 5,
    isBattleMode: true,
    host: 'EnglishMaster',
  },
];

export default function Landing({ onNavigateToMyPage, onCreateRoom, onJoinRoom }: LandingProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b-4 border-yellow-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-400 to-yellow-400 rounded-full p-2">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl text-gray-800">포켓몬 스터디룸</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Button
                onClick={onNavigateToMyPage}
                variant="outline"
                className="rounded-full border-2 border-purple-300 hover:bg-purple-50"
              >
                <User className="w-4 h-4 mr-2" />
                마이페이지
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl text-gray-800 mb-2">개설된 스터디룸</h2>
          <p className="text-gray-600">친구들과 함께 공부하고 포켓몬을 성장시켜보세요!</p>
        </div>

        {/* Study Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {studyRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-4 border-purple-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
              onClick={onJoinRoom}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg text-gray-800 flex-1">{room.name}</h3>
                {room.isBattleMode && (
                  <Badge className="bg-red-400 text-white border-0 ml-2">
                    배틀
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {room.currentUsers} / {room.maxUsers}명
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all"
                      style={{ width: `${(room.currentUsers / room.maxUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t-2 border-gray-100">
                  <span className="text-sm text-gray-500">방장: {room.host}</span>
                  <Button
                    size="sm"
                    className="rounded-full bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onJoinRoom();
                    }}
                  >
                    입장
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Room Button */}
        <div className="flex justify-center">
          <Button
            onClick={onCreateRoom}
            className="rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white shadow-xl px-8 py-6 text-lg"
          >
            <Plus className="w-6 h-6 mr-2" />
            스터디룸 개설하기
          </Button>
        </div>
      </main>
    </div>
  );
}
