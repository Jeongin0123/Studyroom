import { useState } from 'react';
import { LogOut, Users, Send, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Resizable } from 're-resizable';

interface StudyRoomProps {
  onLeave: () => void;
}

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: string;
}

const mockUsers = [
  { id: 1, name: '피카츄마스터', isMe: true },
  { id: 2, name: '파이리팬' },
  { id: 3, name: '꼬부기사랑' },
  { id: 4, name: '이상해씨조아' },
];

const mockPokemonBattle = [
  { 
    id: 1, 
    user: '피카츄마스터', 
    pokemon: '피카츄', 
    hp: 85, 
    maxHp: 100,
    imageUrl: 'https://images.unsplash.com/photo-1638964758061-117853a20865?w=400'
  },
  { 
    id: 2, 
    user: '파이리팬', 
    pokemon: '파이리', 
    hp: 60, 
    maxHp: 100,
    imageUrl: 'https://images.unsplash.com/photo-1643725173053-ed68676f1878?w=400'
  },
];

export default function StudyRoom({ onLeave }: StudyRoomProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, user: '피카츄마스터', message: '안녕하세요! 열심히 공부해봐요!', timestamp: '14:30' },
    { id: 2, user: '파이리팬', message: '화이팅입니다!', timestamp: '14:31' },
    { id: 3, user: '꼬부기사랑', message: '같이 열심히 해요~', timestamp: '14:32' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(320);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: ChatMessage = {
        id: chatMessages.length + 1,
        user: '피카츄마스터',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b-4 border-yellow-300 shadow-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl text-gray-800">토익 900점 도전방</h2>
            <Badge className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0">
              <Users className="w-3 h-3 mr-1" />
              {mockUsers.length} / 6
            </Badge>
            <Badge className="bg-red-400 text-white border-0">배틀 모드</Badge>
          </div>
          <Button
            onClick={onLeave}
            variant="outline"
            className="rounded-full border-2 border-red-300 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            나가기
          </Button>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - User Videos */}
        <Resizable
          size={{ width: leftWidth, height: '100%' }}
          onResizeStop={(e, direction, ref, d) => {
            setLeftWidth(leftWidth + d.width);
          }}
          minWidth={200}
          maxWidth={500}
          enable={{ right: true }}
          handleStyles={{
            right: {
              width: '4px',
              right: '0',
              background: 'linear-gradient(to right, #d8b4fe, #f0abfc)',
              cursor: 'col-resize',
            }
          }}
          className="border-r-4 border-purple-300"
        >
          <div className="h-full bg-white/60 backdrop-blur-sm p-4 overflow-y-auto">
            <h3 className="text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              참여자
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl aspect-video border-4 border-purple-200 overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        {user.name.substring(0, 2)}
                      </div>
                      <p className="text-sm">{user.name}</p>
                    </div>
                  </div>
                  {user.isMe && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      나
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Resizable>

        {/* Center Panel - Pokemon Battle Area */}
        <div className="flex-1 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl text-gray-800 mb-6 text-center">포켓몬 배틀 아레나</h3>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-4 border-yellow-300 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {mockPokemonBattle.map((battle) => (
                  <div
                    key={battle.id}
                    className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border-4 border-purple-300 shadow-xl"
                  >
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-1">{battle.user}</p>
                      <h4 className="text-xl text-gray-800">{battle.pokemon}</h4>
                    </div>
                    
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={battle.imageUrl}
                        alt={battle.pokemon}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* HP Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">HP</span>
                        <span className="text-gray-700">{battle.hp} / {battle.maxHp}</span>
                      </div>
                      <Progress 
                        value={(battle.hp / battle.maxHp) * 100} 
                        className="h-4 bg-gray-200"
                      />
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-red-100 rounded-lg p-2">
                        <p className="text-xs text-red-700">공격력</p>
                        <p className="text-sm text-red-900">75</p>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-2">
                        <p className="text-xs text-blue-700">방어력</p>
                        <p className="text-sm text-blue-900">60</p>
                      </div>
                      <div className="bg-yellow-100 rounded-lg p-2">
                        <p className="text-xs text-yellow-700">스피드</p>
                        <p className="text-sm text-yellow-900">90</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Battle Timer */}
              <div className="mt-8 text-center">
                <div className="inline-block bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-3 rounded-full shadow-lg">
                  <p className="text-sm mb-1">공부 시간</p>
                  <p className="text-2xl">01:23:45</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <Resizable
          size={{ width: rightWidth, height: '100%' }}
          onResizeStop={(e, direction, ref, d) => {
            setRightWidth(rightWidth + d.width);
          }}
          minWidth={250}
          maxWidth={500}
          enable={{ left: true }}
          handleStyles={{
            left: {
              width: '4px',
              left: '0',
              background: 'linear-gradient(to right, #d8b4fe, #f0abfc)',
              cursor: 'col-resize',
            }
          }}
          className="border-l-4 border-pink-300"
        >
          <div className="h-full bg-white/60 backdrop-blur-sm flex flex-col">
            <div className="p-4 border-b-2 border-pink-200">
              <h3 className="text-lg text-gray-800">채팅</h3>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-700">{msg.user}</span>
                    <span className="text-xs text-gray-400">{msg.timestamp}</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 border-2 border-purple-200 shadow">
                    <p className="text-sm text-gray-800">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t-2 border-pink-200">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="메시지를 입력하세요..."
                  className="rounded-2xl border-2 border-purple-200 focus:border-purple-400"
                />
                <Button
                  onClick={handleSendMessage}
                  className="rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Resizable>
      </main>
    </div>
  );
}
