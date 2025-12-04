import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { usePage } from './PageContext';
import { useRoom, type RoomData } from './RoomContext';
import { useUser } from './UserContext';
import { Home } from 'lucide-react';
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";

interface CreateStudyRoomProps {
  onCreateRoom?: (roomData: RoomData) => void;
}

export function CreateStudyRoom({ onCreateRoom }: CreateStudyRoomProps) {
  const [roomName, setRoomName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('4');
  const [battleMode, setBattleMode] = useState(false);
  const [studyPurpose, setStudyPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setRoomData } = useRoom();
  const { setCurrentPage } = usePage();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomName.trim() || !studyPurpose) {
      alert('스터디룸 이름과 공부 목적을 입력해주세요.');
      return;
    }

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/rooms/create?user_id=${user.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: roomName,
          capacity: parseInt(maxParticipants),
          purpose: studyPurpose,
          battle_enabled: battleMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || '스터디룸 생성에 실패했습니다.');
        return;
      }

      // 성공 시 RoomContext에 저장
      setRoomData({
        name: roomName,
        maxParticipants: parseInt(maxParticipants),
        battleMode: battleMode,
        studyPurpose: studyPurpose,
      });

      alert('스터디룸이 생성되었습니다!');
      setCurrentPage('studyroom');
    } catch (error) {
      console.error('스터디룸 생성 오류:', error);
      alert('스터디룸 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 배경 데코 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-pink-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* 상단 홈 버튼 */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => setCurrentPage('home')}
          className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full border-2 border-purple-300 shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center group"
        >
          <Home className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
        </button>
      </div>

      <div className="relative w-full max-w-3xl">
        <div
          className="backdrop-blur-sm rounded-3xl shadow-2xl p-10 border-8 border-yellow-300"
          style={{ background: "#F8F8F8" }}
        >
          <div className="text-center mb-8">
            <img src={logo} alt="STUDYMON" className="h-12 w-auto mx-auto drop-shadow-lg mb-3" />
            <p className="text-3xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              스터디룸 생성
            </p>
            <p className="text-sm text-gray-600 mt-2">포켓몬과 함께 공부할 방을 만들고 바로 입장해요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="roomName" className="text-gray-700">스터디룸 이름</Label>
                <Input
                  id="roomName"
                  placeholder="예: 함께 공부해요!"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  className="rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="text-gray-700">최대 인원</Label>
                <Select value={maxParticipants} onValueChange={setMaxParticipants}>
                  <SelectTrigger id="maxParticipants" className="rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90">
                    <SelectValue placeholder="인원 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2명</SelectItem>
                    <SelectItem value="3">3명</SelectItem>
                    <SelectItem value="4">4명</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="studyPurpose" className="text-gray-700">공부 목적</Label>
                <Select value={studyPurpose} onValueChange={setStudyPurpose}>
                  <SelectTrigger id="studyPurpose" className="rounded-2xl border-2 border-purple-200 focus:border-purple-400 bg-white/90">
                    <SelectValue placeholder="목적을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exam">시험 준비</SelectItem>
                    <SelectItem value="certification">자격증 준비</SelectItem>
                    <SelectItem value="language">어학 공부</SelectItem>
                    <SelectItem value="programming">프로그래밍 학습</SelectItem>
                    <SelectItem value="homework">과제/숙제</SelectItem>
                    <SelectItem value="reading">독서</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              
            </div>

            <Button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? '생성 중...' : '스터디룸 만들기'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
