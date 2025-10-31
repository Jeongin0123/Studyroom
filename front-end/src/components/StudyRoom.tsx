import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar } from "./ui/avatar";
import { ArrowLeft, Send, AlertTriangle, CheckCircle2 } from "lucide-react"; // Video 제거
import WebcamView from "../WebcamView";

interface StudyRoomProps {
  roomId: number;
  onBack: () => void;
  username: string;
}

interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

interface PostureData {
  drowsinessLevel: number;
  neckPostureLevel: number;
  status: "good" | "warning" | "danger";
}

export default function StudyRoom({ roomId, onBack, username }: StudyRoomProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, username: "피카츄", message: "안녕하세요! 화이팅!", timestamp: "14:30" },
    { id: 2, username: "이브이", message: "열심히 공부해봅시다", timestamp: "14:32" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const [postureData] = useState<PostureData>({
    drowsinessLevel: 25,
    neckPostureLevel: 40,
    status: "warning",
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: messages.length + 1,
        username,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "danger":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            공부방 목록으로
          </Button>
          <h1 className="text-3xl">피카츄 공부방</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              {/* ✅ 여기만 교체: 아이콘 박스 → 실제 카메라 미리보기 */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <WebcamView />
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline">카메라 끄기</Button>
                <Button variant="outline">마이크 끄기</Button>
              </div>
            </Card>

            {/* Posture Monitoring */}
            <Card className="p-6">
              <h2 className="text-xl mb-4 flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${getStatusColor(postureData.status)}`} />
                자세 모니터링
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>졸음 정도</span>
                    <Badge variant={postureData.drowsinessLevel > 50 ? "destructive" : "secondary"}>
                      {postureData.drowsinessLevel}%
                    </Badge>
                  </div>
                  <Progress value={postureData.drowsinessLevel} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {postureData.drowsinessLevel < 30
                      ? "✅ 집중력이 좋습니다!"
                      : postureData.drowsinessLevel < 60
                      ? "⚠️ 조금 졸린 것 같아요"
                      : "🚨 잠깐 휴식이 필요합니다!"}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>거북목 정도</span>
                    <Badge variant={postureData.neckPostureLevel > 50 ? "destructive" : "secondary"}>
                      {postureData.neckPostureLevel}%
                    </Badge>
                  </div>
                  <Progress value={postureData.neckPostureLevel} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {postureData.neckPostureLevel < 30
                      ? "✅ 자세가 바릅니다!"
                      : postureData.neckPostureLevel < 60
                      ? "⚠️ 자세를 바로잡아주세요"
                      : "🚨 목이 많이 굽어있어요!"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-sm text-muted-foreground">연속 집중</div>
                    <div className="font-semibold">45분</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-sm text-muted-foreground">오늘 획득 포인트</div>
                    <div className="font-semibold">150P</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Chat */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              <div className="p-4 border-b">
                <h3 className="flex items-center gap-2">💬 채팅</h3>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.username === username ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="w-8 h-8 bg-yellow-400 flex items-center justify-center">
                        {msg.username[0]}
                      </Avatar>
                      <div className={`flex-1 ${msg.username === username ? "text-right" : ""}`}>
                        <div className="flex gap-2 items-center mb-1">
                          {msg.username !== username && <span className="text-sm">{msg.username}</span>}
                          <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <div
                          className={`inline-block px-4 py-2 rounded-lg ${
                            msg.username === username ? "bg-yellow-400 text-black" : "bg-muted"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 bg-input-background"
                  />
                  <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
