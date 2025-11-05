// import { useEffect, useState } from "react";
// import { Card } from "./ui/card";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import { Progress } from "./ui/progress";
// import { ArrowLeft, AlertTriangle, Bot } from "lucide-react";
// import { useNavigate, Link } from "react-router-dom";
// import WebcamView from "../WebcamView";
// import ChatPanel from "./ChatPanel"; // 사람끼리 채팅용 컴포넌트
// import { getPokemon } from "@/lib/api";   


// interface StudyRoomProps {
//   roomId: number;
//   onBack: () => void;
//   username: string;
// }

// interface PostureData {
//   drowsinessLevel: number;
//   neckPostureLevel: number;
//   status: "good" | "warning" | "danger";
// }

// export default function StudyRoom({ roomId, onBack, username }: StudyRoomProps) {
//   const navigate = useNavigate();
//   const [pokemon, setPokemon] = useState<any | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState<string | null>(null);


//   const [postureData] = useState<PostureData>({
//     drowsinessLevel: 25,
//     neckPostureLevel: 40,
//     status: "warning",
//   });

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "good":
//         return "text-green-500";
//       case "warning":
//         return "text-yellow-500";
//       case "danger":
//         return "text-red-500";
//       default:
//         return "text-gray-500";
//     }
//   };

//   // ✅ 페이지 진입 시 서버에서 데이터 가져오기
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         setLoading(true);
//         const data = await getPokemon(1);     // 예: /api/pokemon/1
//         if (!cancelled) setPokemon(data);
//         // 필요하면 다른 API도 여기서 이어서 호출
//         // const chatRes = await sendChat(String(roomId), "hello");
//       } catch (e: any) {
//         if (!cancelled) setErr(e.message ?? String(e));
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => { cancelled = true };
//   }, [roomId]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 relative">
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 relative">
//       {/* 상단 오른쪽 — 이동만 담당 */}
//       <div className="absolute top-6 right-8 z-50">
//         {/* 방법 A: Link 유지 (Router 필요) */}
//         {/* <Link to="/ai-chat"> */}
//         {/*   <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500">AI 채팅방</Button>
//         </Link> */}

//         {/* 방법 B: navigate 사용 (Router 필요) */}
//         <Button
//           onClick={() => navigate("/ai-chat")}
//           className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500"
//         >
//           AI 채팅방
//         </Button>

//         {/* 방법 C: Router없이 강제 이동 (권장X, 전체 리로드 발생) */}
//         {/* <Button onClick={() => (window.location.href = "/ai-chat")}>AI 채팅방</Button> */}
//       </div>

//       {/* 데이터 상태 표시 예시 */}
//       <div className="max-w-7xl mx-auto p-6">
//         {loading && <div className="mb-4 text-sm text-muted-foreground">불러오는 중…</div>}
//         {err && <div className="mb-4 text-sm text-red-500">에러: {err}</div>}
//         {pokemon && (
//           <div className="mb-4 text-sm">
//             포켓몬: <b>{pokemon.name}</b> (id: {pokemon.id})
//           </div>
//         )}
//       </div>
      
//       {/* 상단 오른쪽에 AI 채팅방 버튼 추가 */}
//       <div className="absolute top-6 right-8 z-50">
//         <Link to="/ai-chat">
//           <Button variant="default" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500">
//             <Bot className="w-4 h-4" />
//             AI 채팅방
//           </Button>
//         </Link>
//       </div>

//       <div className="max-w-7xl mx-auto p-6">
//         {/* 상단 제목 영역 */}
//         <div className="mb-6">
//           <Button onClick={onBack} variant="outline" className="mb-4">
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             공부방 목록으로
//           </Button>
//           <h1 className="text-3xl font-semibold">피카츄 공부방</h1>
//         </div>

//         {/* 메인 그리드 */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* 왼쪽: 카메라 + 자세 모니터링 */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* 📷 카메라 영역 */}
//             <Card className="p-6">
//               <div className="rounded-xl overflow-hidden mb-4">
//                 <WebcamView showMicPanel={false} />
//               </div>
//               <div className="flex justify-center gap-4">
//                 <Button variant="outline">카메라 끄기</Button>
//                 <Button variant="outline">마이크 끄기</Button>
//               </div>
//             </Card>

