import { useState } from 'react';
import { ArrowLeft, Users, Swords, Video, Mic } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CreateRoomProps {
  onBack: () => void;
  onCreate: () => void;
}

export default function CreateRoom({ onBack, onCreate }: CreateRoomProps) {
  const [roomName, setRoomName] = useState('');
  const [maxUsers, setMaxUsers] = useState('6');
  const [battleMode, setBattleMode] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  const handleCreate = () => {
    if (roomName.trim()) {
      onCreate();
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="rounded-full border-2 border-purple-300 hover:bg-purple-50 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <h2 className="text-3xl text-gray-800">스터디룸 개설하기</h2>
          <p className="text-gray-600 mt-2">새로운 스터디룸을 만들고 친구들을 초대하세요!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Room Settings Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-4 border-purple-300 shadow-xl">
              <h3 className="text-xl text-gray-800 mb-6">방 설정</h3>
              
              <div className="space-y-6">
                {/* Room Name */}
                <div className="space-y-2">
                  <Label htmlFor="roomName" className="text-gray-700">스터디룸 이름</Label>
                  <Input
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="예: 토익 900점 도전방"
                    className="rounded-2xl border-2 border-purple-200 focus:border-purple-400"
                  />
                </div>

                {/* Max Users */}
                <div className="space-y-2">
                  <Label htmlFor="maxUsers" className="text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    최대 인원
                  </Label>
                  <Select value={maxUsers} onValueChange={setMaxUsers}>
                    <SelectTrigger className="rounded-2xl border-2 border-purple-200">
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

                {/* Battle Mode */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-400 rounded-full p-2">
                      <Swords className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="battleMode" className="text-gray-800 cursor-pointer">
                        배틀 모드
                      </Label>
                      <p className="text-xs text-gray-600">포켓몬 배틀로 경쟁하기</p>
                    </div>
                  </div>
                  <Switch
                    id="battleMode"
                    checked={battleMode}
                    onCheckedChange={setBattleMode}
                  />
                </div>
              </div>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreate}
              disabled={!roomName.trim()}
              className="w-full rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white shadow-xl py-6 text-lg disabled:opacity-50"
            >
              개설하기
            </Button>
          </div>

          {/* Right: Camera/Mic Preview */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-4 border-blue-300 shadow-xl">
              <h3 className="text-xl text-gray-800 mb-6">미디어 설정</h3>

              {/* Camera Preview */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    카메라
                  </Label>
                  <Switch
                    checked={cameraEnabled}
                    onCheckedChange={setCameraEnabled}
                  />
                </div>
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-gray-300">
                  {cameraEnabled ? (
                    <div className="text-center text-white">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">카메라 미리보기</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Video className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">카메라 꺼짐</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Microphone */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-400 rounded-full p-2">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Label className="text-gray-800">마이크</Label>
                      <p className="text-xs text-gray-600">음성 입력 {micEnabled ? '활성화' : '비활성화'}</p>
                    </div>
                  </div>
                  <Switch
                    checked={micEnabled}
                    onCheckedChange={setMicEnabled}
                  />
                </div>
                
                {micEnabled && (
                  <div className="flex gap-1 h-12 items-end justify-center">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-green-400 to-green-300 rounded-t transition-all"
                        style={{
                          height: `${Math.random() * 100}%`,
                          animation: 'pulse 0.5s ease-in-out infinite',
                          animationDelay: `${i * 0.05}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
