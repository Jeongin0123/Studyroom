import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Users, Video, Plus } from "lucide-react";

interface StudyRoom {
  id: number;
  name: string;
  participants: number;
  maxParticipants: number;
  status: "active" | "full";
  image: string;
}

interface StudyRoomListProps {
  onSelectRoom: (roomId: number) => void;
  onNavigate: (page: string) => void;
}

const mockRooms: StudyRoom[] = [
  {
    id: 1,
    name: "피카츄 공부방",
    participants: 3,
    maxParticipants: 4,
    status: "active",
    image: "https://images.unsplash.com/photo-1751200065697-4461cc2b43cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGRlc2slMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYwODcwMTM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 2,
    name: "이브이 집중방",
    participants: 2,
    maxParticipants: 6,
    status: "active",
    image: "https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzZXR1cHxlbnwxfHx8fDE3NjA4NTE4NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 3,
    name: "잠만보 금지방",
    participants: 4,
    maxParticipants: 4,
    status: "full",
    image: "https://images.unsplash.com/photo-1751200065697-4461cc2b43cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGRlc2slMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYwODcwMTM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export default function StudyRoomList({ onSelectRoom, onNavigate }: StudyRoomListProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl mb-2">공부방 리스트</h1>
            <p className="text-muted-foreground">함께 공부할 공부방을 선택하세요</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => onNavigate("mypage")} variant="outline">
              마이페이지
            </Button>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              공부방 만들기
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl">{room.name}</h3>
                  {room.status === "full" ? (
                    <Badge variant="destructive">만실</Badge>
                  ) : (
                    <Badge className="bg-green-500">활성</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{room.participants}/{room.maxParticipants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>실시간</span>
                  </div>
                </div>

                <Button
                  onClick={() => onSelectRoom(room.id)}
                  disabled={room.status === "full"}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black disabled:bg-gray-300"
                >
                  입장하기
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
