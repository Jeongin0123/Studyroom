import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Card } from './ui/card';
import { usePage } from './PageContext'
import { useRoom, RoomData } from './RoomContext'
import { useUser } from './UserContext';

interface CreateStudyRoomProps {
  onCreateRoom?: (roomData: RoomData) => void;
}

// export interface RoomData {
//   name: string;
//   maxParticipants: number;
//   battleMode: boolean;
//   studyPurpose: string;
// }

export function CreateStudyRoom({ onCreateRoom }: CreateStudyRoomProps) {
  const [roomName, setRoomName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('4');
  const [battleMode, setBattleMode] = useState(false);
  const [studyPurpose, setStudyPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { roomData, setRoomData } = useRoom();
  const { currentPage, setCurrentPage } = usePage();
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <h1 className="mb-8 text-center">스터디룸 생성</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roomName">스터디룸 이름</Label>
            <Input
              id="roomName"
              placeholder="예: 함께 공부해요!"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">최대 인원</Label>
            <Select value={maxParticipants} onValueChange={setMaxParticipants}>
              <SelectTrigger id="maxParticipants">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2명</SelectItem>
                <SelectItem value="4">4명</SelectItem>
                <SelectItem value="6">6명</SelectItem>
                <SelectItem value="8">8명</SelectItem>
                <SelectItem value="10">10명</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studyPurpose">공부 목적</Label>
            <Select value={studyPurpose} onValueChange={setStudyPurpose}>
              <SelectTrigger id="studyPurpose">
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

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="battleMode">배틀 모드</Label>
              <p className="text-sm text-gray-600">포켓몬 배틀로 재미있게 공부하기</p>
            </div>
            <Switch
              id="battleMode"
              checked={battleMode}
              onCheckedChange={setBattleMode}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '스터디룸 만들기'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
