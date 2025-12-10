import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { usePage } from "./PageContext";
import { useRoom } from './RoomContext';
import { useUser } from './UserContext';

// 🔹 스터디룸 실시간 채팅용 타입
type RoomChatMessage = {
  id: string;
  nickname: string;
  text: string;
  sender: string;
  timestamp: Date;
};

// interface ChatMessage {
//   id: number;
//   nickname: string;
//   message: string;
//   isMe: boolean;
// }

interface RightPanelProps {
  onOpenAiChat?: () => void;
}

export function RightPanel({ onOpenAiChat}: RightPanelProps) {
  const { user } = useUser();
  const { roomData, setRoomData } = useRoom();
  
  // const [message, setMessage] = useState("");
  // const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // 🔹 스터디룸 실시간 채팅용 상태
  const [roomChatMessages, setRoomChatMessages] = useState<RoomChatMessage[]>([]);
  const [roomChatInput, setRoomChatInput] = useState("");
  const roomChatSocketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔹 방 입장 시 WebSocket 연결
  useEffect(() => {
      if (!roomData?.room_id) return;
  
      const wsUrl = `ws://${window.location.hostname}:8000/ws/chat/${roomData.room_id}`;
      console.log("[room-chat] 웹소켓 연결 시도:", wsUrl);
  
      const socket = new WebSocket(wsUrl);
      roomChatSocketRef.current = socket;
  
      socket.onopen = () => {
        console.log("[room-chat] 웹소켓 연결됨");
      };
  
      socket.onclose = (event) => {
        console.log("[room-chat] 웹소켓 종료", event);
        roomChatSocketRef.current = null;
      };
  
      socket.onerror = (event) => {
        console.error("[room-chat] 웹소켓 에러", event);
      };
  
      // socket.onmessage = (event) => {
      //   try {
      //     const data = JSON.parse(event.data);
      //     const msg: RoomChatMessage = {
      //       id: `${Date.now()}-${Math.random()}`,
      //       text: data.text ?? String(event.data),
      //       nickname: user?.nickname,
      //       sender: data.sender ?? "알 수 없음",
      //       timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      //     };
      //     setRoomChatMessages((prev) => [...prev, msg]);
      //   } catch {
      //     const msg: RoomChatMessage = {
      //       id: `${Date.now()}-${Math.random()}`,
      //       text: String(event.data),
      //       nickname: user?.nickname,
      //       sender: "시스템",
      //       timestamp: new Date(),
      //     };
      //     setRoomChatMessages((prev) => [...prev, msg]);
      //   }
      // };

        socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          const msg: RoomChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            text: data.text ?? "",
            nickname: data.nickname ?? "익명",     // ✔ 서버에서 온 닉네임 그대로 사용
            sender: data.nickname ?? "알 수 없음", // ✔ 동일
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          };

          setRoomChatMessages((prev) => [...prev, msg]);
          
        } catch {
          const msg: RoomChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            text: String(event.data),
            nickname: "시스템",
            sender: "시스템",
            timestamp: new Date(),
          };
          setRoomChatMessages((prev) => [...prev, msg]);
        }
      };
  
      // 방이 바뀌거나 컴포넌트 언마운트 시 정리
      return () => {
        console.log("[room-chat] cleanup: 소켓 종료");
        try {
          socket.close();
        } catch (e) {
          console.error("[room-chat] 소켓 종료 중 오류", e);
        }
        roomChatSocketRef.current = null;
        setRoomChatMessages([]);
      };
    }, [roomData?.room_id]);

  // 스크롤 추가
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [roomChatMessages]);

  // 🔹 스터디룸 채팅 전송 함수
  const handleSendRoomChat = () => {
    const text = roomChatInput.trim();
    if (!text) return;

    const socket = roomChatSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("[room-chat] 소켓이 열려있지 않습니다.");
      return;
    }

    const payload = {
      type: "chat",
      text,
      userId: user?.userId ?? null,
      nickname: user?.nickname ?? "익명",
      roomId: roomData?.room_id ?? null,
      timestamp: new Date().toISOString(),
    };

    socket.send(JSON.stringify(payload));
    setRoomChatInput("");
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-blue-50 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-5 flex flex-col min-h-0">
      {/* 채팅 메시지 영역 (고정, 스크롤) */}
      <div className="flex-1 min-h-0 overflow-hidden mb-3 pb-4">
        <div className="text-sm text-blue-700 mb-2">채팅</div>
        <ScrollArea className="h-full bg-white/50 backdrop-blur-sm rounded-2xl p-3 border border-blue-100" type="always">
          <div className="space-y-3 pr-1 min-h-0">
            {roomChatMessages.map((msg) => {
              const isMe = msg.sender === user?.nickname;

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] ${
                      isMe
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl rounded-br-sm"
                        : "bg-white/90 text-blue-900 rounded-2xl rounded-bl-sm"
                    } px-3 py-2 shadow-md`}
                  >
                    {!isMe && (
                      <div className="text-xs text-purple-600 mb-1">{msg.nickname}</div>
                    )}
                    <div className="text-sm">{msg.text}</div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* 채팅 입력 영역 */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Input
            value={roomChatInput}
            onChange={(e) => setRoomChatInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendRoomChat()}
            placeholder="텍스트 입력 ..."
            className="flex-1 bg-white/80 backdrop-blur-sm border-blue-200 rounded-full focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-md px-4 py-2.5"
          />

          <Button
            type="button"
            onClick={handleSendRoomChat}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-md transition-all hover:shadow-lg p-0 flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </Button>

          <div className="relative group">
            <Button
              type="button"
              onClick={onOpenAiChat}
              className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-full shadow-md transition-all hover:shadow-lg p-0 flex items-center justify-center"
            >
              AI
            </Button>
            <div className="absolute right-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-lime-400 text-white text-sm font-semibold rounded-2xl px-3 py-2 shadow-lg text-left whitespace-nowrap">
                스터디몬 자체 AI에게 무엇이든 물어보세요!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
