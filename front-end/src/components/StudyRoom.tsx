// src/components/StudyRoom.tsx
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar } from "./ui/avatar";
import { ArrowLeft, Send, Video, AlertTriangle, CheckCircle2, Bot } from "lucide-react";
import { Link } from "react-router-dom"; // ✅ Link 사용
import WebcamView from "../WebcamView";
import ChatPanel from "./ChatPanel";
import { getPokemon } from "@/lib/api";
import { useRoom } from './RoomContext'

interface StudyRoomProps {
  roomId: number;
  onBack: () => void;
  username: string;
}

interface PostureData {
  drowsinessLevel: number;
  neckPostureLevel: number;
  status: "good" | "warning" | "danger";
}

export default function StudyRoom({ roomId, onBack, username }: StudyRoomProps) {
  const { roomData } = useRoom();
  console.log(roomData);
  
  const [pokemon, setPokemon] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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

  // ✅ 포켓몬 데이터 가져오기(샘플)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getPokemon(1);
        if (!cancelled) setPokemon(data);
      } catch (e: any) {
        if (!cancelled) setErr(e.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 relative">
      {/* ✅ 우상단 AI 채팅방 이동 버튼 (클릭 보장용 asChild + Link) */}
      <div className="absolute top-6 right-8 z-50 pointer-events-auto">
        <Button asChild className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm">
          {/* <Link to="/ai-chat" aria-label="AI 채팅방으로 이동">
            <Bot className="w-4 h-4" />
            AI 채팅방
          </Link> */}
        </Button>
      </div>

      {/* ✅ 데이터 상태 표시 */}
      <div className="max-w-7xl mx-auto p-6">
        {loading && <div className="mb-4 text-sm text-muted-foreground">불러오는 중…</div>}
        {err && <div className="mb-4 text-sm text-red-500">에러: {err}</div>}
        {pokemon && (
          <div className="mb-4 text-sm">
            포켓몬: <b>{pokemon.name}</b> (id: {pokemon.id})
          </div>
        )}

        {/* ✅ 상단 제목 영역 */}
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            공부방 목록으로
          </Button>
          <h1 className="text-3xl font-semibold">피카츄 공부방</h1>
        </div>

        {/* ✅ 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 카메라 + 자세 모니터링 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 📷 카메라 영역 */}
            <Card className="p-6">
              <div className="rounded-xl overflow-hidden mb-4">
                <WebcamView showMicPanel={false} />
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="outline">카메라 끄기</Button>
                <Button variant="outline">마이크 끄기</Button>
              </div>
            </Card>

            {/* 🧍 자세 모니터링 */}
            <Card className="p-6">
              <h2 className="text-xl mb-4 flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${getStatusColor(postureData.status)}`} />
                자세 모니터링
              </h2>

              <div className="space-y-6">
                {/* 졸음 정도 */}
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

                {/* 거북목 정도 */}
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

                {/* 하단 통계 */}
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

          {/* 오른쪽: 사람끼리 대화하는 채팅 */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              <ChatPanel roomId={String(roomId)} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