//             {/* 🧍 자세 모니터링 */}
//             <Card className="p-6">
//               <h2 className="text-xl mb-4 flex items-center gap-2">
//                 <AlertTriangle className={`w-5 h-5 ${getStatusColor(postureData.status)}`} />
//                 자세 모니터링
//               </h2>

//               <div className="space-y-6">
//                 {/* 졸음 정도 */}
//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <span>졸음 정도</span>
//                     <Badge variant={postureData.drowsinessLevel > 50 ? "destructive" : "secondary"}>
//                       {postureData.drowsinessLevel}%
//                     </Badge>
//                   </div>
//                   <Progress value={postureData.drowsinessLevel} className="h-3" />
//                   <p className="text-sm text-muted-foreground mt-2">
//                     {postureData.drowsinessLevel < 30
//                       ? "✅ 집중력이 좋습니다!"
//                       : postureData.drowsinessLevel < 60
//                       ? "⚠️ 조금 졸린 것 같아요"
//                       : "🚨 잠깐 휴식이 필요합니다!"}
//                   </p>
//                 </div>

//                 {/* 거북목 정도 */}
//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <span>거북목 정도</span>
//                     <Badge variant={postureData.neckPostureLevel > 50 ? "destructive" : "secondary"}>
//                       {postureData.neckPostureLevel}%
//                     </Badge>
//                   </div>
//                   <Progress value={postureData.neckPostureLevel} className="h-3" />
//                   <p className="text-sm text-muted-foreground mt-2">
//                     {postureData.neckPostureLevel < 30
//                       ? "✅ 자세가 바릅니다!"
//                       : postureData.neckPostureLevel < 60
//                       ? "⚠️ 자세를 바로잡아주세요"
//                       : "🚨 목이 많이 굽어있어요!"}
//                   </p>
//                 </div>

//                 {/* 하단 통계 */}
//                 <div className="grid grid-cols-2 gap-4 pt-4 border-t">
//                   <div className="text-center">
//                     <div className="text-2xl mb-1">🔥</div>
//                     <div className="text-sm text-muted-foreground">연속 집중</div>
//                     <div className="font-semibold">45분</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl mb-1">⭐</div>
//                     <div className="text-sm text-muted-foreground">오늘 획득 포인트</div>
//                     <div className="font-semibold">150P</div>
//                   </div>
//                 </div>
//               </div>
//             </Card>
//           </div>

//           {/* 오른쪽: 사람끼리 대화하는 채팅 */}
//           <div className="lg:col-span-1">
//             <Card className="h-[calc(100vh-12rem)] flex flex-col">
//               <ChatPanel roomId={String(roomId)} />
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ArrowLeft, AlertTriangle, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WebcamView from "../WebcamView";
import ChatPanel from "./ChatPanel";
import { getPokemon } from "@/lib/api";

interface StudyRoomProps {
  roomId: number;
  onBack: () => void;
  username: string; // 현재 미사용. 필요 없으면 props/호출부에서 제거해도 됨.
}

interface PostureData {
  drowsinessLevel: number;
  neckPostureLevel: number;
  status: "good" | "warning" | "danger";
}

export default function StudyRoom({ roomId, onBack /*, username */ }: StudyRoomProps) {
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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

  // ✅ 페이지 진입 시 서버에서 데이터 가져오기
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getPokemon(1); // /api/pokemon/1 (vite proxy)
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
      {/* 상단 오른쪽 — 이동만 담당 (Router 컨텍스트 없어도 window.location으로 대체 가능) */}
      <div className="absolute top-6 right-8 z-50">
        <Button
          onClick={() => navigate("/ai-chat")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500"
        >
          <Bot className="w-4 h-4" />
          AI 채팅방
        </Button>
      </div>

      {/* 데이터 상태 표시 */}
      <div className="max-w-7xl mx-auto p-6">
        {loading && <div className="mb-4 text-sm text-muted-foreground">불러오는 중…</div>}
        {err && <div className="mb-4 text-sm text-red-500">에러: {err}</div>}
        {pokemon && (
          <div className="mb-4 text-sm">
            포켓몬: <b>{pokemon.name}</b> (id: {pokemon.id})
          </div>
        )}

        {/* 상단 제목 영역 */}
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            공부방 목록으로
          </Button>
          <h1 className="text-3xl font-semibold">피카츄 공부방</h1>
        </div>

        {/* 메인 그리드 */}
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
