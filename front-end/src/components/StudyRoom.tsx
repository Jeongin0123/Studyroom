import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import WebcamView from "../WebcamView";
import ChatPanel from "./ChatPanel"; // ✅ 추가: 우리 ChatPanel 사용

interface StudyRoomProps {
  roomId: number;
  onBack: () => void;
  username: string;
}

// 기존 Message / ScrollArea / Avatar / Send 관련 타입/상태는 제거
interface PostureData {
  drowsinessLevel: number;
  neckPostureLevel: number;
  status: "good" | "warning" | "danger";
}

export default function StudyRoom({ roomId, onBack, username }: StudyRoomProps) {
  const [postureData] = useState<PostureData>({
    drowsinessLevel: 25,
    neckPostureLevel: 40,
    status: "warning",
  });

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
              <div className="rounded-xl overflow-hidden mb-4">
                <WebcamView showMicPanel={false} />
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

          {/* Chat → ChatPanel로 교체 */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              {/* ChatPanel 내부에 제목과 입력창/AI 버튼이 모두 포함되어 있음 */}
              <ChatPanel roomId={String(roomId)} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
