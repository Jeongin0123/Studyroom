import { Crown, Zap } from "lucide-react";

interface Participant {
  id: number;
  nickname: string;
  status: string;
  pokemonEmoji: string;
  isHost?: boolean;
  focusTime: string;
}

export function ParticipantsPanel() {
  const participants: Participant[] = [
    {
      id: 1,
      nickname: "피카츄123",
      status: "집중 중",
      pokemonEmoji: "⚡",
      isHost: true,
      focusTime: "2시간 30분"
    },
    {
      id: 2,
      nickname: "파이리456",
      status: "집중 중",
      pokemonEmoji: "🔥",
      focusTime: "1시간 45분"
    },
    {
      id: 3,
      nickname: "꼬부기789",
      status: "집중 중",
      pokemonEmoji: "💧",
      focusTime: "3시간 15분"
    }
  ];

  return (
    <div className="space-y-3">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="bg-gradient-to-r from-pink-50/90 to-purple-50/90 backdrop-blur-sm rounded-2xl shadow-md border border-pink-200/50 p-4 hover:shadow-lg transition-shadow"
        >
          <div className="text-purple-600">
            닉네임/{participant.nickname}
          </div>
        </div>
      ))}
      
      <div className="mt-6 text-right">
        <span className="text-purple-600">내 닉네임</span>
      </div>
    </div>
  );
}