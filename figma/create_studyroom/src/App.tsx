import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { Button } from "./components/ui/button";

export default function App() {
  const [roomName, setRoomName] = useState("");
  const [studyPurpose, setStudyPurpose] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [isBattle, setIsBattle] = useState(false);

  const handleSubmit = () => {
    console.log({
      roomName,
      studyPurpose,
      maxParticipants,
      isBattle,
    });
    // 여기에 스터디룸 생성 로직 추가
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 p-6">
      {/* Main Card */}
      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <button
          className="absolute -top-16 left-0 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border-4 border-yellow-300"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl border-8 border-yellow-300 p-8 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200 rounded-full opacity-30 -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200 rounded-full opacity-30 -ml-20 -mb-20" />

          {/* Pokemon Logo */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-block">
              <div className="text-5xl mb-2" style={{ 
                fontFamily: 'Arial Black, sans-serif',
                textShadow: '3px 3px 0px rgba(0,0,0,0.1)',
                background: 'linear-gradient(45deg, #FFCB05 0%, #FFD700 50%, #FFCB05 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Pokémon
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 rounded-full" />
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8 relative z-10">
            <h1 className="text-gray-800 mb-2">스터디룸 생성</h1>
            <p className="text-gray-500 text-sm">환영합니다. 환영합니다. 환영합니다.</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 relative z-10">
            {/* 스터디룸명 */}
            <div className="space-y-2">
              <Label htmlFor="roomName" className="text-gray-700">
                스터디룸명
              </Label>
              <Input
                id="roomName"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="스터디룸 이름을 입력하세요"
                className="w-full rounded-2xl border-4 border-yellow-200 focus:border-yellow-400 focus-visible:ring-0 focus-visible:ring-offset-0 px-5 py-6 transition-all hover:border-yellow-300 bg-yellow-50/50"
              />
            </div>

            {/* 공부 목적 */}
            <div className="space-y-2">
              <Label htmlFor="studyPurpose" className="text-gray-700">
                공부 목적
              </Label>
              <Input
                id="studyPurpose"
                type="text"
                value={studyPurpose}
                onChange={(e) => setStudyPurpose(e.target.value)}
                placeholder="공부 목적을 입력하세요"
                className="w-full rounded-2xl border-4 border-pink-200 focus:border-pink-400 focus-visible:ring-0 focus-visible:ring-offset-0 px-5 py-6 transition-all hover:border-pink-300 bg-pink-50/50"
              />
            </div>

            {/* 최대 인원 */}
            <div className="space-y-2">
              <Label htmlFor="maxParticipants" className="text-gray-700">
                최대 인원
              </Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                max="20"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="최대 인원을 입력하세요"
                className="w-full rounded-2xl border-4 border-blue-200 focus:border-blue-400 focus-visible:ring-0 focus-visible:ring-offset-0 px-5 py-6 transition-all hover:border-blue-300 bg-blue-50/50"
              />
            </div>

            {/* 배틀 여부 */}
            <div className="flex items-center justify-between p-5 rounded-2xl border-4 border-purple-200 bg-purple-50/50">
              <Label htmlFor="battle-mode" className="text-gray-700 cursor-pointer">
                배틀 모드
              </Label>
              <Switch
                id="battle-mode"
                checked={isBattle}
                onCheckedChange={setIsBattle}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-orange-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 relative z-10">
            <Button
              onClick={handleSubmit}
              className="w-full rounded-full py-7 text-white shadow-lg hover:shadow-xl transition-all border-4 border-red-600"
              style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 50%, #EE5A6F 100%)',
              }}
            >
              <span className="text-lg">스터디룸 만들기</span>
            </Button>
          </div>

          {/* Decorative Pokeball */}
          <div className="absolute -bottom-2 -right-2 opacity-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-white border-4 border-gray-800 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-gray-800" />
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
