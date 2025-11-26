import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { useState } from "react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Video, Send } from "lucide-react";

export default function App() {
  const [message, setMessage] = useState("");

  // 배틀 참가자 데이터
  const participants = [
    { id: 1, name: "피카츄123", emoji: "⚡", online: true },
    { id: 2, name: "파이리d456", emoji: "🔥", online: true },
    { id: 3, name: "꼬부기789", emoji: "💧", online: true },
    { id: 4, name: "이상해씨101", emoji: "🌱", online: true },
  ];

  // 채팅 메시지
  const chatMessages = [
    { user: "피카츄123", message: "안녕하세요!" },
    { user: "파이리d456", message: "오늘도 화이팅!" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="flex-1"></div>
        <div className="text-3xl bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent px-8 py-2 border-2 border-purple-300 rounded-xl">
          LOGO
        </div>
        <div className="flex-1 flex justify-end">
          <Button className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 rounded-full px-6">
            퇴장하기
          </Button>
        </div>
      </header>

      <div className="flex gap-4 p-6">
        {/* Left Sidebar */}
        <div className="w-64 space-y-4">
          {/* 배틀존 타이틀 */}
          <Card className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200">
            <div className="text-center mb-3">
              <span className="text-xl">⚡⚡⚡</span>
              <span className="mx-2">배틀존</span>
              <span className="text-xl">⚡⚡⚡</span>
            </div>
          </Card>

          {/* 내 포켓몬 */}
          <Card className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-pink-200 rounded-xl flex items-center justify-center">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1732455272504-a8965a8c075b?w=400"
                  alt="포켓몬"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="text-sm">
                <div>닉네임이름</div>
                <div className="text-gray-600">포켓몬: 파/수</div>
                <div className="text-gray-600">타입: 전기</div>
                <div className="text-gray-600">EXP: 포켓몬 경험치</div>
              </div>
            </div>
          </Card>

          {/* VS 카드 */}
          <Card className="p-4 bg-gradient-to-br from-green-200 to-green-300 rounded-2xl border-2 border-green-400">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-pink-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="text-xs mb-1">HP</div>
                  <div className="h-3 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: "70%" }}></div>
                  </div>
                </div>
              </div>
              
              <div className="text-3xl text-center text-red-500">VS</div>
              
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-pink-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="text-xs mb-1">HP</div>
                  <div className="h-3 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: "43%" }}></div>
                  </div>
                  <div className="text-xs text-right">43/90</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 기술 버튼 */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50">
              기술1
            </Button>
            <Button variant="outline" className="rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50">
              기술2
            </Button>
            <Button variant="outline" className="rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50">
              기술3
            </Button>
            <Button variant="outline" className="rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50">
              기술4
            </Button>
          </div>

          <Card className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200">
            <div className="text-center mb-2">Battle Time !</div>
            <Button className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-full">
              회복하기
            </Button>
          </Card>

          {/* 내 아픔 */}
          <Card className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200">
            <div className="text-sm mb-2">포켓몬</div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-pink-200 rounded-lg"></div>
              <div className="text-xs">
                <div>닉네임이름</div>
                <div>포켓몬: 파/수</div>
                <div>타입: 전기</div>
                <div>EXP: 포켓몬 경험치</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Center - Battle Zone */}
        <div className="flex-1">
          <Card className="h-full p-8 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-purple-200">
            {/* 스터디룸 타이틀 */}
            <div className="text-center mb-8">
              <h2 className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ⚡ 스터디룸 ⚡
              </h2>
            </div>

            {/* 참가자 그리드 */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {participants.map((participant) => (
                <Card
                  key={participant.id}
                  className="relative p-6 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 rounded-3xl border-none shadow-lg overflow-hidden"
                >
                  {/* 배경 장식 */}
                  <div className="absolute top-4 right-4 text-4xl opacity-20">
                    {participant.emoji}
                  </div>
                  
                  <div className="relative z-10">
                    {/* 이모지 */}
                    <div className="text-5xl mb-4 text-center">
                      {participant.emoji}
                    </div>
                    
                    {/* 비디오 아이콘 */}
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* 사용자 이름 */}
                    <div className="text-center">
                      <div className="px-4 py-2 bg-purple-600/50 backdrop-blur-sm rounded-full text-white inline-block">
                        {participant.name}
                      </div>
                    </div>
                    
                    {/* 온라인 상태 */}
                    {participant.online && (
                      <div className="absolute bottom-4 right-4">
                        <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* 하단 메시지 영역 */}
            <Card className="p-6 bg-purple-50 rounded-2xl border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div className="text-pink-600">###출금완전###</div>
                <div className="w-16 h-16">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1732455272504-a8965a8c075b?w=400"
                    alt="포켓몬"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </Card>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-80">
          <Card className="h-full p-6 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-purple-200 flex flex-col">
            {/* 채팅 섹션 */}
            <div className="mb-6">
              <h3 className="text-lg mb-4 text-purple-700">채팅</h3>
              <div className="space-y-3">
                {chatMessages.map((msg, index) => (
                  <Card key={index} className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-sm text-purple-700 mb-1">{msg.user}</div>
                    <div className="text-sm">{msg.message}</div>
                  </Card>
                ))}
                <Button className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl">
                  반가워요~
                </Button>
                <Button className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl">
                  오늘도 화이팅!
                </Button>
                <Button className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl">
                  내일 알려줘 공부합시다
                </Button>
              </div>
            </div>

            {/* 텍스트 입력 영역 */}
            <div className="mt-auto space-y-3">
              <Input
                placeholder="텍스트 입력 ..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-2 border-purple-200 rounded-xl px-4 py-6"
              />
              <div className="flex gap-2">
                <Button className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl">
                  <Send className="w-4 h-4 mr-2" />
                  전송
                </Button>
                <Button className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl">
                  AI
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-purple-400 bg-white/50 backdrop-blur-sm border-t border-purple-200">
        Made by Made by Made by Made by Made by Made by Made by Made by
      </footer>
    </div>
  );
}